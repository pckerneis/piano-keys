! function(t) {
  var e = {};

  function i(s) {
      if (e[s]) return e[s].exports;
      var h = e[s] = {
          i: s,
          l: !1,
          exports: {}
      };
      return t[s].call(h.exports, h, h.exports, i), h.l = !0, h.exports
  }
  i.m = t, i.c = e, i.d = function(t, e, s) {
      i.o(t, e) || Object.defineProperty(t, e, {
          enumerable: !0,
          get: s
      })
  }, i.r = function(t) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
          value: "Module"
      }), Object.defineProperty(t, "__esModule", {
          value: !0
      })
  }, i.t = function(t, e) {
      if (1 & e && (t = i(t)), 8 & e) return t;
      if (4 & e && "object" == typeof t && t && t.__esModule) return t;
      var s = Object.create(null);
      if (i.r(s), Object.defineProperty(s, "default", {
              enumerable: !0,
              value: t
          }), 2 & e && "string" != typeof t)
          for (var h in t) i.d(s, h, function(e) {
              return t[e]
          }.bind(null, h));
      return s
  }, i.n = function(t) {
      var e = t && t.__esModule ? function() {
          return t.default
      } : function() {
          return t
      };
      return i.d(e, "a", e), e
  }, i.o = function(t, e) {
      return Object.prototype.hasOwnProperty.call(t, e)
  }, i.p = "/dist/", i(i.s = 0)
}([function(t, e, i) {
  "use strict";
  Object.defineProperty(e, "__esModule", {
      value: !0
  });
  const s = i(1);
  null == customElements.get(s.PianoKeys.tag) && customElements.define(s.PianoKeys.tag, s.PianoKeys)
}, function(t, e, i) {
  "use strict";
  var s;
  Object.defineProperty(e, "__esModule", {
          value: !0
      }),
      function(t) {
          t.classic = "classic", t.linear = "linear"
      }(s = e.PianoKeysLayout || (e.PianoKeysLayout = {})),
      function(t) {
          t.toggle = "toggle", t.slide = "slide", t.default = "default", t.none = "none"
      }(e.PianoKeysMode || (e.PianoKeysMode = {}));
  class h extends HTMLElement {
      constructor() {
          super(), this._whiteKeyBounds = new Map, this._blackKeyBounds = new Map, this._keys = [], this._hoveredKey = null, this._shadowRoot = this.attachShadow({
              mode: "closed"
          }), this._canvas = document.createElement("canvas"), this._canvas.classList.add("piano-keyboard-canvas"), this._ctx = this._canvas.getContext("2d");
          const t = document.createElement("style");
          t.textContent = n, this._shadowRoot.append(t), this._shadowRoot.append(this._canvas), new ResizeObserver(() => this.resize()).observe(this), this._canvas.addEventListener("mousedown", t => this.handleMouseDown(t)), document.addEventListener("mouseup", () => this.handleMouseUp()), this._canvas.addEventListener("mousemove", t => this.handleMouseMove(t)), this._canvas.addEventListener("mouseleave", () => this.handleMouseLeave())
      }
      static get tag() {
          return "piano-keys"
      }
      static get observedAttributes() {
          return ["start", "end", "layout", "fixed", "mode", "stroke", "whiteKey", "whiteKeyHover", "whiteKeyOn", "blackKey", "blackKeyHover", "blackKeyOn"]
      }
      static isBlackKey(t) {
          return [1, 3, 6, 8, 10].includes(t % 12)
      }
      get keys() {
          return this._keys
      }
      get start() {
          return this.getNumberAttribute("start")
      }
      set start(t) {
          this.setAttribute("start", "" + t)
      }
      get end() {
          return this.getNumberAttribute("end")
      }
      set end(t) {
          this.setAttribute("end", "" + t)
      }
      get fixed() {
          return this.getNumberAttribute("fixed")
      }
      set fixed(t) {
          this.setAttribute("fixed", "" + t)
      }
      get layout() {
          return this.getStringAttribute("layout")
      }
      set layout(t) {
          this.setAttribute("layout", t)
      }
      get mode() {
          return this.getStringAttribute("mode")
      }
      set mode(t) {
          this.mode !== t && (this.setAttribute("mode", t), this._keys = [], this._hoveredKey = null, this.draw())
      }
      get hoveredKey() {
          return this._hoveredKey
      }
      get stroke() {
          return this.getStringAttribute("stroke")
      }
      get whiteKey() {
          return this.getStringAttribute("whiteKey")
      }
      get whiteKeyHover() {
          return this.getStringAttribute("whiteKeyHover")
      }
      get whiteKeyOn() {
          return this.getStringAttribute("whiteKeyOn")
      }
      get blackKey() {
          return this.getStringAttribute("blackKey")
      }
      get blackKeyHover() {
          return this.getStringAttribute("blackKeyHover")
      }
      get blackKeyOn() {
          return this.getStringAttribute("blackKeyOn")
      }
      set stroke(t) {
          this.setAttribute("stroke", t), this.draw()
      }
      set whiteKey(t) {
          this.setAttribute("whiteKey", t), this.draw()
      }
      set whiteKeyHover(t) {
          this.setAttribute("whiteKeyHover", t), this.draw()
      }
      set whiteKeyOn(t) {
          this.setAttribute("whiteKeyOn", t), this.draw()
      }
      set blackKey(t) {
          this.setAttribute("blackKey", t), this.draw()
      }
      set blackKeyHover(t) {
          this.setAttribute("blackKeyHover", t), this.draw()
      }
      set blackKeyOn(t) {
          this.setAttribute("blackKeyOn", t), this.draw()
      }
      connectedCallback() {
          this.start = this.start || 60, this.end = this.end || 84, this.whiteKey = this.whiteKey || "#fff", this.whiteKeyHover = this.whiteKeyHover || "#eee", this.whiteKeyOn = this.whiteKeyOn || "#ccc", this.blackKey = this.blackKey || "#888", this.blackKeyHover = this.blackKeyHover || "#333", this.blackKeyOn = this.blackKeyOn || "#111", this.stroke = this.stroke || "#000", this.resize()
      }
      attributeChangedCallback() {
          this.draw()
      }
      draw() {
          this._whiteKeyBounds.clear(), this._blackKeyBounds.clear(), this.layout === s.linear ? this.drawLinear(this._canvas.width, this._canvas.height) : this.drawClassic(this._canvas.width, this._canvas.height)
      }
      drawKey(t, e) {
          this._ctx.fillStyle = this.getFillStyle(t), this._ctx.fillRect(e.x, e.y, e.width, e.height), "classic" == this.layout && h.isBlackKey(t) && (this._ctx.fillStyle = this.stroke, this._ctx.fillRect(Math.round(e.x), e.y, 1, e.height), this._ctx.fillRect(Math.round(e.x), e.y + e.height - 1, e.width, 1), this._ctx.fillRect(Math.round(e.x + e.width - 1), e.y, 1, e.height))
      }
      getFillStyle(t) {
          return h.isBlackKey(t) ? this._keys.includes(t) ? this.blackKeyOn : this._hoveredKey === t ? this.blackKeyHover : this.blackKey : this._keys.includes(t) ? this.whiteKeyOn : this._hoveredKey === t ? this.whiteKeyHover : this.whiteKey
      }
      handleMouseDown(t) {
          const e = this.mode;
          if ("none" === e) return;
          const i = t.offsetX,
              s = t.offsetY,
              h = this.getKeyAtPosition(i, s);
          null != h && ("toggle" === e ? (this._keys.includes(h) ? this._keys = this._keys.filter(t => t !== h) : this._keys = [...this._keys, h], this.notifyKeyChange()) : (this._keys = [h], this.notifyKeyChange())), this.draw()
      }
      handleMouseUp() {
          const t = this.mode;
          "none" !== t && ("toggle" !== t && (this._keys = [], this.notifyKeyChange()), this.draw())
      }
      handleMouseMove(t) {
          const e = this.mode;
          if ("none" === e) return;
          const i = t.offsetX,
              s = t.offsetY,
              h = this.getKeyAtPosition(i, s);
          if (this._hoveredKey != h && (this._hoveredKey = h, this.dispatchEvent(new CustomEvent("keyhover"))), "none" === e) return void this.draw();
          let n = !1;
          0 == t.buttons && "toggle" != e ? this._keys.length > 0 && (this._keys = [], n = !0) : "slide" === e && (1 === this._keys.length && this._keys[0] === this._hoveredKey || (this._keys = [this._hoveredKey], n = !0)), n && this.notifyKeyChange(), this.draw()
      }
      handleMouseLeave() {
          this._hoveredKey = null, this.dispatchEvent(new CustomEvent("keyhover")), this.draw()
      }
      getKeyAtPosition(t, e) {
          let i = null;
          return [...Array.from(this._blackKeyBounds.entries()), ...Array.from(this._whiteKeyBounds.entries())].some(s => {
              const h = s[1];
              if (t >= h.x && t < h.x + h.width && e >= h.y && e < h.y + h.height) return i = s[0], !0
          }), i
      }
      notifyKeyChange() {
          this.dispatchEvent(new CustomEvent("keychange"))
      }
      resize() {
          const t = this._canvas.getBoundingClientRect();
          this._canvas.width = t.width, this._canvas.height = t.height, this.draw()
      }
      drawLinear(t, e) {
          const i = this.start,
              s = Math.max(this.end, i + 2);
          let n, r;
          null == this.fixed || this.fixed <= 0 ? (n = 1 + s - i, r = t / n) : (r = Math.max(h.MIN_KEY_WIDTH, this.fixed), n = Math.ceil(t / r));
          let o = 0;
          for (; o < n;) {
              const t = o + i,
                  s = Math.floor(o * r);
              this.drawKey(t, {
                  x: s,
                  y: 0,
                  width: r,
                  height: e
              }), o > 0 && (this._ctx.fillStyle = this.stroke, this._ctx.fillRect(s, 0, 1, e));
              const n = {
                  x: s,
                  y: 0,
                  width: r,
                  height: e
              };
              h.isBlackKey(t) ? this._blackKeyBounds.set(t, n) : this._whiteKeyBounds.set(t, n), o++
          }
      }
      drawClassic(t, e) {
          let i = this.start;
          h.isBlackKey(i) && i--;
          let s, n, r, o = Math.max(this.end, i + 2);
          h.isBlackKey(o) && o++, null == this.fixed || this.fixed <= 0 ? (s = 1 + o - i, r = Math.round(s * (7 / 12)), n = t / r) : (n = Math.max(this.fixed, h.MIN_KEY_WIDTH), r = Math.ceil(t / n), s = Math.ceil(r * (12 / 7)));
          const a = .65 * e,
              l = Math.round(.58 * n);
          let u = 0;
          for (let t = 0; t < s; ++t) {
              const s = t + i;
              if (h.isBlackKey(s)) {
                  const t = u * n,
                      e = Math.round(t - .5 * l);
                  this._blackKeyBounds.set(s, {
                      x: e,
                      y: 0,
                      width: l,
                      height: a
                  })
              } else {
                  const t = Math.round(u * n);
                  this._whiteKeyBounds.set(s, {
                      x: t,
                      y: 0,
                      width: n,
                      height: e
                  }), u++
              }
              let r = !0;
              for (const t of Array.from(this._whiteKeyBounds.entries())) this.drawKey(t[0], t[1]), r ? r = !1 : (this._ctx.fillStyle = this.stroke, this._ctx.fillRect(t[1].x, 0, 1, e));
              for (const t of Array.from(this._blackKeyBounds.entries())) this.drawKey(t[0], t[1])
          }
      }
      getStringAttribute(t) {
          return this.hasAttribute(t) ? this.getAttribute(t) : null
      }
      getNumberAttribute(t) {
          return this.hasAttribute(t) ? Number(this.getAttribute(t)) : null
      }
  }
  e.PianoKeys = h, h.MIN_KEY_WIDTH = 5;
  const n = "\n:host {\n  display: block;\n}\n\n.piano-keyboard-canvas {\n  width: 100%;\n  height: 100%;\n}\n"
}]);
//# sourceMappingURL=piano-keys.js.map