# Colegio Esquiú — Sitio institucional

Rediseño completo de [colegioesquiu.edu.ar](https://www.colegioesquiu.edu.ar), construido como
sitio **100 % estático** con [Astro 7](https://astro.build) + Tailwind CSS 4. Cero frameworks de
cliente: la única interactividad (reveals por scroll, header, menú móvil y validación del
formulario) son ~4 KB de TypeScript vanilla.

## Comandos

| Comando           | Acción                                     |
| ----------------- | ------------------------------------------ |
| `npm install`     | Instala dependencias                       |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321` |
| `npm run build`   | Build de producción en `dist/`             |
| `npm run preview` | Sirve el build localmente                  |
| `npm run check`   | Type-check de componentes Astro            |
| `npm run lint`    | ESLint                                     |
| `npm run format`  | Prettier (con orden de clases Tailwind)    |

## Arquitectura

```
src/
  assets/img/        Fotografías optimizadas (Astro genera AVIF/WebP responsive)
  assets/staff/      Retratos del equipo, nombrados por persona
  components/        Header, Footer, PageHero, SectionHeader, CtaBand, Icon, SunMark
  data/              Contenido institucional tipado (site, staff, levels, areas, board, partners)
  layouts/           BaseLayout: SEO completo (canonical, OG, Twitter, JSON-LD schema School)
  pages/             11 rutas estáticas
  scripts/main.ts    Reveals + header + menú móvil
  styles/global.css  Design system completo (tokens del escudo, tipografía, motion)
```

## Design system

- **Paleta**: los colores exactos del escudo — rojo `#8b1d1a`, azul `#0e265e` (secciones
  oscuras en marino `#0b1633`), ámbar anaranjado `#e8940a` como acento cálido, sobre papel
  `#faf8f4` y tinta `#1c1a16`.
- **Tipografía**: Fraunces Variable (display serif, ejes opsz/SOFT) + Inter Variable (texto/UI),
  self-hosted vía Fontsource con fallbacks metric-adjusted (CLS ≈ 0).
- **Motion**: reveals con IntersectionObserver + stagger, entrada del hero en CSS puro,
  parallax multi-capa por JS (rAF + `translate3d` vía variable `--py` — compatible con todos
  los navegadores), view transitions cross-document. Todo respeta `prefers-reduced-motion`.
- **Carga**: CSS inline en el HTML (cero requests render-blocking), prefetch automático de
  links al entrar al viewport (`prefetchAll` + estrategia viewport), imágenes AVIF/WebP
  responsive y videos diferidos.

## Videos institucionales

Los videos de fondo del sitio Wix original fueron recuperados a `public/videos/`
(`hero.mp4`, `proyecto.mp4`, `exalumnos.mp4`). Se cargan de forma diferida
(`preload="none"` + IntersectionObserver): la foto poster es el LCP y el video se funde
encima cuando puede reproducirse. No se cargan si el usuario tiene `prefers-reduced-motion`
o el modo ahorro de datos activado, y se pausan al salir del viewport.

## Formulario de admisiones

`src/pages/admisiones.astro` define `FORM_ENDPOINT` (vacío por defecto):

- **Sin endpoint**: al enviar se abre el cliente de correo del usuario con el mensaje ya
  redactado hacia `institucionales@colegioesquiu.edu.ar`.
- **Con endpoint** (Formspree, Basin, API propia): completar la constante y el formulario se
  envía por `POST` y redirige a `/gracias`.

## SEO

- `sitemap-index.xml` autogenerado (`@astrojs/sitemap`), referenciado en `robots.txt`.
- Redirecciones desde todas las URLs del sitio Wix anterior (`astro.config.mjs`).
- JSON-LD `School` con dirección, teléfono y logo en todas las páginas.
- `/gracias` y `/404` con `noindex`.

## Deploy

`npm run build` genera un sitio estático en `dist/` que puede servirse desde cualquier hosting
(Vercel, Netlify, Cloudflare Pages, S3…). No requiere Node en producción.
