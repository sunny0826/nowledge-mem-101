(function () {
  "use strict";

  var SPINNER_DELAY_MS = 350;
  var LOAD_TIMEOUT_MS = 5000;
  var DEFER_MS = 1200;
  var FRAME_CLASS = "mem-video-frame";
  var STAGE_CLASS = "mem-video-stage";
  var INIT_ATTR = "data-mem-video-init";
  var RECONCILE_DEBOUNCE_MS = 150;
  var reconcileTimer = null;

  function scheduleReconcile() {
    if (reconcileTimer) {
      return;
    }
    reconcileTimer = setTimeout(function () {
      reconcileTimer = null;
      reconcile();
    }, RECONCILE_DEBOUNCE_MS);
  }

  function containerOf(node) {
    return node.closest ? (node.closest(".mdx-content") || null) : null;
  }

  function removeNode(node) {
    if (node && node.parentElement) {
      node.parentElement.removeChild(node);
    }
  }

  function isZh() {
    return (document.documentElement.lang || "").toLowerCase().indexOf("zh") === 0;
  }

  function isTutorialIframe(node) {
    if (!node || node.tagName !== "IFRAME") {
      return false;
    }
    var src = node.getAttribute("src") || "";
    return (
      src.indexOf("player.bilibili.com") !== -1 ||
      src.indexOf("youtube.com/embed") !== -1 ||
      src.indexOf("youtube-nocookie.com/embed") !== -1
    );
  }

  function makeSpinner() {
    var el = document.createElement("div");
    el.className = "mem-video-spinner";
    return el;
  }

  function watchUrlOf(iframe) {
    var src = iframe.getAttribute("src") || "";
    if (src.indexOf("player.bilibili.com") !== -1) {
      var m = src.match(/[?&]bvid=([^&]+)/);
      if (!m) {
        return "";
      }
      return "https://www.bilibili.com/video/" + m[1];
    }
    var y = src.match(/\/embed\/([^?&#]+)/);
    if (!y) {
      return "";
    }
    return "https://youtu.be/" + y[1];
  }

  function makeFallback(url, src) {
    var caption = document.createElement("p");
    caption.className = "mem-video-fallback";
    if (url) {
      var isBilibili = src.indexOf("player.bilibili.com") !== -1;
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = isBilibili
        ? (isZh() ? "无法播放？在 bilibili 观看" : "Can't play? Watch on bilibili")
        : (isZh() ? "无法播放？在 YouTube 观看" : "Can't play? Watch on YouTube");
      caption.appendChild(a);
    }
    return caption;
  }

  function wrap(iframe) {
    var frame = document.createElement("div");
    frame.className = FRAME_CLASS;

    var stage = document.createElement("div");
    stage.className = STAGE_CLASS;

    iframe.before(frame);
    frame.appendChild(stage);
    stage.appendChild(iframe);
    stage.appendChild(makeSpinner());
    frame.appendChild(makeFallback(watchUrlOf(iframe), iframe.getAttribute("src") || ""));
    return frame;
  }

  function initIframe(iframe) {
    if (iframe.getAttribute(INIT_ATTR)) {
      return;
    }
    iframe.setAttribute(INIT_ATTR, "true");

    var frame = wrap(iframe);
    var spinner = frame.querySelector(".mem-video-spinner");
    var timer = null;
    var safety = null;
    var settled = false;

    function startPending() {
      if (settled || timer) {
        return;
      }
      timer = setTimeout(function () {
        timer = null;
        if (!settled) {
          frame.setAttribute("data-state", "loading");
          iframe.style.visibility = "hidden";
        }
      }, SPINNER_DELAY_MS);
    }

    function finish() {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (safety) {
        clearTimeout(safety);
        safety = null;
      }
      iframe.style.visibility = "visible";
      if (spinner && spinner.parentElement) {
        spinner.parentElement.removeChild(spinner);
      }
      frame.setAttribute("data-state", "ready");
    }

    if (document.readyState === "complete") {
      finish();
      return;
    }

    iframe.addEventListener("load", function () {
      finish();
    }, { once: true });

    safety = setTimeout(finish, LOAD_TIMEOUT_MS);

    startPending();
  }

  function dedupeContainer(iframe) {
    var container = containerOf(iframe);
    if (!container) {
      return;
    }
    var frames = container.querySelectorAll("iframe");
    if (frames.length <= 1) {
      return;
    }
    var seen = Object.create(null);
    frames.forEach(function (f) {
      var src = f.getAttribute("src") || f.src;
      if (!src) {
        return;
      }
      if (seen[src]) {
        removeNode(f);
      } else {
        seen[src] = f;
      }
    });
  }

  function cleanupEmptyFrames() {
    document.querySelectorAll("." + FRAME_CLASS).forEach(function (frame) {
      if (!frame.querySelector("iframe")) {
        removeNode(frame);
      }
    });
  }

  function reconcile() {
    document.querySelectorAll("iframe").forEach(dedupeContainer);
    cleanupEmptyFrames();
    document.querySelectorAll("iframe").forEach(function (f) {
      if (isTutorialIframe(f) && !f.getAttribute(INIT_ATTR)) {
        initIframe(f);
      }
    });
  }

  function handleAdded(node) {
    if (node.nodeType !== 1) {
      return;
    }
    scheduleReconcile();
  }

  function handleRemoved(node) {
    if (node.nodeType !== 1) {
      return;
    }
    var isFrame = node.classList && node.classList.contains(FRAME_CLASS);
    var isIframe = node.tagName === "IFRAME";
    var containsAny = node.querySelector && node.querySelectorAll("." + FRAME_CLASS + ", iframe").length;
    if (isFrame || isIframe || containsAny) {
      scheduleReconcile();
    }
  }

  function init() {
    if (window.__memVideoLoadingInit) {
      return;
    }
    window.__memVideoLoadingInit = true;

    var armed = false;
    function arm() {
      if (armed) {
        return;
      }
      armed = true;
      reconcile();
    }
    setTimeout(arm, DEFER_MS);
    window.addEventListener("load", arm, { once: true });

    if (window.MutationObserver) {
      var observer = new MutationObserver(function (mutations) {
        if (!armed) {
          return;
        }
        mutations.forEach(function (m) {
          m.addedNodes.forEach(handleAdded);
          m.removedNodes.forEach(handleRemoved);
        });
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
