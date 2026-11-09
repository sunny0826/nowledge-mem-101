(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) { module.exports = require("./playground-ai-now-model.js"); return; }
  (root.NMemModules = root.NMemModules || []).push(["playground-ai-now.js", function () {
    var model = root.MemPlaygroundAIModel;
    var data = root.MemPlaygroundAIData;
    factory(model.createTask, model.startResponse, data.FIXTURES, data.COPY);
  }]);
})(typeof globalThis !== "undefined" ? globalThis : this, function (createTask, startResponse, FIXTURES, COPY) {
  "use strict";
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
    main.insertAdjacentHTML("beforeend", '<div class="mp-pane mp-ai" data-mp-pane="ai-now" hidden><div class="mp-head"><h2 class="mp-title">AI Now</h2><span class="mp-space-pill">Default</span></div><p class="mp-ai-notice">'+esc(C.notice)+'</p><div class="mp-ai-layout"><aside class="mp-ai-tasks"><div class="mp-ai-taskhead"><b>'+esc(C.tasks)+'</b><button type="button" class="mp-mem-btn" data-mp-ai-new>'+esc(C.newTask)+'</button></div><div class="mp-ai-tasktabs"><button type="button" class="mp-on" data-mp-ai-current>'+esc(C.currentTasks)+'</button><button type="button" disabled title="'+esc(C.unavailable)+'">'+esc(C.archivedTasks)+'</button></div><input type="search" data-mp-ai-search aria-label="'+esc(C.search)+'" placeholder="'+esc(C.search)+'" /><div data-mp-ai-tasks></div><div class="mp-ai-taskfooter"><button type="button" disabled title="'+esc(C.unavailable)+'">'+esc(C.plugins)+'</button><button type="button" disabled title="'+esc(C.unavailable)+'">'+esc(C.plans)+'</button></div></aside><section class="mp-ai-chat"><div class="mp-ai-chatbar"><b data-mp-ai-chat-title>'+esc(C.newTask)+'</b><span class="mp-space-pill">Default</span></div><div class="mp-ai-messages" data-mp-ai-messages role="log" aria-label="AI Now"></div><div class="mp-ai-compose"><textarea rows="3" data-mp-ai-input aria-label="'+esc(C.placeholder)+'" placeholder="'+esc(C.placeholder)+'"></textarea><div class="mp-ai-toolbar"><button type="button" class="mp-mem-btn" data-mp-ai-attachments aria-label="'+esc(C.attach)+'" disabled title="'+esc(C.unavailable)+'">'+api.icon("paperclip")+'</button><button type="button" class="mp-mem-btn" data-mp-ai-mention aria-label="'+esc(C.reference)+'">@</button><button type="button" class="mp-mem-btn" data-mp-ai-memory disabled title="'+esc(C.unavailable)+'">'+esc(C.memory)+'</button><button type="button" class="mp-mem-btn" data-mp-ai-planning disabled title="'+esc(C.unavailable)+'">'+esc(C.planning)+'</button><button type="button" class="mp-mem-btn" data-mp-ai-research aria-pressed="false">'+esc(C.research)+'</button><button type="button" class="mp-send" data-mp-ai-send aria-label="'+esc(C.send)+'" disabled>'+api.icon("send")+'</button><button type="button" class="mp-mem-btn mp-ai-stop" data-mp-ai-stop hidden>'+esc(C.stop)+'</button></div><div data-mp-ai-context hidden></div></div></section></div></div><div class="mp-pane" data-mp-pane="reader" hidden><button type="button" class="mp-mem-btn" data-mp-reader-back>'+esc(C.back)+'</button><h2 class="mp-title" data-mp-reader-title></h2><p class="mp-ai-notice">'+esc(C.notice)+'</p><div class="mp-ai-reader" data-mp-reader-text></div></div>');
    var input = mount.querySelector("[data-mp-ai-input]"), send = mount.querySelector("[data-mp-ai-send]"), researchButton = mount.querySelector("[data-mp-ai-research]");
    function cancelPending() {
      if(!current || !current.pending) return;
      current.run.cancel(); current.run=null;
      current.pending.pending=false;
      current.pending.text=C.stopped;
      current.pending.stopped=true;
      current.pending=null;
    }
    function newTask(history) {
      cancelPending();
      current = createTask(lang,modelStore,history);
      current.id=++taskId;
      tasks.unshift(current); input.value=""; send.disabled=true; render();
    }
    function render() { window.MemPlaygroundAIRender({mount:mount, C:C, tasks:tasks, current:current, esc:esc, input:input, send:send, researchButton:researchButton, sampleDoc:sampleDoc}); }
    function submit() {
      var text=input.value.trim(); if(!text||current.pending) return;
      var task=current, research=task.research;
      var phase=research?'research':/setting|language|设置|语言/i.test(text)?'settings':/^(?:please\s+)?(?:save|update)\b|^(?:请)?(?:将|把).*保存|^保存/i.test(text)?'save':/source|interview|brief|draft|来源|访谈|简报|起草/i.test(text)?'source':'context';
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
    mount.addEventListener("mp:ai-seed",function(e){
      cancelPending();
      var options=e.detail||{};
      seeded=true;
      modelStore.settings={outputLanguage:lang === "zh" ? "英文" : "English", changes: []};
      state.library.sampleDoc=Object.assign({},sampleDoc);
      state.library.imported=false;
      if(!memory("atlas-context"))save("atlas-context",C.contextTitle,F.context);
      state.library.list=state.library.list.filter(function(d){return d.id!=="atlas-source";});
      if(options.source)state.library.list.unshift(Object.assign({},sampleDoc));
      if(memory("atlas-result"))state.counts.memories-=1;
      state.mem.list=state.mem.list.filter(function(m){return m.id!=="atlas-result";});
      state.memories=state.memories.filter(function(m){return m.id!=="atlas-result";});
      tasks=[];newTask(options.history);api.renderLibrary();api.rerender();api.setView("timeline");
      emit("seeded");
    });
    newTask();
    mount.addEventListener("mp:action", function(e){
      if(e.detail.type === "view" && e.detail.kind === "ai-now" && !seeded) {
        seeded=true;
        if(!memory("atlas-context"))save("atlas-context",C.contextTitle,F.context);
        state.library.sampleDoc=Object.assign({},sampleDoc);
      }
    });
    emit("ai-ready");
  }
  if (typeof window === "undefined") return;
  if (window.MemPlaygroundAI) return;
  window.MemPlaygroundAI={init:init};
  document.addEventListener("mp:ready",function(e){init(e.detail);});
  document.querySelectorAll("[data-mem-playground]").forEach(function(m){if(m.mpAPI)init(m.mpAPI);});
});
