(function () {
  var root = document.documentElement;
  var THEME_KEY = "theme";

  /* Theme: system -> light -> dark -> system. "system" writes no data-theme
     attribute at all, so the prefers-color-scheme block in CSS takes over. */
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    var order = ["system", "light", "dark"];
    var mode = "system";
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (order.indexOf(saved) > -1) mode = saved;
    } catch (e) {}

    var paint = function () {
      if (mode === "system") root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", mode);
      var next = order[(order.indexOf(mode) + 1) % order.length];
      toggle.setAttribute("aria-label", "Colour theme: " + mode + ". Switch to " + next + ".");
      toggle.setAttribute("title", "Colour theme: " + mode);
      toggle.setAttribute("data-mode", mode);
    };

    toggle.addEventListener("click", function () {
      mode = order[(order.indexOf(mode) + 1) % order.length];
      try {
        localStorage.setItem(THEME_KEY, mode);
      } catch (e) {}
      paint();
    });

    paint();
  }

  /* Mobile menu: the panel is fixed and full height, so lock the page behind
     it, close on link click, on Escape, and hand focus back to the button. */
  var menuBtn = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", open);
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 767) setMenu(false);
    });
  }

  /* Publication filter: hide non-matching entries, drop year groups that end
     up empty, hide their "jump to" links too, and announce the result count. */
  var segmented = document.querySelector(".segmented");
  if (segmented) {
    var buttons = segmented.querySelectorAll("button");
    var items = document.querySelectorAll(".pub");
    var groupHeaders = document.querySelectorAll(".year-label");
    var status = document.getElementById("filter-status");

    segmented.addEventListener("click", function (e) {
      var clicked = e.target.closest("button");
      if (!clicked) return;

      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", b === clicked);
      });

      var want = clicked.getAttribute("data-filter");
      var shown = 0;
      items.forEach(function (item) {
        var match = want === "all" || item.getAttribute("data-type") === want;
        item.hidden = !match;
        if (match) shown++;
      });

      groupHeaders.forEach(function (header) {
        var group = header.closest("[data-year-group]");
        var empty = !group.querySelector(".pub:not([hidden])");
        group.hidden = empty;
        var jump = document.querySelector('.jump a[href="#' + header.id + '"]');
        if (jump) jump.hidden = empty;
      });

      if (status) {
        status.textContent = "Showing " + shown + " of " + items.length + " papers";
      }
    });
  }

  /* Scroll spy: one observer per section, tagging the matching nav link. */
  var links = document.querySelectorAll("#site-nav a[href*='#']");
  var currentLink = null;
  links.forEach(function (link) {
    var id = link.getAttribute("href").split("#")[1];
    var section = id ? document.getElementById(id) : null;
    if (!section || !window.IntersectionObserver) return;

    new IntersectionObserver(
      function (entries) {
        if (!entries[0].isIntersecting) return;
        if (currentLink) currentLink.removeAttribute("aria-current");
        currentLink = link;
        link.setAttribute("aria-current", "location");
      },
      { rootMargin: "-56px 0px -65% 0px" }
    ).observe(section);
  });
})();
