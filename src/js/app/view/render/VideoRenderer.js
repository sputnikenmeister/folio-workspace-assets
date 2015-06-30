/**
 * @module app/view/render/VideoRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../../model/item/ImageItem");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/** @type {module:app/utils/event/addTransitionEndCommand} */
//var addTransitionCallback = require("../../utils/event/addTransitionCallback");
/** @type {module:app/utils/css/parseColor} */
var parseColor = require("../../utils/css/parseColor");
/** @type {module:app/utils/net/loadImage} */
var loadImage = require("../../utils/net/loadImage");
//var loadImage = require("../../utils/net/loadImageDOM");

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
	"seeking", "seeked", "ended", "durationchange", "timeupdate", "play", "pause",
	"ratechange", "resize", "volumechange"
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
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @type {Function} */
	template: viewTemplate,
	
	// events: {
	// 	// "mouseup .placeholder": "_onMouseUp",
	// 	"click .placeholder": "_onMouseUp",
	// },
	
	/** @override */
	initialize: function (opts) {
		_.bindAll(this, "_onMouseUp", "_onMediaEvent");
		this.createChildren();
		
		// this.$(".content").on("dragstart", function (ev) {
		// 	ev.isDefaultPrevented() || ev.preventDefault();
		// });
		
		// if (this.model.has("prefetched")) {
		// 	// console.log("ImageRenderer.initialize: using prefetched " + this.model.get("prefetched"));
		// 	this.image.src = this.model.get("prefetched");
		// 	this.$el.removeClass("idle").addClass("done");
		// } else {
		// 	// this.initializePromise();
			this.addSiblingListeners();
		// }
		this.addSelectionListeners();
		this.addMediaListeners();
		// this.placeholder.addEventListener("mouseup", this._onMouseUp, false);
	},
	
	remove: function() {
		// this.promise.destroy();
		// this.$(".content").off("dragstart");
		// this.placeholder.removeEventListener("mouseup", this._onMouseUp, false);
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
		
		this.sizing = this.el.querySelector(".sizing");
		this.placeholder = this.el.querySelector(".placeholder");
		this.playToggle = this.el.querySelector(".play-toggle");
		this.content = this.el.querySelector(".content");
		this.video = this.content.querySelector("video");
		this.overlay = this.content.querySelector(".overlay");
		
		// var pStyle = window.getComputedStyle(this.placeholder, null);
		// var pColor = pStyle.getPropertyValue("color");
		// if (pColor != "") {
		// 	pColor = parseColor(pColor);
		// 	pColor.a = 0.75;
		// 	this.overlay.style.backgroundColor = pColor.toColorString();
		// }
		// console.log(this.model.id,
		// 	pStyle.getPropertyValue("background-color"),
		// 	pStyle.getPropertyValue("color"), pColor);
		
		this.video.setAttribute("preload", "none");
		this.video.setAttribute("poster", this.model.getImageUrl());
		// this.overlay.firstElementChild.textContent = this.video.readyState > 3? "Play":"Wait";
		
		var attrs = this.model.get("attrs");
		if (attrs.hasOwnProperty("@video-loop")) {
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
		var sizing = this.sizing;
		
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
		
		this.video.setAttribute("width", cW);
		this.video.setAttribute("height", cH);
		
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
	
	setEnabled: function(enabled) {
		!enabled && !this.video.paused && this.video.pause();
		// this.video.
		// this.toggleVideoPlayback(enabled);
	},
	
	/* ---------------------------
	 * model event handlers
	 * --------------------------- */
	
	_onCollectionSelect: function(model) {
		if (model === this.model) {
			this.playToggle.addEventListener("click", this._onMouseUp, false);
			this.listenTo(this, "view:remove", this._removeMouseUpHandler);
		}
	},
	
	_onCollectionDeselect: function(model) {
		if (model === this.model) {
			this.playToggle.removeEventListener("click", this._onMouseUp, false);
			this.stopListening(this, "view:remove", this._removeMouseUpHandler);
			this.toggleVideoPlayback(false);
		}
	},
	
	/* ---------------------------
	 * dom event handlers
	 * --------------------------- */
	
	_onMouseUp: function(ev) {
		var sev = ev.originalEvent || ev;
		console.log("[VideoRenderer] " + sev.type, sev.defaultPrevented, sev.timeStamp, sev);
		// ev.defaultPrevented || ev.preventDefault();
		ev.defaultPrevented || this.toggleVideoPlayback();
	},
	
	_removeMouseUpHandler: function() {
		this.placeholder.removeEventListener("mouseup", this._onMouseUp, false);
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
		console.log(this.model.id, ev.type);
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
				if (!this.video.loop) {
					this.overlay.firstElementChild.textContent = "Replay";
					this.toggleVideoPlayback(false);
				}
				break;
			default:
				
		}
	},

	toggleVideoPlayback: function(newPlayState) {
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
	
	/* ---------------------------
	 * selection handlers
	 * --------------------------- */
	
	addSelectionListeners: function() {
		var owner = this.model.collection;
		this.listenTo(owner, {
			"select:one": this._onCollectionSelect,
			"deselect:one": this._onCollectionDeselect,
		});
		this._onCollectionSelect(owner.selected);
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
				// transitionCancellable = addTransitionCallback(transitionProp, transitionCallback, this.el, this, Globals.TRANSITION_DELAY * 2);
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
	 * image loading
	 * --------------------------- */
	
	createImagePromise: function() {
		var onLoad, onError, onProgress, doAlways, promise;
		
		onProgress = function (progress, source, ev) {
			if (progress == "loadstart") {
				//console.debug("VideoRenderer.onProgress_loadstart: " + this.model.get("src"));
				this.$el.removeClass("idle").addClass("pending");
				//this.model.trigger("load:start");
			} else {
				// this.$placeholder.attr("data-progress", (progress * 100).toFixed(0));
				this.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
				//this.model.trigger("load:progress", progress);
			}
		};
		onProgress = _.throttle(onProgress, 100, {leading: true, trailing: true});
		onError = function (err, source, ev) {
			console.error("VideoRenderer.onError: " + err.message, arguments);
			this.$el.removeClass("pending").addClass("error");
			//this.model.trigger("load:error");
		};
		onLoad = function (url, source, ev) {
			//console.debug("VideoRenderer.onLoad: " + this.model.get("src"));
			this.model.set({"prefetched": url});
			this.$el.removeClass("pending").addClass("done");
			//this.model.trigger("load:done");
		};
		doAlways = function() {
			// this.$placeholder.removeAttr("data-progress");
			this.placeholder.removeAttribute("data-progress");
			this.off("view:remove", promise.destroy);
		};
		
		promise = loadImage(this.model.getImageUrl(), this.image, this);
		promise.then(onLoad, onError, onProgress).always(doAlways);
		this.on("view:remove", promise.destroy);
		
		return promise;
	},
});
