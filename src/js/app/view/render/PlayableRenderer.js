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
				this._setPlaybackState(value);
			}
		}
	},
	
	/** @override */
	initialize: function (opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this, 
			"_onUserPlaybackToggle",
			"_onVisibilityChange"
		);
		this.playbackState = "user-play";
	},
	
	// initializeAsync: function() {
	// 	// _.bindAll(this, "_onUserPlaybackToggle", "_onVisibilityChange");
	// 	// this._userPlaybackRequested = false;
	// 	// this.playbackState = "user-play";
	// 	
	// 	return MediaRenderer.prototype.initialize.initializeAsync.apply(this, arguments);
	// },
	
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
	
	/* --------------------------- *
	/* setEnabled
	/* --------------------------- */
	
	/** @override */
	setEnabled: function(enabled) {
		MediaRenderer.prototype.setEnabled.apply(this, arguments);
		if (enabled) {
			this._validatePlayback();
		} else {
			// if selected, pause media
			this.model.selected && this.togglePlayback(false);
		}
	},
	
	/* --------------------------- *
	/* playbackState
	/* --------------------------- */
	
	_validPlaybackStates: ["network", "media", "user-play", "user-resume", "user-replay"],
	
	_setPlaybackState: function(key) {
		if (this._playbackState !== key) {
			if (this._validPlaybackStates.indexOf(key) === -1) {
				throw new Error("Value '%s' is not valid. Must be one of: %s", key, this._validPlaybackStates.join(", "));
			}
			if (this._playbackState) {
				this.getContentEl().classList.remove( "pending-" + this._playbackState);
			}
			this.getContentEl().classList.add("pending-" + key);
			this._playbackState = key;
		}
	},
	
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
	
	/* model selected
	/* --------------------------- */
	
	_onModelSelected: function() {
		this._addSelectedHandlers();
		this._validatePlayback();
	},
	_onModelDeselected: function() {
		this._removeSelectedHandlers();
		this.togglePlayback(false);
	},
	
	_addSelectedHandlers: function() {
		document.addEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		this.getPlayToggle().addEventListener(this._toggleEvent, this._onUserPlaybackToggle, false);
		this.listenTo(this.parentView, "view:scrollstart", this._onScrollStart);
		this.listenTo(this.parentView, "view:scrollend", this._onScrollEnd);
		
		this.listenTo(this, "view:removed", this.removeSelectionHandlers);
	},
	_removeSelectedHandlers: function() {
		document.removeEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		this.getPlayToggle().removeEventListener(this._toggleEvent, this._onUserPlaybackToggle, false);
		this.stopListening(this.parentView, "view:scrollstart", this._onScrollStart);
		this.stopListening(this.parentView, "view:scrollend", this._onScrollEnd);
		
		this.stopListening(this, "view:removed", this.removeSelectionHandlers);
	},
	
	/* _onScrollChange
	/* --------------------------- */
	_onScrollStart: function() {
		this.togglePlayback(false);
	},
	
	_onScrollEnd: function() {
		this._validatePlayback();
	},
	
	/* dom events
	/* --------------------------- */
	_onVisibilityChange: function(ev) {
		if (document[visibilityStateProp] === "hidden") {
			this.togglePlayback(false);
		} else {
			this._validatePlayback();
		}
	},
	
	/* --------------------------- *
	/* play-toggle
	/* --------------------------- */
	
	/** @type {String} */
	_userPlaybackRequested: false,
	
	/** @type {String} */
	_toggleEvent: "mouseup",
	
	/** @return {HTMLElement} */
	getPlayToggle: function () {
		return this._playToggle || (this._playToggle = this.el.querySelector(".play-toggle"));
	},
	
	_onUserPlaybackToggle: function(ev) {
		// console.log("PlayableRenderer._onUserPlaybackToggle", ev.type, "defaultPrevented: " + ev.defaultPrevented);
		// NOTE: Perform action if MouseEvent.button is 0 or undefined (0: left-button)
		if (!ev.defaultPrevented && !ev.button) {
			ev.preventDefault();
			this._userPlaybackRequested = !this._userPlaybackRequested;
			
			if (this._userPlaybackRequested) {
				this._validatePlayback();
			} else {
				this.togglePlayback(false);
			}
		}
	},
	
	/* --------------------------- *
	/* togglePlayback
	/* --------------------------- */
	
	_canResumePlayback: function() {
		var retval = !!(this.enabled &&
			this.model.selected &&
			this._userPlaybackRequested &&
			this.mediaState === "ready" &&
			!this.parentView.scrolling &&
			document[visibilityStateProp] !== "hidden");
		// console.log("%s::_canResumePlayback():", this.cid, retval, {
		// 	"enabled": this.enabled,
		// 	"selected": (!!this.model.selected),
		// 	"playback requested": this._userPlaybackRequested,
		// 	"not scrolling": !this.parentView.scrolling,
		// 	"mediaState": this.mediaState,
		// 	"doc visibility": document[visibilityStateProp]
		// });
		return retval;
	},
	
	_validatePlayback: function() {
		if (this._canResumePlayback()) {
			this.togglePlayback(true);
		}
	},
	
	togglePlayback: function(playback) {
		// abstract
	},
	
	/* --------------------------- *
	/* util
	/* --------------------------- */
	
	updateOverlay: function(mediaEl, targetEl, rectEl) {
		// // this method is not critical, just catch and log all errors
		// try {
		// 	this._updateOverlay(mediaEl, targetEl, rectEl)
		// } catch (err) {
		// 	console.error("%s::updateOverlay", this.cid, err);
		// }
	},
	
	_drawMediaElement: function(context, mediaEl, destRect) {
		// destination rect
		mediaEl || (mediaEl = this.defaultImage);
		destRect || (destRect = {
			x:0, y:0,
			width: this.metrics.media.width,
			height: this.metrics.media.height
		});
			
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
		var canvas = context.canvas;
		if (canvas.width !== destRect.width || canvas.height !== destRect.height) {
			canvas.width = destRect.width;
			canvas.height = destRect.height;
		}
		context.clearRect(0, 0, destRect.width, destRect.height);
		context.drawImage(mediaEl, 
			srcRect.x, srcRect.y, srcRect.width, srcRect.height,
			0, 0, destRect.width, destRect.height // destination rect
		);
		
		return context;
	},
	
	/*
	_updateOverlay: function(mediaEl, targetEl, rectEl) {
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
	}*/
});

module.exports = PlayableRenderer;
