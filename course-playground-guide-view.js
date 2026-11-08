(function () {
  "use strict";
  var G = window.NMemCourseGuide;
  var ROOT_SELECTOR = G.ROOT_SELECTOR, MIN_DOCK_WIDTH = G.MIN_DOCK_WIDTH, SCENARIOS = G.SCENARIOS;
  function spec(state) {
    return SCENARIOS[state.scenario] || SCENARIOS.save;
  }

  function targetForStep(state, step) {
    var selector = spec(state).targets[step];
    var el = state.windowEl.querySelector(selector);
    if (el && selector === "[data-mp-input]") el = el.closest(".mp-capture") || el;
    if (el && selector === "[data-mp-thr-q]") el = el.closest(".mp-mem-search") || el;
    return el;
  }

  function positionWindow(state) {
    var playgroundWindow = state.windowEl;
    var content = document.getElementById("content");
    var html = document.documentElement;

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
      playgroundWindow.style.right = "";
      playgroundWindow.style.width = "";
      html.removeAttribute("data-course-playground-split");
      html.style.removeProperty("--course-practice-article-width");
      html.style.removeProperty("--course-practice-article-offset");
      if (content) {
        content.style.marginLeft = "";
        content.style.maxWidth = "";
      }
    }

    reset();
    if (!wantDocked) return;

    var vw = document.documentElement.clientWidth;
    var edge = 24;
    var gap = vw >= 1600 ? 32 : 24;
    var available = vw - edge * 2 - gap;
    var articleWidth = Math.max(416, Math.min(704, available * 0.36));
    var width = Math.min(1280, available - articleWidth);
    var area = document.getElementById("content-area");
    if (width < MIN_DOCK_WIDTH || !area) return;

    var workspaceWidth = articleWidth + gap + width;
    var articleLeft = (vw - workspaceWidth) / 2;
    html.setAttribute("data-course-playground-split", "true");
    html.style.setProperty("--course-practice-article-width", articleWidth + "px");
    html.style.setProperty("--course-practice-article-offset", "0px");
    var areaLeft = area.getBoundingClientRect().left;
    html.style.setProperty("--course-practice-article-offset", articleLeft - areaLeft + "px");
    playgroundWindow.style.left = articleLeft + articleWidth + gap + "px";
    playgroundWindow.style.right = "auto";
    playgroundWindow.style.width = width + "px";
  }

  var FILL_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>';

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
    var value =
      state.rootEl.getAttribute("data-course-guide-fillable-" + state.step) ||
      state.rootEl.getAttribute("data-course-guide-fillable");
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
    if (top + hint.offsetHeight > windowRect.bottom - 8) {
      top = targetRect.top - hint.offsetHeight - 10;
    }
    hint.style.top = top + "px";
  }

  function highlightTarget(state) {
    var hintPrefix = "data-course-guide-hint-";
    var previous = state.windowEl.querySelector("[data-course-guide-target]");
    if (previous) previous.removeAttribute("data-course-guide-target");

    var hint = state.hintEl;
    if (!state.open || state.minimized) {
      if (hint) hint.hidden = true;
      return;
    }

    if (state.step > spec(state).steps) {
      var changedText =
        state.changedEl &&
        state.rootEl.getAttribute(hintPrefix + (spec(state).steps + 1));
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

    var text = state.rootEl.getAttribute(hintPrefix + state.step);
    if (!hint || !text) return;
    renderHint(state, text, spec(state).fillSteps.indexOf(state.step) !== -1);
    placeHint(state, target);
  }

  function updateCourseSteps(state) {
    for (var step = 1; step <= spec(state).steps; step += 1) {
      var anchor = state.rootEl.querySelector('[data-course-guide-source="' + step + '"]');
      var item = anchor && anchor.closest('[role="listitem"]');
      if (!item) continue;
      item.classList.toggle("course-playground-source-active", state.open && step === state.step);
      item.classList.toggle("course-playground-source-complete", step < state.step);
    }
  }

  function render(state) {
    var root = state.rootEl;
    var stepCount = spec(state).steps;
    root.setAttribute("data-course-guide-current", String(state.step));
    if (state.step <= stepCount && state.changedEl) {
      state.changedEl.removeAttribute("data-course-guide-changed");
      state.changedEl = null;
    }
    if (state.open && state.renderedStep !== undefined && state.step !== state.renderedStep) {
      var syncAnchor = root.querySelector(
        '[data-course-guide-source="' + Math.min(state.step, stepCount) + '"]'
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
    if (ready) ready.hidden = state.step > stepCount;
    if (done) done.hidden = state.step <= stepCount;

    var launchLabel = root.querySelector("[data-course-guide-open-label]");
    if (launchLabel) {
      if (state.open) {
        launchLabel.textContent = root.getAttribute("data-course-guide-close-label");
      } else if (state.step > stepCount) {
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
    if(!open)clearTimeout(state.doneTimer);
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

  function markChange(state) {
    var entry = state.windowEl.querySelector(spec(state).changed);
    state.changedEl = entry || null;
    if (entry) {
      entry.setAttribute("data-course-guide-changed", "");
      entry.scrollIntoView({ block: "nearest" });
    }
  }

  function showDoneModal(state) {
    var modal = state.modalEl;
    if (!modal || state.step <= spec(state).steps) return;
    modal.hidden = false;
    var confirm = modal.querySelector("[data-course-guide-done-confirm]");
    if (confirm) confirm.focus();
  }

  function hideDoneModal(state) {
    if (state.modalEl) state.modalEl.hidden = true;
  }

  function tryComplete(state, input) {
    setTimeout(function () {
      var mode = spec(state).completion;
      if (mode === "answer") {
        if (!state.windowEl.querySelector(".mp-answer")) return;
      } else if (input.value !== "") {
        return;
      }
      state.step = spec(state).steps + 1;
      markChange(state);
      render(state);
      setTimeout(function () {
        showDoneModal(state);
      }, 5000);
    }, 40);
  }

  function fillExample(state, value) {
    var input = state.windowEl.querySelector(spec(state).targets[state.step]);
    if (!input || !value) return;
    if (!state.open) setWindowOpen(state, true);
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    render(state);
    setTimeout(function () {
      input.focus();
      input.setSelectionRange(value.length, value.length);
    }, 320);
  }

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
    var confirmHref = root.getAttribute("data-course-guide-confirm-href");
    modal.querySelector("[data-course-guide-done-confirm]").textContent =
      root.getAttribute("data-course-guide-confirm-label") || "OK";

    modal.addEventListener("click", function (event) {
      if (event.target.closest(".course-playground-done-open")) {
        event.preventDefault();
        openMemApp(state);
        hideDoneModal(state);
        setWindowOpen(state, false);
        return;
      }
      if (event.target.closest("[data-course-guide-done-confirm]")) {
        hideDoneModal(state);
        if (confirmHref) {
          setWindowOpen(state, false, false);
          window.location.assign(confirmHref);
        }
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


  Object.assign(G, {spec, targetForStep, positionWindow, renderHint, placeHint, highlightTarget, updateCourseSteps, render, prepareWindowControl, setMinimized, setWindowOpen, markChange, showDoneModal, hideDoneModal, tryComplete, fillExample, openMemApp, createDoneModal});
})();
