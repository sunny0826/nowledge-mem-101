(function () {
  "use strict";
  window.MemPlaygroundAIRender = function (options) {
    var mount = options.mount, C = options.C, tasks = options.tasks, current = options.current, esc = options.esc, input = options.input, send = options.send, researchButton = options.researchButton, sampleDoc = options.sampleDoc;
    return function render() {
      var q = mount.querySelector("[data-mp-ai-search]").value.toLowerCase();
      mount.querySelector("[data-mp-ai-chat-title]").textContent = current.title;
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
;
  };
})();
