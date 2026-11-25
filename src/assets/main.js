(function () {
  var root = document.documentElement;

  var toggle = document.getElementById("theme-toggle");
  if (toggle) toggle.onclick = function () {
    var stored = null;
    try { stored = localStorage.getItem("theme"); } catch (e) {}
    var dark = stored ? stored === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "light" : "dark");
    try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) {}
  };

  var btn = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  if (btn && nav) {
    var close = function () {
      nav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
    };
    btn.onclick = function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close();
        btn.focus();
      }
    });
  }

  // Filter: hide items, hide empty year groups, announce the count.
  var seg = document.querySelector(".segmented");
  if (seg) {
    var btns = seg.querySelectorAll("button");
    var items = document.querySelectorAll(".pub");
    var groups = document.querySelectorAll("[data-year-group]");
    var status = document.getElementById("filter-status");
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      var want = b.getAttribute("data-filter");
      var shown = 0;
      items.forEach(function (li) {
        li.hidden = want !== "all" && li.getAttribute("data-type") !== want;
        if (!li.hidden) shown++;
      });
      groups.forEach(function (g) {
        g.hidden = !g.querySelector(".pub:not([hidden])");
      });
      if (status) status.textContent = shown + " of " + items.length + " papers shown";
    });
  }

  // Scroll spy.
  if (IntersectionObserver) {
    var current = null;
    document.querySelectorAll("#site-nav a[href*='#']").forEach(function (a) {
      var el = document.getElementById(a.getAttribute("href").split("#")[1] || "");
      if (!el) return;
      new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        if (current) current.removeAttribute("aria-current");
        current = a;
        a.setAttribute("aria-current", "location");
      }, { rootMargin: "-56px 0px -65% 0px" }).observe(el);
    });
  }
})();
