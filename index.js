(() => {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // Scroll progress (top hairline)
  const progressEl = document.querySelector(".scroll-progress");
  if (progressEl) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const p = Math.min(1, Math.max(0, doc.scrollTop / max));
      progressEl.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-inview"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add("is-inview");
            io.unobserve(e.target);
          }
        },
        { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  // Hero example rotator
  const nameEl = document.querySelector('[data-rotator="name"]');
  const addrEl = document.querySelector('[data-rotator="address"]');
  if (nameEl && addrEl) {
    const items = [
      { name: "alice.pha", addr: "0x7b…4C2a" },
      { name: "treasury.pha", addr: "0x2f…91D0" },
      { name: "okx.pha", addr: "0x1a…B3e7" },
      { name: "dao.pha", addr: "0x9c…0F12" },
    ];

    let i = 0;
    const swap = () => {
      i = (i + 1) % items.length;
      nameEl.textContent = items[i].name;
      addrEl.textContent = items[i].addr;
    };

    if (!reduceMotion) {
      setInterval(swap, 2800);
    }
  }

  // Count-up (runs once when visible)
  const countEls = Array.from(document.querySelectorAll("[data-countup]"));
  if (countEls.length) {
    const fmtCompact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
    const fmtPlain = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

    const run = (el) => {
      if (el.dataset.counted === "1") return;
      el.dataset.counted = "1";
      const raw = String(el.getAttribute("data-countup") || "0").replace(/,/g, "");
      const target = Number(raw);
      if (!Number.isFinite(target)) return;

      const format = el.getAttribute("data-countup-format") === "compact" ? fmtCompact : fmtPlain;
      if (reduceMotion) {
        el.textContent = format.format(target);
        return;
      }

      const start = performance.now();
      const dur = 900;
      const from = 0;

      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = from + (target - from) * eased;
        el.textContent = format.format(v);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      countEls.forEach(run);
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            run(e.target);
            io.unobserve(e.target);
          }
        },
        { threshold: 0.35 }
      );
      countEls.forEach((el) => io.observe(el));
    }
  }

  // Subtle card tilt on pointer move
  const tiltEls = Array.from(document.querySelectorAll("[data-tilt]"));
  if (tiltEls.length && !reduceMotion) {
    for (const el of tiltEls) {
      let raf = 0;

      const onMove = (ev) => {
        const rect = el.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width;
        const y = (ev.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * 6; // deg
        const ry = (x - 0.5) * 8; // deg
        const tz = -2;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`;
        });
      };

      const onLeave = () => {
        cancelAnimationFrame(raf);
        el.style.transform = "";
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointercancel", onLeave);
    }
  }

  // Close mobile menu after click
  const mobileDetails = document.querySelector(".nav-mobile");
  if (mobileDetails) {
    mobileDetails.querySelectorAll("a[href^=\"#\"]").forEach((a) => {
      a.addEventListener("click", () => {
        mobileDetails.removeAttribute("open");
      });
    });
  }
})();
