/**
* @module app/view/render/VideoRenderer
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");
/** @type {module:app/view/render/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");

/** @type {Function} */
var viewTemplate = require("./VideoRenderer.hbs");

// var stackBlurRGB = require("../../../utils/canvas//bitmap/stackBlurRGB");
// var stackBlurMono = require("../../../utils/canvas//bitmap/stackBlurMono");
// var duotone = require("../../../utils/canvas//bitmap/duotone");

/*
https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
*/

var mediaEvents = [
	"loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled",
	"loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting",
	"seeking", "seeked", "ended", "durationchange", "timeupdate", "play", "pause", "paused",
	/*"ratechange",*/ "resize", /*"volumechange"*/
	];

/**
* @constructor
* @type {module:app/view/render/VideoRenderer}
*/
module.exports = MediaRenderer.extend({
	
	/** @type {string} */
	className: function() { 
		return MediaRenderer.prototype.className + " video-renderer";
	},
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		// MediaRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this, "_onMediaEvent");
		this.createChildren();
		
		this.addMediaListeners();
		this.initializeAsync();
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	createChildren: function() {
		// var buffer =  document.createDocumentFragment();
		// buffer.appendChild(document.createElement("div"));
		// buffer.firstElementChild.innerHTML = this.template(this.model.toJSON());
		
		// this.el.setAttribute("data-state", "initial");
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.playToggle = this.el.querySelector(".play-toggle");
		this.content = this.el.querySelector(".content");
		this.video = this.content.querySelector("video");
		this.poster = this.content.querySelector("img.poster");
		this.overlay = this.content.querySelector(".overlay");
		this.overlayLabel = this.overlay.querySelector(".play-button");
		
		// this.overlay.firstElementChild.textContent = this.video.readyState > 3? "Play":"Wait";
		// this.video.parentElement.style.overflow = "hidden";
		// this.video.setAttribute("preload", "none");
		
		// this.video.setAttribute("poster", this.model.getImageUrl());
		this.video.poster = this.model.getImageUrl();
		
		if (this.model.attrs()["@video-loop"]) {
			// this.video.setAttribute("loop", "loop");
			this.video.loop = true;
		}
		
		if (this.model.has("srcset")) {
			var html = "", srcset = this.model.get("srcset");
			for (var i = 0, ii = srcset.length; i < ii; i++) {
				html += "<source src=\"" + Globals.MEDIA_DIR + "/" + srcset[i]["src"] + "\" type=\"" + srcset[i]["mime"] + "\"></source>";
			}
			this.video.innerHTML = html;
		}
	},
	
	/** @return {this} */
	render: function () {
		var sW, sH; // source dimensions
		var pcW, pcH; // measured values
		var cX, cY, cW, cH; // computed values
		var pA, sA;
		
		var content = this.content;
		var sizing = this.placeholder;
		
		sizing.style.maxWidth = "";
		sizing.style.maxHeight = "";
		
		cX = sizing.offsetLeft + sizing.clientLeft;
		cY = sizing.offsetTop + sizing.clientTop;
		pcW = sizing.clientWidth;
		pcH = sizing.clientHeight;
		
		sW = this.model.get("w");
		sH = this.model.get("h");
		
		// Unless both client dimensions are larger than the source's
		// choose constraint direction by aspect ratio
		if (sW < pcW && sH < pcH) {
			cW = sW;
			cH = sH;
		} else if ((pcW/pcH) < (sW/sH)) {
			cW = pcW;
			cH = Math.round((cW / sW) * sH);
		} else {
			cH = pcH;
			cW = Math.round((cH / sH) * sW);
		}
		
		// crop video 1px top
		this.video.style.marginTop = "-1px";
		this.video.setAttribute("width", cW);
		this.video.setAttribute("height", cH);
		cH--; // NOTE: other elements must use video's CROPPED height 
		
		this.contentWidth = cW;
		this.contentHeight = cH;
		
		content.style.left = cX + "px";
		content.style.top = cY + "px";
		content.style.width = cW + "px";
		content.style.height = cH + "px";
		
		sizing.style.maxWidth = cW + "px";
		sizing.style.maxHeight = cH + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		MediaRenderer.whenSelectionIsContiguous(this)
			.then(MediaRenderer.whenSelectTransitionEnds)
			.then(
				function(view) {
					// view.video.setAttribute("preload", "auto");
					view.video.preload = "auto";
					return view;
				}
			)
			.then(MediaRenderer.whenDefaultImageLoads)
			.then(
				function(view) {
					view.addSelectionListeners();
					// view.video.setAttribute("poster", view.defaultImage.src);
					try {
						view.updateOverlayBackground(view.overlayLabel, view.defaultImage);
					} catch (err) {
						return Promise.reject(err);
					}
				})
			.catch(
				function(err) {
					if (err instanceof ViewError) {
						console.log(err.view.cid, err.view.model.cid, "VideoRenderer: " + err.message);
					} else {
						console.error("VideoRenderer promise error", err);
					}
				});
	},
	
	/* ---------------------------
	/* MediaRenderer overrides
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
		// this.toggleMediaPlayback(enabled);
	},
	
	toggleMediaPlayback: function(newPlayState) {
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
		// console.log(this.cid, this.model.cid, ev.type, this.video.readyState, this.video.currentTime);//, ev);//_.pick(this.video, "readyState", "paused", "ended"), ev.type);
		
		switch (ev.type) {
			case "playing":
				this.content.classList.remove("not-played");
				// this.poster.style.visibility = "hidden";
				// this.video.style.visibility = "visible";
				this.video.removeEventListener("playing", this._onMediaEvent, false);
				break;
			case "canplay":
				// this.overlayLabel.textContent = "\uE805";
				// this.updateOverlayFromVideo(this.overlayLabel);
				break;
			case "pause":
				// this.overlayLabel.textContent = "\uE805";
				// this.updateOverlayFromVideo(this.overlayLabel);
				break;
			case "ended":
				// NOTE: "ended" event is not triggered when the "loop" property is set
				// this.overlayLabel.textContent = "\uE80F";
				// this.updateOverlayFromVideo(this.overlayLabel);
				break;
			default:
		}
		var stateAttrVal = "network";
		if (this.video.paused) {
			stateAttrVal = "user";
		} else if (ev.type == "timeupdate" || ev.type == "playing") {
			stateAttrVal = "media";
		} else {
		}
		this.setMediaState(stateAttrVal);
		// this.el.setAttribute("data-state", stateAttrVal);
	},
	
	updateOverlayFromVideo: function(target) {
		if (this.video.readyState > 2) {
			// var currentTime = this.video.currentTime;
			this.updateOverlayBackground(target, this.video);
			// this.video.currentTime = currentTime;
		}
	}
});
