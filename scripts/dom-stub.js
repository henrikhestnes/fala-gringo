/* Minimal DOM stub for the headless smoke tests. Shared by smoke.jxa (the main
   app) and smoke-ingles.jxa (the /ingles/ subpage): each runner concatenates
   this file, the app sources and its steps into ONE eval, so the const
   bindings here (registry, document, …) are in scope for all of them.
   Not a browser, but enough DOM for every render path in the app. */

const registry = {};
const timers = [];
let idSeq = 0;

function El(id) {
  this.id = id || ('el' + (++idSeq));
  this._html = '';
  this._text = '';
  this._owned = [];
  this._listeners = {};
  this.dataset = {};
  this.value = '';
  this.disabled = false;
  this.className = '';
  this._classes = {};
  const self = this;
  this.classList = {
    add: function () { for (const a of arguments) self._classes[a] = 1; },
    remove: function () { for (const a of arguments) delete self._classes[a]; },
    toggle: function (c) { if (self._classes[c]) delete self._classes[c]; else self._classes[c] = 1; },
    contains: function (c) { return !!self._classes[c]; }
  };
  this.style = { setProperty: function () {} };
}
El.prototype.addEventListener = function (t, fn) {
  (this._listeners[t] = this._listeners[t] || []).push(fn);
};
El.prototype.removeEventListener = function () {};
El.prototype.setAttribute = function (k, v) { this.dataset['attr_' + k] = v; };
El.prototype.removeAttribute = function (k) { delete this.dataset['attr_' + k]; };
El.prototype.hasAttribute = function (k) { return this.dataset['attr_' + k] !== undefined; };
El.prototype.getAttribute = function (k) { return this.dataset['attr_' + k]; };
El.prototype.focus = function () {};
El.prototype.blur = function () {};
El.prototype.scrollIntoView = function () {};
El.prototype.remove = function () {};
El.prototype.appendChild = function () {};
El.prototype.getContext = function () {
  return { clearRect: function () {}, fillRect: function () {}, beginPath: function () {},
           arc: function () {}, fill: function () {}, save: function () {}, restore: function () {},
           globalAlpha: 1, fillStyle: '' };
};
El.prototype.closest = function () { return new El(); };
El.prototype.fire = function (t, evt) {
  (this._listeners[t] || []).forEach(fn => fn(evt || { key: 'x' }));
};
Object.defineProperty(El.prototype, 'innerHTML', {
  get: function () { return this._html; },
  set: function (v) {
    this._html = String(v);
    // emulate replacement: ids this element previously created go away
    this._owned.forEach(id => { delete registry[id]; });
    this._owned = [];
    const re = /id="([^"]+)"/g;
    let m;
    while ((m = re.exec(this._html)) !== null) {
      const el = new El(m[1]);
      registry[m[1]] = el;
      this._owned.push(m[1]);
    }
  }
});
Object.defineProperty(El.prototype, 'outerHTML', {
  get: function () { return this._html; },
  set: function (v) { this._html = String(v); }
});
Object.defineProperty(El.prototype, 'textContent', {
  get: function () { return this._text; },
  set: function (v) { this._text = String(v); }
});

const document = {
  getElementById: function (id) { return registry[id] || null; },
  querySelector: function () { return new El(); },
  querySelectorAll: function () { return []; },
  createElement: function () { return new El(); },
  addEventListener: function (t, fn) { (document._h = document._h || {}); (document._h[t] = document._h[t] || []).push(fn); },
  documentElement: new El('html'),
  head: new El('head'),
  body: new El('body')
};

var window = this;
window.document = document;
window.matchMedia = function () { return { matches: false }; };
var _rafDepth = 0;
window.requestAnimationFrame = function (fn) {
  if (_rafDepth > 2) return 0;
  _rafDepth++;
  try { fn(); } finally { _rafDepth--; }
  return 1;
};
window.cancelAnimationFrame = function () {};
window.visualViewport = null;
window.speechSynthesis = null;               // speak() no-ops
window.navigator = { clipboard: null };
window.location = { hash: '' };
window.scrollTo = function () {};
window.setTimeout = function (fn) { timers.push(fn); return timers.length; };
window.clearTimeout = function () {};
window.addEventListener = function (t, fn) { (window._h = window._h || {}); (window._h[t] = window._h[t] || []).push(fn); };
window.localStorage = (function () {
  const m = {};
  return {
    getItem: k => (Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: k => { delete m[k]; }
  };
})();
window.SpeechSynthesisUtterance = function () {};
// a fetch that exists but never reaches a network: the sync module sees a
// capable browser (so its real init path runs) while enabled() stays false
// without a sync code, so nothing is ever actually requested
window.fetch = function () { return Promise.reject(new Error('no network in the smoke stub')); };
// captured by stt.js at load; steps drive recognition by hand via window._activeRec
window.SpeechRecognition = function () {
  const self = this;
  this.start = function () { window._activeRec = self; };
  this.stop = function () {};
  this.abort = function () { if (window._activeRec === self) window._activeRec = null; };
};
window._activeRec = null;
function flushTimers() { const t = timers.splice(0); t.forEach(fn => { try { fn(); } catch (e) {} }); }

// shell elements that both index.html files provide
['view', 'tabs', 'toast', 'modeBtn', 'themeBtn', 'syncBtn', 'goalBtn', 'buildInfo'].forEach(id => { registry[id] = new El(id); });
