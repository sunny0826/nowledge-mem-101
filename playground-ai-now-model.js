(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    var data = require("./playground-ai-now-data.js");
    module.exports = factory(data.FIXTURES, data.COPY);
    return;
  }
  (root.NMemModules = root.NMemModules || []).push(["playground-ai-now-model.js", function () {
    root.MemPlaygroundAIModel = factory(root.MemPlaygroundAIData.FIXTURES, root.MemPlaygroundAIData.COPY);
  }]);
})(typeof globalThis !== "undefined" ? globalThis : this, function (FIXTURES, COPY) {
  "use strict";
  function createModel(lang, store) {
    var C = COPY[lang], F = FIXTURES[lang];
    var draft = null;
    function reply(kind, text, refs) { return {kind:kind, text:text, refs:refs || []}; }
    return {
      reset: function () { draft = null; },
      send: function (text, research) {
        text = text.trim();
        if (!text) return null;
        var source = store.source(), context = store.memory("atlas-context"), record = store.memory("atlas-result");
        var wantsDraft = /\bdraft\b|起草/i.test(text);
        var wantsSave = /^(?:please\s+)?(?:save|update)\b|^(?:请)?(?:将|把).*(?:保存|更新)|^保存/i.test(text) && !/do not save|不要保存|暂不保存|先不要保存/i.test(text);
        var wantsRecall = /(?:find|search|recall).*(?:recommendation|saved result)|(?:找到|找回|搜索).*(?:Atlas\s*(?:计划)?\s*(?:建议|结果)|已保存的(?:记录|结果|建议))/i.test(text);
        var wantsBrief = /evidence brief|证据简报/i.test(text);
        var wantsSource = /atlas-planning-interviews\.md|Interview B|访谈 B/i.test(text);
        if (/setting|language|设置|语言/i.test(text)) {
          var s = store.settings || (store.settings = {outputLanguage: lang === "zh" ? "英文" : "English", changes: []});
          var zhTarget = lang === "zh" ? "中文" : "Chinese", enTarget = lang === "zh" ? "英文" : "English";
          var zhAt = text.search(/中文|chinese/i), enAt = text.search(/英文|english/i);
          var target = zhAt === -1 && enAt === -1 ? null : zhAt === -1 ? enTarget : enAt === -1 ? zhTarget : zhAt > enAt ? zhTarget : enTarget;
          var restore = /change[^\n]*back to|revert|restore|改回|还原|恢复/i.test(text);
          if (restore || (target && /\bchange\b|\bswitch\b|改为|改成|切换/i.test(text))) {
            var from = s.outputLanguage;
            if (!target) target = s.changes.length ? s.changes[s.changes.length - 1].from : null;
            if (!target || target === from) return reply(restore ? "setting-revert" : "setting-change", C.settingsNothingToRestore.replace("{current}", from));
            s.outputLanguage = target;
            s.changes.push({from: from, to: target});
            return reply(restore ? "setting-revert" : "setting-change", (restore ? C.settingsReverted : C.settingsChanged).replace(/\{from\}/g, from).replace(/\{to\}/g, target));
          }
          if (/did you change|what did you change|which settings did|have you changed|take effect|took effect|改过|改了哪些|哪些改动|生效/.test(text)) {
            var last = s.changes[s.changes.length - 1];
            return reply("setting-report", last ? C.settingsReport.replace("{lines}", s.changes.map(function (change) { return (lang === "zh" ? "AI 输出语言：" : "AI output language: ") + change.from + " → " + change.to; }).join("\n") + (lang === "zh" ? "\n当前保存值：" : "\nCurrent saved value: ") + s.outputLanguage + (lang === "zh" ? "。" : ".")) : C.settingsReportNone);
          }
          return reply("settings", C.settingsList.replace("{current}", s.outputLanguage));
        }
        if (wantsSave) {
          if (!draft) return reply("missing", C.needDraft);
          store.save("atlas-result", C.resultTitle, draft);
          return reply("save", C.saved, ["atlas-result"]);
        }
        var readsOriginal = /(?:read|quote).*(?:atlas-planning-interviews|Interview B|source)|(?:阅读|引用).*(?:atlas-planning-interviews|访谈 B|来源)/i.test(text);
        if (wantsRecall && !readsOriginal) return record ? reply("recall", record.text, ["atlas-result"]) : reply("missing", C.missingRecord);
        if (research) return reply("research", C.researchAnswer);
        if (!/atlas|计划背景|planning|访谈/i.test(text)) return reply("unsupported", C.unsupported);
        if (!context) return reply("missing", C.missingContext);
        if (wantsDraft || wantsBrief || wantsSource) {
          if (!source || source.status !== "indexed") return reply("missing", C.missingSource);
          if (wantsDraft) {
            draft = F.record + "\n" + C.date + ": " + new Date().toISOString().slice(0,10);
            return reply("draft", C.draft + "\n\n" + draft, ["atlas-source"]);
          }
          var passage = (source.text || source.excerpt || "").match(/## (?:Interview|访谈) B[^\n]*\n([\s\S]*?)(?=\n## |$)/);
          var sourceText = C.sourceAnswer + (passage ? "\n\n" + (lang === "zh" ? "访谈 B 原文：\n" : "Interview B — original passage:\n") + passage[1].trim() : "");
          return wantsBrief ? reply("brief", C.brief, ["atlas-context","atlas-source"]) : reply("source", sourceText, ["atlas-source"]);
        }
        return reply("context", C.contextAnswer, ["atlas-context"]);
      }
    };
  }

  function createTask(lang, store, history) {
    var task = {title:COPY[lang].newTask,messages:[],research:false,input:"",model:createModel(lang,store)};
    (history || []).forEach(function(turn) {
      var reply = task.model.send(turn.text, !!turn.research);
      if (!reply) return;
      if (!task.messages.length) task.title=turn.text.slice(0,42);
      task.messages.push({role:'user',text:turn.text},Object.assign({role:'assistant'},reply));
    });
    return task;
  }

  function startResponse(options) {
    var schedule=options.schedule||setTimeout, unschedule=options.unschedule||clearTimeout;
    var active=true, timer=null, stage=0;
    function tick() {
      if(!active) return;
      if(options.valid && !options.valid()){active=false;return;}
      if(stage < options.stages.length) {
        options.onStage(stage++);
        timer=schedule(tick,800);
      } else {
        active=false;
        options.onComplete(options.work());
      }
    }
    tick();
    return {cancel:function(){active=false;unschedule(timer);}};
  }


  return {createModel:createModel, createTask:createTask, fixtures:FIXTURES, startResponse:startResponse};
});
