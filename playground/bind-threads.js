(window.NMemModules = window.NMemModules || []).push(["playground/bind-threads.js", function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};
  var renderThreadList = G.renderThreadList, copyText = G.copyText, icon = G.icon, esc = G.esc;
  G.bindThreads = function (context) {
  var mount = context.mount, L = context.L, state = context.state, input = context.input, send = context.send, memQ = context.memQ, memGo = context.memGo, thrQ = context.thrQ, thrGo = context.thrGo, globalPanel = context.globalPanel, globalQ = context.globalQ, globalResults = context.globalResults;
    var setView = context.setView, submit = context.submit, rerenderAll = context.rerenderAll, requestCreateClose = context.requestCreateClose, finishCreateDialog = context.finishCreateDialog, closeGlobalSearch = context.closeGlobalSearch, setDrawer = context.setDrawer, renderGlobalResults = context.renderGlobalResults;
    var thrQ = mount.querySelector("[data-mp-thr-q]");
    var thrGo = mount.querySelector("[data-mp-thr-go]");

    thrQ.addEventListener("input", function () {
      state.threads.q = thrQ.value;
      thrGo.disabled = !thrQ.value.trim();
      thrGo.hidden = false;
      mount.querySelector("[data-mp-thr-clear]").hidden = false;
    });

    thrQ.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        state.threads.q = thrQ.value;
        state.threads.appliedQ = thrQ.value;
        renderThreadList(mount, L, state);
      }
      if (event.key === "Escape" && (thrQ.value || state.threads.appliedQ)) {
        state.threads.q = "";
        state.threads.appliedQ = "";
        thrQ.value = "";
        thrGo.disabled = true;
        renderThreadList(mount, L, state);
      }
    });


    mount.addEventListener("click", function (event) {
      var target = event.target.closest ? event.target.closest("[data-mp-thread-open], [data-mp-thread-back], [data-mp-message-jump], [data-mp-thread-info], [data-mp-thread-memory], [data-mp-thread-filter-option], [data-mp-thr-clear], [data-mp-thr-go], [data-mp-trefresh], [data-mp-tcopy], [data-mp-tpin], [data-mp-tdel]") : null;
      if (!target || !mount.contains(target)) return;
      if (target.hasAttribute("data-mp-thread-open")) {
        state.threads.selected = state.threads.list[Number(target.getAttribute("data-mp-thread-open"))];
        state.threads.infoOpen = false;
        renderThreadList(mount, L, state);
        mount.querySelector("[data-mp-thread-back]").focus({preventScroll:true});
        return;
      }
      if (target.hasAttribute("data-mp-thread-back")) {
        var threadOpenIndex = state.threads.list.indexOf(state.threads.selected);
        state.threads.selected = null;
        state.threads.infoOpen = false;
        renderThreadList(mount, L, state);
        var threadOpenButton = mount.querySelector('[data-mp-thread-open="' + threadOpenIndex + '"]');
        if (threadOpenButton) threadOpenButton.focus({preventScroll:true});
        return;
      }
      if (target.hasAttribute("data-mp-message-jump")) {
        var messageIndex = target.getAttribute("data-mp-message-jump");
        var message = mount.querySelector('[data-message-index="' + messageIndex + '"]');
        if (message) message.scrollIntoView({block:"nearest",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
        var messageMarkers = mount.querySelectorAll("[data-mp-message-jump]");
        for (var markerIndex = 0; markerIndex < messageMarkers.length; markerIndex++) {
          var currentMarker = messageMarkers[markerIndex] === target;
          messageMarkers[markerIndex].classList.toggle("mp-current", currentMarker);
          if (currentMarker) messageMarkers[markerIndex].setAttribute("aria-current", "step");
          else messageMarkers[markerIndex].removeAttribute("aria-current");
        }
        return;
      }
      if (target.hasAttribute("data-mp-thread-info")) {
        state.threads.infoOpen = !state.threads.infoOpen;
        renderThreadList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-thread-memory")) {
        state.mem.selected = state.mem.list[Number(target.getAttribute("data-mp-thread-memory"))];
        setView("memories");
        return;
      }
      if (target.hasAttribute("data-mp-thread-filter-option")) {
        var threadFilter = target.getAttribute("data-mp-thread-filter-option");
        if (threadFilter === "favorites") {
          state.threads.scope = "favorites";
          state.threads.source = "all";
        } else {
          state.threads.scope = "all";
          state.threads.source = threadFilter === "all" ? "all" : threadFilter.slice(7);
        }
        target.closest("details").open = false;
        renderThreadList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-thr-clear")) {
        state.threads.q = "";
        state.threads.appliedQ = "";
        thrQ.value = "";
        thrGo.disabled = true;
        renderThreadList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-thr-go")) {
        if (!target.disabled) {
          state.threads.q = thrQ.value;
          state.threads.appliedQ = thrQ.value;
          renderThreadList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-trefresh")) {
        state.threads.q = "";
        state.threads.appliedQ = "";
        state.threads.scope = "all";
        state.threads.source = "all";
        state.threads.selected = null;
        state.threads.infoOpen = false;
        thrQ.value = "";
        thrGo.disabled = true;
        renderThreadList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-tcopy")) {
        if (target.classList.contains("mp-copied")) return;
        var threadIndex = Number(target.getAttribute("data-mp-tcopy"));
        var copiedThread = state.threads.list[threadIndex];
        if (!copiedThread) return;
        var copyButtonHtml = target.innerHTML;
        copyText("nowledgemem://thread/demo-" + (threadIndex + 1)).then(function () {
          target.classList.add("mp-copied");
          target.innerHTML = icon("check") + '<span>' + esc(L.threadView.copied) + '</span>';
          target.setAttribute("aria-label", L.threadView.copied);
          setTimeout(function () {
            if (!target.isConnected) return;
            target.classList.remove("mp-copied");
            target.innerHTML = copyButtonHtml;
            target.setAttribute("aria-label", L.threadView.copyRef);
          }, 1200);
        }).catch(function () {
          target.setAttribute("aria-label", L.threadView.copyFailed);
        });
        return;
      }
      if (target.hasAttribute("data-mp-tpin")) {
        var pinnedThread = state.threads.list[Number(target.getAttribute("data-mp-tpin"))];
        if (pinnedThread) {
          pinnedThread.pinned = !pinnedThread.pinned;
          renderThreadList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-tdel")) {
        state.threads.list.splice(Number(target.getAttribute("data-mp-tdel")), 1);
        renderThreadList(mount, L, state);
        return;
      }

    });

  };
}]);
