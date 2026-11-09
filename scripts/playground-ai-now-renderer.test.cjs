const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { COPY } = require('../playground-ai-now-data.js');

for (const lang of ['en', 'zh']) {
  test(`${lang}: renderer updates the DOM on each controller call`, () => {
    const window = { NMemModules: [] };
    vm.runInNewContext(readFileSync(resolve(__dirname, '../playground-ai-now-renderer.js'), 'utf8'), { window });
    window.NMemModules[0][1]();
    const nodes = new Map();
    const mount = {
      querySelector(selector) {
        if (!nodes.has(selector)) nodes.set(selector, {
          value: '', innerHTML: '', attributes: {},
          setAttribute(name, value) { this.attributes[name] = value; }
        });
        return nodes.get(selector);
      }
    };
    const current = { id: 1, title: 'Atlas', messages: [], research: false };
    const input = { value: '' }, send = {};
    const options = {
      mount, C: COPY[lang], tasks: [current], current,
      esc: value => String(value), input, send,
      researchButton: mount.querySelector('[data-mp-ai-research]'),
      sampleDoc: { name: 'atlas-planning-interviews.md' }
    };
    const render = () => window.MemPlaygroundAIRender(options);
    render();
    const messages = mount.querySelector('[data-mp-ai-messages]');
    assert.match(messages.innerHTML, /mp-ai-empty/);
    assert.equal(send.disabled, true);
    assert.equal(mount.querySelector('[data-mp-ai-chat-title]').textContent, 'Atlas');
    const reply = { role: 'assistant', pending: true, stages: ['Checking memories'], stage: 0, text: '', refs: [] };
    current.messages.push({ role: 'user', text: 'Search Atlas memories' }, reply);
    current.pending = reply;
    render();
    assert.match(messages.innerHTML, /Search Atlas memories/);
    assert.match(messages.innerHTML, /Checking memories/);
    assert.equal(input.disabled, true);
    assert.equal(send.hidden, true);
    Object.assign(reply, { pending: false, kind: 'context', text: 'Atlas context found', refs: ['atlas-context'] });
    current.pending = null;
    render();
    assert.match(messages.innerHTML, /Atlas context found/);
    assert.match(messages.innerHTML, /data-mp-ai-read="atlas-context"/);
    assert.equal(input.disabled, false);
    assert.equal(send.hidden, false);
    assert.equal(messages.attributes['aria-busy'], 'false');
  });
}
