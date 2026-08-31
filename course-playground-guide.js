/* Course-only guidance for the unchanged Playground app replica. */
(function () {
  "use strict";

  var ROOT_SELECTOR = "[data-course-playground-guide]";
  var MIN_DOCK_WIDTH = 40 * 16; // rem-based minimum width for the docked window
  var states = new WeakMap();
  var tracked = [];
  var scanTimer = null;

  function targetForStep(state, step) {
    var selectors = {
      1: '[data-mp-view="timeline"]',
      2: "[data-mp-input]",
      3: "[data-mp-send]",
    };
    var el = state.windowEl.querySelector(selectors[step]);
    // Step 2 points at the textarea; ring the whole capture box instead.
    if (step === 2 && el) el = el.closest(".mp-capture") || el;
    return el;
  }

  function positionWindow(state) {
    var playgroundWindow = state.windowEl;
    var content = document.getElementById("content");
    var html = document.documentElement;

    // While the window is docked, collapse the docs sidebar so the page has
    // room; it comes back as soon as the window closes or minimizes.
    var wantDocked = state.open && !state.minimized && window.innerWidth >= 1024;
    if (wantDocked !== html.hasAttribute("data-course-playground-docked")) {
      if (wantDocked) {
        html.setAttribute("data-course-playground-docked", "true");
      } else {
        html.removeAttribute("data-course-playground-docked");
      }
    }

    function reset() {
      playgroundWindow.style.left = "";
      playgroundWindow.style.width = "";
      if (content) {
        content.style.marginLeft = "";
        content.style.maxWidth = "";
      }
    }

    if (!state.open || state.minimized || window.innerWidth < 1024) {
      reset();
      return;
    }

    // Dock the window to the right of the course steps: move the article
    // left into the slack next to the sidebar and narrow it slightly, so the
    // replica keeps a readable width without covering the steps. Fall back to
    // overlaying the article when the viewport is too narrow for both.
    reset();
    var stepsRect = state.rootEl.getBoundingClientRect();
    var vw = window.innerWidth;
    // The sidebar is collapsed while docked, so the article can start near
    // the viewport edge instead of clearing the sidebar.
    var SIDEBAR_CLEAR = wantDocked ? 24 : 440;
    var MIN_ARTICLE = 26 * 16;
    var GAP = 24;

    var width = Math.min(72 * 16, vw - SIDEBAR_CLEAR - MIN_ARTICLE - 2 * GAP - 16);
    if (width < MIN_DOCK_WIDTH) return; // CSS default: overlay from the right

    var articleLeft = Math.min(stepsRect.left, SIDEBAR_CLEAR + GAP);
    var articleWidth = Math.min(stepsRect.width, vw - 16 - width - GAP - articleLeft);

    if (content) {
      content.style.marginLeft = articleLeft - stepsRect.left + "px";
      content.style.maxWidth = articleWidth + "px";
    }
    playgroundWindow.style.left = vw - 16 - width + "px";
    playgroundWindow.style.width = "auto";
  }

  var FILL_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>';

  // Rebuild the floating caption. On step 2 it also carries the one-click
  // fill button, so the action sits right where the learner is looking.
  // Content is cached: rebuilding between mousedown and mouseup (e.g. while
  // the window scrolls) would swap the button node and swallow the click.
  function renderHint(state, text, withFill) {
    var hint = state.hintEl;
    var key = text + "|" + (withFill ? "fill" : "");
    if (state.hintKey === key) return;
    state.hintKey = key;
    hint.textContent = "";
    var label = document.createElement("span");
    label.textContent = text;
    hint.appendChild(label);
    if (!withFill) return;
    var value = state.rootEl.getAttribute("data-course-guide-fillable");
    var fillLabel = state.rootEl.getAttribute("data-course-guide-fill-label");
    if (!value || !fillLabel) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "course-playground-hint-fill";
    button.setAttribute("data-course-guide-fill", value);
    button.innerHTML = FILL_ICON + "<span></span>";
    button.querySelector("span").textContent = fillLabel;
    hint.appendChild(button);
  }

  function placeHint(state, anchor) {
    var hint = state.hintEl;
    hint.hidden = false;
    var targetRect = anchor.getBoundingClientRect();
    var windowRect = state.windowEl.getBoundingClientRect();
    var half = hint.offsetWidth / 2;
    var center = targetRect.left + targetRect.width / 2;
    center = Math.max(windowRect.left + half + 8, Math.min(center, windowRect.right - half - 8));
    hint.style.left = center + "px";
    var top = targetRect.bottom + 10;
    // Flip above the target when there is no room below inside the window.
    if (top + hint.offsetHeight > windowRect.bottom - 8) {
      top = targetRect.top - hint.offsetHeight - 10;
    }
    hint.style.top = top + "px";
  }

  function highlightTarget(state) {
    var previous = state.windowEl.querySelector("[data-course-guide-target]");
    if (previous) previous.removeAttribute("data-course-guide-target");

    var hint = state.hintEl;
    if (!state.open || state.minimized) {
      if (hint) hint.hidden = true;
      return;
    }

    // After the send step, point at what changed: the newly saved entry.
    if (state.step > 3) {
      var changedText = state.changedEl && state.rootEl.getAttribute("data-course-guide-hint-4");
      if (hint && changedText) {
        renderHint(state, changedText, false);
        placeHint(state, state.changedEl);
      } else if (hint) {
        hint.hidden = true;
      }
      return;
    }

    var target = targetForStep(state, state.step);
    if (!target) {
      if (hint) hint.hidden = true;
      return;
    }
    target.setAttribute("data-course-guide-target", "");
    target.scrollIntoView({ block: "nearest" });

    var text = state.rootEl.getAttribute("data-course-guide-hint-" + state.step);
    if (!hint || !text) return;
    renderHint(state, text, state.step === 2);
    placeHint(state, target);
  }

  function updateCourseSteps(state) {
    for (var step = 1; step <= 3; step += 1) {
      var anchor = state.rootEl.querySelector('[data-course-guide-source="' + step + '"]');
      var item = anchor && anchor.closest('[role="listitem"]');
      if (!item) continue;
      item.classList.toggle("course-playground-source-active", state.open && step === state.step);
      item.classList.toggle("course-playground-source-complete", step < state.step);
    }
  }

  function render(state) {
    var root = state.rootEl;
    root.setAttribute("data-course-guide-current", String(state.step));
    if (state.step < 4 && state.changedEl) {
      state.changedEl.removeAttribute("data-course-guide-changed");
      state.changedEl = null;
    }
    // Keep the article in sync: when the simulation advances the step, bring
    // the matching course step into view.
    if (state.open && state.renderedStep !== undefined && state.step !== state.renderedStep) {
      var syncAnchor = root.querySelector(
        '[data-course-guide-source="' + Math.min(state.step, 3) + '"]'
      );
      var syncItem = syncAnchor && syncAnchor.closest('[role="listitem"]');
      if (syncItem) {
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        syncItem.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      }
    }
    state.renderedStep = state.step;
    updateCourseSteps(state);

    var ready = root.querySelector("[data-course-guide-ready]");
    var done = root.querySelector("[data-course-guide-done]");
    if (ready) ready.hidden = state.step >= 4;
    if (done) done.hidden = state.step < 4;

    var launchLabel = root.querySelector("[data-course-guide-open-label]");
    if (launchLabel) {
      if (state.open) {
        launchLabel.textContent = root.getAttribute("data-course-guide-close-label");
      } else if (state.step >= 4) {
        launchLabel.textContent = root.getAttribute("data-course-guide-replay-label");
      } else {
        launchLabel.textContent = state.startLabel;
      }
    }

    requestAnimationFrame(function () {
      positionWindow(state);
      highlightTarget(state);
    });
  }

  // Map the macOS-style titlebar dots: only red (close) is interactive; the
  // yellow and green dots stay decorative.
  function prepareWindowControl(state) {
    var dots = state.windowEl.querySelectorAll(".mp-dots i");
    if (!dots.length) return;
    dots[0].setAttribute("data-course-guide-window-close", "");
    dots[0].setAttribute("role", "button");
    dots[0].setAttribute("tabindex", "0");
    var closeLabel = state.rootEl.getAttribute("data-course-guide-close-label");
    if (closeLabel) dots[0].setAttribute("aria-label", closeLabel);
    for (var i = 1; i < dots.length; i += 1) {
      dots[i].removeAttribute("data-course-guide-window-minimize");
      dots[i].removeAttribute("data-course-guide-window-maximize");
      dots[i].removeAttribute("role");
      dots[i].removeAttribute("tabindex");
      dots[i].setAttribute("aria-hidden", "true");
    }
  }

  function setMinimized(state, minimized) {
    state.minimized = minimized;
    state.windowEl.setAttribute("data-course-playground-minimized", String(minimized));
    if (state.miniEl) state.miniEl.hidden = !minimized;
    if (minimized) {
      hideDoneModal(state);
      if (state.hintEl) state.hintEl.hidden = true;
    } else {
      positionWindow(state);
      setTimeout(function () {
        highlightTarget(state);
      }, 280);
    }
  }

  function setWindowOpen(state, open, restoreFocus) {
    var playgroundWindow = state.windowEl;
    var launch = state.rootEl.querySelector("[data-course-guide-open]");
    if (!playgroundWindow || !launch) return;

    state.open = open;
    playgroundWindow.setAttribute("data-course-playground-open", String(open));
    playgroundWindow.setAttribute("aria-hidden", String(!open));
    launch.setAttribute("aria-expanded", String(open));

    if (open) {
      if (state.minimized) setMinimized(state, false);
      playgroundWindow.removeAttribute("inert");
      prepareWindowControl(state);
      positionWindow(state);
      setTimeout(function () {
        prepareWindowControl(state);
        highlightTarget(state);
      }, 280);
    } else {
      if (state.minimized) setMinimized(state, false);
      playgroundWindow.setAttribute("inert", "");
      hideDoneModal(state);
      positionWindow(state);
      if (restoreFocus !== false) launch.focus();
    }
    render(state);
  }

  // Mark what the send just changed: the new entry lands at the top of the
  // timeline. The completion dialog appears a beat later so the learner
  // sees the change first.
  function markChange(state) {
    var entry = state.windowEl.querySelector("[data-mp-timeline] .mp-entry");
    state.changedEl = entry || null;
    if (entry) {
      entry.setAttribute("data-course-guide-changed", "");
      entry.scrollIntoView({ block: "nearest" });
    }
  }

  function showDoneModal(state) {
    var modal = state.modalEl;
    if (!modal || state.step < 4) return;
    modal.hidden = false;
    var confirm = modal.querySelector("[data-course-guide-done-confirm]");
    if (confirm) confirm.focus();
  }

  function hideDoneModal(state) {
    if (state.modalEl) state.modalEl.hidden = true;
  }

  function tryComplete(state, input) {
    setTimeout(function () {
      if (input.value !== "") return;
      state.step = 4;
      markChange(state);
      render(state);
      setTimeout(function () {
        showDoneModal(state);
      }, 1100);
    }, 40);
  }

  function fillExample(state, value) {
    var input = state.windowEl.querySelector("[data-mp-input]");
    if (!input || !value) return;
    if (!state.open) setWindowOpen(state, true);
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    state.step = 3;
    render(state);
    setTimeout(function () {
      input.focus();
      input.setSelectionRange(value.length, value.length);
    }, 320);
  }

  // Open the Nowledge Mem desktop app through its registered URL scheme
  // (nowledgemem://, macOS and Windows). If nothing takes focus within a
  // short window the app is probably not installed, so fall back to the
  // website.
  function openMemApp(state) {
    var site = state.rootEl.getAttribute("data-course-guide-mem-url") || "https://mem.nowledge.co";
    var handled = false;
    var timer = setTimeout(function () {
      if (!handled && !document.hidden) window.open(site, "_blank", "noopener");
    }, 1600);
    function cleanup() {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pagehide", cleanup);
    }
    function markHandled() {
      handled = true;
      cleanup();
    }
    function onVisibility() {
      if (document.hidden) markHandled();
    }
    function onBlur() {
      markHandled();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pagehide", cleanup);
    var probe = document.createElement("iframe");
    probe.style.display = "none";
    probe.setAttribute("aria-hidden", "true");
    probe.src = "nowledgemem://";
    document.body.appendChild(probe);
    setTimeout(function () {
      if (probe.parentNode) probe.parentNode.removeChild(probe);
      cleanup();
    }, 2500);
  }

  // Completion dialog built from the course root's localized data attributes.
  function createDoneModal(state) {
    var root = state.rootEl;
    var message = root.getAttribute("data-course-guide-done-message");
    if (!message) return null;
    var url = root.getAttribute("data-course-guide-mem-url") || "https://mem.nowledge.co";

    var modal = document.createElement("div");
    modal.className = "course-playground-done";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="course-playground-done-backdrop" data-course-guide-done-dismiss></div>' +
      '<div class="course-playground-done-dialog" role="dialog" aria-modal="true">' +
      '<p class="course-playground-done-message"></p>' +
      '<div class="course-playground-done-actions">' +
      '<a class="course-playground-done-open" target="_blank" rel="noopener"></a>' +
      '<button type="button" class="course-playground-done-confirm" data-course-guide-done-confirm></button>' +
      "</div></div>";

    var dialog = modal.querySelector(".course-playground-done-dialog");
    dialog.setAttribute("aria-label", message);
    modal.querySelector(".course-playground-done-message").textContent = message;
    var open = modal.querySelector(".course-playground-done-open");
    open.href = url;
    open.textContent = root.getAttribute("data-course-guide-open-mem-label") || url;
    modal.querySelector("[data-course-guide-done-confirm]").textContent =
      root.getAttribute("data-course-guide-confirm-label") || "OK";

    modal.addEventListener("click", function (event) {
      // Either action ends the simulation.
      if (event.target.closest(".course-playground-done-open")) {
        event.preventDefault();
        openMemApp(state);
        hideDoneModal(state);
        setWindowOpen(state, false);
        return;
      }
      if (event.target.closest("[data-course-guide-done-confirm]")) {
        hideDoneModal(state);
        setWindowOpen(state, false);
        return;
      }
      if (event.target.closest("[data-course-guide-done-dismiss]")) {
        hideDoneModal(state);
      }
    });
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        hideDoneModal(state);
      }
    });
    document.body.appendChild(modal);
    return modal;
  }

  function handleClick(state, event) {
    var target = event.target;
    if (!target.closest) return;

    var launch = target.closest("[data-course-guide-open]");
    if (launch && state.rootEl.contains(launch)) {
      if (window.innerWidth < 1024) return; // simulation is desktop-only
      if (state.open) {
        setWindowOpen(state, false);
      } else {
        if (state.step >= 4) state.step = 1;
        hideDoneModal(state);
        setWindowOpen(state, true);
      }
      return;
    }

    var fill = target.closest("[data-course-guide-fill]");
    if (fill && (state.rootEl.contains(fill) || state.hintEl.contains(fill))) {
      fillExample(state, fill.getAttribute("data-course-guide-fill"));
      return;
    }

    var windowClose = target.closest("[data-course-guide-window-close]");
    if (windowClose && state.windowEl.contains(windowClose)) {
      setWindowOpen(state, false);
      return;
    }

    var miniRestore = target.closest("[data-course-guide-mini]");
    if (miniRestore && state.miniEl && miniRestore === state.miniEl) {
      setMinimized(state, false);
      return;
    }

    var timeline = target.closest('[data-mp-view="timeline"]');
    if (state.step === 1 && timeline && state.windowEl.contains(timeline)) {
      state.step = 2;
      render(state);
      return;
    }

    var send = target.closest("[data-mp-send]");
    var input = state.windowEl.querySelector("[data-mp-input]");
    if (state.step === 3 && send && input && input.value.trim()) {
      tryComplete(state, input);
    }
  }

  function handleInput(state, event) {
    if (!event.target.matches("[data-mp-input]") || state.step < 2 || state.step > 3) return;
    state.step = event.target.value.trim() ? 3 : 2;
    render(state);
  }

  function handleKeydown(state, event) {
    if (event.key === "Escape" && state.open) {
      event.preventDefault();
      setWindowOpen(state, false);
      return;
    }
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.matches("[data-course-guide-window-close]")
    ) {
      event.preventDefault();
      setWindowOpen(state, false);
      return;
    }
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.matches("[data-course-guide-mini]")
    ) {
      event.preventDefault();
      setMinimized(state, false);
      return;
    }
    if (
      state.step === 3 &&
      event.target.matches("[data-mp-input]") &&
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.isComposing &&
      event.target.value.trim()
    ) {
      tryComplete(state, event.target);
    }
  }

  // Small floating icon button on the right edge while the window is minimized.
  function createMiniChip(state) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "course-playground-mini";
    chip.setAttribute("data-course-guide-mini", "");
    chip.hidden = true;
    var label = state.rootEl.getAttribute("data-course-guide-mini-label") || "Playground";
    chip.setAttribute("aria-label", label);
    chip.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 15 3-3-3-3"/></svg>';
    chip.addEventListener("click", function () {
      setMinimized(state, false);
    });
    document.body.appendChild(chip);
    return chip;
  }

  function init(root) {
    if (states.has(root)) {
      var existing = states.get(root);
      prepareWindowControl(existing);
      positionWindow(existing);
      highlightTarget(existing);
      return;
    }

    // Move the window to <body>: it is fixed-positioned and docks beside the
    // article, independent of the course markup's place in the page.
    var windowEl = root.querySelector("[data-course-playground-window]");
    if (!windowEl) return;
    document.body.appendChild(windowEl);

    var hintEl = document.createElement("span");
    hintEl.className = "course-playground-hint";
    hintEl.hidden = true;
    document.body.appendChild(hintEl);

    var launchLabel = root.querySelector("[data-course-guide-open-label]");
    var state = {
      rootEl: root,
      windowEl: windowEl,
      hintEl: hintEl,
      modalEl: null,
      miniEl: null,
      changedEl: null,
      step: 1,
      open: false,
      minimized: false,
      startLabel: launchLabel ? launchLabel.textContent : "",
    };
    state.modalEl = createDoneModal(state);
    state.miniEl = createMiniChip(state);
    states.set(root, state);
    tracked.push(state);

    var onClick = function (event) { handleClick(state, event); };
    var onInput = function (event) { handleInput(state, event); };
    var onKeydown = function (event) { handleKeydown(state, event); };
    root.addEventListener("click", onClick, true);
    windowEl.addEventListener("click", onClick, true);
    hintEl.addEventListener("click", onClick, true);
    root.addEventListener("input", onInput, true);
    windowEl.addEventListener("input", onInput, true);
    root.addEventListener("keydown", onKeydown, true);
    windowEl.addEventListener("keydown", onKeydown, true);

    window.addEventListener("resize", function () {
      positionWindow(state);
      highlightTarget(state);
    });
    // The ringed control can move when the window's own content scrolls.
    windowEl.addEventListener(
      "scroll",
      function () {
        highlightTarget(state);
      },
      true
    );

    setWindowOpen(state, false, false);
  }

  function scan() {
    // Drop moved elements whose course root left the DOM (SPA navigation).
    for (var i = tracked.length - 1; i >= 0; i -= 1) {
      var state = tracked[i];
      if (!document.contains(state.rootEl)) {
        if (state.windowEl.parentNode) state.windowEl.parentNode.removeChild(state.windowEl);
        if (state.hintEl && state.hintEl.parentNode) state.hintEl.parentNode.removeChild(state.hintEl);
        if (state.modalEl && state.modalEl.parentNode) state.modalEl.parentNode.removeChild(state.modalEl);
        if (state.miniEl && state.miniEl.parentNode) state.miniEl.parentNode.removeChild(state.miniEl);
        tracked.splice(i, 1);
      }
    }

    var roots = document.querySelectorAll(ROOT_SELECTOR);
    for (var j = 0; j < roots.length; j += 1) init(roots[j]);
  }

  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(function () {
      scanTimer = null;
      scan();
    }, 120);
  }

  window.addEventListener("resize", scheduleScan);
  new MutationObserver(scheduleScan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleScan, { once: true });
  } else {
    scheduleScan();
  }
})();
