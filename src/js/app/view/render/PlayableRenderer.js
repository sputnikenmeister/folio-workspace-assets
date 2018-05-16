/**
 * @module app/view/render/PlayableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
// var Color = require("color");

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("app/view/render/MediaRenderer");
// /** @type {module:app/view/component/ProgressMeter} */
// var ProgressMeter = require("app/view/component/ProgressMeter");

/** @type {Function} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {Function} */
var prefixedEvent = require("utils/prefixedEvent");

// var visibilityHiddenProp = prefixedProperty("hidden", document);
/** @type {String} */
var visibilityStateProp = prefixedProperty("visibilityState", document);
/** @type {String} */
var visibilityChangeEvent = prefixedEvent("visibilitychange", document, "hidden");

/** @type {Function} */
// var duotone = require("utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");
// var getAverageRGB = require("utils/canvas/bitmap/getAverageRGB");

// /** @type {HTMLCanvasElement} */
// var _sharedCanvas = null;
// /** @return {HTMLCanvasElement} */
// var getSharedCanvas = function() {
// 	if (_sharedCanvas === null) {
// 		_sharedCanvas = document.createElement("canvas");
// 	}
// 	return _sharedCanvas;
// };

// function logAttachInfo(view, name, level) {
// 	if (["log", "info", "warn", "error"].indexOf(level) != -1) {
// 		level = "log";
// 	}
// 	console[level].call(console, "%s::%s [parent:%s %s %s depth:%s]", view.cid, name, view.parentView && view.parentView.cid, view.attached ? "attached" : "detached", view._viewPhase, view.viewDepth);
// }

/**
 * @constructor
 * @type {module:app/view/render/PlayableRenderer}
 */
var PlayableRenderer = MediaRenderer.extend({

	/** @type {string} */
	cidPrefix: "playableRenderer",

	/** @type {string|Function} */
	className: MediaRenderer.prototype.className + " playable-renderer",

	properties: {
		paused: {
			/** @return {Boolean} */
			get: function() {
				return this._isMediaPaused();
			}
		},
		playbackRequested: {
			/** @return {Boolean} */
			get: function() {
				return this._playbackRequested;
			},
			set: function(value) {
				this._setPlaybackRequested(value);
			}
		},
		playToggle: {
			/** @return {HTMLElement} */
			get: function() {
				return this._playToggle || (this._playToggle = this.el.querySelector(".play-toggle"));
			}
		},
		overlay: {
			/** @return {HTMLElement} */
			get: function() {
				return this._overlay || (this._overlay = this.el.querySelector(".overlay"));
			}
		}
	},

	/** @override */
	initialize: function(opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this,
			"_onPlaybackToggle",
			"_onVisibilityChange"
		);
		this._setPlaybackRequested(this._playbackRequested);
		// this.listenTo(this, "view:parentChange", function(childView, newParent, oldParent) {
		// 	// logAttachInfo(this, "[view:parentChange]", "info");
		// 	console.info("%s::[view:parentChange] '%s' to '%s'", this.cid, oldParent && oldParent.cid, newParent && newParent.cid);
		// });
	},

	// /** @override */
	// initializeAsync: function() {
	// 	return MediaRenderer.prototype.initialize.initializeAsync.apply(this, arguments);
	// },

	// /** @override */
	// remove: function() {
	// 	MediaRenderer.prototype.remove.apply(this, arguments);
	// 	return this;
	// },

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	// createChildren: function() {
	// 	this.el.innerHTML = this.template(this.model.toJSON());
	// 	this.placeholder = this.el.querySelector(".placeholder");
	// 	this.content = this.el.querySelector(".content");
	// 	this.image = this.content.querySelector("img.current");
	// },

	/* --------------------------- *
	/* setEnabled
	/* --------------------------- */

	/** @override */
	setEnabled: function(enabled) {
		MediaRenderer.prototype.setEnabled.apply(this, arguments);
		// this._validatePlayback(enabled);
		// if (enabled) {
		this._validatePlayback();
		// } else {
		// 	// if selected, pause media
		// 	this.model.selected && this.togglePlayback(false);
		// 	// this.togglePlayback(false);
		// }
	},

	/* ---------------------------
	/* selection handlers
	/* --------------------------- */

	addSelectionListeners: function() {
		if (this._viewPhase != "initialized")
			throw new Error(this.cid + "::addSelectionListeners called while " + this._viewPhase);

		// logAttachInfo(this, "addSelectionListeners", "log");
		// this.listenTo(this, "view:removed", this.removeSelectionListeners);
		this.listenTo(this.model, "selected", this._onModelSelected);
		this.listenTo(this.model, "deselected", this._onModelDeselected);
		if (this.model.selected) {
			this._onModelSelected();
		}
	},

	// removeSelectionListeners: function() {
	// 	// logAttachInfo(this, "removeSelectionListeners", "log");
	// 	this.stopListening(this, "view:removed", this.removeSelectionListeners);
	// 	this.stopListening(this.model, "selected", this._onModelSelected);
	// 	this.stopListening(this.model, "deselected", this._onModelDeselected);
	// 	if (this.model.selected) {
	// 		this._onModelDeselected();
	// 	}
	// },

	/* model selected handlers:
	/* model selection toggles playback
	/* --------------------------- */

	_onModelSelected: function() {
		console.log("%s::_onModelSelected _playbackRequested: %s, event: %s", this.cid, this._playbackRequested, this._toggleEvent);
		// logAttachInfo(this, "_onModelSelected", "log");
		// this._addParentListeners();
		this.listenTo(this, "view:parentChange", this._onParentChange);
		if (this.parentView) this._onParentChange(this, this.parentView, null);

		this._addDOMListeners();
		this._validatePlayback();
	},

	_onModelDeselected: function() {
		// logAttachInfo(this, "_onModelDeselected", "log");
		// this._removeParentListeners();
		this.stopListening(this, "view:parentChange", this._onParentChange);
		if (this.parentView) this._onParentChange(this, null, this.parentView);

		this._removeDOMListeners();
		this.togglePlayback(false);
		// this._validatePlayback(this.model.selected);
		// this._validatePlayback();
	},

	/* view:parentChange handlers 3
	/* --------------------------- */

	_onParentChange: function(childView, newParent, oldParent) {
		// console.log("[scroll] %s::_onParentChange '%s' to '%s'", this.cid, oldParent && oldParent.cid, newParent && newParent.cid);
		if (oldParent) this.stopListening(oldParent, "view:scrollstart view:scrollend", this._onScrollChange);
		if (newParent) this.listenTo(newParent, "view:scrollstart view:scrollend", this._onScrollChange);
	},

	_onScrollChange: function() {
		if (this.parentView === null) {
			this.togglePlayback(false);
			throw new Error(this.cid + "::_onScrollChange parentView is null");
		}
		// console.log("[scroll] %s::_onScrollChange %s.scrolling: %s", this.cid, this.parentView.cid, this.parentView.scrolling);

		// this._validatePlayback(!this.parentView.scrolling);
		// if (!this.parentView.scrolling) {
		this._validatePlayback();
		// } else {
		// 	this.togglePlayback(false);
		// }
	},

	/* view:parentChange handlers
	/* --------------------------- */

	/*_addParentListeners: function() {
		if (!this.parentView) {
			logAttachInfo(this, "_addParentListeners", "error");
			return;
		}
		this.listenTo(this, "view:remove", this._removeParentListeners);
		this.listenTo(this.parentView, "view:remove", this._removeParentListeners);
		this.listenTo(this.parentView, "view:scrollstart", this._onScrollStart);
		this.listenTo(this.parentView, "view:scrollend", this._onScrollEnd);
	},

	_removeParentListeners: function(view) {
		if (!this.parentView) {
			logAttachInfo(this, "_removeParentListeners", "error");
			return;
		}
		if (view !== void 0) {
			logAttachInfo(this, "_removeParentListeners [event source view]", "info");
			// console.info("%s[playable]::_removeParentListeners event source view: %s", this.cid, view && view.cid);
		}

		this.stopListening(this, "view:remove", this._removeParentListeners);
		this.stopListening(this.parentView, "view:remove", this._removeParentListeners);
		this.stopListening(this.parentView, "view:scrollstart", this._onScrollStart);
		this.stopListening(this.parentView, "view:scrollend", this._onScrollEnd);
	},*/

	/* view:scrollstart view:scrollend
	/* --------------------------- */

	/*_onScrollStart: function() {
		this.togglePlayback(false);
	},

	_onScrollEnd: function() {
		this._validatePlayback();
	},*/

	/* listen to DOM events
	/* --------------------------- */

	_addDOMListeners: function() {
		this.listenTo(this, "view:removed", this._removeDOMListeners);
		document.addEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		this.playToggle.addEventListener(this._toggleEvent, this._onPlaybackToggle, true);
	},

	_removeDOMListeners: function() {
		this.stopListening(this, "view:removed", this._removeDOMListeners);
		document.removeEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		this.playToggle.removeEventListener(this._toggleEvent, this._onPlaybackToggle, true);
	},

	/* visibility dom event
	/* --------------------------- */
	_onVisibilityChange: function(ev) {
		// this._validatePlayback(!document[visibilityHiddenProp]);
		// this._validatePlayback(document[visibilityStateProp] != "hidden");
		// if (document[visibilityStateProp] != "hidden") {
		this._validatePlayback();
		// } else {
		// 	this.togglePlayback(false);
		// }
	},

	/* --------------------------- *
	/* play-toggle
	/* --------------------------- */

	/** @type {String} */
	_toggleEvent: window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",

	_onPlaybackToggle: function(ev) {
		console.log("%s[%sabled]::_onPlaybackToggle[%s] defaultPrevented: %s", this.cid, this.enabled ? "en" : "dis", ev.type, ev.defaultPrevented);
		// NOTE: Perform action if MouseEvent.button is 0 or undefined (0: left-button)
		if (!ev.defaultPrevented && !ev.button) {
			ev.preventDefault();
			this.playbackRequested = !this.playbackRequested;
		}
	},

	/* --------------------------- *
	/* playbackRequested
	/* --------------------------- */

	/** @type {Boolean?} */
	_playbackRequested: null,

	_setPlaybackRequested: function(value) {
		this._playbackRequested = value;

		var classList = this.content.classList;
		classList.toggle("playing", value === true);
		classList.toggle("paused", value === false);
		classList.toggle("requested", value === true || value === false);

		// this._validatePlayback(this.playbackRequested);
		// if (this.playbackRequested) {
		this._validatePlayback();
		// } else {
		// 	this.togglePlayback(false);
		// }
	},

	/* --------------------------- *
	/* togglePlayback
	/* --------------------------- */

	/** @override */
	togglePlayback: function(newPlayState) {
		// console.log("[scroll] %s::togglePlayback [%s -> %s] (requested: %s)", this.cid,
		// 		(this._isMediaPaused()? "pause" : "play"),
		// 		(newPlayState? "play" : "pause"),
		// 		this.playbackRequested
		// 	);
		if (_.isBoolean(newPlayState) && newPlayState !== this._isMediaPaused()) {
			return; // requested state is current, do nothing
		} else {
			newPlayState = this._isMediaPaused();
		}
		if (newPlayState) { // changing to what?
			this._playMedia();
		} else {
			this._pauseMedia();
		}
	},

	_canResumePlayback: function() {
		return !!(
			this.enabled &&
			this.model.selected &&
			this.playbackRequested &&
			(this.mediaState === "ready") &&
			this.attached &&
			(this.parentView !== null) &&
			(!this.parentView.scrolling) &&
			(document[visibilityStateProp] != "hidden")
		);
	},

	_validatePlayback: function(shortcircuit) {
		// a 'shortcircuit' boolean argument can be passed, and if false,
		// skip _canResumePlayback and pause playback right away
		if (arguments.length != 0 && !shortcircuit) {
			this.togglePlayback(false);
		} else {
			this.togglePlayback(this._canResumePlayback());
		}
	},

	/* --------------------------- *
	/* abstract
	/* --------------------------- */

	_isMediaPaused: function() {
		console.warn("%s::_isMediaPaused Not implemented", this.cid);
		return true;
	},

	_playMedia: function() {
		console.warn("%s::_playMedia Not implemented", this.cid);
	},

	_pauseMedia: function() {
		console.warn("%s::_pauseMedia Not implemented", this.cid);
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

	_drawMediaElement: function(context, mediaEl, dest) {
		// destination rect
		// NOTE: mediaEl is expected to have the same dimensions in this.metrics.media
		mediaEl || (mediaEl = this.defaultImage);
		dest || (dest = {
			x: 0,
			y: 0,
			width: this.metrics.media.width,
			height: this.metrics.media.height
		});

		// native/display scale
		var sW = this.model.get("source").get("w"),
			sH = this.model.get("source").get("h"),
			rsX = sW / this.metrics.media.width,
			rsY = sH / this.metrics.media.height;

		// dest, scaled to native
		var src = {
			x: Math.max(0, dest.x * rsX),
			y: Math.max(0, dest.y * rsY),
			width: Math.min(sW, dest.width * rsX),
			height: Math.min(sH, dest.height * rsY)
		};

		// resize canvas
		// var canvas = context.canvas;
		// if (canvas.width !== dest.width || canvas.height !== dest.height) {
		// 	canvas.width = dest.width;
		// 	canvas.height = dest.height;
		// }
		context.canvas.width = dest.width;
		context.canvas.height = dest.height;

		// copy image to canvas
		context.clearRect(0, 0, dest.width, dest.height);
		context.drawImage(mediaEl,
			src.x, src.y, src.width, src.height,
			0, 0, dest.width, dest.height // destination rect
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
		var dest = {
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

		// dest, scaled to native
		var src = {
			x: Math.max(0, dest.x * rsX),
			y: Math.max(0, dest.y * rsY),
			width: Math.min(sW, dest.width * rsX),
			height: Math.min(sH, dest.height * rsY)
		};

		// Copy image to canvas
		// ------------------------------
		var canvas, context, imageData;

		// canvas = document.createElement("canvas");
		// canvas.style.width  = dest.width + "px";
		// canvas.style.height = dest.height + "px";

		canvas = getSharedCanvas();
		if (canvas.width !== dest.width || canvas.height !== dest.height) {
			canvas.width = dest.width;
			canvas.height = dest.height;
		}
		context = canvas.getContext("2d");
		context.clearRect(0, 0, dest.width, dest.height);
		context.drawImage(mediaEl,
			src.x, src.y, src.width, src.height,
			0, 0, dest.width, dest.height // destination rect
		);
		imageData = context.getImageData(0, 0, dest.width, dest.height);

		var avgColor = Color().rgb(getAverageRGB(imageData));
		// var avgHex = avgColor.hexString(), els = this.el.querySelectorAll("img, video");
		// for (var i = 0; i < els.length; i++) {
		// 	els.item(i).style.backgroundColor = avgHex;
		// }

		targetEl.classList.toggle("over-dark", avgColor.dark());

		// console.log("%s::updateOverlay() avgColor:%s (%s)", this.cid, avgColor.rgbString(), avgColor.dark()?"dark":"light", targetEl);

		// Color, filter opts
		// ------------------------------

		// this.fgColor || (this.fgColor = new Color(this.model.attr("color")));
		// this.bgColor || (this.bgColor = new Color(this.model.attr("background-color")));
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

/* ---------------------------
/* Google Analytics
/* --------------------------- */
if (GA) {
	PlayableRenderer = (function(PlayableRenderer) {

		/** @type {module:underscore.strings/dasherize} */
		var dasherize = require("underscore.string/dasherize");

		// var readyEvents = ["playing", "waiting", "ended"];
		// var userEvents = ["play", "pause"];


		return PlayableRenderer.extend({

			/** @override */
			initialize: function() {
				var retval = PlayableRenderer.prototype.initialize.apply(this, arguments);
				this._playbackRequestedDefault = this.playbackRequested;
				return retval;
			},

			_onPlaybackToggle: function(ev) {
				var retval = PlayableRenderer.prototype._onPlaybackToggle.apply(this, arguments);
				var o = {
					hitType: "event",
					eventCategory: dasherize(this.cidPrefix),
					eventAction: this.playbackRequested ? "play" : "pause",
					eventLabel: this.model.get("text"),
				};
				if (this._playbackRequestedDefault)
					o.eventAction += "-autoplay";
				window.ga("send", o);
				return retval;
			},

			// /** @override */
			// togglePlayback: function(newPlayState) {
			// 	var retval = PlayableRenderer.prototype.togglePlayback.apply(this, arguments);
			// 	window.ga("send", {
			// 		hitType: "event",
			// 		eventCategory: "Playable",
			// 		eventAction: this.playbackRequested ? "play" : "pause",
			// 		eventLabel: this.model.get("text"),
			// 	});
			// 	return retval;
			// },
		});
	})(PlayableRenderer);
}

// if (DEBUG) {
//
// PlayableRenderer = (function(PlayableRenderer) {
// 	if (!PlayableRenderer.LOG_TO_SCREEN) return PlayableRenderer;
//
// 	/** @type {module:underscore.strings/lpad} */
// 	var lpad = require("underscore.string/lpad");
//
// 	return PlayableRenderer.extend({
// 		_canResumePlayback: function() {
// 			var retval = PlayableRenderer.prototype._canResumePlayback.apply(this.arguments);
// 			console.log("[scroll] %s::_canResumePlayback():%s", this.cid, retval,
// 			{
// 				"enabled": this.enabled,
// 				"selected": (!!this.model.selected),
// 				"playbackRequested": this.playbackRequested,
// 				"attached": this.attached,
// 				"parentView": (this.parentView && this.parentView.cid),
// 				"!scrolling": (this.parentView && !this.parentView.scrolling),
// 				"mediaState": this.mediaState,
// 				// "!document.hidden": !document[visibilityHiddenProp],
// 				"visibilityState": document[visibilityStateProp]
// 			});
// 			return retval;
// 		},
// 	});
// })(PlayableRenderer);
//
// }

module.exports = PlayableRenderer;