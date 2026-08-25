# Matchday — guía de deploy paso a paso

No necesitás usar la terminal ni saber programar para publicar esto. Seguí estos pasos en orden.

## 1. Conseguí tu clave gratis de football-data.org

1. Andá a https://www.football-data.org/client/register
2. Registrate con tu email (es gratis).
3. Te va a llegar un email con tu **API Token**. Guardalo, lo vas a necesitar en el paso 3.

## 2. Subí el código a GitHub (sin usar git)

1. Creá una cuenta gratis en https://github.com si no tenés.
2. Hacé clic en "New repository" (botón verde). Ponele de nombre `matchday-app`, dejalo en "Public" o "Private", y creá el repositorio.
3. Dentro del repositorio vacío, hacé clic en "uploading an existing file".
4. Arrastrá **todos** los archivos y carpetas de este proyecto (respetando la estructura de carpetas: `pages/`, `pages/api/`, `pages/api/football/`, `styles/`) a esa pantalla.
5. Hacé clic en "Commit changes" al final de la página.

## 3. Publicalo con Vercel

1. Creá una cuenta gratis en https://vercel.com — te conviene entrar con "Continue with GitHub" para que quede todo conectado.
2. En el dashboard de Vercel, hacé clic en "Add New..." → "Project".
3. Elegí el repositorio `matchday-app` que acabás de subir y hacé clic en "Import".
4. Antes de darle a "Deploy", abrí la sección **"Environment Variables"**:
   - Name: `FOOTBALL_API_KEY`
   - Value: pegá la clave que te llegó por email en el paso 1
   - Hacé clic en "Add".
5. Ahora sí, hacé clic en **"Deploy"**. Esperá 1-2 minutos.
6. Cuando termine, Vercel te va a dar una URL pública (algo como `matchday-app.vercel.app`). Esa es tu app, ya la podés compartir con quien quieras.

## Si más adelante cambiás el código

Cada vez que subas cambios nuevos al mismo repositorio de GitHub (sobreescribiendo los archivos desde la misma pantalla de "upload"), Vercel va a volver a publicar la app sola, automáticamente. No hay que repetir el proceso de deploy.

## Límites a tener en cuenta

- El plan gratis de football-data.org permite **10 pedidos por minuto** y cubre 6 ligas top (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League). Si más adelante querés más ligas o más volumen de tráfico, hay planes pagos de la API.
- Este es el **MVP público** (Etapa 1): cualquiera puede entrar y ver todo gratis. La suscripción paga (Etapa 2, cuentas de usuario + Stripe) se agrega sobre esta misma base cuando quieras avanzar — avisame cuando la tengas publicada y seguimos con eso.
