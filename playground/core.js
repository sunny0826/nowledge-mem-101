(window.NMemModules = window.NMemModules || []).push(["playground/core.js", function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};
  var MOUNT_ATTR = "data-mem-playground";
  var INIT_ATTR = "data-mem-playground-init";
  var DEFER_MS = 1200;
  var SCAN_DEBOUNCE_MS = 150;

  function isZh() {
    return (document.documentElement.lang || "").toLowerCase().indexOf("zh") === 0;
  }

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }


  var ICON_PATHS = {
    home: '<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M12 2.7 3 10v9.5A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5V10zM9.8 21v-5.5h4.4V21z"/>',
    lightbulb:
      '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    msgtext:
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
    asterisk: '<path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7"/>',
    share:
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
    network:
      '<rect x="9" y="2.5" width="6" height="6" rx="1"/><rect x="2.5" y="15.5" width="6" height="6" rx="1"/><rect x="15.5" y="15.5" width="6" height="6" rx="1"/><path d="M12 8.5V12M5.5 15.5V12h13v3.5"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    compass:
      '<circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M21 12c.55 0 1-.45.95-1a10 10 0 0 0-8.95-8.95c-.55-.05-1 .4-1 .95v8a1 1 0 0 0 1 1z"/>',
    puzzle:
      '<path d="M4 7h3a1 1 0 0 0 1-1V5a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 0 0-4 0v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a2 2 0 0 0 0-4H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>',
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
    user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.66V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.66"/>',
    updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
    bookopen:
      '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    diamonds:
      '<path d="M7.4 2.9l2.4 2.4-2.4 2.4-2.4-2.4z"/><path d="M16.6 2.9 19 5.3l-2.4 2.4-2.4-2.4z"/><path d="M7.4 16.3l2.4 2.4-2.4 2.4-2.4-2.4z"/><path d="M16.6 16.3l2.4 2.4-2.4 2.4-2.4-2.4z"/>',
    broadcast:
      '<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M7.7 7.7a6.1 6.1 0 0 0 0 8.6M16.3 7.7a6.1 6.1 0 0 1 0 8.6M5.1 5.1a9.7 9.7 0 0 0 0 13.8M18.9 5.1a9.7 9.7 0 0 1 0 13.8"/>',
    caret: '<path d="m6 9 6 6 6-6"/>',
    calendar:
      '<rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4.7C7.5 3.4 10 5.9 12.5 5.9c2.3 0 4.3-1.5 6.5-1.2v9.6c-2.2-.3-4.2 1.2-6.5 1.2-2.5 0-5-2.5-7.5-1.2"/>',
    database:
      '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>',
    warn: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    note: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/>',
    sparkles:
      '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    layers:
      '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    zap: '<path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z"/>',
    paperclip:
      '<path d="M21 12.5l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8L13 4.9a3.7 3.7 0 0 1 5.2 5.2l-8.3 8.3a1.85 1.85 0 0 1-2.6-2.6l7.8-7.8"/>',
    send: '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    chevron: '<path d="M9 18l6-6-6-6"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    panelleft:
      '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M9.2 4.5v15"/>',
    sliders:
      '<path d="M4 7h9M17.5 7H20M4 17h2.5M11 17h9"/><circle cx="15" cy="7" r="2.1"/><circle cx="8.5" cy="17" r="2.1"/>',
    star: '<path d="M12 3.1l2.7 5.5 6 .9-4.3 4.2 1 6-5.5-2.9-5.5 2.9 1-6L3.1 9.5l6-.9z"/>',
    trash:
      '<path d="M4 6.5h16"/><path d="M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7"/><path d="M18.5 6.5 17.7 19a2 2 0 0 1-2 1.9H8.3a2 2 0 0 1-2-1.9L5.5 6.5"/><path d="M10 10.7v5.6M14 10.7v5.6"/>',
    pin: '<path d="M9.3 3.5h5.4l.3 6.2 2.9 2.6.1 2.2H6l.1-2.2 2.9-2.6z"/><path d="M12 14.5v6"/>',
    refresh:
      '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.7 3.8v4.4h-4.4"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.2"/><path d="M12 7.6h.01"/>',
    faders:
      '<path d="M3.5 8h9.4M17.6 8h2.9M3.5 16h3.4M11.6 16h8.9"/><circle cx="15.2" cy="8" r="2.2"/><circle cx="9.2" cy="16" r="2.2"/>',
    scales:
      '<path d="M12 3.5V21M8.5 21h7"/><path d="M12 6 6.8 7M12 6l5.2 1"/><path d="M6.8 7 4 13.4a3 3 0 0 0 5.6 0zM17.2 7l-2.8 6.4a3 3 0 0 0 5.6 0z"/>',
    listchecks:
      '<path d="M10.8 6.2h9.7M10.8 12h9.7M10.8 17.8h9.7"/><path d="m3.4 5.7 1.5 1.5L7.6 4.5M3.4 11.5l1.5 1.5 2.7-2.7M3.4 17.3l1.5 1.5 2.7-2.7"/>',
    caldots:
      '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M16 2.8v3.6M8 2.8v3.6M3 9.6h18"/><circle cx="8.3" cy="13.8" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="13.8" r="1" fill="currentColor" stroke="none"/><circle cx="15.7" cy="13.8" r="1" fill="currentColor" stroke="none"/><circle cx="8.3" cy="17.2" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
    scan: '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/>',
    upload: '<path d="M12 15.5v-11"/><path d="m6.5 9.3 5.5-5.5 5.5 5.5"/><path d="M4.5 20h15"/>',
    checksquare:
      '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="m8.5 12.2 2.4 2.4 4.8-4.8"/>',
    chatcircle:
      '<path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5z"/>',
    copy: '<rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M5.5 15h-1a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/>',
  };

  var UNIT_ICONS = {
    fact: "info",
    preference: "faders",
    decision: "scales",
    plan: "flag",
    procedure: "listchecks",
    learning: "lightbulb",
    context: "compass",
    event: "caldots",
    auto: "sparkles",
  };

  function icon(name) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICON_PATHS[name] +
      "</svg>"
    );
  }

  function nowHM() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, "0");
    var m = String(now.getMinutes()).padStart(2, "0");
    return h + ":" + m;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      var copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) resolve();
      else reject(new Error("Clipboard access is unavailable."));
    });
  }


  Object.assign(G, {MOUNT_ATTR, INIT_ATTR, DEFER_MS, SCAN_DEBOUNCE_MS, isZh, esc, ICON_PATHS, UNIT_ICONS, icon, nowHM, copyText});
}]);
