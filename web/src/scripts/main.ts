/**
 * Interactividad global del sitio: reveals por scroll, estado del header
 * y menú móvil. Sin frameworks — el sitio es estático por diseño.
 */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ----------------------------------------------------- reveals por scroll */
function initReveals(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (elements.length === 0) return;

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    for (const el of elements) el.classList.add("is-inview");
    return;
  }

  // Stagger: dentro de cada grupo, cada elemento demora un paso más que el anterior.
  for (const group of document.querySelectorAll<HTMLElement>("[data-reveal-group]")) {
    const children = group.querySelectorAll<HTMLElement>("[data-reveal]");
    children.forEach((child, i) => {
      child.style.setProperty("--reveal-delay", String(Math.min(i * 85, 510)));
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
  );

  for (const el of elements) observer.observe(el);
}

/* ------------------------------------------------------- estado del header */
function initHeader(): void {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* -------------------------------------------------------------- menú móvil */
function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-header] [data-nav-toggle]");
  const panel = document.querySelector<HTMLElement>("[data-nav-panel]");
  if (!toggle || !panel) return;

  const root = document.documentElement;

  const setOpen = (open: boolean) => {
    root.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    // No mover el foco al abrir: en móvil el mismo tap puede “cerrar” al toque.
    if (!open) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!root.classList.contains("menu-open"));
  });

  panel.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("menu-open")) setOpen(false);
  });
}

/* --------------------------------------------------- videos de fondo lazy */
function initLazyVideos(): void {
  // Solo videos diferidos fuera del viewport inicial (el del hero ahora es
  // nativo: src directo en el HTML, sin JS de por medio — ver index.astro).
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-lazy-video]"));
  if (videos.length === 0) return;

  type ConnectionInfo = { saveData?: boolean };
  const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
  if (prefersReducedMotion.matches || connection?.saveData) return;

  const revealWhenPlaying = (video: HTMLVideoElement) => {
    const show = () => {
      // Esperar un frame pintado para que el crossfade no muestre negro
      requestAnimationFrame(() => {
        requestAnimationFrame(() => video.classList.add("is-playing"));
      });
    };
    if (!video.paused && video.readyState >= 2) {
      show();
      return;
    }
    video.addEventListener("playing", show, { once: true });
  };

  const armVideo = (video: HTMLVideoElement) => {
    if (video.dataset.armed === "1") return;
    video.dataset.armed = "1";
    if (!video.src && video.dataset.src) {
      video.src = video.dataset.src;
      video.load();
    }
    revealWhenPlaying(video);
    void video.play().catch(() => {});
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (!entry.isIntersecting) {
          if (video.src) video.pause();
          continue;
        }
        armVideo(video);
        if (video.src && video.paused) void video.play().catch(() => {});
      }
    },
    { rootMargin: "200px" },
  );

  for (const video of videos) observer.observe(video);
}

/* ------------------------------------------------------- parallax por JS */
/**
 * Profundidad por capas: cada elemento se desplaza en función de su distancia
 * al centro del viewport (o del scroll absoluto, en el hero). Se escribe la
 * variable --py y CSS aplica translate3d — compuesto en GPU, sin layout.
 * Implementado en JS (no CSS scroll-timeline) para funcionar en todo navegador.
 */
function initParallax(): void {
  if (prefersReducedMotion.matches) return;

  interface Layer {
    el: HTMLElement;
    speed: number;
    /** Tope de desplazamiento como fracción de la altura del elemento (evita huecos). */
    maxFactor: number;
  }

  const layers: Layer[] = [];
  const collect = (selector: string, speed: number, maxFactor: number) => {
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      layers.push({ el, speed, maxFactor });
    }
  };

  collect(".parallax-media", 0.24, 0.11); // bandas full-bleed (sobredimensionadas 116%)
  collect(".parallax-inner", 0.17, 0.075); // imágenes dentro de marcos (scale 1.16)
  collect(".numeral-drift", -0.24, 10); // numerales a contravelocidad, sin tope
  collect(".sun-watermark", 0.2, 10); // sol decorativo
  collect(".parallax-glow", 0.38, 10); // resplandor de tarjetas oscuras

  const heroMedia = document.querySelector<HTMLElement>(".hero-exit-media");
  if (layers.length === 0 && !heroMedia) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const viewportHeight = window.innerHeight;

    for (const { el, speed, maxFactor } of layers) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -240 || rect.top > viewportHeight + 240) continue;
      const offsetFromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
      const max = rect.height * maxFactor;
      const shift = Math.max(-max, Math.min(max, offsetFromCenter * speed));
      el.style.setProperty("--py", `${shift.toFixed(1)}px`);
    }

    if (heroMedia) {
      const scrolled = Math.min(window.scrollY, viewportHeight);
      heroMedia.style.setProperty("--py", `${(scrolled * 0.4).toFixed(1)}px`);
    }
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}

/* -------------------------------------- progreso del recorrido de niveles */
/**
 * En Proyecto Educativo: barra horizontal sticky + tabs que marcan el nivel
 * activo según el scroll. Funciona con [data-levels-track] + secciones #id.
 */
function initLevelsProgress(): void {
  const track = document.querySelector<HTMLElement>("[data-levels-track]");
  const fill = track?.querySelector<HTMLElement>("[data-levels-fill]");
  if (!track || !fill) return;

  const tabs = Array.from(track.querySelectorAll<HTMLAnchorElement>("[data-level-node]"));
  const sections = tabs
    .map((tab) => {
      const id = tab.getAttribute("href")?.replace("#", "");
      return id ? document.getElementById(id) : null;
    })
    .filter((el): el is HTMLElement => Boolean(el));

  if (sections.length === 0) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const marker = window.innerHeight * 0.35;
    const first = sections[0].getBoundingClientRect();
    const last = sections[sections.length - 1].getBoundingClientRect();
    const start = first.top + window.scrollY - marker;
    const end = last.bottom + window.scrollY - marker;
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
    fill.style.setProperty("--progress", progress.toFixed(4));

    let active = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= marker) active = i;
    }
    tabs.forEach((tab, i) => tab.classList.toggle("is-active", i === active));
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}

/* ----------------------------------------------- calesita acordeón */
/**
 * "La vida en el Esquiú": la cinta gira en loop (CSS). Al entrar el mouse en
 * una foto (o tocarla en mobile) la calesita se pausa y esa foto se expande;
 * las vecinas se comprimen. Al salir del carrusel, todo vuelve a girar.
 */
function initGalleryCarousel(): void {
  const carousel = document.querySelector<HTMLElement>("[data-gallery]");
  if (!carousel) return;

  const items = Array.from(carousel.querySelectorAll<HTMLElement>("[data-gallery-item]"));

  const clear = () => {
    carousel.classList.remove("is-paused");
    for (const item of items) item.classList.remove("is-active", "is-dim");
  };

  const activate = (item: HTMLElement) => {
    carousel.classList.add("is-paused");
    // Solo se comprimen las compañeras de la misma pista (la copia duplicada
    // del loop se maneja igual, cada pista mantiene su ancho total constante).
    const track = item.parentElement;
    for (const other of items) {
      const sameTrack = other.parentElement === track;
      other.classList.toggle("is-active", other === item);
      other.classList.toggle("is-dim", sameTrack && other !== item);
    }
  };

  for (const item of items) {
    item.addEventListener("mouseenter", () => activate(item));
    item.addEventListener("focus", () => activate(item));
    item.addEventListener("click", () => {
      if (item.classList.contains("is-active")) clear();
      else activate(item);
    });
  }

  carousel.addEventListener("mouseleave", clear);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget as Node | null)) clear();
  });
}

initReveals();
initHeader();
initMobileNav();
initLazyVideos();
initParallax();
initLevelsProgress();
initGalleryCarousel();
initSinkTitles();

/* ----------------------- título que desciende con el scroll (DOE, etc.) */
function initSinkTitles(): void {
  if (prefersReducedMotion.matches) return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-sink-section]"));
  if (sections.length === 0) return;

  const items = sections
    .map((section) => {
      const title = section.querySelector<HTMLElement>("[data-sink-title]");
      return title ? { section, title } : null;
    })
    .filter((item): item is { section: HTMLElement; title: HTMLElement } => Boolean(item));

  if (items.length === 0) return;

  let ticking = false;

  const update = () => {
    ticking = false;

    for (const { section, title } of items) {
      const parent = title.parentElement;
      if (!parent) continue;

      const maxSink = Math.max(0, parent.clientHeight - title.offsetHeight - 16);
      // 1:1 con el scroll: cada px que bajás, el título baja un px (hasta el tope).
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const pinStart = sectionTop - 112; // debajo del header fijo
      const scrolled = window.scrollY - pinStart;
      const sink = Math.min(maxSink, Math.max(0, scrolled));

      title.style.setProperty("--sink", `${sink.toFixed(1)}px`);
    }
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}
