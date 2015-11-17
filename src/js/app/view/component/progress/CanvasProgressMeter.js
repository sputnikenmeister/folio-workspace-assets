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

var MIN_CANVAS_RATIO = 2;

var PI = Math.PI;
var PI2 = Math.PI*2;

var GAP_ARC = PI2/48;
var ARC_DEFAULTS = {
	"_default": {
		lineWidth: 1.0,
	},
	"amount": {
		lineWidth: 0.8,
		// lineDash: [],
	},
	"available": {
		lineWidth: 2,
		lineDash: [0.3, 0.7],
		inverse: "not-available",
	},
	"not-available": {
		lineWidth: 1,
		// lineDash: [0.4, 0.6],
		lineDash: [0.2, 0.8],
	},
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
	className: "progress-meter canvas-progress-meter color-bg",
	
	defaults: {
		amount: 0,
		available: 0,
		total: 1,
		loop: 0,
		labelFn: function(value, total) {
			return ((value/total) * 100) | 0;
		},
	},
	defaultKey: "amount",
	interpolated: ["amount", "available", "loop"],
	
	// events: {
	// 	"transitionend": function(ev) {
	// 		console.log("%s::transitionend prop:'%s'", this.cid, ev.propertyName);
	// 		switch (ev.propName) {
	// 			case "color":
	// 			case "background-color":
	// 				this._canvasChanged = true;
	// 				this.render();
	// 			break;
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
		
		// size
		// --------------------------------
		this._canvasChanged = true;
		this._canvasSize = null;
		this._valueStyles = {};
		
		this._valueData["loop"]._total = void 0;
		delete this._valueData["loop"]._total;
		// this._valueData["loop"]._total = PI2;
		
		// canvas' context init
		// --------------------------------
		var opaqueProp = Modernizr.prefixed("opaque", this.el, false);
		if (opaqueProp) {
			this.el[opaqueProp] = true;
		}
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
		
		// lines, gaps, dashes (this._valueStyles, this._gapArc, this._arcRadius)
		// --------------------------------
		var arcName, arcObj, arcDefault, maxLineWidth = 0;
		
		this._gapArc = GAP_ARC;
		
		for (arcName in ARC_DEFAULTS) {
			arcDefault = ARC_DEFAULTS[arcName];
			arcObj = this._valueStyles[arcName] = {};
			arcObj.inverse = arcDefault.inverse;// copy inverse key
			arcObj.lineWidth = arcDefault.lineWidth * ratio;
			maxLineWidth = Math.max(maxLineWidth, arcObj.lineWidth);
		}
		this._arcRadius = (this._canvasSize - maxLineWidth)/2;
		
		var gapLength = this._arcRadius * this._gapArc;
		var mapRatioFn = function(n, i, a) { return n * gapLength; };
		
		for (arcName in ARC_DEFAULTS) {
			arcDefault = ARC_DEFAULTS[arcName];
			arcObj = this._valueStyles[arcName];
			// arcObj.lineDashArc = (arcDefault.lineDash.length? arcDefault.lineDash[0] : 0) * (this._gapArc/2);
			if (arcDefault.lineDash && arcDefault.lineDash.length) {
				arcObj.lineDashArc = arcDefault.lineDash[0] * this._gapArc;
				arcObj.lineDash = arcDefault.lineDash.map(mapRatioFn);
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
		
		// baseline
		// --------------------------------
		// NOTE: use ascent data to center to x-height, or sort-of.
		// with ascent/descent values (0.7, -0.3), x-height is 0.4
		var mKey, mObj, fontExHeight = 0.4;
		for (mKey in Globals.FONT_METRICS) {
			if (s.fontFamily.indexOf(mKey) !== -1) {
				mObj = Globals.FONT_METRICS[mKey];
				fontExHeight = (mObj.ascent + mObj.descent) / mObj.unitsPerEm;
				break;
			}
		}
		this._baselineShift = this._fontSize * fontExHeight * 0.5;
		
		// save canvas context
		// --------------------------------
		
		// reset and translate 0,0 to center
		this._ctx.setTransform(1,0,0,1,this._canvasSize/2, this._canvasSize/2);
		// this._ctx.translate(this._canvasSize/2, this._canvasSize/2);
		this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px/1", s.fontFamily].join(" ");
		this._ctx.textAlign = "left";
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
	
	// renderFrame: function(tstamp) {
	// 	if (this._canvasChanged) {
	// 		this._canvasChanged = false;
	// 		this._updateCanvas();
	// 	}
	// 	ModelProgressMeter.prototype.renderFrame.apply(this, arguments);
	// },
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	redraw: function(changed) {
		var canvasPos = -this._canvasSize/2;
		this._ctx.clearRect(canvasPos, canvasPos, this._canvasSize, this._canvasSize);
		if (Modernizr.prefixed("opaque", this.el)) {
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
		
		var stepsNum = availableData.length || 1;
		var stepBaseArc = PI2 / stepsNum;
		var stepAdjustArc = stepBaseArc % GAP_ARC;
		var stepGapArc = this._gapArc + (stepAdjustArc - availableStyle.lineDashArc)/2;
		
		// loop rotation
		// --------------------------------
		var loopValue = this._valueData["loop"]._renderedValue || 0;
		if ((changed.indexOf("amount") !== -1) && amountData._lastRenderedValue > amountData._renderedValue) {
			// console.log("%s::redraw amount loop", this.cid);
			this.valueTo(1, 0, "loop");
			this.valueTo(0, 750, "loop");
		}
		// if (loopValue > 0) console.log("%s::redraw looping: %f - %f", this.cid, loopValue);
		this._ctx.rotate(PI2 * ((1-loopValue) - 0.25));
		
		// amount arc
		// --------------------------------
		var amountValue = loopValue + amountData._renderedValue / amountData._total;
		var amountStartArc = stepGapArc;
		var amountEndArc = 0;
		
		if (amountValue > 0) {
			amountEndArc = this.drawArc(amountStyle, amountValue, amountStartArc, PI2 - stepGapArc);
			// this.drawDash(amountStyle, amountStartArc, this._gapArc * this._arcRadius);
			this.drawDash(amountStyle, amountEndArc, availableStyle.lineWidth);
		}
		
		// available arc
		// --------------------------------
		if (Array.isArray(availableData)) {
			for (var o, i = 0; i < stepsNum; i++) {
				o = availableData[i];
				this.drawArc(availableStyle,
					o._renderedValue/(o._total/stepsNum),
					(i * stepBaseArc) + stepGapArc,
					((i+1) * stepBaseArc) - stepGapArc,
					amountEndArc + stepGapArc
				);
			}
		} else {
			this.drawArc(availableStyle,
				availableData._renderedValue / availableData._total,
				stepGapArc, PI2 - stepGapArc,
				amountEndArc + stepGapArc
			);
		}
		
		// restore ctx to before drawing arcs
		this._ctx.restore();
		
		// amount label
		// --------------------------------
		var labelValue = this._labelFn(amountData._renderedValue, amountData._total);
		var labelWidth = this._ctx.measureText(labelValue).width;
		var labelLeft = labelWidth * -0.5001;
		
		this._ctx.fillText(labelValue, labelLeft, this._baselineShift, labelWidth);
	},
	
	drawDash: function (valueStyle, arcPos, width) {
		
		var cx = Math.cos(arcPos);
		var cy = Math.sin(arcPos);
		var r1 = this._arcRadius - (width * 0.5);
		var r2 = this._arcRadius + (width * 0.5);
		
		this._ctx.save();
		this._ctx.lineWidth = valueStyle.lineWidth;
		valueStyle.lineDash && this._ctx.setLineDash(valueStyle.lineDash);
		this._ctx.beginPath();
		this._ctx.moveTo(cx*r2, cy*r2);
		this._ctx.lineTo(cx*r1, cy*r1);
		this._ctx.stroke();
		this._ctx.restore();
	},
	
	drawArc: function (valueStyle, value, startArc, endArc, prevArc) {
		var valArc, valStartArc, valEndArc, invStartArc, invEndArc;
		prevArc || (prevArc = 0);
		
		valArc = endArc - startArc;
		valEndArc = startArc + (valArc*value);
		valStartArc = Math.max(startArc, prevArc);
		if (valEndArc > valStartArc) {
			this._ctx.save();
			this._ctx.lineWidth = valueStyle.lineWidth;
			valueStyle.lineDash &&
				this._ctx.setLineDash(valueStyle.lineDash);
			this._ctx.beginPath();
			this._ctx.arc(0, 0, this._arcRadius, valEndArc, valStartArc, true);
			this._ctx.stroke();
			this._ctx.restore();
		}
		// if there's valueStyle, draw rest of span, minus prevArc overlap too
		if (valueStyle.inverse !== void 0) {
			valueStyle = this._valueStyles[valueStyle.inverse];
			invEndArc = valEndArc + (valArc*(1-value));
			invStartArc = Math.max(valEndArc, prevArc);
			if (invEndArc > invStartArc) {
				this._ctx.save();
				this._ctx.lineWidth = valueStyle.lineWidth;
				valueStyle.lineDash &&
					this._ctx.setLineDash(valueStyle.lineDash);
				this._ctx.beginPath();
				this._ctx.arc(0, 0, this._arcRadius, invEndArc, invStartArc, true);
				this._ctx.stroke();
				this._ctx.restore();
			}
		}
		return valEndArc;
	}
});

module.exports = CanvasProgressMeter;
