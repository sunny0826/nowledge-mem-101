(window.NMemModules = window.NMemModules || []).push(["playground/bind-memories.js", function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};
  var renderMemList = G.renderMemList;
  G.bindMemories = function (context) {
  var mount = context.mount, L = context.L, state = context.state, input = context.input, send = context.send, memQ = context.memQ, memGo = context.memGo, thrQ = context.thrQ, thrGo = context.thrGo, globalPanel = context.globalPanel, globalQ = context.globalQ, globalResults = context.globalResults;
    var setView = context.setView, submit = context.submit, rerenderAll = context.rerenderAll, closeGlobalSearch = context.closeGlobalSearch, setDrawer = context.setDrawer, renderGlobalResults = context.renderGlobalResults;
    var memQ = mount.querySelector("[data-mp-mem-q]");
    var memGo = mount.querySelector("[data-mp-mem-go]");

    memQ.addEventListener("input", function () {
      state.mem.q = memQ.value;
      memGo.disabled = !memQ.value.trim();
      memGo.hidden = false;
      mount.querySelector("[data-mp-mem-clear]").hidden = false;
    });

    memQ.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        state.mem.q = memQ.value;
        state.mem.appliedQ = memQ.value;
        renderMemList(mount, L, state);
      }
      if (event.key === "Escape" && (memQ.value || state.mem.appliedQ)) {
        state.mem.q = "";
        state.mem.appliedQ = "";
        memQ.value = "";
        memGo.disabled = true;
        renderMemList(mount, L, state);
      }
    });


    mount.addEventListener("click", function (event) {
      var target = event.target.closest ? event.target.closest("[data-mp-mem-open], [data-mp-mem-back], [data-mp-mem-clear], [data-mp-mem-facet], [data-mp-mem-filter-option], [data-mp-mode], [data-mp-tier], [data-mp-mem-go], [data-mp-mem-refresh], [data-mp-rate], [data-mp-pin], [data-mp-del]") : null;
      if (!target || !mount.contains(target)) return;
      if (target.hasAttribute("data-mp-mem-open")) {
        state.mem.selected = state.mem.list[Number(target.getAttribute("data-mp-mem-open"))];
        renderMemList(mount, L, state);
        mount.querySelector(".mp-mem-detail-close").focus({preventScroll:true});
        return;
      }
      if (target.hasAttribute("data-mp-mem-back")) {
        var openIndex = state.mem.list.indexOf(state.mem.selected);
        state.mem.selected = null;
        renderMemList(mount, L, state);
        var openButton = mount.querySelector('[data-mp-mem-open="' + openIndex + '"]');
        if (openButton) openButton.focus({preventScroll:true});
        return;
      }
      if (target.hasAttribute("data-mp-mem-clear")) {
        state.mem.q = "";
        state.mem.appliedQ = "";
        memQ.value = "";
        memGo.disabled = true;
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-mem-facet")) {
        state.mem.filterFacet = target.getAttribute("data-mp-mem-facet");
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-mem-filter-option")) {
        var filterFacet = target.getAttribute("data-mp-mem-filter-option");
        var filterValue = target.getAttribute("data-mp-mem-filter-value");
        state.mem[filterFacet] = filterFacet === "importance" ? Number(filterValue) : filterValue;
        state.mem.filterFacet = "";
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-mode")) {
        state.mem.mode = target.getAttribute("data-mp-mode");
        state.mem.filterFacet = "";
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-tier")) {
        state.mem.tier = target.getAttribute("data-mp-tier");
        var tiers = mount.querySelectorAll("[data-mp-tier]");
        for (var k = 0; k < tiers.length; k++) {
          tiers[k].classList.toggle("mp-on", tiers[k] === target);
          tiers[k].setAttribute("aria-checked", String(tiers[k] === target));
        }
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-mem-go")) {
        if (!target.disabled) {
          state.mem.q = memQ.value;
          state.mem.appliedQ = memQ.value;
          renderMemList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-mem-refresh")) {
        state.mem.q = "";
        state.mem.appliedQ = "";
        state.mem.mode = "normal";
        state.mem.tier = "active";
        state.mem.type = "all";
        state.mem.source = "all";
        state.mem.importance = 3;
        state.mem.filterFacet = "";
        state.mem.selected = null;
        memQ.value = "";
        memGo.disabled = true;
        var tierBtns = mount.querySelectorAll("[data-mp-tier]");
        for (var p = 0; p < tierBtns.length; p++) {
          var activeTier = tierBtns[p].getAttribute("data-mp-tier") === "active";
          tierBtns[p].classList.toggle("mp-on", activeTier);
          tierBtns[p].setAttribute("aria-checked", String(activeTier));
        }
        renderMemList(mount, L, state);
        return;
      }
      if (target.hasAttribute("data-mp-rate")) {
        var parts = target.getAttribute("data-mp-rate").split(":");
        var rowIdx = Number(parts[0]);
        var star = Number(parts[1]);
        var rated = state.mem.list[rowIdx];
        if (rated) {
          rated.rating = rated.rating === star ? 0 : star;
          renderMemList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-pin")) {
        var pinnedRow = state.mem.list[Number(target.getAttribute("data-mp-pin"))];
        if (pinnedRow) {
          pinnedRow.pinned = !pinnedRow.pinned;
          renderMemList(mount, L, state);
        }
        return;
      }
      if (target.hasAttribute("data-mp-del")) {
        state.mem.list.splice(Number(target.getAttribute("data-mp-del")), 1);
        renderMemList(mount, L, state);
        return;
      }

    });

  };
}]);
