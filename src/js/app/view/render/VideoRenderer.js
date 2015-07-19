/**
 * @module app/view/render/VideoRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/MediaItem} */
// var MediaItem = require("../../model/item/MediaItem");
/** @type {module:app/view/base/View} */
// var View = require("../base/View");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");
/** @type {module:app/view/render/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");

/** @type {module:app/view/promise/whenSelectionIsContiguous} */
var whenSelectionIsContiguous = require("../promise/whenSelectionIsContiguous");
/** @type {module:app/view/promise/whenTransitionEnds} */
var whenTransitionEnds = require("../promise/whenTransitionEnds");

/** @type {module:app/utils/net/loadImage} */
var loadImage = require("../../../utils/net/loadImage");
//var loadImage = require("../../../utils/net/loadImageDOM");

/** @type {module:app/utils/css/parseColor} */
// var parseColor = require("../../../utils/css/parseColor");
/** @type {module:utils/StyleHelper} */
// var Styles = require("../../../utils/StyleHelper");

/** @type {Function} */
var viewTemplate = require( "./VideoRenderer.tpl" );

// var allMediaEvents = [
// 	"loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled",
// 	"loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting",
// 	"seeking", "seeked", "ended", "durationchange", "timeupdate", "play", "pause",
// 	"ratechange", "resize", "volumechange"
// 	];

var mediaEvents = [
	"loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled",
	"loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting",
	"seeking", "seeked", "ended", "durationchange", "play", "pause",
	"ratechange", "resize",
	// "volumechange",
	"timeupdate", 
	];

/**
 * @constructor
 * @type {module:app/view/render/VideoRenderer}
 */
module.exports = MediaRenderer.extend({
	
	/** @type {string} */
	className: function() { 
		return MediaRenderer.prototype.className + " sequence-renderer";
	},
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		_.bindAll(this, "_onMediaEvent");
		this.createChildren();
		
		this.addSelectionListeners();
		this.addMediaListeners();
		this.initializeAsync();
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/*
	/* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
	/* https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
	/* https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
	/* https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
	/*/
	createChildren: function() {
		// var buffer =  document.createDocumentFragment();
		// buffer.appendChild(document.createElement("div"));
		// buffer.firstElementChild.innerHTML = this.template(this.model.toJSON());
		
		this.el.setAttribute("data-state", "user");
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.playToggle = this.el.querySelector(".play-toggle");
		this.content = this.el.querySelector(".content");
		this.video = this.content.querySelector("video");
		this.overlay = this.content.querySelector(".overlay");
		
		// we don't wait for video
		this.el.classList.remove("idle");
		this.el.classList.add("done");
		
		this.video.setAttribute("preload", "none");
		this.video.setAttribute("poster", this.model.getImageUrl());
		// this.overlay.firstElementChild.textContent = this.video.readyState > 3? "Play":"Wait";
		
		if (this.model.attrs()["@video-loop"]) {
			this.video.setAttribute("loop", "loop");
		}
		
		if (this.model.has("srcset")) {
			var html = "", srcset = this.model.get("srcset");
			for (var i = 0; i < srcset.length; i++) {
				html += "<source src=\"" + Globals.MEDIA_DIR + "/" + srcset[i]["src"] + "\" type=\"" + srcset[i]["mime"] + "\"></source>";
			}
			this.video.innerHTML = html;
		}
		
		// console.log(this.model.id,
		// 	this.model.attrs()["color"],
		// 	this.model.attrs()["background-color"]);
			
		// var pColor = parseColor(this.model.attrs()["color"]);
		// var pColor = parseColor(this.model.attrs()["background-color"]);
		// if (pColor) {
		// 	var c1, c2, cssGrad;
		// 	pColor.a = 0.0;
		// 	c1 = pColor.toColorString();
		// 	pColor.a = 0.75;
		// 	c2 = pColor.toColorString();
		// 	this.overlay.style.backgroundColor = "transparent";
		// 	this.overlay.style.background = "linear-gradient(to bottom, " + c1 + " 0%, " + c2 + " 100%)";
		// }
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
		this.video.parentElement.style.overflow = "hidden";
		this.video.setAttribute("width", cW);
		this.video.setAttribute("height", cH);
		cH--; // NOTE: other elements must use video's CROPPED height 
		
		content.style.left = cX + "px";
		content.style.top = cY + "px";
		content.style.width = cW + "px";
		content.style.height = cH + "px";
		
		// sizing.style.maxWidth = (cW + (poW - pcW)) + "px";
		// sizing.style.maxHeight = (cH + (poH - pcH)) + "px";
		// sizing.style.maxWidth = cW + "px";
		// sizing.style.maxHeight = cH + "px";
		sizing.style.maxWidth = content.offsetWidth + "px";
		sizing.style.maxHeight = content.offsetHeight + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		whenSelectionIsContiguous(this).then(
			function(view) {
				if (view.model.selected) {
					return view;
				} else {
					return whenTransitionEnds(view, view.el, "transform");
				}
			}
		).then(
			function(view) {
				this.video.removeAttribute("preload");
			}.bind(this)
		).catch(
			function(err) {
				if (err instanceof ViewError) {
					console.log(err.view.model.cid, "VideoRenderer: " + err.message);
				} else {
					console.error("VideoRenderer promise error", err);
				}
			}
		);
	},
	
	/* ---------------------------
	/* MediaRenderer overrides
	/* --------------------------- */
	
	/** @override */
	setEnabled: function(enabled) {
		!enabled && !this.video.paused && this.video.pause();
		// this.toggleMediaPlayback(enabled);
	},
	
	/* ---------------------------
	/* selection handlers
	/* --------------------------- */
	
	// addSelectionListeners: function() {
	// 	this.listenTo(this.model, {
	// 		"selected": this._onModelSelected,
	// 		"deselected": this._onModelDeselected,
	// 	});
	// 	this.model.selected && this._onModelSelected();
	// },
	// 
	// /* ---------------------------
	// /* model event handlers
	// /* --------------------------- */
	// 
	// _onModelSelected: function() {
	// 	this.playToggle.addEventListener("click", this._onContentClick, false);
	// 	this.listenTo(this, "view:remove", this._removeClickHandler);
	// },
	// 
	// _onModelDeselected: function() {
	// 	this.toggleMediaPlayback(false);
	// 	this.playToggle.removeEventListener("click", this._onContentClick, false);
	// 	this.stopListening(this, "view:remove", this._removeClickHandler);
	// },
	// 
	// _removeClickHandler: function() {
	// 	this.placeholder.removeEventListener("mouseup", this._onContentClick, false);
	// },
	// 
	// /* ---------------------------
	// /* dom event handlers
	// /* --------------------------- */
	// 
	// _onContentClick: function(ev) {
	// 	var sev = ev.originalEvent || ev;
	// 	console.log("[VideoRenderer] " + sev.type, sev.defaultPrevented, sev.timeStamp, sev);
	// 	ev.defaultPrevented || this.toggleMediaPlayback();
	// },
	
	/* ---------------------------
	/* video handlers
	/* --------------------------- */
	
	toggleMediaPlayback: function(newPlayState) {
		// is playback changing?
		if (_.isBoolean(newPlayState) && newPlayState !== this.video.paused) {
			return; // requested state is current, do nothing
		} else {
			newPlayState = this.video.paused;
		}
		// changing to what?
		if (newPlayState) {
			this.video.ended && (this.video.currentTime = 0.0);
			this.video.play();
		} else {
			this.video.pause();
		}
	},
	
	addMediaListeners: function() {
		for (var i = 0; i < mediaEvents.length; i++) {
			this.video.addEventListener(mediaEvents[i], this._onMediaEvent);
		}
	},
	
	removeMediaListeners: function() {
		for (var i = 0; i < mediaEvents.length; i++) {
			this.video.removeEventListener(mediaEvents[i], this._onMediaEvent);
		}
	},
	
	_onMediaEvent: function(ev) {
		// console.log(this.model.id, ev.type, _.pick(this.video, "readyState", "paused", "ended"));
		//{ readyState: this.video.readyState, paused: this.video.paused, ended: this.video.ended});
		// this.overlay.classList.toggle("playing", ev.type == "timeupdate" || ev.type == "playing");
		
		switch (ev.type) {
			case "timeupdate":
				break;
			case "canplay":
			case "canplaythrough":
				this.overlay.firstElementChild.textContent = "Play";
				break;
			case "pause":
				this.overlay.firstElementChild.textContent = "Resume";
				break;
			case "ended":
				// NOTE: "ended" event is not triggered when the "loop" property is set
				this.overlay.firstElementChild.textContent = "Replay";
				// this.toggleMediaPlayback(false);
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
		this.el.setAttribute("data-state", stateAttrVal);
	},
});
