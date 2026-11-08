(function () {
  "use strict";
  var G = window.NMemPlayground;
  var renderLibList = G.renderLibList, renderMemList = G.renderMemList, renderThreadList = G.renderThreadList, nowHM = G.nowHM, searchMemories = G.searchMemories, searchDocuments = G.searchDocuments, renderTimeline = G.renderTimeline, renderStats = G.renderStats, renderCalendar = G.renderCalendar, renderAnswer = G.renderAnswer, esc = G.esc;
  function attachActions(context) {
  var mount = context.mount, L = context.L, state = context.state, input = context.input, send = context.send, memQ = context.memQ, memGo = context.memGo, thrQ = context.thrQ, thrGo = context.thrGo, globalPanel = context.globalPanel, globalQ = context.globalQ, globalResults = context.globalResults;
    function submit() {
      var text = input.value.trim();
      if (!text) {
        return;
      }
      var isDocument =
        /^https?:\/\/\S+/i.test(text) ||
        /\.(pdf|md|markdown|txt|docx?)\b/i.test(text);
      if (isDocument && !/[?？]\s*$/.test(text)) {
        var doc = {
          name: L.libView.importDoc.name,
          kind: L.libView.importDoc.kind,
          size: L.libView.importDoc.size,
          origin: "file",
          modified: new Date().toISOString(),
          page: L.libView.importDoc.page,
          excerpt: L.libView.importDoc.excerpt,
          tags: L.libView.importDoc.tags.slice(),
          status: "indexing",
        };
        state.library.list.unshift(doc);
        state.events.unshift({
          day: "today",
          time: nowHM(),
          title: L.libView.importEvent,
          sub: doc.name,
        });
        state.answer = null;
        input.value = "";
        send.disabled = true;
        rerenderAll();
        renderLibList(mount, L, state);
        var docMain = mount.querySelector(".mp-main");
        if (docMain) {
          docMain.scrollTop = 0;
        }
        setTimeout(function () {
          doc.status = "indexed";
          renderLibList(mount, L, state);
        }, 2500);
        return;
      }
      if (!/[?？]\s*$/.test(text)) {
        state.memories.unshift({
          day: "today",
          time: nowHM(),
          source: L.you,
          text: text,
          tags: [],
        });
        state.mem.list.unshift({
          title: text.length > 40 ? text.slice(0, 40) + "…" : text,
          text: text,
          unit: "fact",
          source: L.you,
          ago: L.memView.justNow,
          rating: 0,
          tags: [],
          pinned: false,
          archived: false,
        });
        state.events.unshift({ day: "today", time: nowHM(), title: L.savedEvent });
        state.counts.memories += 1;
        state.todayLevel = Math.min(4, state.todayLevel + 1);
        state.answer = null;
        input.value = "";
        send.disabled = true;
        rerenderAll();
        var main = mount.querySelector(".mp-main");
        if (main) {
          main.scrollTop = 0;
        }
      } else {
        state.answer = {
          query: text,
          matches: searchMemories(state.memories, text),
          docs: searchDocuments(state.library.list, text),
        };
        renderAnswer(mount, L, state);
      }
    }


    function setView(view) {
      state.view = view;
      setDrawer(false);
      closeGlobalSearch();
      var panes = mount.querySelectorAll("[data-mp-pane]");
      for (var i = 0; i < panes.length; i++) {
        panes[i].hidden = panes[i].getAttribute("data-mp-pane") !== view;
      }
      var rail = mount.querySelector("[data-mp-rail-right]");
      if (rail) {
        rail.hidden = view !== "timeline";
      }
      var shell = mount.querySelector(".mp-shell");
      if (shell) {
        shell.classList.toggle("mp-norail", view !== "timeline");
        shell.setAttribute("data-current-view", view);
      }
      var navs = mount.querySelectorAll("[data-mp-view]");
      for (var j = 0; j < navs.length; j++) {
        navs[j].classList.toggle(
          "mp-active",
          navs[j].getAttribute("data-mp-view") === view
        );
        if (navs[j].classList.contains("home-nav-button")) {
          if (navs[j].getAttribute("data-mp-view") === view) navs[j].setAttribute("aria-current", "page");
          else navs[j].removeAttribute("aria-current");
        }
      }
      if (view === "memories") {
        renderMemList(mount, L, state);
      }
      if (view === "threads") {
        renderThreadList(mount, L, state);
      }
      if (view === "library") {
        renderLibList(mount, L, state);
      }
      var main = mount.querySelector(".mp-main");
      if (main) {
        main.scrollTop = 0;
      }
      mount.dispatchEvent(new CustomEvent("mp:action", {bubbles:true, detail:{type:"view",kind:view}}));
    }


    function closeGlobalSearch() {
      globalPanel.hidden = true;
      globalQ.value = "";
      globalResults.innerHTML = "";
    }

    function renderGlobalResults() {
      var q = globalQ.value.trim().toLowerCase();
      if (!q) {
        globalResults.innerHTML = '<p class="mp-global-hint">' + esc(L.globalSearchHint) + "</p>";
        return;
      }
      function matches(text) {
        return text.toLowerCase().indexOf(q) !== -1;
      }
      var items = [];
      state.mem.list.forEach(function (memory) {
        if (items.length < 4 && matches(memory.title + " " + memory.text + " " + memory.source)) {
          items.push('<button type="button" data-mp-global-view="memories"><b>' + esc(memory.title) + '</b><span>' + esc(L.memView.title) + ' · ' + esc(memory.source) + '</span></button>');
        }
      });
      state.threads.list.forEach(function (thread) {
        if (items.length < 6 && matches(thread.title + " " + thread.sourceLabel)) {
          items.push('<button type="button" data-mp-global-view="threads"><b>' + esc(thread.title) + '</b><span>' + esc(L.threadView.title) + ' · ' + esc(thread.sourceLabel) + '</span></button>');
        }
      });
      state.library.list.forEach(function (doc) {
        if (items.length < 8 && matches(doc.name + " " + doc.excerpt)) {
          items.push('<button type="button" data-mp-global-view="library"><b>' + esc(doc.name) + '</b><span>' + esc(L.libView.title) + ' · ' + esc(doc.kind) + '</span></button>');
        }
      });
      globalResults.innerHTML = items.length ? items.join("") : '<p class="mp-global-hint">' + esc(L.answerNone) + '</p>';
    }

    function setDrawer(open) {
      var shell = mount.querySelector(".mp-shell");
      shell.classList.toggle("mp-drawer-open", open);
      mount.querySelector("[data-mp-more]").setAttribute("aria-expanded", String(open));
    }


    function rerenderAll() {
      if (!input.value) input.style.height = "";
      renderTimeline(mount, L, state);
      renderStats(mount, L, state);
      renderCalendar(mount, L, state);
      renderAnswer(mount, L, state);
    }


    Object.assign(context, {submit, setView, closeGlobalSearch, renderGlobalResults, setDrawer, rerenderAll});
  }
  G.attachActions = attachActions;
})();
