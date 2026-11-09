(window.NMemModules = window.NMemModules || []).push(["playground/home-views.js", function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};
  var esc = G.esc, icon = G.icon, appAsset = G.appAsset, appPageHeaderHtml = G.appPageHeaderHtml, sourceIconHtml = G.sourceIconHtml, appPaginationHtml = G.appPaginationHtml, isZh = G.isZh;
  function focusHtml(L) {
    return (
      '<div class="mp-focus"><div class="mp-focus-row">' +
      '<span class="mp-focus-label">' +
      esc(L.focus.label) +
      '</span><span class="mp-focus-space">' +
      esc(L.focus.space) +
      '</span><span class="mp-focus-text">' +
      esc(L.focus.text) +
      '</span><span class="mp-focus-time">' +
      esc(L.focus.time) +
      '</span><i class="mp-focus-caret">' +
      icon("caret") +
      "</i></div></div>"
    );
  }

  function reviewHtml(L) {
    var total = 0;
    var items = L.review.items
      .map(function (item) {
        total += item[2];
        return (
          '<div class="mp-review-item">' +
          '<span class="mp-review-caret">' +
          icon("caret") +
          '</span><span class="mp-review-icon">' +
          icon(item[0]) +
          '</span><span class="mp-review-main"><span class="mp-review-name">' +
          esc(item[1]) +
          " <em>" +
          item[2] +
          '</em></span><span class="mp-review-rec">' +
          esc(item[3]) +
          '</span></span><span class="mp-review-apply">' +
          icon("check") +
          "<span>" +
          esc(L.review.apply(item[2])) +
          "</span></span></div>"
        );
      })
      .join("");
    return (
      '<section class="mp-review" aria-label="' +
      esc(L.review.title) +
      " (" +
      total +
      ')">' +
      '<div class="mp-review-head"><span class="mp-review-badge">' +
      icon("flag") +
      '</span><div class="mp-review-titles"><h2 class="mp-review-title">' +
      esc(L.review.title) +
      " (" +
      total +
      ')</h2><p class="mp-review-sub">' +
      esc(L.review.subtitle) +
      '</p><p class="mp-review-next">' +
      icon("clock") +
      "<span>" +
      esc(L.review.next) +
      "</span></p></div></div>" +
      '<div class="mp-review-list">' +
      items +
      "</div></section>"
    );
  }

  function homeIcon(name) {
    return '<span class="home-icon" aria-hidden="true" style="mask-image:url(/playground-assets/homepage/' + name + '.svg);-webkit-mask-image:url(/playground-assets/homepage/' + name + '.svg)"></span>';
  }

  function navItemHtml(L, item) {
    var assetNames = {
      home: "imgHomeHouse",
      lightbulb: "SidebarMemory",
      msgtext: "SidebarThread",
      library: "imgFolderPaper",
      asterisk: "imgBubble5MessageChat",
      diamonds: "imgPuzzlePlugin",
      compass: ["img", "Cryptopunk", "Nft", "Pfp", "Profile", "Avatar"].join(""),
    };
    var inner = (["network", "share", "bookopen"].indexOf(item[0]) === -1 ? homeIcon(assetNames[item[0]] || "imgFolderPaper") : "") + '<span class="mp-nav-label">' + esc(item[1]) + "</span>";
    if (item[2]) {
      return '<button type="button" class="mp-nav-item home-nav-button' + (item[2] === "timeline" ? " mp-active" : "") + '" data-mp-view="' + item[2] + '" aria-label="' + esc(item[1]) + '"' + (item[2] === "timeline" ? ' aria-current="page"' : "") + '>' + inner + "</button>";
    }
    return '<button type="button" class="mp-nav-item home-nav-button" disabled title="' + esc(L.unsupported) + '">' + inner + "</button>";
  }

  function captureHtml(L) {
    var suggestions = L.suggestions.map(function (text, index) {
      return '<button type="button" class="home-shortcut" data-mp-suggestion="' + index + '">' + esc(text) + "</button>";
    }).join("");
    return '<div class="mp-capture-wrap homepage-footer">' +
      '<form class="mp-capture homepage-composer" data-mp-capture-form>' +
      '<div class="mp-memory-actions"><button type="button" class="home-icon-button" data-mp-memory-actions aria-label="' + esc(L.memoryActions) + '" aria-expanded="false">' + homeIcon("imgSearchIcon1") + '</button>' +
      '<div class="mp-add-menu homepage-actions" data-mp-add-menu hidden><div class="homepage-shortcuts"><button type="button" class="home-shortcut" data-mp-add-memory>' + esc(L.addMemory) + '</button>' + suggestions + '</div></div></div>' +
      '<textarea rows="1" data-mp-input placeholder="' + esc(L.askPlaceholder) + '" aria-label="' + esc(L.askPlaceholder) + '"></textarea>' +
      '<button type="button" class="mp-send homepage-send" data-mp-send aria-label="' + esc(L.sendLabel) + '" disabled>' + homeIcon("imgIconArrowUp") + '</button>' +
      '</form></div>';
  }

  function globalSearchHtml(L) {
    return '<div class="mp-global-search" data-mp-global-search-panel hidden>' +
      '<div class="mp-global-dialog" role="dialog" aria-modal="true" aria-label="' + esc(L.globalSearchTitle) + '">' +
      '<div class="mp-global-searchbar">' + icon("search") + '<input type="search" data-mp-global-q placeholder="' + esc(L.globalSearch) + '" aria-label="' + esc(L.globalSearch) + '" />' +
      '<button type="button" data-mp-global-close aria-label="' + esc(L.closeLabel) + '">×</button></div>' +
      '<div data-mp-global-results></div>' +
      '</div></div>';
  }

  function homeViewHtml(L, tabs) {
    var now = new Date();
    var date = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    var shortDate = new Intl.DateTimeFormat(isZh() ? "zh-CN" : "en-US", {month: "short", day: "numeric"}).format(now);
    return '<div class="mp-pane homepage-main home-design" data-mp-pane="timeline">' +
      '<div class="homepage-scroll"><div class="homepage-content">' +
      '<header class="homepage-header homepage-restored"><div class="homepage-intro">' +
      '<h1>' + esc(L.homeHeadline) + '</h1>' +
      '<div class="homepage-header-art" data-mp-paper-art>' + window.NMemHome.render(now, 0, L.nextPaperStyle) + '</div>' +
      '<div class="homepage-focus"><h2><span>' + esc(L.dayToday) + '</span><time datetime="' + date + '">' + esc(shortDate) + '</time></h2>' +
      '<div class="homepage-focus-preview">' + esc(L.homeBrief) + ' <button type="button" class="home-text-action" disabled title="' + esc(L.unsupported) + '">' + esc(L.viewDetail) + homeIcon("imgChevronRight") + '</button></div>' +
      '</div></div>' +
      '<div class="homepage-stats-card"><div class="homepage-stats" data-mp-stats></div>' +
      '<div class="homepage-activity" data-calendar="fern"><h3 class="homepage-activity-label">' + esc(L.activity) + '</h3><div class="homepage-heatmap" data-mp-calendar role="group" aria-label="' + esc(L.activity) + '"></div></div>' +
      '</div></header>' +
      '<div class="homepage-review"><button type="button" class="homepage-review-trigger" disabled title="' + esc(L.unsupported) + '" aria-label="' + esc(L.pulse) + '"><span class="homepage-review-label">' + homeIcon("NotificationBell") + '<span>' + esc(L.pulse) + '</span></span><span class="homepage-review-chevron" aria-hidden="true">' + homeIcon("TimelineChevron") + '</span></button></div>' +
      '<div class="homepage-timeline-controls"><div class="mp-tabs" role="group" aria-label="' + esc(L.title) + '">' + tabs + '</div>' +
      '<label class="homepage-timeline-search">' + homeIcon("imgMagnifyingGlassSearch") + '<input type="search" data-mp-home-q placeholder="' + esc(L.search) + '" aria-label="' + esc(L.searchTimeline) + '"></label></div>' +
      '<div class="homepage-source-attention">' + icon("warn") + '<span>' + esc(L.sourceAttention) + '</span>' + icon("caret") + '<span class="homepage-source-detail">' + esc(L.viewDetail) + homeIcon("imgChevronRight") + '</span></div>' +
      '<div data-mp-answer></div><div data-mp-timeline></div>' +
      '</div></div>' + captureHtml(L) + '</div>';
  }


  function renderStats(mount, L, state) {
    var values = [state.counts.memories, state.counts.topics, state.counts.distilled, state.counts.clusters];
    mount.querySelector("[data-mp-stats]").innerHTML = '<dl class="contents">' + values.map(function (value, index) {
      return '<div><dd>' + value.toLocaleString(isZh() ? "zh-CN" : "en-US") + '</dd><dt>' + esc(L.statLabels[index]) + '</dt></div>';
    }).join("") + '</dl>';
  }

  function calendarLevel(day, month, isFuture) {
    if (isFuture) return 0;
    return 1 + ((day * 7 + month * 3) % 5);
  }

  function renderCalendar(mount, L, state) {
    var end = new Date();
    end.setDate(end.getDate() + (6 - end.getDay()));
    var html = "";
    for (var index = 139; index >= 0; index--) {
      var day = new Date(end);
      day.setDate(end.getDate() - index);
      var level = index < 21 ? 0 : calendarLevel(day.getDate(), day.getMonth(), day > new Date());
      if (index === 6 - new Date().getDay()) level = Math.max(2, Math.min(5, state.todayLevel));
      var date = day.getFullYear() + "-" + String(day.getMonth() + 1).padStart(2, "0") + "-" + String(day.getDate()).padStart(2, "0");
      html += '<span class="homepage-heatmap-day" data-level="' + level + '" title="' + date + ' · ' + (level ? level * 2 : 0) + '"></span>';
    }
    mount.querySelector("[data-mp-calendar]").innerHTML = html;
  }

  function entryHtml(L, memory) {
    return '<article class="homepage-feed-event"><div class="homepage-event-head">' + homeIcon("SidebarMemory") + '<h3>' + esc(L.savedFoot) + '</h3><time>' + esc(memory.time) + '</time></div>' +
      '<p class="homepage-event-description">' + esc(memory.text) + '</p><div class="homepage-event-source">' + esc(memory.source) + '</div></article>';
  }

  function eventHtml(event) {
    return '<article class="homepage-feed-event"><div class="homepage-event-head">' + homeIcon("imgBubble5MessageChat") + '<h3>' + esc(event.title) + '</h3><time>' + esc(event.time) + '</time></div>' +
      (event.sub ? '<p class="homepage-event-description">' + esc(event.sub) + '</p>' : "") +
      (event.action ? '<div class="homepage-event-source">' + esc(event.action) + '</div>' : "") + '</article>';
  }

  function renderTimeline(mount, L, state) {
    var groups = [["today", L.dayToday], ["yesterday", L.dayYesterday]];
    var html = "";
    var query = (state.homeQuery || "").trim().toLowerCase();
    for (var g = 0; g < groups.length; g++) {
      var day = groups[g][0];
      var label = groups[g][1];
      var memories = state.memories.filter(function (memory) {
        return memory.day === day && (!query || (memory.text + " " + memory.source + " " + memory.tags.join(" ")).toLowerCase().indexOf(query) !== -1);
      });
      var events = state.events.filter(function (event) {
        return event.day === day && (!query || (event.title + " " + (event.sub || "") + " " + (event.action || "")).toLowerCase().indexOf(query) !== -1);
      });
      var parts = [];
      var i;
      var showMemories = state.filter === "all" || state.filter === "saved";
      var showEvents = state.filter === "all" || state.filter === "events";
      if (showMemories) {
        for (i = 0; i < memories.length; i++) parts.push(entryHtml(L, memories[i]));
      }
      if (showEvents) {
        for (i = 0; i < events.length; i++) parts.push(eventHtml(events[i]));
      }
      if (!parts.length) continue;
      html += '<section class="homepage-day-group"><h2 class="homepage-day-header">' + esc(label) + ' · ' + esc(L.daySummary(memories.length, events.length)) + '</h2>' + parts.join("") + '</section>';
    }
    if (!html) html = '<div class="mp-empty">' + esc(L.emptyFiltered) + "</div>";
    mount.querySelector("[data-mp-timeline]").innerHTML = html;
  }

  function renderAnswer(mount, L, state) {
    var box = mount.querySelector("[data-mp-answer]");
    if (!state.answer) {
      box.innerHTML = "";
      return;
    }
    var body;
    var docs = state.answer.docs || [];
    var total = state.answer.matches.length + docs.length;
    if (total) {
      body =
        '<div class="mp-answer-text">' +
        esc(L.answerFound(total)) +
        "</div>" +
        state.answer.matches
          .map(function (memory) {
            return (
              '<div class="mp-cite"><div class="mp-cite-text">' +
              esc(memory.text) +
              '</div><div class="mp-cite-meta">' +
              esc(memory.source) +
              " · " +
              esc(memory.day === "today" ? L.dayToday : L.dayYesterday) +
              " " +
              esc(memory.time) +
              "</div></div>"
            );
          })
          .join("") +
        docs
          .map(function (doc) {
            return (
              '<div class="mp-cite mp-cite-doc"><div class="mp-cite-text">' +
              esc(doc.excerpt) +
              '</div><div class="mp-cite-meta">' +
              icon("note") +
              "<span>" +
              esc(doc.name) +
              " · " +
              esc(doc.page) +
              "</span></div></div>"
            );
          })
          .join("");
    } else {
      body = '<div class="mp-answer-text">' + esc(L.answerNone) + "</div>";
    }
    box.innerHTML =
      '<div class="mp-answer"><div class="mp-answer-head">' +
      icon("sparkles") +
      "<span>" +
      esc(L.answerTitle) +
      '</span><button type="button" class="mp-answer-close" data-mp-close aria-label="' +
      esc(L.closeLabel) +
      '">×</button></div>' +
      body +
      "</div>";
  }



  Object.assign(G, {focusHtml, reviewHtml, homeIcon, navItemHtml, captureHtml, globalSearchHtml, homeViewHtml, renderStats, calendarLevel, renderCalendar, entryHtml, eventHtml, renderTimeline, renderAnswer});
}]);
