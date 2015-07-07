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
var MediaItem = require("../../model/item/MediaItem");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/** @type {module:app/utils/css/parseColor} */
var parseColor = require("../../utils/css/parseColor");
/** @type {module:app/utils/net/loadImage} */
var loadImage = require("../../utils/net/loadImage");
//var loadImage = require("../../utils/net/loadImageDOM");

/** @type {module:app/helper/StyleHelper} */
var Styles = require("../../helper/StyleHelper");

/** @type {Function} */
var viewTemplate = require( "./VideoRenderer.tpl" );

var allMediaEvents = [
	"loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled",
	"loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting",
	"seeking", "seeked", "ended", "durationchange", "timeupdate", "play", "pause",
	"ratechange", "resize", "volumechange"
	];

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
module.exports = View.extend({

	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item media-item video-renderer done",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	/** @type {Function} */
	template: viewTemplate,
	
	// events: {
	// 	// "mouseup .placeholder": "_onContentClick",
	// 	"click .placeholder": "_onContentClick",
	// },
	
	/** @override */
	initialize: function (opts) {
		_.bindAll(this, "_onContentClick", "_onMediaEvent");
		this.createChildren();
		
		// this.$(".content").on("dragstart", function (ev) {
		// 	ev.isDefaultPrevented() || ev.preventDefault();
		// });
		
		// if (this.model.has("prefetched")) {
		// 	// console.log("ImageRenderer.initialize: using prefetched " + this.model.get("prefetched"));
		// 	this.media.src = this.model.get("prefetched");
		// 	this.$el.removeClass("idle").addClass("done");
		// } else {
		// 	// this.initializePromise();
			this.addSiblingListeners();
		// }
		this.addSelectionListeners();
		this.addMediaListeners();
		// this.placeholder.addEventListener("mouseup", this._onContentClick, false);
	},
	
	remove: function() {
		// this.promise.destroy();
		// this.$(".content").off("dragstart");
		// this.placeholder.removeEventListener("mouseup", this._onContentClick, false);
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* --------------------------- *
	 * children/layout
	 * --------------------------- */
	
	/*
	 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
	 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
	 * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
	 * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
	 */
	createChildren: function() {
		// var buffer =  document.createDocumentFragment();
		// buffer.appendChild(document.createElement("div"));
		// buffer.firstElementChild.innerHTML = this.template(this.model.toJSON());
		
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.playToggle = this.el.querySelector(".play-toggle");
		this.content = this.el.querySelector(".content");
		this.video = this.content.querySelector("video");
		this.overlay = this.content.querySelector(".overlay");
		
		console.log(this.model.id,
			this.model.attrs()["color"],
			this.model.attrs()["background-color"]);
			
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
	
	/** @override */
	setEnabled: function(enabled) {
		!enabled && !this.video.paused && this.video.pause();
		// this.toggleMediaPlayback(enabled);
	},
	
	/* ---------------------------
	 * selection handlers
	 * --------------------------- */
	
	addSelectionListeners: function() {
		this.listenTo(this.model, {
			"selected": this._onModelSelected,
			"deselected": this._onModelDeselected,
		});
		this.model.selected && this._onModelSelected();
	},
	
	/* ---------------------------
	 * model event handlers
	 * --------------------------- */
	
	_onModelSelected: function() {
		this.playToggle.addEventListener("click", this._onContentClick, false);
		this.listenTo(this, "view:remove", this._removeClickHandler);
	},
	
	_onModelDeselected: function() {
		this.toggleMediaPlayback(false);
		this.playToggle.removeEventListener("click", this._onContentClick, false);
		this.stopListening(this, "view:remove", this._removeClickHandler);
	},
	
	_removeClickHandler: function() {
		this.placeholder.removeEventListener("mouseup", this._onContentClick, false);
	},
	
	/* ---------------------------
	 * dom event handlers
	 * --------------------------- */
	
	_onContentClick: function(ev) {
		var sev = ev.originalEvent || ev;
		console.log("[VideoRenderer] " + sev.type, sev.defaultPrevented, sev.timeStamp, sev);
		ev.defaultPrevented || this.toggleMediaPlayback();
	},
	
	/* ---------------------------
	 * video handlers
	 * --------------------------- */
	
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
		console.log(this.model.id, ev.type, _.pick(this.video, "readyState", "paused", "ended"));
			//{ readyState: this.video.readyState, paused: this.video.paused, ended: this.video.ended});
		// this.overlay.setAttribute("data-state", ev.type);
		this.overlay.classList.toggle("playing", ev.type == "timeupdate" || ev.type == "playing");
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
				this.toggleMediaPlayback(false);
				break;
			default:
				
		}
		if (this.video.paused) {
			this.overlay.setAttribute("data-state", "user");
		} else if (ev.type == "timeupdate" || ev.type == "playing") {
			this.overlay.setAttribute("data-state", "media");
		} else {
			this.overlay.setAttribute("data-state", "network");
		}
		// switch (ev.type) {
		// 	case "ended":
		// 	case "pause":
		// 		this.overlay.setAttribute("data-state", "user");
		// 		break;
		// 	case "playing":
		// 	case "timeupdate":
		// 		this.overlay.setAttribute("data-state", "media");
		// 		break;
		// 	default:
		// 		this.overlay.setAttribute("data-state", "network");
		// 		
		// }
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
			this.video.ended && (this.video.currentTime = 0.0);
			this.video.play();
		} else {
			this.video.pause();
		}
	},
	
	addSiblingListeners: function () {
		var owner = this.model.collection;
		var m = owner.indexOf(this.model);
		var check = function (n) {
			// Check indices for contiguity
			return (m === n) || (m + 1 === n) || (m - 1 === n);
		};
		var transitionCallback, transitionProp, transitionCancellable;
		var handleRemove, handleSelect;
		
		transitionProp = this.getPrefixedStyle("transform");
		transitionCallback = function(exec) {
			this.off("view:remove", handleRemove);
			exec && this._onSiblingSelect();
		};
		handleRemove = function() {
			transitionCancellable(false);
		};
		handleSelect = function(model) {
			if (check(owner.selectedIndex)) {
				this.stopListening(owner, "select:one select:none", handleSelect);
				this.on("view:remove", handleRemove);
				transitionCancellable = this.onTransitionEnd(this.el, transitionProp, transitionCallback, Globals.TRANSITION_DELAY * 2);
			}
		};
		if (check(owner.selectedIndex)) {
			this._onSiblingSelect();
		} else {
			this.listenTo(owner, "select:one select:none", handleSelect);
		}
	},
	
	_onSiblingSelect: function() {
		// this.createImagePromise().request();
		this.video.removeAttribute("preload");
	},
	
	/* --------------------------- *
	 * media loading
	 * --------------------------- */
	
	/*createImagePromise: function() {
		var onLoad, onError, onProgress, doAlways, promise;
		
		onProgress = function (progress, source, ev) {
			if (progress == "loadstart") {
				this.$el.removeClass("idle").addClass("pending");
			} else {
				this.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
			}
		};
		onProgress = _.throttle(onProgress, 100, {leading: true, trailing: true});
		onError = function (err, source, ev) {
			console.error("VideoRenderer.onError: " + err.message, arguments);
			this.$el.removeClass("pending").addClass("error");
		};
		onLoad = function (url, source, ev) {
			this.model.set({"prefetched": url});
			this.$el.removeClass("pending").addClass("done");
		};
		doAlways = function() {
			this.placeholder.removeAttribute("data-progress");
			this.off("view:remove", promise.destroy);
		};
		
		promise = loadImage(this.model.getImageUrl(), this.media, this);
		promise.then(onLoad, onError, onProgress).always(doAlways);
		this.on("view:remove", promise.destroy);
		
		return promise;
	},*/
});
