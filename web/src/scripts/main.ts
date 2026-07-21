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
  const shiftLayer = carousel?.querySelector<HTMLElement>("[data-gallery-shift]");
  if (!carousel || !shiftLayer) return;

  const items = Array.from(carousel.querySelectorAll<HTMLElement>("[data-gallery-item]"));

  const applyState = (item: HTMLElement | null) => {
    const track = item?.parentElement;
    for (const other of items) {
      other.classList.toggle("is-active", other === item);
      other.classList.toggle("is-dim", !!item && other.parentElement === track && other !== item);
    }
  };

  /** Desplazamiento real actual de la capa (aunque haya una transición en vuelo). */
  const readShift = () => new DOMMatrixReadOnly(getComputedStyle(shiftLayer).transform).m41;

  const clear = () => {
    carousel.classList.remove("is-paused");
    applyState(null);
    shiftLayer.style.setProperty("--shift", "0px");
  };

  const activate = (item: HTMLElement) => {
    lastActivateTs = performance.now();
    carousel.classList.add("is-paused");
    const actualShift = readShift();

    // Medir el layout FINAL sin transiciones (todo en el mismo task: el
    // navegador no pinta estados intermedios) para saber cuánto deslizar
    // la cinta y que la foto expandida quede centrada en el carrusel.
    shiftLayer.classList.add("gallery-measuring");
    shiftLayer.style.setProperty("--shift", `${actualShift.toFixed(1)}px`);
    applyState(item);
    const itemRect = item.getBoundingClientRect();
    const layerRect = shiftLayer.getBoundingClientRect();
    const carouselRect = carousel.getBoundingClientRect();

    // Encajar, NO centrar: la cinta se corre apenas lo justo para que la foto
    // expandida entre completa. Centrar movía la cinta lejos del cursor y lo
    // dejaba sobre la vecina → cualquier micro-movimiento encadenaba saltos.
    // Con el encaje mínimo, el cursor queda SIEMPRE dentro de la foto activa
    // (solo crece alrededor de su posición): imposible encadenar.
    const MARGEN = 28;
    let delta = 0;
    if (itemRect.right > carouselRect.right - MARGEN) {
      delta = carouselRect.right - MARGEN - itemRect.right;
    } else if (itemRect.left < carouselRect.left + MARGEN) {
      delta = carouselRect.left + MARGEN - itemRect.left;
    }
    // Nunca dejar huecos en los bordes de la cinta
    delta = Math.min(delta, carouselRect.left - layerRect.left);
    delta = Math.max(delta, carouselRect.right - layerRect.right);

    // Volver al estado previo, reactivar transiciones…
    applyState(null);
    void shiftLayer.offsetWidth;
    shiftLayer.classList.remove("gallery-measuring");

    // …y aplicar expansión + centrado juntos: animan a la vez.
    applyState(item);
    shiftLayer.style.setProperty("--shift", `${(actualShift + delta).toFixed(1)}px`);
  };

  // Hover con mousemove, NO mouseenter: cuando la cinta se desliza para
  // centrar, pasa contenido bajo el cursor quieto — mouseenter dispararía
  // re-activaciones en cascada. mousemove solo dispara con movimiento real.
  //
  // Dwell time: para CAMBIAR de foto, el cursor debe reposar sobre la nueva
  // ~300ms. Sin esto, tener el mouse cerca del borde encadena activaciones:
  // activo una → se centra → la siguiente queda bajo el cursor → y así.
  const DWELL_PRIMERA = 90;
  const DWELL_CAMBIO = 200;
  const DELAY_SALIDA = 380;

  let pending: HTMLElement | null = null;
  let dwellTimer = 0;
  let leaveTimer = 0;
  let lastActivateTs = 0;
  // Filtro de mousemove sintético de Chromium (mismas coordenadas que el
  // último real cuando el layout cambia bajo el cursor quieto).
  let lastMoveX = -1;
  let lastMoveY = -1;

  const cancelDwell = () => {
    pending = null;
    window.clearTimeout(dwellTimer);
  };

  // Al disparar el dwell NO se usa el objetivo capturado al agendar: para
  // entonces la cinta pudo haberse deslizado y ese objetivo quedó viejo (era
  // la causa del "scrolleo infinito"). Se espera a que la cinta asiente y se
  // activa la foto que esté REALMENTE bajo el cursor en ese momento — una
  // sola corrección posible y sin re-agendado: imposible encadenar.
  const SETTLE_MS = 450;

  const validarYActivar = () => {
    const falta = SETTLE_MS - (performance.now() - lastActivateTs);
    if (falta > 0) {
      dwellTimer = window.setTimeout(validarYActivar, falta + 40);
      return;
    }
    const debajo = document.elementFromPoint(lastMoveX, lastMoveY) as HTMLElement | null;
    const real = debajo?.closest<HTMLElement>("[data-gallery-item]");
    if (!real || real.classList.contains("is-active")) return;
    activate(real);
  };

  const scheduleActivate = (item: HTMLElement, delay: number) => {
    if (pending === item) return;
    cancelDwell();
    pending = item;
    dwellTimer = window.setTimeout(() => {
      pending = null;
      validarYActivar();
    }, delay);
  };

  carousel.addEventListener("mousemove", (event) => {
    window.clearTimeout(leaveTimer);
    if (event.clientX === lastMoveX && event.clientY === lastMoveY) return;
    lastMoveX = event.clientX;
    lastMoveY = event.clientY;
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-item]");
    if (!item || item.classList.contains("is-active")) {
      cancelDwell();
      return;
    }
    const hayActiva = items.some((other) => other.classList.contains("is-active"));
    scheduleActivate(item, hayActiva ? DWELL_CAMBIO : DWELL_PRIMERA);
  });

  for (const item of items) {
    item.addEventListener("focus", () => {
      window.clearTimeout(leaveTimer);
      cancelDwell();
      activate(item);
    });
    item.addEventListener("click", () => {
      window.clearTimeout(leaveTimer);
      cancelDwell();
      if (item.classList.contains("is-active")) clear();
      else activate(item);
    });
  }

  // Delay al salir: un roce afuera no corta la experiencia en seco; si el
  // mouse vuelve enseguida (mousemove), la salida se cancela.
  carousel.addEventListener("mouseleave", () => {
    cancelDwell();
    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(clear, DELAY_SALIDA);
  });
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget as Node | null)) {
      cancelDwell();
      clear();
    }
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
