(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progress = document.querySelector(".progress span");
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));

  function updateProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
  }

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function formatNumber(value, prefix, suffix) {
    var rounded = Math.round(value);
    return (prefix || "") + rounded.toLocaleString("en-IN") + (suffix || "");
  }

  function animateCounter(el) {
    var target = Number(el.getAttribute("data-count"));
    if (!Number.isFinite(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = formatNumber(target, prefix, suffix);
      return;
    }
    var start = performance.now();
    var duration = 950;
    function tick(now) {
      var progressValue = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progressValue, 3);
      el.textContent = formatNumber(target * eased, prefix, suffix);
      if (progressValue < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var revealTargets = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], [data-stagger], .chart-panel, .driver-panel"));
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    revealTargets.forEach(function (target) {
      revealObserver.observe(target);
    });
  } else {
    revealTargets.forEach(function (target) {
      target.classList.add("in-view");
      target.querySelectorAll("[data-count]").forEach(animateCounter);
    });
  }

  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === id);
        });
      });
    }, { threshold: 0.42 });

    sections.forEach(function (section) {
      activeObserver.observe(section);
    });
  }
})();
