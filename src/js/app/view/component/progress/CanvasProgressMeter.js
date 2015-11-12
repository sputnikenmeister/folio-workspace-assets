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
var GAP_ARC = Math.PI/32;
var ARC_DEFAULTS = {
	amount: {
		lineWidth: 0.8,
		lineDash: [],
	},
	available: {
		lineWidth: 2,
		lineDash: [
			0.4, 0.93333,
			0.4, 0.93333,
			0.4, 0.93334
		],
	},
	notAvailable: {
		lineWidth: 0.8,
		lineDash: [0.3, 1.7],
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
		labelFn: function(value, total) {
			return ((value/total) * 100) | 0;
		},
	},
	defaultKey: "amount",
	interpolated: ["amount", "available"],
	
	events: {
		"transitionend": function(ev) {
			console.log("%s::transitionend prop:'%s'", this.cid, ev.propertyName);
			switch (ev.propName) {
				case "color":
				case "background-color":
					this._canvasChanged = true;
					this.render();
				break;
			}
		}
	},
	
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
		this._arcData = {};
		
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
		// reset and translate 0,0 to center
		this._ctx.setTransform(1,0,0,1,this._canvasSize/2, this._canvasSize/2);
		// this._ctx.translate(this._canvasSize/2, this._canvasSize/2);
		
		// lines, gaps, dashes
		// --------------------------------
		var arcName, arcObj, arcDefault, maxLineWidth = 0;
		
		this._gapArc = GAP_ARC;
		
		for (arcName in ARC_DEFAULTS) {
			arcDefault = ARC_DEFAULTS[arcName];
			arcObj = this._arcData[arcName] = {};
			arcObj.lineWidth = arcDefault.lineWidth * ratio;
			maxLineWidth = Math.max(maxLineWidth, arcObj.lineWidth);
		}
		this._arcRadius = (this._canvasSize - maxLineWidth)/2;
		
		var gapLength = this._arcRadius * this._gapArc;
		var mapRatioFn = function(n, i, a) { return n * gapLength; };
		
		for (arcName in ARC_DEFAULTS) {
			arcDefault = ARC_DEFAULTS[arcName];
			arcObj = this._arcData[arcName];
			arcObj.lineDashArc = (arcDefault.lineDash.length? arcDefault.lineDash[0] : 0) * (this._gapArc/2);
			arcObj.lineDash = arcDefault.lineDash.map(mapRatioFn);
			// arcObj.lineDash.forEach(fnRatio);
		}
		
		// // TODO: this is not efficient cloning
		// this._arcData = JSON.parse(JSON.stringify(ARC_DEFAULTS));
		// for (arcName in this._arcData) {
		// 	arcObj = this._arcData[arcName];
		// 	arcObj.lineWidth *= ratio;
		// 	maxLineWidth = Math.max(maxLineWidth, arcObj.lineWidth);
		// }
		// this._arcRadius = (this._canvasSize - maxLineWidth)/2;
		// 
		// var gapLength = this._arcRadius * this._gapArc;
		// var fnRatio = function(n, i, a) { a[i] *= gapLength; };
		// for (arcName in this._arcData) {
		// 	arcObj = this._arcData[arcName];
		// 	arcObj.lineDashArc = arcObj.lineDash[0] * (this._gapArc/2);
		// 	arcObj.lineDash.forEach(fnRatio);
		// }
		
		// colors
		// --------------------------------
		this._color || (this._color = s.color || Globals.DEFAULT_COLORS["color"]);
		this._backgroundColor || (this._backgroundColor = s.backgroundColor || Globals.DEFAULT_COLORS["background-color"]);
		
		// fontSize
		// --------------------------------
		this._fontSize = parseFloat(s.fontSize) * ratio;
		this._ctx.font = [s.fontWeight, s.fontStyle, this._fontSize + "px/1", s.fontFamily].join(" ");
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
					// this._canvasChanged = false;
					// this._updateCanvas();
					this._valuesChanged = true;
				}
				ModelProgressMeter.prototype.render.apply(this, arguments);
			}
		}
		return this;
	},
	renderFrame: function(tstamp) {
		if (this._canvasChanged) {
			this._canvasChanged = false;
			this._updateCanvas();
		}
		ModelProgressMeter.prototype.renderFrame.apply(this, arguments);
	},
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	redraw: function(chnaged) {
		var canvasPos = -this._canvasSize/2;
		this._ctx.clearRect(canvasPos, canvasPos, this._canvasSize, this._canvasSize);
		if (Modernizr.prefixed("opaque", this.el)) {
			this._ctx.fillStyle = this._backgroundColor;
			this._ctx.fillRect(canvasPos, canvasPos, this._canvasSize, this._canvasSize);
		}
		
		this._ctx.rotate(Math.PI * -0.5);
		this._ctx.strokeStyle = this._color;
		this._ctx.fillStyle = "none";
		
		var valueObj, arcData;
		
		// amount
		// --------------------------------
		valueObj = this._renderData["amount"];
		arcData = this._arcData["amount"];
		// var startArc = this._gapArc;
		// var endArc = (valueObj._renderedValue / valueObj._total) * (Math.PI*2 - this._gapArc*2) + startArc;
		
		var startArc = 0;
		var spanArc = Math.PI*2;
		
		var spanGapArc = this._gapArc;
		startArc += spanGapArc;
		spanArc -= spanGapArc*2;
		
		var endArc = ((valueObj._renderedValue / valueObj._total) * spanArc) + startArc;
		
		this._ctx.lineWidth = arcData.lineWidth;
		this._ctx.setLineDash(arcData.lineDash);
		this._ctx.beginPath();
		this._ctx.arc(0, 0, this._arcRadius, startArc, endArc, false);
		this._ctx.stroke();
		
		// amount end line
		arcData = this._arcData["available"];
		var r1 = this._arcRadius - (arcData.lineWidth * 0.5);
		var r2 = r1 + arcData.lineWidth;
		var cx = Math.cos(endArc);
		var cy = Math.sin(endArc);
		
		this._ctx.lineWidth = arcData.lineDash[0];
		this._ctx.beginPath();
		this._ctx.moveTo( cx*r2, cy*r2);
		this._ctx.lineTo( cx*r1, cy*r1);
		this._ctx.stroke();
		
		// available
		// --------------------------------
		valueObj = this._renderData["available"];
		
		var stepsNum = valueObj.length || 1;
		var stepBaseArc = (Math.PI*2) / stepsNum;
		var adjArc = (stepBaseArc % (Math.PI*2)) % this._gapArc;
		spanGapArc = (this._gapArc - arcData.lineDashArc) + adjArc/2;
		
		var drawArc = function (value, startArc, spanArc, prevArc) {
			var endArc;
			startArc += spanGapArc;
			spanArc -= spanGapArc*2;
			
			// this._ctx.save();
			// this._ctx.strokeStyle = "rgba(255,0,0,0.25)";
			// this._ctx.lineWidth = arcData.lineWidth;
			// this._ctx.setLineDash([]);
			// this._ctx.beginPath();
			// this._ctx.arc(0, 0, this._arcRadius*0.75, startArc, startArc + spanArc);
			// this._ctx.stroke();
			// this._ctx.restore();
			
			endArc = (spanArc * value) + startArc;
			startArc = Math.max(startArc, prevArc);
			// amount arc may overlap current
			if (endArc > startArc) {
				this._ctx.lineWidth = arcData.lineWidth;
				this._ctx.setLineDash(arcData.lineDash);
				this._ctx.beginPath();
				this._ctx.arc(0, 0, this._arcRadius, endArc, startArc, true);
				this._ctx.stroke();
			}
			startArc = Math.max(endArc, prevArc);
			endArc += spanArc * (1 - value);
			// endArc -= spanGapArc;
			// startArc += spanGapArc;
			if (endArc > startArc) {
				// draw rest of step
				this._ctx.lineWidth = this._arcData["notAvailable"].lineWidth;
				this._ctx.setLineDash(this._arcData["notAvailable"].lineDash);
				this._ctx.beginPath();
				this._ctx.arc(0, 0, this._arcRadius, endArc, startArc, true);
				this._ctx.stroke();
			}
		}.bind(this);
		
		var prevArc = endArc + (this._gapArc);
		
		if (Array.isArray(valueObj)) {
			for (var o, i = 0; i < stepsNum; i++) {
				o = valueObj[i];
				drawArc(
					o._renderedValue/(o._total/stepsNum), stepBaseArc * i, stepBaseArc, prevArc
					// (stepBaseArc * i) + this._gapArc,
					// stepBaseArc - this._gapArc*2
				);
			}
		} else {
			drawArc(
				valueObj._renderedValue / valueObj._total, 0, Math.PI*2, prevArc
				// this._gapArc,
				// Math.PI*2 - this._gapArc*2
			);
		}
		
		// label
		// --------------------------------
		valueObj = this._renderData["amount"];
		var labelValue = this._labelFn(valueObj._renderedValue, valueObj._total);
		var labelWidth = this._ctx.measureText(labelValue).width;
		var labelLeft = labelWidth * -0.5001;
		
		this._ctx.rotate(Math.PI * 0.5);
		this._ctx.fillStyle = this._color;
		this._ctx.fillText(labelValue, labelLeft, this._baselineShift, labelWidth);
	},
});

module.exports = CanvasProgressMeter;
