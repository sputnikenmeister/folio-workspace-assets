/* global Path2D */
/**
 * @module app/view/component/progress/CanvasProgressMeter
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:underscore} */
var Color = require("color");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/base/Interpolator} */
var Interpolator = require("app/view/base/Interpolator");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/ease/linear} */
var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

var ARC_ERR = 0.00001;
// var ARC_ERR = 0.0;
var PI = Math.PI;
var PI2 = Math.PI * 2;

var MIN_CANVAS_RATIO = 2;
var GAP_ARC = PI2 / 48;
var CAP_SCALE = 2; // cap arc = GAP_ARC * CAP_SCALE
var WAIT_CYCLE_VALUE = 1;
var WAIT_CYCLE_MS = 300; // milliseconds per interpolation loop

var ARC_DEFAULTS = {
	"amount": {
		lineWidth: 0.8,
		radiusOffset: 0
	},
	"not-available": {
		lineWidth: 1.0,
		lineDash: [0.3, 0.7]
	},
	"available": {
		lineWidth: 0.8,
		inverse: "not-available"
	},
};

/**
 * @constructor
 * @type {module:app/view/component/progress/CanvasProgressMeter}
 */
module.exports = View.extend({

	/** @type {string} */
	cidPrefix: "canvasProgressMeter",
	/** @type {string} */
	tagName: "canvas",
	/** @type {string} */
	className: "progress-meter canvas-progress-meter",

	defaults: {
		values: {
			amount: 0,
			available: 0,
			_loop: 0,
		},
		maxValues: {
			amount: 1,
			available: 1,
		},
		useOpaque: true,
		labelFn: function(value, max) {
			return ((value / max) * 100) | 0;
		},
	},

	defaultKey: "amount",

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	/** @override */
	initialize: function(options) {
		// if (options.hasOwnProperty("values")) {}
		options = _.defaults(options, this.defaults);

		this._interpolator = new Interpolator(options.values, options.maxValues);

		// render props
		this._color = options.color;
		this._backgroundColor = options.backgroundColor;
		this._labelFn = options.labelFn;
		this._useOpaque = options.useOpaque;

		// mozOpaque
		// --------------------------------
		if (this._useOpaque) {
			this._opaqueProp = Modernizr.prefixed("opaque", this.el, false);
			if (this._opaqueProp) {
				this.el.classList.add("color-bg");
				this.el[this._opaqueProp] = true;
			}
		}

		// size
		// --------------------------------
		this._canvasSize = null;
		this._valueStyles = {};

		// canvas' context init
		// --------------------------------
		this._ctx = this.el.getContext("2d");

		this.listenTo(this, "view:attached", function(view) {
			// this.invalidateSize();
			// this.renderNow();
			view.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
		});
	},

	_updateCanvas: function() {
		var s = getComputedStyle(this.el);
		var m = getBoxEdgeStyles(s);
		// var w = this.el.clientWidth, h = this.el.clientHeight;
		var w = this.el.offsetWidth,
			h = this.el.offsetHeight;

		// adjust html-box size to square aspect ratio
		// --------------------------------
		if (m.boxSizing === "border-box") {
			w -= m.paddingLeft + m.paddingRight + m.borderLeftWidth + m.borderRightWidth;
			h -= m.paddingTop + m.paddingBottom + m.borderTopWidth + m.borderBottomWidth;
		}
		this._canvasSize = Math.min(w, h);
		this.el.style.width = this._canvasSize + "px";
		this.el.style.height = this._canvasSize + "px";

		// adjust canvas size to pixel ratio
		// upscale the canvas if the two ratios don't match
		// --------------------------------
		var ratio = MIN_CANVAS_RATIO;
		var ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
		if (window.devicePixelRatio !== ctxRatio) {
			ratio = Math.max(window.devicePixelRatio / ctxRatio, MIN_CANVAS_RATIO);
		}
		this._canvasRatio = ratio;

		this._canvasSize *= ratio;
		this.el.width = this._canvasSize;
		this.el.height = this._canvasSize;

		// lines, gaps, dashes (this._valueStyles, GAP_ARC, this._arcRadius)
		// --------------------------------
		var arcName, arcObj, arcDefault;
		var mapLineDash = function(n) {
			return n * this.radius * GAP_ARC;
		};
		var sumFn = function(s, n) {
			return s + n;
		};
		this._maxDashArc = 0;

		for (arcName in ARC_DEFAULTS) {
			arcDefault = ARC_DEFAULTS[arcName];
			arcObj = this._valueStyles[arcName] = {};
			arcObj.inverse = arcDefault.inverse; // copy inverse key
			// arcObj.inverse2 = arcDefault.inverse2;
			arcObj.lineWidth = arcDefault.lineWidth * ratio;
			arcObj.radius = (this._canvasSize - arcObj.lineWidth) / 2;
			if (arcDefault.radiusOffset) {
				arcObj.radius += arcDefault.radiusOffset * ratio;
			}
			if (arcDefault.lineDash && arcDefault.lineDash.length) {
				arcObj.lineDash = arcDefault.lineDash.map(mapLineDash, arcObj);
				arcObj.lineDashArc = arcDefault.lineDash[0] * GAP_ARC;
				arcObj.lineDashLength = arcObj.lineDash.reduce(sumFn);
				this._maxDashArc = Math.max(this._maxDashArc, arcObj.lineDashArc);
			} else {
				arcObj.lineDashArc = 0;
			}
		}

		// colors
		// --------------------------------
		this._color || (this._color = (s.color || Globals.DEFAULT_COLORS["color"]));
		this._backgroundColor || (this._backgroundColor = (s.backgroundColor || Globals.DEFAULT_COLORS["background-color"]));

		// fontSize
		// --------------------------------
		this._fontSize = parseFloat(s.fontSize) * ratio;

		this._baselineShift = 0.7; // set a default value
		// NOTE: Center baseline: use ascent data to center to x-height, or sort-of.
		// with ascent/descent values (0.7, -0.3), x-height is 0.4
		for (var mKey in Globals.FONT_METRICS) {
			if (s.fontFamily.indexOf(mKey) !== -1) {
				var mObj = Globals.FONT_METRICS[mKey];
				this._baselineShift = (mObj.ascent + mObj.descent) / mObj.unitsPerEm;
				break;
			}
		}
		this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it
		this._baselineShift = Math.round(this._baselineShift);

		// save canvas context
		// --------------------------------
		// reset matrix and translate 0,0 to center
		this._ctx.setTransform(1, 0, 0, 1, this._canvasSize / 2, this._canvasSize / 2);
		this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px/1", s.fontFamily].join(" ");
		this._ctx.textAlign = "left";
		this._ctx.lineCap = "butt";
		this._ctx.lineJoin = "miter";
		this._ctx.strokeStyle = this._color;
		this._ctx.fillStyle = this._color;

		this._ctx.save();
	},

	/* --------------------------- *
	/* render
	/* --------------------------- */

	/** @override */
	renderFrame: function(tstamp, flags) {
		if (!this.attached) return;

		if (flags & View.SIZE_INVALID) {
			this._updateCanvas();
			this._needsRedraw = true;
		}
		if (this._interpolator.valuesChanged) {
			this._interpolator.interpolate(tstamp);
			this._needsRedraw = true;

		}
		if (this._needsRedraw) {
			this._needsRedraw = false;
			this.redraw(this._interpolator.renderedKeys || []);
		}
		if (this._interpolator.valuesChanged) {
			this.requestRender();
		}
	},

	/* --------------------------- *
	/* public
	/* --------------------------- */

	getTargetValue: function(key) {
		return this._interpolator.getTargetValue(key || this.defaultKey);
	},

	getRenderedValue: function(key) {
		return this._interpolator.getRenderedValue(key || this.defaultKey);
	},

	valueTo: function(value, duration, key) {
		this._interpolator.valueTo(key || this.defaultKey, value, duration);
		this.requestRender();
	},

	// updateValue: function(key) {
	// 	return this._interpolator.updateValue(key || this.defaultKey);
	// },

	/* --------------------------- *
	/* private
	/* --------------------------- */

	redraw: function(changed) {
		var canvasPos = -this._canvasSize / 2;
		this._ctx.clearRect(canvasPos, canvasPos, this._canvasSize, this._canvasSize);

		if (this._useOpaque) {
			this._ctx.save();
			this._ctx.fillStyle = this._backgroundColor;
			this._ctx.fillRect(canvasPos, canvasPos, this._canvasSize, this._canvasSize);
			this._ctx.restore();
		}

		var loopValue = this._interpolator._valueData["_loop"]._renderedValue || 0;
		var amountData = this._interpolator._valueData["amount"];
		var availableData = this._interpolator._valueData["available"];

		var amountStyle = this._valueStyles["amount"];
		var availableStyle = this._valueStyles["available"];

		// amount label
		// --------------------------------
		this.drawLabel(this._labelFn(amountData._renderedValue, amountData._maxVal));

		// save ctx before drawing arcs
		this._ctx.save();

		// loop rotation
		// --------------------------------
		// trigger loop
		if ((changed.indexOf("amount") !== -1) && amountData._lastRenderedValue > amountData._renderedValue) {
			this.valueTo("_loop", 1, 0);
			this.valueTo("_loop", 0, 750);
			this.updateValue("_loop");
		}
		this._ctx.rotate(PI2 * ((1 - loopValue) - 0.25));

		// amount arc
		// --------------------------------
		var amountGapArc = GAP_ARC;
		var amountEndArc = 0;
		var amountValue = loopValue + amountData._renderedValue / amountData._maxVal;

		if (amountValue > 0) {
			amountEndArc = this.drawArc(amountStyle, amountValue, amountGapArc, PI2 - amountGapArc);
			this.drawEndCap(amountStyle, amountEndArc);
			amountEndArc = amountEndArc + amountGapArc * 2;
		}

		// available arc
		// --------------------------------
		var stepsNum = availableData.length || 1;
		var stepBaseArc = PI2 / stepsNum;
		var stepAdjustArc = stepBaseArc % GAP_ARC;
		var stepGapArc = GAP_ARC + (stepAdjustArc - availableStyle.lineDashArc) / 2;

		if (Array.isArray(availableData)) {
			for (var o, i = 0; i < stepsNum; i++) {
				o = availableData[i];
				this.drawArc(availableStyle, o._renderedValue / (o._maxVal / stepsNum), (i * stepBaseArc) + stepGapArc, ((i + 1) * stepBaseArc) - stepGapArc, amountEndArc);
			}
		} else {
			this.drawArc(availableStyle, availableData._renderedValue / availableData._maxVal, stepGapArc, PI2 - stepGapArc, amountEndArc);
		}
		// restore ctx after drawing arcs
		this._ctx.restore();
	},

	drawArc: function(valueStyle, value, startArc, endArc, prevArc) {
		var valArc, invStyle,
			valStartArc, valEndArc,
			invStartArc, invEndArc;
		prevArc || (prevArc = 0);

		valArc = endArc - startArc;
		valEndArc = startArc + (valArc * value);
		valStartArc = Math.max(startArc, prevArc);
		if (valEndArc > valStartArc) {
			this._ctx.save();
			this.applyValueStyle(valueStyle);
			this._ctx.beginPath();
			this._ctx.arc(0, 0, valueStyle.radius, valEndArc, valStartArc, true);
			this._ctx.stroke();
			this._ctx.restore();
		}
		// if there's valueStyle, draw rest of span, minus prevArc overlap too
		if (valueStyle.inverse !== void 0) {
			invStyle = this._valueStyles[valueStyle.inverse];
			invEndArc = valEndArc + (valArc * (1 - value));
			invStartArc = Math.max(valEndArc, prevArc);
			if (invEndArc > invStartArc) {
				this._ctx.save();
				this.applyValueStyle(invStyle);
				this._ctx.beginPath();
				this._ctx.arc(0, 0, invStyle.radius, invEndArc, invStartArc, true);
				this._ctx.stroke();
				this._ctx.restore();
			}
		}
		return valEndArc;
	},

	applyValueStyle: function(styleObj) {
		this._ctx.lineWidth = styleObj.lineWidth;
		if (styleObj.lineDash) {
			this._ctx.setLineDash(styleObj.lineDash);
		}
		if (styleObj.lineDashOffset) {
			this._ctx.lineDashOffset = styleObj.lineDashOffset;
		}
	},

	drawLabel: function(labelString) {
		var labelWidth = this._ctx.measureText(labelString).width;
		this._ctx.fillText(labelString,
			labelWidth * -0.5,
			this._baselineShift, labelWidth);
	},

	drawEndCap: function(valueStyle, arcPos) {
		var radius = valueStyle.radius;
		this._ctx.save();
		this._ctx.lineWidth = valueStyle.lineWidth;

		this._ctx.rotate(arcPos - GAP_ARC * 1.5);
		this._ctx.beginPath();
		this._ctx.arc(0, 0, radius, GAP_ARC * 0.5, GAP_ARC * 2, false);
		this._ctx.lineTo(radius - (GAP_ARC * radius), 0);
		this._ctx.closePath();

		this._ctx.fill();
		this._ctx.stroke();
		this._ctx.restore();
	},
});

if (DEBUG) {
	module.exports.prototype._logFlags = "";
}