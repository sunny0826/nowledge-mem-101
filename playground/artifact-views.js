(function () {
  "use strict";
  var G = window.NMemPlayground;
  var esc = G.esc, icon = G.icon, appAsset = G.appAsset, appPageHeaderHtml = G.appPageHeaderHtml, sourceIconHtml = G.sourceIconHtml, appPaginationHtml = G.appPaginationHtml, isZh = G.isZh, homeIcon = G.homeIcon;
  function artifactIcon(name) {
    return '<span class="home-icon mp-artifact-icon" aria-hidden="true" style="mask-image:url(/playground-assets/artifacts/' + name + '.svg);-webkit-mask-image:url(/playground-assets/artifacts/' + name + '.svg)"></span>';
  }

  function libraryFilterHtml(V, name, current) {
    var label = name === "kind" ? V.allTypes : name === "date" ? V.modified : V.source;
    var options = Object.keys(V[name]).map(function (value) {
      return [value, V[name][value]];
    });
    var selectedLabel = current === "all" ? label : V[name][current];
    return '<div class="mp-lib-filter-wrap"><details class="mp-lib-filter" data-mp-lib-filter="' + name + '"><summary>' + esc(selectedLabel) + (current === "all" ? artifactIcon("chevron-down") : "") + '</summary><div class="mp-lib-filter-menu" role="group" aria-label="' + esc(label) + '">' + options.map(function (option) {
      var selected = option[0] === current;
      return '<button type="button" data-mp-lib-filter-option="' + name + '" data-mp-lib-filter-value="' + option[0] + '" aria-pressed="' + selected + '"><span>' + esc(option[1]) + '</span><span class="mp-lib-check" aria-hidden="true">' + (selected ? icon("check") : "") + '</span></button>';
    }).join("") + '</div></details>' + (current !== "all" ? '<button type="button" class="mp-lib-filter-clear" data-mp-lib-filter-clear="' + name + '" aria-label="' + esc(V.clearFilter) + '" title="' + esc(V.clearFilter) + '">×</button>' : "") + '</div>';
  }

  function libPaneHtml(L) {
    var V = L.libView;
    return '<div class="mp-pane mp-library" data-mp-pane="library" hidden><div class="mp-library-content">' +
      '<header class="page-header"><div class="page-header-row"><h1 class="page-header-title font-display">' + esc(V.title) + '</h1></div></header>' +
      '<div class="mp-lib-layout"><aside class="mp-lib-sidebar"><div class="mp-lib-tools"><div class="mp-lib-filters">' +
      libraryFilterHtml(V, "kind", "all") + libraryFilterHtml(V, "date", "all") + libraryFilterHtml(V, "origin", "all") +
      '<label class="mp-lib-search">' + icon("search") + '<input type="search" data-mp-lib-q aria-label="' + esc(V.search) + '" placeholder="' + esc(V.search) + '" /></label>' +
      '<button type="button" class="mp-lib-upload" data-mp-lib-import>' + artifactIcon("upload") + '<span>' + esc(V.importBtn) + '</span></button></div></div>' +
      '<div class="mp-lib-scroll"><div role="table" aria-label="' + esc(V.title) + '"><div role="rowgroup"><div role="row" class="mp-lib-tablehead"><span role="columnheader">' + esc(V.name) + '</span><span role="columnheader">' + esc(V.modified) + '</span><span role="columnheader">' + esc(V.size) + '</span></div></div><div role="rowgroup" data-mp-lib-list></div></div></div>' +
      '<div class="mp-lib-footer" data-mp-lib-count aria-live="polite"></div></aside>' +
      '<section class="mp-lib-detail" data-mp-lib-detail aria-label="' + esc(V.selectDoc) + '"></section></div></div></div>';
  }

  function libraryDocKind(doc) {
    var kind = (doc.kind || "").toLowerCase();
    if (kind === "html" || kind === "url") return "html";
    if (kind === "pdf") return "pdf";
    if (["image", "audio", "video"].indexOf(kind) !== -1) return "media";
    return "documents";
  }

  function libraryDocIcon(doc) {
    var kind = libraryDocKind(doc);
    return kind === "html" ? "html" : kind === "pdf" ? "pdf" : "document";
  }

  function libraryDocDate(doc, L) {
    var value = doc.modified ? new Date(doc.modified) : new Date();
    var currentYear = new Date().getFullYear();
    return new Intl.DateTimeFormat(isZh() ? "zh-CN" : "en-US", value.getFullYear() === currentYear ? {month: "short", day: "numeric", hour: "numeric", minute: "2-digit"} : {year: "numeric", month: "short", day: "numeric"}).format(value);
  }

  function libraryDocSize(doc) {
    if (Number.isFinite(doc.sizeBytes)) {
      if (doc.sizeBytes === 0) return "0 B";
      var units = ["B", "KB", "MB", "GB"];
      var unit = Math.floor(Math.log(doc.sizeBytes) / Math.log(1024));
      return parseFloat((doc.sizeBytes / Math.pow(1024, unit)).toFixed(1)) + " " + units[unit];
    }
    return doc.size || "—";
  }

  function libraryDateMatches(doc, filter) {
    if (filter === "all") return true;
    var timestamp = Date.parse(doc.modified || new Date().toISOString());
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var start = today.getTime();
    var end = start + 86400000;
    if (filter === "week") start -= 6 * 86400000;
    if (filter === "month") start -= 29 * 86400000;
    if (filter === "year" || filter === "lastYear") {
      start = new Date(today.getFullYear(), 0, 1).getTime();
      if (filter === "lastYear") {
        end = start;
        start = new Date(today.getFullYear() - 1, 0, 1).getTime();
      }
    }
    return timestamp >= start && timestamp < end;
  }

  function libRowHtml(L, doc, index, selected) {
    var V = L.libView;
    var indexing = doc.status !== "indexed";
    return '<div role="row" class="mp-lib-row' + (selected ? " mp-on" : "") + '"><button type="button" class="mp-lib-open" data-mp-lib-open="' + index + '" aria-pressed="' + selected + '"' + (indexing ? " disabled" : "") + '>' +
      '<span role="cell" class="mp-lib-name"><span class="mp-lib-icon">' + artifactIcon(libraryDocIcon(doc)) + '</span><span class="mp-lib-title" title="' + esc(doc.name) + '">' + esc(doc.name) + '</span>' + (indexing ? '<span class="mp-lib-indexing" data-mp-lib-status="indexing">' + esc(V.indexing) + '</span>' : '<span data-mp-lib-status="indexed" hidden></span>') + '</span>' +
      '<span role="cell" class="mp-lib-modified" title="' + esc(doc.modified || "") + '">' + esc(libraryDocDate(doc, L)) + '</span><span role="cell" class="mp-lib-size">' + esc(libraryDocSize(doc)) + '</span></button></div>';
  }

  function libraryContentHtml(doc, raw) {
    if (raw) return '<div class="mp-lib-raw">' + esc(doc.text || doc.excerpt) + '</div>';
    if (doc.sections) {
      return doc.sections.map(function (section) {
        return '<section><h3>' + esc(section.title) + '</h3>' + (section.paragraphs || []).map(function (text) { return '<p>' + esc(text) + '</p>'; }).join("") + (section.list ? '<ul>' + section.list.map(function (text) { return '<li>' + esc(text) + '</li>'; }).join("") + '</ul>' : "") + '</section>';
      }).join("");
    }
    return '<p>' + esc(doc.text || doc.excerpt) + '</p>';
  }

  function libDetailHtml(L, doc, raw) {
    var V = L.libView;
    return '<button type="button" class="mp-lib-close" data-mp-lib-back aria-label="' + esc(V.closeDetails) + '">×</button>' +
      '<div class="mp-lib-detailhead"><span class="mp-lib-icon">' + artifactIcon(libraryDocIcon(doc)) + '</span><div><h2 class="mp-lib-reader-title">' + esc(doc.name) + '</h2>' +
      '<div class="mp-lib-readermeta">' + esc(doc.kind === "HTML" ? "URL" : doc.kind === "Markdown" ? "MD" : doc.kind) + ' · ' + esc(libraryDocSize(doc)) + ' <span aria-hidden="true">|</span> ' + esc(libraryDocDate(doc, L)) + '</div>' +
      '<div class="mp-lib-sourceurl">' + icon("paperclip") + '<span>' + esc(doc.sourceUrl || doc.name) + '</span></div></div></div>' +
      '<div class="mp-lib-actions"><button type="button" class="mp-lib-action mp-lib-original" disabled title="' + esc(V.unsupported) + '">' + icon("bookopen") + '<span>' + esc(V.openOriginal) + '</span></button>' +
      '<button type="button" class="mp-lib-action" disabled title="' + esc(V.unsupported) + '">' + icon("share") + '<span>' + esc(V.share) + '</span></button>' +
      '<button type="button" class="mp-lib-action" disabled title="' + esc(V.unsupported) + '" aria-label="' + esc(V.unsupported) + '">⋯</button>' +
      '<span class="mp-lib-view-buttons"><button type="button" class="mp-lib-action" disabled title="' + esc(V.unsupported) + '">' + esc(V.versions) + artifactIcon("chevron-down") + '</button>' +
      '<button type="button" class="mp-lib-action" data-mp-lib-reading-view>' + esc(raw ? V.textSource : V.readingView) + artifactIcon("chevron-down") + '</button></span></div>' +
      '<div class="mp-lib-document">' + libraryContentHtml(doc, raw) + '</div>' +
      '<form class="mp-lib-ask" data-mp-lib-ask-form><input type="text" data-mp-lib-ask-input placeholder="' + esc(V.askAboutFile) + '" aria-label="' + esc(V.askAboutFile) + '"><span class="mp-lib-read-ai">' + icon("bookopen") + esc(V.readWithAI) + '</span><button type="submit" class="mp-lib-ask-send" aria-label="' + esc(L.sendLabel) + '">' + homeIcon("imgIconArrowUp") + '</button></form>';
  }

  function renderLibList(mount, L, state) {
    var V = L.libView;
    var lib = state.library;
    var query = mount.querySelector("[data-mp-lib-q]").value.toLowerCase().trim();
    var rows = lib.list.map(function (doc, index) { return {doc: doc, index: index}; }).filter(function (row) {
      return (!query || (row.doc.name + " " + row.doc.excerpt).toLowerCase().indexOf(query) !== -1) &&
        (lib.kind === "all" || libraryDocKind(row.doc) === lib.kind) &&
        (lib.origin === "all" || (row.doc.origin || "file") === lib.origin) &&
        libraryDateMatches(row.doc, lib.date);
    });
    mount.querySelector("[data-mp-lib-list]").innerHTML = rows.length ? rows.map(function (row) { return libRowHtml(L, row.doc, row.index, lib.selected === row.doc); }).join("") : '<p class="mp-lib-noresults">' + esc(V.noResults) + '</p>';
    mount.querySelector("[data-mp-lib-count]").textContent = rows.length ? V.range(rows.length) : "";
    var doc = lib.selected;
    if (lib.list.indexOf(doc) === -1) doc = lib.selected = null;
    mount.querySelector("[data-mp-lib-detail]").innerHTML = doc ? libDetailHtml(L, doc, lib.readingView === "raw") : "";
    mount.querySelector(".mp-lib-layout").classList.toggle("mp-lib-selected", !!doc);
  }



  Object.assign(G, {artifactIcon, libraryFilterHtml, libPaneHtml, libraryDocKind, libraryDocIcon, libraryDocDate, libraryDocSize, libraryDateMatches, libRowHtml, libraryContentHtml, libDetailHtml, renderLibList});
})();
