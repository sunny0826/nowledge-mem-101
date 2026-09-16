/* Local AI Now replica. Preset fictional data only; no model or network calls.
 * UI structure checked against the app DOM on 2026-09-16.
 * Course sequences live in course-playground-guide.js, not this component.
 */
(function () {
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
      stages: {start:"Preparing the request", context:"Checking local memories", source:"Checking memories and Library sources", research:"Preparing a research simulation · no web search", save:"Checking the record before saving", answer:"Preparing the response"},
      tasks: "Tasks", newTask: "New Task", search: "Search tasks...", empty: "What can I help with?",
      placeholder: "Ask anything...", research: "Research", send: "Send", back: "Back", you: "You",
      notice: "Local simulation · fictional Atlas data · preset replies · no AI or web requests. Refresh to reset.",
      intro: "Ask about Atlas planning memories, read its interview source, or draft a recommendation.",
      reference: "Add context", none: "No matching saved item.", memory: "Memory", source: "Library source",
      contextTitle: "Atlas planning context", resultTitle: "Atlas planning recommendation", draft: "Draft — not saved",
      unsupported: "This simulation handles the fictional Atlas planning example only. Ask for its saved context, interview source, evidence brief, research gap, or result record.",
      missingContext: "The Atlas context memory is missing. Save the fictional planning context before asking for analysis.",
      missingSource: "The interview source is not Searchable in Library. Import atlas-planning-interviews.md and wait for indexing before continuing.",
      missingRecord: "No saved Atlas recommendation was found. A draft in a previous task is not a saved memory.",
      needDraft: "Draft and check a result record in this task before asking to save it.",
      saved: "Saved in this local Playground. Open the memory below to check the actual record. No pilot is approved.",
      contextAnswer: "The saved context concerns one review next quarter, covering dependencies over the next twelve months. Teams already hold quarterly reviews. Reuse existing notes; avoid extra reporting. Future frequency and the pilot remain undecided. The context does not establish that a broader review will work.",
      sourceAnswer: "Read atlas-planning-interviews.md, Interviews A–C. A describes a missed dependency. B permits a trial only when existing notes can be reused; it does not support extra reporting. C records no trial or measured benefit. Open the source below to compare the original passages.",
      brief: "Evidence brief\n\nSupports a trial — Interview A reports a missed dependency; it does not prove a cross-team review will solve it.\n\nCondition — Interview B requires reuse of existing notes, not additional reporting.\n\nGap — Interview C records no trial or measured benefit. This is neither proof of success nor proof of failure.\n\nInternal question — How much preparation can the team support?\nPublic research question — Which documented methods expose cross-team dependencies before plans are committed?\n\nAssumption — One review might help; this has not been tested.\nNext action — Ask the review owner to set a preparation limit and a measure of dependencies found. No pilot has been approved; future frequency stays undecided.",
      researchAnswer: "Simulated research outcome — no public evidence is supplied by this demo. No web search has run.\n\nRecord the gap: a method and its measured outcome still need verification. In the real app, check the source link, publication date, participants, planning horizon, and limitations.\n\nNext action: run the scoped search in Nowledge Mem, or ask the review owner to plan a small internal trial. This demo's empty result does not mean no evidence exists.",
      activity: {context:"Search memories · local sample", source:"Read Library source · local sample", brief:"Read memory and source · local sample", research:"Research simulation · no network", draft:"Draft record · not saved", save:"Write memory · local Playground", recall:"Search saved result · local Playground", missing:"Missing prerequisite", unsupported:"Preset simulation"},
      date: "Reviewed", searchable: "Searchable", importing: "Indexing…"
    },
    zh: {
      thinking: "思考中 · 模拟", processed: "处理过程 · 模拟", stopped: "已停止，可以重新发送问题。", stop: "停止",
      stages: {start:"正在整理问题", context:"正在检查本地记忆", source:"正在检查记忆与 Library 来源", research:"正在准备研究模拟 · 不联网", save:"正在检查记录与保存条件", answer:"正在组织回答"},
      tasks: "任务", newTask: "新建任务", search: "搜索任务…", empty: "有什么可以帮你？",
      placeholder: "随便问…", research: "研究", send: "发送", back: "返回", you: "你",
      notice: "本地模拟 · Atlas 虚构数据 · 预设回答 · 不调用 AI 或联网。刷新后重置。",
      intro: "试着找回 Atlas 计划背景、阅读访谈来源，或起草一条建议记录。",
      reference: "附加上下文", none: "没有匹配的已保存条目。", memory: "记忆", source: "Library 来源",
      contextTitle: "Atlas 计划背景", resultTitle: "Atlas 计划建议", draft: "草稿 — 尚未保存",
      unsupported: "此模拟仅支持 Atlas 虚构计划案例。可以请求已存背景、访谈来源、证据简报、调查缺口或结果记录。",
      missingContext: "没有找到 Atlas 背景记忆。请先保存虚构计划背景，再请求分析。",
      missingSource: "Library 中尚无可检索的访谈来源。请导入 atlas-planning-interviews.md，等待索引完成后继续。",
      missingRecord: "没有找到已保存的 Atlas 计划建议。上一任务中的草稿不等于已保存的记忆。",
      needDraft: "请先在当前任务中起草并核对结果记录，再请求保存。",
      saved: "已保存到本地 Playground。请打开下方记忆，核对实际记录。试行仍未获批。",
      contextAnswer: "已存背景讨论下季度的一次评审，检查未来十二个月的依赖。团队已有季度评审；必须复用现有记录，避免额外汇报。未来频率和试行都未决定。这些背景不能证明扩大评审范围一定有效。",
      sourceAnswer: "已读取 atlas-planning-interviews.md 的访谈 A–C。A 描述一次遗漏的依赖；B 仅在复用现有记录的条件下接受试行，并不支持额外汇报；C 没有试行或收益测量。打开下方来源，对照原始段落。",
      brief: "证据简报\n\n支持尝试 — 访谈 A 描述遗漏依赖，不能证明跨团队评审能解决它。\n\n参与条件 — 访谈 B 要求复用已有记录，不是增加汇报。\n\n缺口 — 访谈 C 没有试行或收益测量。这既不是有效的证据，也不是无效的证据。\n\n内部问题 — 团队能承担多少准备工作？\n公开研究问题 — 哪些有记录的方法能在计划承诺前发现跨团队依赖？\n\n假设 — 一次评审可能有帮助，但尚未验证。\n下一步 — 请评审负责人定义准备工作上限和发现依赖的衡量方式。试行尚未获批，未来频率仍未决定。",
      researchAnswer: "模拟调查结果 — 此原型不提供公开证据，也未执行联网搜索。\n\n记录缺口：方法及其测量结果仍待验证。在真实应用中，需要检查来源链接、发布日期、参与者、规划范围与局限。\n\n下一步：在 Nowledge Mem 执行限定范围的搜索，或请评审负责人设计一次小规模内部试行。本模拟的空结果不代表不存在证据。",
      activity: {context:"搜索记忆 · 本地样例", source:"读取 Library 来源 · 本地样例", brief:"读取记忆及来源 · 本地样例", research:"模拟研究 · 未联网", draft:"起草记录 · 未保存", save:"写入记忆 · 本地 Playground", recall:"检索已存结果 · 本地 Playground", missing:"缺少前置材料", unsupported:"预设模拟"},
      date: "核对日期", searchable: "可检索", importing: "索引中…"
    }
  };

  // Store-backed deterministic responses: missing data must never be invented.
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

  // Delay all model work (including writes) until completion. Cancellation and
  // detached mounts must never produce a stale reply or a late memory save.
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

  function init(api) {
    var mount = api.mount;
    if (mount.hasAttribute("data-mp-ai-ready")) return;
    mount.setAttribute("data-mp-ai-ready", "true");
    var lang = api.zh ? "zh" : "en", C = COPY[lang], F = FIXTURES[lang], esc = api.esc, state = api.state;
    var tasks = [], current = null, readerView = "ai-now", taskId = 0, seeded = false;
    var sampleDoc = {id:"atlas-source", name:"atlas-planning-interviews.md", kind:"Markdown", size:"1 KB", page:1, excerpt:F.source, text:F.source, tags:["Atlas","planning"], status:"indexed"};
    function emit(type, kind) { mount.dispatchEvent(new CustomEvent("mp:action", {bubbles:true,detail:{type:type,kind:kind}})); }
    function memory(id) { return state.mem.list.find(function (m) { return m.id === id; }); }
    function source() { return state.library.list.find(function (d) { return d.id === "atlas-source"; }); }
    function save(id, title, text) {
      var old = memory(id), timeline = state.memories.find(function (m) {return m.id === id;});
      if (old) { old.text = text; old.title = title; if (timeline) timeline.text = text; }
      else {
        state.mem.list.unshift({id:id,title:title,text:text,unit:"fact",source:"AI Now",ago:api.L.memView.justNow,rating:0,tags:["Atlas"],pinned:false,archived:false});
        state.memories.unshift({id:id,day:"today",time:api.nowHM(),source:"AI Now",text:text,tags:["Atlas"]});
        state.counts.memories += 1;
      }
      api.rerender();
    }
    var modelStore = {memory:memory,source:source,save:save};
    var main = mount.querySelector(".mp-main");
    main.insertAdjacentHTML("beforeend", '<div class="mp-pane mp-ai" data-mp-pane="ai-now" hidden><div class="mp-head"><h2 class="mp-title">AI Now</h2><span class="mp-space-pill">Default</span></div><p class="mp-ai-notice">'+esc(C.notice)+'</p><div class="mp-ai-layout"><aside class="mp-ai-tasks"><div class="mp-ai-taskhead"><b>'+esc(C.tasks)+'</b><button type="button" class="mp-mem-btn" data-mp-ai-new>'+esc(C.newTask)+'</button></div><input type="search" data-mp-ai-search aria-label="'+esc(C.search)+'" placeholder="'+esc(C.search)+'" /><div data-mp-ai-tasks></div></aside><section class="mp-ai-chat"><div class="mp-ai-messages" data-mp-ai-messages role="log" aria-label="AI Now"></div><div class="mp-ai-compose"><textarea rows="3" data-mp-ai-input aria-label="'+esc(C.placeholder)+'" placeholder="'+esc(C.placeholder)+'"></textarea><div class="mp-ai-toolbar"><button type="button" class="mp-mem-btn" data-mp-ai-mention aria-label="'+esc(C.reference)+'">@</button><button type="button" class="mp-mem-btn" data-mp-ai-research aria-pressed="false">'+esc(C.research)+'</button><button type="button" class="mp-send" data-mp-ai-send aria-label="'+esc(C.send)+'" disabled>'+api.icon("send")+'</button><button type="button" class="mp-mem-btn mp-ai-stop" data-mp-ai-stop hidden>'+esc(C.stop)+'</button></div><div data-mp-ai-context hidden></div></div></section></div></div><div class="mp-pane" data-mp-pane="reader" hidden><button type="button" class="mp-mem-btn" data-mp-reader-back>'+esc(C.back)+'</button><h2 class="mp-title" data-mp-reader-title></h2><p class="mp-ai-notice">'+esc(C.notice)+'</p><div class="mp-ai-reader" data-mp-reader-text></div></div>');
    var input = mount.querySelector("[data-mp-ai-input]"), send = mount.querySelector("[data-mp-ai-send]"), researchButton = mount.querySelector("[data-mp-ai-research]");
    function cancelPending() {
      if(!current || !current.pending) return;
      current.run.cancel(); current.run=null;
      current.pending.pending=false;
      current.pending.text=C.stopped;
      current.pending.stopped=true;
      current.pending=null;
    }
    function newTask() {
      cancelPending();
      current = {id:++taskId,title:C.newTask,messages:[],research:false,input:"",model:createModel(lang, modelStore)};
      tasks.unshift(current); input.value=""; send.disabled=true; render();
    }
    function render() {
      var q = mount.querySelector("[data-mp-ai-search]").value.toLowerCase();
      mount.querySelector("[data-mp-ai-tasks]").innerHTML = tasks.filter(function(t){return t.title.toLowerCase().indexOf(q)!==-1;}).map(function(t){return '<button type="button" class="mp-ai-task'+(t===current?' mp-on':'')+'" data-mp-ai-task="'+t.id+'" aria-current="'+(t===current?'true':'false')+'">'+esc(t.title)+'</button>';}).join("");
      researchButton.setAttribute("aria-pressed", String(current.research));
      var messages = mount.querySelector("[data-mp-ai-messages]");
      messages.setAttribute("aria-busy",String(!!current.pending));
      input.disabled=!!current.pending;
      researchButton.disabled=!!current.pending;
      mount.querySelector('[data-mp-ai-mention]').disabled=!!current.pending;
      send.disabled=!!current.pending||!input.value.trim();
      send.hidden=!!current.pending;
      mount.querySelector('[data-mp-ai-stop]').hidden=!current.pending;
      messages.innerHTML = current.messages.length ? current.messages.map(function(m,i){
        var process=m.stages?'<details class="mp-ai-process"'+(m.pending?' open':'')+'><summary>'+(m.pending?'<span class="mp-ai-spinner" aria-hidden="true"></span>':'')+esc(m.pending?C.thinking:C.processed)+'</summary><ol>'+m.stages.slice(0,m.stage+1).map(function(label,j){return '<li'+(m.pending&&j===m.stage?' aria-current="step"':'')+'>'+esc(label)+'</li>';}).join('')+'</ol></details>':'';
        return '<article class="mp-ai-message mp-ai-'+m.role+'"'+(i===current.messages.length-1?' data-mp-ai-last':'')+'><b>'+esc(m.role==='user'?C.you:'AI Now')+'</b>'+process+(m.kind?'<div class="mp-ai-activity">'+esc(C.activity[m.kind])+'</div>':'')+(m.pending?'<div class="mp-ai-loading" role="status">'+esc(m.stages[m.stage])+'<span class="mp-ai-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>':'<div class="mp-ai-prose">'+esc(m.text)+'</div>')+(m.refs||[]).map(function(id){return '<button type="button" class="mp-ai-ref" data-mp-ai-ref="'+(id==='atlas-source'?'source':'memory')+'" data-mp-ai-read="'+id+'">'+esc(id==='atlas-source'?sampleDoc.name:id==='atlas-result'?C.resultTitle:C.contextTitle)+'</button>';}).join('')+'</article>';
      }).join('') : '<div class="mp-ai-empty"><h3>'+esc(C.empty)+'</h3><p>'+esc(C.intro)+'</p></div>';
      messages.scrollTop = messages.scrollHeight;
    }
    function submit() {
      var text=input.value.trim(); if(!text||current.pending) return;
      var task=current, research=task.research;
      var phase=research?'research':/^(?:please\s+)?(?:save|update)\b|^(?:请)?(?:将|把).*保存|^保存/i.test(text)?'save':/source|interview|brief|draft|来源|访谈|简报|起草/i.test(text)?'source':'context';
      var message={role:'assistant',pending:true,stage:0,stages:[C.stages.start,C.stages[phase],C.stages.answer],text:'',refs:[]};
      if (task.messages.length===0) task.title=text.slice(0,42);
      task.messages.push({role:'user',text:text},message); task.pending=message;
      input.value=''; task.input='';
      mount.querySelector('[data-mp-ai-context]').hidden=true;
      task.run=startResponse({
        stages:message.stages,
        valid:function(){return mount.isConnected && current===task && task.pending===message;},
        onStage:function(stage){message.stage=stage;render();},
        work:function(){return task.model.send(text,research);},
        onComplete:function(reply){
          message.pending=false;message.kind=reply.kind;message.text=reply.text;message.refs=reply.refs;
          task.pending=null;task.run=null;render();emit('reply',reply.kind);
        }
      });
    }
    function read(id) {
      var item = id==='atlas-source'?source():memory(id);
      if (!item || item.status && item.status!=="indexed") return;
      readerView=state.view;
      mount.querySelector("[data-mp-reader-title]").textContent=item.name||item.title;
      mount.querySelector("[data-mp-reader-text]").textContent=item.text||item.excerpt;
      api.setView("reader");emit("read",id==='atlas-source'?'source':'memory');
    }
    function showContext() {
      var panel=mount.querySelector("[data-mp-ai-context]");
      var items=[memory("atlas-context"),memory("atlas-result"),source()].filter(Boolean);
      panel.innerHTML=items.length?items.map(function(item){return '<button type="button" class="mp-ai-ref" data-mp-ai-attach="'+item.id+'">'+esc(item.name||item.title)+'</button>';}).join(""):'<p>'+esc(C.none)+'</p>';
      panel.hidden=false;
    }
    input.addEventListener("input",function(){current.input=input.value;send.disabled=!!current.pending||!input.value.trim();if(!current.pending&&input.value.endsWith("@")) showContext();});
    input.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit();}});
    mount.querySelector("[data-mp-ai-search]").addEventListener("input",render);
    mount.addEventListener("click",function(e){
      var button=e.target.closest("button");if(!button||!mount.contains(button))return;
      if(button.hasAttribute("data-mp-ai-stop")){cancelPending();render();input.focus();}
      else if(button.hasAttribute("data-mp-ai-send"))submit();
      else if(button.hasAttribute("data-mp-ai-new")){newTask();emit("new-task");}
      else if(button.hasAttribute("data-mp-ai-research")){current.research=!current.research;render();emit("research",current.research?"on":"off");}
      else if(button.hasAttribute("data-mp-ai-task")){var next=tasks.find(function(t){return t.id===Number(button.getAttribute("data-mp-ai-task"));});if(next&&next!==current){cancelPending();current=next;input.value=current.input;render();}}
      else if(button.hasAttribute("data-mp-ai-read"))read(button.getAttribute("data-mp-ai-read"));
      else if(button.hasAttribute("data-mp-reader-back")){api.setView(readerView);emit("back");}
      else if(button.hasAttribute("data-mp-ai-mention"))showContext();
      else if(button.hasAttribute("data-mp-ai-attach")){
        var id=button.getAttribute("data-mp-ai-attach"),item=id==='atlas-source'?source():memory(id);
        input.value=input.value.replace(/@$/,'')+' @'+(item.name||item.title)+' ';current.input=input.value;
        input.dispatchEvent(new Event("input",{bubbles:true}));mount.querySelector("[data-mp-ai-context]").hidden=true;input.focus();
      }
    });
    // Generic demo fixture API; caller chooses prerequisites, never lesson URLs.
    mount.addEventListener("mp:ai-seed",function(e){
      cancelPending();
      var options=e.detail||{};
      seeded=true;
      state.library.sampleDoc=Object.assign({},sampleDoc);
      state.library.imported=false;
      if(!memory("atlas-context"))save("atlas-context",C.contextTitle,F.context);
      state.library.list=state.library.list.filter(function(d){return d.id!=="atlas-source";});
      if(options.source)state.library.list.unshift(Object.assign({},sampleDoc));
      // Replaying a practice starts with no result, but ordinary new tasks keep it.
      if(memory("atlas-result"))state.counts.memories-=1;
      state.mem.list=state.mem.list.filter(function(m){return m.id!=="atlas-result";});
      state.memories=state.memories.filter(function(m){return m.id!=="atlas-result";});
      tasks=[];newTask();api.renderLibrary();api.rerender();api.setView("timeline");
      emit("seeded");
    });
    newTask();
    // Seed standalone practice only when AI Now is actually opened.
    mount.addEventListener("mp:action", function(e){
      if(e.detail.type === "view" && e.detail.kind === "ai-now" && !seeded) {
        seeded=true;
        if(!memory("atlas-context"))save("atlas-context",C.contextTitle,F.context);
        state.library.sampleDoc=Object.assign({},sampleDoc);
      }
    });
    emit("ai-ready");
  }
  if (typeof module !== "undefined" && module.exports) module.exports={createModel:createModel,fixtures:FIXTURES,startResponse:startResponse};
  if (typeof window === "undefined") return;
  if (window.MemPlaygroundAI) return;
  window.MemPlaygroundAI={init:init};
  document.addEventListener("mp:ready",function(e){init(e.detail);});
  document.querySelectorAll("[data-mem-playground]").forEach(function(m){if(m.mpAPI)init(m.mpAPI);});
})();
