// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.colegioesquiu.edu.ar",
  // La compresión "jsx" (default de Astro 7) recorta espacios entre elementos
  // inline; el contenido editorial del sitio necesita la compresión HTML clásica.
  compressHTML: true,
  // Prefetch de todos los links al entrar al viewport: la navegación entre
  // páginas se siente instantánea sin costo en la carga inicial.
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  build: {
    // CSS inline en el HTML: elimina un request render-blocking y mejora FCP/LCP.
    inlineStylesheets: "always",
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/gracias"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  // URLs del sitio Wix anterior → nueva arquitectura (SEO: se preservan enlaces entrantes).
  redirects: {
    "/admision": "/admisiones",
    "/proyecto-pedagógico": "/proyecto-educativo",
    "/areas-transversales-1": "/areas",
    "/copia-de-ed-fisica": "/areas",
    "/copia-de-ingles": "/areas",
    "/copia-de-pastoral": "/areas",
    "/copia-de-pastoral-1": "/areas",
    "/general-6": "/areas",
    "/blank-1": "/",
    "/institucion": "/",
    "/comisión-directiva": "/equipo",
  },
});
