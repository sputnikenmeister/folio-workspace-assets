/* global Path2D */
/**
 * @module app/view/component/progress/CanvasView
 */

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:color} */
// var Color = require("color");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/base/Interpolator} */
var Interpolator = require("app/view/base/Interpolator");
/** @type {module:utils/css/getBoxEdgeStyles} */
var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

var MIN_CANVAS_RATIO = 1; // /Firefox/.test(window.navigator.userAgent)? 2 : 1;

/**
 * @constructor
 * @type {module:app/view/component/progress/CanvasView}
 */
var CanvasView = View.extend({

	/** @type {string} */
	cidPrefix: "canvasView",
	/** @type {string} */
	tagName: "canvas",
	/** @type {string} */
	className: "canvas-view",

	properties: {
		context: {
			get: function() {
				return this._ctx;
			}
		},
		interpolator: {
			get: function() {
				return this._interpolator;
			}
		},
		canvasRatio: {
			get: function() {
				return this._canvasRatio;
			}
		},
	},

	/** @type {Object} */
	defaults: {
		values: {
			value: 0
		},
		maxValues: {
			value: 1
		},
		useOpaque: true,
	},

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	/** @override */
	initialize: function(options) {
		// TODO: cleanup this options mess
		options = _.defaults(options, this.defaults);
		options.values = _.defaults(options.values, this.defaults.values);
		options.maxValues = _.defaults(options.maxValues, this.defaults.maxValues);

		this._interpolator = new Interpolator(options.values, options.maxValues);
		this._useOpaque = options.useOpaque;
		this._options = _.pick(options, "color", "backgroundColor");

		// opaque background
		// --------------------------------
		var ctxOpts = {};
		// if (this._useOpaque) {
		// 	this._opaqueProp = Modernizr.prefixed("opaque", this.el, false);
		// 	if (this._opaqueProp) {
		// 		this.el[this._opaqueProp] = true;
		// 	} else {
		// 		ctxOpts.alpha = true;
		// 	}
		// 	this.el.classList.add("color-bg");
		// }

		// canvas' context init
		// --------------------------------
		this._ctx = this.el.getContext("2d", ctxOpts);

		// adjust canvas size to pixel ratio
		// upscale the canvas if the two ratios don't match
		// --------------------------------
		var ratio = MIN_CANVAS_RATIO;
		var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
		if (window.devicePixelRatio !== ctxRatio) {
			// ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
			ratio = window.devicePixelRatio / ctxRatio;
			ratio = Math.max(ratio, MIN_CANVAS_RATIO);
		}
		this._canvasRatio = ratio;
		// console.log("%s::init canvasRatio: %f", this.cid, this._canvasRatio);

		this.listenTo(this, "view:attached", function() {
			// this.invalidateSize();
			// this.renderNow();
			this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
		});
	},

	// _computeCanvasRatio: function() {
	// 	var ratio = MIN_CANVAS_RATIO;
	// 	var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
	// 	if (window.devicePixelRatio !== ctxRatio) {
	// 		// ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
	// 		ratio = window.devicePixelRatio / ctxRatio;
	// 		ratio = Math.max(ratio, MIN_CANVAS_RATIO);
	// 	}
	// 	this._canvasRatio = ratio;
	// },

	_updateCanvas: function() {
		// adjust canvas size to pixel ratio
		// upscale the canvas if the two ratios don't match
		// --------------------------------

		var s = getComputedStyle(this.el);

		// this._canvasWidth = this.el.offsetWidth;
		// this._canvasHeight = this.el.offsetHeight;
		this._canvasWidth = this.el.scrollWidth;
		this._canvasHeight = this.el.scrollHeight;

		if (s.boxSizing === "border-box") {
			var m = getBoxEdgeStyles(s);
			this._canvasWidth -= m.paddingLeft + m.paddingRight + m.borderLeftWidth + m.borderRightWidth;
			this._canvasHeight -= m.paddingTop + m.paddingBottom + m.borderTopWidth + m.borderBottomWidth;
		}

		this._canvasWidth *= this._canvasRatio;
		this._canvasHeight *= this._canvasRatio;

		this.measureCanvas(this._canvasWidth, this._canvasHeight, s);
		this.el.width = this._canvasWidth;
		this.el.height = this._canvasHeight;
		// this.el.style.height = h + "px";
		// this.el.style.width = w + "px";

		// colors
		// --------------------------------
		this._color = this._options.color ||
			s.color || Globals.DEFAULT_COLORS["color"];
		this._backgroundColor = this._options.backgroundColor ||
			s.backgroundColor || Globals.DEFAULT_COLORS["background-color"];

		// mozOpaque
		// --------------------------------
		if (this._useOpaque && this._opaqueProp) {
			// this.el.style.backgroundColor = this._backgroundColor;
			this.el[this._opaqueProp] = true;
		}

		// fontSize
		// --------------------------------
		this._fontSize = parseFloat(s.fontSize) * this._canvasRatio;
		this._fontFamily = s.fontFamily;

		// prepare canvas context
		// --------------------------------
		this._ctx.restore();

		this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px/1", s.fontFamily].join(" ");
		this._ctx.textAlign = "left";
		this._ctx.lineCap = "butt";
		this._ctx.lineJoin = "miter";
		this._ctx.strokeStyle = this._color;
		this._ctx.fillStyle = this._color;

		this.updateCanvas(this._ctx);
		this._ctx.save();

		// console.group(this.cid+"::_updateCanvas");
		// console.log("ratio:    %f (min: %f, device: %f, context: %s)", this._canvasRatio, MIN_CANVAS_RATIO, window.devicePixelRatio, this._ctx.webkitBackingStorePixelRatio || "(webkit-only)");
		// console.log("colors:   fg: %s bg: %s", this._color, this._backgroundColor);
		// console.log("style:    %s, %s, padding: %s (%s)", s.width, s.height, s.padding, s.boxSizing);
		// console.log("box:      %f x %f px", m.width, m.height);
		// console.log("measured: %f x %f px", w, h);
		// console.log("canvas:   %f x %f px", this._canvasWidth, this._canvasHeight);
		// console.groupEnd();
	},

	updateCanvas: function() {
		/* abstract */
	},

	measureCanvas: function() {
		/* abstract */
	},

	_getFontMetrics: function(str) {
		var key, idx, mObj, mIdx = str.length;
		for (key in Globals.FONT_METRICS) {
			idx = str.indexOf(key);
			if (idx !== -1 && idx < mIdx) {
				mIdx = idx;
				mObj = Globals.FONT_METRICS[key];
			}
		}
		return mObj;
	},

	_clearCanvas: function(x, y, w, h) {
		this._ctx.clearRect(x, y, w, h);
		if (this._useOpaque) {
			this._ctx.save();
			this._ctx.fillStyle = this._backgroundColor;
			this._ctx.fillRect(x, y, w, h);
			this._ctx.restore();
		}
	},

	_setStyle: function(s) {
		CanvasView.setStyle(this._ctx, s);
	},

	/* --------------------------- *
	/* render
	/* --------------------------- */

	/** @override */
	render: function() {
		if (this.attached) {
			return this.renderNow();
		}
		return this;
	},

	/** @override */
	renderFrame: function(tstamp, flags) {
		if (!this.attached) {
			return flags;
		}
		if (flags & View.SIZE_INVALID) {
			this._updateCanvas();
		}
		if (this._interpolator.valuesChanged) {
			flags |= View.LAYOUT_INVALID;
			this._interpolator.interpolate(tstamp);
		}
		if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
			this.redraw(this._ctx, this._interpolator, flags);
			if (this._interpolator.valuesChanged) {
				this.requestRender();
			}
		}
	},

	/* --------------------------- *
	/* public
	/* --------------------------- */

	getValue: function(key) {
		return this._interpolator.getValue(key);
	},

	getRenderedValue: function(key) {
		return this._interpolator.getRenderedValue(key);
	},

	valueTo: function(value, duration, key) {
		this._interpolator.valueTo(value, duration, key);
		this.requestRender(View.MODEL_INVALID | View.LAYOUT_INVALID);
	},

	// updateValue: function(key) {
	// 	return this._interpolator.updateValue(key || this.defaultKey);
	// },

	/* --------------------------- *
	/* redraw
	/* --------------------------- */

	redraw: function(context, changed) {},

}, {
	setStyle: function(ctx, s) {
		if (typeof s != "object") return;
		for (var p in s) {
			switch (typeof ctx[p]) {
				case "undefined":
					break;
				case "function":
					if (Array.isArray(s[p])) ctx[p].apply(ctx, s[p]);
					else ctx[p].call(ctx, s[p]);
					break;
				default:
					ctx[p] = s[p];
			}
		}
	}
});

if (DEBUG) {
	CanvasView.prototype._logFlags = "";
}

module.exports = CanvasView;