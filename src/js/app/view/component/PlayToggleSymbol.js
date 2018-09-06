/**
 * @module app/view/component/PlayToggleSymbol
 */

// var PI = Math.PI;
var PI2 = Math.PI * 2;
// var PI05 = Math.PI*0.5;

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");
/** @type {module:app/view/base/CanvasView} */
var bounceEaseFn = require("utils/ease/easing")["easeInQuad"];

var PlayToggleSymbol = {
	PLAY: "playing",
	PAUSE: "paused",
	WAITING: "waiting",
	ENDED: "ended",
};
// var PLAY_PATH = new Path2D("M -15 -17.5 L 22.5 0 L-15 17.5 Z");
// var PAUSE_PATH = new Path2D("M -17.5 -17.5 h 12.5 v 35 h -12.5 Z M5 -17.5 h 12.5 v 35 h -12.5 Z");
// var REPLAY_PATH = new Path2D("M -40 -50 L 65 0 L -40 50 Z M -132 -1.6e-14 A 132 132 0 1 0 -93.33809511662416 -93.33809511662439 L -76.36753236814704 -76.36753236814722 A 108 108 0 1 1 -108 -1.3e-14 H-85 L -120 -40 L -155 13e-14 Z");

module.exports = CanvasView.extend({

	/** @type {string} */
	cidPrefix: "playToggleSymbol",
	/** @type {string} */
	className: "play-toggle-symbol",

	defaults: {
		values: {
			_loop: 0,
			_bounce: 1,
		},
		maxValues: {
			_loop: 1
		},
	},

	properties: {
		symbolName: {
			get: function() {
				return this._symbolName;
			},
			set: function(value) {
				this._setSymbolName(value);
			}
		}
	},

	_symbolName: null,

	_setSymbolName: function(value) {
		console.log("%s::[set] symbol %o", this.cid, value);
		if (this._symbolName != value) {
			this._symbolName = value;
			this.requestRender(CanvasView.LAYOUT_INVALID);
		}
	},

	measureCanvas: function(w, h, s) {
		// make canvas square
		this._canvasHeight = this._canvasWidth = Math.min(w, h);
	},

	updateCanvas: function(ctx, style) {
		var mObj = this._getFontMetrics(this._fontFamily);
		this._baselineShift = mObj ? (mObj.ascent + mObj.descent) / mObj.unitsPerEm : 0.7; // default value
		this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it
		this._baselineShift = Math.round(this._baselineShift);

		// this._ctx.restore();
		// this._ctx.textBaseline = "middle";
		this._ctx.lineWidth = 3 * this._canvasRatio;
		// reset matrix and translate 0,0 to center
		this._ctx.setTransform(1, 0, 0, 1, this._canvasWidth / 2, this._canvasHeight / 2);
		// this._ctx.save();
	},

	redraw: function(ctx, intrp, flags) {
		this._clearCanvas(-this._canvasWidth / 2, -this._canvasHeight / 2,
			this._canvasWidth, this._canvasHeight
		);
		var radius = this._canvasWidth / 4;
		var isLooping = (!this.paused) && (this._symbolName === 'waiting');
		if (isLooping) {
			// _loop loop indefinitely while indeterminate: restart if at end
			if (intrp.isAtTarget("_loop")) {
				intrp
					.valueTo("_loop", 0, 0)
					.valueTo("_loop", 1, 1000)
					.updateValue("_loop");
			}
			if (intrp.isAtTarget("_bounce")) {
				var curr = intrp.getCurrentValue("_bounce");
				intrp
					// .valueTo("_bounce", curr, 0)
					.valueTo("_bounce", (curr < 1 ? 1 : 0), 600, bounceEaseFn)
					.updateValue("_bounce");
			}
		} else {
			if (!intrp.isAtTarget("_loop")) {
				// loopVal = intrp
				// 	.valueTo("_loop", 0, 0)
				// 	.updateValue("_loop")
				// 	.getCurrentValue("_loop");
				intrp
					.valueTo("_loop", null, null)
					.updateValue("_loop");
			}
			if (!intrp.isAtTarget("_bounce")) {
				// bounceVal = intrp
				// 	.valueTo("_bounce", 1, 0)
				// 	.updateValue("_bounce")
				// 	.getCurrentValue("_bounce");
				intrp
					.valueTo("_bounce", null, null)
					.updateValue("_bounce");
			}
		}
		console.log("%s::redraw [paused: %s] [enabled: %s]", this.cid, this.paused, this.enabled);

		// var arcStart = 0.1,
		// 	arcEnd = 0.8,
		// 	arcBase = 1.0;

		switch (this._symbolName) {
			case "waiting":
				var loopVal = intrp.getRenderedValue("_loop");
				var bounceVal = intrp.getRenderedValue("_bounce");
				// loopVal = loopVal * .99999 + .00001;
				// bounceVal = bounceVal * .99999 + .00001;
				// loopVal += 0.25;
				// bounceVal = bounceVal * 0.25;
				ctx.beginPath();
				ctx.arc(0, 0, radius,
					(0.35 + loopVal - bounceVal / 4) * PI2,
					(0.60 + loopVal + bounceVal / 4) * PI2,
					true);
				ctx.stroke();
				// this.drawArc(ctx, loopVal, bounceVal, radius);
				// this.drawLabel((loopVal * 10).toFixed(0) + ":" + (bounceVal * 10).toFixed(0));

				break;
			case "pause":
				this.drawLabel(Globals.PAUSE_CHAR);
				// ctx.fill(PAUSE_PATH);
				break;
			case "replay":
			case "ended":
				// ctx.fill(REPLAY_PATH);
			case "play":
				this.drawLabel(Globals.PLAY_CHAR);
				// ctx.fill(PLAY_PATH);
			default:
				break;
		}

		// if (isLooping) {
		// } else {
		// 	ctx.beginPath();
		// 	ctx.arc(0, 0, radius,
		// 		(arcStart + arcBase) * PI2,
		// 		(arcEnd + arcBase) * PI2,
		// 		true);
		// 	ctx.stroke();
		// }
	},

	// drawArc: function(ctx, arc, start, radius) {
	// 	ctx.beginPath();
	// 	ctx.arc(0, 0, radius,
	// 		start * PI2,
	// 		(arc + start) * PI2,
	// 		true);
	// 	ctx.stroke();
	// },

	// drawShape: function(ctx, data, open) {
	// 	if (open) {
	// 		ctx.stroke(new Path2D(data));
	// 	} else {
	// 		ctx.fill(new Path2D(data));
	// 	}
	// },

	drawLabel: function(labelString) {
		var labelWidth = this._ctx.measureText(labelString).width;
		this._ctx.fillText(labelString,
			labelWidth * -0.5,
			// 0, labelWidth);
			this._baselineShift, labelWidth);
	},
}, PlayToggleSymbol);