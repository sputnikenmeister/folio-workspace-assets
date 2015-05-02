/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var $ = require("jquery");

/** @type {module:jshashtable} */
// var HashTable = require("jshashtable");
/** @type {module:hashes.HashTable} */
// var HashTable = require('hashes').HashTable;

/** @type {module:app/utils/css/prefixedStyleName} */
// var prefixedStyleName = require("../utils/css/prefixedStyleName");
/** @type {module:app/utils/css/prefixedProperty} */
var prefixedProperty = require("../utils/css/prefixedProperty");
/** @type {module:app/utils/css/prefixedProperty} */
var parseTransformMatrix = require("../utils/css/parseTransformMatrix");
/** @type {module:app/utils/strings/camelToDashed} */
var camelToDashed = require("../utils/strings/camelToDashed");

var _idSeed = 0;
var _transformProp = prefixedProperty(document.body.style, "transform");
var _transformStyle = (_transformProp != "transform")? "-" + camelToDashed(_transformProp): "transform";

/**
 * @constructor
 * @type {module:app/helper/TransformHelper}
 */
function TransformHelper() {
	this._elements = [];
	this._values = [];
	// this._store = new HashTable();
}

TransformHelper.prototype = {

	add: function(el) {
		this._add(el);
	},

	get: function(el) {
		return this._get(el);
	},

	destroy: function(el) {
		this._remove(el);
	},

	/* -------------------------------
	 * Private
	 * ------------------------------- */

	// _add_ht: function(el) {
	// 	if (!this._store.containsKey(el)) {
	// 		_addPrefixed(el);
	// 		this._store.put(el, {el: el, $el: $(el)})
	// 	}
	// 	return this._store.get(el);
	// },
	//
	// _get_ht: function(el) {
	// 	return this._add(el);
	// },
	//
	// _remove_ht: function(el) {
	// 	this._store.remove(el);
	// },

	_add: function(el) {
		var idx = this._elements.indexOf(el);
		if (el && idx == -1) {
			idx = this._elements.length;
			this._elements[idx] = el;
			this._values[idx] = {id: _idSeed++, el: el, $el: $(el)};
		}
		return idx;
	},

	_get: function(el) {
		var idx = this._elements.indexOf(el);
		if (idx == -1) {
			idx = this._add(el);
		}
		return this._values[idx];
	},

	_remove: function(el) {
		var o, idx = this._elements.indexOf(el);
		if (idx != -1) {
			o = this._values[idx];
			if (o.offset) {
				this._clearElementTransform(o.$el);
			}
			this._elements.splice(idx, 1);
			this._values.splice(idx, 1);
		}
	},

	/* -------------------------------
	 * transition
	 * ------------------------------- */

	hasTransition: function(el) {
		var o = this._get(el), ret = false;
		if (o.transition === void 0) {
			o.transition = this._parseTransitionValues(o);
			ret = o.transition.delay + o.transition.duration > 0;
			console.log("TransformHelper.hasTransition", o.id, ret,
				o.transition.delay, o.transition.duration);
		} else {
			ret = o.transition.delay + o.transition.duration > 0;
			console.log("TransformHelper.hasTransition", o.id, ret,
				o.transition.delay, o.transition.duration, "(cached)");
		}
		return ret;
	},

	_parseTransitionValues: function(o) {
		var ret = {};
		var css, values, idx, d = 0;
		css = o.$el.css(["transition-property", "transition-duration", "transition-delay"]);
		values = css["transition-property"].split(",");
		idx = values.length;
		do { --idx; } while (idx != -1 && values[idx].indexOf("transform") == -1);
		//while (idx && values[--idx].indexOf("transform")) {}
		if (idx != -1) {
			values = css["transition-duration"].split(",");
			ret.duration = parseFloat((idx < values.length)? values[idx] : values[values.length - 1]);
			values = css["transition-delay"].split(",");
			ret.delay = parseFloat((idx < values.length)? values[idx] : values[values.length - 1]);
		} else {
			ret.duration = 0;
			ret.delay = 0;
		}
		return ret;
	},

	/* -------------------------------
	 * transform: css property --> object
	 * ------------------------------- */

	_parseTransformValues: function(o) {
		var m, mm, ret = {};
		var css = o.$el.css(_transformStyle);
		if (!o.captured || o.captured.css !== css) {
			mm = css.match(/(matrix|matrix3d)\(([^\)]+)\)/);
			if (mm) {
				m = mm[2].split(",");
				if (mm[1] === "matrix") {
					ret.x = parseFloat(m[4]);
					ret.y = parseFloat(m[5]);
				} else {
					ret.x = parseFloat(m[12]);
					ret.y = parseFloat(m[13]);
				}
			} else {
				ret.x = 0;
				ret.y = 0;
			}
			ret.css = css;
		} else {
			ret = o.captured;
		}
		console.log("TransformHelper captured css", css, o.$el.css("transform-style"),
			(o.el.id || o.el.classList[0] || o.el.getAttribute("data-cid")));
		return ret;
	},

	_clearElementTransform: function(o) {
		o.el.style[_transformProp] = "";
		// o.$el.css(_transformStyle, "");
	},

	_applyElementTransform: function(o, x, y) {
		// var val = "translate3d(" + x + "px, " + y + "px, 0px)";
		o.el.style[_transformProp] = "translate3d(" + x + "px, " + y + "px, 0px)";
		// o.$el.css(_transformStyle, "translate3d(" + x + "px, " + y + "px, 0px)");
	},

	/* -------------------------------
	 * transform: css property --> object
	 * ------------------------------- */

	// _captureComputed: function(o) {
	// 	// var styles = window.getComputedStyle(o.el);
	// 	// o.captured.computed = _.pick(styles,[]);
	// 	o.captured.computed = o.$el.css(["transform", "transition", "transition-property", "transition-duration", "transition-delay"]);
	// },

	_capture: function(o) {
		if (o.offset) {
			this._clearElementTransform(o);
			console.warn("TransformHelper.capture", o.id,
				"offset values still set: clearing, capturing, reapplying");
		}
		o.captured = this._parseTransformValues(o);
		if (o.offset) {
			this._applyElementTransform(o, o.offset.x + o.captured.x, o.offset.y + o.captured.y);
		}
	},

	_release: function(o) {
		o.transition = o.offset = o.captured = void 0;
		// console.log("TransformHelper.release", o.id);
	},

	/* -------------------------------
	 * object --> css property
	 * ------------------------------- */

	_clear: function(o) {
		if (o.offset) {
			this._clearElementTransform(o);
			o.offset = void 0;
			// console.log("TransformHelper.clear", o.id);
		} else {
			console.warn("TransformHelper.clear", o.id, "nothing to clear",
				(o.el.id || o.el.classList[0] || o.el.getAttribute("data-cid")));
		}
	},

	_move: function(o, x, y) {
		o.offset || (o.offset = {});
		o.offset.x = x || 0;
		o.offset.y = y || 0;

		if (!o.captured) {
			o.captured = this._parseTransformValues(o);
			console.warn("TransformHelper.move", o.id, "captured values not set: capturing now",
				(o.el.id || o.el.classList[0] || o.el.getAttribute("data-cid")));
		}

		this._applyElementTransform(o, o.offset.x + o.captured.x, o.offset.y + o.captured.y);
	},

	/* --------------------------------
	 * Public
	 * -------------------------------- */

	move: function(el, x, y){
		// if (_.isArray(el)) {
		// 	for (var i = 0; i < el.length; ++i) {
		// 		this._move(this._get(el[i]), x, y);
		// 	}
		// } else if (el instanceof window.HTMLElement)
		this._move(this._get(el), x, y);
	},

	moveAll: function(x, y) {
		for (var i = 0; i < this._values.length; ++i) {
			this._move(this._values[i], x, y);
		}
	},

	capture: function(el) {
		this._capture(this._get(el));
	},

	captureAll: function() {
		for (var i = 0; i < this._values.length; ++i) {
			this._capture(this._values[i]);
		}
	},

	release: function(el) {
		this._release(this._get(el));
	},

	releaseAll: function() {
		for (var i = 0; i < this._values.length; ++i) {
			this._release(this._values[i]);
		}
	},

	clear: function(el) {
		this._clear(this._get(el));
	},

	clearAll: function() {
		for (var i = 0; i < this._values.length; ++i) {
			this._clear(this._values[i]);
		}
	},

	/* -------------------------------
	 * old
	 * ------------------------------- */

	/*update: function(el) {
		var o = this._get(el);
		if (o.offset) {
			if (!o.captured) {
				console.info("TransformHelper._updateCSSTransform", "captured values not set: capturing now");
				o.captured = this._parseTransformValues(o.$el.css("transform"));
			}
			o.$el.css({transform: "translate3d(" +
					   (o.offset.x + o.captured.x) + "px, " +
					   (o.offset.y + o.captured.y) + "px, 0px)"
			});
		} else {
			o.$el.css({"transform": ""});
		}
	},*/

	/*_parseTransformValues: function(css) {
		var o = { css: css };
		var m = css.match(/(-?[\d\.]+)(?=[\)\,])/g);
		if (m && m.length == 6) {
			o.x = parseFloat(m[4]);
			o.y = parseFloat(m[5]);
		} else if (m && m.length == 16) {
			o.x = parseFloat(m[12]);
			o.y = parseFloat(m[13]);
		} else {
			o.x = 0;
			o.y = 0;
		}
		console.log("TransformHelper._parseTransformValues_2", o.x, o.y, cssval);
		return o;
	},*/

	/*hasTransition: function(el) {
		var css, prop, ret;
		//css = window.getComputedStyle(el);
		//prop = css.webkitTransition || css.MozTransitionProperty || css.webkitTransitionProperty || css.MozTransition || css.transition;
		css = this._get(el).$el.css(["transition-property", "transition"]);
		prop = css["transition-property"] || css["transition"];
		ret = prop.indexOf("transform") != -1;
		console.log("TransformHelper._hasCSSTransition", (ret?"has":"has no") + " transition", css);
		return ret;
	},*/

	/*_parseTransformValues: function(css) {
		var o = { css: css };
		var m = css.match(/(-?[\d\.]+)(?=[\)\,])/g);
		if (m && m.length == 6) {
			o.x = parseFloat(m[4]);
			o.y = parseFloat(m[5]);
		} else if (m && m.length == 16) {
			o.x = parseFloat(m[12]);
			o.y = parseFloat(m[13]);
		} else {
			o.x = 0;
			o.y = 0;
		}
		console.log("TransformHelper._parseTransformValues_2", o.x, o.y, cssval);
		return o;
	},*/
};


module.exports = TransformHelper;
