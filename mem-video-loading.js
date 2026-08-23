/**
 * mem-video-loading.js
 * 为教程页面的 bilibili <iframe> 提供克制的加载状态与失败兜底：
 *
 *   - 每个 bilibili 教程 iframe 被包进一个 .mem-video-frame：
 *       播放区（.mem-video-stage）保持 16:9，加载时显示暖色占位 + 旋转指示器
 *       （延迟 350ms 出现，避免缓存闪烁），iframe load 后移除指示器；
 *       长时间等不到 load 也按时收起，避免一直转圈
 *   - 播放区下方常驻一行低调的兜底链接（按页面语言切换中英文）：
 *       无法播放时可直接前往 bilibili 观看
 *   - 与 React 共存（避免 iframe 重复与位置错乱）：
 *     重复/错位的根源：页面（Mintlify 客户端路由）由 React 渲染，若在 React 水合/挂载期间
 *     同步移动其管理的 <iframe> 节点，React 重渲染时会额外创建 iframe，或把 frame 重排到
 *     错误位置（例如内容顶部）。
 *     因此：
 *       a) 初始扫描推迟到水合结束之后（DOMContentLoaded + 延迟补偿 + load 兜底）
 *       b) MutationObserver 持续自愈：对观察到的所有变更统一防抖（150ms），等 React
 *          当前渲染批次稳定后再 reconcile —— 同一内容容器内同源 iframe 只保留一个；
 *          不含 iframe 的空 frame 视为孤儿移除
 *       c) 防抖后的 reconcile 会包装所有未初始化的 iframe（含客户端路由新增的 iframe），
 *          不再在 React 挂载中途改 DOM
 */
(function () {
  "use strict";

  var SPINNER_DELAY_MS = 350;
  var LOAD_TIMEOUT_MS = 5000; // 迟迟等不到 load 时按时收起指示器，避免无限旋转
  var DEFER_MS = 1200; // 水合补偿窗口
  var FRAME_CLASS = "mem-video-frame";
  var STAGE_CLASS = "mem-video-stage";
  var INIT_ATTR = "data-mem-video-init";
  // SPA（React 客户端路由）导航时，观察器若在 React 挂载过程中同步包装 <iframe>，
  // 会改动 React 正在管理的 DOM，导致 iframe 被 React 重排到错误位置（例如内容顶部）。
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

  function isZh() {
    return (document.documentElement.lang || "").toLowerCase().indexOf("zh") === 0;
  }

  // 只处理教程页里的 bilibili 播放器 iframe，不触碰其他 iframe
  function isTutorialIframe(node) {
    if (!node || node.tagName !== "IFRAME") {
      return false;
    }
    var src = node.getAttribute("src") || "";
    return src.indexOf("player.bilibili.com") !== -1;
  }

  function makeSpinner() {
    var el = document.createElement("div");
    el.className = "mem-video-spinner";
    return el;
  }

  // 从 bilibili 播放器地址中取出 bvid，拼出可跳转的观看页链接
  function watchUrlOf(iframe) {
    var src = iframe.getAttribute("src") || "";
    var m = src.match(/[?&]bvid=([^&]+)/);
    if (!m) {
      return "";
    }
    return "https://www.bilibili.com/video/" + m[1];
  }

  function makeFallback(url) {
    var caption = document.createElement("p");
    caption.className = "mem-video-fallback";
    if (url) {
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = isZh()
        ? "无法播放？在 bilibili 观看"
        : "Can't play? Watch on bilibili";
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
    frame.appendChild(makeFallback(watchUrlOf(iframe)));
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
          iframe.style.visibility = "hidden"; // 占位期间隐藏黑底播放器，避免与占位背景割裂
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

    // 整页已加载完成时 iframe 大概率已就绪：不转圈、直接展示
    if (document.readyState === "complete") {
      finish();
      return;
    }

    iframe.addEventListener("load", function () {
      finish();
    }, { once: true });

    // 兜底：迟迟等不到 load（如被网络拦截挂起）也不让指示器无限旋转
    safety = setTimeout(finish, LOAD_TIMEOUT_MS);

    startPending();
  }

  // 同一内容容器内同源 iframe 只保留第一个（其余为 React 重复）
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
    // 先清理重复与孤儿，再包装未处理的 iframe
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
