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
/** @type {module:app/view/promise/whenImageLoads} */
var whenImageLoads = require("../promise/whenImageLoads");

/** @type {module:app/utils/css/parseColor} */
// var parseColor = require("../../../utils/css/parseColor");
/** @type {module:utils/StyleHelper} */
// var Styles = require("../../../utils/StyleHelper");

/** @type {Function} */
var viewTemplate = require("./VideoRenderer.tpl");

// var StackBlur = require("../../../vendor/StackBlur");
var stackBlurImage = require("../../../utils/canvas/stackBlurImage");

var mediaEvents = [
	"loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled",
	"loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "waiting",
	"seeking", "seeked", "ended", "durationchange", "timeupdate", "play", "pause",
	/*"ratechange",*/ "resize", /*"volumechange"*/
	];

var whenPosterImageLoads = function (view) {
	return new Promise(function(resolve, reject) {
		view.el.classList.remove("idle");
		view.el.classList.add("pending");
		
		var doError = function(err) {
			console.log(view.cid, view.model.cid, "whenPosterImageLoads rejected", err.message);
			view.placeholder.style.color = "inherit";
			view.placeholder.textContent = err.message;
			view.placeholder.removeAttribute("data-progress");
			view.el.classList.remove("pending");
			view.el.classList.add("error");
			reject(err);
		};
		
		whenImageLoads(view.model.getImageUrl(), void 0,
			_.throttle(function (progress) {
				console.log(view.cid, view.model.cid, "whenPosterImageLoads progress", progress);
				view.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
			}, 100, {leading: true, trailing: false})
		).then(
			function(url) {
				console.log(view.cid, view.model.cid, "whenPosterImageLoads resolved", url);
				
				var img = new window.Image();
				var canvas = document.createElement("canvas");
				var onloadFn = null;
				
				var doResolve = function() {
					view.placeholder.removeAttribute("data-progress");
					view.el.classList.remove("pending");
					view.el.classList.add("done");
					resolve(view);
				};
				
				// if (/^blob\:.*/.test(url)) {
				// 	view.model.set({"prefetched": url});
				// 	// view.on("view:remove", function() { window.URL.revokeObjectURL(url); });
				// }
				// view.video.setAttribute("poster", url);
				
				onloadFn = function(ev) {
					img.onload = void 0;
					/^blob\:.*/.test(url) && window.URL.revokeObjectURL(url);
					
					// view.overlay.insertBefore(img, view.overlayLabel);
					// doResolve(view);
					
					var w = parseInt(view.content.style.width);
					var h = parseInt(view.content.style.height);
					var fgColor = new Color(view.model.attrs()["color"] || Globals.DEFAULT_COLORS["color"]);
					var bgColor = new Color(view.model.attrs()["background-color"] || Globals.DEFAULT_COLORS["background-color"]);
					
					console.log(view.model.id, view.model.get("handle"),
							fgColor.hslString(),
							bgColor.hslString()
					);
					
					var isLightOverDark = fgColor.luminosity() > bgColor.luminosity();
					var blurOpts = (isLightOverDark)?
						{ x00: bgColor.lighten(0.1), xFF: fgColor.darken(0.1) }:
						{ x00: fgColor.lighten(0.3), xFF: bgColor.lighten(0.1) };
					blurOpts.channels = "mono";
						
					try {
						stackBlurImage(img, canvas, 15, w, h, blurOpts);
						
						// canvas.toBlob(function(blob) {
						// 	var blurredUrl = window.URL.createObjectURL(blob);
						// 	img.onload = function(ev) {
						// 		window.URL.revokeObjectURL(blurredUrl);
						// 		doResolve(view);
						// 	};
						// 	img.src = blurredUrl;
						// 	view.overlay.insertBefore(img, view.overlayLabel);
						// });
						
						onloadFn = function() {
							img.onload = void 0;
							view.overlay.insertBefore(img, view.overlayLabel);
							doResolve();
						};
						
						img.src = canvas.toDataURL();
						if (img.complete) {
							onloadFn();
						} else {
							img.onload = onloadFn;
						}
						
						// view.overlay.insertBefore(canvas, view.overlayLabel);
						// view.overlay.appendChild(canvas);
						// doResolve(view);
						
						// canvas.toBlob(function(blob) {
						// 	var blurredUrl = window.URL.createObjectURL(blob);
						// 	view.on("view:remove", function() { 
						// 		window.URL.revokeObjectURL(blurredUrl);
						// 	});
						// 	view.video.setAttribute("poster", blurredUrl);
						// 	doResolve(view);
						// });
						
						// view.video.setAttribute("poster", canvas.toDataURL());
						// doResolve(view);
						
					} catch (err) {
						doError(err);
					}
				};
				img.src = url;
				if (img.complete) {
					onloadFn();
				} else {
					img.onload = onloadFn;
				}
			},
			doError
		);
	});
};

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
		_.bindAll(this, "_onMediaEvent");
		this.createChildren();
		
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
		this.overlayLabel = this.overlay.querySelector(".label");
		
		this.video.parentElement.style.overflow = "hidden";
		this.video.setAttribute("preload", "none");
		// this.video.setAttribute("poster", this.model.getImageUrl());
		// this.overlay.firstElementChild.textContent = this.video.readyState > 3? "Play":"Wait";
		
		if (this.model.attrs()["@video-loop"]) {
			this.video.setAttribute("loop", "loop");
		}
		
		if (this.model.has("srcset")) {
			var html = "", srcset = this.model.get("srcset");
			for (var i = 0, ii = srcset.length; i < ii; i++) {
				html += "<source src=\"" + Globals.MEDIA_DIR + "/" + srcset[i]["src"] + "\" type=\"" + srcset[i]["mime"] + "\"></source>";
			}
			this.video.innerHTML = html;
		}
		
		// don't wait for any async op
		this.el.classList.remove("idle");
		this.el.classList.add("done");
		
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
		this.video.setAttribute("width", cW);
		this.video.setAttribute("height", cH);
		cH--; // NOTE: other elements must use video's CROPPED height 
		
		content.style.left = cX + "px";
		content.style.top = cY + "px";
		content.style.width = cW + "px";
		content.style.height = cH + "px";
		
		// sizing.style.maxWidth = (cW + (poW - pcW)) + "px";
		// sizing.style.maxHeight = (cH + (poH - pcH)) + "px";
		sizing.style.maxWidth = cW + "px";
		sizing.style.maxHeight = cH + "px";
		// sizing.style.maxWidth = content.offsetWidth + "px";
		// sizing.style.maxHeight = content.offsetHeight + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		MediaRenderer.whenSelectionIsContiguous(this)
			.then(MediaRenderer.whenSelectTransitionEnds)
			.then(whenPosterImageLoads)
			.then(function(view) {
					this.addSelectionListeners();
					this.video.removeAttribute("preload");
				}.bind(this))
			.catch(function(err) {
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
			this.video.ended && (this.video.currentTime = 0.0);
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
				this.overlayLabel.textContent = "Play";
				break;
			case "pause":
				this.overlayLabel.textContent = "Resume";
				break;
			case "ended":
				// NOTE: "ended" event is not triggered when the "loop" property is set
				this.overlayLabel.textContent = "Replay";
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
