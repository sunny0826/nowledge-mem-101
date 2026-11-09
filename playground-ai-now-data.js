(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) { module.exports = factory(); return; }
  (root.NMemModules = root.NMemModules || []).push(["playground-ai-now-data.js", function () {
    root.MemPlaygroundAIData = factory();
  }]);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var FIXTURES = {
  "en": {
    "context": "Atlas planning context — fictional practice scenario\n\nGoal: decide whether to hold one cross-team planning review next quarter.\nScope: use existing quarterly notes to check dependencies over the next twelve months.\nNot decided here: how often future reviews should happen.\nCurrent practice: each team already runs quarterly reviews.\nConstraint: reuse existing review notes; avoid a second reporting process.\nOpen question: would a broader review reveal cross-team dependencies earlier?\nStatus: no pilot has been approved.",
    "source": "# Atlas planning interviews — fictional practice material\n\nThese notes are invented for this course, not real customer evidence.\n\n## Interview A — dependency visibility\nA team noticed a shared dependency only after committing to its quarterly plan.\nThe interviewee wants teams to compare plans for the next twelve months before committing.\n\n## Interview B — preparation burden\nTeams already write quarterly review notes.\nThe interviewee would try a joint review if those notes could be reused,\nbut does not want a second reporting process.\n\n## Interview C — unanswered question\nThis team has not tested a cross-team review of dependencies over the next twelve months.\nThese interviews contain no measurement of time saved or dependencies avoided.",
    "record": "Atlas planning recommendation — fictional practice scenario\n\nStatus: recommendation; no pilot approved.\nRecommendation: try one cross-team planning review next quarter, using existing quarterly notes to check dependencies over the next twelve months. Future review frequency remains undecided.\nBasis: Library source atlas-planning-interviews.md, Interview A describes a missed dependency; Interview B conditions participation on reusing notes.\nLimit: Interview C confirms no trial or measured benefit. These are fictional course notes.\nNext step: ask the review owner to define a preparation limit and a measure of dependencies found, then decide whether to approve the pilot."
  },
  "zh": {
    "context": "Atlas 计划背景 — 虚构练习场景\n\n目标：判断是否在下个季度进行一次跨团队计划评审。\n范围：用现有季度记录检查未来十二个月的依赖。\n本次不决定：今后的评审频率。\n现有做法：各团队已经进行季度复盘。\n约束：复用现有复盘记录，避免增加一套汇报流程。\n待回答：扩大复盘范围，能否更早发现跨团队依赖？\n状态：试行尚未获批。",
    "source": "# Atlas 计划访谈 — 虚构练习材料\n\n以下内容为课程编写，不是真实客户证据。\n\n## 访谈 A — 依赖可见性\n一个团队在确定季度计划后，才发现一项共同依赖。\n受访者希望各团队在承诺计划前，先比较未来十二个月的安排。\n\n## 访谈 B — 准备负担\n各团队已经撰写季度复盘记录。\n受访者愿意尝试联合复盘，前提是复用这些记录，\n而不是增加一套汇报流程。\n\n## 访谈 C — 待回答的问题\n该团队尚未试行针对未来十二个月依赖的跨团队评审。\n这些访谈没有测量节省的时间或避免的依赖问题。",
    "record": "Atlas 计划建议 — 虚构练习场景\n\n状态：建议，试行尚未获批。\n建议：下季度尝试一次跨团队计划评审，用现有季度记录检查未来十二个月的依赖。今后的评审频率仍未决定。\n依据：Library 来源 atlas-planning-interviews.md 的访谈 A 记录了遗漏的依赖；访谈 B 以复用现有记录作为参与条件。\n局限：访谈 C 明确尚未试行，也没有实测收益。这些是虚构课程材料。\n下一步：请评审负责人先确定准备工作的上限，以及衡量提前发现依赖的方式，再决定是否批准试行。"
  }
};
  var COPY = {
    en: {
      thinking: "Processing · simulation", processed: "Processing steps · simulation", stopped: "Stopped. You can send the request again.", stop: "Stop",
      stages: {start:"Preparing the request", context:"Checking local memories", source:"Checking memories and Library sources", research:"Preparing a research simulation · no web search", save:"Checking the record before saving", settings:"Checking supported settings · simulation", answer:"Preparing the response"},
      tasks: "Conversations", newTask: "New Task", search: "Search conversations...", empty: "What can I help with?",
      currentTasks: "Current conversations", archivedTasks: "Archived conversations", plugins: "Plugins", plans: "Plans", planning: "Planning", attach: "Add file or folder", unavailable: "Not available in this simulation",
      placeholder: "Ask anything...", research: "Research", send: "Send", back: "Back", you: "You",
      notice: "Local simulation · fictional Atlas data · preset replies · no AI or web requests. Refresh to reset.",
      intro: "Ask about Atlas planning memories, read its interview source, draft a recommendation, or check and change supported settings.",
      reference: "Add context", none: "No matching saved item.", memory: "Memory", source: "Library source",
      contextTitle: "Atlas planning context", resultTitle: "Atlas planning recommendation", draft: "Draft — not saved",
      unsupported: "This simulation handles the fictional Atlas planning example and its supported settings only. Ask for its saved context, interview source, evidence brief, research gap, result record, or the AI output language setting.",
      missingContext: "The Atlas context memory is missing. Save the fictional planning context before asking for analysis.",
      missingSource: "The interview source is not Searchable in Library. Import atlas-planning-interviews.md and wait for indexing before continuing.",
      missingRecord: "No saved Atlas recommendation was found. A draft in a previous task is not a saved memory.",
      needDraft: "Draft and check a result record in this task before asking to save it.",
      saved: "Saved in this local Playground. Open the memory below to check the actual record. No pilot is approved.",
      settingsList: "Supported settings in this simulation\n\nAI output language — current saved value: {current}.\n\nIn the real app, AI Now first checks which settings the current connection supports, changes only the fields you name, and reads back the saved value. Interface language, AI output language, task model, and background model are separate settings; say which one you mean.",
      settingsChanged: "Changed — AI output language: {from} → {to}.\nReading back the saved value: {to}. The change applies immediately in this simulation; no restart is needed.\nOther settings are unchanged.\n\nIn the real app, some saved settings need a restart before the running backend uses them. AI Now can schedule an explicitly requested restart only for a backend managed by the local desktop app.",
      settingsReport: "Changed settings in this session\n\n{lines}\n\nNo restart is pending. In the real app, the same question lists what changed so you can confirm each value before you keep or restore it.",
      settingsReportNone: "Changed settings in this session\n\nNone yet. In the real app, the same question lists what changed so you can confirm each value before you keep or restore it.",
      settingsReverted: "Restored — AI output language: {from} → {to}.\nReading back the saved value: {to}.\n\nIn the real app, restoring works the same way: name the setting and the value to restore, then ask for the saved value to be read back.",
      settingsNothingToRestore: "Nothing to restore yet. Current saved value: {current}.\n\nIn the real app, name the setting and the value to restore, then ask for the saved value to be read back.",
      contextAnswer: "The saved context concerns one review next quarter, covering dependencies over the next twelve months. Teams already hold quarterly reviews. Reuse existing notes; avoid extra reporting. Future frequency and the pilot remain undecided. The context does not establish that a broader review will work.",
      sourceAnswer: "Read atlas-planning-interviews.md, Interviews A–C. A describes a missed dependency. B permits a trial only when existing notes can be reused; it does not support extra reporting. C records no trial or measured benefit. Open the source below to compare the original passages.",
      brief: "Evidence brief\n\nSupports a trial — Interview A reports a missed dependency; it does not prove a cross-team review will solve it.\n\nCondition — Interview B requires reuse of existing notes, not additional reporting.\n\nGap — Interview C records no trial or measured benefit. This is neither proof of success nor proof of failure.\n\nInternal question — How much preparation can the team support?\nPublic research question — Which documented methods expose cross-team dependencies before plans are committed?\n\nAssumption — One review might help; this has not been tested.\nNext action — Ask the review owner to set a preparation limit and a measure of dependencies found. No pilot has been approved; future frequency stays undecided.",
      researchAnswer: "Simulated research outcome — no public evidence is supplied by this demo. No web search has run.\n\nRecord the gap: a method and its measured outcome still need verification. In the real app, check the source link, publication date, participants, planning horizon, and limitations.\n\nNext action: run the scoped search in Nowledge Mem, or ask the review owner to plan a small internal trial. This demo's empty result does not mean no evidence exists.",
      activity: {context:"Search memories · local sample", source:"Read Library source · local sample", brief:"Read memory and source · local sample", research:"Research simulation · no network", draft:"Draft record · not saved", save:"Write memory · local Playground", recall:"Search saved result · local Playground", settings:"Check settings · local sample", "setting-change":"Change setting · local Playground", "setting-report":"Review changed settings · local sample", "setting-revert":"Restore setting · local Playground", missing:"Missing prerequisite", unsupported:"Preset simulation"},
      date: "Reviewed", searchable: "Searchable", importing: "Indexing…"
    },
    zh: {
      thinking: "思考中 · 模拟", processed: "处理过程 · 模拟", stopped: "已停止，可以重新发送问题。", stop: "停止",
      stages: {start:"正在整理问题", context:"正在检查本地记忆", source:"正在检查记忆与 Library 来源", research:"正在准备研究模拟 · 不联网", save:"正在检查记录与保存条件", settings:"正在检查可用设置 · 模拟", answer:"正在组织回答"},
      tasks: "对话", newTask: "新建任务", search: "搜索对话…", empty: "有什么可以帮你？",
      currentTasks: "当前对话", archivedTasks: "已归档对话", plugins: "插件", plans: "计划", planning: "规划", attach: "添加文件或文件夹", unavailable: "此模拟暂不支持",
      placeholder: "随便问…", research: "研究", send: "发送", back: "返回", you: "你",
      notice: "本地模拟 · Atlas 虚构数据 · 预设回答 · 不调用 AI 或联网。刷新后重置。",
      intro: "试着找回 Atlas 计划背景、阅读访谈来源、起草一条建议记录，或查看与修改支持的设置。",
      reference: "附加上下文", none: "没有匹配的已保存条目。", memory: "记忆", source: "Library 来源",
      contextTitle: "Atlas 计划背景", resultTitle: "Atlas 计划建议", draft: "草稿 — 尚未保存",
      unsupported: "此模拟仅支持 Atlas 虚构计划案例及其支持的设置。可以请求已存背景、访谈来源、证据简报、调查缺口、结果记录，或 AI 输出语言设置。",
      missingContext: "没有找到 Atlas 背景记忆。请先保存虚构计划背景，再请求分析。",
      missingSource: "Library 中尚无可检索的访谈来源。请导入 atlas-planning-interviews.md，等待索引完成后继续。",
      missingRecord: "没有找到已保存的 Atlas 计划建议。上一任务中的草稿不等于已保存的记忆。",
      needDraft: "请先在当前任务中起草并核对结果记录，再请求保存。",
      saved: "已保存到本地 Playground。请打开下方记忆，核对实际记录。试行仍未获批。",
      settingsList: "此模拟支持的设置\n\nAI 输出语言 — 当前保存值：{current}。\n\n在真实应用中，AI Now 会先检查当前连接支持哪些设置，只修改你指定的项，并读回保存后的值。界面语言、AI 输出语言、任务模型和后台模型是互相独立的设置，需要说清楚要改哪一项。",
      settingsChanged: "已修改 — AI 输出语言：{from} → {to}。\n读回保存值：{to}。此模拟中立即生效，无需重启。\n其他设置保持不变。\n\n在真实应用中，部分设置保存后需要重启才会生效；只有本地桌面 App 管理的后端，AI Now 才能在你明确要求时安排重启。",
      settingsReport: "本次练习中已修改的设置\n\n{lines}\n\n没有待重启的改动。在真实应用中，同样的问题会列出改过哪些设置，便于逐项确认后再决定保留或还原。",
      settingsReportNone: "本次练习中已修改的设置\n\n还没有改动。在真实应用中，同样的问题会列出改过哪些设置，便于逐项确认后再决定保留或还原。",
      settingsReverted: "已还原 — AI 输出语言：{from} → {to}。\n读回保存值：{to}。\n\n在真实应用中，还原的方式相同：说明要改的设置和目标值，再要求读回保存后的值。",
      settingsNothingToRestore: "还没有可以还原的改动。当前保存值：{current}。\n\n在真实应用中，说明要还原的设置和目标值，再要求读回保存后的值。",
      contextAnswer: "已存背景讨论下季度的一次评审，检查未来十二个月的依赖。团队已有季度评审；必须复用现有记录，避免额外汇报。未来频率和试行都未决定。这些背景不能证明扩大评审范围一定有效。",
      sourceAnswer: "已读取 atlas-planning-interviews.md 的访谈 A–C。A 描述一次遗漏的依赖；B 仅在复用现有记录的条件下接受试行，并不支持额外汇报；C 没有试行或收益测量。打开下方来源，对照原始段落。",
      brief: "证据简报\n\n支持尝试 — 访谈 A 描述遗漏依赖，不能证明跨团队评审能解决它。\n\n参与条件 — 访谈 B 要求复用已有记录，不是增加汇报。\n\n缺口 — 访谈 C 没有试行或收益测量。这既不是有效的证据，也不是无效的证据。\n\n内部问题 — 团队能承担多少准备工作？\n公开研究问题 — 哪些有记录的方法能在计划承诺前发现跨团队依赖？\n\n假设 — 一次评审可能有帮助，但尚未验证。\n下一步 — 请评审负责人定义准备工作上限和发现依赖的衡量方式。试行尚未获批，未来频率仍未决定。",
      researchAnswer: "模拟调查结果 — 此原型不提供公开证据，也未执行联网搜索。\n\n记录缺口：方法及其测量结果仍待验证。在真实应用中，需要检查来源链接、发布日期、参与者、规划范围与局限。\n\n下一步：在 Nowledge Mem 执行限定范围的搜索，或请评审负责人设计一次小规模内部试行。本模拟的空结果不代表不存在证据。",
      activity: {context:"搜索记忆 · 本地样例", source:"读取 Library 来源 · 本地样例", brief:"读取记忆及来源 · 本地样例", research:"模拟研究 · 未联网", draft:"起草记录 · 未保存", save:"写入记忆 · 本地 Playground", recall:"检索已存结果 · 本地 Playground", settings:"查看设置 · 本地样例", "setting-change":"修改设置 · 本地 Playground", "setting-report":"汇总改动 · 本地样例", "setting-revert":"还原设置 · 本地 Playground", missing:"缺少前置材料", unsupported:"预设模拟"},
      date: "核对日期", searchable: "可检索", importing: "索引中…"
    }
  };

  return {FIXTURES:FIXTURES, COPY:COPY};
});
