/**
 * @module app/view/render/PlayableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("app/view/render/MediaRenderer");
/** @type {Function} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {Function} */
var prefixedEvent = require("utils/prefixedEvent");

/** @type {Function} */
// var duotone = require("utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");
var getAverageRGB = require("utils/canvas/bitmap/getAverageRGB");

var _sharedCanvas = null;
var getSharedCanvas =  function() {
	if (_sharedCanvas === null) {
		_sharedCanvas = document.createElement("canvas");
	}
	return _sharedCanvas;
};

var visibilityHiddenProp = prefixedProperty("hidden", document);
var visibilityStateProp = prefixedProperty("visibilityState", document);
var visibilityChangeEvent = prefixedEvent("visibilitychange", document, "hidden");

/**
 * @constructor
 * @type {module:app/view/render/PlayableRenderer}
 */
var PlayableRenderer = MediaRenderer.extend({
	
	/** @type {string|Function} */
	className: MediaRenderer.prototype.className + " playable-renderer",
	
	properties: {
		paused: {
			get: function() {
				return true;
			}
		},
		playbackState: {
			get: function() {
				return this._playbackState;
			},
			set: function(value) {
				this.setPlaybackState(value);
			}
		}
	},
	
	/** @override */
	initialize: function (opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this, "_onToggleEvent", "_onVisibilityChange");
		// this._playbackState = null;
		this.playbackState = "user-play";
	},
	
	/** @override */
	setEnabled: function(enabled) {
		if (enabled) {
			// by default, do nothing
		} else {
			// if selected, pause media
			this.model.selected && this.togglePlayback(false);
		}
	},
	
	// /** @override */
	// remove: function() {
	// 	MediaRenderer.prototype.remove.apply(this, arguments);
	// }
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	// createChildren: function() {
	// 	this.el.innerHTML = this.template(this.model.toJSON());
	// 	this.placeholder = this.el.querySelector(".placeholder");
	// 	this.content = this.el.querySelector(".content");
	// 	this.image = this.content.querySelector("img.current");
	// 	this._playToggle = this.el.querySelector(".play-toggle");
	// },
	
	/* ---------------------------
	/* selection handlers
	/* when model is selected, click toggles playback
	/* --------------------------- */
	
	addSelectionListeners: function() {
		this.listenTo(this.model, "selected", this._onModelSelected);
		this.listenTo(this.model, "deselected", this._onModelDeselected);
		this.model.selected && this._onModelSelected();
	},
	
	removeSelectionListeners: function() {
		this.stopListening(this.model, "selected", this._onModelSelected);
		this.stopListening(this.model, "deselected", this._onModelDeselected);
		this.model.selected && this._onModelDeselected();
	},
	
	_onModelSelected: function() {
		this._addSelectedHandlers();
	},
	
	_onModelDeselected: function() {
		this.togglePlayback(false);
		this._removeSelectedHandlers();
	},
	
	_addSelectedHandlers: function() {
		document.addEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		this.getPlayToggle().addEventListener(this._toggleEvent, this._onToggleEvent, false);
		
		this.listenTo(this, "view:removed", this.removeSelectionHandlers);
	},
	
	_removeSelectedHandlers: function() {
		document.removeEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		this.getPlayToggle().removeEventListener(this._toggleEvent, this._onToggleEvent, false);
		
		this.stopListening(this, "view:removed", this.removeSelectionHandlers);
	},
	
	/* dom events
	/* --------------------------- */
	
	_onVisibilityChange: function(ev) {
		if (document[visibilityStateProp] !== "visible"){
			this.togglePlayback(false);
		}
	},
	
	/* --------------------------- *
	/* play-toggle
	/* --------------------------- */
	
	/** @type {String} */
	_toggleEvent: "mouseup",
	
	_onToggleEvent: function(ev) {
		// console.log("PlayableRenderer._onToggleEvent", ev.type, "defaultPrevented: " + ev.defaultPrevented);
		// NOTE: Perform action if MouseEvent.button is 0 or undefined (0: left-button)
		if (!ev.defaultPrevented && !ev.button) {
			this.togglePlayback();
			ev.preventDefault();
		}
	},
	
	/** @return {HTMLElement} */
	getPlayToggle: function () {
		return this._playToggle || (this._playToggle = this.el.querySelector(".play-toggle"));
	},
	
	togglePlayback: function(playback) {
		// abstract
	},
	
	/* --------------------------- *
	/* playbackState
	/* --------------------------- */
	
	_validPlaybackStates: ["network", "media", "user-play", "user-resume", "user-replay"],
	
	setPlaybackState: function(key) {
		if (this._playbackState !== key) {
			if (this._validPlaybackStates.indexOf(key) === -1) {
				throw new Error("Value '%s' is not valid. Must be one of: %s", key, this._playbackStates.join(", "));
			}
			if (this._playbackState) {
				this.getContentEl().classList.remove( "pending-" + this._playbackState);
			}
			this.getContentEl().classList.add("pending-" + key);
			this._playbackState = key;
		}
	},
	
	/* --------------------------- *
	/* util
	/* --------------------------- */
	
	updateOverlay: function(mediaEl, targetEl, rectEl) {
	},
	
	/*
	updateOverlay: function(mediaEl, targetEl, rectEl) {
		// this method is not critical, just catch and log all errors
		try {
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
		
		if (tX === void 0 || tY === void 0 || tW === void 0 || tH === void 0) {
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
			rsX = sW/this.metrics.media.width,
			rsY = sH/this.metrics.media.height;
		
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
		// var avgHex = avgColor.hexString(), els = this.el.querySelectorAll("img, video");
		// for (var i = 0; i < els.length; i++) {
		// 	els.item(i).style.backgroundColor = avgHex;
		// }
		
		targetEl.classList.toggle("over-dark", avgColor.dark());
		
		// console.log("%s::updateOverlay() avgColor:%s (%s)", this.cid, avgColor.rgbString(), avgColor.dark()?"dark":"light", targetEl);
			
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
		
		} catch (err) {
			console.error("%s::updateOverlay", this.cid, err);
		}
	}*/
});

module.exports = PlayableRenderer;
