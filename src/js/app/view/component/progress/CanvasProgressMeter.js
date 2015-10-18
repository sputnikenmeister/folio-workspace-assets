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
/** @type {module:utils/svg/arcData} */
var arcData = require("utils/svg/arcData");
/** @type {module:utils/ease/linear} */
var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

/** @type {module:app/view/component/progress/AbstractProgressMeter} */
var AbstractProgressMeter = require("app/view/component/progress/AbstractProgressMeter");

function isSizeProp(propName) {
	return /^(offset|client)(Left|Top|Width|Height)$/.test(propName);
}

/**
* @constructor
* @type {module:app/view/component/progress/CanvasProgressMeter}
*/
var CanvasProgressMeter = AbstractProgressMeter.extend({
	
	/** @type {string} */
	cidPrefix: "canvasProgressMeter",
	/** @type {string} */
	tagName: "canvas",
	/** @type {string} */
	className: "progress-meter canvas-progress-meter color-bg color-no-tx",
	
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
	
	events: {
		"transitionend": function(ev) {
			console.log("%s::transitionend prop:'%s'", ev.propertyName);
			switch (ev.propName) {
				case "color":
				case "background-color":
				this._canvasChanged = true;
				this.render();
				break;
				// default:
				// break;
			}
		}
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		AbstractProgressMeter.prototype.initialize.apply(this, arguments);
		
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
		
		// size
		// --------------------------------
		this._canvasChanged = true;
		this._canvasSize = null;
		
		// canvas' context init
		// --------------------------------
		var opaqueProp = Modernizr.prefixed("opaque", this.el, false);
		if (opaqueProp){//this.el.hasOwnProperty("mozOpaque")) {
			this.el[opaqueProp] = true;
			// console.log(opaqueProp);
		}
		this._ctx = this.el.getContext("2d");
	},

	_initCanvas: function() {
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
		this._canvasSize = Math.min(w, h);
		
		// adjust canvas size to pixel ratio
		// --------------------------------
		var ratio = 1, ctxRatio = this._ctx.webkitBackingStorePixelRatio || 1;
		// upscale the canvas if the two ratios don't match
		if (window.devicePixelRatio !== ctxRatio) {
			ratio = window.devicePixelRatio / (ctxRatio);
		}
		
		this._canvasSize *= ratio;
		this.el.width = this._canvasSize;
		this.el.height = this._canvasSize;
		
		this._arcWidth *= ratio;
		this._arcStepWidth *= ratio;
		
		// translate 0,0 to center
		this._ctx.translate(this._canvasSize/2, this._canvasSize/2);
		
		// colors
		// --------------------------------
		this._color || (this._color = s.color || Globals.DEFAULT_COLORS["color"]);
		this._backgroundColor || (this._backgroundColor = s.backgroundColor || Globals.DEFAULT_COLORS["background-color"]);
		this._stepColor = this._color;//new Color(this._color).alpha(0.5).rgbaString();
		
		console.log("%s::colors fg:[%s:%s] bg:[%s:%s]", this.cid,
			s.color, this._color, s.backgroundColor, this._backgroundColor
		);
		
		// fontSize
		// --------------------------------
		this._fontSize = parseFloat(s.fontSize) * ratio;
		this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px", s.fontFamily].join(" ");
		this._ctx.textAlign = "left";
		
		// baseline
		// NOTE: use ascent data to center to cap-height
		// --------------------------------
		var fontAscent = 0.7, fontDescent = 0.3; // default ascent/descent values
		
		for (var key in Globals.FONT_METRICS) {
			if (s.fontFamily.indexOf(key) !== -1) {
				var o = Globals.FONT_METRICS[key];
				fontAscent = o.ascent / o.unitsPerEm;
				fontDescent = Math.abs(o.descent) / o.unitsPerEm;
				break;
			}
		}
		this._baselineShift = this._fontSize * (fontAscent - fontDescent) * 0.5;
		// this._ctx.textBaseline = "alphabetic";
		
		// console.log("%s::fontMetrics %s s:'%f' a:'%f' d:%fpx", this.cid,
		// 	s.fontFamily,
		// 	this._baselineShift,
		// 	fontAscent,
		// 	fontDescent
		// );
	},
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	/** @override */
	render: function () {
		if (!this.inDomTree) {
			if (!this._renderPending) {
				this._renderPending = true;
				this.listenToOnce(this, "view:add", this.render);
			}
			return this;
		}
		this._renderPending = false;
		
		if (this._canvasChanged) {
			this._canvasChanged = false;
			this._initCanvas();
			this._valueChanged = true;
		}
		return AbstractProgressMeter.prototype.render.apply(this, arguments);
	},
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	redraw: function() {
		var radius = this._canvasSize/2;
		
		this._ctx.clearRect(-radius, -radius, this._canvasSize, this._canvasSize);
		if (Modernizr.prefixed("opaque", this.el)) {
			this._ctx.fillStyle = this._backgroundColor;
			this._ctx.fillRect(-radius, -radius, this._canvasSize, this._canvasSize);
		}
		this._ctx.rotate(Math.PI * 1.5);
		
		radius *= 0.99;
		
		var stepStart, stepLength;
		var	arcStart, arcEnd;
		var inRadius, outRadius;
		// steps
		// --------------------------------
		stepLength = this._arcStep - (this._arcGap * 2);
		stepStart = this._arcOffset + this._arcGap;
		outRadius = radius - 0.01;
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
		
		// this._ctx.lineWidth = 0.5;
		// this._ctx.strokeStyle = "rgba(255,0,0,0.25)";
		// this._ctx.strokeRect(labelLeft, this._baselineShift, labelWidth, this._fontSize);
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
