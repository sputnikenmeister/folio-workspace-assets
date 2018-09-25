/**
 * @module app/view/component/PlayToggleSymbol
 */

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");

/** @type {Function} */
var Color = require("color");
/** @type {module:utils/canvas/bitmap/stackBlurRGB} */
var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
/** @type {module:utils/canvas/bitmap/getAverageRGB} */
var getAverageRGB = require("utils/canvas/bitmap/getAverageRGB");
/** @type {module:utils/canvas/bitmap/multiply} */
var multiply = require("utils/canvas/bitmap/multiply");
/** @type {module:utils/canvas/bitmap/desaturate} */
var desaturate = require("utils/canvas/bitmap/desaturate");
/** @type {module:utils/canvas/CanvasHelper} */
var roundRect = require("utils/canvas/CanvasHelper").roundRect;

/** @type {module:utils/ease/fn/easeInQuad} */
var easeIn = require("utils/ease/fn/easeInQuad");
/** @type {module:utils/ease/fn/easeOutQuad} */
var easeOut = require("utils/ease/fn/easeOutQuad");

var PI2 = Math.PI * 2;
var LOOP_OFFSET = 1.833333;
var INTEP_MS = require("app/control/Globals").TRANSITION_DURATION;
var FILTER_REFRESH_THRESHOLD = 0.5; //seconds elapsed
var FILTER_SCALE = 1.5;
var FILTER_RADIUS = 30; //pixels
var FILTER_MULTIPLY = 0.1;

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
			color: "rgba(255,255,255,1.0)",
			backgroundColor: "rgba(0,0,0,0.25)",
			paused: true,
			symbolName: "",
			// borderRadius: 3,
			// borderWidth: 3,
		},

		properties: {
			symbolName: {
				get: function() {
					return this._symbolName;
				},
				set: function(value) {
					this._setSymbolName(value);
				}
			},
		},

		/** @override */
		initialize: function(options) {
			// TODO: cleanup options mess in CanvasView
			CanvasView.prototype.initialize.apply(this, arguments);
			this._options = _.extend(this._options, _.pick(options, "symbolName", "borderRadius", "borderWidth"));
			this.symbolName = this._options.symbolName;
		},

		/** @override */
		measureCanvas: function(w, h, s) {
			// make canvas square
			this._canvasHeight = this._canvasWidth = Math.min(w, h);
		},

		/** @override */
		updateCanvas: function(ctx, s) {
			var mObj = this._getFontMetrics(this._fontFamily);
			this._baselineShift = mObj ? (mObj.ascent + mObj.descent) / mObj.unitsPerEm : 0.7; // default value
			this._baselineShift *= this._fontSize * 0.5; // apply to font-size, halve it
			this._baselineShift = Math.round(this._baselineShift);

			this._canvasOffsetX = this._canvasOffsetY = this._canvasWidth / 2;
			// double SQRT1_2: square within circle within square
			this._radius = (this._canvasWidth / 2) * Math.SQRT1_2 * Math.SQRT1_2 * Math.SQRT1_2;
			this._side = this._radius; // * Math.SQRT1_2; // * Math.SQRT1_2;
			// this._borderWidth = this._options.borderWidth * this._canvasRatio;
			// this._borderRadius = this._canvasWidth * this._canvasRatio / 2; //this._options.borderRadius * this._canvasRatio;

			// reset matrix and translate 0,0 to center
			this._ctx.setTransform(1, 0, 0, 1, this._canvasOffsetX, this._canvasOffsetY);
			// this._ctx.restore();
			// this._ctx.textBaseline = "middle";
			this._ctx.lineWidth = this._radius * (1 - Math.SQRT1_2);
			// this._ctx.fillStyle = "#FFF";
			this._ctx.shadowColor = "rgba(0,0,0,0.75)";
			this._ctx.shadowBlur = 1;
			this._ctx.shadowOffsetX = 2;
			this._ctx.shadowOffsetY = 2;
			// this._ctx.save();

			this._isImageDataInvalid = true;
			//console.log("%s::updateCanvas %s", this.cid, this._backgroundColor);
		},

		/* --------------------------- *
		 * symbolName
		 * --------------------------- */

		_symbolName: "",
		_setSymbolName: function(value) {
			if (this._symbolName !== value) {
				this._lastSymbolName = this._symbolName;
				this._symbolName = value;

				this.refreshImageSource();
				this.requestRender(CanvasView.LAYOUT_INVALID);
				console.log("%s::[set] symbol %o (from %o)", this.attached ? this.parentView.cid : this.cid, this._symbolName, this._lastSymbolName, this.paused ? "paused" : "");
			}
		},

		/* --------------------------- *
		 * setImageSource/refreshImageSource
		 * --------------------------- */

		_imageSource: null,
		setImageSource: function(imageSource) {
			if (this._imageSource !== imageSource) {
				this._imageSource = imageSource;
				this._isImageDataInvalid = true;
				this.requestRender(CanvasView.SIZE_INVALID);
			}
		},

		_imageDataTC: null,
		refreshImageSource: function(threshold) {
			if (this._isImageDataInvalid || !(this._imageSource instanceof HTMLVideoElement)) {
				return; // data is marked for refresh already, or not a video
			}
			if (!_.isNumber(threshold)) {
				threshold = FILTER_REFRESH_THRESHOLD;
			}
			if (threshold < Math.abs(this._imageDataTC - this._imageSource.currentTime)) {
				this._isImageDataInvalid = true;
				this.requestRender(CanvasView.SIZE_INVALID);
			}
		},

		_imageData: null,
		_updateImageData: function() {
			if (this._imageSource === null) {
				this._imageData = null;
				this._imageDataTC = null;
				return;
			}
			// source scale, source rect, dest scale, dest rect, current timecode
			var s, sr, d, dr, tc;

			// Get source/dest offsets, intrinsic scale and timecode
			// ---------------------------------
			sr = this._imageSource.getBoundingClientRect();
			dr = this.el.getBoundingClientRect();

			if (this._imageSource instanceof HTMLVideoElement) {
				s = this._imageSource.videoWidth / sr.width;
				tc = this._imageSource.currentTime;
			} else {
				s = this._imageSource.naturalWidth / sr.width;
				tc = 0;
			}
			d = s * FILTER_SCALE;

			// draw source canvas maintaining position
			// ---------------------------------
			this._ctx.save();
			this._ctx.setTransform(1, 0, 0, 1, 0, 0);
			this._ctx.drawImage(this._imageSource,
				(dr.left - sr.left) * s + (dr.width / 2) * s - (dr.width / 2) * d,
				(dr.top - sr.top) * s + (dr.height / 2) * s - (dr.height / 2) * d,
				dr.width * d, dr.height * d,
				0, 0, this.el.width, this.el.height
			);
			// if (d == s)
			// this._ctx.drawImage(this._imageSource,
			// 	(dr.left - sr.left) * s, (dr.top - sr.top) * s,
			// 	dr.width * s, dr.height * s,
			// 	0, 0, this.el.width, this.el.height
			// );

			// get ImageData
			// find luminosity threshold form average color
			// ---------------------------------
			var imgdata, isDark;

			imgdata = this._ctx.getImageData(0, 0, this.el.width, this.el.height);
			// isDark = !Color().rgb(getAverageRGB(imgdata)).dark();

			// this._ctx.globalCompositeOperation = "luminosity";
			// this._ctx.globalAlpha = 0.25;
			// this._ctx.fillStyle = (isDark ? "black" : "white");
			// this._ctx.fillRect(0, 0, this.el.width, this.el.height);

			this._ctx.clearRect(0, 0, this.el.width, this.el.height);
			this._ctx.restore();

			// Store appropiate color values
			// ---------------------------------
			this._color = isDark ? "white" : "black";
			// this._color = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)";
			// this._backgroundColor = isDark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.74)";

			// this.el.style.color =
			// 	this._ctx.fillStyle =
			// 	this._ctx.strokeStyle =
			// 	this._color;
			// this.el.style.backgroundColor =
			// 	this._ctx.shadowColor =
			// 	this._backgroundColor;

			// this.el.classList.toggle("lod", isDark);
			// this.el.classList.toggle("dol", !isDark);

			// Apply filters and save results
			// ---------------------------------
			// imgdata = this._ctx.getImageData(0, 0, this.el.width, this.el.height);
			// imgdata = multiply(imgdata, (isDark ? 1 - FILTER_MULTIPLY : 1 + FILTER_MULTIPLY));
			// imgdata = desaturate(imgdata, 0.5);

			imgdata = multiply(imgdata, 1 + FILTER_MULTIPLY);
			imgdata = stackBlurRGB(imgdata, FILTER_RADIUS);
			// imgdata = null;

			this._imageData = imgdata;
			this._imageDataTC = tc;
		},

		/** @override */
		redraw: function(ctx, intrp, flags) {
			this._clearCanvas();

			if (this._symbolName === 'waiting') {
				if (intrp.getTargetValue('_arc') === 0) {
					intrp.valueTo('_arc', 1, 0 * INTEP_MS, easeIn)
						.updateValue('_arc');
				}
			} else {
				if (intrp.getTargetValue('_arc') === 1) {
					intrp.valueTo('_arc', 0, 0 * INTEP_MS, easeOut)
						.updateValue('_arc');
				}
			}
			var a = intrp.getRenderedValue("_arc");
			// while arc is > 0, loop indefinitely while spinning and restart
			// if at end. Otherwise let interp exhaust arc duration
			if (a > 0) {
				if (!intrp.paused && intrp.isAtTarget('_loop')) {
					// console.log("%s::redraw [loop]", this.cid, this.parentView.cid);
					intrp
						.valueTo('_loop', 0, 0)
						.valueTo('_loop', 1, 2 * INTEP_MS)
						.updateValue('_loop');
				}
			}
			var l = intrp.getRenderedValue("_loop");

			// if (this._isImageDataInvalid) {
			// 	this._isImageDataInvalid = false;
			// 	this._updateImageData();
			// }
			// if (this._imageData !== null) {
			// 	ctx.putImageData(this._imageData, 0, 0);
			// }

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
