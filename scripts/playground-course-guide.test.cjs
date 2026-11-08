const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

function shellSource() {
  const entry=readFileSync(resolve(__dirname,'..','playground.js'),'utf8');
  const modules=[...entry.matchAll(/"(playground(?:\/|-home)[^"]+\.js)"/g)].map(match=>match[1]);
  return modules.map(file=>readFileSync(resolve(__dirname,'..',file),'utf8')).join('\n')+'\n'+entry;
}

test('first memory guides the existing Add memory menu item',()=>{
  const shell=shellSource();
  const {SCENARIOS}=require('../course-playground-guide-core.js');
  assert.equal(SCENARIOS.save.steps,5);
  assert.deepEqual(SCENARIOS.save.fillSteps,[4]);
  assert.equal(SCENARIOS.save.targets[2],'[data-mp-memory-actions]');
  assert.equal(SCENARIOS.save.targets[3],'[data-mp-add-memory]');
  assert.equal(SCENARIOS.save.targets[4],'[data-mp-input]');
  assert.equal(SCENARIOS.save.targets[5],'[data-mp-send]');
  assert.ok(!shell.includes('data-mp-create-form'),'the course does not need a separate Create Memory form');
  const guide=['course-playground-guide-core.js','course-playground-guide-view.js','course-playground-guide.js'].map(file=>readFileSync(resolve(__dirname,'..',file),'utf8')).join('\n');
  assert.ok(!guide.includes('data-course-guide-create'),'the alternate Create Memory guide is removed');
  for(const lang of ['en','zh']) {
    const lesson=readFileSync(resolve(__dirname,'..',lang==='zh'?'zh':'','essentials','first-memory.mdx'),'utf8');
    assert.ok(!lesson.includes('data-course-guide-create'),lang+' keeps only the original Home flow');
    assert.ok(lesson.includes('data-course-guide-hint-6='),lang+' has a final saved hint after the five actions');
    const hint=lesson.match(/data-course-guide-hint-3="([^"]+)"/)[1];
    assert.equal(hint,lang==='zh'?'选择「添加记忆」':'Choose Add memory');
  }
});

test('thread search presents a result before opening the full conversation',()=>{
  const {SCENARIOS}=require('../course-playground-guide-core.js');
  assert.equal(SCENARIOS.threads.steps,4);
  assert.equal(SCENARIOS.threads.completion,'view');
  assert.equal(SCENARIOS.threads.targets[4],'[data-mp-thread-open]');
  assert.equal(SCENARIOS.threads.changed,'[data-mp-thread-detail]');
  for(const lang of ['en','zh']) {
    const lesson=readFileSync(resolve(__dirname,'..',lang==='zh'?'zh':'','essentials','save-ai-conversation.mdx'),'utf8');
    const openHint=lesson.match(/data-course-guide-hint-4="([^"]+)"/)[1];
    const detailHint=lesson.match(/data-course-guide-hint-5="([^"]+)"/)[1];
    assert.equal(openHint,lang==='zh'?'打开搜索结果，查看完整对话':'Open a search result to read the conversation');
    assert.equal(detailHint,lang==='zh'?'已打开对话，可以查看完整内容':'Opened — read the full conversation');
  }
});


test('thread result guidance highlights the whole conversation row',()=>{
  const previous=global.window;
  const row={};
  const title={closest:selector=>selector==='.mp-thr-row'?row:null};
  global.window={NMemCourseGuide:require('../course-playground-guide-core.js')};
  try {
    require('../course-playground-guide-view.js');
    const state={scenario:'threads',windowEl:{querySelector:selector=>selector==='[data-mp-thread-open]'?title:null}};
    assert.equal(global.window.NMemCourseGuide.targetForStep(state,4),row);
  } finally {
    if(previous===undefined) delete global.window;
    else global.window=previous;
  }
});
