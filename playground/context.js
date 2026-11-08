(function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};
  var INIT_ATTR = G.INIT_ATTR, LOCALES = G.LOCALES, renderShell = G.renderShell, isZh = G.isZh;
  function createContext(mount) {
    if (mount.hasAttribute(INIT_ATTR)) {
      return;
    }
    mount.setAttribute(INIT_ATTR, "1");

    var L = isZh() ? LOCALES.zh : LOCALES.en;
    var state = {
      view: "timeline",
      filter: "all",
      homeQuery: "",
      paperOffset: 0,
      memories: L.memories.slice(),
      events: L.events.slice(),
      counts: {
        memories: L.counts.memories,
        distilled: L.counts.distilled,
        topics: L.counts.topics,
        clusters: L.counts.clusters,
      },
      todayLevel: 2,
      answer: null,
      mem: {
        q: "",
        appliedQ: "",
        mode: "normal",
        tier: "active",
        type: "all",
        source: "all",
        importance: 3,
        filterFacet: "",
        selected: null,
        list: L.memList.map(function (memory) {
          return {
            title: memory.title,
            text: memory.text,
            unit: memory.unit,
            source: memory.source,
            ago: memory.ago,
            rating: memory.rating || 0,
            tags: memory.tags.slice(),
            pinned: !!memory.pinned,
            archived: !!memory.archived,
          };
        }),
      },
      threads: {
        q: "",
        appliedQ: "",
        scope: "all",
        source: "all",
        selected: null,
        infoOpen: false,
        list: L.threadList.map(function (thread) {
          return {
            title: thread.title,
            source: thread.source,
            sourceLabel: thread.sourceLabel,
            badge: thread.badge || "",
            messages: thread.messages,
            date: isZh() ? new Intl.DateTimeFormat("zh-CN", {month: "long", day: "numeric"}).format(new Date(thread.date)) : thread.date,
            pinned: !!thread.pinned,
          };
        }),
      },
      library: {
        imported: false,
        kind: "all",
        date: "all",
        origin: "all",
        readingView: "rendered",
        list: L.libList.map(function (doc) {
          return {
            name: doc.name,
            kind: doc.kind,
            origin: doc.origin,
            sizeBytes: doc.sizeBytes,
            modified: doc.modified,
            size: doc.size,
            page: doc.page,
            excerpt: doc.excerpt,
            sourceUrl: doc.sourceUrl,
            sections: doc.sections,
            tags: doc.tags.slice(),
            status: "indexed",
          };
        }),
      },
    };

    mount.innerHTML = renderShell(L);

    var input = mount.querySelector("[data-mp-input]");
    var send = mount.querySelector("[data-mp-send]");


    var memQ = mount.querySelector("[data-mp-mem-q]");
    var memGo = mount.querySelector("[data-mp-mem-go]");
    var thrQ = mount.querySelector("[data-mp-thr-q]");
    var thrGo = mount.querySelector("[data-mp-thr-go]");
    var globalPanel = mount.querySelector("[data-mp-global-search-panel]");
    var globalQ = mount.querySelector("[data-mp-global-q]");
    var globalResults = mount.querySelector("[data-mp-global-results]");
    var context = {mount:mount, L:L, state:state, input:input, send:send, memQ:memQ, memGo:memGo, thrQ:thrQ, thrGo:thrGo, globalPanel:globalPanel, globalQ:globalQ, globalResults:globalResults};
    G.attachActions(context);
    return context;
  }

  Object.assign(G, {createContext});
})();
