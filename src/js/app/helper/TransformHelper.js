/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

var _tidSeed = 0;

/**
 * @constructor
 * @type {module:app/helper/TransformHelper}
 */
function TransformHelper() {
	this._elements = [];
	this._values = [];
}

TransformHelper.prototype = {

	/* -------------------------------
	 * Private
	 * ------------------------------- */

	_initTransform: function(el) {
		var idx = this._elements.indexOf(el);
		if (idx == -1) {
			idx = this._elements.length;
			this._elements[idx] = el;
			this._values[idx] = {
				id: _tidSeed++,
				el: el,
				$el: Backbone.$(el)
			};
		}
		return idx;
	},

	_getTransform: function(el) {
		var idx = this._elements.indexOf(el);
		if (idx == -1) {
			idx = this._initTransform(el);
		}
		return this._values[idx];
	},

	_parseTransformValues: function(o) {
		var m, mm, ret = {};
		var css = o.$el.css("transform");
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
			console.log("TransformHelper._parseTransformValues", o.id, ret);
		} else {
			ret = o.captured;
			console.log("TransformHelper._parseTransformValues", o.id, ret, "(cached)");
		}
		return ret;
	},

	_clearElementTransform: function(o) {
		o.$el.css({"transform": "", "-webkit-transform": ""});
	},

	_applyElementTransform: function(o, x, y) {
		var val = "translate3d(" + x + "px, " + y + "px, 0px)";
		o.$el.css({"transform": val, "-webkit-transform": val});
	},

	/* -------------------------------
	 * Public
	 * ------------------------------- */

	destroy: function(el) {
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
	 * css property --> object
	 * ------------------------------- */

  	hasTransition: function(el) {
		var o = this._getTransform(el), ret = false;
		if (o.transition === void 0) {
			var css, values, idx, d = 0;
			css = o.$el.css(["transition-property", "transition-duration", "transition-delay"]);
			values = css["transition-property"].split(",");
			idx = values.length;
			do { --idx; } while (idx != -1 && values[idx].indexOf("transform") == -1);
			//while (idx && values[--idx].indexOf("transform")) {}
			if (idx != -1) {
				values = css["transition-duration"].split(",");
				d += parseFloat((idx < values.length)? values[idx] : values[values.length - 1]);
				values = css["transition-delay"].split(",");
				d += parseFloat((idx < values.length)? values[idx] : values[values.length - 1]);
				ret = d > 0;
			}
			o.transition = ret;
			console.log("TransformHelper.hasTransition", o.id, ret, d, css);
		} else {
			ret = o.transition;
			console.log("TransformHelper.hasTransition", o.id, ret, "(cached)");
		}
		return ret;
	},

	capture: function(el) {
		var o = this._getTransform(el);
		if (o.offset) {
			console.warn("TransformHelper.capture", o.id, "offset values still set: clearing, capturing, reapplying");
			this._clearElementTransform(o);
		}
		o.captured = this._parseTransformValues(o);
		if (o.offset) {
			this._applyElementTransform(o, o.offset.x + o.captured.x, o.offset.y + o.captured.y);
		}
	},

	release: function(el) {
		var o = this._getTransform(el);
		o.transition = o.offset = o.captured = void 0;
		console.log("TransformHelper.release", o.id);
	},

	/* -------------------------------
	 * object --> css property
	 * ------------------------------- */

	clear: function(el) {
		var o = this._getTransform(el);
		if (o.offset) {
			this._clearElementTransform(o);
			o.offset = void 0;
			console.log("TransformHelper.clear", o.id);
		} else {
			console.warn("TransformHelper.clear", o.id, "nothing to clear");
		}
	},

	move: function(el, x, y) {
		var o = this._getTransform(el);

		o.offset || (o.offset = {});
		o.offset.x = x || 0;
		o.offset.y = y || 0;

		if (!o.captured) {
			console.warn("TransformHelper.move", o.id, "captured values not set: capturing now");
			o.captured = this._parseTransformValues(o);
		}

		this._applyElementTransform(o, o.offset.x + o.captured.x, o.offset.y + o.captured.y);
	},

	/*
	_parseTransformValues: function(css) {
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
	},

	hasTransition: function(el) {
		var css, prop, ret;
		//css = window.getComputedStyle(el);
		//prop = css.webkitTransition || css.MozTransitionProperty || css.webkitTransitionProperty || css.MozTransition || css.transition;
		css = this._getTransform(el).$el.css(["transition-property", "transition"]);
		prop = css["transition-property"] || css["transition"];
		ret = prop.indexOf("transform") != -1;
		console.log("TransformHelper._hasCSSTransition", (ret?"has":"has no") + " transition", css);
		return ret;
	},

	update: function(el) {
		var o = this._getTransform(el);
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
	},
	*/
};

module.exports = TransformHelper;
