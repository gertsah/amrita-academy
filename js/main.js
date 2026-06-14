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
  // режим showcase: сайт открыт во фрейме видео-презентации — отдаём скролл родителю
  var showcase = /[?&]showcase\b/.test(location.search);
  var lenis = null;
  if (typeof Lenis !== "undefined" && !showcase) {
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

  /* ── ЗАГОЛОВКИ: киношный clip-reveal (раскрытие сверху вниз) ── */
  var headSel = ".h-sec, .join__title, .founder__name";
  gsap.utils.toArray(headSel).forEach(function (h) {
    gsap.fromTo(h,
      { clipPath: "inset(0 0 100% 0)", yPercent: 14, opacity: 0 },
      {
        clipPath: "inset(0 0 0% 0)", yPercent: 0, opacity: 1, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: h, start: "top 86%" }
      }
    );
  });

  /* ── ЭТАПЫ ПУТИ: текст появляется ступенями (строка → точка → имя-вайп → описание) ── */
  gsap.utils.toArray(".stage").forEach(function (st) {
    var nm = st.querySelector(".stage__name");
    var dot = st.querySelector(".stage__dot");
    var desc = st.querySelector(".stage__desc");
    var tl = gsap.timeline({ scrollTrigger: { trigger: st, start: "top 88%" } });
    tl.fromTo(st, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }, 0);
    if (dot) tl.fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, 0.1);
    if (nm) tl.fromTo(nm, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.out" }, 0.18);
    if (desc) tl.fromTo(desc, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, 0.32);
  });

  /* ── ПОЯВЛЕНИЕ ТЕКСТА И ПЛАШЕК НА СКРОЛЛЕ ── */
  gsap.utils.toArray(".io-reveal").forEach(function (el) {
    if (el.matches(headSel)) return;               // заголовки обработаны отдельным clip-reveal
    gsap.set(el, { opacity: 1, y: 0 });            // снимаем стартовое скрытие из CSS
    if (showcase) {
      // showcase: привязываем к позиции скролла — детерминированно для покадрового рендера
      gsap.fromTo(el, { opacity: 0, y: 48 }, {
        opacity: 1, y: 0, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", end: "top 62%", scrub: true }
      });
    } else {
      gsap.from(el, {
        opacity: 0, y: 48, duration: 1.15, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    }
  });

  /* ── ЕДИНАЯ ЗОЛОТАЯ НИТЬ: рисуется по странице + бегущий огонёк + свой медленный слой ── */
  var thread = document.querySelector("#amrita-thread .thread__line");
  var threadSvg = document.querySelector("#amrita-thread .thread__svg");
  var comet = document.querySelector("#amrita-thread .thread__comet");
  if (thread && thread.getTotalLength) {
    var tlen = thread.getTotalLength();
    if (tlen) {
      var cw = 0, ch = 0;
      var measureThread = function () {
        if (threadSvg) { var r = threadSvg.getBoundingClientRect(); cw = r.width; ch = r.height; }
      };
      measureThread();
      ScrollTrigger.addEventListener("refresh", measureThread);

      gsap.set("#amrita-thread", { xPercent: -50 });           // центрирование под управлением GSAP
      gsap.set(thread, { strokeDasharray: tlen, strokeDashoffset: tlen });

      // 1) рисование линии + позиция бегущего огонька на её острие
      gsap.to(thread, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: {
          trigger: "#main", start: "top top", end: "bottom bottom", scrub: 0.6,
          onUpdate: function (self) {
            if (!comet) return;
            var pr = self.progress;
            if (pr > 0.004 && pr < 0.996 && cw) {
              var pt = thread.getPointAtLength(pr * tlen);   // координаты в системе viewBox (0-100 × 0-1000)
              comet.style.left = (pt.x / 100 * cw) + "px";
              comet.style.top = (pt.y / 1000 * ch) + "px";
              comet.classList.add("is-on");
            } else {
              comet.classList.remove("is-on");
            }
          }
        }
      });

      // 2) параллакс-слой нити: медленнее контента (~0.88x)
      gsap.fromTo("#amrita-thread", { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: "#main", start: "top top", end: "bottom bottom", scrub: true }
      });
    }
  }

  // 3) встречный слой: крупные антиква-номера опережают скролл
  gsap.utils.toArray(".stage__no, .step__no").forEach(function (n) {
    var sec = n.closest("section");
    gsap.fromTo(n, { y: 28 }, {
      y: -28, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // 4) дальний фон у формы: halo плывёт и дышит
  if (document.querySelector(".join__halo")) {
    gsap.fromTo(".join__halo", { yPercent: -10, scale: 0.92 }, {
      yPercent: 10, scale: 1.06, ease: "none",
      scrollTrigger: { trigger: ".join", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  // высота #main меняется при раскрытии FAQ — пересчитываем, чтобы конец нити не уплывал
  document.querySelectorAll(".faq__item").forEach(function (d) {
    d.addEventListener("toggle", function () { ScrollTrigger.refresh(); });
  });

  /* ── пересчёт после загрузки шрифтов/картинок ── */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

})();
