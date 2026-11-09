(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) { module.exports = factory({}); return; }
  (root.NMemModules = root.NMemModules || []).push(["course-playground-guide-core.js", function () {
    root.NMemCourseGuide = factory(root.NMemCourseGuide || {});
  }]);
})(typeof globalThis !== "undefined" ? globalThis : this, function (G) {
  "use strict";
  var ROOT_SELECTOR = "[data-course-playground-guide]";
  var MIN_DOCK_WIDTH = 40 * 16;

  var SCENARIOS = {
    save: {
      steps: 5,
      fillSteps: [4],
      completion: "cleared",
      targets: {
        1: '[data-mp-view="timeline"]',
        2: "[data-mp-memory-actions]",
        3: "[data-mp-add-memory]",
        4: "[data-mp-input]",
        5: "[data-mp-send]",
      },
      changed: "[data-mp-timeline] .mp-entry",
    },
    recall: {
      steps: 2,
      fillSteps: [1],
      completion: "answer",
      targets: {
        1: "[data-mp-input]",
        2: "[data-mp-send]",
      },
      changed: ".mp-answer",
    },
    threads: {
      steps: 4,
      fillSteps: [2],
      completion: "view",
      targets: {
        1: '[data-mp-view="threads"]',
        2: "[data-mp-thr-q]",
        3: "[data-mp-thr-go]",
        4: "[data-mp-thread-open]",
      },
      changed: "[data-mp-thread-detail]",
    },
    "save-ask": {
      steps: 4,
      fillSteps: [1, 3],
      completion: "answer",
      targets: {
        1: "[data-mp-input]",
        2: "[data-mp-send]",
        3: "[data-mp-input]",
        4: "[data-mp-send]",
      },
      changed: ".mp-answer",
    },
    library: {
      steps: 5,
      fillSteps: [1, 3],
      completion: "view",
      targets: {
        1: "[data-mp-input]",
        2: "[data-mp-send]",
        3: "[data-mp-input]",
        4: "[data-mp-send]",
        5: '[data-mp-view="library"]',
      },
      changed: "[data-mp-lib-list] .mp-lib-row",
    },
  };

  var AI_TARGETS = {
    ai: '[data-mp-view="ai-now"]', library: '[data-mp-view="library"]',
    fill: '[data-mp-ai-input]', send: '[data-mp-ai-send]',
    source: '[data-mp-ai-last] [data-mp-ai-ref="source"]',
    memory: '[data-mp-ai-last] [data-mp-ai-ref="memory"]',
    import: '[data-mp-lib-import]', document: '[data-mp-lib-open="0"]',
    back: '[data-mp-pane]:not([hidden]) [data-mp-reader-back], [data-mp-lib-back]', research: '[data-mp-ai-research]',
    fresh: '[data-mp-ai-new]'
  };
  function aiScenario(actions) {
    var result = {steps:actions.length,fillSteps:[],targets:{},actions:actions,changed:actions[actions.length-1][0]==="source"||actions[actions.length-1][0]==="memory"?'[data-mp-reader-text]':'[data-mp-ai-last]'};
    actions.forEach(function(action,i){result.targets[i+1]=AI_TARGETS[action[0]];if(action[0]==="fill")result.fillSteps.push(i+1);});
    return result;
  }
  SCENARIOS["ai-context"] = aiScenario([["ai","view","ai-now"],["fill"],["send","reply","context"],["memory","read","memory"]]);
  SCENARIOS["ai-source"] = aiScenario([["library","view","library"],["import","imported","atlas-source"],["document","read","source"],["back","back"],["ai","view","ai-now"],["fill"],["send","reply","source"],["source","read","source"]]);
  SCENARIOS["ai-evidence"] = aiScenario([["ai","view","ai-now"],["fill"],["send","reply","brief"],["source","read","source"]]);
  SCENARIOS["ai-research"] = aiScenario([["ai","view","ai-now"],["research","research","on"],["fill"],["send","reply","research"]]);
  SCENARIOS["ai-save"] = aiScenario([["ai","view","ai-now"],["fill"],["send","reply","draft"],["source","read","source"],["back","back"],["fill"],["send","reply","save"],["memory","read","memory"],["back","back"],["fresh","new-task"],["fill"],["send","reply","recall"],["memory","read","memory"],["back","back"],["fill"],["send","reply","source"],["source","read","source"]]);
  SCENARIOS["ai-manage"] = aiScenario([["ai","view","ai-now"],["fill"],["send","reply","settings"],["fill"],["send","reply","setting-change"],["fill"],["send","reply","setting-report"],["fill"],["send","reply","setting-revert"]]);

  var AI_HISTORY = {
  "en": [
    {
      "text": "Search the saved Atlas planning memories in Nowledge Mem. We are considering one cross-team planning review next quarter, covering dependencies over the next twelve months. We are not deciding a recurring review schedule. List the relevant facts, constraints, and undecided questions, and identify the memories behind them. Use saved knowledge only; do not research the web or recommend a direction yet. Say which context is missing.",
      "research": false
    },
    {
      "text": "Find and read atlas-planning-interviews.md in Library alongside the Atlas planning memories already found. First identify the document and its sections. Then list statements relevant to holding one cross-team planning review of the next twelve months, citing the interview heading for each. Separate what the notes say from your interpretation. Use only these sources; if you cannot read the file, say so.",
      "research": false
    },
    {
      "text": "Based only on the Atlas planning memories and atlas-planning-interviews.md, write an evidence brief about holding one cross-team planning review next quarter to check dependencies over the next twelve months. Leave future review frequency undecided. Do not search the web. Include: 1. Findings that support a trial 2. Findings that limit or challenge it 3. Open questions, marked as internal questions or public research questions 4. Assumptions, kept separate from evidence 5. One small next step that would reduce uncertainty For each finding, give the source name and section, what it establishes, and what it does not establish. Do not force a finding into a category if there is no supporting evidence.",
      "research": false
    },
    {
      "text": "Find up to two documented methods that help teams spot cross-team dependencies before committing plans. Prefer original studies, documented trials, or first-hand case reports. For each method, give its source link, publication date, participants, planning horizon, and what was measured. Separate measured outcomes from advice or opinion. Explain what could inform one review of a twelve-month plan and what would still need an internal trial. If you find no relevant evidence, say so. Do not treat our fictional Atlas interviews as public evidence.",
      "research": true
    }
  ],
  "zh": [
    {
      "text": "在 Nowledge Mem 中搜索已保存的 Atlas 计划相关记忆。我们正在考虑下个季度进行一次跨团队计划评审，检查未来十二个月的依赖，本次不决定定期评审安排。列出相关事实、约束和待定问题，并说明各自来自哪些记忆。只使用已保存的知识，先不要搜索网络或给出建议。如果缺少上下文，请说明。",
      "research": false
    },
    {
      "text": "结合已找到的 Atlas 计划记忆，在 Library 中找到并阅读 atlas-planning-interviews.md。先说明文档名称和包含的章节，再列出与进行一次覆盖未来十二个月的跨团队计划评审有关的陈述，并引用各自的访谈标题。把原文内容和你的解读分开。只使用这些来源；如果无法读取文件，请说明。",
      "research": false
    },
    {
      "text": "只根据 Atlas 计划记忆和 atlas-planning-interviews.md，撰写一份证据简报，讨论是否在下季度进行一次跨团队计划评审，检查未来十二个月的依赖。保留今后评审频率未定的状态。不要搜索网络。 包含： 1. 支持试行的发现 2. 限制或质疑试行的发现 3. 开放问题，分别标为内部问题或公共研究问题 4. 假设，与证据分开 5. 一个能降低不确定性的小步骤 每项发现都说明来源名称和章节、能够证明什么、不能证明什么。没有依据时，不要为了填满分类而编造发现。",
      "research": false
    },
    {
      "text": "查找至多两种有记录的方法，了解团队如何在承诺计划前发现跨团队依赖。优先使用原始研究、有记录的试行或第一手案例报告。 每种方法都提供来源链接、发布日期、参与者、计划覆盖的时间范围和测量内容。区分实测结果与建议或观点。说明哪些内容可以用于一次覆盖十二个月计划的评审，哪些仍需内部试行。如果没有找到相关证据，请明确说明。不要把我们的虚构 Atlas 访谈当作公共证据。",
      "research": true
    }
  ]
};
  function aiPracticeSeed(scenario, lang) {
    var index = ["ai-context", "ai-source", "ai-evidence", "ai-research", "ai-save"].indexOf(scenario);
    return {source:index >= 2, history:AI_HISTORY[lang].slice(0, Math.max(0,index))};
  }

  function prepareAiPractice(state) {
    if (!G.spec(state).actions || state.aiSeeded) return;
    var mount=state.windowEl.querySelector('[data-mp-ai-ready]');
    if (!mount) return;
    state.aiSeeded=true;
    mount.dispatchEvent(new CustomEvent('mp:ai-seed',{detail:aiPracticeSeed(state.scenario,mount.mpAPI.zh?'zh':'en')}));
  }

  Object.assign(G, {ROOT_SELECTOR, MIN_DOCK_WIDTH, SCENARIOS, AI_TARGETS, AI_HISTORY, aiPracticeSeed, prepareAiPractice});
  return G;
});
