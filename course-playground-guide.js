(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) { module.exports = require("./course-playground-guide-core.js"); return; }
  (root.NMemModules = root.NMemModules || []).push(["course-playground-guide.js", function () {
    factory(root.NMemCourseGuide);
  }]);
})(typeof globalThis !== "undefined" ? globalThis : this, function (G) {
  "use strict";
  var ROOT_SELECTOR = G.ROOT_SELECTOR, MIN_DOCK_WIDTH = G.MIN_DOCK_WIDTH, prepareAiPractice = G.prepareAiPractice, spec = G.spec, targetForStep = G.targetForStep, positionWindow = G.positionWindow, renderHint = G.renderHint, placeHint = G.placeHint, highlightTarget = G.highlightTarget, updateCourseSteps = G.updateCourseSteps, render = G.render, prepareWindowControl = G.prepareWindowControl, setMinimized = G.setMinimized, setWindowOpen = G.setWindowOpen, markChange = G.markChange, showDoneModal = G.showDoneModal, hideDoneModal = G.hideDoneModal, tryComplete = G.tryComplete, fillExample = G.fillExample, openMemApp = G.openMemApp, createDoneModal = G.createDoneModal;
  var states = new WeakMap();
  var tracked = [];
  var scanTimer = null;
  function handleAiAction(state,event) {
    if (!spec(state).actions || !state.open) return;
    if (event.detail.type === 'ai-ready') {prepareAiPractice(state);render(state);return;}
    var action=spec(state).actions[state.step-1];
    if (!action || action[1]!==event.detail.type || action[2] && action[2]!==event.detail.kind) return;
    state.step+=1;
    if(state.step>spec(state).steps){
      markChange(state);
      clearTimeout(state.doneTimer);
      state.doneTimer=setTimeout(function(){if(state.open&&document.contains(state.rootEl))showDoneModal(state);},5000);
    }
    render(state);
  }


  function startPractice(state) {
    if (window.innerWidth < 1024) return;
    state.autoStarted = true;
    if (state.step > spec(state).steps) {state.step = 1;state.aiSeeded=false;}
    hideDoneModal(state);
    clearTimeout(state.doneTimer);
    prepareAiPractice(state);
    setWindowOpen(state, true);
  }

  function autoStartPractice(state) {
    var handoff = window.location.hash === "#simulation";
    var onEntry = state.rootEl.getAttribute("data-course-guide-autostart") === "true" && !state.autoStarted;
    if ((!handoff && !onEntry) || window.innerWidth < 1024) return;
    var mount = state.windowEl.querySelector('[data-mem-playground]');
    if (!mount || !mount.mpAPI || (spec(state).actions && !mount.hasAttribute('data-mp-ai-ready'))) return;
    if (handoff) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    startPractice(state);
    var target = targetForStep(state, state.step);
    if (target) target.focus();
  }

  function handleClick(state, event) {
    var target = event.target;
    if (!target.closest) return;

    var launch = target.closest("[data-course-guide-open]");
    if (launch && state.rootEl.contains(launch)) {
      if (window.innerWidth < 1024) return;
      if (state.open) {
        setWindowOpen(state, false);
      } else {
        state.scenario = state.rootEl.getAttribute("data-course-guide-scenario") || "save";
        state.step = 1;
        startPractice(state);
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

    if (spec(state).actions) return;

    var viewNav = target.closest("[data-mp-view]");
    if (viewNav && state.windowEl.contains(viewNav)) {
      var navSel = '[data-mp-view="' + viewNav.getAttribute("data-mp-view") + '"]';
      var navSpec = spec(state);
      if (navSpec.targets[state.step] === navSel) {
        if (state.step === navSpec.steps) {
          state.step = navSpec.steps + 1;
          setTimeout(function () {
            markChange(state);
            render(state);
          }, 60);
          setTimeout(function () {
            showDoneModal(state);
          }, 5000);
        } else {
          state.step += 1;
          render(state);
        }
        return;
      }
    }

    var memoryActions = target.closest("[data-mp-memory-actions]");
    if (memoryActions && state.scenario === "save" && state.step === 2) {
      state.step += 1;
      render(state);
      return;
    }

    var addMemory = target.closest("[data-mp-add-memory]");
    if (addMemory && state.scenario === "save" && state.step === 3) {
      state.step += 1;
      render(state);
      return;
    }

    if (state.scenario === "library") {
      var libSend = target.closest("[data-mp-send]");
      var libInput = state.windowEl.querySelector("[data-mp-input]");
      if (libSend && libInput && libInput.value.trim()) {
        librarySendAdvance(state, libInput);
      }
      return;
    }

    if (state.scenario === "threads") {
      var thrGo = target.closest("[data-mp-thr-go]");
      var thrInput = state.windowEl.querySelector("[data-mp-thr-q]");
      if (state.step === 3 && thrGo && !thrGo.disabled && thrInput && thrInput.value.trim()) {
        setTimeout(function () {
          if (state.step === 3 && state.windowEl.querySelector("[data-mp-thread-open]")) {
            state.step += 1;
            render(state);
          }
        }, 0);
        return;
      }
      var threadOpen = target.closest("[data-mp-thread-open]");
      if (state.step === 4 && threadOpen) {
        state.step += 1;
        setTimeout(function () {
          markChange(state);
          render(state);
        }, 60);
        setTimeout(function () {
          showDoneModal(state);
        }, 5000);
      }
      return;
    }

    var send = target.closest("[data-mp-send]");
    var input = state.windowEl.querySelector("[data-mp-input]");
    if (!send || !input || !input.value.trim()) return;
    if (state.step === spec(state).steps) {
      tryComplete(state, input);
      return;
    }
    if (spec(state).targets[state.step] === "[data-mp-send]") {
      midSendAdvance(state, input);
    }
  }

  function midSendAdvance(state, input) {
    setTimeout(function () {
      var landed =
        input.value === "" || state.windowEl.querySelector(".mp-answer");
      if (landed && spec(state).targets[state.step] === "[data-mp-send]") {
        state.step += 1;
        render(state);
      }
    }, 60);
  }

  function librarySendAdvance(state, input) {
    setTimeout(function () {
      if (state.step === 2 && input.value === "") {
        var waitStart = Date.now();
        var poll = setInterval(function () {
          var first = state.windowEl.querySelector(
            "[data-mp-lib-list] .mp-lib-row [data-mp-lib-status]"
          );
          if (
            (first && first.getAttribute("data-mp-lib-status") === "indexed") ||
            Date.now() - waitStart > 6000
          ) {
            clearInterval(poll);
            if (state.step === 2) {
              state.step = 3;
              render(state);
            }
          }
        }, 250);
      } else if (
        state.step === 4 &&
        state.windowEl.querySelector(".mp-answer")
      ) {
        state.step = 5;
        render(state);
      }
    }, 60);
  }

  function handleInput(state, event) {
    if (spec(state).actions) {
      if(!event.target.matches('[data-mp-ai-input]'))return;
      var actions=spec(state).actions;
      if(actions[state.step-1] && actions[state.step-1][0]==='fill' && event.target.value.trim()){state.step+=1;render(state);}
      else if(actions[state.step-2] && actions[state.step-2][0]==='fill' && !event.target.value.trim()){state.step-=1;render(state);}
      return;
    }
    if (state.scenario === "threads") {
      if (!event.target.matches("[data-mp-thr-q]") || state.step < 2 || state.step > 3) return;
      state.step = event.target.value.trim() ? 3 : 2;
      render(state);
      return;
    }
    if (!event.target.matches("[data-mp-input]")) return;
    var t = spec(state).targets;
    if (t[state.step] === "[data-mp-input]" && event.target.value.trim()) {
      state.step += 1;
      render(state);
      return;
    }
    if (t[state.step - 1] === "[data-mp-input]" && !event.target.value.trim()) {
      state.step -= 1;
      render(state);
    }
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
    if (spec(state).actions) return;
    if (
      state.scenario === "threads" &&
      state.step === 3 &&
      event.target.matches("[data-mp-thr-q]") &&
      event.key === "Enter" &&
      !event.isComposing &&
      event.target.value.trim()
    ) {
      setTimeout(function () {
        if (state.step === 3 && state.windowEl.querySelector("[data-mp-thread-open]")) {
          state.step += 1;
          render(state);
        }
      }, 0);
      return;
    }
    if (
      state.scenario === "library" &&
      (state.step === 2 || state.step === 4) &&
      event.target.matches("[data-mp-input]") &&
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.isComposing &&
      event.target.value.trim()
    ) {
      librarySendAdvance(state, event.target);
      return;
    }
    if (
      state.scenario !== "threads" &&
      state.scenario !== "library" &&
      event.target.matches("[data-mp-input]") &&
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.isComposing &&
      event.target.value.trim()
    ) {
      if (state.step === spec(state).steps) {
        tryComplete(state, event.target);
      } else if (spec(state).targets[state.step] === "[data-mp-send]") {
        midSendAdvance(state, event.target);
      }
    }
  }

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
      scenario: root.getAttribute("data-course-guide-scenario") || "save",
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
    windowEl.addEventListener("mp:action", function(event){handleAiAction(state,event);});

    state.onResize = function () {
      positionWindow(state);
      highlightTarget(state);
    };
    window.addEventListener("resize", state.onResize);
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
    for (var i = tracked.length - 1; i >= 0; i -= 1) {
      var state = tracked[i];
      if (!document.contains(state.rootEl)) {
        state.open = false;
        clearTimeout(state.doneTimer);
        window.removeEventListener("resize", state.onResize);
        positionWindow(state);
        if (state.windowEl.parentNode) state.windowEl.parentNode.removeChild(state.windowEl);
        if (state.hintEl && state.hintEl.parentNode) state.hintEl.parentNode.removeChild(state.hintEl);
        if (state.modalEl && state.modalEl.parentNode) state.modalEl.parentNode.removeChild(state.modalEl);
        if (state.miniEl && state.miniEl.parentNode) state.miniEl.parentNode.removeChild(state.miniEl);
        tracked.splice(i, 1);
      }
    }

    var roots = document.querySelectorAll(ROOT_SELECTOR);
    for (var j = 0; j < roots.length; j += 1) init(roots[j]);
    tracked.forEach(autoStartPractice);
  }

  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(function () {
      scanTimer = null;
      scan();
    }, 120);
  }

  window.addEventListener("resize", scheduleScan);
  window.addEventListener("hashchange", scheduleScan);
  new MutationObserver(scheduleScan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleScan, { once: true });
  } else {
    scheduleScan();
  }
});
