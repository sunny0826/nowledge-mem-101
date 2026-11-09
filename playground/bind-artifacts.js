(window.NMemModules = window.NMemModules || []).push(["playground/bind-artifacts.js", function () {
  "use strict";
  var G = window.NMemPlayground = window.NMemPlayground || {};
  var renderLibList = G.renderLibList, libraryFilterHtml = G.libraryFilterHtml;
  G.bindArtifacts = function (context) {
  var mount = context.mount, L = context.L, state = context.state, input = context.input, send = context.send, memQ = context.memQ, memGo = context.memGo, thrQ = context.thrQ, thrGo = context.thrGo, globalPanel = context.globalPanel, globalQ = context.globalQ, globalResults = context.globalResults;
    var setView = context.setView, submit = context.submit, rerenderAll = context.rerenderAll, requestCreateClose = context.requestCreateClose, finishCreateDialog = context.finishCreateDialog, closeGlobalSearch = context.closeGlobalSearch, setDrawer = context.setDrawer, renderGlobalResults = context.renderGlobalResults;
    mount.querySelector('[data-mp-lib-q]').addEventListener('input',function(){renderLibList(mount,L,state);});
    mount.addEventListener('click',function(event){
      var open=event.target.closest('[data-mp-lib-open]'), back=event.target.closest('[data-mp-lib-back]');
      if(open&&!open.disabled){state.library.selected=state.library.list[Number(open.getAttribute('data-mp-lib-open'))];renderLibList(mount,L,state);mount.dispatchEvent(new CustomEvent('mp:action',{bubbles:true,detail:{type:'read',kind:'source'}}));}
      if(back){state.library.selected=null;renderLibList(mount,L,state);mount.dispatchEvent(new CustomEvent('mp:action',{bubbles:true,detail:{type:'back'}}));}
      var filterOption=event.target.closest('[data-mp-lib-filter-option], [data-mp-lib-filter-clear]');
      if(filterOption){
        var filterName=filterOption.getAttribute('data-mp-lib-filter-option')||filterOption.getAttribute('data-mp-lib-filter-clear');
        state.library[filterName]=filterOption.hasAttribute('data-mp-lib-filter-clear')?'all':filterOption.getAttribute('data-mp-lib-filter-value');
        mount.querySelectorAll('details.mp-lib-filter').forEach(function(details){details.open=false;});
        var filters=mount.querySelector('.mp-lib-filters');
        var search=filters.querySelector('.mp-lib-search');
        var upload=filters.querySelector('.mp-lib-upload');
        filters.innerHTML=libraryFilterHtml(L.libView,'kind',state.library.kind)+libraryFilterHtml(L.libView,'date',state.library.date)+libraryFilterHtml(L.libView,'origin',state.library.origin);
        filters.appendChild(search);
        filters.appendChild(upload);
        renderLibList(mount,L,state);
        return;
      }
      var filterSummary=event.target.closest('.mp-lib-filter > summary');
      if(filterSummary){
        mount.querySelectorAll('details.mp-lib-filter').forEach(function(details){if(details!==filterSummary.parentElement)details.open=false;});
      }
      if(event.target.closest('[data-mp-lib-reading-view]')){
        state.library.readingView=state.library.readingView==='raw'?'rendered':'raw';
        renderLibList(mount,L,state);
      }
    });
    mount.addEventListener('submit',function(event){
      if(!event.target.matches('[data-mp-lib-ask-form]'))return;
      event.preventDefault();
      var question=event.target.querySelector('[data-mp-lib-ask-input]').value.trim();
      if(!question||!state.library.selected)return;
      setView('timeline');
      input.value=question+' '+state.library.selected.name+'?';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      submit();
    });


    mount.addEventListener("click", function (event) {
      var target = event.target.closest ? event.target.closest("[data-mp-lib-import]") : null;
      if (!target || !mount.contains(target)) return;
      if (target.hasAttribute("data-mp-lib-import")) {
        if (state.library.imported) {
          return;
        }
        var sample = state.library.sampleDoc || L.libView.importDoc;
        if (sample.id && state.library.list.some(function (doc) { return doc.id === sample.id; })) return;
        state.library.imported = true;
        var doc = {
          id: sample.id,
          text: sample.text,
          name: sample.name,
          kind: sample.kind,
          size: sample.size,
          page: sample.page,
          excerpt: sample.excerpt,
          tags: sample.tags.slice(),
          status: "indexing",
        };
        state.library.list.unshift(doc);
        renderLibList(mount, L, state);
        setTimeout(function () {
          doc.status = "indexed";
          renderLibList(mount, L, state);
          mount.dispatchEvent(new CustomEvent("mp:action", {bubbles:true, detail:{type:"imported",kind:doc.id || "document"}}));
        }, 2500);
        return;
      }

    });

  };
}]);
