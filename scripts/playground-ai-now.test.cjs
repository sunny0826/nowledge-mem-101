const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createModel, fixtures } = require('../playground-ai-now.js');
function setup(lang) {
  const memories = new Map([['atlas-context',{text:fixtures[lang].context}]]);
  let source = null;
  const store = {memory:id=>memories.get(id),source:()=>source,save:(id,title,text)=>memories.set(id,{title,text})};
  return {model:createModel(lang,store),memories,store,setSource:value=>source=value};
}
for(const lang of ['en','zh']) {
  const prompts = lang==='en' ? {context:'Search the saved Atlas planning memories',source:'Read atlas-planning-interviews.md',brief:'Write an Atlas evidence brief',draft:'Draft an Atlas record. Do not save the record yet.',save:'Save the version we just checked',recall:'Find the Atlas planning recommendation'} : {context:'搜索 Atlas 计划背景',source:'阅读 atlas-planning-interviews.md',brief:'撰写 Atlas 证据简报',draft:'为 Atlas 起草记录。先不要保存。',save:'将刚刚核对的版本保存为记忆',recall:'找到 Atlas 计划建议'};
  test(lang+': real prerequisites, draft/save separation, fresh-task recall and source read',()=>{
    const f=setup(lang);
    assert.equal(f.model.send(prompts.context,false).kind,'context');
    assert.equal(f.model.send(prompts.source,false).kind,'missing');
    f.setSource({status:'indexing'});
    assert.equal(f.model.send(prompts.brief,false).kind,'missing');
    f.setSource({status:'indexed'});
    assert.equal(f.model.send(prompts.brief,false).kind,'brief');
    assert.equal(f.model.send(prompts.save,false).kind,'missing');
    assert.equal(f.model.send(prompts.draft,false).kind,'draft');
    assert.equal(f.memories.has('atlas-result'),false);
    const freshBeforeSave=createModel(lang,f.store);
    assert.equal(freshBeforeSave.send(prompts.recall,false).kind,'missing');
    assert.equal(f.model.send(prompts.save,false).kind,'save');
    assert.equal(f.model.send(prompts.save,false).kind,'save');
    assert.equal(f.memories.size,2,'saving again updates the same record');
    const fresh=createModel(lang,f.store);
    assert.equal(fresh.send(prompts.save,false).kind,'missing','fresh task does not inherit a draft');
    const result=fresh.send(prompts.recall,false);
    assert.equal(result.kind,'recall');
    assert.match(result.text,lang==='en'?/no pilot approved/:/尚未获批/);
    assert.match(result.text,/atlas-planning-interviews.md/);
    assert.equal(fresh.send(prompts.source,false).kind,'source');
    f.setSource(null);
    assert.equal(fresh.send(prompts.source,false).kind,'missing','a saved reference is not the source itself');
    f.memories.delete('atlas-result');
    assert.equal(fresh.send(prompts.recall,false).kind,'missing');
  });
  test(lang+': research stays simulated; unsupported and empty prompts do not invent evidence',()=>{
    const f=setup(lang);
    assert.equal(f.model.send(' ',true),null);
    const reply=f.model.send('Find documented methods',true);
    assert.equal(reply.kind,'research');
    assert.equal(reply.refs.length,0);
    assert.match(reply.text,lang==='en'?/No web search has run/:/未执行联网搜索/);
    assert.equal(f.model.send('Tell me the weather',false).kind,'unsupported');
    f.memories.clear();
    assert.equal(f.model.send(prompts.context,false).kind,'missing');
  });
}

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createTask } = require('../playground-ai-now.js');
const { aiPracticeSeed } = require('../course-playground-guide.js');
const lessonSequence = ['start-a-grounded-task','bring-a-source','ask-for-an-evidence-brief','research-what-is-missing','save-the-result'];
const scenarioSequence = ['ai-context','ai-source','ai-evidence','ai-research','ai-save'];
test('English and Chinese lessons expose identical simulation controls and automatic entry',()=>{
  const contract=page=>({
    scenario:page.match(/data-course-guide-scenario="([^"]+)"/)[1],
    autoStart:page.match(/data-course-guide-autostart="([^"]+)"/)[1],
    hints:[...page.matchAll(/data-course-guide-hint-(\d+)=/g)].map(m=>Number(m[1])),
    fills:[...page.matchAll(/data-course-guide-fillable-(\d+)=/g)].map(m=>Number(m[1])),
    steps:[...page.matchAll(/data-course-guide-source="(\d+)"/g)].map(m=>Number(m[1])),
    next:page.match(/data-course-guide-confirm-href="([^"]+)"/)[1].replace(/^\/zh\//,'/'),
    guide:page.match(/src="(\/course-playground-guide.js[^\"]+)"/)[1],
    realApp:page.match(/data-course-guide-mem-url="([^"]+)"/)[1]
  });
  for(const slug of lessonSequence){
    const en=contract(readFileSync(resolve(__dirname,'..','ai-now',slug+'.mdx'),'utf8'));
    const zh=contract(readFileSync(resolve(__dirname,'..','zh/ai-now',slug+'.mdx'),'utf8'));
    assert.equal(en.autoStart,'true');
    assert.deepEqual(en,zh,slug+' has the same interaction contract in both locales');
  }
});
test('completion destinations follow published lesson order and only auto-start available simulations',()=>{
  const docs=JSON.parse(readFileSync(resolve(__dirname,'..','docs.json'),'utf8'));
  for(const locale of docs.navigation.languages){
    const pages=locale.tabs.find(tab=>tab.tab==='AI Now').pages;
    for(let i=1;i<pages.length;i++){
      const page=readFileSync(resolve(__dirname,'..',pages[i]+'.mdx'),'utf8');
      const href=page.match(/data-course-guide-confirm-href="([^"]+)"/)[1];
      const next=i<pages.length-1;
      const expected=next?'/'+pages[i+1]+'#simulation':'/'+pages[0].replace(/\/index$/,'');
      assert.equal(href,expected);
      if(next){
        const target=readFileSync(resolve(__dirname,'..',pages[i+1]+'.mdx'),'utf8');
        assert.match(target,/data-course-playground-guide=""/);
      }
      const label=page.match(/data-course-guide-confirm-label="([^"]+)"/)[1];
      assert.equal(label,locale.language==='zh'?(next?'下一课':'返回课程'):(next?'Next lesson':'Back to course'));
      const message=page.match(/data-course-guide-done-message="([^"]+)"/)[1];
      const hints=[...page.matchAll(/data-course-guide-hint-\d+="([^"]+)"/g)];
      assert.equal(hints.at(-1)[1],message);
      assert.ok(page.includes('data-course-guide-done role="status" hidden>'+message+'</p>'));
    }
  }
});
for (const lang of ['en','zh']) {
  test(lang+': each lesson resumes the cumulative earlier conversation without completing current work',()=>{
    const prompts=lessonSequence.map(slug=>{
      const page=readFileSync(resolve(__dirname,'..',lang==='zh'?'zh':'','ai-now',slug+'.mdx'),'utf8');
      return page.match(/data-course-guide-fillable-\d+="([^"]+)"/)[1];
    });
    const kinds=['context','source','brief','research'];
    scenarioSequence.forEach((scenario,index)=>{
      const f=setup(lang), seed=aiPracticeSeed(scenario,lang);
      if(seed.source)f.setSource({status:'indexed',text:fixtures[lang].source});
      const task=createTask(lang,f.store,seed.history);
      assert.equal(task.messages.length,index*2);
      assert.deepEqual(task.messages.filter(m=>m.role==='user').map(m=>m.text),prompts.slice(0,index),'history follows the actual earlier lesson prompts');
      assert.deepEqual(task.messages.filter(m=>m.role==='assistant').map(m=>m.kind),kinds.slice(0,index));
      for(const m of task.messages)for(const ref of m.refs||[]){
        assert.ok(ref==='atlas-source'?f.store.source():f.memories.has(ref),'historical citations resolve');
      }
      assert.equal(f.memories.has('atlas-result'),false,'no result is saved before the learner completes lesson 5');
      assert.equal(task.research,false,'prior research does not leave Research on for drafting');
      assert.deepEqual(createTask(lang,f.store,seed.history).messages,task.messages,'replay restores a stable starting conversation');
      if(index===1)assert.equal(f.store.source(),null,'lesson 2 still requires importing the source');
      if(index===4){
        assert.match(task.messages.at(-1).text,lang==='en'?/No web search has run/:/未执行联网搜索/);
        assert.equal(task.model.send(prompts[4],false).kind,'draft','continue the same task with a draft');
        const fresh=createTask(lang,f.store);
        assert.equal(fresh.messages.length,0);
        assert.equal(fresh.model.send(lang==='en'?'Save the version we just checked':'将刚刚核对的版本保存为记忆',false).kind,'missing','New Task does not inherit the draft');
      }
    });
  });
}
for (const lang of ['en','zh']) {
  test(lang+': the actual final-lesson prompts save, recall, then reread the original source',()=>{
    const text=readFileSync(resolve(__dirname,'..',lang==='zh'?'zh':'','ai-now/save-the-result.mdx'),'utf8');
    const blocks=[...text.matchAll(/```text\n([\s\S]*?)```/g)].map(m=>m[1].trim());
    const f=setup(lang);f.setSource({status:'indexed'});
    assert.equal(f.model.send(blocks[0],false).kind,'draft');
    assert.equal(f.model.send(blocks[2],false).kind,'save');
    const fresh=createModel(lang,f.store);
    assert.equal(fresh.send(blocks[3],false).kind,'recall');
    assert.equal(fresh.send(blocks[4],false).kind,'source','request to read original must not repeat the saved result');
  });
}

for (const lang of ['en','zh']) {
  for(const [slug,expected] of [['start-a-grounded-task','context'],['bring-a-source','source'],['ask-for-an-evidence-brief','brief'],['research-what-is-missing','research']]) {
    test(lang+': actual '+slug+' prompt',()=>{
      const text=readFileSync(resolve(__dirname,'..',lang==='zh'?'zh':'','ai-now',slug+'.mdx'),'utf8');
      const blocks=[...text.matchAll(/```text\n([\s\S]*?)```/g)].map(m=>m[1].trim());
      const f=setup(lang);f.setSource({status:'indexed'});
      assert.equal(f.model.send(blocks.at(-1),expected==='research').kind,expected);
    });
  }
}

for(const lang of ['en','zh'])test(lang+': source reply quotes the stored passage rather than a saved summary',()=>{
  const f=setup(lang);
  const passage=lang==='en'?'Use the existing quarterly notes.':'复用已有季度记录。';
  f.setSource({status:'indexed',text:'## '+(lang==='en'?'Interview':'访谈')+' B\n'+passage+'\n\n## C\nNo measurement.'});
  const reply=f.model.send('Read atlas-planning-interviews.md',false);
  assert.equal(reply.kind,'source');assert.ok(reply.text.includes(passage));
});

const { startResponse } = require('../playground-ai-now.js');
function responseHarness() {
  let queue=[], stages=[], work=0, completions=0, valid=true;
  const run=startResponse({stages:['prepare','check','respond'],
    schedule:fn=>{queue.push(fn);return fn;}, unschedule:fn=>{queue=queue.filter(x=>x!==fn);},
    valid:()=>valid,onStage:n=>stages.push(n),work:()=>{work++;return 'reply';},
    onComplete:reply=>{assert.equal(reply,'reply');completions++;}});
  return {run,stages,counts:()=>({work,completions}),detach:()=>{valid=false;},tick:()=>{const fn=queue.shift();if(fn)fn();}};
}
test('processing delays response work and completion until all stages finish',()=>{
  const h=responseHarness();assert.deepEqual(h.stages,[0]);
  h.tick();h.tick();assert.deepEqual(h.stages,[0,1,2]);
  assert.deepEqual(h.counts(),{work:0,completions:0});
  h.tick();h.tick();assert.deepEqual(h.counts(),{work:1,completions:1});
});
test('stopping a pending response prevents late writes and completion events',()=>{
  const h=responseHarness();h.tick();h.run.cancel();h.run.cancel();
  h.tick();h.tick();assert.deepEqual(h.counts(),{work:0,completions:0});
});
test('a detached or replaced task never runs stale response work',()=>{
  const h=responseHarness();h.tick();h.tick();h.detach();h.tick();
  assert.deepEqual(h.counts(),{work:0,completions:0});
});
