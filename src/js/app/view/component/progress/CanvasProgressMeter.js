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

/** @type {module:app/view/component/progress/ModelProgressMeter} */
var ModelProgressMeter = require("app/view/component/progress/ModelProgressMeter");

function isSizeProp(propName) {
	return /^(offset|client)(Left|Top|Width|Height)$/.test(propName);
}

// var ARC_ERR = 0.0001;
var ARC_ERR = 0.0;
var PI = Math.PI;
var PI2 = Math.PI*2;

var MIN_CANVAS_RATIO = 2;
var GAP_ARC = PI2/48;
var CAP_SCALE = 2; // cap arc = GAP_ARC * CAP_SCALE

var ARC_DEFAULTS = {
	"amount": {
		lineWidth: 0.8,
	},
	"available": {
		// lineWidth: 1.8, lineDash: [0.3, 0.7],
		lineWidth: 0.8,
		inverse: "not-available",
		// inverse2: "not-available2",
	},
	"not-available": {
		lineWidth: 1, lineDash: [0.3, 0.7],
	},
	// "not-available2": {
	// 	lineWidth: 1, lineDash: [0.7, 0.3],
	// },
};

/**
* @constructor
* @type {module:app/view/component/progress/CanvasProgressMeter}
*/
var CanvasProgressMeter = ModelProgressMeter.extend({
	
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
			loop: 0,
		},
		maxValues: {
			amount: 1,
			available: 1,
		},
		useOpaque: true,
		labelFn: function(value, max) {
			return ((value/max) * 100) | 0;
		},
	},
	defaultKey: "amount",
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		ModelProgressMeter.prototype.initialize.apply(this, arguments);
		
		// render props
		this._color = options.color;
		this._backgroundColor = options.backgroundColor;
		this._labelFn = options.labelFn;
		
		// mozOpaque
		// --------------------------------
		this._useOpaque = options.useOpaque;
		if (this._useOpaque) {
			this._opaqueProp = Modernizr.prefixed("opaque", this.el, false);
			if (this._opaqueProp) {
				this.el.classList.add("color-bg");
				this.el[this._opaqueProp] = true;
			}
		}
		
		// size
		// --------------------------------
		this._canvasChanged = true;
		this._canvasSize = null;
		this._valueStyles = {};
		
		// canvas' context init
		// --------------------------------
		this._ctx = this.el.getContext("2d");
	},

	_updateCanvas: function() {
		var s = getComputedStyle(this.el);
		var m = getBoxEdgeStyles(s);
		var w = this.el.clientWidth, h = this.el.clientHeight;
		// var w = this.el.offsetWidth, h = this.el.offsetHeight;
		
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
		var mapLineDash = function(n) { return n * this.radius * GAP_ARC; };
		this._maxDashArc = 0;
		
		for (arcName in ARC_DEFAULTS) {
			arcDefault = ARC_DEFAULTS[arcName];
			arcObj = this._valueStyles[arcName] = {};
			arcObj.inverse = arcDefault.inverse;// copy inverse key
			// arcObj.inverse2 = arcDefault.inverse2;
			arcObj.lineWidth = arcDefault.lineWidth * ratio;
			arcObj.radius = (this._canvasSize - arcObj.lineWidth)/2;
			if (arcDefault.radiusOffset) {
				arcObj.radius += arcDefault.radiusOffset * ratio;
			}
			if (arcDefault.lineDash && arcDefault.lineDash.length) {
				arcObj.lineDash = arcDefault.lineDash.map(mapLineDash, arcObj);
				arcObj.lineDashArc = arcDefault.lineDash[0] * GAP_ARC;
				this._maxDashArc = Math.max(this._maxDashArc, arcObj.lineDashArc);
			} else {
				arcObj.lineDashArc = 0;
			}
		}
		
		// colors
		// --------------------------------
		this._color || (this._color = s.color || Globals.DEFAULT_COLORS["color"]);
		this._backgroundColor || (this._backgroundColor = s.backgroundColor || Globals.DEFAULT_COLORS["background-color"]);
		
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
		
		// save canvas context
		// --------------------------------
		// reset matrix and translate 0,0 to center
		this._ctx.setTransform(1,0,0,1,this._canvasSize/2, this._canvasSize/2);
		// this._ctx.translate(this._canvasSize/2, this._canvasSize/2);
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
	render: function () {
		if (this.domPhase === "created") {
			if (!this._renderPending) {
				this._renderPending = true;
				this.listenTo(this, "view:added", this.render);
			}
		} else {
			this._renderPending = false;
			this.stopListening(this, "view:added", this.render);
			if (this.domPhase === "added") {
				if (this._canvasChanged) {
					this._canvasChanged = false;
					this._updateCanvas();
					this._valuesChanged = true;
				}
				ModelProgressMeter.prototype.render.apply(this, arguments);
			}
		}
		return this;
	},
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	redraw: function(changed) {
		var canvasPos = -this._canvasSize/2;
		this._ctx.clearRect(canvasPos, canvasPos, this._canvasSize, this._canvasSize);
		
		if (this._useOpaque) {
			this._ctx.save();
			this._ctx.fillStyle = this._backgroundColor;
			this._ctx.fillRect(canvasPos, canvasPos, this._canvasSize, this._canvasSize);
			this._ctx.restore();
		}
		
		// save ctx before drawing arcs
		this._ctx.save();
		
		var amountData = this._valueData["amount"];
		var amountStyle = this._valueStyles["amount"];
		var availableData = this._valueData["available"];
		var availableStyle = this._valueStyles["available"];
		
		// loop rotation
		// --------------------------------
		var loopValue = this._valueData["loop"]._renderedValue || 0;
		if ((changed.indexOf("amount") !== -1) && amountData._lastRenderedValue > amountData._renderedValue) {
			this.valueTo(1, 0, "loop");
			this.valueTo(0, 750, "loop");
		}
		this._ctx.rotate(PI2 * ((1-loopValue) - 0.25));
		
		// amount arc
		// --------------------------------
		// var amountGapArc = stepGapArc;
		var amountGapArc = GAP_ARC;
		var amountEndArc = 0;
		var amountValue = loopValue + amountData._renderedValue / amountData._maxVal;
		amountValue = Math.max(0, Math.min(1 - ARC_ERR, amountValue));
		
		if (amountValue > 0) {
			amountEndArc = this.drawArc(amountStyle, amountValue, amountGapArc, PI2 - amountGapArc);
			// var capWidth = availableStyle.lineWidth;
			var capWidth = amountStyle.radius * GAP_ARC;
			// this.drawDash(amountStyle, amountGapArc, capWidth);
			this.drawEndCap(amountStyle, amountEndArc);
			amountEndArc = amountEndArc + amountGapArc*2;
		}
		
		// available arc
		// --------------------------------
		var stepsNum = availableData.length || 1;
		var stepBaseArc = PI2 / stepsNum;
		var stepAdjustArc = stepBaseArc % GAP_ARC;
		var stepGapArc = GAP_ARC + (stepAdjustArc - availableStyle.lineDashArc)/2;
		
		if (Array.isArray(availableData)) {
			for (var o, i = 0; i < stepsNum; i++) {
				o = availableData[i];
				this.drawArc(availableStyle,
					o._renderedValue/(o._maxVal/stepsNum),
					(i * stepBaseArc) + stepGapArc,
					((i+1) * stepBaseArc) - stepGapArc,
					amountEndArc
				);
			}
		} else {
			this.drawArc(availableStyle,
				availableData._renderedValue / availableData._maxVal,
				stepGapArc, PI2 - stepGapArc,
				amountEndArc
			);
		}
		
		// restore ctx after drawing arcs
		this._ctx.restore();
		
		// amount label
		// --------------------------------
		var labelValue = this._labelFn(amountData._renderedValue, amountData._maxVal);
		var labelWidth = this._ctx.measureText(labelValue).width;
		var labelLeft = labelWidth * -0.500001;
		
		this._ctx.fillText(labelValue, labelLeft, this._baselineShift, labelWidth);
		// this._drawLabelGuides(labelLeft, labelWidth, canvasPos);
	},
	
	drawArc: function (valueStyle, value, startArc, endArc, prevArc) {
		var valArc, invStyle,
			valStartArc, valEndArc,
			invStartArc, invEndArc;
		// var invStartArc2, invEndArc2;
		prevArc || (prevArc = 0);
		
		valArc = endArc - startArc;
		valEndArc = startArc + (valArc * value);
		valStartArc = Math.max(startArc, prevArc);
		if (valEndArc > valStartArc) {
			this._ctx.save();
			this._ctx.lineWidth = valueStyle.lineWidth;
			valueStyle.lineDash &&
				this._ctx.setLineDash(valueStyle.lineDash);
			this._ctx.beginPath();
			this._ctx.arc(0, 0, valueStyle.radius, valEndArc, valStartArc, true);
			this._ctx.stroke();
			this._ctx.restore();
		}
		// if there's valueStyle, draw rest of span, minus prevArc overlap too
		if (valueStyle.inverse !== void 0) {
			invStyle = this._valueStyles[valueStyle.inverse];
			invEndArc = valEndArc + (valArc * (1-value));
			invStartArc = Math.max(valEndArc, prevArc);
			if (invEndArc > invStartArc) {
				this._ctx.save();
				this._ctx.lineWidth = invStyle.lineWidth;
				invStyle.lineDash &&
					this._ctx.setLineDash(invStyle.lineDash);
				this._ctx.beginPath();
				this._ctx.arc(0, 0, invStyle.radius, invEndArc, invStartArc, true);
				this._ctx.stroke();
				this._ctx.restore();
			}
			// invStyle = this._valueStyles[valueStyle.inverse2];
			// invEndArc2 = Math.min(invEndArc, prevArc);
			// invStartArc2 = valEndArc;
			// if (invEndArc2 > invStartArc2) {
			// 	this._ctx.save();
			// 	this._ctx.globalCompositeOperation = "destination-out";
			// 	this._ctx.lineWidth = invStyle.lineWidth;
			// 	invStyle.lineDash &&
			// 		this._ctx.setLineDash(invStyle.lineDash);
			// 	this._ctx.beginPath();
			// 	this._ctx.arc(0, 0, invStyle.radius, invEndArc2, invStartArc2, true);
			// 	this._ctx.stroke();
			// 	this._ctx.restore();
			// }
		}
		return valEndArc;
	},
	
	drawEndCap: function (valueStyle, arcPos) {
		var ARR_ARC_SCALE = 2;
		var ARR_WIDTH_SCALE = 1.25;
		
		var arrArc = arcPos - GAP_ARC * ARR_ARC_SCALE;
		
		var inArc = Math.max(GAP_ARC, arrArc);
		var xIn = Math.cos(inArc);
		var yIn = Math.sin(inArc);
		var xOut = Math.cos(arcPos);
		var yOut = Math.sin(arcPos);
		
		var arrWidth = Math.min(GAP_ARC, arrArc) * valueStyle.radius * ARR_WIDTH_SCALE;
		var rOut = valueStyle.radius + valueStyle.lineWidth * 0.5;
		var rIn = rOut - arrWidth;
		// var rIn2 = rOut + arrWidth;
		
		this._ctx.save();
		this._ctx.lineWidth = valueStyle.lineWidth;// * 0.75;
		this._ctx.beginPath();
		this._ctx.moveTo(xOut*rOut, yOut*rOut);
		this._ctx.lineTo(xIn*rIn, yIn*rIn);
		this._ctx.stroke();
		
		// this._ctx.lineTo(xIn*rOut, yIn*rOut);
		// this._ctx.arc(0, 0, rOut, inArc, arcPos);
		// this._ctx.closePath();
		// this._ctx.fill();
		this._ctx.restore();
	},
	
	drawDash: function (valueStyle, arcPos, width) {
		var cx = Math.cos(arcPos);
		var cy = Math.sin(arcPos);
		// instead of using a square cap line (only needed on outer end),
		// shift dash by half lineWidth.
		var rOut = valueStyle.radius + valueStyle.lineWidth * 0.5;
		var rIn = rOut - width;
		
		this._ctx.save();
		this._ctx.lineWidth = valueStyle.lineWidth * 0.75;
		this._ctx.beginPath();
		this._ctx.moveTo(cx*rOut, cy*rOut);
		this._ctx.lineTo(cx*rIn, cy*rIn);
		this._ctx.stroke();
		this._ctx.restore();
	},
	
	/*
	_drawLabelGuides: function(labelLeft, labelWidth, canvasPos) {
		this._ctx.save();
		this._ctx.lineWidth = 1;
		this._ctx.strokeStyle = "#990000";
		
		this._ctx.beginPath();
		this._ctx.moveTo(labelLeft, this._baselineShift - 0.5);
		this._ctx.lineTo(labelLeft + labelWidth, this._baselineShift - 0.5);
		this._ctx.moveTo(labelLeft, -this._baselineShift - 0.5);
		this._ctx.lineTo(labelLeft + labelWidth, -this._baselineShift - 0.5);
		this._ctx.closePath();
		this._ctx.stroke();
		
		this._ctx.beginPath();
		this._ctx.arc(0, 0, labelWidth/2, 0, PI2);
		this._ctx.closePath();
		this._ctx.stroke();
		
		this._ctx.moveTo(0, canvasPos);
		this._ctx.lineTo(0, this._canvasSize-1);
		this._ctx.moveTo(canvasPos, 0);
		this._ctx.lineTo(this._canvasSize-1, 0);
		
		this._ctx.strokeStyle = "none";
		this._ctx.fillStyle = "#990000";
		this._ctx.beginPath();
		this._ctx.rect(canvasPos, -0.5, this._canvasSize-1, 1);
		this._ctx.rect(-0.5, canvasPos, 1, this._canvasSize-1);
		this._ctx.closePath();
		this._ctx.fill();
		
		this._ctx.rect(labelLeft, this._baselineShift - this._fontSize, labelWidth, this._fontSize);
		this._ctx.rect(canvasPos, canvasPos, this._canvasSize-1, this._canvasSize-1);
		this._ctx.restore();
	},
	*/
});

module.exports = CanvasProgressMeter;
