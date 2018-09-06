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

// var WHEEL_DATA = "M 1.00000 0.00000 L 0.600000 0.00000M 0.913545 0.406737 L 0.548127 0.244042M 0.669131 0.743145 L 0.401478 0.445887M 0.309017 0.951057 L 0.185410 0.570634M -0.104528 0.994522 L -0.0627171 0.596713M -0.500000 0.866025 L -0.300000 0.519615M -0.809017 0.587785 L -0.485410 0.352671M -0.978148 0.207912 L -0.586889 0.124747M -0.978148 -0.207912 L -0.586889 -0.124747M -0.809017 -0.587785 L -0.485410 -0.352671M -0.500000 -0.866025 L -0.300000 -0.519615M -0.104528 -0.994522 L -0.0627171 -0.596713M 0.309017 -0.951057 L 0.185410 -0.570634M 0.669131 -0.743145 L 0.401478 -0.445887M 0.913545 -0.406737 L 0.548127 -0.244042";
// var WHEEL_DATA = [
// 	[1, 0],
// 	[0.9135454576426009, 0.40673664307580015],
// 	[0.6691306063588582, 0.7431448254773942],
// 	[0.30901699437494745, 0.9510565162951535],
// 	[-0.10452846326765333, 0.9945218953682734],
// 	[-0.4999999999999998, 0.8660254037844387],
// 	[-0.8090169943749473, 0.5877852522924732],
// 	[-0.9781476007338056, 0.20791169081775973],
// 	[-0.9781476007338057, -0.20791169081775907],
// 	[-0.8090169943749475, -0.587785252292473],
// 	[-0.5000000000000004, -0.8660254037844385],
// 	[-0.10452846326765423, -0.9945218953682733],
// 	[0.30901699437494723, -0.9510565162951536],
// 	[0.6691306063588578, -0.7431448254773946],
// 	[0.9135454576426005, -0.40673664307580093]
// ];

var WHEEL_DATA = [
	[1, 0],
	[0.9238795325112867, 0.3826834323650898],
	[0.7071067811865476, 0.7071067811865475],
	[0.38268343236508984, 0.9238795325112867],
	[6.123233995736766e-17, 1],
	[-0.3826834323650897, 0.9238795325112867],
	[-0.7071067811865475, 0.7071067811865476],
	[-0.9238795325112867, 0.3826834323650899],
	[-1, 1.2246467991473532e-16],
	[-0.9238795325112868, -0.38268343236508967],
	[-0.7071067811865477, -0.7071067811865475],
	[-0.38268343236509034, -0.9238795325112865],
	[-1.8369701987210297e-16, -1],
	[0.38268343236509, -0.9238795325112866],
	[0.7071067811865474, -0.7071067811865477],
	[0.9238795325112865, -0.3826834323650904]
];
var WHEEL_NUM = WHEEL_DATA.length;

// var ARC_ERR = 0.00001;
// var ARC_ERR = 0.0;
// var PI = Math.PI;
var PI2 = Math.PI * 2;

var GAP_ARC = PI2 / 48;
// var CAP_SCALE = 2; // cap arc = GAP_ARC * CAP_SCALE
// var WAIT_CYCLE_VALUE = 1;
// var WAIT_CYCLE_MS = 300; // milliseconds per interpolation loop

/* NOTE: avoid negative rotations */
var BASE_ROTATION = 1 - 0.25; // of PI2 (-90 degrees)

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
			_ind: 0 // indeterminate animation goes backwards from 1
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

	properties: {
		indeterminate: {
			get: function() {
				return this._indeterminate;
			},
			set: function(value) {
				this._setIndeterminate(value)
			}
		}
	},

	_setIndeterminate: function(value) {
		if (this._indeterminate !== value) {
			this._indeterminate = value;
			// this.interpolator.valueTo("_ind", 0, 0);
			// if (value) {
			// this.interpolator.valueTo("_ind", 1, 300);
			// } else {
			// 	this.interpolator.valueTo("_ind", 0, 0);
			// }
			// this.interpolator.updateValue("_ind");
			// intrp.updateValue("_ind");

			// this.requestRender(CanvasView.MODEL_INVALID | CanvasView.LAYOUT_INVALID);
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
		this._indeterminate = !!(options.indeterminate);
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
		/*var indVal;
		if (this.indeterminate) {
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
			// this._ctx.save();
			// this._ctx.rotate(PI2 * (BASE_ROTATION + (indVal))); // + GAP_ARC);
			// lastEndArc = this.drawArc(1,
			// 	GAP_ARC,
			// 	PI2 - GAP_ARC,
			// 	0, s);
			// this._ctx.restore();
			// return;

			// lineDashOffset animation
			// --------------------------------
			s = this._valueStyles["indeterminate"];
			s.lineDashOffset = s.lineDashLength * ((1 - indVal) % 3) * 3;
			this._valueStyles["available"].inverse = "indeterminate";

			// console.log("%s::redraw indVal:%o s.lineDashOffset:%o s.lineDash:%o", this.cid, indVal, s.lineDashOffset, s.lineDash[0]);

			// draw spinning wheel
			// --------------------------------
			// this._ctx.save();
			// this._ctx.rotate((PI2 / WHEEL_NUM) * indVal); // + GAP_ARC);
			// this.drawWheel(this._valueStyles["amount"], 2 / 5, 3 / 5);
			// this._ctx.restore();

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
		this._ctx.save();

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
		this._ctx.rotate((PI2 * (BASE_ROTATION + (1 - loopVal)))); // + GAP_ARC);

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
		this._ctx.restore();
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

	drawWheel: function(s, r1, r2) {
		this._ctx.save();
		this.applyValueStyle(s);
		// this._ctx.lineDashArr = s.radius*0.5;
		// this._ctx.lineDashOffset = s.radius * 0.5;
		var cx, cy;
		for (var i = 0; i < WHEEL_NUM; i++) {
			this._ctx.beginPath();
			cx = WHEEL_DATA[i][0] * s.radius;
			cy = WHEEL_DATA[i][1] * s.radius;
			this._ctx.moveTo(
				cx * r1,
				cy * r1);
			this._ctx.lineTo(
				cx * r2,
				cy * r2);
			this._ctx.stroke();

		}
		this._ctx.restore();
	},

	// drawWheel: function() {
	// 	var size = (this._canvasWidth / 2) * 0.8;
	// 	this._ctx.save();
	// 	this._ctx.scale(size, size);
	// 	// this._ctx.lineDashOffset = (1 / size) * 0.1;
	// 	this._ctx.lineWidth = (1 / size) * 1.2;
	// 	this._ctx.stroke(new Path2D(WHEEL_DATA));
	// 	this._ctx.restore();
	// },

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