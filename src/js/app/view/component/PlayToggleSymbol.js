/**
 * @module app/view/component/PlayToggleSymbol
 */

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");

/** @type {module:utils/ease/fn/easeInQuad} */
var easeIn = require("utils/ease/fn/easeInQuad");
/** @type {module:utils/ease/fn/easeOutQuad} */
var easeOut = require("utils/ease/fn/easeOutQuad");

var LOOP_OFFSET = 1.833333;
var PI2 = Math.PI * 2;
var STEP_MS = 300;

var PlayToggleSymbol = {
	PLAY: "playing",
	PAUSE: "paused",
	WAITING: "waiting",
	ENDED: "ended",
};

module.exports = CanvasView.extend({

		/** @type {string} */
		cidPrefix: "playToggleSymbol",
		/** @type {string} */
		className: "play-toggle",

		defaults: {
			values: {
				_loop: 0,
				_arc: 0,
			},
			maxValues: {
				_loop: 1
			},
			symbolName: "play",
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

		/** @override */
		initialize: function(options) {
			// TODO: cleanup options mess in CanvasView
			CanvasView.prototype.initialize.apply(this, arguments);
			this._options = _.extend(this._options, _.pick(options, "symbolName"));
			this.symbolName = this._options.symbolName;
		},

		_symbolName: null,

		_setSymbolName: function(value) {
			if (this._symbolName !== value) {
				this._lastSymbolName = this._symbolName;
				this._symbolName = value;
				this.requestRender(CanvasView.LAYOUT_INVALID);
				console.log("%s::[set] symbol %o (from %o)", this.cid, this._lastSymbolName, this._symbolName);
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
			// double SQRT1_2: square within circle within square
			this._radius = (this._canvasWidth / 2) * Math.SQRT1_2 * Math.SQRT1_2;
			this._side = this._radius * Math.SQRT1_2; // * Math.SQRT1_2;

			// this._ctx.restore();
			// this._ctx.textBaseline = "middle";
			this._ctx.lineWidth = 3 * this._canvasRatio;
			this._ctx.shadowBlur = 0;
			this._ctx.shadowColor = "#000000";
			this._ctx.shadowOffsetX = 1;
			this._ctx.shadowOffsetY = 1;
			// reset matrix and translate 0,0 to center
			this._ctx.setTransform(1, 0, 0, 1, this._canvasWidth / 2, this._canvasHeight / 2);
			// this._ctx.save();
		},

		redraw: function(ctx, intrp, flags) {
			this._clearCanvas(
				-this._canvasWidth / 2, -this._canvasHeight / 2,
				this._canvasWidth, this._canvasHeight
			);
			ctx.save();
			ctx.fillStyle = "rgba(0,0,0,0.2)";
			this.drawRoundRect(ctx,
				-this._canvasWidth / 2, -this._canvasHeight / 2,
				this._canvasWidth, this._canvasHeight, 3 * this._canvasRatio);
			ctx.fill();
			ctx.restore();

			if (this._symbolName === 'waiting') {
				if (intrp.getTargetValue('_arc') === 0) {
					intrp.valueTo('_arc', 1, 1 * STEP_MS, easeIn).updateValue('_arc');
				}
			} else {
				if (intrp.getTargetValue('_arc') === 1) {
					intrp.valueTo('_arc', 0, 1 * STEP_MS, easeOut).updateValue('_arc');
				}
			}
			var a = intrp.getRenderedValue("_arc");
			// while arc is > 0, loop indefinitely while spinning and restart
			// if at end. Otherwise let interp exhaust arc duration
			if (a > 0) {
				if (!intrp.paused && intrp.isAtTarget('_loop')) {
					intrp
						.valueTo('_loop', 0, 0)
						.valueTo('_loop', 1, 2 * STEP_MS)
						.updateValue('_loop');
				}
			}
			var l = intrp.getRenderedValue("_loop");
			// always render while arc is > 0
			if (a > 0) {
				// arc span bounce
				var b = (l < 0.5 ? (l % 0.5) : 0.5 - (l % 0.5)) * 2;
				// bounce + main arc span
				var aa = (a * b * 0.25) + (a * 0.125) + .0001;
				// rotation loop
				var ll = l + LOOP_OFFSET;

				ctx.beginPath();
				ctx.arc(0, 0, this._radius, ((1 - aa) + ll) * PI2, (aa + ll) * PI2, false);
				ctx.stroke();
			}

			switch (this._symbolName) {
				case "replay":
				case "ended":
				case "play":
					// this.drawPlay(ctx, (1 - a) * s);
					this.drawPlay(ctx, this._side);
					ctx.fill();
					break;
				case "pause":
					// this.drawPause(ctx, (1 - a) * s);
					this.drawPause(ctx, this._side);
					ctx.fill();
					break;
				case "waiting":
					switch (this._lastSymbolName) {
						case "replay":
						case "ended":
						case "play":
							this.drawPlay(ctx, (1 - a) * this._side);
							ctx.fill();
							break;
						case "pause":
							this.drawPause(ctx, (1 - a) * this._side);
							ctx.fill();
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		},

		drawRoundRect: function(ctx, x, y, w, h, r) {
			ctx.beginPath();
			ctx.moveTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.closePath();
			// ctx.fill();
		},

		drawPlay: function(ctx, r) {
			var tx = (1 - Math.SQRT1_2) * r;
			ctx.beginPath();
			ctx.moveTo(tx + r, 0);
			ctx.lineTo(tx - r, -r);
			ctx.lineTo(tx - r, r);
			ctx.closePath();
		},

		drawPause: function(ctx, r) {
			var w = r * 0.75;
			var h = r * 2;
			ctx.beginPath();
			ctx.rect(-r, -r, w, h);
			ctx.rect(r - w, -r, w, h);
			ctx.closePath();
		},

		drawLabel: function(labelString) {
			var labelWidth = this._ctx.measureText(labelString).width;
			this._ctx.fillText(labelString,
				labelWidth * -0.5,
				// 0, labelWidth);
				this._baselineShift, labelWidth);
		},
	},
	PlayToggleSymbol);