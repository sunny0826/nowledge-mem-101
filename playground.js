(window.NMemModules = window.NMemModules || []).push(["playground.js", function () {
  "use strict";

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

  start();
}]);
