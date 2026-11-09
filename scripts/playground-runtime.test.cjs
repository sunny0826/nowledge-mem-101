const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const modules = require('../playground-runtime.js');
const source = file => readFileSync(resolve(__dirname, '..', file), 'utf8');

function browser(lang = 'en') {
  const events = [];
  const timers = [];
  const observers = [];
  const document = {
    readyState: 'complete',
    documentElement: { lang },
    querySelectorAll: () => [],
    addEventListener: name => events.push(name),
    createElement: () => { throw new Error('Unexpected dynamic resource request'); }
  };
  const context = vm.createContext({
    document,
    setTimeout: callback => { timers.push(callback); return timers.length; },
    clearTimeout: () => {},
    addEventListener: name => events.push(name),
    MutationObserver: class {
      constructor(callback) { observers.push(callback); }
      observe() {}
    }
  });
  context.window = context;
  return { context, events, timers, observers };
}

function evaluate(context, file) {
  vm.runInContext(source(file), context, { filename: file });
}

function verifyReady(runtime, lang) {
  const { context, events } = runtime;
  const G = context.NMemPlayground;
  assert.equal(G.isZh(), lang === 'zh');
  const mount = { hasAttribute: () => false, setAttribute() {}, querySelector: () => ({}) };
  const practice = G.createContext(mount);
  assert.equal(practice.L, G.LOCALES[lang]);
  assert.match(mount.innerHTML, /data-mp-view="ai-now"/);
  assert.equal(typeof practice.setView, 'function');
  assert.equal(typeof context.MemPlaygroundAIModel.createTask, 'function');
  assert.equal(typeof context.MemPlaygroundAIRender, 'function');
  assert.equal(typeof context.NMemCourseGuide.setWindowOpen, 'function');
  assert.ok(events.includes('mp:ready'));
  assert.ok(events.includes('hashchange'));
  assert.ok(runtime.timers.length > 0);
}

for (const lang of ['en', 'zh']) {
  for (const order of ['forward', 'reverse', 'interleaved']) {
    test(`${lang}: ${order} script arrival initializes without root URL requests`, () => {
      const runtime = browser(lang);
      let files = [...modules];
      if (order === 'reverse') files.reverse();
      if (order === 'interleaved') files = files.filter((_, i) => i % 2).concat(files.filter((_, i) => !(i % 2)));
      const position = order === 'forward' ? 0 : order === 'reverse' ? files.length : 12;
      files.splice(position, 0, 'playground-runtime.js');
      for (const file of files) evaluate(runtime.context, file);
      verifyReady(runtime, lang);
      const before = [runtime.events.length, runtime.timers.length, runtime.observers.length];
      for (const file of files.slice().reverse()) evaluate(runtime.context, file);
      assert.deepEqual([runtime.events.length, runtime.timers.length, runtime.observers.length], before);
    });
  }
}

test('late prerequisites resume initialization instead of capturing undefined dependencies', () => {
  const runtime = browser('zh');
  evaluate(runtime.context, 'playground-runtime.js');
  for (const file of modules.filter(file => file !== 'playground/core.js')) evaluate(runtime.context, file);
  assert.equal(runtime.context.NMemPlayground, undefined);
  assert.equal(runtime.events.length, 0);
  evaluate(runtime.context, 'playground/core.js');
  verifyReady(runtime, 'zh');
});

test('invalid module registrations fail with the module name', () => {
  const runtime = browser();
  evaluate(runtime.context, 'playground-runtime.js');
  assert.throws(() => runtime.context.NMemModules.push(['unknown.js', () => {}]), /Invalid Playground module: unknown.js/);
});
