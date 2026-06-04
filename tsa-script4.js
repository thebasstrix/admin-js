(function() {
  var root      = document.getElementById("portfolio-root");
  var hub       = document.getElementById("pf-hub");
  var closeHint = document.getElementById("pf-close-hint");

  var items = [
    { id: "pf-ni-about",    angle: -90  },
    { id: "pf-ni-music",    angle: -18  },
    { id: "pf-ni-dates",    angle:  54  },
    { id: "pf-ni-epk",      angle: 126  },
    { id: "pf-ni-bookings", angle: 198  }
  ];

  function positionItems() {
    var r = Math.max(180, Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.28, 300));
    items.forEach(function(item) {
      var el = document.getElementById(item.id);
      if (!el) return;
      var rad = item.angle * Math.PI / 180;
      el.style.left = "calc(50% + " + (r * Math.cos(rad)) + "px)";
      el.style.top  = "calc(50% + " + (r * Math.sin(rad)) + "px)";
    });
  }
  positionItems();
  window.addEventListener("resize", positionItems);

  function closeNav() { root.classList.remove("nav-active"); }
  function openNav()  { root.classList.add("nav-active"); }

  function closeAllPanels() {
    root.querySelectorAll(".pf-panel").forEach(function(p) { p.classList.remove("open"); });
  }

  function openPanel(slug) {
    var panel = document.getElementById("pf-panel-" + slug);
    if (panel) panel.classList.add("open");
  }

  function closePanel(id) {
    document.getElementById(id).classList.remove("open");
    history.pushState({}, "", window.location.pathname);
    openNav();
  }

  hub.addEventListener("click", function() {
    openNav();
  });

  closeHint.addEventListener("click", function() {
    closeNav();
  });

  root.querySelectorAll("[data-pfpanel]").forEach(function(link) {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      closeNav();
      var id = link.getAttribute("data-pfpanel");
      var slug = id.replace("pf-panel-", "");
      location.hash = slug;
      setTimeout(function() { document.getElementById(id).classList.add("open"); }, 200);
    });
  });

  root.querySelectorAll("[data-pfclose]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      closePanel(btn.getAttribute("data-pfclose"));
    });
  });

  root.querySelectorAll(".pf-panel").forEach(function(panel) {
    panel.addEventListener("click", function(e) {
      if (e.target === panel) {
        closePanel(panel.id);
      }
    });
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      var anyOpen = false;
      root.querySelectorAll(".pf-panel").forEach(function(p) {
        if (p.classList.contains("open")) anyOpen = true;
      });
      if (anyOpen) {
        closeAllPanels();
        history.pushState({}, "", window.location.pathname);
        openNav();
      } else {
        closeNav();
      }
    }
  });

  window.addEventListener("hashchange", function() {
    var slug = location.hash.replace("#", "");
    closeAllPanels();
    if (slug) openPanel(slug);
  });

  // Open correct panel on page load if hash is present
  (function() {
    var slug = location.hash.replace("#", "");
    if (slug) openPanel(slug);
  })();

  var bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var status = document.getElementById("pf-form-status");
      fetch("https://formspree.io/f/xnjyqzwe", {
        method: "POST",
        body: new FormData(bookingForm),
        headers: { "Accept": "application/json" }
      }).then(function(res) {
        if (res.ok) {
          status.textContent = "Enquiry sent — we'll be in touch soon.";
          status.style.display = "block";
          bookingForm.reset();
        } else {
          status.textContent = "Something went wrong. Please try again.";
          status.style.display = "block";
        }
      }).catch(function() {
        status.textContent = "Something went wrong. Please try again.";
        status.style.display = "block";
      });
    });

    var radioInputs = bookingForm.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(function(radio) {
      radio.addEventListener("change", function() {
        radioInputs.forEach(function(r) {
          var lbl = bookingForm.querySelector('label[for="' + r.id + '"]');
          if (lbl) {
            lbl.style.color = "rgba(255,255,255,0.5)";
            lbl.style.borderColor = "rgba(255,255,255,0.12)";
            lbl.style.background = "transparent";
          }
        });
        var selected = bookingForm.querySelector('label[for="' + this.id + '"]');
        if (selected) {
          selected.style.color = "var(--gold)";
          selected.style.borderColor = "rgba(201,168,76,0.7)";
          selected.style.background = "rgba(201,168,76,0.08)";
        }
      });
    });
  }

})();
