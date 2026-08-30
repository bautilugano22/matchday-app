// Este endpoint corre en el servidor (Vercel), nunca en el navegador del usuario.
// Reenvía el pedido a football-data.org agregando la clave secreta desde
// las variables de entorno, así ningún visitante puede verla.

import { Redis } from "@upstash/redis";

const BASE_URL = "https://api.football-data.org/v4";

// Lista blanca de competiciones que dejamos consultar, para no exponer
// el proxy como un pasamanos abierto a cualquier endpoint.
const ALLOWED_PREFIXES = ["competitions", "teams", "matches"];

// Caché persistente en Upstash Redis: a diferencia de guardar los datos en
// una variable de memoria (que se pierde cada vez que Vercel "apaga" la
// instancia del servidor), esto sobrevive entre visitas de distintas
// personas, reduciendo mucho el consumo de cuota de la API gratuita.
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null;

// Tiempo que se reutiliza cada respuesta antes de pedirla de nuevo (en segundos).
// Los partidos en vivo cambian rápido; la tabla y los goleadores casi no.
function ttlFor(segments) {
  if (segments.includes("matches")) return 45;
  return 300; // standings, scorers, teams
}

const DURABLE_TTL = 86400; // respaldo de 24hs por si la API se queda sin cuota

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { path = [] } = req.query;
  const segments = Array.isArray(path) ? path : [path];

  if (segments.length === 0 || !ALLOWED_PREFIXES.includes(segments[0])) {
    return res.status(400).json({ error: "Ruta no permitida" });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Falta configurar FOOTBALL_API_KEY en las variables de entorno del servidor.",
    });
  }

  // Reconstruye la query string original (ej: ?limit=10) sin el parámetro "path".
  const search = new URLSearchParams(req.query);
  search.delete("path");
  const qs = search.toString();

  const targetUrl = `${BASE_URL}/${segments.join("/")}${qs ? `?${qs}` : ""}`;
  const ttlSeconds = ttlFor(segments);
  const durableKey = `durable:${targetUrl}`;

  if (redis) {
    try {
      const cached = await redis.get(targetUrl);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cached);
      }
    } catch {
      // si Redis falla, seguimos de largo y pedimos directo a la API
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: { "X-Auth-Token": apiKey },
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Si nos quedamos sin cuota, mostramos el último dato bueno guardado
      // (aunque tenga hasta 24hs) en vez de un error en pantalla.
      if (upstream.status === 429 && redis) {
        const stale = await redis.get(durableKey).catch(() => null);
        if (stale) {
          res.setHeader("X-Cache", "STALE");
          return res.status(200).json(stale);
        }
      }
      return res.status(upstream.status).json({
        error: data?.message || "Error consultando football-data.org",
      });
    }

    if (redis) {
      await Promise.all([
        redis.set(targetUrl, data, { ex: ttlSeconds }).catch(() => {}),
        redis.set(durableKey, data, { ex: DURABLE_TTL }).catch(() => {}),
      ]);
    }

    res.setHeader("Cache-Control", `s-maxage=${ttlSeconds}, stale-while-revalidate=120`);
    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(data);
  } catch (err) {
    if (redis) {
      const stale = await redis.get(durableKey).catch(() => null);
      if (stale) {
        res.setHeader("X-Cache", "STALE");
        return res.status(200).json(stale);
      }
    }
    return res.status(502).json({ error: "No se pudo contactar a football-data.org" });
  }
}
