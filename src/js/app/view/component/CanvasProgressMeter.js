/**
 * @module app/view/component/progress/CanvasProgressMeter
 */

/** @type {module:underscore} */
var _ = require("underscore");

// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");
// /** @type {module:app/view/base/Interpolator} */
// var Interpolator = require("app/view/base/Interpolator");

var PI2 = Math.PI * 2;
/* NOTE: avoid negative rotations */
var BASE_ROTATION = 1 - 0.25; // of PI2 (-90 degrees)
var GAP_ARC = PI2 / 48;

/** @type {module:utils/ease/fn/easeInQuad} */
var easeIn = require("utils/ease/fn/easeInQuad");
/** @type {module:utils/ease/fn/easeOutQuad} */
var easeOut = require("utils/ease/fn/easeOutQuad");

var LOOP_OFFSET = 1.833333;
var STEP_MS = 400; // tween time base

var ARC_DEFAULTS = {
	"amount": {
		lineWidth: 0.75,
		radiusOffset: 0
	},
	"available": {
		lineWidth: 0.75,
		// lineDash: [1.3, 0.7],
		inverse: "not-available"
	},
	"not-available": {
		lineWidth: 0.8,
		lineDash: [0.3, 0.7],
		lineDashOffset: 0
	},
	"indeterminate": {
		lineWidth: 2.0, //0.8,
		lineDash: [0.3, 1.7],
		// lineDash: [0.6, 1.4],
		lineDashOffset: 0
	},
};

/**
 * @constructor
 * @type {module:app/view/component/progress/CanvasProgressMeter}
 */
module.exports = CanvasView.extend({

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
			_stalled_arc: 0,
			_stalled_loop: 0,
		},
		maxValues: {
			amount: 1,
			available: 1,
			_stalled_loop: 1,
		},
		useOpaque: true,
		labelFn: function(value, max) {
			return ((value / max) * 100) | 0;
		},
	},

	properties: {
		stalled: {
			get: function() {
				return false; //this._stalled;
			},
			set: function(value) {
				// this._setStalled(value)
			}
		}
	},

	_setStalled: function(value) {
		if (this._stalled !== value) {
			this._stalled = value;
			this.requestRender(CanvasView.MODEL_INVALID | CanvasView.LAYOUT_INVALID);
		}
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
		this._stalled = !!(options.stalled);
		this._valueStyles = {};
		this._canvasSize = null;
		this._canvasOrigin = null;
	},

	_needsLoop: false,

	/** @override */
	valueTo: function(key, value, duration) {
		if (key === "amount" && value < this.interpolator.getCurrentValue("amount")) {
			this._needsLoop = true;
		}
		CanvasView.prototype.valueTo.apply(this, arguments);
	},

	/* --------------------------- *
	/* private
	/* --------------------------- */

	/** @override */
	measureCanvas: function(w, h, s) {
		// make canvas square
		this._canvasHeight = this._canvasWidth = Math.min(w, h);
	},

	/** @override */
	updateCanvas: function() {
		// CanvasView.prototype._updateCanvas.apply(this, arguments);

		// size, lines, gaps, dashes (this._valueStyles, GAP_ARC, this._arcRadius)
		// --------------------------------
		// var arcName, s, arcDefault;
		// var mapLineDash = function(n) {
		// 	return n * this.radius * GAP_ARC;
		// };
		// var sumFn = function(s, n) {
		// 	return s + n;
		// };

		// this._canvasSize = Math.min(this._canvasWidth, this._canvasHeight);

		var s;
		// this._maxDashArc = 0
		for (var styleName in ARC_DEFAULTS) {
			s = _.defaults({}, ARC_DEFAULTS[styleName]);
			s.lineWidth *= this._canvasRatio;
			s.radius = (this._canvasWidth - s.lineWidth) / 2;
			if (s.radiusOffset) {
				s.radius += s.radiusOffset * this._canvasRatio;
			}
			if (_.isArray(s.lineDash)) {
				s.lineDash = s.lineDash.map(function(val, i, arr) {
					return val * this.radius * GAP_ARC;
				}, s);
				s.lineDashLength = s.lineDash.reduce(function(res, val, i, arr) {
					return res + val;
				}, 0);
				s.lineDashArc = s.lineDash[0] * GAP_ARC;
				// this._maxDashArc = Math.max(this._maxDashArc, s.lineDashArc);
			} else {
				s.lineDashArc = 0;
			}
			this._valueStyles[styleName] = s;
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
		this._ctx.setTransform(1, 0, 0, 1, this._canvasWidth / 2, this._canvasHeight / 2);
		this._ctx.save();
	},

	/** @override */
	redraw: function(ctx, intrp, flags) {
		this._clearCanvas(-this._canvasWidth / 2, -this._canvasHeight / 2,
			this._canvasWidth, this._canvasHeight
		);

		var s, // reused style objects
			valData, // reused for interpolated data
			arcVal; // reused arc values

		// amount label
		// --------------------------------
		valData = intrp._valueData["amount"];
		this.drawLabel(this._labelFn(valData._renderedValue, valData._maxVal));

		// indeterminate
		// --------------------------------

		/*
		var indVal;
		if (this.stalled) {
			// _ind loop indefinitely while indeterminate: restart if at end
			if (intrp.isAtTarget("_ind")) {
				// if (intrp.renderedKeys && (intrp.renderedKeys.indexOf("_ind") === -1)) {
				intrp.valueTo("_ind", 0, 0);
				intrp.valueTo("_ind", 1, 1000);
				intrp.updateValue("_ind");
			}
			indVal = intrp.getCurrentValue("_ind");
			//indVal = intrp._valueData["_ind"]._renderedValue || 0;

			// draw spinning arc
			// --------------------------------
			// s = this._valueStyles["amount"];
			// ctx.save();
			// ctx.rotate(PI2 * (BASE_ROTATION + (indVal))); // + GAP_ARC);
			// lastEndArc = this.drawArc(1,
			// 	GAP_ARC,
			// 	PI2 - GAP_ARC,
			// 	0, s);
			// ctx.restore();
			// return;

			// lineDashOffset animation
			// --------------------------------
			s = this._valueStyles["indeterminate"];
			s.lineDashOffset = s.lineDashLength * ((1 - indVal) % 3) * 3;
			this._valueStyles["available"].inverse = "indeterminate";

			// console.log("%s::redraw indVal:%o s.lineDashOffset:%o s.lineDash:%o", this.cid, indVal, s.lineDashOffset, s.lineDash[0]);

			// draw spinning wheel
			// --------------------------------
			// ctx.save();
			// ctx.rotate((PI2 / WHEEL_NUM) * indVal); // + GAP_ARC);
			// this.drawWheel(this._valueStyles["amount"], 2 / 5, 3 / 5);
			// ctx.restore();

		} else {
			if (!intrp.isAtTarget("_ind")) {
				// if (intrp.renderedKeys && (intrp.renderedKeys.indexOf("_ind") !== -1)) {
				intrp.valueTo("_ind", 0, 0);
				intrp.updateValue("_ind");
			}
			// lineDashOffset animation
			// --------------------------------
			this._valueStyles["available"].inverse = "not-available";
		}*/

		// save ctx before drawing arcs
		ctx.save();

		// loop (amount)
		// --------------------------------
		var loopVal;
		/*
		NOTE: If value "amount" has changed (with valueTo()) but no yet
		interpolated, and its last rendered value is less, then its been reset
		(a reload, a loop, etc): we trigger a 'loop' of the whole arc.
		*/
		// if ((intrp.renderedKeys.indexOf("amount") !== -1) && (valData._lastRenderedValue > valData._renderedValue)) {
		if (this._needsLoop) {
			this._needsLoop = false;
			// trigger loop
			intrp.valueTo("_loop", 1, 0);
			intrp.valueTo("_loop", 0, 750);
			intrp.updateValue("_loop");
		}
		// loopVal = intrp._valueData["_loop"]._renderedValue || 0;
		loopVal = intrp.getCurrentValue("_loop");
		ctx.rotate((PI2 * (BASE_ROTATION + (1 - loopVal)))); // + GAP_ARC);

		// amount arc
		// --------------------------------
		// var amountGapArc = GAP_ARC;
		var lastEndArc = 0;

		s = this._valueStyles["amount"];
		arcVal = loopVal + valData._renderedValue / valData._maxVal;

		if (arcVal > 0) {
			lastEndArc = this.drawArc(arcVal,
				GAP_ARC,
				PI2 - GAP_ARC,
				lastEndArc, s);
			this.drawEndCap(lastEndArc, s);
			lastEndArc = lastEndArc + GAP_ARC * 2;
		}

		// available arc
		// --------------------------------
		s = this._valueStyles["available"];
		valData = intrp._valueData["available"];

		var stepsNum = valData.length || 1;
		var stepBaseArc = PI2 / stepsNum;
		var stepAdjustArc = stepBaseArc % GAP_ARC;
		var stepGapArc = GAP_ARC + (stepAdjustArc - s.lineDashArc) / 2;

		if (Array.isArray(valData)) {
			for (var i = 0; i < stepsNum; i++) {
				arcVal = valData[i]._renderedValue / (valData[i]._maxVal / stepsNum);
				this.drawArc(arcVal,
					(i * stepBaseArc) + stepGapArc,
					((i + 1) * stepBaseArc) - stepGapArc,
					lastEndArc, s);
			}
		} else {
			arcVal = valData._renderedValue / valData._maxVal;
			this.drawArc(arcVal,
				stepGapArc,
				PI2 - stepGapArc,
				lastEndArc, s);
		}
		// restore ctx after drawing arcs
		// keep rotation transform
		//ctx.restore();

		if (this._stalled) {
			if (intrp.getTargetValue('_stalled_arc') === 0) {
				intrp.valueTo('_stalled_arc', 1, 1 * STEP_MS, easeIn).updateValue('_stalled_arc');
			}
		} else {
			if (intrp.getTargetValue('_stalled_arc') === 1) {
				intrp.valueTo('_stalled_arc', 0, 1 * STEP_MS, easeOut).updateValue('_stalled_arc');
			}
		}
		var a = intrp.getRenderedValue("_stalled_arc");
		// while arc is > 0, loop indefinitely while spinning and restart
		// if at end. Otherwise let interp exhaust arc duration
		if (a > 0) {
			if (!intrp.paused && intrp.isAtTarget('_stalled_loop')) {
				intrp
					.valueTo('_stalled_loop', 0, 0)
					.valueTo('_stalled_loop', 1, 2 * STEP_MS)
					.updateValue('_stalled_loop');
			}
		}
		var l = intrp.getRenderedValue("_stalled_loop");
		// always render while arc is > 0
		if (a > 0) {
			// arc span bounce
			var b = (l < 0.5 ? (l % 0.5) : 0.5 - (l % 0.5)) * 2;
			// bounce + main arc span
			var aa = (a * b * 0.25) + (a * 0.125) + .0001;
			// rotation loop
			var ll = l + LOOP_OFFSET;

			ctx.save();
			ctx.lineWidth = 10 * this._canvasRatio;
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "destination-out";
			ctx.strokeColor = 'red';
			ctx.beginPath();
			ctx.arc(0, 0, (this._canvasWidth) / 2, ((1 - aa) + ll) * PI2, (aa + ll) * PI2, false);
			ctx.stroke();
			ctx.restore();
		}
		ctx.restore();
	},

	drawArc: function(value, startArc, endArc, prevArc, style) {
		var valArc,
			valStartArc,
			valEndArc,
			invStyle,
			invStartArc,
			invEndArc;

		prevArc || (prevArc = 0);

		valArc = endArc - startArc;
		valEndArc = startArc + (valArc * value);
		valStartArc = Math.max(startArc, prevArc);
		if (valEndArc > valStartArc) {
			this._ctx.save();
			this.applyValueStyle(style);
			this._ctx.beginPath();
			this._ctx.arc(0, 0, style.radius, valEndArc, valStartArc, true);
			this._ctx.stroke();
			this._ctx.restore();
		}

		// if there's valueStyle, draw rest of span, minus prevArc overlap too
		if (style.inverse !== void 0) {
			invStyle = this._valueStyles[style.inverse];

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

	applyValueStyle: function(s) {
		this._ctx.lineWidth = s.lineWidth;
		if (_.isArray(s.lineDash)) {
			this._ctx.setLineDash(s.lineDash);
		}
		if (_.isNumber(s.lineDashOffset)) {
			this._ctx.lineDashOffset = s.lineDashOffset;
		}
	},


	drawNotch: function(arcPos, length, s) {
		var ex, ey, ec1, ec2;

		ex = Math.cos(arcPos);
		ey = Math.sin(arcPos);
		ec1 = s.radius;
		ec2 = s.radius - length;

		this._ctx.save();
		this.applyValueStyle(s);
		this._ctx.lineCap = "square";
		this._ctx.beginPath();
		this._ctx.moveTo(ec1 * ex, ec1 * ey);
		this._ctx.lineTo(ec2 * ex, ec2 * ey);
		this._ctx.stroke();
		this._ctx.restore();
	},

	drawEndCap: function(arcPos, s) {
		var radius = s.radius;
		this._ctx.save();
		this._ctx.lineWidth = s.lineWidth;

		this._ctx.rotate(arcPos - GAP_ARC * 2); // 1.5);
		this._ctx.beginPath();
		this._ctx.arc(0, 0, radius, GAP_ARC * 0.5, GAP_ARC * 2, false);
		this._ctx.lineTo(radius - (GAP_ARC * radius), 0);
		this._ctx.closePath();

		this._ctx.fill();
		this._ctx.stroke();
		this._ctx.restore();
	},

	drawLabel: function(labelString) {
		var labelWidth = this._ctx.measureText(labelString).width;
		this._ctx.fillText(labelString,
			labelWidth * -0.5,
			this._baselineShift, labelWidth);
	},
});

if (DEBUG) {
	module.exports.prototype._logFlags = "";
}
