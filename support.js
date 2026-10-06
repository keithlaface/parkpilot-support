(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var search = document.getElementById("faq-search");
  var items = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  var empty = document.getElementById("faq-empty");
  var copyButton = document.getElementById("copy-email");
  var copyStatus = document.getElementById("copy-status");

  function preferredDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return preferredDark() ? "dark" : "light";
  }

  function paintTheme() {
    var dark = currentTheme() === "dark";
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
    toggle.textContent = dark ? "Use light mode" : "Use dark mode";
  }

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("parkpilot-theme", next);
    } catch (e) {}
    paintTheme();
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if (!root.getAttribute("data-theme")) paintTheme();
  });

  paintTheme();

  function showEmpty(query) {
    var link = document.createElement("a");
    link.href = "mailto:developer@arcemdigitalsolutions.com?subject=Park%20Pilot%20support";
    link.textContent = "email support";
    empty.hidden = false;
    empty.replaceChildren();
    empty.append("No topics match \u201c" + query + "\u201d. Try a shorter word, or ");
    empty.append(link);
    empty.append(".");
  }

  function filterTopics() {
    var query = search.value.trim().toLowerCase();
    var shown = 0;
    items.forEach(function (item) {
      var match = !query || item.textContent.toLowerCase().indexOf(query) !== -1;
      item.hidden = !match;
      if (match) shown += 1;
    });
    if (query && shown === 0) showEmpty(query);
    else {
      empty.hidden = true;
      empty.textContent = "";
    }
  }

  search.form.addEventListener("submit", function (event) {
    event.preventDefault();
    filterTopics();
  });

  search.addEventListener("input", filterTopics);

  var params = new URLSearchParams(window.location.search);
  if (params.get("q")) {
    search.value = params.get("q");
    filterTopics();
  }

  copyButton.addEventListener("click", function () {
    var email = copyButton.getAttribute("data-email");
    if (copyButton.getAttribute("aria-busy") === "true") return;
    copyButton.setAttribute("aria-busy", "true");
    copyStatus.dataset.state = "";
    copyStatus.textContent = "Copying\u2026";
    var done = function (ok) {
      copyButton.removeAttribute("aria-busy");
      if (ok) {
        copyStatus.dataset.state = "ok";
        copyStatus.textContent = "Copied.";
      } else {
        copyStatus.dataset.state = "error";
        copyStatus.textContent = "Couldn\u2019t copy. Select the address above and copy it yourself.";
      }
    };
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      done(false);
      return;
    }
    navigator.clipboard.writeText(email).then(function () {
      done(true);
    }, function () {
      done(false);
    });
  });
})();
