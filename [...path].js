// Este endpoint corre en el servidor (Vercel), nunca en el navegador del usuario.
// Reenvía el pedido a football-data.org agregando la clave secreta desde
// las variables de entorno, así ningún visitante puede verla.

const BASE_URL = "https://api.football-data.org/v4";

// Lista blanca de competiciones que dejamos consultar, para no exponer
// el proxy como un pasamanos abierto a cualquier endpoint.
const ALLOWED_PREFIXES = ["competitions", "teams"];

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

  try {
    const upstream = await fetch(targetUrl, {
      headers: { "X-Auth-Token": apiKey },
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.message || "Error consultando football-data.org",
      });
    }

    // Cache liviano en el borde de Vercel para no gastar la cuota de la API
    // (10 pedidos/minuto en el plan gratis) cuando entran muchos visitantes.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: "No se pudo contactar a football-data.org" });
  }
}
