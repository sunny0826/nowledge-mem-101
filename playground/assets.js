(window.NMemModules = window.NMemModules || []).push(["playground/assets.js", function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};
  var esc = G.esc, icon = G.icon;

  function appAsset(group, name, invert) {
    return '<img src="/playground-assets/' + group + '/' + name + '.svg" alt="" aria-hidden="true"' + (invert === false ? "" : ' class="mp-invert"') + '>';
  }

  function appPageHeaderHtml(title) {
    return '<header class="page-header"><div class="page-header-row"><h1 class="page-header-title font-display">' + esc(title) + '</h1></div></header>';
  }

  function sourceIconHtml(source) {
    var value = String(source || "").toLowerCase();
    if (value.indexOf("kimi") !== -1) return '<img src="/playground-assets/threads/kimi.svg" alt="" aria-hidden="true">';
    if (value.indexOf("codex") !== -1 || value.indexOf("openai") !== -1 || value.indexOf("chatgpt") !== -1) return '<img class="mp-brand-invert" src="/playground-assets/threads/openai.svg" alt="" aria-hidden="true">';
    if (value.indexOf("claude") !== -1 || value.indexOf("anthropic") !== -1) return '<img src="/playground-assets/threads/claude.svg" alt="" aria-hidden="true">';
    if (value.indexOf("cursor") !== -1) return '<img src="/playground-assets/threads/cursor.svg" alt="" aria-hidden="true">';
    if (value === "ai-now") return '<img src="/logo/nowledge-mem-logo-128.png" alt="" aria-hidden="true">';
    if (value === "you" || value === "你" || value === "manual") return icon("user");
    return appAsset("threads", "robot");
  }

  function appPaginationHtml(V, count, kind) {
    return '<div class="mp-app-pagination"><span data-mp-' + kind + '-pagetext>' + (count ? esc(V.range(1, count, count)) : "") + '</span><div class="mp-app-page-buttons"><button type="button" class="mp-app-prev" disabled aria-label="' + esc(V.prev) + '">' + icon("chevron") + '<span>' + esc(V.prev) + '</span></button><button type="button" class="mp-on" aria-current="page">1</button><button type="button" disabled aria-label="' + esc(V.next) + '"><span>' + esc(V.next) + '</span>' + icon("chevron") + '</button></div></div>';
  }

  Object.assign(G, {appAsset, appPageHeaderHtml, sourceIconHtml, appPaginationHtml});
}]);
