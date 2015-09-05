/**
* @module app/view/render/VideoRenderer
*
* @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
* @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
* @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
* @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {Function} */
var Color = require("color");

/** @type {module:utils/toggleFullScreen} */
// var toggleFullScreen = require("../../../utils/toggleFullScreen");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */
var PlayableRenderer = require("./PlayableRenderer");

var mediaEvents = [
	"loadstart",
	"progress",
	"suspend",
	"abort",
	"error",
	"emptied",
	"stalled",
	"loadedmetadata",
	"loadeddata",
	"canplay",
	"canplaythrough",
	"playing",
	"waiting",
	"seeking",
	"seeked",
	"ended",
	"durationchange",
	"timeupdate",
	"play",
	"pause",
	"paused",
	"resize",
	"ratechange",
	"volumechange",
	"fullscreenchange",
	"fullscreenerror",
	"webkitendfullscreen",
	"webkitbeginfullscreen"
];
/** @type {Array} */
var stateMediaEvents = [
	"loadstart",
	"progress",
	// "suspend",
	"abort",
	"error",
	// "emptied",
	"stalled",
	// "loadedmetadata",
	// "loadeddata",
	"canplay",
	"canplaythrough",
	"playing",
	"waiting",
	// "seeking",
	// "seeked",
	// "ended",
	// "durationchange",
	"timeupdate",
	"play",
	"pause",
	// "paused",
	// "resize",
	// "ratechange",
	// "volumechange",
	// "fullscreenchange",
	// "fullscreenerror",
	// "webkitendfullscreen",
	// "webkitbeginfullscreen"
];

/**
* @constructor
* @type {module:app/view/render/VideoRenderer}
*/
module.exports = PlayableRenderer.extend({
	
	cidPrefix: "video-renderer-",
	/** @type {string} */
	className: PlayableRenderer.prototype.className + " video-renderer",
	/** @type {Function} */
	template: require("./VideoRenderer.hbs"),
	
	events: {
		"click .full-screen-toggle": function (ev) {
			if (!ev.defaultPrevented && this.model.selected) {
				console.log("click .full-screen-toggle");
				try {
					if (document.hasOwnProperty("fullscreenElement") &&
							document.fullscreenElement !== this.video) {
						this.video.requestFullscreen();
					} else
					if (this.video.webkitSupportsFullscreen && !this.video.webkitDisplayingFullscreen) {
						this.video.webkitEnterFullScreen();
					}
				} catch (err) {
					this.video.removeAttribute("controls");
					console.log(err);
				}
			} 
		}
	},
	
	/** @override */
	initialize: function (opts) {
		PlayableRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this, "_onMediaEvent");
		this.createChildren();
		
		this.addMediaListeners();
		this.initializeAsync();
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.content = this.getContentEl();
		
		this.video = this.content.querySelector("video");
		this.overlay = this.content.querySelector(".overlay");
		
		this.playToggle = this.el.querySelector(".play-toggle");
		this.fullScreenToggle = this.el.querySelector(".full-screen-toggle");
		// this.overlaySymbol = this.overlay.querySelector("svg.symbol");
		
		// this.video.style.backgroundColor = this.model.attrs()["background-color"];
		this.video.loop = this.model.attrs().hasOwnProperty("@video-loop");
	},
	
	/** @return {this} */
	render: function () {
		var els, el, i;
		var cssX, cssY, cssW, cssH;
		var img = this.getDefaultImage();
		var content = this.content;
		var sizing = this.getSizingEl();
		
		this.measure();
		
		// crop video 1px top
		// NOTE: other elements must use video's CROPPED height 
		// this.video.style.marginTop = "-1px";
		// this.video.style.marginBottom = "-1px";
		this.video.setAttribute("width", this.contentWidth);
		// this.video.setAttribute("height", this.contentHeight);
		img.setAttribute("width", this.contentWidth);
		// img.setAttribute("height", this.contentHeight);
		
		this.contentHeight -= 2; 
		
		cssX = this.contentX + "px";
		cssY = this.contentY + "px";
		cssW = this.contentWidth + "px";
		cssH = this.contentHeight + "px";
		
		// content.style.left = this.contentX + "px";
		// content.style.top = this.contentY + "px";
		// content.style.width = cssW;
		// content.style.height = cssH;
		
		els = this.el.querySelectorAll(".content, .content-pos");
		for (i = 0; i < els.length; i++) {
			el = els.item(i);
			el.style.left = cssX;
			el.style.top = cssY;
		}
		
		els = this.el.querySelectorAll(".content, .content-size");
		for (i = 0; i < els.length; i++) {
			el = els.item(i);
			el.style.width = cssW;
			el.style.height = cssH;
		}
		
		// this.overlay.style.left = cX + "px";//(this.contentWidth/2) + "px";
		// this.overlay.style.top = cY + "px";//(this.contentHeight/2) + "px";
		// this.overlay.style.width = this.contentWidth + "px";
		// this.overlay.style.height = this.contentHeight + "px";
		// if (_.isElement(this.overlaySymbol)) {
		// 	var osx = (cW - this.overlaySymbol.width.baseVal.value)/2,
		// 		osy = (cH - this.overlaySymbol.height.baseVal.value)/2;
		// 	
		// 	this.overlaySymbol.style.left = osx + "px";
		// 	this.overlaySymbol.style.top = osy + "px";
		// 	// var symbolStyle = window.getComputedStyle(this.overlaySymbol);
		// 	// console.log( symbolStyle.width, symbolStyle.height,
		// 	// 	this.overlaySymbol.width.baseVal.value, this.overlaySymbol.height.baseVal.value);;
		// }
		this.fullScreenToggle.style.top = cssH;
		
		// sizing.style.maxWidth = cW + "px";
		// sizing.style.maxHeight = cH + "px";
		sizing.style.maxWidth = content.offsetWidth + "px";
		sizing.style.maxHeight = content.offsetHeight + "px";
		// sizing.style.maxWidth = content.clientWidth + "px";
		// sizing.style.maxHeight = content.clientHeight + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		PlayableRenderer.whenSelectionIsContiguous(this)
			.then(PlayableRenderer.whenSelectTransitionEnds)
			.then(
				function(view) {
					// view.video.setAttribute("preload", "auto");
					view.video.preload = "auto";
					return view;
				}
			)
			.then(PlayableRenderer.whenDefaultImageLoads)
			.then(
				function(view) {
					view.addSelectionListeners();
					try {
						view.updateOverlay(view.getDefaultImage(), view.overlay);
					} catch (err) {
						return Promise.reject(err);
					}
				})
			.catch(
				function(err) {
					if (err instanceof PlayableRenderer.ViewError) {
						// console.log(err.view.cid, err.view.model.cid, "VideoRenderer: " + err.message);
					} else {
						console.error("VideoRenderer promise error", err);
					}
				});
	},
	
	/* ---------------------------
	/* PlayableRenderer overrides
	/* --------------------------- */
	
	/** @override */
	setEnabled: function(enabled) {
		// if (enabled) {
		// 	if (this._lastPlayState) {
		// 		this.video.play();
		// 	}
		// 	this._lastPlayState = void 0;
		// } else {
		// 	this._lastPlayState = !this.video.paused;
		// 	if (this._lastPlayState) {
		// 		this.video.pause();
		// 	}
		// }
		!enabled && !this.video.paused && this.video.pause();
		// this.togglePlayback(enabled);
	},
	
	togglePlayback: function(newPlayState) {
		// is playback changing?
		if (_.isBoolean(newPlayState) && newPlayState !== this.video.paused) {
			return; // requested state is current, do nothing
		} else {
			newPlayState = this.video.paused;
		}
		// changing to what?
		if (newPlayState) {
			if (this.video.ended) {
				this.video.currentTime = 0.0;
			}
			this.video.play();
		} else {
			this.video.pause();
		}
	},
	
	/* ---------------------------
	/* MediaEvent handler
	/* --------------------------- */
	
	addMediaListeners: function() {
		for (var i = 0; i < mediaEvents.length; i++) {
			this.video.addEventListener(mediaEvents[i], this._onMediaEvent, false);
		}
	},
	
	removeMediaListeners: function() {
		for (var i = 0; i < mediaEvents.length; i++) {
			this.video.removeEventListener(mediaEvents[i], this._onMediaEvent, false);
		}
	},
	
	_onMediaEvent: function(ev) {
		var isMediaStateEvent = stateMediaEvents.indexOf(ev.type) !== -1;
		
		if (isMediaStateEvent) {
			if (this.video.paused) {
				if (this.video.ended) {
					this.setMediaState("user-replay");
				} else {
					this.setMediaState("user-resume");
				}
			} else if (ev.type === "playing" || ev.type === "timeupdate") {
				this.setMediaState("media");
			} else {
				this.setMediaState("network");
			}
		}
		
		switch (ev.type) {
			case "playing":
				// this.poster.style.display = "none";
				if (this.content.classList.contains("not-played")) {
					this.content.classList.remove("not-played");
				}
				break;
			case "ended":
				if (this.video.webkitDisplayingFullscreen) {
					this.video.webkitExitFullscreen();
				}
				if (document.fullscreenElement === this.video) {
					this.video.exitFullscreen();
				}
				break;
			case "webkitbeginfullscreen":
				this.video.controls = true;
				break;
			case "webkitendfullscreen":
				this.video.controls = false;
				break;
			case "fullscreenchange":
				this.video.controls = document.fullscreenElement === this.video;
				break;
			case "fullscreenerror":
				this.video.controls = false;
				break;
			default:
		}
		// if (ev.type.toLowerCase().indexOf("fullscreen")) {
		// 	console.log(ev.type, document.fullscreenElement);
		// }
		
		this._logMediaEvents(ev, !isMediaStateEvent);
	},
	
	_logMediaEvents: function(ev, logOnly) {
		if (this.debugLog === void 0) {
			this.debugLog = this.el.querySelector(".debug-log");
			if (this.debugLog) {
				this.lastEntry = this.debugLog.lastElementChild;
			} else {
				this._logMediaEvents = function() { return void 0; };
				return;
			}
		}
		
		var entryDate = new Date(Date.now());
		var logStr = [
			entryDate.toISOString().substr(11, 12),
			this.video.currentTime.toFixed(3),
			this.video.readyState,
			(this.video.ended? "ended" : (this.video.paused? "paused" : "playing")),
			this._lastMediaState
		].join("\t");
		
		if (this.lastEntry.getAttribute("data-ev") !== ev.type) {
			this.lastEntry = this.lastEntry.cloneNode(false);
			this.lastEntry.setAttribute("data-ev", ev.type);
			this.lastEntry.style.opacity = logOnly? 0.3 : 1;
			// this.lastEntry.style.color = logOnly? this.debugLogOnlyColor : this.debugLogColor;
			this.lastEntry.textContent = logStr;
			this.debugLog.appendChild(this.lastEntry);
			this.debugLog.style.width = this.contentWidth + "px";
			this.debugLog.style.height = "calc(100% - " + (this.contentHeight) + "px - 3rem)";
			this.debugLog.scrollTop = this.debugLog.scrollHeight;
		} else {
			this.lastEntry.textContent = logStr;
		}
	},
	
	updateOverlayFromVideo: function(targetEl) {
		if (this.video.readyState > 2) {
			// var currentTime = this.video.currentTime;
			this.updateOverlay(this.video, targetEl);
			// this.video.currentTime = currentTime;
		}
	}
});
