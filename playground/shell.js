(function () {
  "use strict";
  var G = window.NMemPlayground;
  var homeViewHtml = G.homeViewHtml, memPaneHtml = G.memPaneHtml, threadsPaneHtml = G.threadsPaneHtml, libPaneHtml = G.libPaneHtml, globalSearchHtml = G.globalSearchHtml, esc = G.esc, icon = G.icon, homeIcon = G.homeIcon, navItemHtml = G.navItemHtml, captureHtml = G.captureHtml;
  function renderShell(L) {
    var bottom = L.bottom.map(function (item) {
      return '<button type="button" class="mp-nav-item" disabled title="' + esc(L.unsupported) + '">' + icon(item[0]) + '<span class="mp-nav-label">' + esc(item[1]) + '</span></button>';
    }).join("");
    var tabs = L.tabs.map(function (tab, index) {
      return '<button type="button" class="mp-tab' + (index === 0 ? " mp-on" : "") + '" data-mp-filter="' + tab[0] + '" aria-pressed="' + (index === 0) + '">' + esc(tab[1]) + "</button>";
    }).join("");

    return (
      '<div class="mp-window home-design">' +
      '<div class="mp-titlebar"><span class="mp-dots"><i></i><i></i><i></i></span>' +
      '<span class="mp-window-title">' + esc(L.windowTitle) + '</span><span class="mp-badge">' + esc(L.badge) + "</span></div>" +
      '<div class="mp-shell" data-current-view="timeline">' +
      '<div class="mp-rail-left home-sidebar home-design select-none">' +
      '<div class="home-sidebar-title"><button type="button" class="home-icon-button" disabled title="' + esc(L.unsupported) + '" aria-label="' + esc(L.closeLabel) + '">' + homeIcon("imgSidebarSimpleRightSquare") + '</button></div>' +
      '<button type="button" class="mp-drawer-close" data-mp-drawer-close aria-label="' + esc(L.closeLabel) + '">' + icon("panelleft") + '</button>' +
      '<nav class="mp-nav home-sidebar-nav" aria-label="' + esc(L.groupKnowledge) + '">' +
      '<div class="mp-nav-group home-nav-group"><button type="button" class="mp-search home-nav-button" data-mp-global-search>' + homeIcon("imgMagnifyingGlassSearch") + '<span>' + esc(L.search) + '</span></button>' + navItemHtml(L, L.nav[0]) + '</div>' +
      '<div class="mp-nav-group home-nav-group"><p class="mp-rail-label home-nav-heading">' + esc(L.groupKnowledge) + '</p>' +
      L.nav.slice(1, 4).map(function (item) { return navItemHtml(L, item); }).join("") +
      '<button type="button" class="mp-nav-item home-nav-button mp-nav-disclosure home-nav-disclosure" data-mp-library-toggle aria-expanded="true">' + homeIcon("imgNotebookCover") + '<span class="mp-nav-label">' + esc(L.libraryNavLabel) + '</span><i class="mp-ws-switch home-nav-chevron">' + homeIcon("SidebarChevronDownSmall") + '</i></button>' +
      '<div class="mp-nav-children home-nav-children" data-mp-library-children data-open="true">' + L.libraryChildren.map(function (item) { return navItemHtml(L, item); }).join("") + '</div></div>' +
      '<div class="mp-nav-group home-nav-group"><p class="mp-rail-label home-nav-heading">' + esc(L.groupAI) + '</p>' +
      L.nav.slice(4).map(function (item) { return navItemHtml(L, item); }).join("") + '</div></nav>' +
      '<div class="mp-rail-bottom home-sidebar-footer">' +
      '<button type="button" class="mp-nav-item mp-workspace-toggle home-account-trigger" data-mp-workspace aria-expanded="false"><span class="home-account-place">' + esc(L.workspaceKind) + '</span><span class="home-account-copy"><b>' + esc(L.workspace) + '</b><small>' + homeIcon(["img", "Cryptopunk", "Nft", "Pfp", "Profile", "Avatar"].join("")) + esc(L.workspace) + '</small></span></button>' +
      '<div class="mp-workspace-menu" data-mp-workspace-menu hidden>' + bottom + '</div></div>' +
      '</div>' +
      '<div class="mp-main">' + homeViewHtml(L, tabs) +
      memPaneHtml(L) + threadsPaneHtml(L) + libPaneHtml(L) +
      '</div></div>' +
      '<div class="mp-mobile-nav"><button type="button" data-mp-view="timeline">' + icon("home") + '<span>' + esc(L.nav[0][1]) + '</span></button>' +
      '<button type="button" data-mp-more aria-expanded="false">' + icon("grid") + '<span>' + esc(L.more) + '</span></button></div>' +
      globalSearchHtml(L) +
      '</div>'
    );
  }


  Object.assign(G, {renderShell});
})();
