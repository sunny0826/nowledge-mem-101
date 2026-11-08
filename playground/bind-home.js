(function () {
  "use strict";
  var G = window.NMemPlayground;
  var renderTimeline = G.renderTimeline, nowHM = G.nowHM, esc = G.esc, icon = G.icon;
  G.bindHome = function (context) {
  var mount = context.mount, L = context.L, state = context.state, input = context.input, send = context.send, memQ = context.memQ, memGo = context.memGo, thrQ = context.thrQ, thrGo = context.thrGo, globalPanel = context.globalPanel, globalQ = context.globalQ, globalResults = context.globalResults;
    var setView = context.setView, submit = context.submit, rerenderAll = context.rerenderAll, requestCreateClose = context.requestCreateClose, finishCreateDialog = context.finishCreateDialog, closeGlobalSearch = context.closeGlobalSearch, setDrawer = context.setDrawer, renderGlobalResults = context.renderGlobalResults;
    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }
      event.preventDefault();
      submit();
    });

    input.addEventListener("input", function () {
      send.disabled = !input.value.trim();
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    });

    mount.querySelector("[data-mp-capture-form]").addEventListener("submit", function (event) {
      event.preventDefault();
      submit();
    });

    mount.querySelector("[data-mp-home-q]").addEventListener("input", function () {
      state.homeQuery = this.value;
      renderTimeline(mount, L, state);
    });


    mount.addEventListener("click", function (event) {
      var target = event.target.closest ? event.target.closest("[data-mp-filter], [data-mp-close], [data-mp-send], [data-mp-view], [data-mp-global-search], [data-mp-global-close], [data-mp-global-view], [data-mp-paper], [data-mp-more], [data-mp-drawer-close], [data-mp-workspace], [data-mp-library-toggle], [data-mp-memory-actions], [data-mp-add-memory], [data-mp-suggestion]") : null;
      if (!target || !mount.contains(target)) return;
      if (target.hasAttribute("data-mp-paper")) {
        state.paperOffset += 1;
        mount.querySelector("[data-mp-paper-art]").innerHTML = window.NMemHome.render(new Date(), state.paperOffset, L.nextPaperStyle);
        return;
      }
      if (target.hasAttribute("data-mp-global-search")) {
        globalPanel.hidden = false;
        renderGlobalResults();
        globalQ.focus();
        return;
      }
      if (target.hasAttribute("data-mp-global-close")) {
        closeGlobalSearch();
        return;
      }
      if (target.hasAttribute("data-mp-global-view")) {
        setView(target.getAttribute("data-mp-global-view"));
        closeGlobalSearch();
        return;
      }
      if (target.hasAttribute("data-mp-more")) {
        setDrawer(!mount.querySelector(".mp-shell").classList.contains("mp-drawer-open"));
        return;
      }
      if (target.hasAttribute("data-mp-drawer-close")) {
        setDrawer(false);
        return;
      }
      if (target.hasAttribute("data-mp-library-toggle")) {
        var libraryChildren = mount.querySelector("[data-mp-library-children]");
        libraryChildren.hidden = !libraryChildren.hidden;
        libraryChildren.setAttribute("data-open", String(!libraryChildren.hidden));
        target.setAttribute("aria-expanded", String(!libraryChildren.hidden));
        return;
      }
      if (target.hasAttribute("data-mp-workspace")) {
        var workspaceMenu = mount.querySelector("[data-mp-workspace-menu]");
        workspaceMenu.hidden = !workspaceMenu.hidden;
        target.setAttribute("aria-expanded", String(!workspaceMenu.hidden));
        return;
      }
      if (target.hasAttribute("data-mp-memory-actions")) {
        var addMenu = mount.querySelector("[data-mp-add-menu]");
        addMenu.hidden = !addMenu.hidden;
        target.setAttribute("aria-expanded", String(!addMenu.hidden));
        return;
      }
      if (target.hasAttribute("data-mp-add-memory")) {
        mount.querySelector("[data-mp-add-menu]").hidden = true;
        mount.querySelector(".mp-capture-wrap").classList.add("mp-expanded");
        input.placeholder = L.placeholder;
        input.setAttribute("aria-label", L.placeholder);
        input.focus();
        return;
      }
      if (target.hasAttribute("data-mp-suggestion")) {
        input.value = L.suggestions[Number(target.getAttribute("data-mp-suggestion"))];
        input.dispatchEvent(new Event("input", {bubbles:true}));
        mount.querySelector("[data-mp-add-menu]").hidden = true;
        input.focus();
        return;
      }
      if (target.hasAttribute("data-mp-send")) {
        if (!target.disabled) {
          submit();
        }
        return;
      }
      if (target.hasAttribute("data-mp-close")) {
        state.answer = null;
        renderAnswer(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-filter")) {
        state.filter = target.getAttribute("data-mp-filter");
        var tabs = mount.querySelectorAll("[data-mp-filter]");
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].classList.toggle("mp-on", tabs[j] === target);
          tabs[j].setAttribute("aria-pressed", String(tabs[j] === target));
        }
        renderTimeline(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-view")) {
        setView(target.getAttribute("data-mp-view"));
        return;
      }

    });

    globalQ.addEventListener("input", renderGlobalResults);
    globalQ.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeGlobalSearch();
    });

  };
})();
