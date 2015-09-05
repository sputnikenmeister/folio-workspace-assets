/**
 * @module app/view/render/PlayableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");

// var duotone = require("../../../utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("../../../utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("../../../utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("../../../utils/canvas/bitmap/getAverageRGBA");
var getAverageRGB = require("../../../utils/canvas/bitmap/getAverageRGB");

var _sharedCanvas = null;
var getSharedCanvas =  function() {
	if (_sharedCanvas === null) {
		_sharedCanvas = document.createElement("canvas");
	}
	return _sharedCanvas;
};

/**
 * @constructor
 * @type {module:app/view/render/PlayableRenderer}
 */
module.exports = MediaRenderer.extend({
	
	/** @type {string|Function} */
	className: MediaRenderer.prototype.className + " playable-renderer",
	
	/** @override */
	initialize: function (opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this, "_onToggleEvent");
		this._lastMediaState = null;
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	// createChildren: function() {
	// 	this.el.innerHTML = this.template(this.model.toJSON());
	// 	this.placeholder = this.el.querySelector(".placeholder");
	// 	this.content = this.el.querySelector(".content");
	// 	this.image = this.content.querySelector("img.current");
	// 	this.playToggle = this.el.querySelector(".play-toggle");
	// },
	
	setEnabled: function(enabled) {
		if (enabled) {
			// by default, do nothing
		} else {
			// if selected, pause media
			this.model.selected && this.togglePlayback(false);
		}
	},
	
	/* ---------------------------
	/* selection handlers
	/* when model is selected, click toggles playback
	/* --------------------------- */
	
	addSelectionListeners: function() {
		this.listenTo(this.model, {
			"selected": this._onModelSelected,
			"deselected": this._onModelDeselected,
		});
		this.model.selected && this._onModelSelected();
	},
	
	/* model selection
	/* --------------------------- */
	
	/** @type {String} */
	_toggleEvent: "mouseup",
	
	_onModelSelected: function() {
		// this.togglePlayback(true);
		this.playToggle.addEventListener(this._toggleEvent, this._onToggleEvent, false);
		this.listenTo(this, "view:remove", this._removeClickHandler);
	},
	
	_onModelDeselected: function() {
		this.togglePlayback(false);
		this.playToggle.removeEventListener(this._toggleEvent, this._onToggleEvent, false);
		this.stopListening(this, "view:remove", this._removeClickHandler);
	},
	
	_removeClickHandler: function() {
		this.playToggle.removeEventListener(this._toggleEvent, this._onToggleEvent, false);
	},
	
	/* click dom event
	/* --------------------------- */
	_onToggleEvent: function(domev) {
		// console.log("PlayableRenderer._onToggleEvent", domev.type, "defaultPrevented: " + domev.defaultPrevented);
		
		// NOTE: Perform action if MouseEvent.button is 0 or undefined (0: left-button)
		if (!domev.defaultPrevented && !domev.button) {
			this.togglePlayback();
			domev.preventDefault();
		}
	},
	
	/* --------------------------- *
	/* abstract methods
	/* --------------------------- */
	
	togglePlayback: function(playback) {
		// abstract
	},
	
	_mediaStates: ["network", "media", "user-play", "user-resume", "user-replay"],
	
	setMediaState: function(key) {
		if (this._mediaStates.indexOf(key) === -1) {
			throw new Error("Argument " + key + " invalid. Must be one of: " + this._mediaStates.join(", "));
		}
		if (this._lastMediaState !== key) {
			if (this._lastMediaState) {
				this.content.classList.remove( "pending-" + this._lastMediaState);
			}
			this.content.classList.add("pending-" + key);
			this._lastMediaState = key;
		}
	},
	
	/* --------------------------- *
	/* util
	/* --------------------------- */
	
	updateOverlay: function(mediaEl, targetEl, rectEl) {
		// src/dest rects
		// ------------------------------
		rectEl || (rectEl = targetEl);
		
		// NOTE: does not work with svg element
		// var tRect = rectEl.getBoundingClientRect();
		// var cRect = mediaEl.getBoundingClientRect();
		// var tX = tRect.x - cRect.x,
		// 	tY = tRect.y - cRect.y,
		// 	tW = tRect.width,
		// 	tH = tRect.height;
		
		// target bounds
		var tX = rectEl.offsetLeft,
			tY = rectEl.offsetTop,
			tW = rectEl.offsetWidth,
			tH = rectEl.offsetHeight;
		
		if (!(tX && tY && tW && tH)) {
			return;
		}
			
		// destination rect
		var RECT_GROW = 20;
		var destRect = {
			x: tX - RECT_GROW,
			y: tY - RECT_GROW,
			width: tW + RECT_GROW * 2,
			height: tH + RECT_GROW * 2
		};
			
		// native/display scale
		var sW = this.model.get("w"),
			sH = this.model.get("h"),
			rsX = sW/this.contentWidth,
			rsY = sH/this.contentHeight;
		
		// destRect, scaled to native
		var srcRect = {
			x: Math.max(0, destRect.x * rsX),
			y: Math.max(0, destRect.y * rsY),
			width: Math.min(sW, destRect.width * rsX),
			height: Math.min(sH, destRect.height * rsY)
		};
		
		// Copy image to canvas
		// ------------------------------
		var canvas, context, imageData;
		
		// canvas = document.createElement("canvas");
		// canvas.style.width  = destRect.width + "px";
		// canvas.style.height = destRect.height + "px";
		
		canvas = getSharedCanvas();
		if (canvas.width !== destRect.width || canvas.height !== destRect.height) {
			canvas.width = destRect.width;
			canvas.height = destRect.height;
		}
		context = canvas.getContext("2d");
		context.clearRect(0, 0, destRect.width, destRect.height);
		context.drawImage(mediaEl, 
			srcRect.x, srcRect.y, srcRect.width, srcRect.height,
			0, 0, destRect.width, destRect.height // destination rect
		);
		imageData = context.getImageData(0, 0, destRect.width, destRect.height);
		
		var avgColor = Color().rgb(getAverageRGB(imageData));
		targetEl.classList.toggle("over-dark", avgColor.dark());
			
		// Color, filter opts
		// ------------------------------
		
		// this.fgColor || (this.fgColor = new Color(this.model.attrs()["color"]));
		// this.bgColor || (this.bgColor = new Color(this.model.attrs()["background-color"]));
		// 
		// var opts = { radius: 20 };
		// var isFgDark = this.fgColor.luminosity() < this.bgColor.luminosity();
		// opts.x00 = isFgDark? this.fgColor.clone().lighten(0.5) : this.bgColor.clone().darken(0.5);
		// opts.xFF = isFgDark? this.bgColor.clone().lighten(0.5) : this.fgColor.clone().darken(0.5);
		// 
		// stackBlurMono(imageData, opts);
		// duotone(imageData, opts);
		// stackBlurRGB(imageData, { radius: 20 });
		// 
		// context.putImageData(imageData, 0, 0);
		// targetEl.style.backgroundImage = "url(" + canvas.toDataURL() + ")";
		
		console.log(this.cid, this.model.cid, "PlayableRenderer.updateOverlay");
	}
});
