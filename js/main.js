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

  /* ── продажи: клик по карточке подставляет формат в форму ── */
  document.querySelectorAll("[data-plan]").forEach(function (el) {
    el.addEventListener("click", function () {
      var sel = document.getElementById("plan");
      if (!sel) return;
      var want = el.getAttribute("data-plan");
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === want || sel.options[i].text === want) { sel.selectedIndex = i; break; }
      }
    });
  });

  /* ── заявка (демо: без бэкенда — показываем подтверждение) ── */
  var joinForm = document.getElementById("joinForm");
  if (joinForm) joinForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var st = document.getElementById("joinStatus");
    var nm = (document.getElementById("name") || {}).value || "";
    var ct = (document.getElementById("contact") || {}).value || "";
    if (!nm.trim() || !ct.trim()) { if (st) st.textContent = "Пожалуйста, заполните имя и контакт."; return; }
    if (st) st.textContent = "Спасибо! Заявка принята — мы свяжемся с вами и пришлём доступ.";
    joinForm.reset();
  });

  /* ── ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ (IntersectionObserver — надёжно везде: без GSAP/Lenis/reduced) ──
     Изначально элементы скрыты (CSS .io-reveal{opacity:0}); как только попадают в экран —
     добавляем .is-in, и CSS их проявляет. Работает независимо от настроек анимации. */
  (function () {
    var els = document.querySelectorAll(".io-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ── нет библиотеки анимаций: остаются только простые якоря ── */
  if (typeof gsap === "undefined") {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault(); document.body.classList.remove("menu-open"); t.scrollIntoView();
      });
    });
    return;
  }
  // reduced-motion: оставляем плавное ПОЯВЛЕНИЕ секций и прорисовку линии (без тряски —
  // отключаем инерц-скролл и параллакс ниже). Так анимация появления работает у всех.

  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis: плавный скролл (с ним параллакс кинематографичен) ── */
  // режим showcase: сайт открыт во фрейме видео-презентации — отдаём скролл родителю
  var showcase = /[?&]showcase\b/.test(location.search);
  var lenis = null;
  if (typeof Lenis !== "undefined" && !showcase && !reduced) {
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

  /* ── ХЕРО-ИНТРО + ПАРАЛЛАКС: только если движение разрешено (reduced-motion → пропускаем тряску) ── */
  if (!reduced) {

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

  } /* конец гейта !reduced (херо-интро + параллакс) */

  /* ── появление контента ведёт IntersectionObserver (см. выше) — здесь только нить/параллакс ── */

  /* ── ЗОЛОТАЯ НИТЬ: спокойно прорисовывается по мере скролла (появляется вместе со страницей) ── */
  var thread = document.querySelector("#amrita-thread .thread__line");
  if (thread && thread.getTotalLength) {
    var tlen = thread.getTotalLength();
    if (tlen) {
      gsap.set("#amrita-thread", { xPercent: -50 });
      gsap.set(thread, { strokeDasharray: tlen, strokeDashoffset: tlen });
      gsap.to(thread, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: "#main", start: "top top", end: "bottom bottom", scrub: 0.6 }
      });
      if (!reduced) {                                  // лёгкий дрейф — только при разрешённом движении
        gsap.fromTo("#amrita-thread", { yPercent: -5 }, {
          yPercent: 5, ease: "none",
          scrollTrigger: { trigger: "#main", start: "top top", end: "bottom bottom", scrub: true }
        });
      }
    }
  }

  // высота #main меняется при раскрытии FAQ — пересчитываем, чтобы конец нити не уплывал
  document.querySelectorAll(".faq__item").forEach(function (d) {
    d.addEventListener("toggle", function () { ScrollTrigger.refresh(); });
  });

  /* ── пересчёт после загрузки шрифтов/картинок ── */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

})();
