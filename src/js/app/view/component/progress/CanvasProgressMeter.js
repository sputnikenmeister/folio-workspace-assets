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

var ARC_ERR = 0.00001;
// var ARC_ERR = 0.0;
var PI = Math.PI;
var PI2 = Math.PI*2;

var MIN_CANVAS_RATIO = 2;
var GAP_ARC = PI2/48;
var CAP_SCALE = 2; // cap arc = GAP_ARC * CAP_SCALE
var WAIT_CYCLE_VALUE = 1;
var WAIT_CYCLE_MS = 300; // milliseconds per interpolation loop 

var ARC_DEFAULTS = {
	"amount": 			{ lineWidth: 0.8, radiusOffset: 0 },
	// "available": 		{ lineWidth: 2.2, lineDash: [0.3, 0.7], inverse: "not-available" },
	"not-available": 	{ lineWidth: 1.0, lineDash: [0.3, 0.7] },
	"available": 		{ lineWidth: 0.8, inverse: "not-available" },
	// "not-available": 	{ lineWidth: 1.0, lineDash: [0.3, 1.2] },
	
	// "wait": 			{ lineWidth: 2.2, lineDash: [0.3, 1.2] },
	// "wait": 			{ lineWidth: 3.0, radiusOffset: 0, lineDash: [1.0, 3.0] },
	// "wait": 			{ lineWidth: 0.8, radiusOffset: -3, lineDash: [2, 4] },
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
			_loop: 0,
			// _wait: 0,
		},
		maxValues: {
			amount: 1,
			available: 1,
		},
		indeterminate: false,
		useOpaque: true,
		labelFn: function(value, max) {
			return ((value/max) * 100) | 0;
		},
	},
	
	defaultKey: "amount",
	
	// properties: {
	// 	indeterminate: {
	// 		get: function() {
	// 			return this._indeterminate;
	// 		},
	// 		set: function(value) {
	// 			if ((this._indeterminate === true && value === false) || (this._indeterminate === false && value === true)) {
	// 				this._indeterminate = value;
	// 				this.valueTo(0, 0, "_wait");
	// 				if (value) {
	// 					this.valueTo(WAIT_CYCLE_VALUE, WAIT_CYCLE_MS, "_wait");
	// 				}
	// 			}
	// 		}
	// 	}
	// },
	
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
		
		// indeterminate
		// --------------------------------
		// this._indeterminate = options.indeterminate;
		
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
		var sumFn = function(s, n) { return s+n; };
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
				arcObj.lineDashLength = arcObj.lineDash.reduce(sumFn);
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
		// this._baselineShift *= 0.5; // halve it
		
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
		
		var amountData = this._valueData["amount"];
		var amountStyle = this._valueStyles["amount"];
		var availableData = this._valueData["available"];
		var availableStyle = this._valueStyles["available"];
		
		// // not-available dash animation
		// // --------------------------------
		// var notAvailableStyle = this._valueStyles[availableStyle.inverse];
		// if (this.indeterminate) {
		// 	var waitValue = this._valueData["_wait"]._renderedValue || 0;
		// 	if (waitValue == WAIT_CYCLE_VALUE) {
		// 		this.valueTo(0, 0, "_wait");
		// 		this.valueTo(WAIT_CYCLE_VALUE, WAIT_CYCLE_MS, "_wait");
		// 	}
		// 	notAvailableStyle.lineDashOffset = waitValue * notAvailableStyle.lineDashLength;
		// 	// waitValue = WAIT_CYCLE_VALUE - waitValue; // reverse direction
		// 	// availableStyle.lineDashOffset = waitValue * availableStyle.lineDashLength;
		// } else {
		// 	notAvailableStyle.lineDashOffset = void 0;
		// 	// availableStyle.lineDashOffset = void 0;
		// }
		
		//// wait spinner
		// if (this.indeterminate) this.drawSpinner();
		
		// amount label
		// --------------------------------
		this.drawLabel(this._labelFn(amountData._renderedValue, amountData._maxVal));
		
		// save ctx before drawing arcs
		this._ctx.save();
		
		// loop rotation
		// --------------------------------
		// var loopValue = this._valueData["_loop"]._renderedValue || 0;
		// trigger loop
		if ((changed.indexOf("amount") !== -1) && amountData._lastRenderedValue > amountData._renderedValue) {
			this.valueTo(1, 0, "_loop");
			this.valueTo(0, 750, "_loop");
			this.updateValue("_loop");
			// loopValue = 1; // value will not be updated until next frame
		}
		var loopValue = this._valueData["_loop"]._renderedValue || 0;
		this._ctx.rotate(PI2 * ((1-loopValue) - 0.25));
		
		// amount arc
		// --------------------------------
		// var amountGapArc = stepGapArc;
		var amountGapArc = GAP_ARC;
		var amountEndArc = 0;
		var amountValue = loopValue + amountData._renderedValue / amountData._maxVal;
		// amountValue = Math.max(0, Math.min(1, amountValue));
		// if (loopValue > 0) console.log("%s::loop amount:%f loop:(%f)", this.cid, amountValue, loopValue, this._valueData["_loop"]._renderedValue);
		
		if (amountValue > 0) {
			amountEndArc = this.drawArc(amountStyle, amountValue, amountGapArc, PI2 - amountGapArc);
			// this.drawDash(amountStyle, amountEndArc);
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
				this.drawArc(availableStyle, o._renderedValue/(o._maxVal/stepsNum), (i*stepBaseArc)+stepGapArc, ((i+1)*stepBaseArc)-stepGapArc, amountEndArc);
			}
		} else {
			this.drawArc(availableStyle, availableData._renderedValue/availableData._maxVal, stepGapArc, PI2-stepGapArc, amountEndArc);
		}
		// restore ctx after drawing arcs
		this._ctx.restore();
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
			this.applyValueStyle(valueStyle);
			// this._ctx.lineWidth = valueStyle.lineWidth;
			// if (valueStyle.lineDash) {
			// 	this._ctx.setLineDash(valueStyle.lineDash);
			// }
			// if (valueStyle.lineDashOffset) {
			// 	this._ctx.lineDashOffset = valueStyle.lineDashOffset;
			// }
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
				this.applyValueStyle(invStyle);
				// this._ctx.lineWidth = invStyle.lineWidth;
				// if (invStyle.lineDash) {
				// 	this._ctx.setLineDash(invStyle.lineDash);
				// }
				// if (invStyle.lineDashOffset) {
				// 	this._ctx.lineDashOffset = invStyle.lineDashOffset;
				// }
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
			labelWidth * -0.5, //Math.ceil(labelWidth * -0.501),
			this._baselineShift, labelWidth);
		// this._drawLabelGuides(-this._canvasSize/2, labelWidth);
	},
	
	drawEndCap: function (valueStyle, arcPos) {
		var radius = valueStyle.radius;// + valueStyle.lineWidth * 0.5;
		this._ctx.save();
		this._ctx.lineWidth = valueStyle.lineWidth;// * 0.75;
		
		this._ctx.rotate(arcPos - GAP_ARC*1.5);
		this._ctx.beginPath();
		this._ctx.arc(0, 0, radius, GAP_ARC*0.5, GAP_ARC*2, false);
		this._ctx.lineTo(radius - (GAP_ARC * radius), 0);
		this._ctx.closePath();
		
		this._ctx.fill();
		this._ctx.stroke();
		this._ctx.restore();
	},
	
	// drawEndCap2: function (valueStyle, arcPos) {
	// 	var radius = valueStyle.radius + valueStyle.lineWidth * 0.5;
	// 	var gapWidth = GAP_ARC * valueStyle.radius * 2;
	// 	var xTip = Math.cos(GAP_ARC/2) * radius;
	// 	var yTip = Math.sin(GAP_ARC/2) * radius;
	// 	
	// 	this._ctx.save();
	// 	this._ctx.lineWidth = valueStyle.lineWidth;// * 0.75;
	// 	
	// 	this._ctx.rotate(arcPos);
	// 	this._ctx.beginPath();
	// 	this._ctx.moveTo(xTip, yTip);
	// 	this._ctx.lineTo(xTip, yTip - gapWidth);
	// 	this._ctx.lineTo(xTip - gapWidth * (2/3), yTip - gapWidth);
	// 	this._ctx.closePath();
	// 	
	// 	this._ctx.fill();
	// 	// this._ctx.stroke();
	// 	this._ctx.restore();
	// },
	
	// drawEndCap3: function (valueStyle, arcPos) {
	// 	var ARR_ARC_SCALE = 2;
	// 	var ARR_WIDTH_SCALE = 1.25;
	// 	
	// 	var arrArc = arcPos - GAP_ARC * ARR_ARC_SCALE;
	// 	var inArc = Math.max(GAP_ARC, arrArc);
	// 	// var inArc = arrArc;
	// 	// var arrWidth = GAP_ARC * valueStyle.radius * ARR_WIDTH_SCALE;
	// 	var arrWidth = Math.min(GAP_ARC, arrArc) * valueStyle.radius * ARR_WIDTH_SCALE;
	// 	
	// 	var xIn = Math.cos(inArc);
	// 	var yIn = Math.sin(inArc);
	// 	var xOut = Math.cos(arcPos);
	// 	var yOut = Math.sin(arcPos);
	// 	
	// 	var rOut = valueStyle.radius + valueStyle.lineWidth * 0.5;
	// 	var rIn = rOut - arrWidth;
	// 	// var rIn2 = rOut + arrWidth;
	// 	
	// 	this._ctx.save();
	// 	this._ctx.lineWidth = valueStyle.lineWidth;// * 0.75;
	// 	this._ctx.beginPath();
	// 	this._ctx.moveTo(xOut*rOut, yOut*rOut);
	// 	this._ctx.lineTo(xIn*rIn, yIn*rIn);
	// 	this._ctx.stroke();
	// 	
	// 	// this._ctx.lineTo(xIn*rOut, yIn*rOut);
	// 	// this._ctx.arc(0, 0, rOut, inArc, arcPos);
	// 	// this._ctx.closePath();
	// 	// this._ctx.fill();
	// 	this._ctx.restore();
	// },
	// 
	// drawDash: function (valueStyle, arcPos) {
	// 	var cx = Math.cos(arcPos);
	// 	var cy = Math.sin(arcPos);
	// 	var dashWidth = valueStyle.radius * GAP_ARC;
	// 	// instead of using a square cap line (only needed on outer end),
	// 	// shift dash by half lineWidth.
	// 	var rOut = valueStyle.radius + valueStyle.lineWidth * 0.5;
	// 	var rIn = rOut - dashWidth;
	// 	
	// 	this._ctx.save();
	// 	this._ctx.lineWidth = valueStyle.lineWidth * 0.75;
	// 	this._ctx.beginPath();
	// 	this._ctx.moveTo(cx*rOut, cy*rOut);
	// 	this._ctx.lineTo(cx*rIn, cy*rIn);
	// 	this._ctx.stroke();
	// 	this._ctx.restore();
	// },
	
	// drawLabel2: function(labelString) {
	// 	// var UNICODE_BLACK_MEDIUM_RIGHT_POINTING_TRIANGLE = String.fromCharCode(0x23F5);
	// 	var UNICODE_PLAY = String.fromCharCode(0x23F5);
	// 	// var UNICODE_DOUBLE_VERICAL_BAR = String.fromCharCode(0x23F8);
	// 	var UNICODE_PAUSE = String.fromCharCode(0x23F8);
	// 	// var UNICODE_BLACK_SQUARE_FOR_STOP = String.fromCharCode(0x23F9);
	// 	var UNICODE_STOP = String.fromCharCode(0x23F9);
	// 	
	// 	var symbolFull = Math.round(this._canvasSize/14)*3;//this._fontSize;
	// 	var symbolHalf = symbolFull/2;
	// 	var symbolThird = symbolFull/3;
	// 	var labelWidth = symbolFull;
	// 	
	// 	this._ctx.save();
	// 	
	// 	switch (labelString) {
	// 		case UNICODE_PLAY:
	// 			// this._ctx.scale(symbolScale, symbolScale);
	// 			this._ctx.translate(-symbolFull*(3/7), -symbolFull*(1/2));
	// 			this._ctx.beginPath();
	// 			this._ctx.moveTo(0, 0);
	// 			this._ctx.lineTo(symbolFull, symbolHalf);
	// 			this._ctx.lineTo(0, symbolFull);
	// 			this._ctx.closePath();
	// 			this._ctx.fill();
	// 			break;
	// 		case UNICODE_PAUSE:
	// 			// this._ctx.scale(symbolScale, symbolScale);
	// 			this._ctx.translate(-symbolHalf, -symbolHalf);
	// 			this._ctx.fillRect(0, 0, symbolThird, symbolFull);
	// 			this._ctx.fillRect(symbolThird*2, 0, symbolThird, symbolFull);
	// 			break;
	// 		case UNICODE_STOP:
	// 			// this._ctx.scale(symbolScale, symbolScale);
	// 			this._ctx.translate(-symbolHalf, -symbolHalf);
	// 			this._ctx.fillRect(0, 0, symbolFull, symbolFull);
	// 			break;
	// 		default:
	// 			labelWidth = this._ctx.measureText(labelString).width;
	// 			this._ctx.fillText(labelString.toUpperCase(),
	// 				labelWidth * -0.501, //Math.ceil(labelWidth * -0.501),
	// 				this._baselineShift, labelWidth);
	// 			break;
	// 	}
	// 	
	// 	this._ctx.restore();
	// 	// this._drawLabelGuides(-this._canvasSize/2, labelWidth);
	// },
	
	// drawSpinner: function() {
	// 	var waitValue = this._valueData["_wait"]._renderedValue || 0;
	// 	if (waitValue == 1) {
	// 		this.valueTo(0, 0, "_wait");
	// 		this.valueTo(1, WAIT_CYCLE_MS, "_wait");
	// 	}
	// 	this._ctx.save();
	// 	this._ctx.rotate(PI2 * (1 - waitValue));
	// 	this._ctx.strokeStyle = this._backgroundColor;
	// 	this.drawArc(this._valueStyles["_wait"], 1, 0, PI2, 0);
	// 	this._ctx.restore();
	// },
	
	/*
	_drawLabelGuides: function(canvasPos, labelWidth) {
		var labelLeft = labelWidth * -0.5;
		
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
