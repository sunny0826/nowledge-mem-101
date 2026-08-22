/**
 * mem-video-loading.js
 * 为教程页面的 <video> 提供克制的加载状态（frame 包裹式）：
 *
 *   - 每个 <video> 被包进一个 .mem-video-frame：加载时显示暖色占位 + 旋转指示器
 *     （延迟 350ms 出现，避免缓存视频闪烁），元数据就绪后按真实比例收拢布局
 *   - 就绪后 frame 保留（圆角 + 溢出裁剪，呈现统一的视频外观），指示器移除
 *   - 加载失败时显示一行低调的提示文案
 *
 * 与 React 共存（避免视频重复与位置错乱）：
 *   重复/错位的根源：页面（Mintlify 客户端路由）由 React 渲染，若在 React 水合/挂载期间
 *   同步移动其管理的 <video> 节点，React 重渲染时会额外创建视频，或把 frame 重排到
 *   错误位置（例如内容顶部）。
 *   因此：
 *     a) 初始扫描推迟到水合结束之后（DOMContentLoaded + 延迟补偿 + load 兜底）
 *     b) MutationObserver 持续自愈：对观察到的所有变更统一防抖（150ms），等 React
 *        当前渲染批次稳定后再 reconcile —— 同一内容容器内同源视频只保留一个；
 *        不含视频的空 frame 视为孤儿移除
 *     c) 防抖后的 reconcile 会包装所有未初始化的视频（含客户端路由新增的视频），
 *        不再在 React 挂载中途改 DOM
 */
(function () {
  "use strict";

  var SPINNER_DELAY_MS = 350;
  var DEFER_MS = 1200; // 水合补偿窗口
  var FRAME_CLASS = "mem-video-frame";
  var INIT_ATTR = "data-mem-video-init";
  // SPA（React 客户端路由）导航时，观察器若在 React 挂载过程中同步包装 <video>，
  // 会改动 React 正在管理的 DOM，导致视频被 React 重排到错误位置（例如内容顶部）。
  // 因此对观察器的所有变更统一做防抖：等 React 当前渲染批次稳定后再 reconcile。
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

  function makeSpinner() {
    var el = document.createElement("div");
    el.className = "mem-video-spinner";
    return el;
  }

  function wrap(video) {
    var frame = document.createElement("div");
    frame.className = FRAME_CLASS;
    frame.style.aspectRatio = "16 / 9";
    video.before(frame);
    frame.appendChild(video);
    frame.appendChild(makeSpinner());
    return frame;
  }

  function initVideo(video) {
    if (video.getAttribute(INIT_ATTR)) {
      return;
    }
    video.setAttribute(INIT_ATTR, "true");

    var frame = wrap(video);
    var spinner = frame.querySelector(".mem-video-spinner");
    var timer = null;
    var settled = false;

    function startPending() {
      if (settled || timer) {
        return;
      }
      timer = setTimeout(function () {
        timer = null;
        if (!settled) {
          frame.setAttribute("data-state", "loading");
          video.hidden = true; // 占位期间隐藏黑底控件，避免与占位背景割裂
        }
      }, SPINNER_DELAY_MS);
    }

    function finish(videoReady) {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      var w = video.videoWidth;
      var h = video.videoHeight;
      if (w && h) {
        frame.style.aspectRatio = w + " / " + h;
      }
      video.hidden = videoReady ? false : true; // 失败时保持隐藏，占位背景 + 提示文字
      if (spinner && spinner.parentElement) {
        spinner.parentElement.removeChild(spinner);
      }
      frame.setAttribute("data-state", videoReady ? "ready" : "error");
      if (!videoReady) {
        var err = document.createElement("p");
        err.className = "mem-video-error";
        err.textContent = "视频加载失败，请稍后重试。";
        frame.appendChild(err);
      }
    }

    // 视频已在缓存中时不做加载效果（无 spinner、不隐藏），但保留 frame 统一样式
    if (video.readyState >= 2) {
      finish(true);
      return;
    }

    video.addEventListener("loadedmetadata", function () {
      var w = video.videoWidth;
      var h = video.videoHeight;
      if (w && h) {
        frame.style.aspectRatio = w + " / " + h;
      }
    }, { once: true });
    video.addEventListener("loadeddata", function () {
      finish(true);
    }, { once: true });
    video.addEventListener("error", function () {
      finish(false);
    }, { once: true });
    startPending();
  }

  // 同一内容容器内同源视频只保留第一个（其余为 React 重复）
  function dedupeContainer(video) {
    var container = containerOf(video);
    if (!container) {
      return;
    }
    var videos = container.querySelectorAll("video");
    if (videos.length <= 1) {
      return;
    }
    var seen = Object.create(null);
    videos.forEach(function (v) {
      var src = v.getAttribute("src") || v.currentSrc;
      if (!src) {
        return;
      }
      if (seen[src]) {
        removeNode(v);
      } else {
        seen[src] = v;
      }
    });
  }

  function cleanupEmptyFrames() {
    document.querySelectorAll("." + FRAME_CLASS).forEach(function (frame) {
      if (!frame.querySelector("video")) {
        removeNode(frame);
      }
    });
  }

  function reconcile() {
    // 先清理重复与孤儿，再包装未处理的视频
    document.querySelectorAll("video").forEach(dedupeContainer);
    cleanupEmptyFrames();
    document.querySelectorAll("video").forEach(function (v) {
      if (!v.getAttribute(INIT_ATTR)) {
        initVideo(v);
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
    var isVideo = node.tagName === "VIDEO";
    var containsAny = node.querySelector && node.querySelectorAll("." + FRAME_CLASS + ", video").length;
    if (isFrame || isVideo || containsAny) {
      scheduleReconcile();
    }
  }

  function init() {
    if (window.__memVideoLoadingInit) {
      return;
    }
    window.__memVideoLoadingInit = true;

    // 水合期间不做任何结构改动：延迟补偿窗口后再包装与自愈；
    // 窗口内观察器只记录不动手，load 事件可提前结束窗口。
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