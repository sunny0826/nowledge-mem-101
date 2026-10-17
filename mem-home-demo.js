(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve(true);
      }, ms);
    });
  }

  function start(root) {
    if (root.dataset.demoReady === "true") return;
    root.dataset.demoReady = "true";

    var noteCodex = root.querySelector('[data-demo-note="codex"]');
    var noteKimi = root.querySelector('[data-demo-note="kimi"]');
    var askEl = root.querySelector("[data-demo-ask]");
    var textEl = root.querySelector("[data-demo-text]");
    var above = root.querySelector("[data-demo-above]");
    var below = root.querySelector("[data-demo-below]");
    var caret = document.createElement("span");
    var generation = 0;

    caret.className = "mem-home-demo-caret";
    caret.setAttribute("aria-hidden", "true");

    function alive(token) {
      return token === generation && root.isConnected;
    }

    function setLine(el, value, withCaret) {
      el.textContent = value;
      if (withCaret) el.appendChild(caret);
    }

    function typeInto(el, value, token) {
      var index = 0;
      setLine(el, "", true);
      return new Promise(function (resolve) {
        function step() {
          if (!alive(token)) {
            resolve(false);
            return;
          }
          index += 1;
          setLine(el, value.slice(0, index), true);
          if (index >= value.length) resolve(true);
          else window.setTimeout(step, 52);
        }
        step();
      });
    }

    function move(el, slot) {
      var first = el.getBoundingClientRect();
      slot.appendChild(el);
      if (reduce) return;
      var last = el.getBoundingClientRect();
      var dx = first.left - last.left;
      var dy = first.top - last.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.style.transition = "none";
      el.style.transform = "translate(" + dx + "px," + dy + "px)";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.transition = "transform 980ms ease";
          el.style.transform = "translate(0px, 0px)";
        });
      });
      function done(event) {
        if (event.propertyName !== "transform") return;
        el.style.transition = "";
        el.style.transform = "";
        el.removeEventListener("transitionend", done);
      }
      el.addEventListener("transitionend", done);
    }

    function setNote(name) {
      var value = root.dataset[name];
      if (name === "noteSave" || name === "noteKept") noteCodex.textContent = value;
      else noteKimi.textContent = value;
    }

    function setAgent(name) {
      var kimi = name === "agentLater";
      var agents = root.querySelectorAll(".mem-home-demo-agent");
      root.classList.toggle("is-session-kimi", kimi);
      agents[0].setAttribute("aria-hidden", kimi ? "true" : "false");
      agents[1].setAttribute("aria-hidden", kimi ? "false" : "true");
    }

    function reset() {
      root.classList.remove("is-kept", "is-asking", "is-found", "is-session-kimi");
      caret.remove();
      textEl.style.transition = "none";
      textEl.style.transform = "";
      above.appendChild(textEl);
      setAgent("agentFirst");
      setNote("noteSave");
      setNote("noteAsk");
      setLine(askEl, "", false);
      setLine(textEl, "", !reduce);
    }

    async function run(token) {
      var save = root.dataset.save;
      var ask = root.dataset.ask;
      reset();
      if (reduce) {
        root.classList.add("is-kept", "is-found");
        setAgent("agentLater");
        setNote("noteFound");
        setLine(askEl, ask, false);
        setLine(textEl, save, false);
        return;
      }
      if (!(await typeInto(textEl, save, token))) return;
      caret.remove();
      if (!(await wait(520)) || !alive(token)) return;
      root.classList.add("is-kept");
      setNote("noteKept");
      move(textEl, below);
      if (!(await wait(1500)) || !alive(token)) return;
      setNote("noteAsk");
      root.classList.add("is-asking", "is-session-kimi");
      if (!(await wait(460)) || !alive(token)) return;
      if (!(await typeInto(askEl, ask, token))) return;
      caret.remove();
      if (!(await wait(640)) || !alive(token)) return;
      root.classList.add("is-found");
      setNote("noteFound");
      move(textEl, above);
      if (!(await wait(3800)) || !alive(token)) return;
      run(token);
    }

    generation += 1;
    run(generation);
  }

  function boot() {
    document.querySelectorAll("[data-mem-home-demo]").forEach(start);
    drawPath();
  }

  function drawPath() {
    if (reduce) return;
    var loop = document.querySelector(".mem-home-loop");
    if (!loop || loop.dataset.pathReady === "true") return;
    loop.dataset.pathReady = "true";
    if (!("IntersectionObserver" in window)) {
      loop.classList.add("is-path");
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      loop.classList.add("is-path");
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(loop);
  }

  boot();
  new MutationObserver(boot).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
