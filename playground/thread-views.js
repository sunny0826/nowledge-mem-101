(function () {
  "use strict";
  var G = window.NMemPlayground;
  var esc = G.esc, icon = G.icon, appAsset = G.appAsset, appPageHeaderHtml = G.appPageHeaderHtml, sourceIconHtml = G.sourceIconHtml, appPaginationHtml = G.appPaginationHtml;
  function threadFilterMenuHtml(L, state) {
    var V = L.threadView;
    var sources = [];
    state.threads.list.forEach(function (thread) { if (sources.indexOf(thread.source) === -1) sources.push(thread.source); });
    function option(value, label, selected) {
      return '<button type="button" class="mp-thread-filter-option" data-mp-thread-filter-option="' + esc(value) + '" aria-pressed="' + selected + '"><span>' + esc(label) + '</span><span>' + (selected ? icon("check") : "") + '</span></button>';
    }
    return option("all", V.allConversations, state.threads.scope === "all" && state.threads.source === "all") + option("favorites", V.favoriteConversations, state.threads.scope === "favorites") + '<div class="mp-thread-filter-separator"></div><div class="mp-thread-filter-label">' + esc(V.source) + '</div>' + sources.map(function (source) {
      var thread = state.threads.list.find(function (item) { return item.source === source; });
      return option("source:" + source, thread.sourceLabel, state.threads.source === source);
    }).join("") + '<button type="button" data-mp-trefresh hidden>' + esc(V.reset) + '</button>';
  }

  function threadsPaneHtml(L) {
    var V = L.threadView;
    return '<div class="mp-pane mp-app-page mp-threads" data-mp-pane="threads" hidden><div class="mp-app-content">' +
      '<div class="mp-app-body mp-thread-list-view" data-mp-thread-list-view>' + appPageHeaderHtml(V.title) + '<div class="mp-app-toolbar"><div class="mp-app-toolbar-group"><details class="mp-app-filter mp-thread-filter"><summary><span data-mp-thread-filter-label>' + esc(V.allSources) + '</span>' + appAsset("memories", "filter-chevron") + '</summary><div class="mp-thread-filter-menu" data-mp-thread-filter-menu></div></details><span class="mp-app-count" role="status">' + esc(V.results) + ' · <b data-mp-thr-count></b></span>' +
      '<div class="mp-app-search">' + icon("search") + '<input type="search" data-mp-thr-q placeholder="' + esc(V.searchPh) + '" aria-label="' + esc(V.searchPh) + '"><button type="button" class="mp-app-search-action" data-mp-thr-clear aria-label="' + esc(V.clearSearch) + '" hidden>×</button><button type="button" class="mp-app-search-action" data-mp-thr-go aria-label="' + esc(V.searchSubmit) + '" title="' + esc(V.searchSubmit) + '" hidden disabled>' + icon("search") + '</button></div></div>' +
      '<button type="button" class="mp-app-button" disabled title="' + esc(L.unsupported) + '">' + icon("upload") + '<span>' + esc(V.importBtn) + '</span></button></div>' +
      '<div class="mp-thr-list" data-mp-thr-list></div><div data-mp-thr-pages></div></div>' +
      '<section class="mp-thread-reading" data-mp-thread-detail hidden></section></div></div>';
  }

  function threadMoreHtml(L, thread, index) {
    var V = L.threadView;
    return '<details class="mp-thread-more"><summary class="mp-app-icon-button" aria-label="' + esc(V.moreActions) + '" title="' + esc(V.moreActions) + '">⋯</summary><div class="mp-thread-menu"><button type="button" data-mp-tpin="' + index + '" aria-pressed="' + !!thread.pinned + '">' + icon("pin") + '<span>' + esc(thread.pinned ? V.unpin : V.pin) + '</span></button><button type="button" data-mp-tcopy="' + index + '" aria-label="' + esc(V.copyRef) + '">' + icon("copy") + '<span>' + esc(V.copyRef) + '</span></button><button type="button" class="mp-danger" data-mp-tdel="' + index + '">' + icon("trash") + '<span>' + esc(V.deleteThread) + '</span></button></div></details>';
  }

  function threadRowHtml(L, thread, index) {
    var V = L.threadView;
    return '<article class="mp-thr-row" aria-label="' + esc(thread.title) + '"><div class="mp-thr-row-layout"><div class="mp-thr-main"><span class="mp-thr-avatar" role="img" aria-label="' + esc(thread.sourceLabel) + '" title="' + esc(thread.sourceLabel) + '">' + sourceIconHtml(thread.source) + '</span><div class="mp-thr-copy"><div class="mp-thr-heading"><h3><button type="button" class="mp-thread-open" data-mp-thread-open="' + index + '"><span>' + esc(thread.title) + '</span></button></h3><span class="mp-thread-count" aria-label="' + esc(V.messages(thread.messages)) + '">' + thread.messages.toLocaleString(isZh() ? "zh-CN" : "en-US") + '</span></div><p class="mp-thr-summary">' + esc(thread.summary || V.preview) + '</p><p class="mp-thr-mobile-date">' + esc(thread.date) + '</p></div></div>' +
      '<div class="mp-thr-side"><time class="mp-thr-date">' + esc(thread.date) + '</time><button type="button" class="mp-app-icon-button mp-thread-share" disabled title="' + esc(L.unsupported) + '" aria-label="' + esc(V.share) + '">' + icon("share") + '</button>' + threadMoreHtml(L, thread, index) + '</div></div></article>';
  }

  function threadDetailHtml(L, state) {
    var V = L.threadView;
    var thread = state.threads.selected;
    var index = state.threads.list.indexOf(thread);
    var messages = [
      {role: "user", speaker: V.user, time: "10:24", text: V.reviewRequest(thread.title)},
      {role: "assistant", speaker: V.assistant, time: "10:25", text: V.reviewResponse},
      {role: "user", speaker: V.user, time: "10:26", text: V.saveRequest},
      {role: "assistant", speaker: V.assistant, time: "10:27", text: V.saveResponse},
    ];
    var labels = [];
    state.mem.list.forEach(function (memory) {
      memory.tags.forEach(function (tag) { if (labels.indexOf(tag) === -1) labels.push(tag); });
    });
    return '<div class="mp-thread-reading-inner"><button type="button" class="mp-thread-back" data-mp-thread-back>' + icon("chevron") + '<span>' + esc(V.backToAll) + '</span></button>' +
      '<header class="mp-thread-reading-header"><div class="mp-thread-title-row"><div class="mp-thread-title-main"><span class="mp-thread-detail-icon" aria-hidden="true">' + appAsset("threads", "thinking-bubble") + '</span><div class="mp-thread-heading-copy"><h1 class="mp-thread-detail-title" title="' + esc(thread.title) + '">' + esc(thread.title) + '</h1><p class="mp-thread-updated">' + esc(V.lastUpdated(thread)) + '</p></div></div><div class="mp-thread-detail-actions"><button type="button" class="mp-app-button" disabled title="' + esc(L.unsupported) + '">' + icon("sparkles") + '<span>' + esc(V.distill) + '</span></button><button type="button" class="mp-app-icon-button" data-mp-thread-info aria-label="' + esc(V.threadInfo) + '" aria-expanded="' + !!state.threads.infoOpen + '">' + icon("sliders") + '</button></div></div></header>' +
      '<div class="mp-thread-reading-toolbar"><div class="mp-thread-reading-source">' + sourceIconHtml(thread.source) + '<span>' + esc(V.fromSource(thread.sourceLabel)) + '</span><span aria-hidden="true">·</span><span aria-label="' + esc(V.messages(thread.messages)) + '">' + thread.messages.toLocaleString(isZh() ? "zh-CN" : "en-US") + '</span></div><div class="mp-thread-tool-icons"><button type="button" class="mp-app-icon-button" disabled title="' + esc(L.unsupported) + '" aria-label="' + esc(V.share) + '">' + icon("share") + '</button><button type="button" class="mp-app-icon-button" disabled title="' + esc(L.unsupported) + '" aria-label="' + esc(V.export) + '">' + icon("upload") + '</button>' + threadMoreHtml(L, thread, index) + '</div></div>' +
      '<div class="mp-thread-reading-layout"><div class="mp-thread-messages"><nav class="mp-thread-minimap" aria-label="' + esc(V.messageNavigation) + '">' + messages.map(function (message, messageIndex) {
        return '<button type="button" data-mp-message-jump="' + messageIndex + '" class="' + (messageIndex === 0 ? "mp-current" : "") + '" aria-label="' + esc(V.jumpTo(message.text)) + '"' + (messageIndex === 0 ? ' aria-current="step"' : "") + '><span aria-hidden="true"></span></button>';
      }).join("") + '</nav>' + messages.map(function (message, messageIndex) {
        return '<article class="mp-thread-message" data-message-role="' + message.role + '" data-message-index="' + messageIndex + '"><div><div class="mp-thread-message-meta"><strong>' + esc(message.speaker) + '</strong><time>' + esc(message.time) + '</time></div><div class="mp-thread-message-content"><p>' + esc(message.text) + '</p></div></div></article>';
      }).join("") + '<p class="mp-thread-loaded">' + esc(V.loadedMessages(messages.length, thread.messages)) + '</p></div>' +
      '<aside class="mp-thread-aside' + (state.threads.infoOpen ? " mp-info-open" : "") + '"><section class="mp-thread-info-card"><h2>' + esc(V.summaryTitle) + '</h2><p>' + esc(thread.summary || V.preview) + '</p><span class="mp-thread-related-date">' + esc(V.loadedMessages(messages.length, thread.messages)) + '</span></section>' +
      '<section class="mp-thread-info-card"><h2>' + esc(V.relatedMemories) + '</h2>' + state.mem.list.slice(0, 4).map(function (memory) {
        return '<button type="button" class="mp-thread-related-memory" data-mp-thread-memory="' + state.mem.list.indexOf(memory) + '">' + icon("lightbulb") + '<span>' + esc(memory.title) + '</span><time>' + esc(memory.ago) + '</time></button>';
      }).join("") + '</section>' +
      '<section class="mp-thread-info-card"><h2>' + esc(V.relatedObjects) + '</h2><div class="mp-thread-object-tags">' + labels.slice(0, 8).map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join("") + '</div></section></aside></div></div>';
  }

  function renderThreadList(mount, L, state) {
    var V = L.threadView;
    var q = (state.threads.appliedQ || "").trim().toLowerCase();
    var rows = [];
    for (var i = 0; i < state.threads.list.length; i++) {
      var thread = state.threads.list[i];
      if (state.threads.scope === "favorites" && !thread.pinned) continue;
      if (state.threads.source !== "all" && thread.source !== state.threads.source) continue;
      if (q) {
        var hay = (thread.title + " " + thread.sourceLabel + " " + thread.source + " " + (thread.summary || V.preview)).toLowerCase();
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
      rows.push({ thread: thread, idx: i });
    }
    mount.querySelector("[data-mp-thr-list]").innerHTML = rows.length ? rows.map(function (row) {
      return threadRowHtml(L, row.thread, row.idx);
    }).join("") : '<div class="mp-app-empty">' + icon("chatcircle") + '<b>' + esc(V.emptyTitle) + '</b><span>' + esc(V.emptyHint) + '</span>' + (q ? '<button type="button" class="mp-app-button mp-app-button-outline" data-mp-thr-clear>' + esc(V.clearSearch) + '</button>' : "") + '</div>';
    mount.querySelector("[data-mp-thr-count]").textContent = V.found(rows.length);
    mount.querySelector("[data-mp-thr-pages]").innerHTML = appPaginationHtml(V, rows.length, "thr");
    mount.querySelector("[data-mp-thread-filter-menu]").innerHTML = threadFilterMenuHtml(L, state);
    var selectedThread = state.threads.list.find(function (thread) { return thread.source === state.threads.source; });
    mount.querySelector("[data-mp-thread-filter-label]").textContent = state.threads.scope === "favorites" ? V.favoriteConversations : state.threads.source === "all" ? V.allSources : selectedThread ? selectedThread.sourceLabel : state.threads.source;
    mount.querySelector("[data-mp-thr-clear]").hidden = !state.threads.q && !state.threads.appliedQ;
    mount.querySelector("[data-mp-thr-go]").hidden = !state.threads.q && !state.threads.appliedQ;
    var selected = state.threads.selected;
    if (state.threads.list.indexOf(selected) === -1) selected = state.threads.selected = null;
    mount.querySelector("[data-mp-thread-list-view]").hidden = !!selected;
    var detail = mount.querySelector("[data-mp-thread-detail]");
    detail.hidden = !selected;
    detail.innerHTML = selected ? threadDetailHtml(L, state) : "";
    if (selected) detail.setAttribute("aria-label", selected.title);
    else detail.removeAttribute("aria-label");
  }



  Object.assign(G, {threadFilterMenuHtml, threadsPaneHtml, threadMoreHtml, threadRowHtml, threadDetailHtml, renderThreadList});
})();
