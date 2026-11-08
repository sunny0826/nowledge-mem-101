(function () {
  "use strict";
  var MODULES = [
    "playground-home-templates.js",
    "playground-home.js",
    "playground/core.js",
    "playground/assets.js",
    "playground/search.js",
    "playground/locales/en-base.js",
    "playground/locales/en-timeline.js",
    "playground/locales/en-memories.js",
    "playground/locales/en-threads.js",
    "playground/locales/en-artifacts.js",
    "playground/locales/zh-base.js",
    "playground/locales/zh-timeline.js",
    "playground/locales/zh-memories.js",
    "playground/locales/zh-threads.js",
    "playground/locales/zh-artifacts.js",
    "playground/home-views.js",
    "playground/memory-views.js",
    "playground/thread-views.js",
    "playground/artifact-views.js",
    "playground/shell.js",
    "playground/context-actions.js",
    "playground/context.js",
    "playground/bind-home.js",
    "playground/bind-artifacts.js",
    "playground/bind-memories.js",
    "playground/bind-threads.js"
  ];

  function start() {
    var G = window.NMemPlayground;
    var MOUNT_ATTR = G.MOUNT_ATTR, DEFER_MS = G.DEFER_MS, SCAN_DEBOUNCE_MS = G.SCAN_DEBOUNCE_MS, isZh = G.isZh, esc = G.esc, icon = G.icon, nowHM = G.nowHM, renderLibList = G.renderLibList;
    var scanTimer = null;

    function init(mount) {
      var context = G.createContext(mount);
      if (!context) return;
      G.bindHome(context);
      G.bindArtifacts(context);
      G.bindMemories(context);
      G.bindThreads(context);
      var state = context.state, L = context.L, setView = context.setView, rerenderAll = context.rerenderAll;
      rerenderAll();
      mount.mpAPI = {mount:mount,state:state,L:L,zh:isZh(),esc:esc,icon:icon,nowHM:nowHM,setView:setView,rerender:rerenderAll,renderLibrary:function(){renderLibList(mount,L,state);}};
      mount.dispatchEvent(new CustomEvent("mp:ready", {bubbles:true,detail:mount.mpAPI}));
    }

    function scan() {
      var mounts = document.querySelectorAll("[" + MOUNT_ATTR + "]");
      for (var i = 0; i < mounts.length; i++) init(mounts[i]);
    }

    function scheduleScan() {
      if (scanTimer) return;
      scanTimer = setTimeout(function () {
        scanTimer = null;
        scan();
      }, SCAN_DEBOUNCE_MS);
    }

    var observer = new MutationObserver(scheduleScan);
    function boot() {
      setTimeout(function () {
        scan();
        observer.observe(document.documentElement, {childList:true,subtree:true});
      }, DEFER_MS);
    }

    if (document.readyState === "complete") boot();
    else window.addEventListener("load", boot, {once:true});
  }

  function load(index) {
    if (index === MODULES.length) {
      start();
      return;
    }
    var script = document.createElement("script");
    script.src = "/" + MODULES[index] + "?v=3";
    script.onload = function () { load(index + 1); };
    script.onerror = function () { throw new Error("Cannot load " + MODULES[index]); };
    document.head.appendChild(script);
  }

  load(0);
})();
