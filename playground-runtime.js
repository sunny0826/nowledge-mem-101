(function (root) {
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
    "playground/bind-threads.js",
    "playground.js",
    "playground-ai-now-data.js",
    "playground-ai-now-model.js",
    "playground-ai-now-renderer.js",
    "playground-ai-now.js",
    "course-playground-guide-core.js",
    "course-playground-guide-view.js",
    "course-playground-guide.js"
  ];
  if (typeof module !== "undefined" && module.exports) {
    module.exports = MODULES;
    return;
  }
  var queue = root.NMemModules = root.NMemModules || [];
  if (queue.registered) return;
  var pending = new Map();
  var index = 0;
  var draining = false;
  function register(entry) {
    var name = entry[0], initialize = entry[1];
    var position = MODULES.indexOf(name);
    if (position === -1 || typeof initialize !== "function") {
      throw new Error("Invalid Playground module: " + name);
    }
    if (position < index || pending.has(name)) return;
    pending.set(name, initialize);
    if (draining) return;
    draining = true;
    try {
      while (index < MODULES.length && pending.has(MODULES[index])) {
        var current = MODULES[index];
        pending.get(current)();
        pending.delete(current);
        index += 1;
      }
    } finally {
      draining = false;
    }
  }
  var waiting = queue.splice(0);
  queue.registered = true;
  queue.push = register;
  waiting.forEach(register);
})(typeof globalThis !== "undefined" ? globalThis : this);
