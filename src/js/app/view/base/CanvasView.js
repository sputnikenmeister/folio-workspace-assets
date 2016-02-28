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

var MIN_CANVAS_RATIO = 2;

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
	
	// properties: {
	// 	context: {
	// 		get: function() {
	// 			return this._ctx;
	// 		}
	// 	}
	// },
	
	/** @type {Object} */
	defaults: {
		values: { value: 0 },
		maxValues: { value: 1 },
		useOpaque: true,
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		// TODO: cleanup this options mess
		options = _.defaults(options, this.defaults);
		options.values = _.defaults(options.values, this.defaults.values);
		options.maxValues = _.defaults(options.maxValues, this.defaults.maxValues);
		
		this._interpolator = new Interpolator(options.values, options.maxValues);
		
		// render props
		this._color = options.color;
		this._backgroundColor = options.backgroundColor;
		this._useOpaque = options.useOpaque;
		
		// // mozOpaque
		// // --------------------------------
		if (this._useOpaque) {
			this._opaqueProp = Modernizr.prefixed("opaque", this.el, false);
			if (this._opaqueProp) {
				this.el.classList.add("color-bg");
				// this.el[this._opaqueProp] = true;
			}
		}
		
		// canvas' context init
		// --------------------------------
		this._ctx = this.el.getContext("2d");
		
		this.listenTo(this, "view:attached", function(){
			this.invalidateSize();
			// this.renderNow();
		});
	},

	_updateCanvas: function() {
		var s, m, w, h;
		
		s = getComputedStyle(this.el);
		m = getBoxEdgeStyles(s);
		w = this.el.offsetWidth;
		h = this.el.offsetHeight;
		
		console.log("%s::_updateCanvas css: %fpx x %fpx offsetSize: %fpx x %fpx", this.cid,
			m.width, m.height, w, h);
		
		// adjust html-box size
		// --------------------------------
		// if (m.boxSizing === "border-box") {
			w -= m.paddingLeft + m.paddingRight + m.borderLeftWidth + m.borderRightWidth;
			h -= m.paddingTop + m.paddingBottom + m.borderTopWidth + m.borderBottomWidth;
		// }
		this.el.style.width = w + "px";
		this.el.style.height = h + "px";
		
		// adjust canvas size to pixel ratio
		// upscale the canvas if the two ratios don't match
		// --------------------------------
		var ratio = MIN_CANVAS_RATIO;
		var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
		if (window.devicePixelRatio !== ctxRatio) {
			ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
		}
		this._canvasRatio = ratio;
		
		this._canvasWidth = w*ratio;
		this._canvasHeigth = h*ratio;
		this.el.width = this._canvasWidth;
		this.el.height = this._canvasHeigth;
		
		// colors
		// --------------------------------
		this._color || (this._color = (s.color || Globals.DEFAULT_COLORS["color"]));
		this._backgroundColor || (this._backgroundColor = (s.backgroundColor || Globals.DEFAULT_COLORS["background-color"]));
		
		// mozOpaque
		// --------------------------------
		if (this._useOpaque && this._opaqueProp) {
			// this.el.style.backgroundColor = this._backgroundColor;
			this.el[this._opaqueProp] = true;
		}
		
		// fontSize
		// --------------------------------
		this._fontSize = parseFloat(s.fontSize) * ratio;
		this._fontFamily = s.fontFamily;
		
		// save canvas context
		// --------------------------------
		this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px/1", s.fontFamily].join(" ");
		this._ctx.textAlign = "left";
		this._ctx.lineCap = "butt";
		this._ctx.lineJoin = "miter";
		this._ctx.strokeStyle = this._color;
		this._ctx.fillStyle = this._color;
		
		this._ctx.save();
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
		if (flags & View.LAYOUT_INVALID) {
			this.redraw(this._ctx, this._interpolator.renderedKeys);
			if (this._interpolator.valuesChanged) {
				this.requestRender();
			}
		}
	},
	
	// /** @override */
	// renderFrame2: function(tstamp) {
	// 	if (!this.attached) return;
	// 	
	// 	if (this._renderFlags & View.RENDER_INVALID) {
	// 		this._renderFlags &= ~View.RENDER_INVALID;
	// 		this._updateCanvas();
	// 		this._needsRedraw = true;
	// 	}
	// 	if (this._interpolator.valuesChanged) {
	// 		this._interpolator.interpolate(tstamp);
	// 		this._needsRedraw = true;
	// 	}
	// 	if (this._needsRedraw) {
	// 		this._needsRedraw = false;
	// 		this.redraw(this._interpolator.renderedKeys);
	// 	}
	// 	if (this._interpolator.valuesChanged) {
	// 		this.requestRender();
	// 	}
	// },
	
	// /** @override */
	// renderFrame3: function(tstamp, flags) {
	// 	if (!this.attached) {
	// 		return flags;
	// 	}
	// 	var needsRedraw = false;
	// 	
	// 	if (flags & View.SIZE_INVALID) {
	// 		needsRedraw = true;
	// 		this._updateCanvas();
	// 	}
	// 	if (this._interpolator.valuesChanged) {
	// 		needsRedraw = true;
	// 		this._interpolator.interpolate(tstamp);
	// 		if (this._interpolator.valuesChanged) {
	// 			this.requestRender();
	// 		}
	// 	}
	// 	if (needsRedraw) {
	// 		this.redraw(this._interpolator.renderedKeys);
	// 	}
	// },
	
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
	
	redraw: function(context, changed) {
	},
	
});

if (DEBUG) {
	CanvasView._skipLog = true;
}

module.exports = CanvasView;
