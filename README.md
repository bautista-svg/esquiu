# Colegio Esquiú — Sitio web

Rediseño completo del sitio institucional del [Colegio Esquiú](https://www.colegioesquiu.edu.ar)
(Belgrano, CABA). Sitio estático construido con **Astro 7 + Tailwind CSS 4**.

## Estructura del repositorio

| Carpeta / archivo     | Qué es                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| **`web/`**            | **El sitio.** Proyecto Astro completo — ver [`web/README.md`](web/README.md) |
| `imagenes/`           | Archivo maestro de fotos scrapeadas del sitio original + metadata (CSV/JSON) |
| `textos/`             | Contenido textual del sitio original, un `.txt` por página             |
| `resumen_colegio.md`  | Ficha institucional consolidada (historia, niveles, equipo, contacto)  |
| `scrape.py`           | Script que extrajo el contenido del sitio Wix original                 |

## Deploy

El proyecto deployable vive en **`web/`**. En Vercel / Netlify / Cloudflare Pages:

- **Root directory:** `web`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node:** ≥ 22.12

No requiere variables de entorno. El formulario de admisiones funciona vía `mailto:` hasta
que se configure `FORM_ENDPOINT` en `web/src/pages/admisiones.astro` (ver README del sitio).

## Desarrollo local

```sh
cd web
npm install
npm run dev        # localhost:4321
```
