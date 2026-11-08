(function () {
  "use strict";
  var G = window.NMemPlayground;
  var esc = G.esc, icon = G.icon, appAsset = G.appAsset, appPageHeaderHtml = G.appPageHeaderHtml, sourceIconHtml = G.sourceIconHtml, appPaginationHtml = G.appPaginationHtml;
  function memFilterCount(state) {
    return (state.mem.type !== "all" ? 1 : 0) + (state.mem.source !== "all" ? 1 : 0) + (state.mem.importance > 3 ? 1 : 0) + (state.mem.mode !== "normal" ? 1 : 0);
  }

  function memFilterSummaryHtml(L, state) {
    var count = memFilterCount(state);
    return '<span>' + esc(L.memView.filterBtn) + '</span>' + (count ? '<span class="mp-filter-count">' + count + '</span>' : "") + appAsset("memories", "filter-chevron");
  }

  function memFilterMenuHtml(L, state) {
    var V = L.memView;
    var facet = state.mem.filterFacet;
    if (!facet) {
      var typeLabel = state.mem.type === "all" ? V.allTypes : V.units[state.mem.type];
      var sourceLabel = state.mem.source === "all" ? V.allSources : state.mem.source;
      var importanceLabel = state.mem.importance === 3 ? V.anyImportance : V.importanceAtLeast(state.mem.importance);
      function row(name, label, value, disabled) {
        return '<button type="button" class="mp-filter-option" data-mp-mem-facet="' + name + '"' + (disabled ? ' disabled title="' + esc(L.unsupported) + '"' : "") + '><span>' + esc(label) + '</span><span class="mp-filter-option-value">' + esc(value) + '</span>' + (disabled ? "" : icon("chevron")) + '</button>';
      }
      return row("type", V.filters.type, typeLabel, false) + row("time", V.filters.time, V.anyTime, true) + row("source", V.filters.source, sourceLabel, false) + row("confidence", V.filters.confidence, V.allTypes, true) + row("importance", V.filters.importance, importanceLabel, false) + row("labels", V.filters.labels, V.allTypes, true) + row("mode", V.filters.mode, state.mem.mode === "deep" ? V.deep : V.normal, false);
    }
    var options = [];
    if (facet === "type") options = [["all", V.allTypes]].concat(Object.keys(V.units).map(function (unit) { return [unit, V.units[unit]]; }));
    if (facet === "source") {
      var sources = [];
      state.mem.list.forEach(function (memory) { if (sources.indexOf(memory.source) === -1) sources.push(memory.source); });
      options = [["all", V.allSources]].concat(sources.map(function (source) { return [source, source]; }));
    }
    if (facet === "importance") options = [[3, V.anyImportance], [4, V.importanceAtLeast(4)], [5, V.importanceAtLeast(5)]];
    if (facet === "mode") options = [["normal", V.normal], ["deep", V.deep]];
    var current = facet === "mode" ? state.mem.mode : state.mem[facet];
    return '<button type="button" class="mp-filter-option mp-filter-back" data-mp-mem-facet="">' + icon("chevron") + '<span>' + esc(V.filters[facet]) + '</span></button>' + options.map(function (option) {
      var selected = String(current) === String(option[0]);
      var attribute = facet === "mode" ? 'data-mp-mode="' + option[0] + '"' : 'data-mp-mem-filter-option="' + facet + '" data-mp-mem-filter-value="' + esc(option[0]) + '"';
      return '<button type="button" class="mp-filter-option" ' + attribute + ' aria-pressed="' + selected + '"><span>' + esc(option[1]) + '</span><span class="mp-filter-option-value">' + (selected ? appAsset("memories", "type-check") : "") + '</span></button>';
    }).join("");
  }

  function memPaneHtml(L) {
    var V = L.memView;
    var tiers = V.tiers.map(function (tier) {
      return '<button type="button" role="radio" aria-checked="' + (tier[0] === "active") + '" class="mp-mem-tier' + (tier[0] === "active" ? " mp-on" : "") + '" data-mp-tier="' + tier[0] + '">' + esc(tier[1]) + '</button>';
    }).join("");
    return '<div class="mp-pane mp-app-page mp-memories" data-mp-pane="memories" hidden><div class="mp-app-content">' +
      appPageHeaderHtml(V.title) +
      '<div class="mp-app-body"><div class="mp-app-tabs-row"><div class="mp-app-tabs" role="radiogroup" aria-label="' + esc(V.title) + '">' + tiers + '</div>' +
      '<div class="mp-app-search">' + icon("search") + '<input type="search" data-mp-mem-q placeholder="' + esc(V.searchPh) + '" aria-label="' + esc(V.searchPh) + '"><button type="button" class="mp-app-search-action" data-mp-mem-clear aria-label="' + esc(V.clearSearch) + '" hidden>×</button><button type="button" class="mp-app-search-action" data-mp-mem-go aria-label="' + esc(V.searchBtn) + '" title="' + esc(V.searchBtn) + '" hidden disabled>' + icon("search") + '</button></div></div>' +
      '<div class="mp-app-toolbar"><div class="mp-app-toolbar-group"><details class="mp-app-filter" data-mp-mem-filter><summary>' + memFilterSummaryHtml(L, {mem:{type:"all",source:"all",importance:3,mode:"normal"}}) + '</summary><div class="mp-filter-menu" data-mp-mem-filter-menu></div></details><span class="mp-app-count" role="status">' + esc(V.results) + ' · <b data-mp-mem-count></b></span></div>' +
      '<div class="mp-app-toolbar-group"><button type="button" class="mp-app-button mp-app-button-outline" data-mp-mem-refresh>' + appAsset("memories", "sync") + '<span>' + esc(V.refresh) + '</span></button><button type="button" class="mp-app-button" data-mp-mem-create disabled title="' + esc(L.unsupported) + '">' + appAsset("memories", "plus") + '<span>' + esc(V.createBtn) + '</span></button></div></div>' +
      '<div class="mp-mem-list" data-mp-mem-list></div><div data-mp-mem-pages></div></div>' +
      '<aside class="mp-mem-detail" data-mp-mem-detail></aside></div></div>';
  }

  function memRowHtml(L, memory, index) {
    var V = L.memView;
    var stars = "";
    for (var s = 1; s <= 5; s++) {
      stars += '<button type="button" data-mp-rate="' + index + ':' + s + '" aria-label="' + esc(V.star) + ' ' + s + '/5">' + appAsset("memories", s <= memory.rating ? "importance" : "importance-empty", false) + '</button>';
    }
    var tags = memory.tags.map(function (tag) {
      return '<span class="mp-app-tag mp-app-tag-label" title="' + esc(tag) + '"><span>' + esc(tag) + '</span></span>';
    }).join("");
    return '<article class="mp-mem-row">' +
      '<div class="mp-mem-row-main"><div class="mp-mem-copy"><div class="mp-mem-heading"><h3><button type="button" class="mp-mem-open" data-mp-mem-open="' + index + '">' + esc(memory.title) + '</button></h3>' +
      '<details class="mp-mem-rating-wrap"><summary class="mp-mem-rating" aria-label="' + esc(V.filters.importance) + ': ' + memory.rating + '/5">' + appAsset("memories", "importance", false) + '<span>' + memory.rating + '</span></summary><div class="mp-mem-rating-menu">' + stars + '</div></details></div>' +
      '<p class="mp-mem-summary">' + esc(memory.text) + '</p></div><time class="mp-mem-time">' + esc(memory.ago) + '</time></div>' +
      '<div class="mp-mem-meta"><span class="mp-app-tag mp-app-tag-source" title="' + esc(memory.source) + '">' + sourceIconHtml(memory.source) + '<span>' + esc(memory.source) + '</span></span><span class="mp-app-tag mp-app-tag-type">' + appAsset("memories", "type-" + memory.unit) + '<span>' + esc(V.units[memory.unit] || memory.unit) + '</span></span>' + tags + '</div>' +
      '<div class="mp-mem-actions"><button type="button" class="mp-app-icon-button' + (memory.pinned ? " mp-on" : "") + '" data-mp-pin="' + index + '" aria-label="' + esc(V.pin) + '" aria-pressed="' + !!memory.pinned + '">' + icon("pin") + '</button><button type="button" class="mp-app-icon-button" data-mp-del="' + index + '" aria-label="' + esc(V.del) + '">' + icon("trash") + '</button></div></article>';
  }

  function memDetailHtml(L, memory, index) {
    var V = L.memView;
    var stars = "";
    for (var s = 1; s <= 5; s++) {
      stars += '<button type="button" data-mp-rate="' + index + ':' + s + '" aria-label="' + esc(V.star) + ' ' + s + '/5" aria-pressed="' + (s === memory.rating) + '">' + appAsset("memories", s <= memory.rating ? "importance" : "importance-empty", false) + '</button>';
    }
    var tags = memory.tags.length ? '<dt>' + esc(V.filters.labels) + '</dt><dd><div class="mp-mem-detail-tags">' + memory.tags.map(function (tag) {
      return '<span class="mp-mem-detail-tag">' + esc(tag) + '</span>';
    }).join("") + '</div></dd>' : "";
    return '<button type="button" class="mp-mem-detail-close" data-mp-mem-back aria-label="' + esc(V.closeDetails) + '">' + appAsset("memories", "create-close") + '</button>' +
      '<div class="mp-mem-detail-toolbar"></div><h2 class="mp-mem-detail-title">' + esc(memory.title) + '</h2>' +
      '<dl class="mp-mem-properties"><dt>' + esc(V.date) + '</dt><dd title="' + esc(memory.date || V.practiceDate) + '">' + esc(memory.date || V.practiceDate) + '</dd>' +
      '<dt>' + esc(V.filters.type) + '</dt><dd>' + appAsset("memories", "type-" + memory.unit) + '<span>' + esc(V.units[memory.unit] || memory.unit) + '</span>' + appAsset("memories", "type-chevron") + '</dd>' +
      '<dt>' + esc(V.agent) + '</dt><dd>' + sourceIconHtml(memory.source) + '<span>' + esc(memory.source) + '</span></dd>' +
      '<dt>' + esc(V.filters.importance) + '</dt><dd><div class="mp-mem-detail-rating">' + stars + '</div></dd>' + tags +
      '<dt>' + esc(V.storedIn) + '</dt><dd>' + esc(V.onlyMe) + '</dd>' +
      '<dt>' + esc(V.mentioned) + '</dt><dd><button type="button" class="mp-mem-detail-action" disabled title="' + esc(L.unsupported) + '">' + esc(V.findMentions) + '</button><button type="button" class="mp-mem-detail-action" disabled title="' + esc(L.unsupported) + '">' + esc(V.addProfile) + '</button></dd></dl>' +
      '<div class="mp-mem-detail-actionbar"><button type="button" class="mp-mem-detail-action" disabled title="' + esc(L.unsupported) + '">' + appAsset("memories", "action-edit") + '<span>' + esc(V.edit) + '</span></button><button type="button" class="mp-mem-detail-action" disabled title="' + esc(L.unsupported) + '">' + appAsset("memories", "action-access") + '<span>' + esc(V.access) + '</span></button>' +
      '<details class="mp-mem-detail-more"><summary class="mp-app-icon-button" aria-label="' + esc(V.moreActions) + '">⋯</summary><div class="mp-mem-detail-menu"><button type="button" data-mp-pin="' + index + '">' + icon("pin") + esc(memory.pinned ? V.unpin : V.pin) + '</button><button type="button" disabled title="' + esc(L.unsupported) + '">' + icon("network") + esc(V.knowledgeGraph) + '</button><button type="button" data-mp-del="' + index + '">' + icon("trash") + esc(V.del) + '</button></div></details></div>' +
      '<div class="mp-mem-detail-body">' + esc(memory.text) + '</div>';
  }

  function renderMemList(mount, L, state) {
    var V = L.memView;
    var q = (state.mem.appliedQ || "").trim().toLowerCase();
    var rows = [];
    for (var i = 0; i < state.mem.list.length; i++) {
      var memory = state.mem.list[i];
      if (state.mem.tier === "active" && memory.archived) continue;
      if (state.mem.tier === "archived" && !memory.archived) continue;
      if (state.mem.type !== "all" && memory.unit !== state.mem.type) continue;
      if (state.mem.source !== "all" && memory.source !== state.mem.source) continue;
      if (state.mem.importance > 3 && memory.rating < state.mem.importance) continue;
      if (q) {
        var hay = (memory.title + " " + memory.text + " " + memory.tags.join(" ") + " " + memory.source + " " + (V.units[memory.unit] || "")).toLowerCase();
        var terms = q.split(/\s+/);
        var ok = true;
        for (var t = 0; t < terms.length; t++) {
          if (terms[t] && hay.indexOf(terms[t]) === -1) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
      }
      rows.push({ memory: memory, idx: i });
    }
    mount.querySelector("[data-mp-mem-list]").innerHTML = rows.length ? rows.map(function (row) {
      return memRowHtml(L, row.memory, row.idx);
    }).join("") : '<div class="mp-app-empty">' + icon("search") + '<b>' + esc(V.emptyTitle) + '</b><span>' + esc(V.emptyHint) + '</span>' + (q ? '<button type="button" class="mp-app-button mp-app-button-outline" data-mp-mem-clear>' + esc(V.clearSearch) + '</button>' : "") + '</div>';
    mount.querySelector("[data-mp-mem-count]").textContent = V.found(rows.length);
    mount.querySelector("[data-mp-mem-pages]").innerHTML = appPaginationHtml(V, rows.length, "mem");
    mount.querySelector("[data-mp-mem-filter] > summary").innerHTML = memFilterSummaryHtml(L, state);
    mount.querySelector("[data-mp-mem-filter-menu]").innerHTML = memFilterMenuHtml(L, state);
    mount.querySelector("[data-mp-mem-clear]").hidden = !state.mem.q && !state.mem.appliedQ;
    mount.querySelector("[data-mp-mem-go]").hidden = !state.mem.q && !state.mem.appliedQ;
    var selected = state.mem.selected;
    if (state.mem.list.indexOf(selected) === -1) selected = state.mem.selected = null;
    var detail = mount.querySelector("[data-mp-mem-detail]");
    detail.classList.toggle("mp-open", !!selected);
    detail.innerHTML = selected ? memDetailHtml(L, selected, state.mem.list.indexOf(selected)) : "";
    if (selected) {
      detail.setAttribute("role", "dialog");
      detail.setAttribute("aria-label", selected.title);
    } else {
      detail.removeAttribute("role");
      detail.removeAttribute("aria-label");
    }
  }


  Object.assign(G, {memFilterCount, memFilterSummaryHtml, memFilterMenuHtml, memPaneHtml, memRowHtml, memDetailHtml, renderMemList});
})();
