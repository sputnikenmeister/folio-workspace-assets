/* global Path2D */
/**
* @module app/view/component/progress/CanvasProgressMeter
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:underscore} */
var Color = require("color");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/prefixedProperty} */
var prefixed = require("utils/prefixedProperty");
/** @type {module:utils/svg/arcData} */
var arcData = require("utils/svg/arcData");
/** @type {module:utils/ease/linear} */
var linear = require("utils/ease/linear");
/** @type {module:utils/ease/linear} */
var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

function isSizeProp(propName) {
	return /^(offset|client)(Left|Top|Width|Height)$/.test(propName);
}

/** @type {module:app/view/base/View} */
// var View = require("app/view/base/View");
var AbstractProgressMeter = require("app/view/component/progress/AbstractProgressMeter");

var CanvasProgressMeter = AbstractProgressMeter.extend({
	
	/** @type {string} */
	cidPrefix: "canvasProgressMeter",
	/** @type {string} */
	tagName: "canvas",
	/** @type {string} */
	className: "progress-meter canvas-progress-meter",
	
	defaults: {
		size: 24, // diameter in pixels
		value: 0,
		total: 1,
		steps: 1,
		gap: 8 * (Math.PI/180), // x deg in radians
		labelFn: function(value, total, steps) {
			return ((value/total) * 100) | 0;
		},
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		AbstractProgressMeter.prototype.initialize.apply(this, arguments);
		// ProgressMeter.prototype.initialize.apply(this, arguments);
		
		// // this.setOptions(_.defaults(options, this.defaults));
		// options = _.defaults(options, this.defaults);
		// 
		// // value total
		// // --------------------------------
		// this._valueChanged = true;
		// this._value = options.value;
		// this._total = options.total;
		// 
		// this._startValue = this._value;
		// this._renderedValue = null;
		// this._valueDelta = 0;
		
		// steps
		this._steps = options.steps;
		this._arcStep = (1 / this._steps) * Math.PI * 2;
		
		// render props
		this._arcGap = options.gap;
		this._arcWidth = 1;
		this._arcStepWidth = 0.5;
		
		this._color = options.color;
		this._arcOffset = 0;//Math.PI * 1.5;
		
		// labelFn
		this._labelFn = options.labelFn;
		
		// // private easing state
		// this._duration = 0;
		// this._startTime = -1;
		// this._nextRafId = -1;
		// // this._lastRafId = -1;
		
		// size
		// --------------------------------
		this._sizeChanged = true;
		this._renderedSize = null;
		
		// canvas' context init
		// --------------------------------
		
		this._ctx = this.el.getContext("2d");
	},
	
	// remove: function() {
	// 	this._duration = 0;
	// 	if (this._nextRafId !== -1) {
	// 		this.cancelAnimationFrame(this._nextRafId);
	// 	}
	// 	return View.prototype.remove.apply(this, arguments);
	// },
	
	/* --------------------------- *
	/* public interface
	/* --------------------------- */
	
	// valueTo: function (value, duration) {
	// 	// console.log("%s::valueTo(%f, %i)", this.cid, value, duration);
	// 	this._duration = duration || 0;
	// 	this._setValue(value);
	// },
	// 
	// _setValue: function(value) {
	// 	var oldValue = this._value;
	// 	
	// 	this._value = value;
	// 	this._valueDelta = value - oldValue;
	// 	this._startValue = oldValue;
	// 	
	// 	this._valueChanged = true;
	// 	this.render();
	// },
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	/** @override */
	render: function () {
		if (!this.inDomTree) {
			this.listenToOnce(this, "view:add", this.render);
			return this;
		}
		if (this._sizeChanged) {
			this._sizeChanged = false;
			this._valueChanged = true;
			this._resize();
		}
		
		// if (this._valueChanged) {
		// 	this._valueChanged = false;
		// 	
		// 	this._startTime = -1;
		// 	if (this._nextRafId === -1) {
		// 		this._nextRafId = this.requestAnimationFrame(this.renderFrame);
		// 	}
		// 	// console.log("%s::render() [NEXT: %i]", this.cid, this._nextRafId);
		// }
		return AbstractProgressMeter.prototype.render.apply(this, arguments);
	},

	_resize: function() {
		var s = getComputedStyle(this.el);
		var m = getBoxEdgeStyles(s),
			w = this.el.clientWidth,
			h = this.el.clientHeight;
		
		// html box size
		// --------------------------------
		if (m.boxSizing == "content-box") {
			w -= m.paddingLeft + m.paddingRight + m.borderLeftWidth + m.borderRightWidth;
			h -= m.paddingTop + m.paddingBottom + m.borderTopWidth + m.borderBottomWidth;
		}
		this._renderedSize = Math.min(w, h);
		
		// adjust canvas size to pixel ratio
		// --------------------------------
		var ratio = 1, ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
		// upscale the canvas if the two ratios don't match
		if (window.devicePixelRatio !== ctxRatio) {
			ratio = window.devicePixelRatio / (ctxRatio);
		}
		
		this._renderedSize *= ratio;
		this.el.width = this._renderedSize;
		this.el.height = this._renderedSize;
		
		this._arcWidth *= ratio;
		this._arcStepWidth *= ratio;
		
		// translate 0,0 to center
		this._ctx.translate(this._renderedSize/2, this._renderedSize/2);
		
		// colors
		// --------------------------------
		this._color || (this._color = s.color || Globals.DEFAULT_COLORS["color"]);
		this._stepColor = new Color(this._color).alpha(0.5).rgbaString();
		
		// fontSize
		// --------------------------------
		this._fontSize = parseFloat(s.fontSize) * ratio;
		this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px", s.fontFamily].join(" ");
		this._ctx.textAlign = "left";
		
		// baseline
		// NOTE: use ascent data to center to cap-height
		// --------------------------------
		var fontAscent = 0.7; // default ascent value
		
		for (var key in Globals.FONT_METRICS) {
			if (s.fontFamily.indexOf(key) !== -1) {
				var o = Globals.FONT_METRICS[key];
				fontAscent = o.ascent / o.unitsPerEm;
				console.log("%s::init metrics for '%s' '%s'", this.cid, s.fontFamily, key, fontAscent, Globals.FONT_METRICS[key]);
				break;
			}
		}
		this._ctx.textBaseline = "alphabetic";
		this._baselineShift = this._fontSize * fontAscent * 0.5;
		
		// console.log(this._baselineShift, s.fontWeight, s.fontStyle, s.fontSize, s.fontFamily);
		
	},
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	// renderFrame: function(tstamp) {
	// 	if (this._startTime < 0) {
	// 		this._startTime = tstamp;
	// 	}
	// 	// var currRafId = this._nextRafId;
	// 	var currTime = tstamp - this._startTime;
	// 	
	// 	if (currTime < this._duration) {
	// 		if (this._valueDelta < 0) {
	// 			this._renderedValue = linear(currTime, this._startValue,
	// 				this._valueDelta + this._total, this._duration) - this._total;
	// 		} else {
	// 			this._renderedValue = linear(currTime, this._startValue,
	// 				this._valueDelta, this._duration);
	// 		}
	// 		this.redraw();
	// 		this._nextRafId = this.requestAnimationFrame(this.renderFrame);
	// 		// console.log("%s::update(%f) [RAF: %i] [NEXT: %i] from/to: %f/%f, curr: %f",
	// 		// 	this.cid, tstamp, currRafId, this._nextRafId, this._startValue, this._value, this._renderedValue);
	// 	} else {
	// 		this._renderedValue = this._value;
	// 		this.redraw();
	// 		this._nextRafId = -1;
	// 		// console.log("%s::update(%f) [RAF: %i] [LAST] from/to: %f/%f",
	// 		// 	this.cid, tstamp, currRafId, this._startValue, this._value );
	// 	}
	// },
	
	redraw: function() {
		var radius = this._renderedSize/2;
		
		this._ctx.clearRect(-radius, -radius, this._renderedSize, this._renderedSize);
		this._ctx.rotate(Math.PI * 1.5);
		
		radius *= 0.99;
		
		var stepStart, stepLength;
		var	arcStart, arcEnd;
		var inRadius, outRadius;
		// steps
		// --------------------------------
		stepLength = this._arcStep - (this._arcGap * 2);
		stepStart = this._arcOffset + this._arcGap;
		outRadius = radius - 0.1;
		// outRadius *= 0.999;
		inRadius = outRadius - this._arcStepWidth;
		
		this._ctx.fillStyle = this._stepColor;
		for (var i = 0; i < this._steps; i++) {
			this._ctx.beginPath();
			this._ctx.arc(0, 0, inRadius, stepStart, stepStart + stepLength, false);
			this._ctx.arc(0, 0, outRadius, stepStart + stepLength, stepStart, true);
			this._ctx.fill();
			stepStart += this._arcStep;
		}
		
		// value
		// --------------------------------
		var arcValue = (this._renderedValue / this._total) * (Math.PI * 2 - this._arcGap * 2);
		
		arcStart = this._arcGap;
		arcEnd = arcValue + this._arcGap;
		outRadius = radius - 0;
		// outRadius *= 0.999;
		inRadius = outRadius - this._arcWidth;
		
		this._ctx.fillStyle = this._color;
		this._ctx.beginPath();
		this._ctx.arc(0, 0, inRadius, arcStart, arcEnd, false);
		this._ctx.arc(0, 0, outRadius, arcEnd, arcStart, true);
		this._ctx.fill();
		
		// label
		// --------------------------------
		var labelValue = this._labelFn(this._renderedValue, this._total, this._steps);
		var labelWidth = this._ctx.measureText(labelValue).width;
		var labelLeft = labelWidth * -0.5001;
		
		this._ctx.rotate(Math.PI * -1.5);
		this._ctx.fillText(labelValue, labelLeft, this._baselineShift, labelWidth);
		
		this._ctx.lineWidth = 0.5;
		this._ctx.strokeStyle = "rgba(255,0,0,0.25)";
		this._ctx.strokeRect(labelLeft, this._baselineShift - this._fontSize, labelWidth, this._fontSize);
		
		
	},
	
	// redraw: function() {
	// 	var d = [];
	// 	for (var j = 0; j < this._steps; j++) {
	// 		d = arcData(d, this._arcOffset + (this._arcStep * j), stepLength, 9.9, 8, 0, 0);
	// 		d = arcData(d, stepStart, stepLength, 7, 8, 0, 0);
	// 		stepStart += this._arcStep;
	// 	}
	// 	this._ctx.fillStyle = "rgba(255,127,0,0.25)";
	// 	this._ctx.fill(new Path2D(d.join(" ")));
	// 	
	// 	d.length = 0;
	// 	d = arcData(d, arcStart, arcLength, 5.5, 7.5);
	// 	this._ctx.fillStyle = "rgba(255,127,0,0.5)";
	// 	this._ctx.fill(new Path2D(d.join(" ")));
	// },
});

module.exports = CanvasProgressMeter;


	
	// var remainingTime = this._duration - elapsedTime;
	// var progress = Math.min(1.0, (tstamp - this._startTime) / this._duration);
	// var valueDelta = this._value - this._startValue;
	// var easeVal = this._startValue + (valueDelta * progress);
	
	// var progress, easeVal, targetVal;
	// targetVal = this._value;
	// if (targetVal < this._startValue) {
	// 	targetVal += this._total;
	// }
	// progress = Math.min(1.0, (tstamp - this._startTime) / this._duration);
	// // progress = Math.min(1.0, this._duration / (tstamp - this._startTime));
	// easeVal = this._startValue + ((targetVal - this._startValue) * progress);
	// // easeVal = (progress * (targetVal - this._startValue)) + this._startValue;
	// easeVal = easeVal % this._total;
	// console.log("%s::update(%f) P: %f, R: %f (%f > %f > %f)",
	// 	"-", tstamp, progress, easeVal, 
	// 	this._startValue, easeVal, this._value);
