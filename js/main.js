/* ════════════════════════════════════════════════════════════════
   АКАДЕМИЯ «АМРИТА»
   Lenis (плавный инерционный скролл) + GSAP ScrollTrigger.
   Параллакс по всему холсту + скролл-появления текста и плашек.
   ════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── функциональное (работает всегда) ── */
  var burger = document.getElementById("burger");
  if (burger) burger.addEventListener("click", function () {
    var open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // шапка переодевается над светлым телом
  var header = document.getElementById("header");
  var hero = document.getElementById("hero");
  if (header && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      header.classList.toggle("is-scrolled", !e[0].isIntersecting);
    }, { rootMargin: "-72px 0px 0px 0px" }).observe(hero);
  }

  /* ── режим без анимаций ── */
  if (reduced || typeof gsap === "undefined") {
    document.querySelectorAll(".io-reveal").forEach(function (el) { el.classList.add("is-in"); });
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault(); document.body.classList.remove("menu-open"); t.scrollIntoView();
      });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis: плавный скролл (с ним параллакс кинематографичен) ── */
  var lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // якоря — через Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href"); if (id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      e.preventDefault(); document.body.classList.remove("menu-open");
      if (lenis) lenis.scrollTo(t, { offset: -20, duration: 1.4 });
      else t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ── ИНТРО ХЕРО ── */
  gsap.set(".mask__inner", { yPercent: 115 });
  gsap.set(".pill, .burger", { opacity: 0, y: -16 });
  gsap.set("[data-reveal]", { opacity: 0, y: 18 });
  gsap.set(".hero__eyebrow", { autoAlpha: 0 });
  gsap.set(".hero__video video", { scale: 1.1 });

  function intro() {
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(".hero__video video", { scale: 1.02, duration: 2.4, ease: "power2.out" }, 0);
    tl.to(".pill, .burger", { opacity: 1, y: 0, duration: 0.9, stagger: 0.06 }, 0.15);
    tl.to(".hero__eyebrow", { autoAlpha: 1, duration: 0.9 }, 0.3);
    tl.to(".hero__giant .mask__inner", { yPercent: 0, duration: 1.4 }, 0.5);
    tl.to(".hero__divider[data-reveal]", { opacity: 1, y: 0, duration: 0.8 }, 0.95);
    tl.to(".hero__lead[data-reveal], .hero__orbs[data-reveal]", { opacity: 1, y: 0, duration: 1.0, stagger: 0.12 }, 1.15);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(intro);
  else window.addEventListener("load", intro);

  /* ── ПАРАЛЛАКС ПО ВСЕМУ САЙТУ ── */
  // гигантская фраза херо уезжает вверх и тает при скролле
  gsap.to(".hero__giant", {
    yPercent: -55, opacity: 0.18, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
  });
  // видео уходит в глубину
  gsap.to(".hero__video video", {
    yPercent: 12, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
  });

  // фото двигаются медленнее контента (внутренний параллакс кадра)
  gsap.utils.toArray(".flow__media img, .founder__photo img, .retreat__media img").forEach(function (img) {
    var sec = img.closest("section");
    gsap.set(img, { scale: 1.16 });
    gsap.fromTo(img, { yPercent: -7 }, {
      yPercent: 7, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // фоновая сакральная геометрия плывёт и медленно вращается
  gsap.utils.toArray(".deco").forEach(function (d) {
    gsap.to(d, {
      yPercent: 16, rotation: 22, ease: "none",
      scrollTrigger: { trigger: d.closest("section"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ── СТИКИ-ПЕРЕХОД: фраза замирает, проявляется/растёт и тает ── */
  if (document.querySelector(".hold")) {
    var htl = gsap.timeline({ scrollTrigger: { trigger: ".hold", start: "top top", end: "bottom bottom", scrub: true } });
    htl.fromTo(".hold__line", { scale: 0.78, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ease: "power1.out", duration: 0.42 })
       .to(".hold__line", { scale: 1.16, autoAlpha: 0, ease: "power1.in", duration: 0.42 }, 0.58);
    gsap.to(".hold__geo", {
      rotation: 90, ease: "none",
      scrollTrigger: { trigger: ".hold", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* ── ПОЯВЛЕНИЕ ТЕКСТА И ПЛАШЕК НА СКРОЛЛЕ ── */
  gsap.utils.toArray(".io-reveal").forEach(function (el) {
    gsap.set(el, { opacity: 1, y: 0 });            // снимаем стартовое скрытие из CSS
    gsap.from(el, {
      opacity: 0, y: 48, duration: 1.15, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* ── пересчёт после загрузки шрифтов/картинок ── */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

})();
