// Este endpoint corre en el servidor (Vercel), nunca en el navegador del usuario.
// Reenvía el pedido a football-data.org agregando la clave secreta desde
// las variables de entorno, así ningún visitante puede verla.

const BASE_URL = "https://api.football-data.org/v4";

// Lista blanca de competiciones que dejamos consultar, para no exponer
// el proxy como un pasamanos abierto a cualquier endpoint.
const ALLOWED_PREFIXES = ["competitions", "teams"];

// Caché en memoria: mientras el servidor de Vercel siga "tibio" (instancia
// reutilizada entre pedidos cercanos), reusamos la misma respuesta en vez
// de volver a golpear football-data.org. Esto reduce mucho el consumo de
// cuota cuando varias personas usan la app al mismo tiempo.
const cache = new Map();

// Tiempo que se reutiliza cada respuesta antes de pedirla de nuevo (en segundos).
// Los partidos en vivo cambian rápido; la tabla y los goleadores casi no.
function ttlFor(segments) {
  if (segments.includes("matches")) return 45;
  return 300; // standings, scorers, teams
}

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

  const cached = cache.get(targetUrl);
  if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
    res.setHeader("Cache-Control", `s-maxage=${ttlSeconds}, stale-while-revalidate=120`);
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cached.data);
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: { "X-Auth-Token": apiKey },
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      // Si nos quedamos sin cuota pero todavía tenemos algo en caché (aunque
      // esté vencido), mejor mostrar eso que un error en pantalla.
      if (upstream.status === 429 && cached) {
        res.setHeader("X-Cache", "STALE");
        return res.status(200).json(cached.data);
      }
      return res.status(upstream.status).json({
        error: data?.message || "Error consultando football-data.org",
      });
    }

    cache.set(targetUrl, { data, timestamp: Date.now() });

    // Cache también en el borde de Vercel para pedidos de otros visitantes.
    res.setHeader("Cache-Control", `s-maxage=${ttlSeconds}, stale-while-revalidate=120`);
    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(data);
  } catch (err) {
    if (cached) {
      res.setHeader("X-Cache", "STALE");
      return res.status(200).json(cached.data);
    }
    return res.status(502).json({ error: "No se pudo contactar a football-data.org" });
  }
}
