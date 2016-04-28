/**
 * @module app/view/component/progress/CanvasProgressMeter
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");
// /** @type {module:app/view/base/Interpolator} */
// var Interpolator = require("app/view/base/Interpolator");

var ARC_ERR = 0.00001;
// var ARC_ERR = 0.0;
var PI = Math.PI;
var PI2 = Math.PI * 2;

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
var CanvasProgressMeter = CanvasView.extend({

	/** @type {string} */
	cidPrefix: "canvasProgressMeter",
	/** @type {string} */
	className: "progress-meter canvas-progress-meter",

	defaultKey: "amount",

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

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	/** @override */
	initialize: function(options) {
		// TODO: cleanup options mess in CanvasView
		CanvasView.prototype.initialize.apply(this, arguments);
		// options = _.defaults(options, this.defaults);

		this._labelFn = options.labelFn;
		this._valueStyles = {};
		this._canvasSize = null;
		this._canvasOrigin = null;
	},

	_updateCanvas: function() {
		CanvasView.prototype._updateCanvas.apply(this, arguments);

		// size, lines, gaps, dashes (this._valueStyles, GAP_ARC, this._arcRadius)
		// --------------------------------
		var arcName, arcObj, arcDefault;
		var mapLineDash = function(n) {
			return n * this.radius * GAP_ARC;
		};
		var sumFn = function(s, n) {
			return s + n;
		};

		this._canvasSize = Math.min(this._canvasWidth, this._canvasWidth); // / this._canvasRatio;
		this._maxDashArc = 0;

		for (arcName in ARC_DEFAULTS) {
			arcDefault = ARC_DEFAULTS[arcName];
			arcObj = this._valueStyles[arcName] = {};
			arcObj.inverse = arcDefault.inverse; // copy inverse key
			// arcObj.inverse2 = arcDefault.inverse2;
			arcObj.lineWidth = arcDefault.lineWidth * this._canvasRatio;
			arcObj.radius = (this._canvasSize - arcObj.lineWidth) / 2;
			if (arcDefault.radiusOffset) {
				arcObj.radius += arcDefault.radiusOffset * this._canvasRatio;
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

		// baselineShift
		// --------------------------------
		// NOTE: Center baseline: use ascent data to center to x-height, or sort-of.
		// with ascent/descent values (0.7, -0.3), x-height is 0.4
		var mObj = this._getFontMetrics(this._fontFamily);
		this._baselineShift = mObj ? (mObj.ascent + mObj.descent) / mObj.unitsPerEm : 0.7; // default value
		this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it
		this._baselineShift = Math.round(this._baselineShift);

		// save canvas context
		// --------------------------------
		// reset matrix and translate 0,0 to center
		this._ctx.restore();
		this._ctx.setTransform(1, 0, 0, 1, this._canvasWidth / 2, this._canvasHeigth / 2);
		this._ctx.save();
	},

	/* --------------------------- *
	/* private
	/* --------------------------- */

	/** @override */
	redraw: function(context, interpolator) {
		this._clearCanvas(-this._canvasWidth / 2, -this._canvasHeigth / 2, this._canvasWidth, this._canvasHeigth);

		var loopValue = interpolator._valueData["_loop"]._renderedValue || 0;
		var amountData = interpolator._valueData["amount"];
		var availableData = interpolator._valueData["available"];

		var amountStyle = this._valueStyles["amount"];
		var availableStyle = this._valueStyles["available"];

		// amount label
		// --------------------------------
		this.drawLabel(this._labelFn(amountData._renderedValue, amountData._maxVal));

		// save ctx before drawing arcs
		this._ctx.save();

		// loop rotation
		// --------------------------------
		// if (interpolator.renderedKeys && (interpolator.renderedKeys.indexOf("amount") !== -1)) {
		// 	console.log("%s::redraw (_loop) max: %s last: %s curr: %s", this.cid,
		// 		amountData._maxVal,
		// 		amountData._lastRenderedValue,
		// 		amountData._renderedValue
		// 	);
		// }
		if (interpolator.renderedKeys && (interpolator.renderedKeys.indexOf("amount") !== -1) && (amountData._lastRenderedValue > amountData._renderedValue)) {
			// trigger loop
			interpolator.valueTo(1, 0, "_loop");
			interpolator.valueTo(0, 750, "_loop");
			interpolator.updateValue("_loop");
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
	CanvasProgressMeter.prototype._skipLog = true;
}

module.exports = CanvasProgressMeter;
