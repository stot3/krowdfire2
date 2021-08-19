/*!
 * froala_editor v2.6.2 (https://www.froala.com/wysiwyg-editor)
 * License https://froala.com/wysiwyg-editor/terms/
 * Copyright 2014-2017 Froala Labs
 */
! function(e) { "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof module && module.exports ? module.exports = function(t, n) { return void 0 === n && (n = "undefined" != typeof window ? require("jquery") : require("jquery")(t)), e(n) } : e(window.jQuery) }(function(e) {
  var t = function(n, r) {
    this.id = ++e.FE.ID, this.opts = e.extend(!0, {}, e.extend({}, t.DEFAULTS, "object" == typeof r && r));
    var o = JSON.stringify(this.opts);
    e.FE.OPTS_MAPPING[o] = e.FE.OPTS_MAPPING[o] || this.id, this.sid = e.FE.OPTS_MAPPING[o], e.FE.SHARED[this.sid] = e.FE.SHARED[this.sid] || {}, this.shared = e.FE.SHARED[this.sid], this.shared.count = (this.shared.count || 0) + 1, this.$oel = e(n), this.$oel.data("froala.editor", this), this.o_doc = n.ownerDocument, this.o_win = "defaultView" in this.o_doc ? this.o_doc.defaultView : this.o_doc.parentWindow;
    var i = e(this.o_win).scrollTop();
    this.$oel.on("froala.doInit", e.proxy(function() {
      this.$oel.off("froala.doInit"), this.doc = this.$el.get(0).ownerDocument, this.win = "defaultView" in this.doc ? this.doc.defaultView : this.doc.parentWindow, this.$doc = e(this.doc), this.$win = e(this.win), this.opts.pluginsEnabled || (this.opts.pluginsEnabled = Object.keys(e.FE.PLUGINS)), this.opts.initOnClick ? (this.load(e.FE.MODULES), this.$el.on("touchstart.init", function() { e(this).data("touched", !0) }), this.$el.on("touchmove.init", function() { e(this).removeData("touched") }), this.$el.on("mousedown.init touchend.init dragenter.init focus.init", e.proxy(function(t) {
        if ("touchend" == t.type && !this.$el.data("touched")) return !0;
        if (1 === t.which || !t.which) {
          this.$el.off("mousedown.init touchstart.init touchmove.init touchend.init dragenter.init focus.init"), this.load(e.FE.MODULES), this.load(e.FE.PLUGINS);
          var n = t.originalEvent && t.originalEvent.originalTarget;
          n && "IMG" == n.tagName && e(n).trigger("mousedown"), void 0 === this.ul && this.destroy(), "touchend" == t.type && this.image && t.originalEvent && t.originalEvent.target && e(t.originalEvent.target).is("img") && setTimeout(e.proxy(function() { this.image.edit(e(t.originalEvent.target)) }, this), 100), this.ready = !0, this.events.trigger("initialized")
        }
      }, this))) : (this.load(e.FE.MODULES), this.load(e.FE.PLUGINS), e(this.o_win).scrollTop(i), void 0 === this.ul && this.destroy(), this.ready = !0, this.events.trigger("initialized"))
    }, this)), this._init()
  };
  t.DEFAULTS = { initOnClick: !1, pluginsEnabled: null }, t.MODULES = {}, t.PLUGINS = {}, t.VERSION = "2.6.2", t.INSTANCES = [], t.OPTS_MAPPING = {}, t.SHARED = {}, t.ID = 0, t.prototype._init = function() {
    var t = this.$oel.prop("tagName");
    this.$oel.closest("label").length >= 1 && console.warn("Note! It is not recommended to initialize the Froala Editor within a label tag.");
    var n = e.proxy(function() { "TEXTAREA" != t && (this._original_html = this._original_html || this.$oel.html()), this.$box = this.$box || this.$oel, this.opts.fullPage && (this.opts.iframe = !0), this.opts.iframe ? (this.$iframe = e('<iframe src="about:blank" frameBorder="0">'), this.$wp = e("<div></div>"), this.$box.html(this.$wp), this.$wp.append(this.$iframe), this.$iframe.get(0).contentWindow.document.open(), this.$iframe.get(0).contentWindow.document.write("<!DOCTYPE html>"), this.$iframe.get(0).contentWindow.document.write("<html><head></head><body></body></html>"), this.$iframe.get(0).contentWindow.document.close(), this.$el = this.$iframe.contents().find("body"), this.el = this.$el.get(0), this.$head = this.$iframe.contents().find("head"), this.$html = this.$iframe.contents().find("html"), this.iframe_document = this.$iframe.get(0).contentWindow.document, this.$oel.trigger("froala.doInit")) : (this.$el = e("<div></div>"), this.el = this.$el.get(0), this.$wp = e("<div></div>").append(this.$el), this.$box.html(this.$wp), this.$oel.trigger("froala.doInit")) }, this),
      r = e.proxy(function() { this.$box = e("<div>"), this.$oel.before(this.$box).hide(), this._original_html = this.$oel.val(), this.$oel.parents("form").on("submit." + this.id, e.proxy(function() { this.events.trigger("form.submit") }, this)), this.$oel.parents("form").on("reset." + this.id, e.proxy(function() { this.events.trigger("form.reset") }, this)), n() }, this),
      o = e.proxy(function() { this.$el = this.$oel, this.el = this.$el.get(0), this.$el.attr("contenteditable", !0).css("outline", "none").css("display", "inline-block"), this.opts.multiLine = !1, this.opts.toolbarInline = !1, this.$oel.trigger("froala.doInit") }, this),
      i = e.proxy(function() { this.$el = this.$oel, this.el = this.$el.get(0), this.opts.toolbarInline = !1, this.$oel.trigger("froala.doInit") }, this),
      a = e.proxy(function() { this.$el = this.$oel, this.el = this.$el.get(0), this.opts.toolbarInline = !1, this.$oel.on("click.popup", function(e) { e.preventDefault() }), this.$oel.trigger("froala.doInit") }, this);
    this.opts.editInPopup ? a() : "TEXTAREA" == t ? r() : "A" == t ? o() : "IMG" == t ? i() : "BUTTON" == t || "INPUT" == t ? (this.opts.editInPopup = !0, this.opts.toolbarInline = !1, a()) : n()
  }, t.prototype.load = function(t) {
    for (var n in t)
      if (t.hasOwnProperty(n)) { if (this[n]) continue; if (e.FE.PLUGINS[n] && this.opts.pluginsEnabled.indexOf(n) < 0) continue; if (this[n] = new t[n](this), this[n]._init && (this[n]._init(), this.opts.initOnClick && "core" == n)) return !1 }
  }, t.prototype.destroy = function() {
    this.shared.count--, this.events.$off();
    var t = this.html.get();
    if (this.events.trigger("destroy", [], !0), this.events.trigger("shared.destroy", void 0, !0), 0 === this.shared.count) {
      for (var n in this.shared) this.shared.hasOwnProperty(n) && (this.shared[n], e.FE.SHARED[this.sid][n] = null);
      e.FE.SHARED[this.sid] = {}
    }
    this.$oel.parents("form").off("." + this.id), this.$oel.off("click.popup"), this.$oel.removeData("froala.editor"), this.$oel.off("froalaEditor"), this.core.destroy(t), e.FE.INSTANCES.splice(e.FE.INSTANCES.indexOf(this), 1)
  }, e.fn.froalaEditor = function(n) {
    for (var r = [], o = 0; o < arguments.length; o++) r.push(arguments[o]);
    if ("string" == typeof n) {
      var i = [];
      return this.each(function() {
        var t, o, a = e(this).data("froala.editor");
        if (!a) return console.warn("Editor should be initialized before calling the " + n + " method.");
        if (n.indexOf(".") > 0 && a[n.split(".")[0]] ? (a[n.split(".")[0]] && (t = a[n.split(".")[0]]), o = n.split(".")[1]) : (t = a, o = n.split(".")[0]), !t[o]) return e.error("Method " + n + " does not exist in Froala Editor.");
        var s = t[o].apply(a, r.slice(1));
        void 0 === s ? i.push(this) : 0 === i.length && i.push(s)
      }), 1 == i.length ? i[0] : i
    }
    if ("object" == typeof n || !n) return this.each(function() { if (!e(this).data("froala.editor")) { new t(this, n) } })
  }, e.fn.froalaEditor.Constructor = t, e.FroalaEditor = t, e.FE = t, e.FE.XS = 0, e.FE.SM = 1, e.FE.MD = 2, e.FE.LG = 3, e.FE.MODULES.helpers = function(t) {
    function n() {
      var e = {},
        t = function() { var e, t = -1; return "Microsoft Internet Explorer" == navigator.appName ? (e = navigator.userAgent, null !== new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})").exec(e) && (t = parseFloat(RegExp.$1))) : "Netscape" == navigator.appName && (e = navigator.userAgent, null !== new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})").exec(e) && (t = parseFloat(RegExp.$1))), t }();
      if (t > 0) e.msie = !0;
      else {
        var n = navigator.userAgent.toLowerCase(),
          r = /(edge)[ \/]([\w.]+)/.exec(n) || /(chrome)[ \/]([\w.]+)/.exec(n) || /(webkit)[ \/]([\w.]+)/.exec(n) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(n) || /(msie) ([\w.]+)/.exec(n) || n.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(n) || [],
          o = { browser: r[1] || "", version: r[2] || "0" };
        r[1] && (e[o.browser] = !0), e.chrome ? e.webkit = !0 : e.webkit && (e.safari = !0)
      }
      return e.msie && (e.version = t), e
    }

    function r() { return /(iPad|iPhone|iPod)/g.test(navigator.userAgent) && !a() }

    function o() { return /(Android)/g.test(navigator.userAgent) && !a() }

    function i() { return /(Blackberry)/g.test(navigator.userAgent) }

    function a() { return /(Windows Phone)/gi.test(navigator.userAgent) }

    function s(e) { return parseInt(e, 10) || 0 }

    function l(e) {
      if (!/^(https?:|ftps?:|)\/\//i.test(e)) return !1;
      e = String(e).replace(/</g, "%3C").replace(/>/g, "%3E").replace(/"/g, "%22").replace(/ /g, "%20");
      return /(http|ftp|https):\/\/[a-z\u00a1-\uffff0-9{}]+(\.[a-z\u00a1-\uffff0-9{}]*)*([a-z\u00a1-\uffff0-9.,@?^=%&amp;:\/~+#-_{}]*[a-z\u00a1-\uffff0-9@?^=%&amp;\/~+#-_{}])?/gi.test(e)
    }
    var d;
    var c = null;
    return {
      _init: function() {
        t.browser = n(),
          function() {
            var e = t.o_doc.createElement("div");
            try { e.querySelectorAll(":scope *") } catch (t) {
              var n = /^\s*:scope/gi;

              function r(t, r) {
                var o = t[r];
                t[r] = function(t) {
                  var r, i = !1,
                    a = !1;
                  if (t && t.match(n)) { t = t.replace(n, ""), this.parentNode || (e.appendChild(this), a = !0); var s = this.parentNode; return this.id || (this.id = "rootedQuerySelector_id_" + (new Date).getTime(), i = !0), r = o.call(s, "#" + this.id + " " + t), i && (this.id = ""), a && e.removeChild(this), r }
                  return o.call(this, t)
                }
              }
              r(Element.prototype, "querySelector"), r(Element.prototype, "querySelectorAll"), r(HTMLElement.prototype, "querySelector"), r(HTMLElement.prototype, "querySelectorAll")
            }
          }()
      },
      isIOS: r,
      isMac: function() { return null == c && (c = navigator.platform.toUpperCase().indexOf("MAC") >= 0), c },
      isAndroid: o,
      isBlackberry: i,
      isWindowsPhone: a,
      isMobile: function() { return o() || r() || i() },
      requestAnimationFrame: function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(e) { window.setTimeout(e, 1e3 / 60) } },
      getPX: s,
      screenSize: function() {
        var t = e('<div class="fr-visibility-helper"></div>').appendTo("body:first"),
          n = s(t.css("margin-left"));
        return t.remove(), n
      },
      isTouch: function() { return "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch },
      sanitizeURL: function(e) { if (/^([A-Za-z]:(\\){1,2}|[A-Za-z]:((\\){1,2}[^\\]+)+)(\\)?$/i.test(e)) return e; if (/^(https?:|ftps?:|)\/\//i.test(e)) { if (!l(e) && !l("http:" + e)) return "" } else e = encodeURIComponent(e).replace(/%23/g, "#").replace(/%2F/g, "/").replace(/%25/g, "%").replace(/mailto%3A/gi, "mailto:").replace(/file%3A/gi, "file:").replace(/sms%3A/gi, "sms:").replace(/tel%3A/gi, "tel:").replace(/notes%3A/gi, "notes:").replace(/data%3Aimage/gi, "data:image").replace(/blob%3A/gi, "blob:").replace(/webkit-fake-url%3A/gi, "webkit-fake-url:").replace(/%3F/g, "?").replace(/%3D/g, "=").replace(/%26/g, "&").replace(/&amp;/g, "&").replace(/%2C/g, ",").replace(/%3B/g, ";").replace(/%2B/g, "+").replace(/%40/g, "@").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/%7B/g, "{").replace(/%7D/g, "}"); return e },
      isArray: function(e) { return e && !e.propertyIsEnumerable("length") && "object" == typeof e && "number" == typeof e.length },
      RGBToHex: function(e) {
        function t(e) { return ("0" + parseInt(e, 10).toString(16)).slice(-2) }
        try { return e && "transparent" !== e ? /^#[0-9A-F]{6}$/i.test(e) ? e : ("#" + t((e = e.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/))[1]) + t(e[2]) + t(e[3])).toUpperCase() : "" } catch (e) { return null }
      },
      HEXtoRGB: function(e) { e = e.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(e, t, n, r) { return t + t + n + n + r + r }); var t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e); return t ? "rgb(" + parseInt(t[1], 16) + ", " + parseInt(t[2], 16) + ", " + parseInt(t[3], 16) + ")" : "" },
      isURL: l,
      getAlignment: function(n) {
        var r = (n.css("text-align") || "").replace(/-(.*)-/g, "");
        if (["left", "right", "justify", "center"].indexOf(r) < 0) {
          if (!d) {
            var o = e('<div dir="' + ("rtl" == t.opts.direction ? "rtl" : "auto") + '" style="text-align: ' + t.$el.css("text-align") + '; position: fixed; left: -3000px;"><span id="s1">.</span><span id="s2">.</span></div>');
            e("body:first").append(o);
            var i = o.find("#s1").get(0).getBoundingClientRect().left,
              a = o.find("#s2").get(0).getBoundingClientRect().left;
            o.remove(), d = i < a ? "left" : "right"
          }
          r = d
        }
        return r
      },
      scrollTop: function() { return t.o_win.pageYOffset ? t.o_win.pageYOffset : t.o_doc.documentElement && t.o_doc.documentElement.scrollTop ? t.o_doc.documentElement.scrollTop : t.o_doc.body.scrollTop ? t.o_doc.body.scrollTop : 0 },
      scrollLeft: function() { return t.o_win.pageXOffset ? t.o_win.pageXOffset : t.o_doc.documentElement && t.o_doc.documentElement.scrollLeft ? t.o_doc.documentElement.scrollLeft : t.o_doc.body.scrollLeft ? t.o_doc.body.scrollLeft : 0 }
    }
  }, e.FE.MODULES.events = function(t) {
    var n, r = {};

    function o(e, t, n) { f(e, t, n) }

    function i(n) {
      if (void 0 === n && (n = !0), !t.$wp) return !1;
      if (t.helpers.isIOS() && t.$win.get(0).focus(), !t.core.hasFocus() && n) { var r = t.$win.scrollTop(); return t.browser.msie && t.$box && t.$box.css("position", "fixed"), t.browser.msie && t.$wp && t.$wp.css("overflow", "visible"), t.$el.focus(), t.browser.msie && t.$box && t.$box.css("position", ""), t.browser.msie && t.$wp && t.$wp.css("overflow", "auto"), r != t.$win.scrollTop() && t.$win.scrollTop(r), !1 }
      if (!t.core.hasFocus() || t.$el.find(".fr-marker").length > 0) return !1;
      if (t.selection.info(t.el).atStart && t.selection.isCollapsed() && null != t.html.defaultTag()) {
        var o = t.markers.insert();
        if (o && !t.node.blockParent(o)) {
          e(o).remove();
          var i = t.$el.find(t.html.blockTagsQuery()).get(0);
          i && (e(i).prepend(e.FE.MARKERS), t.selection.restore())
        } else o && e(o).remove()
      }
    }
    var a = !1;

    function s() { n = !0 }

    function l() { return n }

    function d(e, n, o) {
      var i, a = e.split(" ");
      if (a.length > 1) { for (var s = 0; s < a.length; s++) d(a[s], n, o); return !0 }
      void 0 === o && (o = !1), i = 0 !== e.indexOf("shared.") ? r[e] = r[e] || [] : t.shared._events[e] = t.shared._events[e] || [], o ? i.unshift(n) : i.push(n)
    }
    var c = [];

    function f(e, n, r, o, i) {
      "function" == typeof r && (i = o, o = r, r = !1);
      var a = i ? t.shared.$_events : c,
        s = i ? t.sid : t.id;
      r ? e.on(n.split(" ").join(".ed" + s + " ") + ".ed" + s, r, o) : e.on(n.split(" ").join(".ed" + s + " ") + ".ed" + s, o), a.indexOf(e.get(0)) < 0 && a.push(e.get(0))
    }

    function p(t, n) { for (var r = 0; r < t.length; r++) e(t[r]).off(".ed" + n) }

    function u(n, o, i) {
      if (!t.edit.isDisabled() || i) {
        var a, s;
        if (0 !== n.indexOf("shared.")) a = r[n];
        else {
          if (t.shared.count > 0) return !1;
          a = t.shared._events[n]
        }
        if (a)
          for (var l = 0; l < a.length; l++)
            if (!1 === (s = a[l].apply(t, o))) return !1;
        return !1 !== (s = t.$oel.triggerHandler("froalaEditor." + n, e.merge([t], o || []))) && s
      }
    }

    function g() { for (var e in r) r.hasOwnProperty(e) && delete r[e] }

    function h() { for (var e in t.shared._events) t.shared._events.hasOwnProperty(e) && delete t.shared._events[e] }
    return {
      _init: function() { t.shared.$_events = t.shared.$_events || [], t.shared._events = {}, t.helpers.isMobile() ? (t._mousedown = "touchstart", t._mouseup = "touchend", t._move = "touchmove", t._mousemove = "touchmove") : (t._mousedown = "mousedown", t._mouseup = "mouseup", t._move = "", t._mousemove = "mousemove"), o(t.$el, "click mouseup mousedown touchstart touchend dragenter dragover dragleave dragend drop dragstart", function(e) { u(e.type, [e]) }), d("mousedown", function() { for (var n = 0; n < e.FE.INSTANCES.length; n++) e.FE.INSTANCES[n] != t && e.FE.INSTANCES[n].popups && e.FE.INSTANCES[n].popups.areVisible() && e.FE.INSTANCES[n].$el.find(".fr-marker").remove() }), o(t.$win, t._mousedown, function(e) { u("window.mousedown", [e]), s() }), o(t.$win, t._mouseup, function(e) { u("window.mouseup", [e]) }), o(t.$win, "cut copy keydown keyup touchmove touchend", function(e) { u("window." + e.type, [e]) }), o(t.$doc, "dragend drop", function(e) { u("document." + e.type, [e]) }), o(t.$el, "keydown keypress keyup input", function(e) { u(e.type, [e]) }), o(t.$el, "focus", function(e) { l() && (i(!1), !1 === a && u(e.type, [e])) }), o(t.$el, "blur", function(e) { l() && !0 === a && (u(e.type, [e]), s()) }), d("focus", function() { a = !0 }), d("blur", function() { a = !1 }), s(), o(t.$el, "cut copy paste beforepaste", function(e) { u(e.type, [e]) }), d("destroy", g), d("shared.destroy", h) },
      on: d,
      trigger: u,
      bindClick: function(n, r, o) {
        f(n, t._mousedown, r, function(n) {
          t.edit.isDisabled() || function(n) {
            var r = e(n.currentTarget);
            t.edit.isDisabled() || t.node.hasClass(r.get(0), "fr-disabled") ? n.preventDefault() : "mousedown" === n.type && 1 !== n.which || (t.helpers.isMobile() || n.preventDefault(), (t.helpers.isAndroid() || t.helpers.isWindowsPhone()) && 0 === r.parents(".fr-dropdown-menu").length && (n.preventDefault(), n.stopPropagation()), r.addClass("fr-selected"), t.events.trigger("commands.mousedown", [r]))
          }(n)
        }, !0), f(n, t._mouseup + " " + t._move, r, function(n) {
          t.edit.isDisabled() || function(n, r) {
            var o = e(n.currentTarget);
            if (t.edit.isDisabled() || t.node.hasClass(o.get(0), "fr-disabled")) return n.preventDefault(), !1;
            if ("mouseup" === n.type && 1 !== n.which) return !0;
            if (!t.node.hasClass(o.get(0), "fr-selected")) return !0;
            if ("touchmove" != n.type) {
              if (n.stopPropagation(), n.stopImmediatePropagation(), n.preventDefault(), !t.node.hasClass(o.get(0), "fr-selected")) return t.button.getButtons(".fr-selected", !0).removeClass("fr-selected"), !1;
              if (t.button.getButtons(".fr-selected", !0).removeClass("fr-selected"), o.data("dragging") || o.attr("disabled")) return o.removeData("dragging"), !1;
              var i = o.data("timeout");
              i && (clearTimeout(i), o.removeData("timeout")), r.apply(t, [n])
            } else o.data("timeout") || o.data("timeout", setTimeout(function() { o.data("dragging", !0) }, 100))
          }(n, o)
        }, !0), f(n, "mousedown click mouseup", r, function(e) { t.edit.isDisabled() || e.stopPropagation() }, !0), d("window.mouseup", function() { t.edit.isDisabled() || (n.find(r).removeClass("fr-selected"), s()) })
      },
      disableBlur: function() { n = !1 },
      enableBlur: s,
      blurActive: l,
      focus: i,
      chainTrigger: function(n, o, i) {
        if (!t.edit.isDisabled() || i) {
          var a, s;
          if (0 !== n.indexOf("shared.")) a = r[n];
          else {
            if (t.shared.count > 0) return !1;
            a = t.shared._events[n]
          }
          if (a)
            for (var l = 0; l < a.length; l++) void 0 !== (s = a[l].apply(t, [o])) && (o = s);
          return void 0 !== (s = t.$oel.triggerHandler("froalaEditor." + n, e.merge([t], [o]))) && (o = s), o
        }
      },
      $on: f,
      $off: function() { p(c, t.id), c = [], 0 === t.shared.count && (p(t.shared.$_events, t.sid), t.shared.$_events = null) }
    }
  }, e.FE.MODULES.node = function(t) {
    function n(e) { return e && "IFRAME" != e.tagName ? Array.prototype.slice.call(e.childNodes || []) : [] }

    function r(t) { return !!t && (t.nodeType == Node.ELEMENT_NODE && e.FE.BLOCK_TAGS.indexOf(t.tagName.toLowerCase()) >= 0) }

    function o(e) {
      var t = {},
        n = e.attributes;
      if (n)
        for (var r = 0; r < n.length; r++) {
          var o = n[r];
          t[o.nodeName] = o.value
        }
      return t
    }

    function i(e) {
      for (var t = "", n = o(e), r = Object.keys(n).sort(), i = 0; i < r.length; i++) {
        var a = r[i],
          s = n[a];
        s.indexOf("'") < 0 && s.indexOf('"') >= 0 ? t += " " + a + "='" + s + "'" : s.indexOf('"') >= 0 && s.indexOf("'") >= 0 ? t += " " + a + '="' + (s = s.replace(/"/g, "&quot;")) + '"' : t += " " + a + '="' + s + '"'
      }
      return t
    }

    function a(e) { return e === t.el }
    return {
      isBlock: r,
      isEmpty: function(o, i) {
        if (!o) return !0;
        if (o.querySelector("table")) return !1;
        var a = n(o);
        1 == a.length && r(a[0]) && (a = n(a[0]));
        for (var s = !1, l = 0; l < a.length; l++) { var d = a[l]; if (!(i && t.node.hasClass(d, "fr-marker") || d.nodeType == Node.TEXT_NODE && 0 === d.textContent.length)) { if ("BR" != d.tagName && (d.textContent || "").replace(/\u200B/gi, "").replace(/\n/g, "").length > 0) return !1; if (s) return !1; "BR" == d.tagName && (s = !0) } }
        return !(o.querySelectorAll(e.FE.VOID_ELEMENTS.join(",")).length - o.querySelectorAll("br").length || o.querySelector(t.opts.htmlAllowedEmptyTags.join(":not(.fr-marker),") + ":not(.fr-marker)") || o.querySelectorAll(e.FE.BLOCK_TAGS.join(",")).length > 1 || o.querySelector(t.opts.htmlDoNotWrapTags.join(":not(.fr-marker),") + ":not(.fr-marker)"))
      },
      blockParent: function(e) {
        for (; e && e.parentNode !== t.el && (!e.parentNode || !t.node.hasClass(e.parentNode, "fr-inner"));)
          if (r(e = e.parentNode)) return e;
        return null
      },
      deepestParent: function(n, o, i) { if (void 0 === o && (o = []), void 0 === i && (i = !0), o.push(t.el), o.indexOf(n.parentNode) >= 0 || n.parentNode && t.node.hasClass(n.parentNode, "fr-inner") || n.parentNode && e.FE.SIMPLE_ENTER_TAGS.indexOf(n.parentNode.tagName) >= 0 && i) return null; for (; o.indexOf(n.parentNode) < 0 && n.parentNode && !t.node.hasClass(n.parentNode, "fr-inner") && (e.FE.SIMPLE_ENTER_TAGS.indexOf(n.parentNode.tagName) < 0 || !i) && (!r(n) || !r(n.parentNode) || !i);) n = n.parentNode; return n },
      rawAttributes: o,
      attributes: i,
      clearAttributes: function(e) {
        for (var t = e.attributes, n = t.length - 1; n >= 0; n--) {
          var r = t[n];
          e.removeAttribute(r.nodeName)
        }
      },
      openTagString: function(e) { return "<" + e.tagName.toLowerCase() + i(e) + ">" },
      closeTagString: function(e) { return "</" + e.tagName.toLowerCase() + ">" },
      isFirstSibling: function e(n, r) { void 0 === r && (r = !0); for (var o = n.previousSibling; o && r && t.node.hasClass(o, "fr-marker");) o = o.previousSibling; return !o || o.nodeType == Node.TEXT_NODE && "" === o.textContent && e(o) },
      isLastSibling: function e(n, r) { void 0 === r && (r = !0); for (var o = n.nextSibling; o && r && t.node.hasClass(o, "fr-marker");) o = o.nextSibling; return !o || o.nodeType == Node.TEXT_NODE && "" === o.textContent && e(o) },
      isList: function(e) { return !!e && ["UL", "OL"].indexOf(e.tagName) >= 0 },
      isLink: function(e) { return !!e && e.nodeType == Node.ELEMENT_NODE && "a" == e.tagName.toLowerCase() },
      isElement: a,
      contents: n,
      isVoid: function(t) { return t && t.nodeType == Node.ELEMENT_NODE && e.FE.VOID_ELEMENTS.indexOf((t.tagName || "").toLowerCase()) >= 0 },
      hasFocus: function(e) { return e === t.doc.activeElement && (!t.doc.hasFocus || t.doc.hasFocus()) && !!(a(e) || e.type || e.href || ~e.tabIndex) },
      isEditable: function(e) { return (!e.getAttribute || "false" != e.getAttribute("contenteditable")) && ["STYLE", "SCRIPT"].indexOf(e.tagName) < 0 },
      isDeletable: function(e) { return e && e.nodeType == Node.ELEMENT_NODE && e.getAttribute("class") && (e.getAttribute("class") || "").indexOf("fr-deletable") >= 0 },
      hasClass: function(t, n) { return t instanceof e && (t = t.get(0)), t && t.classList && t.classList.contains(n) },
      filter: function(e) { return t.browser.msie ? e : { acceptNode: e } }
    }
  }, e.FE.INVISIBLE_SPACE = "&#8203;", e.FE.START_MARKER = '<span class="fr-marker" data-id="0" data-type="true" style="display: none; line-height: 0;">' + e.FE.INVISIBLE_SPACE + "</span>", e.FE.END_MARKER = '<span class="fr-marker" data-id="0" data-type="false" style="display: none; line-height: 0;">' + e.FE.INVISIBLE_SPACE + "</span>", e.FE.MARKERS = e.FE.START_MARKER + e.FE.END_MARKER, e.FE.MODULES.markers = function(t) {
    function n() {
      if (!t.$wp) return null;
      try {
        var n = t.selection.ranges(0),
          r = n.commonAncestorContainer;
        if (r != t.el && 0 === t.$el.find(r).length) return null;
        var o = n.cloneRange(),
          i = n.cloneRange();
        o.collapse(!0);
        var a = e('<span class="fr-marker" style="display: none; line-height: 0;">' + e.FE.INVISIBLE_SPACE + "</span>", t.doc)[0];
        if (o.insertNode(a), a = t.$el.find("span.fr-marker").get(0)) { for (var s = a.nextSibling; s && s.nodeType === Node.TEXT_NODE && 0 === s.textContent.length;) e(s).remove(), s = t.$el.find("span.fr-marker").get(0).nextSibling; return t.selection.clear(), t.selection.get().addRange(i), a }
        return null
      } catch (e) { console.warn("MARKER", e) }
    }

    function r() { t.$el.find(".fr-marker").remove() }
    return {
      place: function(n, r, o) {
        var i, a, s;
        try {
          var l = n.cloneRange();
          if (l.collapse(r), l.insertNode(function(n, r) { return e('<span class="fr-marker" data-id="' + r + '" data-type="' + n + '" style="display: ' + (t.browser.safari ? "none" : "inline-block") + '; line-height: 0;">' + e.FE.INVISIBLE_SPACE + "</span>", t.doc)[0] }(r, o)), !0 === r)
            for (s = (i = t.$el.find('span.fr-marker[data-type="true"][data-id="' + o + '"]').get(0)).nextSibling; s && s.nodeType === Node.TEXT_NODE && 0 === s.textContent.length;) e(s).remove(), s = i.nextSibling;
          if (!0 === r && !n.collapsed) {
            for (; !t.node.isElement(i.parentNode) && !s;) e(i.parentNode).after(i), s = i.nextSibling;
            if (s && s.nodeType === Node.ELEMENT_NODE && t.node.isBlock(s)) {
              a = [s];
              do { s = a[0], a = t.node.contents(s) } while (a[0] && t.node.isBlock(a[0]));
              e(s).prepend(e(i))
            }
          }
          if (!1 === r && !n.collapsed) {
            if ((s = (i = t.$el.find('span.fr-marker[data-type="false"][data-id="' + o + '"]').get(0)).previousSibling) && s.nodeType === Node.ELEMENT_NODE && t.node.isBlock(s)) {
              a = [s];
              do { s = a[a.length - 1], a = t.node.contents(s) } while (a[a.length - 1] && t.node.isBlock(a[a.length - 1]));
              e(s).append(e(i))
            }
            i.parentNode && ["TD", "TH"].indexOf(i.parentNode.tagName) >= 0 && i.parentNode.previousSibling && !i.previousSibling && e(i.parentNode.previousSibling).append(i)
          }
          var d = t.$el.find('span.fr-marker[data-type="' + r + '"][data-id="' + o + '"]').get(0);
          return d && (d.style.display = "none"), d
        } catch (e) { return null }
      },
      insert: n,
      split: function() {
        t.selection.isCollapsed() || t.selection.remove();
        var r = t.$el.find(".fr-marker").get(0);
        if (null == r && (r = n()), null == r) return null;
        var o = t.node.deepestParent(r);
        if (o || (o = t.node.blockParent(r)) && "LI" != o.tagName && (o = null), o)
          if (t.node.isBlock(o) && t.node.isEmpty(o)) "LI" != o.tagName || o.parentNode.firstElementChild != o || t.node.isEmpty(o.parentNode) ? e(o).replaceWith('<span class="fr-marker"></span>') : e(o).append('<span class="fr-marker"></span>');
          else if (t.cursor.isAtStart(r, o)) e(o).before('<span class="fr-marker"></span>'), e(r).remove();
        else if (t.cursor.isAtEnd(r, o)) e(o).after('<span class="fr-marker"></span>'), e(r).remove();
        else {
          var i = r,
            a = "",
            s = "";
          do { i = i.parentNode, a += t.node.closeTagString(i), s = t.node.openTagString(i) + s } while (i != o);
          e(r).replaceWith('<span id="fr-break"></span>');
          var l = t.node.openTagString(o) + e(o).html() + t.node.closeTagString(o);
          l = l.replace(/<span id="fr-break"><\/span>/g, a + '<span class="fr-marker"></span>' + s), e(o).replaceWith(l)
        }
        return t.$el.find(".fr-marker").get(0)
      },
      insertAtPoint: function(e) {
        var o, i = e.clientX,
          a = e.clientY;
        r();
        var s = null;
        if (void 0 !== t.doc.caretPositionFromPoint ? (o = t.doc.caretPositionFromPoint(i, a), (s = t.doc.createRange()).setStart(o.offsetNode, o.offset), s.setEnd(o.offsetNode, o.offset)) : void 0 !== t.doc.caretRangeFromPoint && (o = t.doc.caretRangeFromPoint(i, a), (s = t.doc.createRange()).setStart(o.startContainer, o.startOffset), s.setEnd(o.startContainer, o.startOffset)), null !== s && void 0 !== t.win.getSelection) {
          var l = t.win.getSelection();
          l.removeAllRanges(), l.addRange(s)
        } else if (void 0 !== t.doc.body.createTextRange) try {
          (s = t.doc.body.createTextRange()).moveToPoint(i, a);
          var d = s.duplicate();
          d.moveToPoint(i, a), s.setEndPoint("EndToEnd", d), s.select()
        } catch (e) { return !1 }
        n()
      },
      remove: r
    }
  }, e.FE.MODULES.selection = function(t) {
    function n() { var e = ""; return t.win.getSelection ? e = t.win.getSelection() : t.doc.getSelection ? e = t.doc.getSelection() : t.doc.selection && (e = t.doc.selection.createRange().text), e.toString() }

    function r() { return t.win.getSelection ? t.win.getSelection() : t.doc.getSelection ? t.doc.getSelection() : t.doc.selection.createRange() }

    function o(e) {
      var n = r(),
        o = [];
      if (n && n.getRangeAt && n.rangeCount) { o = []; for (var i = 0; i < n.rangeCount; i++) o.push(n.getRangeAt(i)) } else o = t.doc.createRange ? [t.doc.createRange()] : [];
      return void 0 !== e ? o[e] : o
    }

    function i() { var e = r(); try { e.removeAllRanges ? e.removeAllRanges() : e.empty ? e.empty() : e.clear && e.clear() } catch (e) {} }

    function a(e, t) { var n = e; return n.nodeType == Node.ELEMENT_NODE && n.childNodes.length > 0 && n.childNodes[t] && (n = n.childNodes[t]), n.nodeType == Node.TEXT_NODE && (n = n.parentNode), n }

    function s() {
      if (t.$wp) {
        t.markers.remove();
        var n, r, i = o(),
          a = [];
        for (r = 0; r < i.length; r++)
          if (i[r].startContainer !== t.doc || t.browser.msie) {
            var s = (n = i[r]).collapsed,
              l = t.markers.place(n, !0, r),
              d = t.markers.place(n, !1, r);
            void 0 !== l && l || !s || (e(".fr-marker").remove(), t.selection.setAtEnd(t.el)), t.el.normalize(), t.browser.safari && !s && ((n = t.doc.createRange()).setStartAfter(l), n.setEndBefore(d), a.push(n))
          }
        if (t.browser.safari && a.length)
          for (t.selection.clear(), r = 0; r < a.length; r++) t.selection.get().addRange(a[r])
      }
    }

    function l() {
      var n, o = t.el.querySelectorAll('.fr-marker[data-type="true"]');
      if (!t.$wp) return t.markers.remove(), !1;
      if (0 === o.length) return !1;
      if (t.browser.msie || t.browser.edge)
        for (n = 0; n < o.length; n++) o[n].style.display = "inline-block";
      t.core.hasFocus() || t.browser.msie || t.browser.webkit || t.$el.focus(), i();
      var a = r();
      for (n = 0; n < o.length; n++) {
        var s = e(o[n]).data("id"),
          l = o[n],
          c = t.doc.createRange(),
          f = t.$el.find('.fr-marker[data-type="false"][data-id="' + s + '"]');
        (t.browser.msie || t.browser.edge) && f.css("display", "inline-block");
        var p = null;
        if (f.length > 0) {
          f = f[0];
          try {
            for (var u, g = !1, h = l.nextSibling; h && h.nodeType == Node.TEXT_NODE && 0 === h.textContent.length;) u = h, h = h.nextSibling, e(u).remove();
            for (var m, v, E = f.nextSibling; E && E.nodeType == Node.TEXT_NODE && 0 === E.textContent.length;) u = E, E = E.nextSibling, e(u).remove();
            if (l.nextSibling == f || f.nextSibling == l) {
              for (var b = l.nextSibling == f ? l : f, S = b == l ? f : l, T = b.previousSibling; T && T.nodeType == Node.TEXT_NODE && 0 === T.length;) u = T, T = T.previousSibling, e(u).remove();
              if (T && T.nodeType == Node.TEXT_NODE)
                for (; T && T.previousSibling && T.previousSibling.nodeType == Node.TEXT_NODE;) T.previousSibling.textContent = T.previousSibling.textContent + T.textContent, T = T.previousSibling, e(T.nextSibling).remove();
              for (var y = S.nextSibling; y && y.nodeType == Node.TEXT_NODE && 0 === y.length;) u = y, y = y.nextSibling, e(u).remove();
              if (y && y.nodeType == Node.TEXT_NODE)
                for (; y && y.nextSibling && y.nextSibling.nodeType == Node.TEXT_NODE;) y.nextSibling.textContent = y.textContent + y.nextSibling.textContent, y = y.nextSibling, e(y.previousSibling).remove();
              if (T && (t.node.isVoid(T) || t.node.isBlock(T)) && (T = null), y && (t.node.isVoid(y) || t.node.isBlock(y)) && (y = null), T && y && T.nodeType == Node.TEXT_NODE && y.nodeType == Node.TEXT_NODE) {
                e(l).remove(), e(f).remove();
                var N = T.textContent.length;
                T.textContent = T.textContent + y.textContent, e(y).remove(), t.spaces.normalize(T), c.setStart(T, N), c.setEnd(T, N), g = !0
              } else !T && y && y.nodeType == Node.TEXT_NODE ? (e(l).remove(), e(f).remove(), t.spaces.normalize(y), p = e(t.doc.createTextNode("​")), e(y).before(p), c.setStart(y, 0), c.setEnd(y, 0), g = !0) : !y && T && T.nodeType == Node.TEXT_NODE && (e(l).remove(), e(f).remove(), t.spaces.normalize(T), p = e(t.doc.createTextNode("​")), e(T).after(p), c.setStart(T, T.textContent.length), c.setEnd(T, T.textContent.length), g = !0)
            }
            if (!g)(t.browser.chrome || t.browser.edge) && l.nextSibling == f ? (m = d(f, c, !0) || c.setStartAfter(f), v = d(l, c, !1) || c.setEndBefore(l)) : (l.previousSibling == f && (f = (l = f).nextSibling), f.nextSibling && "BR" === f.nextSibling.tagName || !f.nextSibling && t.node.isBlock(l.previousSibling) || l.previousSibling && "BR" == l.previousSibling.tagName || (l.style.display = "inline", f.style.display = "inline", p = e(t.doc.createTextNode("​"))), m = d(l, c, !0) || e(l).before(p) && c.setStartBefore(l), v = d(f, c, !1) || e(f).after(p) && c.setEndAfter(f)), "function" == typeof m && m(), "function" == typeof v && v()
          } catch (e) { console.warn("RESTORE RANGE", e) }
        }
        p && p.remove();
        try { a.addRange(c) } catch (e) { console.warn("ADD RANGE", e) }
      }
      t.markers.remove()
    }

    function d(n, r, o) {
      var i, a = n.previousSibling,
        s = n.nextSibling;
      return a && s && a.nodeType == Node.TEXT_NODE && s.nodeType == Node.TEXT_NODE ? (i = a.textContent.length, o ? (s.textContent = a.textContent + s.textContent, e(a).remove(), e(n).remove(), t.spaces.normalize(s), function() { r.setStart(s, i) }) : (a.textContent = a.textContent + s.textContent, e(s).remove(), e(n).remove(), t.spaces.normalize(a), function() { r.setEnd(a, i) })) : a && !s && a.nodeType == Node.TEXT_NODE ? (i = a.textContent.length, o ? (t.spaces.normalize(a), function() { r.setStart(a, i) }) : (t.spaces.normalize(a), function() { r.setEnd(a, i) })) : !(!s || a || s.nodeType != Node.TEXT_NODE) && (o ? (t.spaces.normalize(s), function() { r.setStart(s, 0) }) : (t.spaces.normalize(s), function() { r.setEnd(s, 0) }))
    }

    function c() {
      for (var e = o(), t = 0; t < e.length; t++)
        if (!e[t].collapsed) return !1;
      return !0
    }

    function f(e) {
      var n, r, o = !1,
        i = !1;
      if (t.win.getSelection) {
        var a = t.win.getSelection();
        a.rangeCount && ((r = (n = a.getRangeAt(0)).cloneRange()).selectNodeContents(e), r.setEnd(n.startContainer, n.startOffset), o = "" === r.toString(), r.selectNodeContents(e), r.setStart(n.endContainer, n.endOffset), i = "" === r.toString())
      } else t.doc.selection && "Control" != t.doc.selection.type && ((r = (n = t.doc.selection.createRange()).duplicate()).moveToElementText(e), r.setEndPoint("EndToStart", n), o = "" === r.text, r.moveToElementText(e), r.setEndPoint("StartToEnd", n), i = "" === r.text);
      return { atStart: o, atEnd: i }
    }

    function p(n, r) {
      void 0 === r && (r = !0);
      var o = e(n).html();
      o && o.replace(/\u200b/g, "").length != o.length && e(n).html(o.replace(/\u200b/g, ""));
      for (var i = t.node.contents(n), a = 0; a < i.length; a++) i[a].nodeType != Node.ELEMENT_NODE ? e(i[a]).remove() : (p(i[a], 0 === a), 0 === a && (r = !1));
      n.nodeType == Node.TEXT_NODE ? e(n).replaceWith('<span data-first="true" data-text="true"></span>') : r && e(n).attr("data-first", !0)
    }

    function u() { return 0 === e(this).find("fr-inner").length }

    function g() { try { if (!t.$wp) return !1; for (var e = o(0).commonAncestorContainer; e && !t.node.isElement(e);) e = e.parentNode; return !!t.node.isElement(e) } catch (e) { return !1 } }

    function h(n, r) {
      if (!n || n.getElementsByClassName("fr-marker").length > 0) return !1;
      for (var o = n.firstChild; o && (t.node.isBlock(o) || r && !t.node.isVoid(o) && o.nodeType == Node.ELEMENT_NODE);) n = o, o = o.firstChild;
      n.innerHTML = e.FE.MARKERS + n.innerHTML
    }

    function m(n, r) {
      if (!n || n.getElementsByClassName("fr-marker").length > 0) return !1;
      for (var o = n.lastChild; o && (t.node.isBlock(o) || r && !t.node.isVoid(o) && o.nodeType == Node.ELEMENT_NODE);) n = o, o = o.lastChild;
      n.innerHTML = n.innerHTML + e.FE.MARKERS
    }
    return {
      text: n,
      get: r,
      ranges: o,
      clear: i,
      element: function() {
        var i = r();
        try {
          if (i.rangeCount) {
            var a, s = o(0),
              l = s.startContainer;
            if (l.nodeType == Node.TEXT_NODE && s.startOffset == (l.textContent || "").length && l.nextSibling && (l = l.nextSibling), l.nodeType == Node.ELEMENT_NODE) {
              var d = !1;
              if (l.childNodes.length > 0 && l.childNodes[s.startOffset]) {
                for (a = l.childNodes[s.startOffset]; a && a.nodeType == Node.TEXT_NODE && 0 === a.textContent.length;) a = a.nextSibling;
                if (a && a.textContent.replace(/\u200B/g, "") === n().replace(/\u200B/g, "") && (l = a, d = !0), !d && l.childNodes.length > 1 && s.startOffset > 0 && l.childNodes[s.startOffset - 1]) {
                  for (a = l.childNodes[s.startOffset - 1]; a && a.nodeType == Node.TEXT_NODE && 0 === a.textContent.length;) a = a.nextSibling;
                  a && a.textContent.replace(/\u200B/g, "") === n().replace(/\u200B/g, "") && (l = a, d = !0)
                }
              } else !s.collapsed && l.nextSibling && l.nextSibling.nodeType == Node.ELEMENT_NODE && (a = l.nextSibling) && a.textContent.replace(/\u200B/g, "") === n().replace(/\u200B/g, "") && (l = a, d = !0);
              !d && l.childNodes.length > 0 && e(l.childNodes[0]).text().replace(/\u200B/g, "") === n().replace(/\u200B/g, "") && ["BR", "IMG", "HR"].indexOf(l.childNodes[0].tagName) < 0 && (l = l.childNodes[0])
            }
            for (; l.nodeType != Node.ELEMENT_NODE && l.parentNode;) l = l.parentNode;
            for (var c = l; c && "HTML" != c.tagName;) {
              if (c == t.el) return l;
              c = e(c).parent()[0]
            }
          }
        } catch (e) {}
        return t.el
      },
      endElement: function() {
        var i = r();
        try {
          if (i.rangeCount) {
            var a, s = o(0),
              l = s.endContainer;
            if (l.nodeType == Node.ELEMENT_NODE) {
              var d = !1;
              l.childNodes.length > 0 && l.childNodes[s.endOffset] && e(l.childNodes[s.endOffset]).text() === n() ? (l = l.childNodes[s.endOffset], d = !0) : !s.collapsed && l.previousSibling && l.previousSibling.nodeType == Node.ELEMENT_NODE ? (a = l.previousSibling) && a.textContent.replace(/\u200B/g, "") === n().replace(/\u200B/g, "") && (l = a, d = !0) : !s.collapsed && l.childNodes.length > 0 && l.childNodes[s.endOffset] && (a = l.childNodes[s.endOffset].previousSibling).nodeType == Node.ELEMENT_NODE && a && a.textContent.replace(/\u200B/g, "") === n().replace(/\u200B/g, "") && (l = a, d = !0), !d && l.childNodes.length > 0 && e(l.childNodes[l.childNodes.length - 1]).text() === n() && ["BR", "IMG", "HR"].indexOf(l.childNodes[l.childNodes.length - 1].tagName) < 0 && (l = l.childNodes[l.childNodes.length - 1])
            }
            for (l.nodeType == Node.TEXT_NODE && 0 === s.endOffset && l.previousSibling && l.previousSibling.nodeType == Node.ELEMENT_NODE && (l = l.previousSibling); l.nodeType != Node.ELEMENT_NODE && l.parentNode;) l = l.parentNode;
            for (var c = l; c && "HTML" != c.tagName;) {
              if (c == t.el) return l;
              c = e(c).parent()[0]
            }
          }
        } catch (e) {}
        return t.el
      },
      save: s,
      restore: l,
      isCollapsed: c,
      isFull: function() {
        if (c()) return !1;
        t.$el.find("td, th, img, br:not(:last)").prepend('<span class="fr-mk">' + e.FE.INVISIBLE_SPACE + "</span>");
        var n = !1,
          r = f(t.el);
        return r.atStart && r.atEnd && (n = !0), t.$el.find(".fr-mk").remove(), n
      },
      inEditor: g,
      remove: function() {
        if (c()) return !0;
        var n;
        s();
        var r = function(t) {
            for (var n = t.previousSibling; n && n.nodeType == Node.TEXT_NODE && 0 === n.textContent.length;) {
              var r = n;
              n = n.previousSibling, e(r).remove()
            }
            return n
          },
          o = function(t) {
            for (var n = t.nextSibling; n && n.nodeType == Node.TEXT_NODE && 0 === n.textContent.length;) {
              var r = n;
              n = n.nextSibling, e(r).remove()
            }
            return n
          },
          i = t.$el.find('.fr-marker[data-type="true"]');
        for (n = 0; n < i.length; n++)
          for (var a = i[n]; !r(a) && !t.node.isBlock(a.parentNode) && !t.$el.is(a.parentNode);) e(a.parentNode).before(a);
        var d = t.$el.find('.fr-marker[data-type="false"]');
        for (n = 0; n < d.length; n++) {
          for (var f = d[n]; !o(f) && !t.node.isBlock(f.parentNode) && !t.$el.is(f.parentNode);) e(f.parentNode).after(f);
          f.parentNode && t.node.isBlock(f.parentNode) && t.node.isEmpty(f.parentNode) && !t.$el.is(f.parentNode) && t.opts.keepFormatOnDelete && e(f.parentNode).after(f)
        }! function n(r, o) {
          var i = t.node.contents(r.get(0));
          ["TD", "TH"].indexOf(r.get(0).tagName) >= 0 && 1 == r.find(".fr-marker").length && t.node.hasClass(i[0], "fr-marker") && r.attr("data-del-cell", !0);
          for (var a = 0; a < i.length; a++) {
            var s = i[a];
            t.node.hasClass(s, "fr-marker") ? o = (o + 1) % 2 : o ? e(s).find(".fr-marker").length > 0 ? o = n(e(s), o) : ["TD", "TH"].indexOf(s.tagName) < 0 && !t.node.hasClass(s, "fr-inner") ? !t.opts.keepFormatOnDelete || t.$el.find("[data-first]").length > 0 ? e(s).remove() : p(s) : t.node.hasClass(s, "fr-inner") ? 0 === e(s).find(".fr-inner").length ? e(s).html("<br>") : e(s).find(".fr-inner").filter(u).html("<br>") : (e(s).empty(), e(s).attr("data-del-cell", !0)) : e(s).find(".fr-marker").length > 0 && (o = n(e(s), o))
          }
          return o
        }(t.$el, 0);
        var g = t.$el.find('[data-first="true"]');
        if (g.length) t.$el.find(".fr-marker").remove(), g.append(e.FE.INVISIBLE_SPACE + e.FE.MARKERS).removeAttr("data-first"), g.attr("data-text") && g.replaceWith(g.html());
        else
          for (t.$el.find("table").filter(function() { return e(this).find("[data-del-cell]").length > 0 && e(this).find("[data-del-cell]").length == e(this).find("td, th").length }).remove(), t.$el.find("[data-del-cell]").removeAttr("data-del-cell"), i = t.$el.find('.fr-marker[data-type="true"]'), n = 0; n < i.length; n++) {
            var h = i[n],
              m = h.nextSibling,
              v = t.$el.find('.fr-marker[data-type="false"][data-id="' + e(h).data("id") + '"]').get(0);
            if (v) {
              if (h && (!m || m != v)) {
                var E = t.node.blockParent(h),
                  b = t.node.blockParent(v),
                  S = !1,
                  T = !1;
                if (E && ["UL", "OL"].indexOf(E.tagName) >= 0 && (E = null, S = !0), b && ["UL", "OL"].indexOf(b.tagName) >= 0 && (b = null, T = !0), e(h).after(v), E != b)
                  if (null != E || S)
                    if (null != b || T || 0 !== e(E).parentsUntil(t.$el, "table").length) E && b && 0 === e(E).parentsUntil(t.$el, "table").length && 0 === e(b).parentsUntil(t.$el, "table").length && (e(E).append(e(b).html()), e(b).remove());
                    else {
                      for (m = E; !m.nextSibling && m.parentNode != t.el;) m = m.parentNode;
                      for (m = m.nextSibling; m && "BR" != m.tagName;) {
                        var y = m.nextSibling;
                        e(E).append(m), m = y
                      }
                      m && "BR" == m.tagName && e(m).remove()
                    }
                else {
                  var N = t.node.deepestParent(h);
                  N ? (e(N).after(e(b).html()), e(b).remove()) : 0 === e(b).parentsUntil(t.$el, "table").length && (e(h).next().after(e(b).html()), e(b).remove())
                }
              }
            } else v = e(h).clone().attr("data-type", !1), e(h).after(v)
          }
        t.opts.keepFormatOnDelete || t.html.fillEmptyBlocks(), t.html.cleanEmptyTags(!0), t.clean.lists(), t.spaces.normalize();
        var C = t.$el.find(".fr-marker:last").get(0),
          x = t.$el.find(".fr-marker:first").get(0);
        void 0 !== C && void 0 !== x && !C.nextSibling && x.previousSibling && "BR" == x.previousSibling.tagName && t.node.isElement(C.parentNode) && t.node.isElement(x.parentNode) && t.$el.append("<br>"), l()
      },
      blocks: function() {
        var n, i = [],
          s = r();
        if (g() && s.rangeCount) {
          var l = o();
          for (n = 0; n < l.length; n++) {
            var d, c = l[n],
              f = a(c.startContainer, c.startOffset),
              p = a(c.endContainer, c.endOffset);
            t.node.isBlock(f) && i.indexOf(f) < 0 && i.push(f), (d = t.node.blockParent(f)) && i.indexOf(d) < 0 && i.push(d);
            for (var u = [], h = f; h !== p && h !== t.el;) u.indexOf(h) < 0 && h.children && h.children.length ? (u.push(h), h = h.children[0]) : h.nextSibling ? h = h.nextSibling : h.parentNode && (h = h.parentNode, u.push(h)), t.node.isBlock(h) && u.indexOf(h) < 0 && i.indexOf(h) < 0 && (h !== p || c.endOffset > 0) && i.push(h);
            t.node.isBlock(p) && i.indexOf(p) < 0 && c.endOffset > 0 && i.push(p), (d = t.node.blockParent(p)) && i.indexOf(d) < 0 && i.push(d)
          }
        }
        for (n = i.length - 1; n > 0; n--) e(i[n]).find(i).length && ("LI" != i[n].tagName || 1 == i[n].children.length && i.indexOf(i[n].children[0]) >= 0) && i.splice(n, 1);
        return i
      },
      info: f,
      setAtEnd: m,
      setAtStart: h,
      setBefore: function(n, r) { void 0 === r && (r = !0); for (var o = n.previousSibling; o && o.nodeType == Node.TEXT_NODE && 0 === o.textContent.length;) o = o.previousSibling; return o ? (t.node.isBlock(o) ? m(o) : "BR" == o.tagName ? e(o).before(e.FE.MARKERS) : e(o).after(e.FE.MARKERS), !0) : !!r && (t.node.isBlock(n) ? h(n) : e(n).before(e.FE.MARKERS), !0) },
      setAfter: function(n, r) { void 0 === r && (r = !0); for (var o = n.nextSibling; o && o.nodeType == Node.TEXT_NODE && 0 === o.textContent.length;) o = o.nextSibling; return o ? (t.node.isBlock(o) ? h(o) : e(o).before(e.FE.MARKERS), !0) : !!r && (t.node.isBlock(n) ? m(n) : e(n).after(e.FE.MARKERS), !0) },
      rangeElement: a
    }
  }, e.extend(e.FE.DEFAULTS, { htmlAllowedTags: ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "queue", "rp", "rt", "ruby", "s", "samp", "script", "style", "section", "select", "small", "source", "span", "strike", "strong", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "u", "ul", "var", "video", "wbr"], htmlRemoveTags: ["script", "style"], htmlAllowedAttrs: ["accept", "accept-charset", "accesskey", "action", "align", "allowfullscreen", "allowtransparency", "alt", "async", "autocomplete", "autofocus", "autoplay", "autosave", "background", "bgcolor", "border", "charset", "cellpadding", "cellspacing", "checked", "cite", "class", "color", "cols", "colspan", "content", "contenteditable", "contextmenu", "controls", "coords", "data", "data-.*", "datetime", "default", "defer", "dir", "dirname", "disabled", "download", "draggable", "dropzone", "enctype", "for", "form", "formaction", "frameborder", "headers", "height", "hidden", "high", "href", "hreflang", "http-equiv", "icon", "id", "ismap", "itemprop", "keytype", "kind", "label", "lang", "language", "list", "loop", "low", "max", "maxlength", "media", "method", "min", "mozallowfullscreen", "multiple", "name", "novalidate", "open", "optimum", "pattern", "ping", "placeholder", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "reversed", "rows", "rowspan", "sandbox", "scope", "scoped", "scrolling", "seamless", "selected", "shape", "size", "sizes", "span", "src", "srcdoc", "srclang", "srcset", "start", "step", "summary", "spellcheck", "style", "tabindex", "target", "title", "type", "translate", "usemap", "value", "valign", "webkitallowfullscreen", "width", "wrap"], htmlAllowedStyleProps: [".*"], htmlAllowComments: !0, htmlUntouched: !1, fullPage: !1 }), e.FE.HTML5Map = { B: "STRONG", I: "EM", STRIKE: "S" }, e.FE.MODULES.clean = function(t) {
    var n, r, o, i;

    function a(e) {
      if (e.nodeType == Node.ELEMENT_NODE && e.getAttribute("class") && e.getAttribute("class").indexOf("fr-marker") >= 0) return !1;
      var n, r = t.node.contents(e),
        o = [];
      for (n = 0; n < r.length; n++) r[n].nodeType != Node.ELEMENT_NODE || t.node.isVoid(r[n]) ? r[n].nodeType == Node.TEXT_NODE && (r[n].textContent = r[n].textContent.replace(/\u200b/g, "")) : r[n].textContent.replace(/\u200b/g, "").length != r[n].textContent.length && a(r[n]);
      if (e.nodeType == Node.ELEMENT_NODE && !t.node.isVoid(e) && (e.normalize(), r = t.node.contents(e), o = e.querySelectorAll(".fr-marker"), r.length - o.length == 0)) {
        for (n = 0; n < r.length; n++)
          if ((r[n].getAttribute("class") || "").indexOf("fr-marker") < 0) return !1;
        for (n = 0; n < o.length; n++) e.parentNode.insertBefore(o[n].cloneNode(!0), e);
        return e.parentNode.removeChild(e), !1
      }
    }

    function s(e, n) {
      if (e.nodeType == Node.COMMENT_NODE) return "\x3c!--" + e.nodeValue + "--\x3e";
      if (e.nodeType == Node.TEXT_NODE) return n ? e.textContent.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : e.textContent.replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u00A0/g, "&nbsp;").replace(/\u0009/g, "");
      if (e.nodeType != Node.ELEMENT_NODE) return e.outerHTML;
      if (e.nodeType == Node.ELEMENT_NODE && ["STYLE", "SCRIPT", "NOSCRIPT"].indexOf(e.tagName) >= 0) return e.outerHTML;
      if (e.nodeType == Node.ELEMENT_NODE && "svg" == e.tagName) {
        var r = document.createElement("div"),
          o = e.cloneNode(!0);
        return r.appendChild(o), r.innerHTML
      }
      if ("IFRAME" == e.tagName) return e.outerHTML.replace(/\&lt;/g, "<").replace(/\&gt;/g, ">");
      var i = e.childNodes;
      if (0 === i.length) return e.outerHTML;
      for (var a = "", l = 0; l < i.length; l++) "PRE" == e.tagName && (n = !0), a += s(i[l], n);
      return t.node.openTagString(e) + a + t.node.closeTagString(e)
    }
    var l = [];

    function d(e) { var t = e.replace(/;;/gi, ";"); return ";" != (t = t.replace(/^;/gi, "")).charAt(t.length) && (t += ";"), t }

    function c(e) {
      var n;
      for (n in e)
        if (e.hasOwnProperty(n)) {
          var r = n.match(o),
            a = null;
          "style" == n && t.opts.htmlAllowedStyleProps.length && (a = e[n].match(i)), r && a ? e[n] = d(a.join(";")) : r && ("style" != n || a) || delete e[n]
        }
      for (var s = "", l = Object.keys(e).sort(), c = 0; c < l.length; c++) e[n = l[c]].indexOf('"') < 0 ? s += " " + n + '="' + e[n] + '"' : s += " " + n + "='" + e[n] + "'";
      return s
    }

    function f(n, r) {
      var o, i = e("<div>" + n + "</div>"),
        a = "";
      if (i) { var l = t.node.contents(i.get(0)); for (o = 0; o < l.length; o++) r(l[o]); for (l = t.node.contents(i.get(0)), o = 0; o < l.length; o++) a += s(l[o]) }
      return a
    }

    function p(e, n, r) {
      l = [];
      var o = e = e.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, function(e) { return l.push(e), "[FROALA.EDITOR.SCRIPT " + (l.length - 1) + "]" }).replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, function(e) { return l.push(e), "[FROALA.EDITOR.NOSCRIPT " + (l.length - 1) + "]" }).replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, function(e) { return l.push(e), "[FROALA.EDITOR.IFRAME " + (l.length - 1) + "]" }).replace(/<img((?:[\w\W]*?)) src="/g, '<img$1 data-fr-src="'),
        i = null;
      return t.opts.fullPage && (o = t.html.extractNode(e, "body") || (e.indexOf("<body") >= 0 ? "" : e), r && (i = t.html.extractNode(e, "head") || "")), o = f(o, n), i && (i = f(i, n)),
        function(e) { return e = (e = (e = (e = e.replace(/\[FROALA\.EDITOR\.SCRIPT ([\d]*)\]/gi, function(e, n) { return t.opts.htmlRemoveTags.indexOf("script") >= 0 ? "" : l[parseInt(n, 10)] })).replace(/\[FROALA\.EDITOR\.NOSCRIPT ([\d]*)\]/gi, function(e, n) { return t.opts.htmlRemoveTags.indexOf("noscript") >= 0 ? "" : l[parseInt(n, 10)].replace(/\&lt;/g, "<").replace(/\&gt;/g, ">") })).replace(/\[FROALA\.EDITOR\.IFRAME ([\d]*)\]/gi, function(e, n) { return t.opts.htmlRemoveTags.indexOf("iframe") >= 0 ? "" : l[parseInt(n, 10)].replace(/\&lt;/g, "<").replace(/\&gt;/g, ">") })).replace(/<img((?:[\w\W]*?)) data-fr-src="/g, '<img$1 src="') }(function(e, n, r) {
          if (t.opts.fullPage) {
            var o = t.html.extractDoctype(r),
              i = c(t.html.extractNodeAttrs(r, "html"));
            return n = null == n ? t.html.extractNode(r, "head") || "<title></title>" : n, o + "<html" + i + "><head" + c(t.html.extractNodeAttrs(r, "head")) + ">" + n + "</head><body" + c(t.html.extractNodeAttrs(r, "body")) + ">" + e + "</body></html>"
          }
          return e
        }(o, i, e))
    }

    function u(e) { var n = t.doc.createElement("DIV"); return n.innerHTML = e, n.textContent }

    function g(a) {
      for (var s = t.node.contents(a), l = 0; l < s.length; l++) s[l].nodeType != Node.TEXT_NODE && g(s[l]);
      ! function(a) {
        if ("SPAN" == a.tagName && (a.getAttribute("class") || "").indexOf("fr-marker") >= 0) return !1;
        var s, l;
        if ("PRE" == a.tagName && (l = (s = a).innerHTML).indexOf("\n") >= 0 && (s.innerHTML = l.replace(/\n/g, "<br>")), a.nodeType == Node.ELEMENT_NODE && (a.getAttribute("data-fr-src") && a.setAttribute("data-fr-src", t.helpers.sanitizeURL(u(a.getAttribute("data-fr-src")))), a.getAttribute("href") && a.setAttribute("href", t.helpers.sanitizeURL(u(a.getAttribute("href")))), a.getAttribute("src") && a.setAttribute("src", t.helpers.sanitizeURL(u(a.getAttribute("src")))), ["TABLE", "TBODY", "TFOOT", "TR"].indexOf(a.tagName) >= 0 && (a.innerHTML = a.innerHTML.trim())), !t.opts.pasteAllowLocalImages && a.nodeType == Node.ELEMENT_NODE && "IMG" == a.tagName && a.getAttribute("data-fr-src") && 0 === a.getAttribute("data-fr-src").indexOf("file://")) return a.parentNode.removeChild(a), !1;
        if (a.nodeType == Node.ELEMENT_NODE && e.FE.HTML5Map[a.tagName] && "" === t.node.attributes(a)) {
          var c = e.FE.HTML5Map[a.tagName],
            f = "<" + c + ">" + a.innerHTML + "</" + c + ">";
          a.insertAdjacentHTML("beforebegin", f), (a = a.previousSibling).parentNode.removeChild(a.nextSibling)
        }
        if (t.opts.htmlAllowComments || a.nodeType != Node.COMMENT_NODE)
          if (a.tagName && a.tagName.match(r)) a.parentNode.removeChild(a);
          else if (a.tagName && !a.tagName.match(n)) "svg" === a.tagName ? a.parentNode.removeChild(a) : t.browser.safari && "path" == a.tagName && a.parentNode && "svg" == a.parentNode.tagName || (a.outerHTML = a.innerHTML);
        else {
          var p = a.attributes;
          if (p)
            for (var g = p.length - 1; g >= 0; g--) {
              var h = p[g],
                m = h.nodeName.match(o),
                v = null;
              "style" == h.nodeName && t.opts.htmlAllowedStyleProps.length && (v = h.value.match(i)), m && v ? h.value = d(v.join(";")) : m && ("style" != h.nodeName || v) || a.removeAttribute(h.nodeName)
            }
        } else 0 !== a.data.indexOf("[FROALA.EDITOR") && a.parentNode.removeChild(a)
      }(a)
    }
    return {
      _init: function() { t.opts.fullPage && e.merge(t.opts.htmlAllowedTags, ["head", "title", "style", "link", "base", "body", "html", "meta"]) },
      html: function(a, s, l, d) { void 0 === s && (s = []), void 0 === l && (l = []), void 0 === d && (d = !1), a = a.replace(/<br> */g, "<br>"); var c, f = e.merge([], t.opts.htmlAllowedTags); for (c = 0; c < s.length; c++) f.indexOf(s[c]) >= 0 && f.splice(f.indexOf(s[c]), 1); var u = e.merge([], t.opts.htmlAllowedAttrs); for (c = 0; c < l.length; c++) u.indexOf(l[c]) >= 0 && u.splice(u.indexOf(l[c]), 1); return u.push("data-fr-.*"), u.push("fr-.*"), n = new RegExp("^" + f.join("$|^") + "$", "gi"), o = new RegExp("^" + u.join("$|^") + "$", "gi"), r = new RegExp("^" + t.opts.htmlRemoveTags.join("$|^") + "$", "gi"), i = t.opts.htmlAllowedStyleProps.length ? new RegExp("((^|;|\\s)" + t.opts.htmlAllowedStyleProps.join(":.+?(?=;|$))|((^|;|\\s)") + ":.+?(?=(;)|$))", "gi") : null, a = p(a, g, !0) },
      toHTML5: function() {
        var n = t.el.querySelectorAll(Object.keys(e.FE.HTML5Map).join(","));
        if (n.length) {
          var r = !1;
          t.el.querySelector(".fr-marker") || (t.selection.save(), r = !0);
          for (var o = 0; o < n.length; o++) "" === t.node.attributes(n[o]) && e(n[o]).replaceWith("<" + e.FE.HTML5Map[n[o].tagName] + ">" + n[o].innerHTML + "</" + e.FE.HTML5Map[n[o].tagName] + ">");
          r && t.selection.restore()
        }
      },
      tables: function() {
        ! function() {
          for (var e = t.el.querySelectorAll("tr"), n = 0; n < e.length; n++) {
            for (var r = e[n].children, o = !0, i = 0; i < r.length; i++)
              if ("TH" != r[i].tagName) { o = !1; break }
            if (!1 !== o && 0 !== r.length) { for (var a = e[n]; a && "TABLE" != a.tagName && "THEAD" != a.tagName;) a = a.parentNode; var s = a; "THEAD" != s.tagName && (s = t.doc.createElement("THEAD"), a.insertBefore(s, a.firstChild)), s.appendChild(e[n]) }
          }
        }(),
        function() {
          var n = t.html.defaultTag();
          if (n)
            for (var r = t.el.querySelectorAll("td > " + n + ", th > " + n), o = 0; o < r.length; o++) "" === t.node.attributes(r[o]) && e(r[o]).replaceWith(r[o].innerHTML + "<br>")
        }()
      },
      lists: function() {
        ! function() {
          var e = [],
            n = function(e) { return !t.node.isList(e.parentNode) };
          do {
            if (e.length) {
              var r = e[0],
                o = t.doc.createElement("ul");
              r.parentNode.insertBefore(o, r);
              do {
                var i = r;
                r = r.nextSibling, o.appendChild(i)
              } while (r && "LI" == r.tagName)
            }
            e = [];
            for (var a = t.el.querySelectorAll("li"), s = 0; s < a.length; s++) n(a[s]) && e.push(a[s])
          } while (e.length > 0)
        }(),
        function() {
          for (var e = t.el.querySelectorAll("ol + ol, ul + ul"), n = 0; n < e.length; n++) {
            var r = e[n];
            if (t.node.isList(r.previousSibling) && t.node.openTagString(r) == t.node.openTagString(r.previousSibling)) {
              for (var o = t.node.contents(r), i = 0; i < o.length; i++) r.previousSibling.appendChild(o[i]);
              r.parentNode.removeChild(r)
            }
          }
        }(),
        function() {
          var e, n, r;
          do { n = !1; var o = t.el.querySelectorAll("li:empty"); for (e = 0; e < o.length; e++) o[e].parentNode.removeChild(o[e]); var i = t.el.querySelectorAll("ul, ol"); for (e = 0; e < i.length; e++)(r = i[e]).querySelector("LI") || (n = !0, r.parentNode.removeChild(r)) } while (!0 === n)
        }(),
        function() {
          for (var n = t.el.querySelectorAll("ul > ul, ol > ol, ul > ol, ol > ul"), r = 0; r < n.length; r++) {
            var o = n[r],
              i = o.previousSibling;
            i && ("LI" == i.tagName ? i.appendChild(o) : e(o).wrap("<li></li>"))
          }
        }(),
        function() {
          for (var n = t.el.querySelectorAll("li > ul, li > ol"), r = 0; r < n.length; r++) {
            var o = n[r];
            if (o.nextSibling) {
              var i = o.nextSibling,
                a = e("<li>");
              e(o.parentNode).after(a);
              do {
                var s = i;
                i = i.nextSibling, a.append(s)
              } while (i)
            }
          }
        }(),
        function() {
          for (var n = t.el.querySelectorAll("li > ul, li > ol"), r = 0; r < n.length; r++) {
            var o = n[r];
            if (t.node.isFirstSibling(o)) e(o).before("<br/>");
            else if (o.previousSibling && "BR" == o.previousSibling.tagName) {
              for (var i = o.previousSibling.previousSibling; i && t.node.hasClass(i, "fr-marker");) i = i.previousSibling;
              i && "BR" != i.tagName && e(o.previousSibling).remove()
            }
          }
        }(),
        function() {
          for (var n = t.el.querySelectorAll("ul, ol"), r = 0; r < n.length; r++)
            for (var o = t.node.contents(n[r]), i = null, a = o.length - 1; a >= 0; a--) "LI" != o[a].tagName ? (i || (i = e("<li>")).insertBefore(o[a]), i.prepend(o[a])) : i = null
        }(),
        function() { for (var n = t.el.querySelectorAll("li:empty"), r = 0; r < n.length; r++) e(n[r]).remove() }(),
        function() {
          if (t.html.defaultTag())
            for (var n = t.el.querySelectorAll("li > " + t.html.defaultTag()), r = n.length - 1; r >= 0; r--) {
              var o = n[r];
              o.previousSibling && !t.node.isEmpty(o) && e("<br>").insertAfter(o.previousSibling), o.outerHTML = o.innerHTML
            }
        }()
      },
      quotes: function() {
        for (var n = t.el.querySelectorAll("blockquote + blockquote"), r = 0; r < n.length; r++) {
          var o = n[r];
          t.node.attributes(o) == t.node.attributes(o.previousSibling) && (e(o).prev().append(e(o).html()), e(o).remove())
        }
      },
      invisibleSpaces: function(e) { return e.replace(/\u200b/g, "").length == e.length ? e : t.clean.exec(e, a) },
      exec: p
    }
  }, e.FE.MODULES.spaces = function(t) {
    function n(n, r) {
      var o = n.previousSibling,
        i = n.nextSibling,
        a = n.textContent,
        s = n.parentNode;
      if (!t.html.isPreformatted(s)) {
        r && (a = a.replace(/[\f\n\r\t\v ]{2,}/g, " "), i && "BR" !== i.tagName && !t.node.isBlock(i) || !t.node.isBlock(s) && !t.node.isLink(s) || (a = a.replace(/[\f\n\r\t\v ]{1,}$/g, "")), o && "BR" !== o.tagName && !t.node.isBlock(o) || !t.node.isBlock(s) && !t.node.isLink(s) || (a = a.replace(/^[\f\n\r\t\v ]{1,}/g, "")), " " === a && (o && o.nodeType != Node.TEXT_NODE || i && i.nodeType != Node.TEXT_NODE) && (a = "")), a = a.replace(new RegExp(e.FE.UNICODE_NBSP, "g"), " ");
        for (var l = "", d = 0; d < a.length; d++) 32 != a.charCodeAt(d) || 0 !== d && 32 != l.charCodeAt(d - 1) ? l += a[d] : l += e.FE.UNICODE_NBSP;
        (!i && t.node.isBlock(n.parentNode) || i && t.node.isBlock(i) || i && i.nodeType == Node.ELEMENT_NODE && t.win.getComputedStyle(i) && "block" == t.win.getComputedStyle(i).display) && (l = l.replace(/ $/, e.FE.UNICODE_NBSP)), !o || t.node.isVoid(o) || t.node.isBlock(o) || 1 !== (l = l.replace(/^\u00A0([^ $])/, " $1")).length || 160 !== l.charCodeAt(0) || !i || t.node.isVoid(i) || t.node.isBlock(i) || (l = " "), l = l.replace(/([^ \u00A0])\u00A0([^ \u00A0])/g, "$1 $2"), n.textContent != l && (n.textContent = l)
      }
    }

    function r(e, r) {
      if (void 0 !== e && e || (e = t.el), void 0 === r && (r = !1), !e.getAttribute || "false" != e.getAttribute("contenteditable"))
        if (e.nodeType == Node.TEXT_NODE) n(e, r);
        else if (e.nodeType == Node.ELEMENT_NODE)
        for (var o = t.doc.createTreeWalker(e, NodeFilter.SHOW_TEXT, t.node.filter(function(e) {
            for (var n = e.parentNode; n && n !== t.el;) {
              if ("STYLE" == n.tagName || "IFRAME" == n.tagName) return !1;
              if ("PRE" === n.tagName) return !1;
              n = n.parentNode
            }
            return null != e.textContent.match(/([ \u00A0\f\n\r\t\v]{2,})|(^[ \u00A0\f\n\r\t\v]{1,})|([ \u00A0\f\n\r\t\v]{1,}$)/g) && !t.node.hasClass(e.parentNode, "fr-marker")
          }), !1); o.nextNode();) n(o.currentNode, r)
    }
    return {
      normalize: r,
      normalizeAroundCursor: function() {
        for (var e = [], n = t.el.querySelectorAll(".fr-marker"), o = 0; o < n.length; o++) {
          for (var i = null, a = t.node.blockParent(n[o]), s = (i = a || n[o]).nextSibling, l = i.previousSibling; s && "BR" == s.tagName;) s = s.nextSibling;
          for (; l && "BR" == l.tagName;) l = l.previousSibling;
          i && e.indexOf(i) < 0 && e.push(i), l && e.indexOf(l) < 0 && e.push(l), s && e.indexOf(s) < 0 && e.push(s)
        }
        for (var d = 0; d < e.length; d++) r(e[d])
      }
    }
  }, e.FE.UNICODE_NBSP = String.fromCharCode(160), e.FE.VOID_ELEMENTS = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"], e.FE.BLOCK_TAGS = ["address", "article", "aside", "audio", "blockquote", "canvas", "dd", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "li", "main", "nav", "noscript", "ol", "output", "p", "pre", "section", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul", "video"], e.extend(e.FE.DEFAULTS, { htmlAllowedEmptyTags: ["textarea", "a", "iframe", "object", "video", "style", "script", ".fa", ".fr-emoticon"], htmlDoNotWrapTags: ["script", "style"], htmlSimpleAmpersand: !1, htmlIgnoreCSSProperties: [], htmlExecuteScripts: !0 }), e.FE.MODULES.html = function(t) {
    function n() { return t.opts.enter == e.FE.ENTER_P ? "p" : t.opts.enter == e.FE.ENTER_DIV ? "div" : t.opts.enter == e.FE.ENTER_BR ? null : void 0 }

    function r(e) { return -1 != ["PRE", "SCRIPT"].indexOf(e.tagName) }

    function o(n) {
      var r, o = [],
        a = [];
      if (n) {
        var s = t.el.querySelectorAll(".fr-marker");
        for (r = 0; r < s.length; r++) {
          var l = t.node.blockParent(s[r]) || s[r];
          if (l) {
            var d = l.nextSibling,
              c = l.previousSibling;
            l && a.indexOf(l) < 0 && t.node.isBlock(l) && a.push(l), c && t.node.isBlock(c) && a.indexOf(c) < 0 && a.push(c), d && t.node.isBlock(d) && a.indexOf(d) < 0 && a.push(d)
          }
        }
      } else a = t.el.querySelectorAll(i());
      var f = i();
      for (f += "," + e.FE.VOID_ELEMENTS.join(","), f += "," + t.opts.htmlAllowedEmptyTags.join(":not(.fr-marker),") + ":not(.fr-marker)", r = a.length - 1; r >= 0; r--)
        if (!(a[r].textContent && a[r].textContent.replace(/\u200B|\n/g, "").length > 0 || a[r].querySelectorAll(f).length > 0)) {
          for (var p = t.node.contents(a[r]), u = !1, g = 0; g < p.length; g++)
            if (p[g].nodeType != Node.COMMENT_NODE && p[g].textContent && p[g].textContent.replace(/\u200B|\n/g, "").length > 0) { u = !0; break }
          u || o.push(a[r])
        }
      return o
    }

    function i() { return e.FE.BLOCK_TAGS.join(", ") }

    function a(n) {
      var r, o, i = e.merge([], e.FE.VOID_ELEMENTS);
      i = e.merge(i, t.opts.htmlAllowedEmptyTags), void 0 === n && (i = e.merge(i, e.FE.BLOCK_TAGS)), r = t.el.querySelectorAll("*:empty:not(" + i.join("):not(") + "):not(.fr-marker)");
      do {
        o = !1;
        for (var a = 0; a < r.length; a++) 0 !== r[a].attributes.length && void 0 === r[a].getAttribute("href") || (r[a].parentNode.removeChild(r[a]), o = !0);
        r = t.el.querySelectorAll("*:empty:not(" + i.join("):not(") + "):not(.fr-marker)")
      } while (r.length && o)
    }

    function s(e, r) {
      var o = n();
      if (r && (o = "div"), o) {
        for (var i = t.doc.createDocumentFragment(), a = null, s = !1, l = e.firstChild; l;) {
          var d = l.nextSibling;
          if (l.nodeType == Node.ELEMENT_NODE && (t.node.isBlock(l) || t.opts.htmlDoNotWrapTags.indexOf(l.tagName.toLowerCase()) >= 0 && !t.node.hasClass(l, "fr-marker"))) a = null, i.appendChild(l);
          else if (l.nodeType != Node.ELEMENT_NODE && l.nodeType != Node.TEXT_NODE) a = null, i.appendChild(l);
          else if ("BR" == l.tagName) null == a ? (a = t.doc.createElement(o), r && a.setAttribute("class", "fr-temp-div"), a.setAttribute("data-empty", !0), a.appendChild(l), i.appendChild(a)) : !1 === s && (a.appendChild(t.doc.createElement("br")), r && a.setAttribute("class", "fr-temp-div"), a.setAttribute("data-empty", !0)), a = null;
          else {
            var c = l.textContent;
            l.nodeType == Node.TEXT_NODE && 0 === c.replace(/\n/g, "").replace(/(^ *)|( *$)/g, "").length || (null == a && (a = t.doc.createElement(o), r && a.setAttribute("class", "fr-temp-div"), i.appendChild(a), s = !1), a.appendChild(l), s || t.node.hasClass(l, "fr-marker") || l.nodeType == Node.TEXT_NODE && 0 === c.replace(/ /g, "").length || (s = !0))
          }
          l = d
        }
        e.innerHTML = "", e.appendChild(i)
      }
    }

    function l(e, t) { for (var n = 0; n < e.length; n++) s(e[n], t) }

    function d(e, n, r, o) {
      if (!t.$wp) return !1;
      void 0 === e && (e = !1), void 0 === n && (n = !1), void 0 === r && (r = !1), void 0 === o && (o = !1);
      var i = t.$wp.scrollTop();
      s(t.el, e), o && l(t.el.querySelectorAll(".fr-inner"), e), n && l(t.el.querySelectorAll("td, th"), e), r && l(t.el.querySelectorAll("blockquote"), e), i != t.$wp.scrollTop() && t.$wp.scrollTop(i)
    }

    function c(e) {
      if (void 0 === e && (e = t.el), e && ["SCRIPT", "STYLE", "PRE"].indexOf(e.tagName) >= 0) return !1;
      for (var n = t.doc.createTreeWalker(e, NodeFilter.SHOW_TEXT, t.node.filter(function(e) { return null != e.textContent.match(/([ \n]{2,})|(^[ \n]{1,})|([ \n]{1,}$)/g) }), !1); n.nextNode();) {
        var o = n.currentNode;
        if (!r(o.parentNode)) {
          var i = t.node.isBlock(o.parentNode) || t.node.isElement(o.parentNode),
            a = o.textContent.replace(/(?!^)( ){2,}(?!$)/g, " ").replace(/\n/g, " ").replace(/^[ ]{2,}/g, " ").replace(/[ ]{2,}$/g, " ");
          if (i) {
            var s = o.previousSibling,
              l = o.nextSibling;
            s && l && " " == a ? a = t.node.isBlock(s) && t.node.isBlock(l) ? "" : "\n" : (s || (a = a.replace(/^ */, "")), l || (a = a.replace(/ *$/, "")))
          }
          o.textContent = a
        }
      }
    }

    function f(e, t, n) { var r = new RegExp(t, "gi").exec(e); return r ? r[n] : null }

    function p(e) {
      var t = e.doctype,
        n = "<!DOCTYPE html>";
      return t && (n = "<!DOCTYPE " + t.name + (t.publicId ? ' PUBLIC "' + t.publicId + '"' : "") + (!t.publicId && t.systemId ? " SYSTEM" : "") + (t.systemId ? ' "' + t.systemId + '"' : "") + ">"), n
    }

    function u(n, r) {
      var o = n.parentNode;
      if (o && (t.node.isBlock(o) || t.node.isElement(o)) && ["TD", "TH"].indexOf(o.tagName) < 0) {
        for (var i = n.previousSibling, a = n.nextSibling; i && i.nodeType == Node.TEXT_NODE && 0 === i.textContent.replace(/\n|\r/g, "").length;) i = i.previousSibling;
        i && o && "BR" != i.tagName && !t.node.isBlock(i) && !a && o.textContent.replace(/\u200B/g, "").length > 0 && i.textContent.length > 0 && !t.node.hasClass(i, "fr-marker") && (t.el == o && !a && t.opts.enter == e.FE.ENTER_BR && t.browser.msie || (r && t.selection.save(), n.parentNode.removeChild(n), r && t.selection.restore()))
      } else !o || t.node.isBlock(o) || t.node.isElement(o) || n.previousSibling || n.nextSibling || u(n.parentNode, r)
    }

    function g() { t.opts.htmlUntouched || (a(), d()), c(), t.opts.htmlUntouched || (t.spaces.normalize(null, !0), t.html.fillEmptyBlocks(), t.clean.quotes(), t.clean.lists(), t.clean.tables(), t.clean.toHTML5(), t.html.cleanBRs()), t.selection.restore(), h(), t.placeholder.refresh() }

    function h() { t.core.isEmpty() && (null != n() ? t.el.querySelector(i()) || t.el.querySelector(t.opts.htmlDoNotWrapTags.join(":not(.fr-marker),") + ":not(.fr-marker)") || (t.core.hasFocus() ? (t.$el.html("<" + n() + ">" + e.FE.MARKERS + "<br/></" + n() + ">"), t.selection.restore()) : t.$el.html("<" + n() + "><br/></" + n() + ">")) : t.el.querySelector("*:not(.fr-marker):not(br)") || (t.core.hasFocus() ? (t.$el.html(e.FE.MARKERS + "<br/>"), t.selection.restore()) : t.$el.html("<br/>"))) }

    function m(e, t) { return f(e, "<" + t + "[^>]*?>([\\w\\W]*)</" + t + ">", 1) }

    function v(n, r) { var o = e("<div " + (f(n, "<" + r + "([^>]*?)>", 1) || "") + ">"); return t.node.rawAttributes(o.get(0)) }

    function E(e) { return f(e, "<!DOCTYPE([^>]*?)>", 0) || "<!DOCTYPE html>" }

    function b(e, n) { t.opts.htmlExecuteScripts ? e.html(n) : e.get(0).innerHTML = n }

    function S(e) {
      var t;
      (t = /:not\(([^\)]*)\)/g).test(e) && (e = e.replace(t, "     $1 "));
      var n = 100 * (e.match(/(#[^\s\+>~\.\[:]+)/g) || []).length + 10 * (e.match(/(\[[^\]]+\])/g) || []).length + 10 * (e.match(/(\.[^\s\+>~\.\[:]+)/g) || []).length + 10 * (e.match(/(:[\w-]+\([^\)]*\))/gi) || []).length + 10 * (e.match(/(:[^\s\+>~\.\[:]+)/g) || []).length + (e.match(/(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi) || []).length;
      return n += ((e = (e = e.replace(/[\*\s\+>~]/g, " ")).replace(/[#\.]/g, " ")).match(/([^\s\+>~\.\[:]+)/g) || []).length
    }

    function T(e) {
      if (t.events.trigger("html.processGet", [e]), e && e.getAttribute && "" === e.getAttribute("class") && e.removeAttribute("class"), e && e.nodeType == Node.ELEMENT_NODE)
        for (var n = e.querySelectorAll('[class=""]'), r = 0; r < n.length; r++) n[r].removeAttribute("class")
    }

    function y(e, t) { return e[3] - t[3] }

    function N(n) {
      var r = null;
      if (void 0 === n && (r = t.selection.element()), t.opts.keepFormatOnDelete) return !1;
      var o, i, a = r ? (r.textContent.match(/\u200B/g) || []).length - r.querySelectorAll(".fr-marker").length : 0;
      if ((t.el.textContent.match(/\u200B/g) || []).length - t.el.querySelectorAll(".fr-marker").length == a) return !1;
      do {
        i = !1, o = t.el.querySelectorAll("*:not(.fr-marker)");
        for (var s = 0; s < o.length; s++) {
          var l = o[s];
          if (r != l) {
            var d = l.textContent;
            0 === l.children.length && 1 === d.length && 8203 == d.charCodeAt(0) && (e(l).remove(), i = !0)
          }
        }
      } while (i)
    }
    return {
      defaultTag: n,
      isPreformatted: r,
      emptyBlocks: o,
      emptyBlockTagsQuery: function() { return e.FE.BLOCK_TAGS.join(":empty, ") + ":empty" },
      blockTagsQuery: i,
      fillEmptyBlocks: function(n) {
        for (var r = o(n), i = 0; i < r.length; i++) { var a = r[i]; "false" === a.getAttribute("contenteditable") || a.querySelector(t.opts.htmlAllowedEmptyTags.join(":not(.fr-marker),") + ":not(.fr-marker)") || t.node.isVoid(a) || "TABLE" != a.tagName && "TBODY" != a.tagName && "TR" != a.tagName && a.appendChild(t.doc.createElement("br")) }
        if (t.browser.msie && t.opts.enter == e.FE.ENTER_BR) {
          var s = t.node.contents(t.el);
          s.length && s[s.length - 1].nodeType == Node.TEXT_NODE && t.$el.append("<br>")
        }
      },
      cleanEmptyTags: a,
      cleanWhiteTags: N,
      cleanBlankSpaces: c,
      blocks: function() { return t.$el.get(0).querySelectorAll(i()) },
      getDoctype: p,
      set: function(n) {
        var r, o, i, a = t.clean.html(n || "", [], [], t.opts.fullPage);
        if (t.opts.fullPage) {
          var s = m(a, "body") || (a.indexOf("<body") >= 0 ? "" : a),
            l = v(a, "body"),
            d = m(a, "head") || "<title></title>",
            c = v(a, "head"),
            f = e("<div>").append(d).contents().each(function() {
              (this.nodeType == Node.COMMENT_NODE || ["BASE", "LINK", "META", "NOSCRIPT", "SCRIPT", "STYLE", "TEMPLATE", "TITLE"].indexOf(this.tagName) >= 0) && this.parentNode.removeChild(this)
            }).end().html().trim();
          d = e("<div>").append(d).contents().map(function() { return this.nodeType == Node.COMMENT_NODE ? "\x3c!--" + this.nodeValue + "--\x3e" : ["BASE", "LINK", "META", "NOSCRIPT", "SCRIPT", "STYLE", "TEMPLATE", "TITLE"].indexOf(this.tagName) >= 0 ? this.outerHTML : "" }).toArray().join("");
          var p = E(a),
            u = v(a, "html");
          b(t.$el, f + "\n" + s), t.node.clearAttributes(t.el), t.$el.attr(l), t.$el.addClass("fr-view"), t.$el.attr("spellcheck", t.opts.spellcheck), t.$el.attr("dir", t.opts.direction), b(t.$head, d), t.node.clearAttributes(t.$head.get(0)), t.$head.attr(c), t.node.clearAttributes(t.$html.get(0)), t.$html.attr(u), t.iframe_document.doctype.parentNode.replaceChild((r = p, o = t.iframe_document, (i = r.match(/<!DOCTYPE ?([^ ]*) ?([^ ]*) ?"?([^"]*)"? ?"?([^"]*)"?>/i)) ? o.implementation.createDocumentType(i[1], i[3], i[4]) : o.implementation.createDocumentType("html")), t.iframe_document.doctype)
        } else b(t.$el, a);
        var h = t.edit.isDisabled();
        t.edit.on(), t.core.injectStyle(t.opts.iframeStyle), g(), t.opts.useClasses || (t.$el.find("[fr-original-class]").each(function() { this.setAttribute("class", this.getAttribute("fr-original-class")), this.removeAttribute("fr-original-class") }), t.$el.find("[fr-original-style]").each(function() { this.setAttribute("style", this.getAttribute("fr-original-style")), this.removeAttribute("fr-original-style") })), h && t.edit.off(), t.events.trigger("html.set")
      },
      get: function(e, n) {
        if (!t.$wp) return t.$oel.clone().removeClass("fr-view").removeAttr("contenteditable").get(0).outerHTML;
        var r = "";
        t.events.trigger("html.beforeGet");
        var o, i, a = [],
          s = {},
          l = [];
        if (!t.opts.useClasses && !n) {
          var d = new RegExp("^" + t.opts.htmlIgnoreCSSProperties.join("$|^") + "$", "gi");
          for (o = 0; o < t.doc.styleSheets.length; o++) {
            var c, f = 0;
            try { c = t.doc.styleSheets[o].cssRules, t.doc.styleSheets[o].ownerNode && "STYLE" == t.doc.styleSheets[o].ownerNode.nodeType && (f = 1) } catch (e) {}
            if (c)
              for (var u = 0, g = c.length; u < g; u++)
                if (c[u].selectorText && c[u].style.cssText.length > 0) {
                  var h, m = c[u].selectorText.replace(/body |\.fr-view /g, "").replace(/::/g, ":");
                  try { h = t.el.querySelectorAll(m) } catch (e) { h = [] }
                  for (i = 0; i < h.length; i++) {
                    !h[i].getAttribute("fr-original-style") && h[i].getAttribute("style") ? (h[i].setAttribute("fr-original-style", h[i].getAttribute("style")), a.push(h[i])) : h[i].getAttribute("fr-original-style") || a.push(h[i]), s[h[i]] || (s[h[i]] = {});
                    for (var v = 1e3 * f + S(c[u].selectorText), E = c[u].style.cssText.split(";"), b = 0; b < E.length; b++) {
                      var N = E[b].trim().split(":")[0];
                      N.match(d) || (s[h[i]][N] || (s[h[i]][N] = 0, (h[i].getAttribute("fr-original-style") || "").indexOf(N + ":") >= 0 && (s[h[i]][N] = 1e4)), v >= s[h[i]][N] && (s[h[i]][N] = v, E[b].trim().length && l.push([h[i], N.trim(), E[b].trim().split(":")[1].trim(), v])))
                    }
                  }
                }
          }
          for (l.sort(y), o = 0; o < l.length; o++) {
            var C = l[o];
            C[0].style[C[1]] = C[2]
          }
          for (o = 0; o < a.length; o++)
            if (a[o].getAttribute("class") && (a[o].setAttribute("fr-original-class", a[o].getAttribute("class")), a[o].removeAttribute("class")), (a[o].getAttribute("fr-original-style") || "").trim().length > 0) { var x = a[o].getAttribute("fr-original-style").split(";"); for (i = 0; i < x.length; i++) x[i].indexOf(":") > 0 && (a[o].style[x[i].split(":")[0].trim()] = x[i].split(":")[1].trim()) }
        }
        if (t.core.isEmpty() ? t.opts.fullPage && (r = p(t.iframe_document), r += "<html" + t.node.attributes(t.$html.get(0)) + ">" + t.$html.find("head").get(0).outerHTML + "<body></body></html>") : (void 0 === e && (e = !1), t.opts.fullPage ? (r = p(t.iframe_document), t.$el.removeClass("fr-view"), r += "<html" + t.node.attributes(t.$html.get(0)) + ">" + t.$html.html() + "</html>", t.$el.addClass("fr-view")) : r = t.$el.html()), !t.opts.useClasses && !n)
          for (o = 0; o < a.length; o++) a[o].getAttribute("fr-original-class") && (a[o].setAttribute("class", a[o].getAttribute("fr-original-class")), a[o].removeAttribute("fr-original-class")), a[o].getAttribute("fr-original-style") ? (a[o].setAttribute("style", a[o].getAttribute("fr-original-style")), a[o].removeAttribute("fr-original-style")) : a[o].removeAttribute("style");
        t.opts.fullPage && (r = (r = (r = (r = (r = (r = (r = (r = r.replace(/<style data-fr-style="true">(?:[\w\W]*?)<\/style>/g, "")).replace(/<link([^>]*)data-fr-style="true"([^>]*)>/g, "")).replace(/<style(?:[\w\W]*?)class="firebugResetStyles"(?:[\w\W]*?)>(?:[\w\W]*?)<\/style>/g, "")).replace(/<body((?:[\w\W]*?)) spellcheck="true"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, "<body$1$2>$3</body>")).replace(/<body((?:[\w\W]*?)) contenteditable="(true|false)"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, "<body$1$3>$4</body>")).replace(/<body((?:[\w\W]*?)) dir="([\w]*)"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, "<body$1$3>$4</body>")).replace(/<body((?:[\w\W]*?))class="([\w\W]*?)(fr-rtl|fr-ltr)([\w\W]*?)"((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, '<body$1class="$2$4"$5>$6</body>')).replace(/<body((?:[\w\W]*?)) class=""((?:[\w\W]*?))>((?:[\w\W]*?))<\/body>/g, "<body$1$2>$3</body>")), t.opts.htmlSimpleAmpersand && (r = r.replace(/\&amp;/gi, "&")), t.events.trigger("html.afterGet"), e || (r = r.replace(/<span[^>]*? class\s*=\s*["']?fr-marker["']?[^>]+>\u200b<\/span>/gi, "")), r = t.clean.invisibleSpaces(r), r = t.clean.exec(r, T);
        var $ = t.events.chainTrigger("html.get", r);
        return "string" == typeof $ && (r = $), r = r.replace(/<pre(?:[\w\W]*?)>(?:[\w\W]*?)<\/pre>/g, function(e) { return e.replace(/<br>/g, "\n") })
      },
      getSelected: function() {
        var n, r, o = function(n, r) {
            for (; r && (r.nodeType == Node.TEXT_NODE || !t.node.isBlock(r)) && !t.node.isElement(r);) r && r.nodeType != Node.TEXT_NODE && e(n).wrapInner(t.node.openTagString(r) + t.node.closeTagString(r)), r = r.parentNode;
            r && n.innerHTML == r.innerHTML && (n.innerHTML = r.outerHTML)
          },
          i = "";
        if (void 0 !== t.win.getSelection) {
          t.browser.mozilla && (t.selection.save(), t.$el.find('.fr-marker[data-type="false"]').length > 1 && (t.$el.find('.fr-marker[data-type="false"][data-id="0"]').remove(), t.$el.find('.fr-marker[data-type="false"]:last').attr("data-id", "0"), t.$el.find(".fr-marker").not('[data-id="0"]').remove()), t.selection.restore());
          for (var a = t.selection.ranges(), s = 0; s < a.length; s++) {
            var l = document.createElement("div");
            l.appendChild(a[s].cloneContents());
            var d = l.children;
            if (d.length) {
              var c = d[d.length - 1];
              ("P" == c.tagName && t.opts.enter == e.FroalaEditor.ENTER_P || "DIV" == c.tagName && t.opts.enter == e.FroalaEditor.ENTER_DIV) && t.node.isEmpty(c) && l.removeChild(c)
            }
            o(l, (n = void 0, r = void 0, r = null, t.win.getSelection ? (n = t.win.getSelection()) && n.rangeCount && (r = n.getRangeAt(0).commonAncestorContainer).nodeType != Node.ELEMENT_NODE && (r = r.parentNode) : (n = t.doc.selection) && "Control" != n.type && (r = n.createRange().parentElement()), null != r && (e.inArray(t.el, e(r).parents()) >= 0 || r == t.el) ? r : null)), e(l).find(".fr-element").length > 0 && (l = t.el), i += l.innerHTML
          }
        } else void 0 !== t.doc.selection && "Text" == t.doc.selection.type && (i = t.doc.selection.createRange().htmlText);
        return i
      },
      insert: function(n, r, o) {
        var a, s, l;
        if (t.selection.isCollapsed() || t.selection.remove(), a = (a = r ? n : t.clean.html(n)).replace(/\r|\n/g, " "), n.indexOf('class="fr-marker"') < 0 && (s = a, (l = t.doc.createElement("div")).innerHTML = s, t.selection.setAtEnd(l), a = l.innerHTML), t.core.isEmpty() && !t.opts.keepFormatOnDelete) t.el.innerHTML = a;
        else {
          var d = t.markers.insert();
          if (d) {
            t.node.isLastSibling(d) && e(d).parent().hasClass("fr-deletable") && e(d).insertAfter(e(d).parent());
            var c = t.node.blockParent(d);
            if ((function(e) { var n = t.doc.createElement("div"); return n.innerHTML = e, null !== n.querySelector(i()) }(a) || o) && (t.node.deepestParent(d) || c && "LI" == c.tagName)) {
              if (!(d = t.markers.split())) return !1;
              d.outerHTML = a
            } else d.outerHTML = a
          } else t.el.innerHTML = t.el.innerHTML + a
        }
        g(), t.events.trigger("html.inserted")
      },
      wrap: d,
      unwrap: function() { t.$el.find("div.fr-temp-div").each(function() { e(this).attr("data-empty") || ["LI", "TD", "TH"].indexOf(this.parentNode.tagName) >= 0 || t.node.isBlock(this.nextSibling) && !e(this.nextSibling).hasClass("fr-temp-div") ? e(this).replaceWith(e(this).html()) : e(this).replaceWith(e(this).html() + "<br>") }), t.$el.find(".fr-temp-div").removeClass("fr-temp-div").filter(function() { return "" === e(this).attr("class") }).removeAttr("class") },
      escapeEntities: function(e) { return e.replace(/</gi, "&lt;").replace(/>/gi, "&gt;").replace(/"/gi, "&quot;").replace(/'/gi, "&#39;") },
      checkIfEmpty: h,
      extractNode: m,
      extractNodeAttrs: v,
      extractDoctype: E,
      cleanBRs: function(e, n) {
        var r, o = null;
        if (e)
          for (o = function() {
              var e, n, r = t.selection.element(),
                o = [];
              if (e = t.node.isBlock(r) ? r : t.node.blockParent(r)) {
                var i = e.nextSibling,
                  a = e.previousSibling;
                e && o.indexOf(e) < 0 && o.push(e), a && t.node.isBlock(a) && o.indexOf(a) < 0 && o.push(a), i && t.node.isBlock(i) && o.indexOf(i) < 0 && o.push(i)
              }
              var s = [];
              for (n = 0; n < o.length; n++)
                for (var l = o[n].querySelectorAll("br"), d = 0; d < l.length; d++) s.indexOf(l[d]) < 0 && s.push(l[d]);
              if (r.parentNode == t.el) { var c = t.el.children; for (n = 0; n < c.length; n++) "BR" == c[n].tagName && s.indexOf(c[n]) < 0 && s.push(c[n]) }
              return s
            }(), r = 0; r < o.length; r++) u(o[r], n);
        else
          for (o = t.el.getElementsByTagName("br"), r = 0; r < o.length; r++) u(o[r], n)
      },
      _init: function() {
        if (t.$wp) {
          var e = function() { N(), t.placeholder && setTimeout(t.placeholder.refresh, 0) };
          t.events.on("mouseup", e), t.events.on("keydown", e), t.events.on("contentChanged", h)
        }
      }
    }
  }, e.extend(e.FE.DEFAULTS, { height: null, heightMax: null, heightMin: null, width: null }), e.FE.MODULES.size = function(e) {
    function t() { n(), e.opts.height && e.$el.css("minHeight", e.opts.height - e.helpers.getPX(e.$el.css("padding-top")) - e.helpers.getPX(e.$el.css("padding-bottom"))), e.$iframe.height(e.$el.outerHeight(!0)) }

    function n() { e.opts.heightMin ? e.$el.css("minHeight", e.opts.heightMin) : e.$el.css("minHeight", ""), e.opts.heightMax ? (e.$wp.css("maxHeight", e.opts.heightMax), e.$wp.css("overflow", "auto")) : (e.$wp.css("maxHeight", ""), e.$wp.css("overflow", "")), e.opts.height ? (e.$wp.height(e.opts.height), e.$wp.css("overflow", "auto"), e.$el.css("minHeight", e.opts.height - e.helpers.getPX(e.$el.css("padding-top")) - e.helpers.getPX(e.$el.css("padding-bottom")))) : (e.$wp.css("height", ""), e.opts.heightMin || e.$el.css("minHeight", ""), e.opts.heightMax || e.$wp.css("overflow", "")), e.opts.width && e.$box.width(e.opts.width) }
    return {
      _init: function() {
        if (!e.$wp) return !1;
        n(), e.$iframe && (e.events.on("keyup keydown", function() { setTimeout(t, 0) }, !0), e.events.on("commands.after", t), e.events.on("html.set", t), e.events.on("init", t), e.events.on("initialized", t))
      },
      syncIframe: t,
      refresh: n
    }
  }, e.extend(e.FE.DEFAULTS, { language: null }), e.FE.LANGUAGE = {}, e.FE.MODULES.language = function(t) { var n; return { _init: function() { e.FE.LANGUAGE && (n = e.FE.LANGUAGE[t.opts.language]), n && n.direction && (t.opts.direction = n.direction) }, translate: function(e) { return n && n.translation[e] ? n.translation[e] : e } } }, e.extend(e.FE.DEFAULTS, { placeholderText: "Type something" }), e.FE.MODULES.placeholder = function(t) {
    function n() {
      t.$placeholder || (t.$placeholder = e('<span class="fr-placeholder"></span>'), t.$wp.append(t.$placeholder));
      var n = 0,
        r = 0,
        o = 0,
        i = 0,
        a = 0,
        s = 0,
        l = t.node.contents(t.el),
        d = e(t.selection.element()).css("text-align");
      if (l.length && l[0].nodeType == Node.ELEMENT_NODE) { var c = e(l[0]);!t.opts.toolbarInline && t.ready && (n = t.helpers.getPX(c.css("margin-top")), i = t.helpers.getPX(c.css("padding-top")), r = t.helpers.getPX(c.css("margin-left")), o = t.helpers.getPX(c.css("margin-right")), a = t.helpers.getPX(c.css("padding-left")), s = t.helpers.getPX(c.css("padding-right"))), t.$placeholder.css("font-size", c.css("font-size")), t.$placeholder.css("line-height", c.css("line-height")) } else t.$placeholder.css("font-size", t.$el.css("font-size")), t.$placeholder.css("line-height", t.$el.css("line-height"));
      t.$wp.addClass("show-placeholder"), t.$placeholder.css({ marginTop: Math.max(t.helpers.getPX(t.$el.css("margin-top")), n), paddingTop: Math.max(t.helpers.getPX(t.$el.css("padding-top")), i), paddingLeft: Math.max(t.helpers.getPX(t.$el.css("padding-left")), a), marginLeft: Math.max(t.helpers.getPX(t.$el.css("margin-left")), r), paddingRight: Math.max(t.helpers.getPX(t.$el.css("padding-right")), s), marginRight: Math.max(t.helpers.getPX(t.$el.css("margin-right")), o), textAlign: d }).text(t.language.translate(t.opts.placeholderText || t.$oel.attr("placeholder") || "")), t.$placeholder.html(t.$placeholder.text().replace(/\n/g, "<br>"))
    }

    function r() { t.$wp.removeClass("show-placeholder") }

    function o() {
      if (!t.$wp) return !1;
      t.core.isEmpty() ? n() : r()
    }
    return {
      _init: function() {
        if (!t.$wp) return !1;
        t.events.on("init input keydown keyup contentChanged initialized", o)
      },
      show: n,
      hide: r,
      refresh: o,
      isVisible: function() { return !t.$wp || t.node.hasClass(t.$wp.get(0), "show-placeholder") }
    }
  }, e.FE.MODULES.edit = function(e) {
    function t() {
      if (e.browser.mozilla) try { e.doc.execCommand("enableObjectResizing", !1, "false"), e.doc.execCommand("enableInlineTableEditing", !1, "false") } catch (e) {}
      if (e.browser.msie) try { e.doc.body.addEventListener("mscontrolselect", function(e) { return e.preventDefault(), !1 }) } catch (e) {}
    }
    var n = !1;

    function r() { return n }
    return { _init: function() { e.events.on("focus", function() { r() ? e.edit.off() : e.edit.on() }) }, on: function() { e.$wp ? (e.$el.attr("contenteditable", !0), e.$el.removeClass("fr-disabled").attr("aria-disabled", !1), e.$tb && e.$tb.removeClass("fr-disabled").attr("aria-disabled", !1), t()) : e.$el.is("a") && e.$el.attr("contenteditable", !0), n = !1 }, off: function() { e.$wp ? (e.$el.attr("contenteditable", !1), e.$el.addClass("fr-disabled").attr("aria-disabled", !0), e.$tb && e.$tb.addClass("fr-disabled").attr("aria-disabled", !0)) : e.$el.is("a") && e.$el.attr("contenteditable", !1), n = !0 }, disableDesign: t, isDisabled: r }
  }, e.extend(e.FE.DEFAULTS, { editorClass: null, typingTimer: 500, iframe: !1, requestWithCORS: !0, requestWithCredentials: !1, requestHeaders: {}, useClasses: !0, spellcheck: !0, iframeStyle: 'html{margin:0px;height:auto;}body{height:auto;padding:10px;background:transparent;color:#000000;position:relative;z-index: 2;-webkit-user-select:auto;margin:0px;overflow:hidden;min-height:20px;}body:after{content:"";display:block;clear:both;}', iframeStyleFiles: [], direction: "auto", zIndex: 1, tabIndex: null, disableRightClick: !1, scrollableContainer: "body", keepFormatOnDelete: !1, theme: null }), e.FE.MODULES.core = function(t) {
    function n() {
      if (t.$box.addClass("fr-box" + (t.opts.editorClass ? " " + t.opts.editorClass : "")), t.$wp.addClass("fr-wrapper"), t.opts.iframe || t.$el.addClass("fr-element fr-view"), t.opts.iframe) {
        t.$iframe.addClass("fr-iframe"), t.$el.addClass("fr-view");
        for (var e = 0; e < t.o_doc.styleSheets.length; e++) {
          var n;
          try { n = t.o_doc.styleSheets[e].cssRules } catch (e) {}
          if (n)
            for (var r = 0, o = n.length; r < o; r++) !n[r].selectorText || 0 !== n[r].selectorText.indexOf(".fr-view") && 0 !== n[r].selectorText.indexOf(".fr-element") || n[r].style.cssText.length > 0 && (0 === n[r].selectorText.indexOf(".fr-view") ? t.opts.iframeStyle += n[r].selectorText.replace(/\.fr-view/g, "body") + "{" + n[r].style.cssText + "}" : t.opts.iframeStyle += n[r].selectorText.replace(/\.fr-element/g, "body") + "{" + n[r].style.cssText + "}")
        }
      }
      "auto" != t.opts.direction && t.$box.removeClass("fr-ltr fr-rtl").addClass("fr-" + t.opts.direction), t.$el.attr("dir", t.opts.direction), t.$wp.attr("dir", t.opts.direction), t.opts.zIndex > 1 && t.$box.css("z-index", t.opts.zIndex), t.opts.theme && t.$box.addClass(t.opts.theme + "-theme"), t.opts.tabIndex = t.opts.tabIndex || t.$oel.attr("tabIndex"), t.opts.tabIndex && t.$el.attr("tabIndex", t.opts.tabIndex)
    }
    return {
      _init: function() { if (e.FE.INSTANCES.push(t), t.drag_support = { filereader: "undefined" != typeof FileReader, formdata: !!t.win.FormData, progress: "upload" in new XMLHttpRequest }, t.$wp) { n(), t.html.set(t._original_html), t.$el.attr("spellcheck", t.opts.spellcheck), t.helpers.isMobile() && (t.$el.attr("autocomplete", t.opts.spellcheck ? "on" : "off"), t.$el.attr("autocorrect", t.opts.spellcheck ? "on" : "off"), t.$el.attr("autocapitalize", t.opts.spellcheck ? "on" : "off")), t.opts.disableRightClick && t.events.$on(t.$el, "contextmenu", function(e) { if (2 == e.button) return !1 }); try { t.doc.execCommand("styleWithCSS", !1, !1) } catch (e) {} } "TEXTAREA" == t.$oel.get(0).tagName && (t.events.on("contentChanged", function() { t.$oel.val(t.html.get()) }), t.events.on("form.submit", function() { t.$oel.val(t.html.get()) }), t.events.on("form.reset", function() { t.html.set(t._original_html) }), t.$oel.val(t.html.get())), t.helpers.isIOS() && t.events.$on(t.$doc, "selectionchange", function() { t.$doc.get(0).hasFocus() || t.$win.get(0).focus() }), t.events.trigger("init") },
      destroy: function(e) { "TEXTAREA" == t.$oel.get(0).tagName && t.$oel.val(e), t.$wp && ("TEXTAREA" == t.$oel.get(0).tagName ? (t.$el.html(""), t.$wp.html(""), t.$box.replaceWith(t.$oel), t.$oel.show()) : (t.$wp.replaceWith(e), t.$el.html(""), t.$box.removeClass("fr-view fr-ltr fr-box " + (t.opts.editorClass || "")), t.opts.theme && t.$box.addClass(t.opts.theme + "-theme"))), this.$wp = null, this.$el = null, this.el = null, this.$box = null },
      isEmpty: function() { return t.node.isEmpty(t.el) },
      getXHR: function(e, n) { var r = new XMLHttpRequest; for (var o in r.open(n, e, !0), t.opts.requestWithCredentials && (r.withCredentials = !0), t.opts.requestHeaders) t.opts.requestHeaders.hasOwnProperty(o) && r.setRequestHeader(o, t.opts.requestHeaders[o]); return r },
      injectStyle: function(n) {
        if (t.opts.iframe) {
          t.$head.find("style[data-fr-style], link[data-fr-style]").remove(), t.$head.append('<style data-fr-style="true">' + n + "</style>");
          for (var r = 0; r < t.opts.iframeStyleFiles.length; r++) {
            var o = e('<link data-fr-style="true" rel="stylesheet" href="' + t.opts.iframeStyleFiles[r] + '">');
            o.get(0).addEventListener("load", t.size.syncIframe), t.$head.append(o)
          }
        }
      },
      hasFocus: function() { return t.browser.mozilla && t.helpers.isMobile() ? t.selection.inEditor() : t.node.hasFocus(t.el) || t.$el.find("*:focus").length > 0 },
      sameInstance: function(e) { if (!e) return !1; var n = e.data("instance"); return !!n && n.id == t.id }
    }
  }, e.FE.MODULES.cursorLists = function(t) {
    function n(e) {
      for (var t = e;
        "LI" != t.tagName;) t = t.parentNode;
      return t
    }

    function r(e) { for (var n = e; !t.node.isList(n);) n = n.parentNode; return n }
    return {
      _startEnter: function(o) {
        var i, a = n(o),
          s = a.nextSibling,
          l = a.previousSibling,
          d = t.html.defaultTag();
        if (t.node.isEmpty(a, !0) && s) {
          for (var c = "", f = "", p = o.parentNode; !t.node.isList(p) && p.parentNode && "LI" !== p.parentNode.tagName;) c = t.node.openTagString(p) + c, f += t.node.closeTagString(p), p = p.parentNode;
          c = t.node.openTagString(p) + c, f += t.node.closeTagString(p);
          var u = "";
          for (u = p.parentNode && "LI" == p.parentNode.tagName ? f + "<li>" + e.FE.MARKERS + "<br>" + c : d ? f + "<" + d + ">" + e.FE.MARKERS + "<br></" + d + ">" + c : f + e.FE.MARKERS + "<br>" + c, e(a).html('<span id="fr-break"></span>');
            ["UL", "OL"].indexOf(p.tagName) < 0 || p.parentNode && "LI" === p.parentNode.tagName;) p = p.parentNode;
          var g = t.node.openTagString(p) + e(p).html() + t.node.closeTagString(p);
          g = g.replace(/<span id="fr-break"><\/span>/g, u), e(p).replaceWith(g), t.$el.find("li:empty").remove()
        } else if (l && s || !t.node.isEmpty(a, !0)) {
          for (var h = "<br>", m = o.parentNode; m && "LI" != m.tagName;) h = t.node.openTagString(m) + h + t.node.closeTagString(m), m = m.parentNode;
          e(a).before("<li>" + h + "</li>"), e(o).remove()
        } else l ? ((i = r(a)).parentNode && "LI" == i.parentNode.tagName ? e(i.parentNode).after("<li>" + e.FE.MARKERS + "<br></li>") : d ? e(i).after("<" + d + ">" + e.FE.MARKERS + "<br></" + d + ">") : e(i).after(e.FE.MARKERS + "<br>"), e(a).remove()) : ((i = r(a)).parentNode && "LI" == i.parentNode.tagName ? s ? e(i.parentNode).before(t.node.openTagString(a) + e.FE.MARKERS + "<br></li>") : e(i.parentNode).after(t.node.openTagString(a) + e.FE.MARKERS + "<br></li>") : d ? e(i).before("<" + d + ">" + e.FE.MARKERS + "<br></" + d + ">") : e(i).before(e.FE.MARKERS + "<br>"), e(a).remove())
      },
      _middleEnter: function(r) {
        for (var o = n(r), i = "", a = r, s = "", l = ""; a != o;) {
          var d = "A" == (a = a.parentNode).tagName && t.cursor.isAtEnd(r, a) ? "fr-to-remove" : "";
          s = t.node.openTagString(e(a).clone().addClass(d).get(0)) + s, l = t.node.closeTagString(a) + l
        }
        i = l + i + s + e.FE.MARKERS, e(r).replaceWith('<span id="fr-break"></span>');
        var c = t.node.openTagString(o) + e(o).html() + t.node.closeTagString(o);
        c = c.replace(/<span id="fr-break"><\/span>/g, i), e(o).replaceWith(c)
      },
      _endEnter: function(r) {
        for (var o = n(r), i = e.FE.MARKERS, a = "", s = r, l = !1; s != o;) {
          var d = "A" == (s = s.parentNode).tagName && t.cursor.isAtEnd(r, s) ? "fr-to-remove" : "";
          l || s == o || t.node.isBlock(s) || (l = !0, a += e.FE.INVISIBLE_SPACE), a = t.node.openTagString(e(s).clone().addClass(d).get(0)) + a, i += t.node.closeTagString(s)
        }
        var c = a + i;
        e(r).remove(), e(o).after(c)
      },
      _backspace: function(o) {
        var i = n(o),
          a = i.previousSibling;
        if (a) {
          a = e(a).find(t.html.blockTagsQuery()).get(-1) || a, e(o).replaceWith(e.FE.MARKERS);
          var s = t.node.contents(a);
          s.length && "BR" == s[s.length - 1].tagName && e(s[s.length - 1]).remove(), e(i).find(t.html.blockTagsQuery()).not("ol, ul, table").each(function() { this.parentNode == i && e(this).replaceWith(e(this).html() + (t.node.isEmpty(this) ? "" : "<br>")) });
          for (var l, d = t.node.contents(i)[0]; d && !t.node.isList(d);) l = d.nextSibling, e(a).append(d), d = l;
          for (a = i.previousSibling; d;) l = d.nextSibling, e(a).append(d), d = l;
          e(i).remove()
        } else {
          var c = r(i);
          if (e(o).replaceWith(e.FE.MARKERS), c.parentNode && "LI" == c.parentNode.tagName) {
            var f = c.previousSibling;
            t.node.isBlock(f) ? (e(i).find(t.html.blockTagsQuery()).not("ol, ul, table").each(function() { this.parentNode == i && e(this).replaceWith(e(this).html() + (t.node.isEmpty(this) ? "" : "<br>")) }), e(f).append(e(i).html())) : e(c).before(e(i).html())
          } else {
            var p = t.html.defaultTag();
            p && 0 === e(i).find(t.html.blockTagsQuery()).length ? e(c).before("<" + p + ">" + e(i).html() + "</" + p + ">") : (e(c).before(e(i).html()), t.html.wrap())
          }
          e(i).remove(), 0 === e(c).find("li").length && e(c).remove()
        }
      },
      _del: function(r) {
        var o, i = n(r),
          a = i.nextSibling;
        if (a) {
          (o = t.node.contents(a)).length && "BR" == o[0].tagName && e(o[0]).remove(), e(a).find(t.html.blockTagsQuery()).not("ol, ul, table").each(function() { this.parentNode == a && e(this).replaceWith(e(this).html() + (t.node.isEmpty(this) ? "" : "<br>")) });
          for (var s, l = r, d = t.node.contents(a)[0]; d && !t.node.isList(d);) s = d.nextSibling, e(l).after(d), l = d, d = s;
          for (; d;) s = d.nextSibling, e(i).append(d), d = s;
          e(r).replaceWith(e.FE.MARKERS), e(a).remove()
        } else {
          for (var c = i; !c.nextSibling && c != t.el;) c = c.parentNode;
          if (c == t.el) return !1;
          if (c = c.nextSibling, t.node.isBlock(c)) e.FE.NO_DELETE_TAGS.indexOf(c.tagName) < 0 && (e(r).replaceWith(e.FE.MARKERS), (o = t.node.contents(i)).length && "BR" == o[o.length - 1].tagName && e(o[o.length - 1]).remove(), e(i).append(e(c).html()), e(c).remove());
          else
            for ((o = t.node.contents(i)).length && "BR" == o[o.length - 1].tagName && e(o[o.length - 1]).remove(), e(r).replaceWith(e.FE.MARKERS); c && !t.node.isBlock(c) && "BR" != c.tagName;) e(i).append(e(c)), c = c.nextSibling
        }
      }
    }
  }, e.FE.NO_DELETE_TAGS = ["TH", "TD", "TR", "TABLE", "FORM"], e.FE.SIMPLE_ENTER_TAGS = ["TH", "TD", "LI", "DL", "DT", "FORM"], e.FE.MODULES.cursor = function(t) {
    function n(e) { return !!e && (!!t.node.isBlock(e) || (e.nextSibling && e.nextSibling.nodeType == Node.TEXT_NODE && 0 === e.nextSibling.textContent.replace(/\u200b/g, "").length ? n(e.nextSibling) : !(e.nextSibling && (!e.previousSibling || "BR" != e.nextSibling.tagName || e.nextSibling.nextSibling)) && n(e.parentNode))) }

    function r(e) { return !!e && (!!t.node.isBlock(e) || (e.previousSibling && e.previousSibling.nodeType == Node.TEXT_NODE && 0 === e.previousSibling.textContent.replace(/\u200b/g, "").length ? r(e.previousSibling) : !e.previousSibling && r(e.parentNode))) }

    function o(e, n) { return !!e && (e != t.$wp.get(0) && (e.previousSibling && e.previousSibling.nodeType == Node.TEXT_NODE && 0 === e.previousSibling.textContent.replace(/\u200b/g, "").length ? o(e.previousSibling, n) : !e.previousSibling && (e.parentNode == n || o(e.parentNode, n)))) }

    function i(e, n) { return !!e && (e != t.$wp.get(0) && (e.nextSibling && e.nextSibling.nodeType == Node.TEXT_NODE && 0 === e.nextSibling.textContent.replace(/\u200b/g, "").length ? i(e.nextSibling, n) : !(e.nextSibling && (!e.previousSibling || "BR" != e.nextSibling.tagName || e.nextSibling.nextSibling)) && (e.parentNode == n || i(e.parentNode, n)))) }

    function a(n) { return e(n).parentsUntil(t.$el, "LI").length > 0 && 0 === e(n).parentsUntil("LI", "TABLE").length }

    function s(e, t) {
      var n = new RegExp("(?:[\\u2700-\\u27bf]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\u0023-\\u0039]\\ufe0f?\\u20e3|\\u3299|\\u3297|\\u303d|\\u3030|\\u24c2|\\ud83c[\\udd70-\\udd71]|\\ud83c[\\udd7e-\\udd7f]|\\ud83c\\udd8e|\\ud83c[\\udd91-\\udd9a]|\\ud83c[\\udde6-\\uddff]|[\\ud83c[\\ude01-\\ude02]|\\ud83c\\ude1a|\\ud83c\\ude2f|[\\ud83c[\\ude32-\\ude3a]|[\\ud83c[\\ude50-\\ude51]|\\u203c|\\u2049|[\\u25aa-\\u25ab]|\\u25b6|\\u25c0|[\\u25fb-\\u25fe]|\\u00a9|\\u00ae|\\u2122|\\u2139|\\ud83c\\udc04|[\\u2600-\\u26FF]|\\u2b05|\\u2b06|\\u2b07|\\u2b1b|\\u2b1c|\\u2b50|\\u2b55|\\u231a|\\u231b|\\u2328|\\u23cf|[\\u23e9-\\u23f3]|[\\u23f8-\\u23fa]|\\ud83c\\udccf|\\u2934|\\u2935|[\\u2190-\\u21ff])" + (t ? "" : "$"), "i"),
        r = e.match(n);
      return r ? r[0].length : 1
    }

    function l(n) {
      for (var r, o = n; !o.previousSibling;)
        if (o = o.parentNode, t.node.isElement(o)) return !1;
      if (o = o.previousSibling, !t.node.isBlock(o) && t.node.isEditable(o)) {
        for (r = t.node.contents(o); o.nodeType != Node.TEXT_NODE && !t.node.isDeletable(o) && r.length && t.node.isEditable(o);) o = r[r.length - 1], r = t.node.contents(o);
        if (o.nodeType == Node.TEXT_NODE) {
          if (t.helpers.isIOS()) return !0;
          var i = o.textContent,
            a = i.length;
          if (t.opts.tabSpaces && i.length >= t.opts.tabSpaces) 0 === i.substr(i.length - t.opts.tabSpaces, i.length - 1).replace(/ /g, "").replace(new RegExp(e.FE.UNICODE_NBSP, "g"), "").length && (a = i.length - t.opts.tabSpaces);
          o.textContent = i.substring(0, a - s(i));
          var l = i.length != o.textContent.length;
          0 === o.textContent.length ? l && t.opts.keepFormatOnDelete ? e(o).after(e.FE.INVISIBLE_SPACE + e.FE.MARKERS) : (2 != o.parentNode.childNodes.length || o.parentNode != n.parentNode) && 1 != o.parentNode.childNodes.length || t.node.isBlock(o.parentNode) || t.node.isElement(o.parentNode) ? (e(o).after(e.FE.MARKERS), t.node.isElement(o.parentNode) && !n.nextSibling && o.previousSibling && "BR" == o.previousSibling.tagName && e(n).after("<br>"), o.parentNode.removeChild(o)) : (e(o.parentNode).after(e.FE.MARKERS), e(o.parentNode).remove()) : e(o).after(e.FE.MARKERS)
        } else t.node.isDeletable(o) ? (e(o).after(e.FE.MARKERS), e(o).remove()) : n.nextSibling && "BR" == n.nextSibling.tagName && t.node.isVoid(o) && "BR" != o.tagName ? (e(n.nextSibling).remove(), e(n).replaceWith(e.FE.MARKERS)) : !1 !== t.events.trigger("node.remove", [e(o)]) && (e(o).after(e.FE.MARKERS), e(o).remove())
      } else if (e.FE.NO_DELETE_TAGS.indexOf(o.tagName) < 0 && (t.node.isEditable(o) || t.node.isDeletable(o)))
        if (t.node.isDeletable(o)) e(n).replaceWith(e.FE.MARKERS), e(o).remove();
        else if (t.node.isEmpty(o) && !t.node.isList(o)) e(o).remove(), e(n).replaceWith(e.FE.MARKERS);
      else {
        for (t.node.isList(o) && (o = e(o).find("li:last").get(0)), (r = t.node.contents(o)) && "BR" == r[r.length - 1].tagName && e(r[r.length - 1]).remove(), r = t.node.contents(o); r && t.node.isBlock(r[r.length - 1]);) o = r[r.length - 1], r = t.node.contents(o);
        e(o).append(e.FE.MARKERS);
        for (var d = n; !d.previousSibling;) d = d.parentNode;
        for (; d && "BR" !== d.tagName && !t.node.isBlock(d);) {
          var c = d;
          d = d.nextSibling, e(o).append(c)
        }
        d && "BR" == d.tagName && e(d).remove(), e(n).remove()
      } else n.nextSibling && "BR" == n.nextSibling.tagName && e(n.nextSibling).remove()
    }

    function d(n) {
      var r = e(n).parentsUntil(t.$el, "BLOCKQUOTE").length > 0,
        o = t.node.deepestParent(n, [], !r);
      if (o && "BLOCKQUOTE" == o.tagName) {
        var i = t.node.deepestParent(n, [e(n).parentsUntil(t.$el, "BLOCKQUOTE").get(0)]);
        i && i.nextSibling && (o = i)
      }
      if (null !== o) {
        var a, s = o.nextSibling;
        if (t.node.isBlock(o) && (t.node.isEditable(o) || t.node.isDeletable(o)) && s && e.FE.NO_DELETE_TAGS.indexOf(s.tagName) < 0)
          if (t.node.isDeletable(s)) e(s).remove(), e(n).replaceWith(e.FE.MARKERS);
          else if (t.node.isBlock(s) && t.node.isEditable(s))
          if (t.node.isList(s))
            if (t.node.isEmpty(o, !0)) e(o).remove(), e(s).find("li:first").prepend(e.FE.MARKERS);
            else { var l = e(s).find("li:first"); "BLOCKQUOTE" == o.tagName && (a = t.node.contents(o)).length && t.node.isBlock(a[a.length - 1]) && (o = a[a.length - 1]), 0 === l.find("ul, ol").length && (e(n).replaceWith(e.FE.MARKERS), l.find(t.html.blockTagsQuery()).not("ol, ul, table").each(function() { this.parentNode == l.get(0) && e(this).replaceWith(e(this).html() + (t.node.isEmpty(this) ? "" : "<br>")) }), e(o).append(t.node.contents(l.get(0))), l.remove(), 0 === e(s).find("li").length && e(s).remove()) }
        else {
          if ((a = t.node.contents(s)).length && "BR" == a[0].tagName && e(a[0]).remove(), "BLOCKQUOTE" != s.tagName && "BLOCKQUOTE" == o.tagName)
            for (a = t.node.contents(o); a.length && t.node.isBlock(a[a.length - 1]);) o = a[a.length - 1], a = t.node.contents(o);
          else if ("BLOCKQUOTE" == s.tagName && "BLOCKQUOTE" != o.tagName)
            for (a = t.node.contents(s); a.length && t.node.isBlock(a[0]);) s = a[0], a = t.node.contents(s);
          e(n).replaceWith(e.FE.MARKERS), e(o).append(s.innerHTML), e(s).remove()
        } else {
          for (e(n).replaceWith(e.FE.MARKERS); s && "BR" !== s.tagName && !t.node.isBlock(s) && t.node.isEditable(s);) {
            var d = s;
            s = s.nextSibling, e(o).append(d)
          }
          s && "BR" == s.tagName && t.node.isEditable(s) && e(s).remove()
        }
      }
    }

    function c(r) {
      for (var o, i = r; !i.nextSibling;)
        if (i = i.parentNode, t.node.isElement(i)) return !1;
      if ("BR" == (i = i.nextSibling).tagName && t.node.isEditable(i))
        if (i.nextSibling) {
          if (t.node.isBlock(i.nextSibling) && t.node.isEditable(i.nextSibling)) {
            if (!(e.FE.NO_DELETE_TAGS.indexOf(i.nextSibling.tagName) < 0)) return void e(i).remove();
            i = i.nextSibling, e(i.previousSibling).remove()
          }
        } else if (n(i)) {
        if (a(r)) t.cursorLists._del(r);
        else t.node.deepestParent(i) && ((!t.node.isEmpty(t.node.blockParent(i)) || (t.node.blockParent(i).nextSibling && e.FE.NO_DELETE_TAGS.indexOf(t.node.blockParent(i).nextSibling.tagName)) < 0) && e(i).remove(), d(r));
        return
      }
      if (!t.node.isBlock(i) && t.node.isEditable(i)) {
        for (o = t.node.contents(i); i.nodeType != Node.TEXT_NODE && o.length && !t.node.isDeletable(i) && t.node.isEditable(i);) i = o[0], o = t.node.contents(i);
        i.nodeType == Node.TEXT_NODE ? (e(i).before(e.FE.MARKERS), i.textContent.length && (i.textContent = i.textContent.substring(s(i.textContent, !0), i.textContent.length))) : t.node.isDeletable(i) ? (e(i).before(e.FE.MARKERS), e(i).remove()) : !1 !== t.events.trigger("node.remove", [e(i)]) && (e(i).before(e.FE.MARKERS), e(i).remove()), e(r).remove()
      } else if (e.FE.NO_DELETE_TAGS.indexOf(i.tagName) < 0 && (t.node.isEditable(i) || t.node.isDeletable(i)))
        if (t.node.isDeletable(i)) e(r).replaceWith(e.FE.MARKERS), e(i).remove();
        else if (t.node.isList(i)) r.previousSibling ? (e(i).find("li:first").prepend(r), t.cursorLists._backspace(r)) : (e(i).find("li:first").prepend(e.FE.MARKERS), e(r).remove());
      else if ((o = t.node.contents(i)) && "BR" == o[0].tagName && e(o[0]).remove(), o && "BLOCKQUOTE" == i.tagName) {
        var l = o[0];
        for (e(r).before(e.FE.MARKERS); l && "BR" != l.tagName;) {
          var c = l;
          l = l.nextSibling, e(r).before(c)
        }
        l && "BR" == l.tagName && e(l).remove()
      } else e(r).after(e(i).html()).after(e.FE.MARKERS), e(i).remove()
    }

    function f() { for (var e = t.el.querySelectorAll("blockquote:empty"), n = 0; n < e.length; n++) e[n].parentNode.removeChild(e[n]) }

    function p(n, r, o) {
      var a, s = t.node.deepestParent(n, [], !o);
      if (s && "BLOCKQUOTE" == s.tagName) return i(n, s) ? ((a = t.html.defaultTag()) ? e(s).after("<" + a + ">" + e.FE.MARKERS + "<br></" + a + ">") : e(s).after(e.FE.MARKERS + "<br>"), e(n).remove(), !1) : (u(n, r, o), !1);
      if (null == s)(a = t.html.defaultTag()) && t.node.isElement(n.parentNode) ? e(n).replaceWith("<" + a + ">" + e.FE.MARKERS + "<br></" + a + ">") : !n.previousSibling || e(n.previousSibling).is("br") || n.nextSibling ? e(n).replaceWith("<br>" + e.FE.MARKERS) : e(n).replaceWith("<br>" + e.FE.MARKERS + "<br>");
      else {
        var l = n,
          d = "";
        t.node.isBlock(s) && !r || (d = "<br/>");
        var c, f = "",
          p = "",
          g = "",
          h = "";
        (a = t.html.defaultTag()) && t.node.isBlock(s) && (g = "<" + a + ">", h = "</" + a + ">", s.tagName == a.toUpperCase() && (g = t.node.openTagString(e(s).clone().removeAttr("id").get(0))));
        do {
          if (l = l.parentNode, !r || l != s || r && !t.node.isBlock(s))
            if (f += t.node.closeTagString(l), l == s && t.node.isBlock(s)) p = g + p;
            else {
              var m = "A" == l.tagName && i(n, l) ? "fr-to-remove" : "";
              p = t.node.openTagString(e(l).clone().addClass(m).get(0)) + p
            }
        } while (l != s);
        d = f + d + p + (n.parentNode == s && t.node.isBlock(s) ? "" : e.FE.INVISIBLE_SPACE) + e.FE.MARKERS, t.node.isBlock(s) && !e(s).find("*:last").is("br") && e(s).append("<br/>"), e(n).after('<span id="fr-break"></span>'), e(n).remove(), s.nextSibling && !t.node.isBlock(s.nextSibling) || t.node.isBlock(s) || e(s).after("<br>"), c = (c = !r && t.node.isBlock(s) ? t.node.openTagString(s) + e(s).html() + h : t.node.openTagString(s) + e(s).html() + t.node.closeTagString(s)).replace(/<span id="fr-break"><\/span>/g, d), e(s).replaceWith(c)
      }
    }

    function u(n, r, a) {
      var s = t.node.deepestParent(n, [], !a);
      if (null == s) t.html.defaultTag() && n.parentNode === t.el ? e(n).replaceWith("<" + t.html.defaultTag() + ">" + e.FE.MARKERS + "<br></" + t.html.defaultTag() + ">") : (n.nextSibling && !t.node.isBlock(n.nextSibling) || e(n).after("<br>"), e(n).replaceWith("<br>" + e.FE.MARKERS));
      else {
        var l = n,
          d = "";
        "PRE" == s.tagName && (r = !0), t.node.isBlock(s) && !r || (d = "<br>");
        var c = "",
          f = "";
        do {
          var p = l;
          if (l = l.parentNode, "BLOCKQUOTE" == s.tagName && t.node.isEmpty(p) && !t.node.hasClass(p, "fr-marker") && e(p).find(n).length > 0 && e(p).after(n), ("BLOCKQUOTE" != s.tagName || !i(n, l) && !o(n, l)) && (!r || l != s || r && !t.node.isBlock(s))) {
            c += t.node.closeTagString(l);
            var u = "A" == l.tagName && i(n, l) ? "fr-to-remove" : "";
            f = t.node.openTagString(e(l).clone().addClass(u).removeAttr("id").get(0)) + f
          }
        } while (l != s);
        var g = s == n.parentNode && t.node.isBlock(s) || n.nextSibling;
        if ("BLOCKQUOTE" == s.tagName) {
          n.previousSibling && t.node.isBlock(n.previousSibling) && n.nextSibling && "BR" == n.nextSibling.tagName && (e(n.nextSibling).after(n), n.nextSibling && "BR" == n.nextSibling.tagName && e(n.nextSibling).remove());
          var h = t.html.defaultTag();
          d = c + d + (h ? "<" + h + ">" : "") + e.FE.MARKERS + "<br>" + (h ? "</" + h + ">" : "") + f
        } else d = c + d + f + (g ? "" : e.FE.INVISIBLE_SPACE) + e.FE.MARKERS;
        e(n).replaceWith('<span id="fr-break"></span>');
        var m = t.node.openTagString(s) + e(s).html() + t.node.closeTagString(s);
        m = m.replace(/<span id="fr-break"><\/span>/g, d), e(s).replaceWith(m)
      }
    }
    return {
      enter: function(s) {
        var l = t.markers.insert();
        if (!l) return !0;
        t.el.normalize();
        var d = !1;
        e(l).parentsUntil(t.$el, "BLOCKQUOTE").length > 0 && (s = !1, d = !0), e(l).parentsUntil(t.$el, "TD, TH").length && (d = !1), n(l) ? !a(l) || s || d ? p(l, s, d) : t.cursorLists._endEnter(l) : r(l) ? !a(l) || s || d ? function n(r, a, s) {
          var l, d = t.node.deepestParent(r, [], !s);
          if (d && "TABLE" == d.tagName) return e(d).find("td:first, th:first").prepend(r), n(r, a, s);
          if (d && "BLOCKQUOTE" == d.tagName) {
            if (o(r, d)) return (l = t.html.defaultTag()) ? e(d).before("<" + l + ">" + e.FE.MARKERS + "<br></" + l + ">") : e(d).before(e.FE.MARKERS + "<br>"), e(r).remove(), !1;
            i(r, d) ? p(r, a, !0) : u(r, a, !0)
          }
          if (null == d)(l = t.html.defaultTag()) && t.node.isElement(r.parentNode) ? e(r).replaceWith("<" + l + ">" + e.FE.MARKERS + "<br></" + l + ">") : e(r).replaceWith("<br>" + e.FE.MARKERS);
          else {
            if (t.node.isBlock(d))
              if (a) e(r).remove(), e(d).prepend("<br>" + e.FE.MARKERS);
              else {
                if (t.node.isEmpty(d, !0)) return p(r, a, s);
                e(d).before(t.node.openTagString(e(d).clone().removeAttr("id").get(0)) + "<br>" + t.node.closeTagString(d))
              }
            else e(d).before("<br>");
            e(r).remove()
          }
        }(l, s, d) : t.cursorLists._startEnter(l) : !a(l) || s || d ? u(l, s, d) : t.cursorLists._middleEnter(l), t.$el.find(".fr-to-remove").each(function() {
          for (var n = t.node.contents(this), r = 0; r < n.length; r++) n[r].nodeType == Node.TEXT_NODE && (n[r].textContent = n[r].textContent.replace(/\u200B/g, ""));
          e(this).replaceWith(this.innerHTML)
        }), t.html.fillEmptyBlocks(!0), t.opts.htmlUntouched || (t.html.cleanEmptyTags(), t.clean.lists()), t.spaces.normalizeAroundCursor(), t.selection.restore()
      },
      backspace: function() {
        var i = !1,
          d = t.markers.insert();
        if (!d) return !0;
        for (var c = d.parentNode; c && !t.node.isElement(c);) {
          if ("false" === c.getAttribute("contenteditable")) return e(d).replaceWith(e.FE.MARKERS), t.selection.restore(), !1;
          if ("true" === c.getAttribute("contenteditable")) break;
          c = c.parentNode
        }
        t.el.normalize();
        var p = d.previousSibling;
        if (p) {
          var u = p.textContent;
          u && u.length && 8203 == u.charCodeAt(u.length - 1) && (1 == u.length ? e(p).remove() : p.textContent = p.textContent.substr(0, u.length - s(u)))
        }
        return n(d) ? i = l(d) : r(d) ? a(d) && o(d, e(d).parents("li:first").get(0)) ? t.cursorLists._backspace(d) : function(n) {
          var r = e(n).parentsUntil(t.$el, "BLOCKQUOTE").length > 0,
            o = t.node.deepestParent(n, [], !r);
          if (o && "BLOCKQUOTE" == o.tagName) {
            var i = t.node.deepestParent(n, [e(n).parentsUntil(t.$el, "BLOCKQUOTE").get(0)]);
            i && i.previousSibling && (o = i)
          }
          if (null !== o) {
            var a, s = o.previousSibling;
            if (t.node.isBlock(o) && t.node.isEditable(o) && s && e.FE.NO_DELETE_TAGS.indexOf(s.tagName) < 0)
              if (t.node.isDeletable(s)) e(s).remove(), e(n).replaceWith(e.FE.MARKERS);
              else if (t.node.isEditable(s))
              if (t.node.isBlock(s))
                if (t.node.isEmpty(s) && !t.node.isList(s)) e(s).remove(), e(n).after(t.opts.keepFormatOnDelete ? e.FE.INVISIBLE_SPACE : "");
                else {
                  if (t.node.isList(s) && (s = e(s).find("li:last").get(0)), (a = t.node.contents(s)).length && "BR" == a[a.length - 1].tagName && e(a[a.length - 1]).remove(), "BLOCKQUOTE" == s.tagName && "BLOCKQUOTE" != o.tagName)
                    for (a = t.node.contents(s); a.length && t.node.isBlock(a[a.length - 1]);) s = a[a.length - 1], a = t.node.contents(s);
                  else if ("BLOCKQUOTE" != s.tagName && "BLOCKQUOTE" == o.tagName)
                    for (a = t.node.contents(o); a.length && t.node.isBlock(a[0]);) o = a[0], a = t.node.contents(o);
                  t.node.isEmpty(o) ? (e(n).remove(), t.selection.setAtEnd(s, t.opts.keepFormatOnDelete)) : (e(n).replaceWith(e.FE.MARKERS), e(s).append(o.innerHTML)), e(o).remove()
                }
            else e(n).replaceWith(e.FE.MARKERS), "BLOCKQUOTE" == o.tagName && s.nodeType == Node.ELEMENT_NODE ? e(s).remove() : (e(s).after(t.node.isEmpty(o) ? "" : e(o).html()), e(o).remove(), "BR" == s.tagName && e(s).remove())
          }
        }(d) : i = l(d), e(d).remove(), f(), t.html.fillEmptyBlocks(!0), t.opts.htmlUntouched || (t.html.cleanEmptyTags(), t.clean.quotes(), t.clean.lists()), t.spaces.normalizeAroundCursor(), t.selection.restore(), i
      },
      del: function() {
        var o = t.markers.insert();
        if (!o) return !1;
        if (t.el.normalize(), n(o))
          if (a(o))
            if (0 === e(o).parents("li:first").find("ul, ol").length) t.cursorLists._del(o);
            else {
              var i = e(o).parents("li:first").find("ul:first, ol:first").find("li:first");
              (i = i.find(t.html.blockTagsQuery()).get(-1) || i).prepend(o), t.cursorLists._backspace(o)
            }
        else d(o);
        else r(o), c(o);
        e(o).remove(), f(), t.html.fillEmptyBlocks(!0), t.opts.htmlUntouched || (t.html.cleanEmptyTags(), t.clean.quotes(), t.clean.lists()), t.spaces.normalizeAroundCursor(), t.selection.restore()
      },
      isAtEnd: i,
      isAtStart: o
    }
  }, e.FE.ENTER_P = 0, e.FE.ENTER_DIV = 1, e.FE.ENTER_BR = 2, e.FE.KEYCODE = { BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, ESC: 27, SPACE: 32, ARROW_LEFT: 37, ARROW_UP: 38, ARROW_RIGHT: 39, ARROW_DOWN: 40, DELETE: 46, ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, FF_SEMICOLON: 59, FF_EQUALS: 61, QUESTION_MARK: 63, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, META: 91, NUM_ZERO: 96, NUM_ONE: 97, NUM_TWO: 98, NUM_THREE: 99, NUM_FOUR: 100, NUM_FIVE: 101, NUM_SIX: 102, NUM_SEVEN: 103, NUM_EIGHT: 104, NUM_NINE: 105, NUM_MULTIPLY: 106, NUM_PLUS: 107, NUM_MINUS: 109, NUM_PERIOD: 110, NUM_DIVISION: 111, F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, FF_HYPHEN: 173, SEMICOLON: 186, DASH: 189, EQUALS: 187, COMMA: 188, HYPHEN: 189, PERIOD: 190, SLASH: 191, APOSTROPHE: 192, TILDE: 192, SINGLE_QUOTE: 222, OPEN_SQUARE_BRACKET: 219, BACKSLASH: 220, CLOSE_SQUARE_BRACKET: 221 }, e.extend(e.FE.DEFAULTS, { enter: e.FE.ENTER_P, multiLine: !0, tabSpaces: 0 }), e.FE.MODULES.keys = function(t) {
    var n, r, o, i = !1,
      a = null;

    function s() {
      if (t.browser.mozilla && t.selection.isCollapsed() && !i) {
        var e = t.selection.ranges(0),
          n = e.startContainer,
          r = e.startOffset;
        n && n.nodeType == Node.TEXT_NODE && r <= n.textContent.length && r > 0 && 32 == n.textContent.charCodeAt(r - 1) && (t.selection.save(), t.spaces.normalize(), t.selection.restore())
      }
    }

    function l() {
      t.selection.isFull() && setTimeout(function() {
        var n = t.html.defaultTag();
        n ? t.$el.html("<" + n + ">" + e.FE.MARKERS + "<br/></" + n + ">") : t.$el.html(e.FE.MARKERS + "<br/>"), t.selection.restore(), t.placeholder.refresh(), t.button.bulkRefresh(), t.undo.saveStep()
      }, 0)
    }

    function d() { i = !1 }

    function c(r) {
      t.events.disableBlur(), n = !0;
      var o = r.which;
      if (16 === o) return !0;
      if (229 === o) return i = !0, !0;
      i = !1;
      var s = g(o) && !p(r),
        l = o == e.FE.KEYCODE.BACKSPACE || o == e.FE.KEYCODE.DELETE;
      if ((t.selection.isFull() && !t.opts.keepFormatOnDelete && !t.placeholder.isVisible() || l && t.placeholder.isVisible() && t.opts.keepFormatOnDelete) && (s || l)) { var d = t.html.defaultTag(); if (d ? t.$el.html("<" + d + ">" + e.FE.MARKERS + "<br/></" + d + ">") : t.$el.html(e.FE.MARKERS + "<br/>"), t.selection.restore(), !g(o)) return r.preventDefault(), !0 }
      o == e.FE.KEYCODE.ENTER ? r.shiftKey ? function(e) { e.preventDefault(), e.stopPropagation(), t.opts.multiLine && (t.selection.isCollapsed() || t.selection.remove(), t.cursor.enter(!0)) }(r) : function(e) { a = null, t.opts.multiLine ? t.helpers.isIOS() ? a = t.snapshot.get() : (e.preventDefault(), e.stopPropagation(), t.selection.isCollapsed() || t.selection.remove(), t.cursor.enter()) : (e.preventDefault(), e.stopPropagation()) }(r) : o === e.FE.KEYCODE.BACKSPACE && (r.metaKey || r.ctrlKey) ? setTimeout(function() { t.events.disableBlur(), t.events.focus() }, 0) : o != e.FE.KEYCODE.BACKSPACE || p(r) || r.altKey ? o != e.FE.KEYCODE.DELETE || p(r) || r.altKey ? o == e.FE.KEYCODE.SPACE ? function(n) { var r = t.selection.element(); if (!t.helpers.isMobile() && (t.browser.mozilla || r && "A" == r.tagName)) { n.preventDefault(), n.stopPropagation(), t.selection.isCollapsed() || t.selection.remove(); var o = t.markers.insert(); if (o) { var i = o.previousSibling;!o.nextSibling && o.parentNode && "A" == o.parentNode.tagName ? (o.parentNode.insertAdjacentHTML("afterend", "&nbsp;" + e.FE.MARKERS), o.parentNode.removeChild(o)) : (i && i.nodeType == Node.TEXT_NODE && 1 == i.textContent.length && 160 == i.textContent.charCodeAt(0) ? i.textContent = i.textContent + " " : o.insertAdjacentHTML("beforebegin", "&nbsp;"), o.outerHTML = e.FE.MARKERS), t.selection.restore() } } }(r) : o == e.FE.KEYCODE.TAB ? function(e) {
        if (t.opts.tabSpaces > 0)
          if (t.selection.isCollapsed()) {
            t.undo.saveStep(), e.preventDefault(), e.stopPropagation();
            for (var n = "", r = 0; r < t.opts.tabSpaces; r++) n += "&nbsp;";
            t.html.insert(n), t.placeholder.refresh(), t.undo.saveStep()
          } else e.preventDefault(), e.stopPropagation(), e.shiftKey ? t.commands.outdent() : t.commands.indent()
      }(r) : p(r) || !g(r.which) || t.selection.isCollapsed() || r.ctrlKey || t.selection.remove() : t.placeholder.isVisible() ? (r.preventDefault(), r.stopPropagation()) : function(e) { e.preventDefault(), e.stopPropagation(), "" === t.selection.text() ? t.cursor.del() : t.selection.remove(), t.placeholder.refresh() }(r) : t.placeholder.isVisible() ? (r.preventDefault(), r.stopPropagation()) : function(e) { t.selection.isCollapsed() ? t.cursor.backspace() || (e.preventDefault(), e.stopPropagation(), n = !1) : (e.preventDefault(), e.stopPropagation(), t.selection.remove(), t.html.fillEmptyBlocks(), n = !1), t.placeholder.refresh() }(r), t.events.enableBlur()
    }

    function f(r) {
      if (t.helpers.isIOS() && r && r.which == e.FE.KEYCODE.ENTER && a && (t.snapshot.restore(a), t.cursor.enter()), t.helpers.isAndroid && t.browser.mozilla) return !0;
      if (i) return !1;
      if (!t.selection.isCollapsed()) return !0;
      if (r && (r.which === e.FE.KEYCODE.META || r.which == e.FE.KEYCODE.CTRL)) return !0;
      if (r && u(r.which)) return !0;
      r && r.which == e.FE.KEYCODE.ENTER && t.helpers.isIOS() && function() {
        var n = t.selection.element(),
          r = t.node.blockParent(n);
        if (r && "DIV" == r.tagName && t.selection.info(r).atStart) {
          var o = t.html.defaultTag();
          r.previousSibling && "DIV" != r.previousSibling.tagName && o && "div" != o && (t.selection.save(), e(r).replaceWith("<" + o + ">" + r.innerHTML + "</" + o + ">"), t.selection.restore())
        }
      }(), r && (r.which == e.FE.KEYCODE.ENTER || r.which == e.FE.KEYCODE.BACKSPACE || r.which >= 37 && r.which <= 40 && !t.browser.msie) && (r.which == e.FE.KEYCODE.BACKSPACE && n || function() {
        if (!t.$wp) return !0;
        var n;
        t.opts.height || t.opts.heightMax ? (n = t.position.getBoundingRect().top, t.helpers.isIOS() && (n -= t.helpers.scrollTop()), t.opts.iframe && (n += t.$iframe.offset().top), n > t.$wp.offset().top - t.helpers.scrollTop() + t.$wp.height() - 20 && t.$wp.scrollTop(n + t.$wp.scrollTop() - (t.$wp.height() + t.$wp.offset().top) + t.helpers.scrollTop() + 20)) : (n = t.position.getBoundingRect().top, t.opts.toolbarBottom && (n += t.opts.toolbarStickyOffset), t.helpers.isIOS() && (n -= t.helpers.scrollTop()), t.opts.iframe && (n += t.$iframe.offset().top, n -= t.helpers.scrollTop()), (n += t.opts.toolbarStickyOffset) > t.o_win.innerHeight - 20 && e(t.o_win).scrollTop(n + t.helpers.scrollTop() - t.o_win.innerHeight + 20), n = t.position.getBoundingRect().top, t.opts.toolbarBottom || (n -= t.opts.toolbarStickyOffset), t.helpers.isIOS() && (n -= t.helpers.scrollTop()), t.opts.iframe && (n += t.$iframe.offset().top, n -= t.helpers.scrollTop()), n < t.$tb.height() + 20 && n >= 0 && e(t.o_win).scrollTop(n + t.helpers.scrollTop() - t.$tb.height() - 20))
      }()), t.html.cleanBRs(!0, !0);
      var o = t.selection.element();
      (function(e) { if (!e) return !1; var t = e.innerHTML; return !!((t = t.replace(/<span[^>]*? class\s*=\s*["']?fr-marker["']?[^>]+>\u200b<\/span>/gi, "")) && /\u200B/.test(t) && t.replace(/\u200B/gi, "").length > 0) })(o) && !t.node.hasClass(o, "fr-marker") && "IFRAME" != o.tagName && function(e) { return !t.helpers.isIOS() || 0 === ((e.textContent || "").match(/[\u3041-\u3096\u30A0-\u30FF\u4E00-\u9FFF\u3130-\u318F\uAC00-\uD7AF]/gi) || []).length }(o) && (t.selection.save(), function(e) {
        for (var n = t.doc.createTreeWalker(e, NodeFilter.SHOW_TEXT, t.node.filter(function(e) { return /\u200B/gi.test(e.textContent) }), !1); n.nextNode();) {
          var r = n.currentNode;
          r.textContent = r.textContent.replace(/\u200B/gi, "")
        }
      }(o), t.selection.restore())
    }

    function p(e) { if (-1 != navigator.userAgent.indexOf("Mac OS X")) { if (e.metaKey && !e.altKey) return !0 } else if (e.ctrlKey && !e.altKey) return !0; return !1 }

    function u(t) { if (t >= e.FE.KEYCODE.ARROW_LEFT && t <= e.FE.KEYCODE.ARROW_DOWN) return !0 }

    function g(n) {
      if (n >= e.FE.KEYCODE.ZERO && n <= e.FE.KEYCODE.NINE) return !0;
      if (n >= e.FE.KEYCODE.NUM_ZERO && n <= e.FE.KEYCODE.NUM_MULTIPLY) return !0;
      if (n >= e.FE.KEYCODE.A && n <= e.FE.KEYCODE.Z) return !0;
      if (t.browser.webkit && 0 === n) return !0;
      switch (n) {
        case e.FE.KEYCODE.SPACE:
        case e.FE.KEYCODE.QUESTION_MARK:
        case e.FE.KEYCODE.NUM_PLUS:
        case e.FE.KEYCODE.NUM_MINUS:
        case e.FE.KEYCODE.NUM_PERIOD:
        case e.FE.KEYCODE.NUM_DIVISION:
        case e.FE.KEYCODE.SEMICOLON:
        case e.FE.KEYCODE.FF_SEMICOLON:
        case e.FE.KEYCODE.DASH:
        case e.FE.KEYCODE.EQUALS:
        case e.FE.KEYCODE.FF_EQUALS:
        case e.FE.KEYCODE.COMMA:
        case e.FE.KEYCODE.PERIOD:
        case e.FE.KEYCODE.SLASH:
        case e.FE.KEYCODE.APOSTROPHE:
        case e.FE.KEYCODE.SINGLE_QUOTE:
        case e.FE.KEYCODE.OPEN_SQUARE_BRACKET:
        case e.FE.KEYCODE.BACKSLASH:
        case e.FE.KEYCODE.CLOSE_SQUARE_BRACKET:
          return !0;
        default:
          return !1
      }
    }

    function h(n) {
      var i = n.which;
      if (p(n) || i >= 37 && i <= 40 || !g(i) && i != e.FE.KEYCODE.DELETE && i != e.FE.KEYCODE.BACKSPACE && i != e.FE.KEYCODE.ENTER && 229 != i) return !0;
      r || (o = t.snapshot.get(), t.undo.canDo() || t.undo.saveStep()), clearTimeout(r), r = setTimeout(function() { r = null, t.undo.saveStep() }, Math.max(250, t.opts.typingTimer))
    }

    function m(e) {
      var n = e.which;
      if (p(e) || n >= 37 && n <= 40) return !0;
      o && r && (t.undo.saveStep(o), o = null)
    }
    return { _init: function() { if (t.events.on("keydown", h), t.events.on("input", s), t.events.on("keyup input", m), t.events.on("keypress", d), t.events.on("keydown", c), t.events.on("keyup", f), t.events.on("html.inserted", f), t.events.on("cut", l), !t.browser.edge && t.el.msGetInputContext) try { t.el.msGetInputContext().addEventListener("MSCandidateWindowShow", function() { i = !0 }), t.el.msGetInputContext().addEventListener("MSCandidateWindowHide", function() { i = !1, f() }) } catch (e) {} }, ctrlKey: p, isCharacter: g, isArrow: u, forceUndo: function() { r && (clearTimeout(r), t.undo.saveStep(), o = null) }, isIME: function() { return i }, isBrowserAction: function(t) { var n = t.which; return p(t) || n == e.FE.KEYCODE.F5 } }
  }, e.FE.MODULES.accessibility = function(t) {
    var n = !0;

    function r(e) {
      e && e.length && (e.data("blur-event-set") || e.parents(".fr-popup").length || (t.events.$on(e, "blur", function() {
        var n = e.parents(".fr-toolbar, .fr-popup").data("instance") || t;
        n.events.blurActive() && n.events.trigger("blur"), n.events.enableBlur()
      }, !0), e.data("blur-event-set", !0)), (e.parents(".fr-toolbar, .fr-popup").data("instance") || t).events.disableBlur(), e.focus(), t.shared.$f_el = e)
    }

    function o(e, t) {
      var n = t ? "last" : "first",
        o = e.find("button:visible:not(.fr-disabled), .fr-group span.fr-command:visible")[n]();
      if (o.length) return r(o), !0
    }

    function i(e) { return e.is("input, textarea") && s(), t.events.disableBlur(), e.focus(), !0 }

    function a(e, n) { var r = e.find("input, textarea, button, select").filter(":visible").not(":disabled").filter(n ? ":last" : ":first"); if (r.length) return i(r); if (t.shared.with_kb) { var o = e.find(".fr-active-item:visible:first"); if (o.length) return i(o); var a = e.find("[tabIndex]:visible:first"); if (a.length) return i(a) } }

    function s() { 0 === t.$el.find(".fr-marker").length && t.core.hasFocus() && t.selection.save() }

    function l(e) { e.$el.find(".fr-marker").length && (e.events.disableBlur(), e.selection.restore(), e.events.enableBlur()) }

    function d() { var e = t.popups.areVisible(); if (e) { var n = e.find(".fr-buttons"); return n.find("button:focus, .fr-group span:focus").length ? !o(e.data("instance").$tb) : !o(n) } return !o(t.$tb) }

    function c() { var e = null; return t.shared.$f_el.is(".fr-dropdown.fr-active") ? e = t.shared.$f_el : t.shared.$f_el.closest(".fr-dropdown-menu").prev().is(".fr-dropdown.fr-active") && (e = t.shared.$f_el.closest(".fr-dropdown-menu").prev()), e }

    function f(n, i, s) {
      if (t.shared.$f_el) {
        var l = c();
        l && (t.button.click(l), t.shared.$f_el = l);
        var d = n.find("button:visible:not(.fr-disabled), .fr-group span.fr-command:visible"),
          f = d.index(t.shared.$f_el);
        if (0 === f && !s || f == d.length - 1 && s) {
          var p;
          if (i) { if (n.parent().is(".fr-popup")) p = !a(n.parent().children().not(".fr-buttons"), !s);!1 === p && (t.shared.$f_el = null) }
          i && !1 === p || o(n, !s)
        } else r(e(d.get(f + (s ? 1 : -1))));
        return !1
      }
    }

    function p(e, t) { return f(e, t, !0) }

    function u(e, t) { return f(e, t) }

    function g(e) { if (t.shared.$f_el) { var n; if (t.shared.$f_el.is(".fr-dropdown.fr-active")) return r(n = e ? t.shared.$f_el.next().find(".fr-command:not(.fr-disabled)").first() : t.shared.$f_el.next().find(".fr-command:not(.fr-disabled)").last()), !1; if (t.shared.$f_el.is("a.fr-command")) return (n = e ? t.shared.$f_el.closest("li").nextAll(":visible:first").find(".fr-command:not(.fr-disabled)").first() : t.shared.$f_el.closest("li").prevAll(":visible:first").find(".fr-command:not(.fr-disabled)").first()).length || (n = e ? t.shared.$f_el.closest(".fr-dropdown-menu").find(".fr-command:not(.fr-disabled)").first() : t.shared.$f_el.closest(".fr-dropdown-menu").find(".fr-command:not(.fr-disabled)").last()), r(n), !1 } }

    function h() {
      if (t.shared.$f_el) {
        if (t.shared.$f_el.hasClass("fr-dropdown")) t.button.click(t.shared.$f_el);
        else if (t.shared.$f_el.is("button.fr-back")) {
          t.opts.toolbarInline && (t.events.disableBlur(), t.events.focus());
          var e = t.popups.areVisible(t);
          e && (t.shared.with_kb = !1), t.button.click(t.shared.$f_el), E(e)
        } else {
          if (t.events.disableBlur(), t.button.click(t.shared.$f_el), t.shared.$f_el.attr("data-popup")) {
            var n = t.popups.areVisible(t);
            n && n.data("popup-button", t.shared.$f_el)
          } else if (t.shared.$f_el.attr("data-modal")) {
            var r = t.modals.areVisible(t);
            r && r.data("modal-button", t.shared.$f_el)
          }
          t.shared.$f_el = null
        }
        return !1
      }
    }

    function m() { t.shared.$f_el && (t.events.disableBlur(), t.shared.$f_el.blur(), t.shared.$f_el = null), !1 !== t.events.trigger("toolbar.focusEditor") && (t.events.disableBlur(), t.events.focus()) }

    function v(r) {
      r && r.length && (t.events.$on(r, "keydown", function(n) {
        if (!e(n.target).is("a.fr-command, button.fr-command, .fr-group span.fr-command")) return !0;
        var o = r.parents(".fr-popup").data("instance") || r.data("instance") || t;
        t.shared.with_kb = !0;
        var i = o.accessibility.exec(n, r);
        return t.shared.with_kb = !1, i
      }, !0), t.events.$on(r, "mouseenter", "[tabIndex]", function(o) {
        var i = r.parents(".fr-popup").data("instance") || r.data("instance") || t;
        if (!n) return o.stopPropagation(), void o.preventDefault();
        var a = e(o.currentTarget);
        i.shared.$f_el && i.shared.$f_el.not(a) && i.accessibility.focusEditor()
      }, !0))
    }

    function E(e) {
      var t = e.data("popup-button");
      t && setTimeout(function() { r(t), e.data("popup-button", null) }, 0)
    }

    function b(e) {
      var n = t.popups.areVisible(e);
      n && n.data("popup-button", null)
    }

    function S(n) {
      var r = -1 != navigator.userAgent.indexOf("Mac OS X") ? n.metaKey : n.ctrlKey;
      if (n.which == e.FE.KEYCODE.F10 && !r && !n.shiftKey && n.altKey) {
        t.shared.with_kb = !0;
        var o = t.popups.areVisible(t),
          i = !1;
        return o && (i = a(o.children().not(".fr-buttons"))), i || d(), t.shared.with_kb = !1, n.preventDefault(), n.stopPropagation(), !1
      }
      return !0
    }
    return {
      _init: function() { t.$wp ? t.events.on("keydown", S, !0) : t.events.$on(t.$win, "keydown", S, !0), t.events.on("mousedown", function(e) { b(t), t.shared.$f_el && (l(t), e.stopPropagation(), t.events.disableBlur(), t.shared.$f_el = null) }, !0), t.events.on("blur", function() { t.shared.$f_el = null, b(t) }, !0) },
      registerPopup: function(r) {
        var i = t.popups.get(r),
          s = function(n) {
            var r = t.popups.get(n);
            return {
              _tiKeydown: function(i) {
                var s = r.data("instance") || t;
                if (!1 === s.events.trigger("popup.tab", [i])) return !1;
                var d = i.which,
                  c = r.find(":focus:first");
                if (e.FE.KEYCODE.TAB == d) {
                  i.preventDefault();
                  var f = r.children().not(".fr-buttons"),
                    p = f.find("input, textarea, button, select").filter(":visible").not(".fr-no-touch input, .fr-no-touch textarea, .fr-no-touch button, .fr-no-touch select, :disabled").toArray(),
                    u = p.indexOf(this) + (i.shiftKey ? -1 : 1);
                  if (0 <= u && u < p.length) return s.events.disableBlur(), e(p[u]).focus(), i.stopPropagation(), !1;
                  var g = r.find(".fr-buttons");
                  if (g.length && o(g, !!i.shiftKey)) return i.stopPropagation(), !1;
                  if (a(f)) return i.stopPropagation(), !1
                } else {
                  if (e.FE.KEYCODE.ENTER != d) return e.FE.KEYCODE.ESC == d ? (i.preventDefault(), i.stopPropagation(), l(s), s.popups.isVisible(n) && r.find(".fr-back:visible").length ? (s.opts.toolbarInline && (s.events.disableBlur(), s.events.focus()), s.button.exec(r.find(".fr-back:visible:first")), E(r)) : s.popups.isVisible(n) && r.find(".fr-dismiss:visible").length ? s.button.exec(r.find(".fr-dismiss:visible:first")) : (s.popups.hide(n), s.opts.toolbarInline && s.toolbar.showInline(null, !0), E(r)), !1) : e.FE.KEYCODE.SPACE == d && (c.is(".fr-submit") || c.is(".fr-dismiss")) ? (i.preventDefault(), i.stopPropagation(), s.events.disableBlur(), s.button.exec(c), !0) : s.keys.isBrowserAction(i) ? void i.stopPropagation() : c.is("input[type=text], textarea") ? void i.stopPropagation() : e.FE.KEYCODE.SPACE == d && (c.is(".fr-link-attr") || c.is("input[type=file]")) ? void i.stopPropagation() : (i.stopPropagation(), i.preventDefault(), !1);
                  var h = null;
                  r.find(".fr-submit:visible").length > 0 ? h = r.find(".fr-submit:visible:first") : r.find(".fr-dismiss:visible").length && (h = r.find(".fr-dismiss:visible:first")), h && (i.preventDefault(), i.stopPropagation(), s.events.disableBlur(), s.button.exec(h))
                }
              },
              _tiMouseenter: function() {
                var e = r.data("instance") || t;
                b(e)
              }
            }
          }(r);
        v(i.find(".fr-buttons")), t.events.$on(i, "mouseenter", "tabIndex", s._tiMouseenter, !0), t.events.$on(i.children().not(".fr-buttons"), "keydown", "[tabIndex]", s._tiKeydown, !0), t.popups.onHide(r, function() { l(i.data("instance") || t) }), t.popups.onShow(r, function() { n = !1, setTimeout(function() { n = !0 }, 0) })
      },
      registerToolbar: v,
      focusToolbarElement: r,
      focusToolbar: o,
      focusContent: a,
      focusPopup: function(e) {
        var r = e.children().not(".fr-buttons");
        r.data("mouseenter-event-set") || (t.events.$on(r, "mouseenter", "[tabIndex]", function(o) {
          var i = e.data("instance") || t;
          if (!n) return o.stopPropagation(), void o.preventDefault();
          var a = r.find(":focus:first");
          a.length && !a.is("input, button, textarea") && (i.events.disableBlur(), a.blur(), i.events.disableBlur(), i.events.focus())
        }), r.data("mouseenter-event-set", !0)), !a(r) && t.shared.with_kb && o(e.find(".fr-buttons"))
      },
      focusModal: function(e) { t.core.hasFocus() || (t.events.disableBlur(), t.events.focus()), t.accessibility.saveSelection(), t.events.disableBlur(), t.$el.blur(), t.selection.clear(), t.events.disableBlur(), t.shared.with_kb ? e.find(".fr-command[tabIndex], [tabIndex]").first().focus() : e.find("[tabIndex]:first").focus() },
      focusEditor: m,
      focusPopupButton: E,
      focusModalButton: function(e) {
        var t = e.data("modal-button");
        t && setTimeout(function() { r(t), e.data("modal-button", null) }, 0)
      },
      hasFocus: function() { return null != t.shared.$f_el },
      exec: function(n, o) {
        var i = -1 != navigator.userAgent.indexOf("Mac OS X") ? n.metaKey : n.ctrlKey,
          a = n.which,
          s = !1;
        return a != e.FE.KEYCODE.TAB || i || n.shiftKey || n.altKey ? a != e.FE.KEYCODE.ARROW_RIGHT || i || n.shiftKey || n.altKey ? a != e.FE.KEYCODE.TAB || i || !n.shiftKey || n.altKey ? a != e.FE.KEYCODE.ARROW_LEFT || i || n.shiftKey || n.altKey ? a != e.FE.KEYCODE.ARROW_UP || i || n.shiftKey || n.altKey ? a != e.FE.KEYCODE.ARROW_DOWN || i || n.shiftKey || n.altKey ? a != e.FE.KEYCODE.ENTER || i || n.shiftKey || n.altKey ? a != e.FE.KEYCODE.ESC || i || n.shiftKey || n.altKey ? a != e.FE.KEYCODE.F10 || i || n.shiftKey || !n.altKey || (s = d()) : s = function(e) { if (t.shared.$f_el) { var n = c(); return n ? (t.button.click(n), r(n)) : e.parent().find(".fr-back:visible").length ? (t.shared.with_kb = !1, t.opts.toolbarInline && (t.events.disableBlur(), t.events.focus()), t.button.exec(e.parent().find(".fr-back:visible:first")), E(e.parent())) : t.shared.$f_el.is("button, .fr-group span") && (e.parent().is(".fr-popup") ? (l(t), t.shared.$f_el = null, !1 !== t.events.trigger("toolbar.esc") && (t.popups.hide(e.parent()), t.opts.toolbarInline && t.toolbar.showInline(null, !0), E(e.parent()))) : m()), !1 } }(o) : s = h() : s = t.shared.$f_el && t.shared.$f_el.is(".fr-dropdown:not(.fr-active)") ? h() : g(!0) : s = g() : s = u(o) : s = u(o, !0) : s = p(o) : s = p(o, !0), t.shared.$f_el || void 0 !== s || (s = !0), !s && t.keys.isBrowserAction(n) && (s = !0), !!s || (n.preventDefault(), n.stopPropagation(), !1)
      },
      saveSelection: s,
      restoreSelection: l
    }
  }, e.FE.MODULES.format = function(t) {
    function n(e, t) { var n = "<" + e; for (var r in t) t.hasOwnProperty(r) && (n += " " + r + '="' + t[r] + '"'); return n += ">" }

    function r(e, t) { var n = e; for (var r in t) t.hasOwnProperty(r) && (n += "id" == r ? "#" + t[r] : "class" == r ? "." + t[r] : "[" + r + '="' + t[r] + '"]'); return n }

    function o(e, t) { return !(!e || e.nodeType != Node.ELEMENT_NODE) && (e.matches || e.matchesSelector || e.msMatchesSelector || e.mozMatchesSelector || e.webkitMatchesSelector || e.oMatchesSelector).call(e, t) }

    function i(r, o, a) {
      if (r) {
        if (t.node.isBlock(r)) return i(r.firstChild, o, a), !1;
        for (var s = e(n(o, a)).insertBefore(r), l = r; l && !e(l).is(".fr-marker") && 0 === e(l).find(".fr-marker").length && "UL" != l.tagName && "OL" != l.tagName;) {
          var d = l;
          l = l.nextSibling, s.append(d)
        }
        if (l)(e(l).find(".fr-marker").length || "UL" == l.tagName || "OL" == l.tagName) && i(l.firstChild, o, a);
        else {
          for (var c = s.get(0).parentNode; c && !c.nextSibling && !t.node.isElement(c);) c = c.parentNode;
          if (c) {
            var f = c.nextSibling;
            f && (t.node.isBlock(f) ? i(f.firstChild, o, a) : i(f, o, a))
          }
        }
        s.is(":empty") && s.remove()
      }
    }

    function a(a, s) {
      var l;
      if (void 0 === s && (s = {}), s.style && delete s.style, t.selection.isCollapsed()) { t.markers.insert(), t.$el.find(".fr-marker").replaceWith(n(a, s) + e.FE.INVISIBLE_SPACE + e.FE.MARKERS + function(e) { return "</" + e + ">" }(a)), t.selection.restore() } else {
        var d;
        t.selection.save(), i(t.$el.find('.fr-marker[data-type="true"]').get(0).nextSibling, a, s);
        do { for (d = t.$el.find(r(a, s) + " > " + r(a, s)), l = 0; l < d.length; l++) d[l].outerHTML = d[l].innerHTML } while (d.length);
        t.el.normalize();
        var c = t.el.querySelectorAll(".fr-marker");
        for (l = 0; l < c.length; l++) { var f = e(c[l]);!0 === f.data("type") ? o(f.get(0).nextSibling, r(a, s)) && f.next().prepend(f) : o(f.get(0).previousSibling, r(a, s)) && f.prev().append(f) }
        t.selection.restore()
      }
    }

    function s(e, n, i, a) {
      if (!a) {
        var s = !1;
        if (!0 === e.data("type"))
          for (; t.node.isFirstSibling(e.get(0)) && !e.parent().is(t.$el) && !e.parent().is("ol") && !e.parent().is("ul");) e.parent().before(e), s = !0;
        else if (!1 === e.data("type"))
          for (; t.node.isLastSibling(e.get(0)) && !e.parent().is(t.$el) && !e.parent().is("ol") && !e.parent().is("ul");) e.parent().after(e), s = !0;
        if (s) return !0
      }
      if (e.parents(n).length || void 0 === n) {
        var l = "",
          d = "",
          c = e.parent();
        if (c.is(t.$el) || t.node.isBlock(c.get(0))) return !1;
        for (; !t.node.isBlock(c.parent().get(0)) && (void 0 === n || void 0 !== n && !o(c.get(0), r(n, i)));) l += t.node.closeTagString(c.get(0)), d = t.node.openTagString(c.get(0)) + d, c = c.parent();
        var f = e.get(0).outerHTML;
        e.replaceWith('<span id="mark"></span>');
        var p = c.html().replace(/<span id="mark"><\/span>/, l + t.node.closeTagString(c.get(0)) + d + f + l + t.node.openTagString(c.get(0)) + d);
        return c.replaceWith(t.node.openTagString(c.get(0)) + p + t.node.closeTagString(c.get(0))), !0
      }
      return !1
    }

    function l(n, i) {
      void 0 === i && (i = {}), i.style && delete i.style;
      var a = t.selection.isCollapsed();
      t.selection.save();
      for (var l = !0; l;) {
        l = !1;
        for (var d = t.$el.find(".fr-marker"), c = 0; c < d.length; c++) {
          var f = e(d[c]),
            p = null;
          if (f.attr("data-cloned") || a || (p = f.clone().removeClass("fr-marker").addClass("fr-clone"), !0 === f.data("type") ? f.attr("data-cloned", !0).after(p) : f.attr("data-cloned", !0).before(p)), s(f, n, i, a)) { l = !0; break }
        }
      }! function n(i, a, s, l) {
        for (var d = t.node.contents(i.get(0)), c = 0; c < d.length; c++) {
          var f = d[c];
          if (t.node.hasClass(f, "fr-marker")) a = (a + 1) % 2;
          else if (a)
            if (e(f).find(".fr-marker").length > 0) a = n(e(f), a, s, l);
            else {
              for (var p = e(f).find(s || "*"), u = p.length - 1; u >= 0; u--) {
                var g = p[u];
                t.node.isBlock(g) || t.node.isVoid(g) || void 0 !== s && !o(g, r(s, l)) || (g.outerHTML = g.innerHTML)
              }
              void 0 === s && f.nodeType == Node.ELEMENT_NODE && !t.node.isVoid(f) && !t.node.isBlock(f) || o(f, r(s, l)) ? e(f).replaceWith(f.innerHTML) : void 0 === s && f.nodeType == Node.ELEMENT_NODE && t.node.isBlock(f) && t.node.clearAttributes(f)
            }
          else e(f).find(".fr-marker").length > 0 && (a = n(e(f), a, s, l))
        }
        return a
      }(t.$el, 0, n, i), a || (t.$el.find(".fr-marker").remove(), t.$el.find(".fr-clone").removeClass("fr-clone").addClass("fr-marker")), a && t.$el.find(".fr-marker").before(e.FE.INVISIBLE_SPACE).after(e.FE.INVISIBLE_SPACE), t.html.cleanEmptyTags(), t.el.normalize(), t.selection.restore()
    }

    function d(t, n) {
      var r = e(t);
      r.css(n, ""), "" === r.attr("style") && r.replaceWith(r.html())
    }

    function c(t, n) { return 0 === e(t).attr("style").indexOf(n + ":") || e(t).attr("style").indexOf(";" + n + ":") >= 0 || e(t).attr("style").indexOf("; " + n + ":") >= 0 }

    function f(n, r) {
      var o, a;
      if (t.selection.isCollapsed()) {
        t.markers.insert();
        var l = (a = t.$el.find(".fr-marker")).parent();
        if (t.node.openTagString(l.get(0)) == '<span style="' + n + ": " + l.css(n) + ';">') {
          if (t.node.isEmpty(l.get(0))) l.replaceWith('<span style="' + n + ": " + r + ';">' + e.FE.INVISIBLE_SPACE + e.FE.MARKERS + "</span>");
          else {
            var f = {};
            f[n] = r, s(a, "span", f, !0), (a = t.$el.find(".fr-marker")).replaceWith('<span style="' + n + ": " + r + ';">' + e.FE.INVISIBLE_SPACE + e.FE.MARKERS + "</span>")
          }
          t.html.cleanEmptyTags()
        } else t.node.isEmpty(l.get(0)) && l.is("span") ? (a.replaceWith(e.FE.MARKERS), l.css(n, r)) : a.replaceWith('<span style="' + n + ": " + r + ';">' + e.FE.INVISIBLE_SPACE + e.FE.MARKERS + "</span>");
        t.selection.restore()
      } else {
        if (t.selection.save(), null == r || "color" == n && t.$el.find(".fr-marker").parents("u, a").length > 0) {
          var p = t.$el.find(".fr-marker");
          for (o = 0; o < p.length; o++)
            if (!0 === (a = e(p[o])).data("type"))
              for (; t.node.isFirstSibling(a.get(0)) && !a.parent().is(t.$el) && !t.node.isElement(a.parent().get(0)) && !t.node.isBlock(a.parent().get(0));) a.parent().before(a);
            else
              for (; t.node.isLastSibling(a.get(0)) && !a.parent().is(t.$el) && !t.node.isElement(a.parent().get(0)) && !t.node.isBlock(a.parent().get(0));) a.parent().after(a)
        }
        var u = t.$el.find('.fr-marker[data-type="true"]').get(0).nextSibling,
          g = { class: "fr-unprocessed" };
        for (r && (g.style = n + ": " + r + ";"), i(u, "span", g), t.$el.find(".fr-marker + .fr-unprocessed").each(function() { e(this).prepend(e(this).prev()) }), t.$el.find(".fr-unprocessed + .fr-marker").each(function() { e(this).prev().append(this) }); t.$el.find("span.fr-unprocessed").length > 0;) {
          var h = t.$el.find("span.fr-unprocessed:first").removeClass("fr-unprocessed");
          if (h.parent().get(0).normalize(), h.parent().is("span") && 1 == h.parent().get(0).childNodes.length) {
            h.parent().css(n, r);
            var m = h;
            h = h.parent(), m.replaceWith(m.html())
          }
          var v = h.find("span");
          for (o = v.length - 1; o >= 0; o--) d(v[o], n);
          var E = h.parentsUntil(t.$el, "span[style]"),
            b = [];
          for (o = E.length - 1; o >= 0; o--) c(E[o], n) || b.push(E[o]);
          if ((E = E.not(b)).length) {
            var S = "",
              T = "",
              y = "",
              N = "",
              C = h.get(0);
            do { C = C.parentNode, e(C).addClass("fr-split"), S += t.node.closeTagString(C), T = t.node.openTagString(e(C).clone().addClass("fr-split").get(0)) + T, E.get(0) != C && (y += t.node.closeTagString(C), N = t.node.openTagString(e(C).clone().addClass("fr-split").get(0)) + N) } while (E.get(0) != C);
            var x = S + t.node.openTagString(e(E.get(0)).clone().css(n, r || "").get(0)) + N + h.css(n, "").get(0).outerHTML + y + "</span>" + T;
            h.replaceWith('<span id="fr-break"></span>');
            var $ = E.get(0).outerHTML;
            e(E.get(0)).replaceWith($.replace(/<span id="fr-break"><\/span>/g, x))
          }
        }
        for (; t.$el.find(".fr-split:empty").length > 0;) t.$el.find(".fr-split:empty").remove();
        t.$el.find(".fr-split").removeClass("fr-split"), t.$el.find('span[style=""]').removeAttr("style"), t.$el.find('span[class=""]').removeAttr("class"), t.html.cleanEmptyTags(), e(t.$el.find("span").get().reverse()).each(function() { this.attributes && 0 !== this.attributes.length || e(this).replaceWith(this.innerHTML) }), t.el.normalize();
        var A = t.$el.find("span[style] + span[style]");
        for (o = 0; o < A.length; o++) {
          var O = e(A[o]),
            w = e(A[o]).prev();
          O.get(0).previousSibling == w.get(0) && t.node.openTagString(O.get(0)) == t.node.openTagString(w.get(0)) && (O.prepend(w.html()), w.remove())
        }
        t.$el.find("span[style] span[style]").each(function() {
          if (e(this).attr("style").indexOf("font-size") >= 0) {
            var t = e(this).parents("span[style]");
            t.attr("style").indexOf("background-color") >= 0 && (e(this).attr("style", e(this).attr("style") + ";" + t.attr("style")), s(e(this), "span[style]", {}, !1))
          }
        }), t.el.normalize(), t.selection.restore()
      }
    }

    function p(e, n) {
      void 0 === n && (n = {}), n.style && delete n.style;
      var i = t.selection.ranges(0),
        a = i.startContainer;
      if (a.nodeType == Node.ELEMENT_NODE && a.childNodes.length > 0 && a.childNodes[i.startOffset] && (a = a.childNodes[i.startOffset]), !i.collapsed && a.nodeType == Node.TEXT_NODE && i.startOffset == (a.textContent || "").length) {
        for (; !t.node.isBlock(a.parentNode) && !a.nextSibling;) a = a.parentNode;
        a.nextSibling && (a = a.nextSibling)
      }
      for (var s = a; s && s.nodeType == Node.ELEMENT_NODE && !o(s, r(e, n));) s = s.firstChild;
      if (s && s.nodeType == Node.ELEMENT_NODE && o(s, r(e, n))) return !0;
      var l = a;
      for (l && l.nodeType != Node.ELEMENT_NODE && (l = l.parentNode); l && l.nodeType == Node.ELEMENT_NODE && l != t.el && !o(l, r(e, n));) l = l.parentNode;
      return !(!l || l.nodeType != Node.ELEMENT_NODE || l == t.el || !o(l, r(e, n)))
    }
    return { is: p, toggle: function(e, t) { p(e, t) ? l(e, t) : a(e, t) }, apply: a, remove: l, applyStyle: f, removeStyle: function(e) { f(e, null) } }
  }, e.extend(e.FE.DEFAULTS, { indentMargin: 20 }), e.FE.COMMANDS = {
    bold: {
      title: "Bold",
      toggle: !0,
      refresh: function(e) {
        var t = this.format.is("strong");
        e.toggleClass("fr-active", t).attr("aria-pressed", t)
      }
    },
    italic: {
      title: "Italic",
      toggle: !0,
      refresh: function(e) {
        var t = this.format.is("em");
        e.toggleClass("fr-active", t).attr("aria-pressed", t)
      }
    },
    underline: {
      title: "Underline",
      toggle: !0,
      refresh: function(e) {
        var t = this.format.is("u");
        e.toggleClass("fr-active", t).attr("aria-pressed", t)
      }
    },
    strikeThrough: {
      title: "Strikethrough",
      toggle: !0,
      refresh: function(e) {
        var t = this.format.is("s");
        e.toggleClass("fr-active", t).attr("aria-pressed", t)
      }
    },
    subscript: {
      title: "Subscript",
      toggle: !0,
      refresh: function(e) {
        var t = this.format.is("sub");
        e.toggleClass("fr-active", t).attr("aria-pressed", t)
      }
    },
    superscript: {
      title: "Superscript",
      toggle: !0,
      refresh: function(e) {
        var t = this.format.is("sup");
        e.toggleClass("fr-active", t).attr("aria-pressed", t)
      }
    },
    outdent: { title: "Decrease Indent" },
    indent: { title: "Increase Indent" },
    undo: { title: "Undo", undo: !1, forcedRefresh: !0, disabled: !0 },
    redo: { title: "Redo", undo: !1, forcedRefresh: !0, disabled: !0 },
    insertHR: { title: "Insert Horizontal Line" },
    clearFormatting: { title: "Clear Formatting" },
    selectAll: { title: "Select All", undo: !1 }
  }, e.FE.RegisterCommand = function(t, n) { e.FE.COMMANDS[t] = n }, e.FE.MODULES.commands = function(t) {
    function n(e) { return t.html.defaultTag() && (e = "<" + t.html.defaultTag() + ">" + e + "</" + t.html.defaultTag() + ">"), e }
    var r = {
      bold: function() { i("bold", "strong") },
      subscript: function() { t.format.is("sup") && t.format.remove("sup"), i("subscript", "sub") },
      superscript: function() { t.format.is("sub") && t.format.remove("sub"), i("superscript", "sup") },
      italic: function() { i("italic", "em") },
      strikeThrough: function() { i("strikeThrough", "s") },
      underline: function() { i("underline", "u") },
      undo: function() { t.undo.run() },
      redo: function() { t.undo.redo() },
      indent: function() { a(1) },
      outdent: function() { a(-1) },
      show: function() { t.opts.toolbarInline && t.toolbar.showInline(null, !0) },
      insertHR: function() {
        t.selection.remove();
        var r = "";
        t.core.isEmpty() && (r = n(r = "<br>")), t.html.insert('<hr id="fr-just">' + r);
        var o, i = t.$el.find("hr#fr-just");
        i.removeAttr("id"), i.prev().is("hr") ? o = t.selection.setAfter(i.get(0), !1) : i.next().is("hr") ? o = t.selection.setBefore(i.get(0), !1) : t.selection.setAfter(i.get(0), !1) || t.selection.setBefore(i.get(0), !1), o || void 0 === o || (r = n(r = e.FE.MARKERS + "<br>"), i.after(r)), t.selection.restore()
      },
      clearFormatting: function() { t.format.remove() },
      selectAll: function() { t.doc.execCommand("selectAll", !1, !1) }
    };

    function o(n, o) {
      if (!1 !== t.events.trigger("commands.before", e.merge([n], o || []))) {
        var i = e.FE.COMMANDS[n] && e.FE.COMMANDS[n].callback || r[n],
          a = !0,
          s = !1;
        e.FE.COMMANDS[n] && (void 0 !== e.FE.COMMANDS[n].focus && (a = e.FE.COMMANDS[n].focus), void 0 !== e.FE.COMMANDS[n].accessibilityFocus && (s = e.FE.COMMANDS[n].accessibilityFocus)), (!t.core.hasFocus() && a && !t.popups.areVisible() || !t.core.hasFocus() && s && t.accessibility.hasFocus()) && t.events.focus(!0), e.FE.COMMANDS[n] && !1 !== e.FE.COMMANDS[n].undo && (t.$el.find(".fr-marker").length && (t.events.disableBlur(), t.selection.restore()), t.undo.saveStep()), i && i.apply(t, e.merge([n], o || [])), t.events.trigger("commands.after", e.merge([n], o || [])), e.FE.COMMANDS[n] && !1 !== e.FE.COMMANDS[n].undo && t.undo.saveStep()
      }
    }

    function i(e, n) { t.format.toggle(n) }

    function a(n) {
      t.selection.save(), t.html.wrap(!0, !0, !0, !0), t.selection.restore();
      for (var r = t.selection.blocks(), o = 0; o < r.length; o++)
        if ("LI" != r[o].tagName && "LI" != r[o].parentNode.tagName) {
          var i = e(r[o]),
            a = "rtl" == t.opts.direction || "rtl" == i.css("direction") ? "margin-right" : "margin-left",
            s = t.helpers.getPX(i.css(a));
          i.css(a, Math.max(s + n * t.opts.indentMargin, 0) || ""), i.removeClass("fr-temp-div")
        }
      t.selection.save(), t.html.unwrap(), t.selection.restore()
    }

    function s(e) { return function() { o(e) } }
    var l = {};
    for (var d in r) r.hasOwnProperty(d) && (l[d] = s(d));
    return e.extend(l, {
      exec: o,
      _init: function() {
        t.events.on("keydown", function(e) { var n = t.selection.element(); if (n && "HR" == n.tagName && !t.keys.isArrow(e.which)) return e.preventDefault(), !1 }), t.events.on("keyup", function(n) {
          var r = t.selection.element();
          if (r && "HR" == r.tagName)
            if (n.which == e.FE.KEYCODE.ARROW_LEFT || n.which == e.FE.KEYCODE.ARROW_UP) { if (r.previousSibling) return t.node.isBlock(r.previousSibling) ? t.selection.setAtEnd(r.previousSibling) : e(r).before(e.FE.MARKERS), t.selection.restore(), !1 } else if ((n.which == e.FE.KEYCODE.ARROW_RIGHT || n.which == e.FE.KEYCODE.ARROW_DOWN) && r.nextSibling) return t.node.isBlock(r.nextSibling) ? t.selection.setAtStart(r.nextSibling) : e(r).after(e.FE.MARKERS), t.selection.restore(), !1
        }), t.events.on("mousedown", function(e) { if (e.target && "HR" == e.target.tagName) return e.preventDefault(), e.stopPropagation(), !1 }), t.events.on("mouseup", function() {
          var n = t.selection.element();
          n == t.selection.endElement() && n && "HR" == n.tagName && (n.nextSibling && (t.node.isBlock(n.nextSibling) ? t.selection.setAtStart(n.nextSibling) : e(n).after(e.FE.MARKERS)), t.selection.restore())
        })
      }
    })
  }, e.FE.MODULES.data = function(e) {
    function t(e) { return e }

    function n(e) { for (var t = e.toString(), n = 0, r = 0; r < t.length; r++) n += parseInt(t.charAt(r), 10); return n > 10 ? n % 9 + 1 : n }

    function r(e, t, n) { for (var r = Math.abs(n); r-- > 0;) e -= t; return n < 0 && (e += 123), e }

    function o(e) { return !(!e || "none" != e.css("display") || (e.remove(), 0)) }

    function i() { return !!e.$box && (e.$box.append(c(t(c("noLD2laB-7NB1C1ebcvH-9SB3a1C6QC2D4A-9d1E2B2B4xgAE4B2G2I1C3A3B2qMF1DE1fkxfcC-11C-9g1G2E4XC9a1E5A3G-10mvrioCC3AA1KA1qJ-7NB2MA6sxeqVA6TD6e2D4B-9rYA2a1A4bCD3vwC-7EC10D3E2lNC1KD1QB9SB6UE5TE4YF3YA5c1A3d1B3kGE2gFA5A2D2ch1KI1IB1thyH5wvVC11UB6c1F4wwwXA7gmnfB2jgB1A7nd1e1IC2NG4H1A9bjvnbC-8PG3mlazD4dH-9HI2qAA2jGC2IA1dajajFD5SG4J4c1qttyB-9wg1B2b2A6b1C3EG3B2I2rCD4E1B1LG1oaMA3RE7abC-8C-7aVA4C5B5F-11e1D3I3a5A8hmmnogH2IB5A2nhkgiA4TH4VC7yxdblH-8YC6D6C4xC3yqJJ2C-21spB-11fMF1KF1IC2USC4PG4TE3RD6ZF5XE3UE3uefaFE4D2G2AE1HA2JD1zzzQE3SD9vgqF4ua3B13XA4C5gd1E3E2A14ridsldcCA7MC5ghwE-11ZH5f1D3a1D8bwxmkzi1A7IB3KvpB-8rwMD3IE1GG-10bgqwxewvWE4H3VbD-16qC-11qc1E2TwEA6A3aCE4A1A4lOD3JC1iVA3RA13c2D8olqf1G3A32B17==")))), a = e.$box.find("> div:last"), s = a.find("> a"), void("rtl" == e.opts.direction && a.css("left", "auto").css("right", 0))) }
    var a, s, l = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      d = function() { for (var e = 0, t = document.domain, n = t.split("."), r = "_gd" + (new Date).getTime(); e < n.length - 1 && -1 == document.cookie.indexOf(r + "=" + r);) t = n.slice(-1 - ++e).join("."), document.cookie = r + "=" + r + ";domain=" + t + ";"; return document.cookie = r + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=" + t + ";", (t || "").replace(/(^\.*)|(\.*$)/g, "") }(),
      c = t(function(e) {
        if (!e) return e;
        for (var o = "", i = t("charCodeAt"), a = t("fromCharCode"), s = l.indexOf(e[0]), d = 1; d < e.length - 2; d++) {
          for (var c = n(++s), f = e[i](d), p = "";
            /[0-9-]/.test(e[d + 1]);) p += e[++d];
          f = r(f, c, p = parseInt(p, 10) || 0), f ^= s - 1 & 31, o += String[a](f)
        }
        return o
      });
    return { _init: function() { var n = localStorage && localStorage.FEK || e.opts.key || [""]; "string" == typeof n && (n = [n]), e.ul = !0; for (var r = 0; r < n.length; r++) { var l = c(n[r]) || ""; if (!(l !== c(t(c("mcVRDoB1BGILD7YFe1BTXBA7B6=="))) && l.indexOf(d, l.length - d.length) < 0 && [c("9qqG-7amjlwq=="), c("KA3B3C2A6D1D5H5H1A3=="), c("QzbzvxyB2yA-9m=="), c("ji1kacwmgG5bc=="), c("naamngiA3dA-16xtE-11C-9B1H-8sc==")].indexOf(d) < 0)) { e.ul = !1; break } }!0 === e.ul && i(), e.events.on("contentChanged", function() {!0 === e.ul && (o(a) || o(s)) && i() }), e.events.on("destroy", function() { a && a.length && a.remove() }, !0) } }
  }, e.extend(e.FE.DEFAULTS, { pastePlain: !1, pasteDeniedTags: ["colgroup", "col"], pasteDeniedAttrs: ["class", "id", "style"], pasteAllowedStyleProps: [], pasteAllowLocalImages: !1 }), e.FE.MODULES.paste = function(t) {
    var n, r, o, i;

    function a(e, n) { t.win.localStorage.setItem("fr-copied-html", e), t.win.localStorage.setItem("fr-copied-text", n) }

    function s(n) {
      var r = t.html.getSelected();
      a(r, e("<div>").html(r).text()), "cut" == n.type && (t.undo.saveStep(), setTimeout(function() { t.selection.save(), t.html.wrap(), t.selection.restore(), t.events.focus(), t.undo.saveStep() }, 0))
    }
    var l = !1;

    function d(i) {
      if (l) return !1;
      if (i.originalEvent && (i = i.originalEvent), !1 === t.events.trigger("paste.before", [i])) return i.preventDefault(), !1;
      if (t.$win.scrollTop(), i && i.clipboardData && i.clipboardData.getData) {
        var a = "",
          s = i.clipboardData.types;
        if (t.helpers.isArray(s))
          for (var d = 0; d < s.length; d++) a += s[d] + ";";
        else a = s;
        if (n = "", r = i.clipboardData.getData("text/rtf"), /text\/html/.test(a) ? n = i.clipboardData.getData("text/html") : /text\/rtf/.test(a) && t.browser.safari ? n = r : /text\/plain/.test(a) && !this.browser.mozilla && (n = t.html.escapeEntities(i.clipboardData.getData("text/plain")).replace(/\n/g, "<br>")), "" !== n) return f(), i.preventDefault && (i.stopPropagation(), i.preventDefault()), !1;
        n = null
      }
      return function() {
        t.selection.save(), t.events.disableBlur(), n = null, o ? o.html("") : (o = e('<div contenteditable="true" style="position: fixed; top: 0; left: -9999px; height: 100%; width: 0; word-break: break-all; overflow:hidden; z-index: 9999; line-height: 140%;" tabIndex="-1"></div>'), t.$sc.after(o), t.events.on("destroy", function() { o.remove() }));
        o.focus(), t.win.setTimeout(f, 1)
      }(), !1
    }

    function c(o) {
      if (o.originalEvent && (o = o.originalEvent), o && o.dataTransfer && o.dataTransfer.getData) {
        var i = "",
          a = o.dataTransfer.types;
        if (t.helpers.isArray(a))
          for (var s = 0; s < a.length; s++) i += a[s] + ";";
        else i = a;
        if (n = "", r = o.dataTransfer.getData("text/rtf"), /text\/html/.test(i) ? n = o.dataTransfer.getData("text/html") : /text\/rtf/.test(i) && t.browser.safari ? n = r : /text\/plain/.test(i) && !this.browser.mozilla && (n = t.html.escapeEntities(o.dataTransfer.getData("text/plain")).replace(/\n/g, "<br>")), "" !== n) { if (!1 !== t.markers.insertAtPoint(o)) { var l = t.el.querySelector(".fr-marker"); return e(l).replaceWith(e.FE.MARKERS), f(), o.preventDefault && (o.stopPropagation(), o.preventDefault()), !1 } } else n = null
      }
    }

    function f() {
      t.keys.forceUndo(), i = t.snapshot.get(), null === n && (n = o.get(0).innerHTML, t.selection.restore(), t.events.enableBlur());
      var e = n.match(/(class=\"?Mso|class=\'?Mso|class="?Xl|class='?Xl|class=Xl|style=\"[^\"]*\bmso\-|style=\'[^\']*\bmso\-|w:WordDocument)/gi),
        r = t.events.chainTrigger("paste.beforeCleanup", n);
      r && "string" == typeof r && (n = r), (!e || e && !1 !== t.events.trigger("paste.wordPaste", [n])) && p(n, e)
    }

    function p(n, r, o) {
      var a, s = null,
        l = null;
      n.toLowerCase().indexOf("<body") >= 0 && (n = (n = n.replace(/[.\s\S\w\W<>]*<body[^>]*>[\s]*([.\s\S\w\W<>]*)[\s]*<\/body>[.\s\S\w\W<>]*/gi, "$1")).replace(/([^>])\n([^<])/g, "$1 $2"));
      var d = !1;
      if (n.indexOf('id="docs-internal-guid') >= 0 && (n = n.replace(/^.* id="docs-internal-guid[^>]*>(.*)<\/b>.*$/, "$1"), d = !0), !r) {
        var c = t.opts.htmlAllowedStyleProps;
        t.opts.htmlAllowedStyleProps = t.opts.pasteAllowedStyleProps, t.opts.htmlAllowComments = !1, n = t.clean.html(n, t.opts.pasteDeniedTags, t.opts.pasteDeniedAttrs), t.opts.htmlAllowedStyleProps = c, t.opts.htmlAllowComments = !0, n = (n = u(n)).replace(/\r|\n|\t/g, "");
        var f = t.doc.createElement("div");
        f.innerHTML = n;
        var p = t.win.localStorage.getItem("fr-copied-html"),
          g = t.win.localStorage.getItem("fr-copied-text");
        g && f.textContent.replace(/(\u00A0)/gi, " ").replace(/\r|\n/gi, "") == g.replace(/(\u00A0)/gi, " ").replace(/(\r|\n)+([ ]+[\r\n]+)*/gi, " ") && (n = p), n = n.replace(/^ */g, "").replace(/ *$/g, "")
      }!r || t.wordPaste && o || (0 === (n = n.replace(/^\n*/g, "").replace(/^ /g, "")).indexOf("<colgroup>") && (n = "<table>" + n + "</table>"), n = u(n = function(e) {
        var n;
        e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = (e = e.replace(/<p(.*?)class="?'?MsoListParagraph"?'? ([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<ul><li>$3</li></ul>")).replace(/<p(.*?)class="?'?NumberedText"?'? ([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<ol><li>$3</li></ol>")).replace(/<p(.*?)class="?'?MsoListParagraphCxSpFirst"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<ul><li$3>$5</li>")).replace(/<p(.*?)class="?'?NumberedTextCxSpFirst"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<ol><li$3>$5</li>")).replace(/<p(.*?)class="?'?MsoListParagraphCxSpMiddle"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<li$3>$5</li>")).replace(/<p(.*?)class="?'?NumberedTextCxSpMiddle"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<li$3>$5</li>")).replace(/<p(.*?)class="?'?MsoListBullet"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<li$3>$5</li>")).replace(/<p(.*?)class="?'?MsoListParagraphCxSpLast"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<li$3>$5</li></ul>")).replace(/<p(.*?)class="?'?NumberedTextCxSpLast"?'?([\s\S]*?)(level\d)?([\s\S]*?)>([\s\S]*?)<\/p>/gi, "<li$3>$5</li></ol>")).replace(/<span([^<]*?)style="?'?mso-list:Ignore"?'?([\s\S]*?)>([\s\S]*?)<span/gi, "<span><span")).replace(/<!--\[if \!supportLists\]-->([\s\S]*?)<!--\[endif\]-->/gi, "")).replace(/<!\[if \!supportLists\]>([\s\S]*?)<!\[endif\]>/gi, "")).replace(/(\n|\r| class=(")?Mso[a-zA-Z0-9]+(")?)/gi, " ")).replace(/<!--[\s\S]*?-->/gi, "")).replace(/<(\/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>/gi, "");
        var r, o = ["style", "script", "applet", "embed", "noframes", "noscript"];
        for (n = 0; n < o.length; n++) {
          var i = new RegExp("<" + o[n] + ".*?" + o[n] + "(.*?)>", "gi");
          e = e.replace(i, "")
        }
        e = (e = (e = e.replace(/&nbsp;/gi, " ")).replace(/<td([^>]*)><\/td>/g, "<td$1><br></td>")).replace(/<th([^>]*)><\/th>/g, "<th$1><br></th>");
        do { r = e, e = e.replace(/<[^\/>][^>]*><\/[^>]+>/gi, "") } while (e != r);
        e = (e = e.replace(/<lilevel([^1])([^>]*)>/gi, '<li data-indent="true"$2>')).replace(/<lilevel1([^>]*)>/gi, "<li$1>"), e = (e = (e = t.clean.html(e, t.opts.pasteDeniedTags, t.opts.pasteDeniedAttrs)).replace(/<a>(.[^<]+)<\/a>/gi, "$1")).replace(/<br> */g, "<br>");
        var a = t.o_doc.createElement("div");
        a.innerHTML = e;
        var s = a.querySelectorAll("li[data-indent]");
        for (n = 0; n < s.length; n++) {
          var l = s[n],
            d = l.previousElementSibling;
          if (d && "LI" == d.tagName) {
            var c = d.querySelector(":scope > ul, :scope > ol");
            c || (c = document.createElement("ul"), d.appendChild(c)), c.appendChild(l)
          } else l.removeAttribute("data-indent")
        }
        return t.html.cleanBlankSpaces(a), e = a.innerHTML
      }(n))), t.opts.pastePlain && (n = function(e) {
        var n, r = null,
          o = t.doc.createElement("div");
        o.innerHTML = e;
        var i = o.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, pre, blockquote");
        for (n = 0; n < i.length; n++)(r = i[n]).outerHTML = "<" + (t.html.defaultTag() || "DIV") + ">" + r.innerHTML + "</" + (t.html.defaultTag() || "DIV") + ">";
        for (n = (i = o.querySelectorAll("*:not(" + "p, div, h1, h2, h3, h4, h5, h6, pre, blockquote, ul, ol, li, table, tbody, thead, tr, td, br, img".split(",").join("):not(") + ")")).length - 1; n >= 0; n--)(r = i[n]).outerHTML = r.innerHTML;
        var a = function(e) { for (var n = t.node.contents(e), r = 0; r < n.length; r++) n[r].nodeType != Node.TEXT_NODE && n[r].nodeType != Node.ELEMENT_NODE ? n[r].parentNode.removeChild(n[r]) : a(n[r]) };
        return a(o), o.innerHTML
      }(n));
      var h = t.events.chainTrigger("paste.afterCleanup", n);
      if ("string" == typeof h && (n = h), "" !== n) {
        var m = t.o_doc.createElement("div");
        m.innerHTML = n, t.spaces.normalize(m);
        var v = m.getElementsByTagName("span");
        for (a = v.length - 1; a >= 0; a--) {
          var E = v[a];
          0 === E.attributes.length && (E.outerHTML = E.innerHTML)
        }
        var b = t.selection.element(),
          S = !1;
        if (b && e(b).parentsUntil(t.el, "ul, ol").length && (S = !0), S) {
          var T = m.children;
          1 == T.length && ["OL", "UL"].indexOf(T[0].tagName) >= 0 && (T[0].outerHTML = T[0].innerHTML)
        }
        if (!d) {
          var y = m.getElementsByTagName("br");
          for (a = y.length - 1; a >= 0; a--) {
            var N = y[a];
            t.node.isBlock(N.previousSibling) && N.parentNode.removeChild(N)
          }
        }
        if (t.opts.enter == e.FE.ENTER_BR)
          for (a = (s = m.querySelectorAll("p, div")).length - 1; a >= 0; a--) 0 === (l = s[a]).attributes.length && (l.outerHTML = l.innerHTML + (l.nextSibling && !t.node.isEmpty(l) ? "<br>" : ""));
        else if (t.opts.enter == e.FE.ENTER_DIV)
          for (a = (s = m.getElementsByTagName("p")).length - 1; a >= 0; a--)(l = s[a]).outerHTML = "<div>" + l.innerHTML + "</div>";
        n = m.innerHTML, t.html.insert(n, !0)
      }
      t.events.trigger("paste.after"), t.undo.saveStep(i), t.undo.saveStep()
    }

    function u(e) {
      var n, r = t.o_doc.createElement("div");
      r.innerHTML = e;
      for (var o = r.querySelectorAll("*:empty:not(br):not(img):not(td):not(th)"); o.length;) {
        for (n = 0; n < o.length; n++) o[n].parentNode.removeChild(o[n]);
        o = r.querySelectorAll("*:empty:not(br):not(img):not(td):not(th)")
      }
      for (var i = r.querySelectorAll(":scope > div:not([style]), td > div:not([style]), th > div:not([style]), li > div:not([style])"); i.length;) {
        var a = i[i.length - 1];
        if (t.html.defaultTag() && "div" != t.html.defaultTag()) a.querySelector(t.html.blockTagsQuery()) ? a.outerHTML = a.innerHTML : a.outerHTML = "<" + t.html.defaultTag() + ">" + a.innerHTML + "</" + t.html.defaultTag() + ">";
        else { var s = a.querySelectorAll("*");!s.length || "BR" !== s[s.length - 1].tagName && 0 === a.innerText.length ? a.outerHTML = a.innerHTML + "<br>" : a.outerHTML = a.innerHTML }
        i = r.querySelectorAll(":scope > div:not([style]), td > div:not([style]), th > div:not([style]), li > div:not([style])")
      }
      for (i = r.querySelectorAll("div:not([style])"); i.length;) {
        for (n = 0; n < i.length; n++) {
          var l = i[n],
            d = l.innerHTML.replace(/\u0009/gi, "").trim();
          l.outerHTML = d
        }
        i = r.querySelectorAll("div:not([style])")
      }
      return r.innerHTML
    }
    return { _init: function() { t.events.on("copy", s), t.events.on("cut", s), t.events.on("paste", d), t.events.on("drop", c), t.browser.msie && t.browser.version < 11 && (t.events.on("mouseup", function(e) { 2 == e.button && (setTimeout(function() { l = !1 }, 50), l = !0) }, !0), t.events.on("beforepaste", d)) }, removeEmptyTags: u, getRtfClipboard: function() { return r }, saveCopiedText: a, clean: p }
  }, e.extend(e.FE.DEFAULTS, { shortcutsEnabled: [], shortcutsHint: !0 }), e.FE.SHORTCUTS_MAP = {}, e.FE.RegisterShortcut = function(t, n, r, o, i, a) { e.FE.SHORTCUTS_MAP[(i ? "^" : "") + (a ? "@" : "") + t] = { cmd: n, val: r, letter: o, shift: i, option: a }, e.FE.DEFAULTS.shortcutsEnabled.push(n) }, e.FE.RegisterShortcut(e.FE.KEYCODE.E, "show", null, "E", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.B, "bold", null, "B", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.I, "italic", null, "I", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.U, "underline", null, "U", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.S, "strikeThrough", null, "S", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.CLOSE_SQUARE_BRACKET, "indent", null, "]", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.OPEN_SQUARE_BRACKET, "outdent", null, "[", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.Z, "undo", null, "Z", !1, !1), e.FE.RegisterShortcut(e.FE.KEYCODE.Z, "redo", null, "Z", !0, !1), e.FE.MODULES.shortcuts = function(t) {
    var n = null;
    var r = !1;

    function o(n) {
      if (!t.core.hasFocus()) return !0;
      var o = n.which,
        i = -1 != navigator.userAgent.indexOf("Mac OS X") ? n.metaKey : n.ctrlKey;
      if ("keyup" == n.type && r && o != e.FE.KEYCODE.META) return r = !1, !1;
      "keydown" == n.type && (r = !1);
      var a = (n.shiftKey ? "^" : "") + (n.altKey ? "@" : "") + o;
      if (i && e.FE.SHORTCUTS_MAP[a]) { var s = e.FE.SHORTCUTS_MAP[a].cmd; if (s && t.opts.shortcutsEnabled.indexOf(s) >= 0) { var l, d = e.FE.SHORTCUTS_MAP[a].val; if (s && !d ? l = t.$tb.find('.fr-command[data-cmd="' + s + '"]') : s && d && (l = t.$tb.find('.fr-command[data-cmd="' + s + '"][data-param1="' + d + '"]')), l.length) return n.preventDefault(), n.stopPropagation(), l.parents(".fr-toolbar").data("instance", t), "keydown" == n.type && (t.button.exec(l), r = !0), !1; if (s && t.commands[s]) return n.preventDefault(), n.stopPropagation(), "keydown" == n.type && (t.commands[s](), r = !0), !1 } }
    }
    return {
      _init: function() { t.events.on("keydown", o, !0), t.events.on("keyup", o, !0) },
      get: function(r) {
        if (!t.opts.shortcutsHint) return null;
        if (!n)
          for (var o in n = {}, e.FE.SHORTCUTS_MAP) e.FE.SHORTCUTS_MAP.hasOwnProperty(o) && t.opts.shortcutsEnabled.indexOf(e.FE.SHORTCUTS_MAP[o].cmd) >= 0 && (n[e.FE.SHORTCUTS_MAP[o].cmd + "." + (e.FE.SHORTCUTS_MAP[o].val || "")] = { shift: e.FE.SHORTCUTS_MAP[o].shift, option: e.FE.SHORTCUTS_MAP[o].option, letter: e.FE.SHORTCUTS_MAP[o].letter });
        var i = n[r];
        return i ? (t.helpers.isMac() ? String.fromCharCode(8984) : "Ctrl+") + (i.shift ? t.helpers.isMac() ? String.fromCharCode(8679) : "Shift+" : "") + (i.option ? t.helpers.isMac() ? String.fromCharCode(8997) : "Alt+" : "") + i.letter : null
      }
    }
  }, e.FE.MODULES.snapshot = function(e) {
    function t(e) {
      for (var t = e.parentNode.childNodes, n = 0, r = null, o = 0; o < t.length; o++) {
        if (r) {
          var i = t[o].nodeType === Node.TEXT_NODE && "" === t[o].textContent,
            a = r.nodeType === Node.TEXT_NODE && t[o].nodeType === Node.TEXT_NODE;
          i || a || n++
        }
        if (t[o] == e) return n;
        r = t[o]
      }
    }

    function n(n) { var r = []; if (!n.parentNode) return []; for (; !e.node.isElement(n);) r.push(t(n)), n = n.parentNode; return r.reverse() }

    function r(e, t) {
      for (; e && e.nodeType === Node.TEXT_NODE;) {
        var n = e.previousSibling;
        n && n.nodeType == Node.TEXT_NODE && (t += n.textContent.length), e = n
      }
      return t
    }

    function o(t) { for (var n = e.el, r = 0; r < t.length; r++) n = n.childNodes[t[r]]; return n }

    function i(t, n) {
      try {
        var r = o(n.scLoc),
          i = n.scOffset,
          a = o(n.ecLoc),
          s = n.ecOffset,
          l = e.doc.createRange();
        l.setStart(r, i), l.setEnd(a, s), t.addRange(l)
      } catch (e) { console.warn(e) }
    }
    return {
      get: function() {
        var t, o = {};
        if (e.events.trigger("snapshot.before"), o.html = (e.$wp ? e.$el.html() : e.$oel.get(0).outerHTML).replace(/ style=""/g, ""), o.ranges = [], e.$wp && e.selection.inEditor() && e.core.hasFocus())
          for (var i = e.selection.ranges(), a = 0; a < i.length; a++) o.ranges.push({ scLoc: n((t = i[a]).startContainer), scOffset: r(t.startContainer, t.startOffset), ecLoc: n(t.endContainer), ecOffset: r(t.endContainer, t.endOffset) });
        return e.events.trigger("snapshot.after"), o
      },
      restore: function(t) {
        e.$el.html() != t.html && e.$el.html(t.html);
        var n = e.selection.get();
        e.selection.clear(), e.events.focus(!0);
        for (var r = 0; r < t.ranges.length; r++) i(n, t.ranges[r])
      },
      equal: function(t, n) { return t.html == n.html && (!e.core.hasFocus() || JSON.stringify(t.ranges) == JSON.stringify(n.ranges)) }
    }
  }, e.FE.MODULES.undo = function(e) {
    function t(t) {
      var n = t.which;
      e.keys.ctrlKey(t) && (90 == n && t.shiftKey && t.preventDefault(), 90 == n && t.preventDefault())
    }
    var n = null;

    function r() { if (!e.undo_stack || e.undoing) return !1; for (; e.undo_stack.length > e.undo_index;) e.undo_stack.pop() }

    function o() { e.undo_index = 0, e.undo_stack = [] }

    function i() { e.undo_stack = [] }
    return {
      _init: function() { o(), e.events.on("initialized", function() { n = (e.$wp ? e.$el.html() : e.$oel.get(0).outerHTML).replace(/ style=""/g, "") }), e.events.on("blur", function() { e.el.querySelector(".fr-dragging") || e.undo.saveStep() }), e.events.on("keydown", t), e.events.on("destroy", i) },
      run: function() {
        if (e.undo_index > 1) {
          e.undoing = !0;
          var t = e.undo_stack[--e.undo_index - 1];
          clearTimeout(e._content_changed_timer), e.snapshot.restore(t), n = t.html, e.popups.hideAll(), e.toolbar.enable(), e.events.trigger("contentChanged"), e.events.trigger("commands.undo"), e.undoing = !1
        }
      },
      redo: function() {
        if (e.undo_index < e.undo_stack.length) {
          e.undoing = !0;
          var t = e.undo_stack[e.undo_index++];
          clearTimeout(e._content_changed_timer), e.snapshot.restore(t), n = t.html, e.popups.hideAll(), e.toolbar.enable(), e.events.trigger("contentChanged"), e.events.trigger("commands.redo"), e.undoing = !1
        }
      },
      canDo: function() { return !(0 === e.undo_stack.length || e.undo_index <= 1) },
      canRedo: function() { return e.undo_index != e.undo_stack.length },
      dropRedo: r,
      reset: o,
      saveStep: function(t) {
        if (!e.undo_stack || e.undoing || e.el.querySelector(".fr-marker")) return !1;
        void 0 === t ? (t = e.snapshot.get(), e.undo_stack[e.undo_index - 1] && e.snapshot.equal(e.undo_stack[e.undo_index - 1], t) || (r(), e.undo_stack.push(t), e.undo_index++, t.html != n && (e.events.trigger("contentChanged"), n = t.html))) : (r(), e.undo_index > 0 ? e.undo_stack[e.undo_index - 1] = t : (e.undo_stack.push(t), e.undo_index++))
      }
    }
  }, e.FE.ICON_DEFAULT_TEMPLATE = "font_awesome", e.FE.ICON_TEMPLATES = { font_awesome: '<i class="fa fa-[NAME]" aria-hidden="true"></i>', text: '<span style="text-align: center;">[NAME]</span>', image: "<img src=[SRC] alt=[ALT] />", svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">[PATH]</svg>' }, e.FE.ICONS = { bold: { NAME: "bold" }, italic: { NAME: "italic" }, underline: { NAME: "underline" }, strikeThrough: { NAME: "strikethrough" }, subscript: { NAME: "subscript" }, superscript: { NAME: "superscript" }, color: { NAME: "tint" }, outdent: { NAME: "outdent" }, indent: { NAME: "indent" }, undo: { NAME: "rotate-left" }, redo: { NAME: "rotate-right" }, insertHR: { NAME: "minus" }, clearFormatting: { NAME: "eraser" }, selectAll: { NAME: "mouse-pointer" } }, e.FE.DefineIconTemplate = function(t, n) { e.FE.ICON_TEMPLATES[t] = n }, e.FE.DefineIcon = function(t, n) { e.FE.ICONS[t] = n }, e.FE.MODULES.icon = function() {
    return {
      create: function(t) {
        var n = null,
          r = e.FE.ICONS[t];
        if (void 0 !== r) {
          var o = r.template || e.FE.ICON_DEFAULT_TEMPLATE;
          o && (o = e.FE.ICON_TEMPLATES[o]) && (n = o.replace(/\[([a-zA-Z]*)\]/g, function(e, n) { return "NAME" == n ? r[n] || t : r[n] }))
        }
        return n || t
      },
      getTemplate: function(t) {
        var n = e.FE.ICONS[t],
          r = e.FE.ICON_DEFAULT_TEMPLATE;
        return void 0 !== n ? r = n.template || e.FE.ICON_DEFAULT_TEMPLATE : r
      }
    }
  }, e.extend(e.FE.DEFAULTS, { tooltips: !0 }), e.FE.MODULES.tooltip = function(t) {
    function n() { t.$tooltip && t.$tooltip.removeClass("fr-visible").css("left", "-3000px").css("position", "fixed") }

    function r(n, r) {
      if (n.data("title") || n.data("title", n.attr("title")), !n.data("title")) return !1;
      t.$tooltip || t.opts.tooltips && !t.helpers.isMobile() && (t.shared.$tooltip ? t.$tooltip = t.shared.$tooltip : (t.shared.$tooltip = e('<div class="fr-tooltip"></div>'), t.$tooltip = t.shared.$tooltip, t.opts.theme && t.$tooltip.addClass(t.opts.theme + "-theme"), e(t.o_doc).find("body:first").append(t.$tooltip)), t.events.on("shared.destroy", function() { t.$tooltip.html("").removeData().remove(), t.$tooltip = null }, !0)), n.removeAttr("title"), t.$tooltip.text(t.language.translate(n.data("title"))), t.$tooltip.addClass("fr-visible");
      var o = n.offset().left + (n.outerWidth() - t.$tooltip.outerWidth()) / 2;
      o < 0 && (o = 0), o + t.$tooltip.outerWidth() > e(t.o_win).width() && (o = e(t.o_win).width() - t.$tooltip.outerWidth()), void 0 === r && (r = t.opts.toolbarBottom);
      var i = r ? n.offset().top - t.$tooltip.height() : n.offset().top + n.outerHeight();
      t.$tooltip.css("position", ""), t.$tooltip.css("left", o), t.$tooltip.css("top", Math.ceil(i)), "static" != e(t.o_doc).find("body:first").css("position") ? (t.$tooltip.css("margin-left", -e(t.o_doc).find("body:first").offset().left), t.$tooltip.css("margin-top", -e(t.o_doc).find("body:first").offset().top)) : (t.$tooltip.css("margin-left", ""), t.$tooltip.css("margin-top", ""))
    }
    return { hide: n, to: r, bind: function(o, i, a) { t.opts.tooltips && !t.helpers.isMobile() && (t.events.$on(o, "mouseenter", i, function(n) { t.node.hasClass(n.currentTarget, "fr-disabled") || t.edit.isDisabled() || r(e(n.currentTarget), a) }, !0), t.events.$on(o, "mouseleave " + t._mousedown + " " + t._mouseup, i, function() { n() }, !0)) } }
  }, e.FE.MODULES.button = function(t) {
    var n = [];
    (t.opts.toolbarInline || t.opts.toolbarContainer) && (t.shared.buttons || (t.shared.buttons = []), n = t.shared.buttons);
    var r = [];

    function o(t, n, r) {
      for (var o = e(), i = 0; i < t.length; i++) {
        var a = e(t[i]);
        if (a.is(n) && (o = o.add(a)), r && a.is(".fr-dropdown")) {
          var s = a.next().find(n);
          o = o.add(s)
        }
      }
      return o
    }

    function i(i, a) {
      var s, l = e();
      if (!i) return l;
      for (s in l = (l = l.add(o(n, i, a))).add(o(r, i, a)), t.shared.popups)
        if (t.shared.popups.hasOwnProperty(s)) {
          var d = t.shared.popups[s].children().find(i);
          l = l.add(d)
        }
      for (s in t.shared.modals)
        if (t.shared.modals.hasOwnProperty(s)) {
          var c = t.shared.modals[s].$modal.find(i);
          l = l.add(c)
        }
      return l
    }

    function a(e) {
      e.addClass("fr-blink"), setTimeout(function() { e.removeClass("fr-blink") }, 500);
      for (var t = e.data("cmd"), n = []; void 0 !== e.data("param" + (n.length + 1));) n.push(e.data("param" + (n.length + 1)));
      var r = i(".fr-dropdown.fr-active");
      r.length && (r.removeClass("fr-active").attr("aria-expanded", !1).next().attr("aria-hidden", !0), r.parent(".fr-toolbar:not(.fr-inline)").css("zIndex", "")), e.parents(".fr-popup, .fr-toolbar").data("instance").commands.exec(t, n)
    }

    function s(n) {
      var r = n.parents(".fr-popup, .fr-toolbar").data("instance");
      if (0 !== n.parents(".fr-popup").length || n.data("popup") || r.popups.hideAll(), r.popups.areVisible() && !r.popups.areVisible(r)) {
        for (var o = 0; o < e.FE.INSTANCES.length; o++) e.FE.INSTANCES[o] != r && e.FE.INSTANCES[o].popups && e.FE.INSTANCES[o].popups.areVisible() && e.FE.INSTANCES[o].$el.find(".fr-marker").remove();
        r.popups.hideAll()
      }
      t.node.hasClass(n.get(0), "fr-dropdown") ? function(n) {
        var r = n.next(),
          o = t.node.hasClass(n.get(0), "fr-active"),
          a = i(".fr-dropdown.fr-active").not(n),
          s = n.parents(".fr-toolbar, .fr-popup").data("instance") || t;
        if (s.helpers.isIOS() && !s.el.querySelector(".fr-marker") && (s.selection.save(), s.selection.clear(), s.selection.restore()), !o) {
          var l = n.data("cmd");
          r.find(".fr-command").removeClass("fr-active").attr("aria-selected", !1), e.FE.COMMANDS[l] && e.FE.COMMANDS[l].refreshOnShow && e.FE.COMMANDS[l].refreshOnShow.apply(s, [n, r]), r.css("left", n.offset().left - n.parent().offset().left - ("rtl" == t.opts.direction ? r.width() - n.outerWidth() : 0)), t.opts.toolbarBottom ? r.css("bottom", t.$tb.height() - n.position().top) : r.css("top", n.position().top + n.outerHeight())
        }
        n.addClass("fr-blink").toggleClass("fr-active"), n.hasClass("fr-active") ? (r.attr("aria-hidden", !1), n.attr("aria-expanded", !0)) : (r.attr("aria-hidden", !0), n.attr("aria-expanded", !1)), setTimeout(function() { n.removeClass("fr-blink") }, 300), r.css("margin-left", ""), r.offset().left + r.outerWidth() > t.$sc.offset().left + t.$sc.width() && r.css("margin-left", -(r.offset().left + r.outerWidth() - t.$sc.offset().left - t.$sc.width())), a.removeClass("fr-active").attr("aria-expanded", !1).next().attr("aria-hidden", !0), a.parent(".fr-toolbar:not(.fr-inline)").css("zIndex", ""), 0 !== n.parents(".fr-popup").length || t.opts.toolbarInline || (t.node.hasClass(n.get(0), "fr-active") ? t.$tb.css("zIndex", (t.opts.zIndex || 1) + 4) : t.$tb.css("zIndex", ""));
        var d = r.find("a.fr-command.fr-active:first");
        t.helpers.isMobile() || (d.length ? t.accessibility.focusToolbarElement(d) : t.accessibility.focusToolbarElement(n))
      }(n) : (! function(e) { a(e) }(n), e.FE.COMMANDS[n.data("cmd")] && !1 !== e.FE.COMMANDS[n.data("cmd")].refreshAfterCallback && r.button.bulkRefresh())
    }

    function l(t) { s(e(t.currentTarget)) }

    function d(e) {
      var t = e.find(".fr-dropdown.fr-active");
      t.length && (t.removeClass("fr-active").attr("aria-expanded", !1).next().attr("aria-hidden", !0), t.parent(".fr-toolbar:not(.fr-inline)").css("zIndex", ""))
    }

    function c(e) { e.preventDefault(), e.stopPropagation() }

    function f(e) { if (e.stopPropagation(), !t.helpers.isMobile()) return !1 }

    function p(e, n, r) {
      if (t.helpers.isMobile() && !1 === n.showOnMobile) return "";
      var o, i = n.displaySelection;
      if ("function" == typeof i && (i = i(t)), i) {
        var a = "function" == typeof n.defaultSelection ? n.defaultSelection(t) : n.defaultSelection;
        o = '<span style="width:' + (n.displaySelectionWidth || 100) + 'px">' + (a || t.language.translate(n.title)) + "</span>"
      } else o = t.icon.create(n.icon || e), o += '<span class="fr-sr-only">' + (t.language.translate(n.title) || "") + "</span>";
      var s = n.popup ? ' data-popup="true"' : "",
        l = n.modal ? ' data-modal="true"' : "",
        d = t.shortcuts.get(e + ".");
      d = d ? " (" + d + ")" : "";
      var c = e + "-" + t.id,
        f = "dropdown-menu-" + c,
        p = '<button id="' + c + '"type="button" tabIndex="-1" role="button"' + (n.toggle ? ' aria-pressed="false"' : "") + ("dropdown" == n.type ? ' aria-controls="' + f + '" aria-expanded="false" aria-haspopup="true"' : "") + (n.disabled ? ' aria-disabled="true"' : "") + ' title="' + (t.language.translate(n.title) || "") + d + '" class="fr-command fr-btn' + ("dropdown" == n.type ? " fr-dropdown" : "") + " fr-btn-" + t.icon.getTemplate(n.icon) + (n.displaySelection ? " fr-selection" : "") + (n.back ? " fr-back" : "") + (n.disabled ? " fr-disabled" : "") + (r ? "" : " fr-hidden") + '" data-cmd="' + e + '"' + s + l + ">" + o + "</button>";
      if ("dropdown" == n.type) {
        var u = '<div id="' + f + '" class="fr-dropdown-menu" role="listbox" aria-labelledby="' + c + '" aria-hidden="true"><div class="fr-dropdown-wrapper" role="presentation"><div class="fr-dropdown-content" role="presentation">';
        u += function(e, n) {
          var r = "";
          if (n.html) "function" == typeof n.html ? r += n.html.call(t) : r += n.html;
          else {
            var o = n.options;
            for (var i in "function" == typeof o && (o = o()), r += '<ul class="fr-dropdown-list" role="presentation">', o)
              if (o.hasOwnProperty(i)) {
                var a = t.shortcuts.get(e + "." + i);
                a = a ? '<span class="fr-shortcut">' + a + "</span>" : "", r += '<li role="presentation"><a class="fr-command" tabIndex="-1" role="option" data-cmd="' + e + '" data-param1="' + i + '" title="' + o[i] + '">' + t.language.translate(o[i]) + "</a></li>"
              }
            r += "</ul>"
          }
          return r
        }(e, n), p += u += "</div></div></div>"
      }
      return p
    }

    function u(n) {
      var r = t.$tb && t.$tb.data("instance") || t;
      if (!1 === t.events.trigger("buttons.refresh")) return !0;
      setTimeout(function() {
        for (var o = r.selection.inEditor() && r.core.hasFocus(), i = 0; i < n.length; i++) {
          var a = e(n[i]),
            s = a.data("cmd");
          0 === a.parents(".fr-popup").length ? o || e.FE.COMMANDS[s] && e.FE.COMMANDS[s].forcedRefresh ? r.button.refresh(a) : t.node.hasClass(a.get(0), "fr-dropdown") || (a.removeClass("fr-active"), a.attr("aria-pressed") && a.attr("aria-pressed", !1)) : a.parents(".fr-popup").is(":visible") && r.button.refresh(a)
        }
      }, 0)
    }

    function g() { u(n), u(r) }

    function h() { n = [], r = [] }
    return t.shared.popup_buttons || (t.shared.popup_buttons = []), r = t.shared.popup_buttons, {
      _init: function() { t.opts.toolbarInline ? t.events.on("toolbar.show", g) : (t.events.on("mouseup", g), t.events.on("keyup", g), t.events.on("blur", g), t.events.on("focus", g), t.events.on("contentChanged", g), t.helpers.isMobile() && t.events.$on(t.$doc, "selectionchange", g)), t.events.on("shared.destroy", h) },
      buildList: function(n, r) {
        for (var o = "", i = 0; i < n.length; i++) {
          var a = n[i],
            s = e.FE.COMMANDS[a];
          s && void 0 !== s.plugin && t.opts.pluginsEnabled.indexOf(s.plugin) < 0 || (s ? o += p(a, s, void 0 === r || r.indexOf(a) >= 0) : "|" == a ? o += '<div class="fr-separator fr-vs" role="separator" aria-orientation="vertical"></div>' : "-" == a && (o += '<div class="fr-separator fr-hs" role="separator" aria-orientation="horizontal"></div>'))
        }
        return o
      },
      bindCommands: function(o, i) {
        t.events.bindClick(o, ".fr-command:not(.fr-disabled)", l), t.events.$on(o, t._mousedown + " " + t._mouseup + " " + t._move, ".fr-dropdown-menu", c, !0), t.events.$on(o, t._mousedown + " " + t._mouseup + " " + t._move, ".fr-dropdown-menu .fr-dropdown-wrapper", f, !0);
        var a = o.get(0).ownerDocument,
          s = "defaultView" in a ? a.defaultView : a.parentWindow,
          p = function(n) {
            (!n || n.type == t._mouseup && n.target != e("html").get(0) || "keydown" == n.type && (t.keys.isCharacter(n.which) && !t.keys.ctrlKey(n) || n.which == e.FE.KEYCODE.ESC)) && d(o)
          };
        t.events.$on(e(s), t._mouseup + " resize keydown", p, !0), t.opts.iframe && t.events.$on(t.$win, t._mouseup, p, !0), t.node.hasClass(o.get(0), "fr-popup") ? e.merge(r, o.find(".fr-btn").toArray()) : e.merge(n, o.find(".fr-btn").toArray()), t.tooltip.bind(o, ".fr-btn, .fr-title", i)
      },
      refresh: function(n) {
        var r, o = n.parents(".fr-popup, .fr-toolbar").data("instance") || t,
          i = n.data("cmd");
        t.node.hasClass(n.get(0), "fr-dropdown") ? r = n.next() : (n.removeClass("fr-active"), n.attr("aria-pressed") && n.attr("aria-pressed", !1)), e.FE.COMMANDS[i] && e.FE.COMMANDS[i].refresh ? e.FE.COMMANDS[i].refresh.apply(o, [n, r]) : t.refresh[i] && o.refresh[i](n, r)
      },
      bulkRefresh: g,
      exec: a,
      click: s,
      hideActiveDropdowns: d,
      getButtons: i
    }
  }, e.FE.MODULES.modals = function(t) {
    t.shared.modals || (t.shared.modals = {});
    var n, r = t.shared.modals;

    function o() {
      for (var e in r) {
        var t = r[e];
        t && t.$modal && t.$modal.removeData().remove()
      }
      n && n.removeData().remove(), r = {}
    }

    function i(o, i) {
      if (r[o]) {
        var a = r[o].$modal,
          s = a.data("instance") || t;
        s.events.enableBlur(), a.hide(), n.hide(), e(s.o_doc).find("body:first").removeClass("prevent-scroll fr-mobile"), a.removeClass("fr-active"), i || (t.accessibility.restoreSelection(s), t.events.trigger("modals.hide"))
      }
    }

    function a(e) {
      var n;
      if ("string" == typeof e) {
        if (!r[e]) return;
        n = r[e].$modal
      } else n = e;
      return n && t.node.hasClass(n, "fr-active") && t.core.sameInstance(n) || !1
    }
    return {
      _init: function() { t.events.on("shared.destroy", o, !0) },
      get: function(e) { return r[e] },
      create: function(o, a, s) {
        if (t.shared.$overlay || (t.shared.$overlay = e('<div class="fr-overlay">').appendTo("body:first")), n = t.shared.$overlay, t.opts.theme && n.addClass(t.opts.theme + "-theme"), !r[o]) {
          var l = function(n, r) { var o = '<div tabIndex="-1" class="fr-modal' + (t.opts.theme ? " " + t.opts.theme + "-theme" : "") + '"><div class="fr-modal-wrapper">'; return o += '<div class="fr-modal-head">' + n + '<i title="' + t.language.translate("Cancel") + '" class="fa fa-times fr-modal-close"></i></div>', o += '<div tabIndex="-1" class="fr-modal-body">' + r + "</div>", e(o += "</div></div>") }(a, s);
          r[o] = { $modal: l, $head: l.find(".fr-modal-head"), $body: l.find(".fr-modal-body") }, t.helpers.isMobile() || l.addClass("fr-desktop"), l.appendTo("body:first"), t.events.bindClick(l, "i.fr-modal-close", function() { i(o) }), r[o].$body.css("margin-top", r[o].$head.outerHeight()), t.events.$on(l, "keydown", function(n) { var r = n.which; return r == e.FE.KEYCODE.ESC ? (i(o), t.accessibility.focusModalButton(l), !1) : !(!e(n.currentTarget).is("input[type=text], textarea") && r != e.FE.KEYCODE.ARROW_UP && r != e.FE.KEYCODE.ARROW_DOWN && !t.keys.isBrowserAction(n) && (n.preventDefault(), n.stopPropagation(), 1)) }, !0), i(o, !0)
        }
        return r[o]
      },
      show: function(o) {
        if (r[o]) {
          var i = r[o].$modal;
          i.data("instance", t), i.show(), n.show(), e(t.o_doc).find("body:first").addClass("prevent-scroll"), t.helpers.isMobile() && e(t.o_doc).find("body:first").addClass("fr-mobile"), i.addClass("fr-active"), t.accessibility.focusModal(i)
        }
      },
      hide: i,
      resize: function(n) {
        if (r[n]) {
          var o = r[n],
            i = o.$modal,
            a = o.$body,
            s = e(t.o_win).height(),
            l = i.find(".fr-modal-wrapper"),
            d = s - l.outerHeight(!0) + (l.height() - (a.outerHeight(!0) - a.height())),
            c = "auto";
          a.get(0).scrollHeight > d && (c = d), a.height(c)
        }
      },
      isVisible: a,
      areVisible: function(e) {
        for (var t in r)
          if (r.hasOwnProperty(t) && a(t) && (void 0 === e || r[t].$modal.data("instance") == e)) return r[t].$modal;
        return !1
      }
    }
  }, e.FE.POPUP_TEMPLATES = { "text.edit": "[_EDIT_]" }, e.FE.RegisterTemplate = function(t, n) { e.FE.POPUP_TEMPLATES[t] = n }, e.FE.MODULES.popups = function(t) {
    t.shared.popups || (t.shared.popups = {});
    var n = t.shared.popups;

    function r(e, r) { r.is(":visible") || (r = t.$sc), r.is(n[e].data("container")) || (n[e].data("container", r), r.append(n[e])) }

    function o(e) { return n[e] && t.node.hasClass(n[e], "fr-active") && t.core.sameInstance(n[e]) || !1 }

    function i(e) {
      for (var t in n)
        if (n.hasOwnProperty(t) && o(t) && (void 0 === e || n[t].data("instance") == e)) return n[t];
      return !1
    }

    function a(e) {
      var r = null;
      (r = "string" != typeof e ? e : n[e]) && t.node.hasClass(r, "fr-active") && (r.removeClass("fr-active fr-above"), t.events.trigger("popups.hide." + e), t.$tb && (t.opts.zIndex > 1 ? t.$tb.css("zIndex", t.opts.zIndex + 1) : t.$tb.css("zIndex", "")), t.events.disableBlur(), r.find("input, textarea, button").filter(":focus").blur(), r.find("input, textarea").attr("disabled", "disabled"))
    }

    function s(e) { for (var t in void 0 === e && (e = []), n) n.hasOwnProperty(t) && e.indexOf(t) < 0 && a(t) }

    function l() { t.shared.exit_flag = !0 }

    function d() { t.shared.exit_flag = !1 }

    function c() { return t.shared.exit_flag }

    function f(r, o) {
      var i = function(n, r) { var o = e.FE.POPUP_TEMPLATES[n]; for (var i in "function" == typeof o && (o = o.apply(t)), r) r.hasOwnProperty(i) && (o = o.replace("[_" + i.toUpperCase() + "_]", r[i])); return o }(r, o),
        a = e('<div class="fr-popup' + (t.helpers.isMobile() ? " fr-mobile" : " fr-desktop") + (t.opts.toolbarInline ? " fr-inline" : "") + '"><span class="fr-arrow"></span>' + i + "</div>");
      t.opts.theme && a.addClass(t.opts.theme + "-theme"), t.opts.zIndex > 1 && t.$tb.css("z-index", t.opts.zIndex + 2), "auto" != t.opts.direction && a.removeClass("fr-ltr fr-rtl").addClass("fr-" + t.opts.direction), a.find("input, textarea").attr("dir", t.opts.direction).attr("disabled", "disabled");
      var s = e("body:first");
      return s.append(a), a.data("container", s), n[r] = a, t.button.bindCommands(a, !1), a
    }

    function p(r) {
      var i = n[r];
      return {
        _windowResize: function() { var e = i.data("instance") || t;!e.helpers.isMobile() && i.is(":visible") && (e.events.disableBlur(), e.popups.hide(r), e.events.enableBlur()) },
        _inputFocus: function(n) {
          var r = i.data("instance") || t,
            o = e(n.currentTarget);
          if (o.is("input:file") && o.closest(".fr-layer").addClass("fr-input-focus"), n.preventDefault(), n.stopPropagation(), setTimeout(function() { r.events.enableBlur() }, 0), r.helpers.isMobile()) {
            var a = e(r.o_win).scrollTop();
            setTimeout(function() { e(r.o_win).scrollTop(a) }, 0)
          }
        },
        _inputBlur: function(n) {
          var r = i.data("instance") || t,
            o = e(n.currentTarget);
          o.is("input:file") && o.closest(".fr-layer").removeClass("fr-input-focus"), document.activeElement != this && e(this).is(":visible") && (r.events.blurActive() && r.events.trigger("blur"), r.events.enableBlur())
        },
        _editorKeydown: function(n) {
          var a = i.data("instance") || t;
          a.keys.ctrlKey(n) || n.which == e.FE.KEYCODE.ALT || n.which == e.FE.KEYCODE.ESC || (o(r) && i.find(".fr-back:visible").length ? a.button.exec(i.find(".fr-back:visible:first")) : n.which != e.FE.KEYCODE.ALT && a.popups.hide(r))
        },
        _preventFocus: function(n) {
          var r = i.data("instance") || t,
            o = n.originalEvent ? n.originalEvent.target || n.originalEvent.originalTarget : null;
          "mouseup" == n.type || e(o).is(":focus") || r.events.disableBlur(), "mouseup" != n.type || e(o).hasClass("fr-command") || e(o).parents(".fr-command").length > 0 || t.button.hideActiveDropdowns(i), (t.browser.safari || t.browser.mozilla) && "mousedown" == n.type && e(o).is("input[type=file]") && r.events.disableBlur();
          var a = "input, textarea, button, select, label, .fr-command";
          if (o && !e(o).is(a) && 0 === e(o).parents(a).length) return n.stopPropagation(), !1;
          o && e(o).is(a) && n.stopPropagation(), d()
        },
        _editorMouseup: function() { i.is(":visible") && c() && i.find("input:focus, textarea:focus, button:focus, select:focus").filter(":visible").length > 0 && t.events.disableBlur() },
        _windowMouseup: function(e) {
          if (!t.core.sameInstance(i)) return !0;
          var n = i.data("instance") || t;
          i.is(":visible") && c() && (e.stopPropagation(), n.markers.remove(), n.popups.hide(r), d())
        },
        _windowKeydown: function(n) {
          if (!t.core.sameInstance(i)) return !0;
          var o = i.data("instance") || t,
            a = n.which;
          if (e.FE.KEYCODE.ESC == a) { if (o.popups.isVisible(r) && o.opts.toolbarInline) return n.stopPropagation(), o.popups.isVisible(r) && (i.find(".fr-back:visible").length ? (o.button.exec(i.find(".fr-back:visible:first")), o.accessibility.focusPopupButton(i)) : i.find(".fr-dismiss:visible").length ? o.button.exec(i.find(".fr-dismiss:visible:first")) : (o.popups.hide(r), o.toolbar.showInline(null, !0), o.accessibility.FocusPopupButton(i))), !1; if (o.popups.isVisible(r)) return i.find(".fr-back:visible").length ? (o.button.exec(i.find(".fr-back:visible:first")), o.accessibility.focusPopupButton(i)) : i.find(".fr-dismiss:visible").length ? o.button.exec(i.find(".fr-dismiss:visible:first")) : (o.popups.hide(r), o.accessibility.focusPopupButton(i)), !1 }
        },
        _doPlaceholder: function() { 0 === e(this).next().length && e(this).attr("placeholder") && e(this).after('<label for="' + e(this).attr("id") + '">' + e(this).attr("placeholder") + "</label>"), e(this).toggleClass("fr-not-empty", "" !== e(this).val()) },
        _repositionPopup: function() {
          if (!t.opts.height && !t.opts.heightMax || t.opts.toolbarInline) return !0;
          if (t.$wp && o(r) && i.parent().get(0) == t.$sc.get(0)) {
            var e = i.offset().top - t.$wp.offset().top,
              n = t.$wp.outerHeight();
            t.node.hasClass(i.get(0), "fr-above") && (e += i.outerHeight()), e > n || e < 0 ? i.addClass("fr-hidden") : i.removeClass("fr-hidden")
          }
        }
      }
    }

    function u(e, r) { t.events.on("mouseup", e._editorMouseup, !0), t.$wp && t.events.on("keydown", e._editorKeydown), t.events.on("blur", function() { i() && t.markers.remove(), s() }), t.$wp && !t.helpers.isMobile() && t.events.$on(t.$wp, "scroll.popup" + r, e._repositionPopup), t.events.on("window.mouseup", e._windowMouseup, !0), t.events.on("window.keydown", e._windowKeydown, !0), n[r].data("inst" + t.id, !0), t.events.on("destroy", function() { t.core.sameInstance(n[r]) && n[r].removeClass("fr-active").appendTo("body:first") }, !0) }

    function g() {
      for (var e in n)
        if (n.hasOwnProperty(e)) {
          var t = n[e];
          t && (t.html("").removeData().remove(), n[e] = null)
        }
      n = []
    }
    return t.shared.exit_flag = !1, {
      _init: function() { t.events.on("shared.destroy", g, !0), t.events.on("window.mousedown", l), t.events.on("window.touchmove", d), t.events.on("mousedown", function(e) { i() && (e.stopPropagation(), t.$el.find(".fr-marker").remove(), l(), t.events.disableBlur()) }) },
      create: function(n, r) {
        var o = f(n, r),
          i = p(n);
        return u(i, n), t.events.$on(o, "mousedown mouseup touchstart touchend touch", "*", i._preventFocus, !0), t.events.$on(o, "focus", "input, textarea, button, select", i._inputFocus, !0), t.events.$on(o, "blur", "input, textarea, button, select", i._inputBlur, !0), t.accessibility.registerPopup(n), t.events.$on(o, "keydown keyup change input", "input, textarea", i._doPlaceholder, !0), t.helpers.isIOS() && t.events.$on(o, "touchend", "label", function() { e("#" + e(this).attr("for")).prop("checked", function(e, t) { return !t }) }, !0), t.events.$on(e(t.o_win), "resize", i._windowResize, !0), o
      },
      get: function(e) { var r = n[e]; return r && !r.data("inst" + t.id) && u(p(e), e), r },
      show: function(e, a, l, c) {
        if (i() && t.$el.find(".fr-marker").length > 0 ? (t.events.disableBlur(), t.selection.restore()) : (t.events.disableBlur(), t.events.focus(), t.events.enableBlur()), s([e]), !n[e]) return !1;
        var f = t.button.getButtons(".fr-dropdown.fr-active");
        f.removeClass("fr-active").attr("aria-expanded", !1).parent(".fr-toolbar").css("zIndex", ""), f.next().attr("aria-hidden", !0), n[e].data("instance", t), t.$tb && t.$tb.data("instance", t);
        var u = n[e].outerWidth(),
          g = o(e);
        n[e].addClass("fr-active").removeClass("fr-hidden").find("input, textarea").removeAttr("disabled");
        var h = n[e].data("container");
        t.opts.toolbarInline && h && t.$tb && h.get(0) == t.$tb.get(0) && (r(e, t.$sc), l = t.$tb.offset().top - t.helpers.getPX(t.$tb.css("margin-top")), a = t.$tb.offset().left + t.$tb.outerWidth() / 2 + (parseFloat(t.$tb.find(".fr-arrow").css("margin-left")) || 0) + t.$tb.find(".fr-arrow").outerWidth() / 2, t.node.hasClass(t.$tb.get(0), "fr-above") && l && (l += t.$tb.outerHeight()), c = 0), h = n[e].data("container"), !t.opts.iframe || c || g || (a && (a -= t.$iframe.offset().left), l && (l -= t.$iframe.offset().top)), h.is(t.$tb) ? t.$tb.css("zIndex", (t.opts.zIndex || 1) + 4) : n[e].css("zIndex", (t.opts.zIndex || 1) + 4), a && (a -= u / 2), t.opts.toolbarBottom && h && t.$tb && h.get(0) == t.$tb.get(0) && (n[e].addClass("fr-above"), l && (l -= n[e].outerHeight())), n[e].removeClass("fr-active"), t.position.at(a, l, n[e], c || 0), n[e].addClass("fr-active"), g || t.accessibility.focusPopup(n[e]), t.opts.toolbarInline && t.toolbar.hide(), t.events.trigger("popups.show." + e), p(e)._repositionPopup(), d()
      },
      hide: a,
      onHide: function(e, n) { t.events.on("popups.hide." + e, n) },
      hideAll: s,
      setContainer: r,
      refresh: function(r) {
        n[r].data("instance", t), t.events.trigger("popups.refresh." + r);
        for (var o = n[r].find(".fr-command"), i = 0; i < o.length; i++) {
          var a = e(o[i]);
          0 === a.parents(".fr-dropdown-menu").length && t.button.refresh(a)
        }
      },
      onRefresh: function(e, n) { t.events.on("popups.refresh." + e, n) },
      onShow: function(e, n) { t.events.on("popups.show." + e, n) },
      isVisible: o,
      areVisible: i
    }
  }, e.FE.MODULES.position = function(t) {
    function n() {
      var e = t.selection.ranges(0).getBoundingClientRect();
      if (0 === e.top && 0 === e.left && 0 === e.width || 0 === e.height) {
        var n = !1;
        0 === t.$el.find(".fr-marker").length && (t.selection.save(), n = !0);
        var r = t.$el.find(".fr-marker:first");
        r.css("display", "inline"), r.css("line-height", "");
        var o = r.offset(),
          i = r.outerHeight();
        r.css("display", "none"), r.css("line-height", 0), (e = {}).left = o.left, e.width = 0, e.height = i, e.top = o.top - (t.helpers.isMobile() ? 0 : t.helpers.scrollTop()), e.right = 1, e.bottom = 1, e.ok = !0, n && t.selection.restore()
      }
      return e
    }

    function r(e, n, r, o) {
      var i = r.data("container");
      !i || "BODY" === i.get(0).tagName && "static" == i.css("position") || (e && (e -= i.offset().left), n && (n -= i.offset().top), "BODY" != i.get(0).tagName ? (e && (e += i.get(0).scrollLeft), n && (n += i.get(0).scrollTop)) : "absolute" == i.css("position") && (e && (e += i.position().left), n && (n += i.position().top))), t.opts.iframe && i && t.$tb && i.get(0) != t.$tb.get(0) && (e && (e += t.$iframe.offset().left), n && (n += t.$iframe.offset().top));
      var a = function(e, n) { var r = e.outerWidth(!0); return e.parent().offset().left + n + r > t.$sc.get(0).clientWidth - t.$sc.position().left - 10 && (n = t.$sc.get(0).clientWidth - e.parent().offset().left - r - 10), n < 0 && (n = 10), n }(r, e);
      if (e) {
        r.css("left", a);
        var s = r.data("fr-arrow");
        s || (s = r.find(".fr-arrow"), r.data("fr-arrow", s)), s.data("margin-left") || s.data("margin-left", t.helpers.getPX(s.css("margin-left"))), s.css("margin-left", e - a + s.data("margin-left"))
      }
      n && r.css("top", function(e, n, r) {
        var o = e.outerHeight(!0);
        if (!t.helpers.isMobile() && t.$tb && e.parent().get(0) != t.$tb.get(0)) {
          var i = e.parent().offset().top,
            a = n - o - (r || 0);
          e.parent().get(0) == t.$sc.get(0) && (i -= e.parent().position().top);
          var s = t.$sc.get(0).scrollHeight;
          i + n + o > t.$sc.offset().top + s && e.parent().offset().top + a > 0 ? (n = a, e.addClass("fr-above")) : e.removeClass("fr-above")
        }
        return n
      }(r, n, o))
    }

    function o(n) {
      var r = e(n),
        o = r.is(".fr-sticky-on"),
        i = r.data("sticky-top"),
        a = r.data("sticky-scheduled");
      if (void 0 === i) {
        r.data("sticky-top", 0);
        var s = e('<div class="fr-sticky-dummy" style="height: ' + r.outerHeight() + 'px;"></div>');
        t.$box.prepend(s)
      } else t.$box.find(".fr-sticky-dummy").css("height", r.outerHeight());
      if (t.core.hasFocus() || t.$tb.find("input:visible:focus").length > 0) {
        var l = t.helpers.scrollTop(),
          d = Math.min(Math.max(l - t.$tb.parent().offset().top, 0), t.$tb.parent().outerHeight() - r.outerHeight());
        d != i && d != a && (clearTimeout(r.data("sticky-timeout")), r.data("sticky-scheduled", d), r.outerHeight() < l - t.$tb.parent().offset().top && r.addClass("fr-opacity-0"), r.data("sticky-timeout", setTimeout(function() {
          var e = t.helpers.scrollTop(),
            n = Math.min(Math.max(e - t.$tb.parent().offset().top, 0), t.$tb.parent().outerHeight() - r.outerHeight());
          n > 0 && "BODY" == t.$tb.parent().get(0).tagName && (n += t.$tb.parent().position().top), n != i && (r.css("top", Math.max(n, 0)), r.data("sticky-top", n), r.data("sticky-scheduled", n)), r.removeClass("fr-opacity-0")
        }, 100))), o || (r.css("top", "0"), r.width(t.$tb.parent().width()), r.addClass("fr-sticky-on"), t.$box.addClass("fr-sticky-box"))
      } else clearTimeout(e(n).css("sticky-timeout")), r.css("top", "0"), r.css("position", ""), r.width(""), r.data("sticky-top", 0), r.removeClass("fr-sticky-on"), t.$box.removeClass("fr-sticky-box")
    }

    function i(n) {
      if (n.offsetWidth) {
        var r, o, i = e(n),
          a = i.outerHeight(),
          s = i.data("sticky-position"),
          l = e("body" == t.opts.scrollableContainer ? t.o_win : t.opts.scrollableContainer).outerHeight(),
          d = 0,
          c = 0;
        "body" !== t.opts.scrollableContainer && (d = t.$sc.offset().top, c = e(t.o_win).outerHeight() - d - l);
        var f = "body" == t.opts.scrollableContainer ? t.helpers.scrollTop() : d,
          p = i.is(".fr-sticky-on");
        i.data("sticky-parent") || i.data("sticky-parent", i.parent());
        var u = i.data("sticky-parent"),
          g = u.offset().top,
          h = u.outerHeight();
        if (i.data("sticky-offset") || (i.data("sticky-offset", !0), i.after('<div class="fr-sticky-dummy" style="height: ' + a + 'px;"></div>')), !s) {
          var m = "auto" !== i.css("top") || "auto" !== i.css("bottom");
          m || i.css("position", "fixed"), s = { top: t.node.hasClass(i.get(0), "fr-top"), bottom: t.node.hasClass(i.get(0), "fr-bottom") }, m || i.css("position", ""), i.data("sticky-position", s), i.data("top", t.node.hasClass(i.get(0), "fr-top") ? i.css("top") : "auto"), i.data("bottom", t.node.hasClass(i.get(0), "fr-bottom") ? i.css("bottom") : "auto")
        }
        r = t.helpers.getPX(i.data("top")), o = t.helpers.getPX(i.data("bottom"));
        var v = s.top && g < f + r && g + h - a >= f + r,
          E = s.bottom && g + a < f + l - o && g + h > f + l - o;
        v || E ? (i.css("width", u.width() + "px"), p || (i.addClass("fr-sticky-on"), i.removeClass("fr-sticky-off"), i.css("top") && ("auto" != i.data("top") ? i.css("top", t.helpers.getPX(i.data("top")) + d) : i.data("top", "auto")), i.css("bottom") && ("auto" != i.data("bottom") ? i.css("bottom", t.helpers.getPX(i.data("bottom")) + c) : i.css("bottom", "auto")))) : t.node.hasClass(i.get(0), "fr-sticky-off") || (i.width(""), i.removeClass("fr-sticky-on"), i.addClass("fr-sticky-off"), i.css("top") && "auto" != i.data("top") && s.top && i.css("top", 0), i.css("bottom") && "auto" != i.data("bottom") && s.bottom && i.css("bottom", 0))
      }
    }

    function a() { var e = document.createElement("test").style; return e.cssText = "position:" + ["-webkit-", "-moz-", "-ms-", "-o-", ""].join("sticky; position:") + " sticky;", -1 !== e.position.indexOf("sticky") && !t.helpers.isIOS() && !t.helpers.isAndroid() && !t.browser.chrome }

    function s() {
      if (t._stickyElements)
        for (var e = 0; e < t._stickyElements.length; e++) i(t._stickyElements[e])
    }
    return {
      _init: function() {
        ! function() {
          if (!a())
            if (t._stickyElements = [], t.helpers.isIOS()) {
              var n = function() { t.helpers.requestAnimationFrame()(n); for (var e = 0; e < t._stickyElements.length; e++) o(t._stickyElements[e]) };
              n(), t.events.$on(e(t.o_win), "scroll", function() {
                if (t.core.hasFocus())
                  for (var n = 0; n < t._stickyElements.length; n++) {
                    var r = e(t._stickyElements[n]),
                      o = r.parent(),
                      i = t.helpers.scrollTop();
                    r.outerHeight() < i - o.offset().top && (r.addClass("fr-opacity-0"), r.data("sticky-top", -1), r.data("sticky-scheduled", -1))
                  }
              }, !0)
            } else t.events.$on(e("body" == t.opts.scrollableContainer ? t.o_win : t.opts.scrollableContainer), "scroll", s, !0), t.events.$on(e(t.o_win), "resize", s, !0), t.events.on("initialized", s), t.events.on("focus", s), t.events.$on(e(t.o_win), "resize", "textarea", s, !0);
          t.events.on("destroy", function() { t._stickyElements = [] })
        }()
      },
      forSelection: function(e) {
        var o = n();
        e.css({ top: 0, left: 0 });
        var i = o.top + o.height,
          a = o.left + o.width / 2 - e.get(0).offsetWidth / 2 + t.helpers.scrollLeft();
        t.opts.iframe || (i += t.helpers.scrollTop()), r(a, i, e, o.height)
      },
      addSticky: function(e) { e.addClass("fr-sticky"), t.helpers.isIOS() && e.addClass("fr-sticky-ios"), a() || (e.removeClass("fr-sticky"), t._stickyElements.push(e.get(0))) },
      refresh: s,
      at: r,
      getBoundingRect: n
    }
  }, e.FE.MODULES.refresh = function(t) {
    function n(e, t) { e.toggleClass("fr-disabled", t).attr("aria-disabled", t) }
    return {
      undo: function(e) { n(e, !t.undo.canDo()) },
      redo: function(e) { n(e, !t.undo.canRedo()) },
      outdent: function(r) {
        if (t.node.hasClass(r.get(0), "fr-no-refresh")) return !1;
        for (var o = t.selection.blocks(), i = 0; i < o.length; i++) { var a = "rtl" == t.opts.direction || "rtl" == e(o[i]).css("direction") ? "margin-right" : "margin-left"; if ("LI" == o[i].tagName || "LI" == o[i].parentNode.tagName) return n(r, !1), !0; if (t.helpers.getPX(e(o[i]).css(a)) > 0) return n(r, !1), !0 }
        n(r, !0)
      },
      indent: function(e) {
        if (t.node.hasClass(e.get(0), "fr-no-refresh")) return !1;
        for (var r = t.selection.blocks(), o = 0; o < r.length; o++) {
          for (var i = r[o].previousSibling; i && i.nodeType == Node.TEXT_NODE && 0 === i.textContent.length;) i = i.previousSibling;
          if ("LI" != r[o].tagName || i) return n(e, !1), !0;
          n(e, !0)
        }
      }
    }
  }, e.extend(e.FE.DEFAULTS, { editInPopup: !1 }), e.FE.MODULES.textEdit = function(e) {
    function t() {
      e.events.$on(e.$el, e._mouseup, function() {
        setTimeout(function() {
          var t, n;
          n = e.popups.get("text.edit"), t = "INPUT" === e.$el.prop("tagName") ? e.$el.attr("placeholder") : e.$el.text(), n.find("input").val(t).trigger("change"), e.popups.setContainer("text.edit", e.$sc), e.popups.show("text.edit", e.$el.offset().left + e.$el.outerWidth() / 2, e.$el.offset().top + e.$el.outerHeight(), e.$el.outerHeight())
        }, 10)
      })
    }
    return {
      _init: function() {
        var n;
        e.opts.editInPopup && (n = { edit: '<div id="fr-text-edit-' + e.id + '" class="fr-layer fr-text-edit-layer"><div class="fr-input-line"><input type="text" placeholder="' + e.language.translate("Text") + '" tabIndex="1"></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="updateText" tabIndex="2">' + e.language.translate("Update") + "</button></div></div>" }, e.popups.create("text.edit", n), t())
      },
      update: function() {
        var t = e.popups.get("text.edit").find("input").val();
        0 === t.length && (t = e.opts.placeholderText), "INPUT" === e.$el.prop("tagName") ? e.$el.attr("placeholder", t) : e.$el.text(t), e.events.trigger("contentChanged"), e.popups.hide("text.edit")
      }
    }
  }, e.FE.RegisterCommand("updateText", { focus: !1, undo: !1, callback: function() { this.textEdit.update() } }), e.extend(e.FE.DEFAULTS, { toolbarBottom: !1, toolbarButtons: ["fullscreen", "bold", "italic", "underline", "strikeThrough", "subscript", "superscript", "|", "fontFamily", "fontSize", "color", "inlineStyle", "paragraphStyle", "|", "paragraphFormat", "align", "formatOL", "formatUL", "outdent", "indent", "quote", "-", "insertLink", "insertImage", "insertVideo", "insertFile", "insertTable", "|", "emoticons", "specialCharacters", "insertHR", "selectAll", "clearFormatting", "|", "print", "spellChecker", "help", "html", "|", "undo", "redo"], toolbarButtonsXS: ["bold", "italic", "fontFamily", "fontSize", "|", "undo", "redo", "insertImage"], toolbarButtonsSM: ["bold", "italic", "underline", "|", "fontFamily", "fontSize", "insertLink", "insertImage", "table", "|", "undo", "redo"], toolbarButtonsMD: null, toolbarContainer: null, toolbarInline: !1, toolbarSticky: !0, toolbarStickyOffset: 0, toolbarVisibleWithoutSelection: !1 }), e.FE.MODULES.toolbar = function(t) {
    var n, r = [];

    function o(e, t) { for (var n = 0; n < t.length; n++) "-" != t[n] && "|" != t[n] && e.indexOf(t[n]) < 0 && e.push(t[n]) }

    function i() { var e = t.helpers.screenSize(); return r[e] }

    function a() {
      var e = i();
      t.$tb.find(".fr-separator").remove(), t.$tb.find("> .fr-command").addClass("fr-hidden");
      for (var n = 0; n < e.length; n++)
        if ("|" == e[n] || "-" == e[n]) t.$tb.append(t.button.buildList([e[n]]));
        else {
          var r = t.$tb.find('> .fr-command[data-cmd="' + e[n] + '"]'),
            o = null;
          t.node.hasClass(r.next().get(0), "fr-dropdown-menu") && (o = r.next()), r.removeClass("fr-hidden").appendTo(t.$tb), o && o.appendTo(t.$tb)
        }
    }

    function s(n, r) {
      setTimeout(function() {
        if ((!n || n.which != e.FE.KEYCODE.ESC) && t.selection.inEditor() && t.core.hasFocus() && !t.popups.areVisible() && (t.opts.toolbarVisibleWithoutSelection || !t.selection.isCollapsed() && !t.keys.isIME() || r)) {
          if (t.$tb.data("instance", t), !1 === t.events.trigger("toolbar.show", [n])) return !1;
          t.$tb.show(), t.opts.toolbarContainer || t.position.forSelection(t.$tb), t.opts.zIndex > 1 ? t.$tb.css("z-index", t.opts.zIndex + 1) : t.$tb.css("z-index", null)
        }
      }, 0)
    }

    function l() { if (t.button.getButtons(".fr-dropdown.fr-active").next().find(t.o_doc.activeElement).length) return !0;!1 !== t.events.trigger("toolbar.hide") && t.$tb.hide() }
    r[e.FE.XS] = t.opts.toolbarButtonsXS || t.opts.toolbarButtons, r[e.FE.SM] = t.opts.toolbarButtonsSM || t.opts.toolbarButtons, r[e.FE.MD] = t.opts.toolbarButtonsMD || t.opts.toolbarButtons, r[e.FE.LG] = t.opts.toolbarButtons;
    var d = null;

    function c(n) { clearTimeout(d), n && n.which == e.FE.KEYCODE.ESC || (d = setTimeout(s, t.opts.typingTimer)) }

    function f() { t.events.on("window.mousedown", l), t.events.on("keydown", l), t.events.on("blur", l), t.events.on("window.mouseup", s), t.helpers.isMobile() ? t.helpers.isIOS() || (t.events.on("window.touchend", s), t.browser.mozilla && setInterval(s, 200)) : t.events.on("window.keyup", c), t.events.on("keydown", function(t) { t && t.which == e.FE.KEYCODE.ESC && l() }), t.events.on("keydown", function(t) { if (t.which == e.FE.KEYCODE.ALT) return t.stopPropagation(), !1 }, !0), t.events.$on(t.$wp, "scroll.toolbar", s), t.events.on("commands.after", s), t.helpers.isMobile() && (t.events.$on(t.$doc, "selectionchange", c), t.events.$on(t.$doc, "orientationchange", s)) }

    function p() { t.$tb.html("").removeData().remove(), t.$tb = null }

    function u() { t.$box.removeClass("fr-top fr-bottom fr-inline fr-basic"), t.$box.find(".fr-sticky-dummy").remove() }

    function g() {
      t.opts.theme && t.$tb.addClass(t.opts.theme + "-theme"), t.opts.zIndex > 1 && t.$tb.css("z-index", t.opts.zIndex + 1), "auto" != t.opts.direction && t.$tb.removeClass("fr-ltr fr-rtl").addClass("fr-" + t.opts.direction), t.helpers.isMobile() ? t.$tb.addClass("fr-mobile") : t.$tb.addClass("fr-desktop"), t.opts.toolbarContainer ? (t.opts.toolbarInline && (f(), l()), t.opts.toolbarBottom ? t.$tb.addClass("fr-bottom") : t.$tb.addClass("fr-top")) : t.opts.toolbarInline ? (t.$sc.append(t.$tb), t.$tb.data("container", t.$sc), t.$tb.addClass("fr-inline"), t.$tb.prepend('<span class="fr-arrow"></span>'), f(), t.opts.toolbarBottom = !1) : (t.opts.toolbarBottom && !t.helpers.isIOS() ? (t.$box.append(t.$tb), t.$tb.addClass("fr-bottom"), t.$box.addClass("fr-bottom")) : (t.opts.toolbarBottom = !1, t.$box.prepend(t.$tb), t.$tb.addClass("fr-top"), t.$box.addClass("fr-top")), t.$tb.addClass("fr-basic"), t.opts.toolbarSticky && (t.opts.toolbarStickyOffset && (t.opts.toolbarBottom ? t.$tb.css("bottom", t.opts.toolbarStickyOffset) : t.$tb.css("top", t.opts.toolbarStickyOffset)), t.position.addSticky(t.$tb))), n = t.$tb.get(0).ownerDocument, "defaultView" in n ? n.defaultView : n.parentWindow,
        function() {
          var n = e.merge([], i());
          o(n, t.opts.toolbarButtonsXS || []), o(n, t.opts.toolbarButtonsSM || []), o(n, t.opts.toolbarButtonsMD || []), o(n, t.opts.toolbarButtons);
          for (var r = n.length - 1; r >= 0; r--) "-" != n[r] && "|" != n[r] && n.indexOf(n[r]) < r && n.splice(r, 1);
          var a = t.button.buildList(n, i());
          t.$tb.append(a), t.button.bindCommands(t.$tb)
        }(), t.events.$on(e(t.o_win), "resize", a), t.events.$on(e(t.o_win), "orientationchange", a), t.accessibility.registerToolbar(t.$tb), t.events.$on(t.$tb, t._mousedown + " " + t._mouseup, function(e) { var n = e.originalEvent ? e.originalEvent.target || e.originalEvent.originalTarget : null; if (n && "INPUT" != n.tagName && !t.edit.isDisabled()) return e.stopPropagation(), e.preventDefault(), !1 }, !0)
    }
    var h = !1;
    return {
      _init: function() {
        if (t.$sc = e(t.opts.scrollableContainer).first(), !t.$wp) return !1;
        t.opts.toolbarContainer ? (t.shared.$tb ? (t.$tb = t.shared.$tb, t.opts.toolbarInline && f()) : (t.shared.$tb = e('<div class="fr-toolbar"></div>'), t.$tb = t.shared.$tb, e(t.opts.toolbarContainer).append(t.$tb), g(), t.$tb.data("instance", t)), t.opts.toolbarInline ? t.$box.addClass("fr-inline") : t.$box.addClass("fr-basic"), t.events.on("focus", function() { t.$tb.data("instance", t) }, !0), t.opts.toolbarInline = !1) : t.opts.toolbarInline ? (t.$box.addClass("fr-inline"), t.shared.$tb ? (t.$tb = t.shared.$tb, f()) : (t.shared.$tb = e('<div class="fr-toolbar"></div>'), t.$tb = t.shared.$tb, g())) : (t.$box.addClass("fr-basic"), t.$tb = e('<div class="fr-toolbar"></div>'), g(), t.$tb.data("instance", t)), t.events.on("destroy", u, !0), t.events.on(t.opts.toolbarInline || t.opts.toolbarContainer ? "shared.destroy" : "destroy", p, !0)
      },
      hide: l,
      show: function() {
        if (!1 === t.events.trigger("toolbar.show")) return !1;
        t.$tb.show()
      },
      showInline: s,
      disable: function() {!h && t.$tb && (t.$tb.find("> .fr-command").addClass("fr-disabled fr-no-refresh").attr("aria-disabled", !0), h = !0) },
      enable: function() { h && t.$tb && (t.$tb.find("> .fr-command").removeClass("fr-disabled fr-no-refresh").attr("aria-disabled", !1), h = !1), t.button.bulkRefresh() }
    }
  }
});