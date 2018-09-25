/*global HTMLMediaElement, MediaError*/
/**
 * @module app/view/render/VideoRenderer
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
 */

/* --------------------------- *
/* Imports
/* --------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */
var PlayableRenderer = require("app/view/render/PlayableRenderer");
/** @type {module:app/view/component/CanvasProgressMeter} */
var ProgressMeter = require("app/view/component/CanvasProgressMeter");
// /** @type {module:app/view/component/PlayToggleSymbol} */
var PlayToggleSymbol = require("app/view/component/PlayToggleSymbol");

// var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");

// /** @type {module:utils/prefixedStyleName} */
// var prefixedStyleName = require("utils/prefixedStyleName");
/** @type {module:utils/prefixedEvent} */
var prefixedEvent = require("utils/prefixedEvent");

// var whenViewIsAttached = require("app/view/promise/whenViewIsAttached");
// /** @type {Function} */
// var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");

/* --------------------------- *
/* private static
/* --------------------------- */

var fullscreenChangeEvent = prefixedEvent("fullscreenchange", document);
// var fullscreenErrorEvent = prefixedEvent("fullscreenerror", document);

var formatTimecode = function(value) {
	if (isNaN(value)) return ""; //value = 0;
	if (value >= 3600) return ((value / 3600) | 0) + "H";
	if (value >= 60) return ((value / 60) | 0) + "M";
	// if (value >= 10) return "0" + (value | 0) + "S";
	return (value | 0) + "S";
};

var VIDEO_CROP_PX = Globals.VIDEO_CROP_PX;
var SYNC_TIMEOUT_MS = 1200;
var SYNC_THRESHOLD_MS = 100;

/**
 * @constructor
 * @type {module:app/view/render/VideoRenderer}
 */
var VideoRenderer = PlayableRenderer.extend({

	/** @type {string} */
	cidPrefix: "videoRenderer",
	/** @type {string} */
	className: PlayableRenderer.prototype.className + " video-item",
	/** @type {Function} */
	template: require("./VideoRenderer.hbs"),

	// events: (function() {
	// 	var ret = {};
	// 	ret[PlayableRenderer.CLICK_EVENT + " .fullscreen-toggle"] = "_onFullscreenToggle";
	// 	return ret;
	// }()),

	// events: function() {
	// 	var events = {};
	// 	events[PlayableRenderer.CLICK_EVENT + " .fullscreen-toggle"] = "_onFullscreenToggle";
	// 	return _.extend(events, _.result(this, PlayableRenderer.prototype.events));
	// },
	// events: {
	// 	"click .fullscreen-toggle": "_onFullscreenToggle",
	// },

	properties: {
		fullscreenToggle: {
			/** @return {HTMLElement} */
			get: function() {
				return this._fullscreenToggle || (this._fullscreenToggle = this.el.querySelector(".fullscreen-toggle"));
			}
		},
	},

	/** @override */
	initialize: function(opts) {
		PlayableRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this,
			"_updatePlaybackState",
			"_updateCurrTimeValue",
			"_updateBufferedValue",
			"_onMediaError",
			"_onMediaEnded",
			// "_onMediaPlayingOnce",
			"_onFullscreenChange",
			"_onFullscreenToggle"
		);
		_.bindAll(this,
			"_playbackTimeoutFn_playing",
			"_playbackTimeoutFn_waiting"
		);
		// var onPeerSelect = function() {
		// 	this.content.style.display = (this.getSelectionDistance() > 1)? "none": "";
		// };
		// this.listenTo(this.model.collection, "select:one select:none", onPeerSelect);
		// onPeerSelect();
	},

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	/** @override */
	createChildren: function() {
		PlayableRenderer.prototype.createChildren.apply(this, arguments);

		this.placeholder = this.el.querySelector(".placeholder");
		// this.overlay = this.content.querySelector(".overlay");
		this.video = this.content.querySelector("video");
		// this.video.loop = this.model.attrs().hasOwnProperty("@video-loop");

		// this.video.setAttribute("muted", "muted");
		// this.video.setAttribute("playsinline", "playsinline");
		// if (this.model.attr("@video-loop") !== void 0) {
		// 	this.video.setAttribute("loop", "loop");
		// }
		this.video.setAttribute("preload", "none");
		if (this.video.controlList) this.video.controlList.add("nodownload");

		// this.video.muted = true;
		// this.video.playsinline = true;
		// this.video.preload = "auto";
		this.video.loop = this.model.attr("@video-loop") !== void 0;
		this.video.src = this.findPlayableSource(this.video);
	},

	measure: function() {
		PlayableRenderer.prototype.measure.apply(this, arguments);

		// NOTE: Vertical 1px video crop
		// - Cropped in CSS: video, .poster { margin-top: -1px; margin-bottom: -1px;}
		// - Cropped height is adjusted in metrics obj
		// - Crop amount added back to actual video on render()
		this.metrics.media.height += VIDEO_CROP_PX * 2;
		this.metrics.content.height += VIDEO_CROP_PX * 2;
	},

	/** @override */
	render: function() {
		PlayableRenderer.prototype.render.apply(this, arguments);

		var els, el, i, cssW, cssH;
		var img = this.defaultImage;
		var content = this.content;

		// media-size
		// ---------------------------------
		cssW = this.metrics.media.width + "px";
		cssH = this.metrics.media.height + "px";

		els = this.el.querySelectorAll(".media-size");
		for (i = 0; i < els.length; i++) {
			el = els.item(i);
			el.style.width = cssW;
			el.style.height = cssH;
		}

		content.style.width = cssW;
		content.style.height = (this.metrics.media.height + VIDEO_CROP_PX) + "px";

		// content-position
		// ---------------------------------
		var cssX, cssY;
		cssX = this.metrics.content.x + "px";
		cssY = this.metrics.content.y + "px";
		content.style.left = cssX;
		content.style.top = cssY;

		el = this.el.querySelector(".controls");
		// el.style.left = cssX;
		// controls.style.top = cssY;
		el.style.width = this.metrics.content.width + "px";
		el.style.height = this.metrics.content.height + "px";

		// // content-size
		// // ---------------------------------
		// cssW = this.metrics.content.width + "px";
		// cssH = this.metrics.content.height + "px";
		//
		// els = this.el.querySelectorAll(".content-size");
		// for (i = 0; i < els.length; i++) {
		// 	el = els.item(i);
		// 	el.style.width = cssW;
		// 	el.style.height = cssH;
		// }

		// NOTE: elements below must use video's UNCROPPED height, so +2px
		this.video.setAttribute("width", this.metrics.media.width);
		this.video.setAttribute("height", this.metrics.media.height - VIDEO_CROP_PX * 2);
		img.setAttribute("width", this.metrics.media.width);
		img.setAttribute("height", this.metrics.media.height - VIDEO_CROP_PX * 2);

		return this;
	},

	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */

	initializeAsync: function() {
		return Promise.resolve(this)
			.then(PlayableRenderer.whenSelectionIsContiguous)
			.then(PlayableRenderer.whenScrollingEnds)
			.then(PlayableRenderer.whenViewIsAttached)
			.then(
				function(view) {
					// console.log("%s::initializeAsync [attached, scrollend, selected > %o, preload:%s] ('%o')", view.cid, view.model.getDistanceToSelected(), view.video.preload, view.model.get("name"));
					return Promise.all([
						PlayableRenderer.whenDefaultImageLoads(view),
						view.whenVideoHasMetadata(view),
					]).then(function() {
						return view;
					});
				})
			.then(
				function(view) {
					// console.log("%s::initializeAsync [defaultImage, preload:%s] ('%o')", view.cid, view.video.preload, view.model.get("name"));
					view.initializePlayable();
					view.updateOverlay(view.defaultImage, view.playToggle); //view.overlay);
					view.listenToSelection();
					return view;
				});

		// videoEl.setAttribute("preload", "metadata");
	},

	initializePlayable: function() {
		// When selected for the first time
		// ---------------------------------
		PlayableRenderer.whenSelectionDistanceIs(this, 0)
			.then(function(view) {
				view.video.setAttribute("preload", "auto");
				view.video.preload = "auto";
				// console.log("%s::initializeAsync [selected, preload:%s] ('%o')", view.cid, view.video.preload, view.model.get("name"));
				return view;
			})
			.catch(function(reason) {
				if (reason instanceof PlayableRenderer.ViewError) {
					console.log("%s::%s", reason.view.cid, reason.message);
				} else {
					console.warn(reason);
					// return Promise.reject(reason);
				}
			});
		// play-toggle-symbol
		// ---------------------------------
		this._playToggleSymbol = new PlayToggleSymbol(_.extend({
			el: this.el.querySelector(".play-toggle")
		}, this._playToggleSymbol || {}));

		// this._playToggleSymbol.setImageSource(this.defaultImage, 0, 0);
		// this.listenToElementOnce(this.video, "timeupdate", function(ev) {
		// 	this._playToggleSymbol.setImageSource(this.video);
		// });

		// progress-meter
		// ---------------------------------
		this.progressMeter = new ProgressMeter({
			el: this.el.querySelector(".progress-meter"),
			color: this.model.attr("color"),
			// backgroundColor: this.model.attr("background-color"),
			maxValues: {
				amount: this.video.duration,
				available: this.video.duration,
			},
			labelFn: (function(value, total) {
				if (!this._started || this.video.ended || isNaN(value)) {
					return formatTimecode(total);
				} else if (!this.playbackRequested) {
					return Globals.PAUSE_CHAR;
				} else {
					return formatTimecode(total - value);
				}
			}).bind(this)
		});
		// this.el.querySelector(".controls").appendChild(this.progressMeter.el);
		// var el = this.el.querySelector(".progress-meter");
		// el.parentNode.replaceChild(this.progressMeter.el, el);
		// var parentEl = this.el.querySelector(".controls");
		// parentEl.insertBefore(this.progressMeter.el, parentEl.firstChild);

		// this._setPlayToggleSymbol("play-symbol");
		this._renderPlaybackState();

		// listen to video events
		// ---------------------------------
		// this.video.poster = this.model.get("source").get("original");
		this.addMediaListeners();
	},

	/* ---------------------------
	/* whenVideoHasMetadata promise
	/* --------------------------- */

	whenVideoHasMetadata: function(view) {
		// NOTE: not pretty !!!
		return new Promise(function(resolve, reject) {
			var videoEl = view.video;
			var eventHandlers = {
				loadedmetadata: function(ev) {
					if (ev) removeEventListeners();
					// console.log("%s::whenVideoHasMetadata [%s] %s", view.cid, "resolved", ev ? ev.type : "sync");
					resolve(view);
				},
				abort: function(ev) {
					if (ev) removeEventListeners();
					reject(new PlayableRenderer.ViewError(view, new Error("whenVideoHasMetadata: view was removed")));
				},
				error: function(ev) {
					if (ev) removeEventListeners();
					var err;
					if (videoEl.error) {
						err = new Error(_.invert(MediaError)[videoEl.error.code]);
						err.infoCode = videoEl.error.code;
					} else {
						err = new Error("Unspecified error");
					}
					err.infoSrc = videoEl.src;
					err.logMessage = "whenVideoHasMetadata: " + err.name + " " + err.infoSrc;
					err.logEvent = ev;
					reject(err);
				},
			};

			//  (videoEl.preload == "auto" && videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
			// 	(videoEl.preload == "metadata" && videoEl.readyState >= HTMLMediaElement.HAVE_METADATA)

			if (videoEl.error) {
				eventHandlers.error();
			} else if (videoEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
				eventHandlers.loadedmetadata();
			} else {
				var sources = videoEl.querySelectorAll("source");
				var errTarget = sources.length > 0 ? sources.item(sources.length - 1) : videoEl;
				var errCapture = errTarget === videoEl; // use capture with HTMLMediaElement

				var removeEventListeners = function() {
					errTarget.removeEventListener("error", eventHandlers.error, errCapture);
					for (var ev in eventHandlers) {
						if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
							videoEl.removeEventListener(ev, eventHandlers[ev], false);
						}
					}
				};
				errTarget.addEventListener("error", eventHandlers.error, errCapture);
				for (var ev in eventHandlers) {
					if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
						videoEl.addEventListener(ev, eventHandlers[ev], false);
					}
				}
				/* NOTE: MS Edge ignores js property, using setAttribute */
				videoEl.setAttribute("preload", "metadata");
				videoEl.preload = "metadata";

				// videoEl.setAttribute("poster", view.get("source").get("original"));
				// videoEl.setAttribute("preload", "metadata");
				// videoEl.poster = view.model.get("source").get("original");
				// videoEl.loop = view.model.attr("@video-loop") !== void 0;
				// videoEl.src = view.findPlayableSource(videoEl);
				// videoEl.load();

				// console.log("%s::whenVideoHasMetadata [preload:%s]", view.cid, videoEl.preload);
			}
		});
	},

	findPlayableSource: function(video) {
		var playable = this.model.get("sources").find(function(source) {
			return /^video\//.test(source.get("mime")) && video.canPlayType(source.get("mime")) != "";
		});
		return playable ? playable.get("original") : "";
	},

	/* ---------------------------
	/* PlayableRenderer implementation
	/* --------------------------- */

	// /** @override */
	// _canResumePlayback: function() {
	// 	return PlayableRenderer.prototype._canResumePlayback.apply(this, arguments) && this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
	// },

	/** @override initial value */
	_playbackRequested: false,

	/** @override */
	_isMediaPaused: function() {
		return this.video.paused;
	},

	/** @override */
	_playMedia: function() {
		if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && this.video.seekable.length == 0) {
			console.warn(this.cid, "WTF! got video data, but cannot seek, calling load()");
			// this._logMessage("call:load", "got video data, but cannot seek, calling load()", "orange");
			if (_.isFunction(this.video.load)) {
				this.video.load();
			}
		}
		/* NOTE: loop is false, restart from end on request */
		else if (this.video.ended) {
			this.video.currentTime = this.video.seekable.start(0);
		}

		/* if not enough data */
		if (this.video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
			if (this.video.networkState == HTMLMediaElement.NETWORK_IDLE) {
				this.video.load();
			} //else {
			// var _playStamp = this._playbackCount;
			// console.log("%s::_playMedia %s waiting [#%s]", this.cid, this._isMediaWaiting() ? "continue" : "begin", _playStamp);
			//
			// this.listenToElementOnce(this.video, "canplaythrough", function(ev) {
			// 	console.log("%s::_playMedia end waiting [#%s]", this.cid, _playStamp);
			//
			// 	this._toggleWaiting(false);
			// 	// this.playbackRequested && this.video.play();
			// 	this._validatePlayback();
			// });
			//}
			/* NOTE: on "canplaythrough" _playMedia() will be called again if still required */
			this._toggleWaiting(true);
		}
		/* play */
		else {
			/* NOTE: current browsers return a promise */
			this.video.play();
		}
	},

	/** @override */
	_pauseMedia: function() {
		// this._setPlayToggleSymbol("play-symbol");
		this.video.pause();
		// this._renderPlaybackState();
	},

	/* ---------------------------
	/* DOM events
	/* --------------------------- */

	_listenWhileSelected: function() {
		PlayableRenderer.prototype._listenWhileSelected.apply(this, arguments);
		this.fullscreenToggle.addEventListener(
			this._toggleEvent, this._onFullscreenToggle, false);
	},

	_stopListeningWhileSelected: function() {
		PlayableRenderer.prototype._stopListeningWhileSelected.apply(this, arguments);
		this.fullscreenToggle.removeEventListener(
			this._toggleEvent, this._onFullscreenToggle, false);
	},

	/* ---------------------------
	/* media events
	/* --------------------------- */

	addMediaListeners: function() {
		// if (!this._started) {
		// 	this.addListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
		// }
		this.addListeners(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
		this.addListeners(this.video, this.updateBufferedEvents, this._updateBufferedValue);
		this.addListeners(this.video, this.updateCurrTimeEvents, this._updateCurrTimeValue);
		this.video.addEventListener("ended", this._onMediaEnded, false);
		this.video.addEventListener("error", this._onMediaError, true);

		this.on("view:removed", this.removeMediaListeners, this);
	},

	removeMediaListeners: function() {
		this.off("view:removed", this.removeMediaListeners, this);

		// if (!this._started) {
		// 	this.removeListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
		// }
		this.removeListeners(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
		this.removeListeners(this.video, this.updateBufferedEvents, this._updateBufferedValue);
		this.removeListeners(this.video, this.updateCurrTimeEvents, this._updateCurrTimeValue);
		this.video.removeEventListener("ended", this._onMediaEnded, false);
		this.video.removeEventListener("error", this._onMediaError, true);
	},

	/* ---------------------------
	/* media event handlers
	/* --------------------------- */

	_onMediaError: function(ev) {
		this.removeMediaListeners();
		this.removeSelectionListeners();

		this._started = false;
		this.content.classList.remove("started");

		this.mediaState = "error";
		this.playbackRequested = false;
		// this.content.classList.remove("ended");
		// this.content.classList.remove("waiting");
		this._exitFullscreen();
	},

	_onMediaEnded: function(ev) {
		this.playbackRequested = false;
		this._exitFullscreen();
	},

	_exitFullscreen: function() {
		/* NOTE: polyfill should handle this on iOS? */
		if (this.video.webkitDisplayingFullscreen) {
			this.video.webkitExitFullscreen();
		}
		if (document.fullscreenElement === this.video) {
			this.video.exitFullscreen();
		}
	},

	/* ---------------------------
	/* _onMediaPlayingOnce
	/* --------------------------- */

	// playingOnceEvents: "playing waiting",
	//
	// _onMediaPlayingOnce: function(ev) {
	// 	this.removeListeners(this.video, this.playingOnceEvents, this._onMediaPlayingOnce);
	// 	if (!this._started) {
	// 		this._started = true;
	// 		this.content.classList.add("started");
	// 	}
	// },

	/* ---------------------------
	/* _updateCurrTimeValue
	/* --------------------------- */

	updateCurrTimeEvents: "playing waiting pause timeupdate seeked", //.split(" "),

	_updateCurrTimeValue: function(ev) {
		if (this.video.played.length) {
			this.content.classList.add("started");
		}
		if (this.progressMeter) {
			this.progressMeter.valueTo("amount", this.video.currentTime, 0);
		}
	},

	/* ---------------------------
	/* _updatePlaybackState
	/* --------------------------- */

	// updatePlaybackEvents: "playing play waiting pause seeking seeked ended",
	updatePlaybackEvents: "timeupdate playing pause waiting canplaythrough seeked",

	_isPlaybackWaiting: false,
	_playbackStartTS: -1,
	_playbackStartTC: -1,

	_updatePlaybackState: function(ev) {
		// var isWaiting = false;
		// var symbolName = "play-symbol";

		// NOTE: clearTimeout will cancel both setTimeout and setInterval IDs
		window.clearTimeout(this._playbackTimeoutID);
		this._playbackTimeoutID = -1;

		if (this.playbackRequested) {
			if (ev.type !== "timeupdate") {
				this._playbackStartTS = ev.timeStamp;
				this._playbackStartTC = this.video.currentTime;
			}
			switch (ev.type) {
				case "timeupdate":
					if (SYNC_THRESHOLD_MS < Math.abs((ev.timeStamp - this._playbackStartTS) -
							((this.video.currentTime - this._playbackStartTC) * 1000))) {
						this._playbackStartTS = ev.timeStamp;
						this._playbackStartTC = this.video.currentTime;
						this._playbackTimeoutID =
							window.setTimeout(this._playbackTimeoutFn_waiting, SYNC_TIMEOUT_MS);
						this._toggleWaiting(true);
						// break;
					} else {
						this._playbackTimeoutID =
							window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);
						this._toggleWaiting(false);
					}
					break;

				case "playing":
					this._playbackStartTS = ev.timeStamp;
					this._playbackStartTC = this.video.currentTime;
					this._playbackTimeoutID = window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);
					this._toggleWaiting(false);
					break;

				case "pause":
					/* NOTE: this.playbackRequested is true, the pause wasn't triggered
					 * from UI, but by the waiting handler below, so we treat it as
					 * waiting */
					// if (!this.playbackRequested) {
					// 	this._toggleWaiting(false);
					// }
					this._toggleWaiting(this.playbackRequested);
					break;

				case "canplaythrough":
					this._toggleWaiting(false);
					this._validatePlayback();
					break;

				case "waiting":
					/* NOTE: if the video is seeking, give it a chance to resume, so do
					 * nothing, and handle things on seeked/playing */
					if (!this.video.seeking) {
						/* if not enough data */
						if (this.video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
							this.video.pause();

							// this.listenToElementOnce(this.video, "canplaythrough", function() {
							// 	this._toggleWaiting(false);
							// 	this._validatePlayback();
							// this.playbackRequested && this.video.play();
							// });
						}
						this._toggleWaiting(true);
					}
					break;

				default:
					this._toggleWaiting(false);
					break;
			}
		} else {
			this._toggleWaiting(false);
		}
	},

	_playbackTimeoutID: -1,
	_playbackTimeoutFn_playing: function() {
		this._playbackTimeoutID = -1;

		this._toggleWaiting(true);
		// this._renderPlaybackState();

		// this._setPlayToggleSymbol("waiting-symbol");
		// this.content.classList.add("waiting");
		// this.progressMeter.stalled = true;
		// this._isPlaybackWaiting = true;
	},

	_playbackTimeoutFn_waiting: function() {
		if (SYNC_THRESHOLD_MS < (this.video.currentTime - this._playbackStartTC) * 1000) {
			this._playbackTimeoutID =
				window.setTimeout(this._playbackTimeoutFn_waiting, SYNC_TIMEOUT_MS);
		} else {
			// since there is no event.timeStamp
			// var delta = this.video.currentTime - this._playbackStartTC;
			// this._playbackStartTS += delta * 1000;
			// this._playbackStartTS = window.performance.now();
			this._playbackStartTS += SYNC_TIMEOUT_MS;
			this._playbackStartTC = this.video.currentTime;
			this._playbackTimeoutID =
				window.setTimeout(this._playbackTimeoutFn_playing, SYNC_TIMEOUT_MS);

			this._toggleWaiting(false);
			// this._renderPlaybackState();

			// this._setPlayToggleSymbol("pause-symbol");
			// this.content.classList.remove("waiting");
			// this.progressMeter.stalled = false;
			// this._isPlaybackWaiting = false;
		}
	},

	/** @override */
	_renderPlaybackState: function() {
		// if (DEBUG) {
		// 	this.__logMessage([
		// 	"mediaState:", this.mediaState,
		// 	"played:", this.video.played.length,
		// 	"ended:", this.video.ended,
		// 	"toggle.paused:", this._playToggleSymbol.paused
		// ].join(" "), "_renderPlaybackState");
		// }
		// console.log("%s::_renderPlaybackState mediaState:%s played:%o ended:%o",
		// 	this.cid, this.mediaState, this.video.played.length, this.video.ended);
		//
		// if (this.mediaState === "ready") {
		// 	this.updateOverlay(this.video, this.playToggle);
		// }

		var cls = this.content.classList;
		// if (!this._started && this.playbackRequested &&
		// 		this.video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
		// 	this._started = true;
		// 	cls.add("started");
		// }
		// cls.toggle("started", (this.video.played.length > 0));
		cls.toggle("ended", this.video.ended);

		PlayableRenderer.prototype._renderPlaybackState.apply(this, arguments);
	},

	_setPlayToggleSymbol: function(symbolName) {
		// if (this.video.ended) {
		// 	console.log("%s::_setPlayToggleSymbol %s -> ended", this.cid, symbolName);
		// }
		// if (this.mediaState === "ready") {
		// 	if (this.playbackRequested && !this._isMediaWaiting()) {
		// 		this._playToggleSymbol.setImageSource(null);
		// 	} else {
		// 		this._playToggleSymbol.setImageSource(this.video);
		// 	}
		// 	this._playToggleSymbol.refreshImageSource();
		// }
		return PlayableRenderer.prototype._setPlayToggleSymbol.call(this, this.video.ended ? "ended" : symbolName);
	},

	/* ---------------------------
	/* _updateBufferedValue
	/* --------------------------- */

	// updateBufferedEvents: "progress canplay canplaythrough playing timeupdate",//loadeddata
	updateBufferedEvents: "progress canplay canplaythrough play playing",

	_updateBufferedValue: function(ev) {
		// if (!this._started) return;
		var bRanges = this.video.buffered;
		if (bRanges.length > 0) {
			this._bufferedValue = bRanges.end(bRanges.length - 1);
			if (this.progressMeter && ((this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) /*|| (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && this.video.networkState == HTMLMediaElement.NETWORK_LOADING)*/ )) {
				this.progressMeter.valueTo("available", this._bufferedValue, 300);
				// this.progressMeter.valueTo("available", this._bufferedValue, Math.max(0, 1000 * (this._bufferedValue - (this.progressMeter.getTargetValue("available") | 0))));
			}
		}
	},

	/* ---------------------------
	/* fullscreen api
	/* --------------------------- */

	_onFullscreenToggle: function(ev) {
		// NOTE: Ignore if MouseEvent.button is 0 or undefined (0: left-button)
		if (!ev.defaultPrevented && !ev.button && this.model.selected) {
			ev.preventDefault();
			try {
				if (document.hasOwnProperty("fullscreenElement") &&
					document.fullscreenElement !== this.video) {
					document.addEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
					this.video.requestFullscreen();
				} else
				if (this.video.webkitSupportsFullscreen && !this.video.webkitDisplayingFullscreen) {
					this.video.addEventListener("webkitbeginfullscreen", this._onFullscreenChange, false);
					this.video.webkitEnterFullScreen();
				}
			} catch (err) {
				this.video.controls = false;
				console.error(err);
			}
		}
	},

	_onFullscreenChange: function(ev) {
		switch (ev.type) {
			case fullscreenChangeEvent:
				// var isOwnFullscreen = Modernizr.prefixed("fullscreenElement", document) === this.video;
				var isOwnFullscreen = document.fullscreenElement === this.video;
				this.video.controls = isOwnFullscreen;
				if (!isOwnFullscreen) {
					document.removeEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
				}
				break;
			case "webkitbeginfullscreen":
				this.video.controls = true;
				this.video.removeEventListener("webkitbeginfullscreen", this._onFullscreenChange, false);
				this.video.addEventListener("webkitendfullscreen", this._onFullscreenChange, false);
				break;
			case "webkitendfullscreen":
				this.video.removeEventListener("webkitendfullscreen", this._onFullscreenChange, false);
				this.video.controls = false;
				break;
		}
	},
});
module.exports = VideoRenderer;

/* ---------------------------
/* log to screen
/* --------------------------- */
if (DEBUG) {
	module.exports = (function(VideoRenderer) {
		if (!VideoRenderer.LOG_TO_SCREEN) return VideoRenderer;

		/** @type {Function} */
		var Color = require("color");
		/** @type {module:underscore.strings/lpad} */
		var lpad = require("underscore.string/lpad");
		/** @type {module:underscore.strings/rpad} */
		var rpad = require("underscore.string/rpad");

		// var fullscreenEvents = [
		// 	fullscreenChangeEvent, fullscreenErrorEvent,
		// 	"webkitbeginfullscreen", "webkitendfullscreen",
		// ];

		var mediaEvents = require("utils/event/mediaEventsEnum");
		var logPlaybackStateEvents, logBufferedEvents, logPlayedEvents;

		// logPlaybackStateEvents = ["playing", "waiting", "ended", "pause", "seeking", "seeked"];
		// logBufferedEvents = ["progress", "durationchange", "canplay", "play"];
		// logPlayedEvents = ["playing", "timeupdate"];

		logPlaybackStateEvents = [
			"loadstart",
			"progress",
			"suspend",
			"abort",
			"error",
			"emptied",
			"stalled",
		];
		logBufferedEvents = [
			"loadedmetadata",
			"loadeddata",
			"canplay",
			"canplaythrough",
			"playing",
			"waiting",
			"seeking", // seeking changed to true
			"seeked", // seeking changed to false
			"ended", // ended is true
		];
		logPlayedEvents = [
			"play",
			"pause"
		];

		// Exclude some events from log
		mediaEvents = _.without(mediaEvents, "resize", "error");
		// Make sure event subsets exist in the main set
		logPlaybackStateEvents = _.intersection(mediaEvents, logPlaybackStateEvents);
		logBufferedEvents = _.intersection(mediaEvents, logBufferedEvents);
		logPlayedEvents = _.intersection(mediaEvents, logPlayedEvents);

		var readyStateSymbols = _.invert(_.pick(HTMLMediaElement,
			function(val, key, obj) {
				return /^HAVE_/.test(key);
			}));
		var readyStateToString = function(el) {
			return readyStateSymbols[el.readyState] + "(" + el.readyState + ")";
		};

		var networkStateSymbols = _.invert(_.pick(HTMLMediaElement,
			function(val, key, obj) {
				return /^NETWORK_/.test(key);
			}));
		var networkStateToString = function(el) {
			return networkStateSymbols[el.networkState] + "(" + el.networkState + ")";
		};

		var mediaErrorSymbols = _.invert(MediaError);
		var mediaErrorToString = function(el) {
			return el.error ? mediaErrorSymbols[el.error.code] + "(" + el.error.code + ")" : "[MediaError null]";
		};

		var findRangeIndex = function(range, currTime) {
			for (var i = 0, ii = range.length; i < ii; i++) {
				if (range.start(i) <= currTime && currTime <= range.end(i)) {
					return i;
				}
			}
			return -1;
		};

		var formatVideoError = function(video) {
			return [
				mediaErrorToString(video),
				networkStateToString(video),
				readyStateToString(video),
			].join(" ");
		};

		var getVideoStatsCols = function() {
			return "0000.000 [Curr/Total] [Seekable]  [Buffered]  networkState readyState      Playback";
			// return "0000.620 [t:  0.0  27.4] [s: 27.4 0/1] [b:  0.5 0/1] LOADING(2)   FUTURE_DATA(3)  :: (::)";
		}

		var formatVideoStats = function(video) {
			var currTime = video.currentTime,
				durTime = video.duration,
				bRanges = video.buffered,
				bRangeIdx,
				sRanges = video.seekable,
				sRangeIdx;

			bRangeIdx = findRangeIndex(bRanges, currTime);
			sRangeIdx = findRangeIndex(sRanges, currTime);
			return [
				"[" + lpad(currTime.toFixed(1), 5) +
					" " + lpad((!isNaN(durTime) ? durTime.toFixed(1) : "-"), 4) + "]",
				"[" + lpad((sRangeIdx >= 0 ? sRanges.end(sRangeIdx).toFixed(1) : "-"), 5) +
					" " + (sRangeIdx >= 0 ? sRangeIdx : "-") + "/" + sRanges.length + "]",
				"[" + lpad((bRangeIdx >= 0 ? bRanges.end(bRangeIdx).toFixed(1) : "-"), 5) +
					" " + (bRangeIdx >= 0 ? bRangeIdx : "-") + "/" + bRanges.length + "]",
				rpad(networkStateToString(video).substr(8), 12),
				rpad(readyStateToString(video).substr(5), 15),
				(video.ended ? ">:" : (video.paused ? "::" : ">>"))
				// video.playbackRate.toFixed(2) + " (" + video.defaultPlaybackRate.toFixed(2) + ")"
			]; //.join(" ");
		};

		return VideoRenderer.extend({

			/** @override */
			initialize: function() {
				VideoRenderer.prototype.initialize.apply(this, arguments);

				_.bindAll(this, "__handleMediaEvent");

				var fgColor = this.model.attr("color"),
					red = new Color("red"),
					blue = new Color("blue"),
					green = new Color("green");

				for (var i = 0; i < mediaEvents.length; i++) {
					var ev = mediaEvents[i];
					this.video.addEventListener(ev, this.__handleMediaEvent, false);

					var c = new Color(fgColor),
						cc = 1;
					if (logBufferedEvents.indexOf(ev) != -1) c.mix(green, (cc /= 2));
					if (logPlayedEvents.indexOf(ev) != -1) c.mix(red, (cc /= 2));
					if (logPlaybackStateEvents.indexOf(ev) != -1) c.mix(blue, (cc /= 2));
					this.__logColors[ev] = c.rgbString();
				}
				this.video.addEventListener("error", this.__handleMediaEvent, true);
			},

			/** @override */
			remove: function() {
				VideoRenderer.prototype.remove.apply(this, arguments);
				for (var i = 0; i < mediaEvents.length; i++) {
					if (mediaEvents[i] == "error") continue;
					this.video.removeEventListener(mediaEvents[i], this.__handleMediaEvent, false);
				}
				this.video.removeEventListener("error", this.__handleMediaEvent, true);
			},

			// /** @override */
			// _onVisibilityChange: function(ev) {
			// 	VideoRenderer.prototype._onVisibilityChange.apply(this, arguments);
			// 	var stateVal = Modernizr.prefixed("visibilityState", document);
			// 	this.__logEvent("visibilityState:" + stateVal, ev.type + ":" + stateVal);
			// },
			//
			// /** @override */
			// _onFullscreenChange: function(ev) {
			// 	VideoRenderer.prototype._onFullscreenChange.apply(this, arguments);
			// 	var logtype = (document.fullscreenElement === this.video ? "enter:" : "exit:") + ev.type;
			// 	this.__logEvent("document.fullscreenElement: " + this.cid, logtype);
			// },

			/** @override */
			_onFullscreenToggle: function(ev) {
				if (!ev.defaultPrevented && this.model.selected) {
					this.__logEvent("fullscreen-toggle", ev.type);
				}
				VideoRenderer.prototype._onFullscreenToggle.apply(this, arguments);
			},

			/** @override */
			_playbackTimeoutFn_playing: function() {
				VideoRenderer.prototype._playbackTimeoutFn_playing.apply(this, arguments);
				// this.__logEvent(formatVideoStats(this.video).join(" "), "timeout-play");
				this.__handleMediaEvent({
					type: "timeout-play",
					timeStamp: null,
					isTimeout: true
				});
			},

			/** @override */
			_playbackTimeoutFn_waiting: function() {
				VideoRenderer.prototype._playbackTimeoutFn_waiting.apply(this, arguments);
				// this.__logEvent(formatVideoStats(this.video).join(" "), "timeout-wait");
				this.__handleMediaEvent({
					type: "timeout-wait",
					timeStamp: null,
					isTimeout: true
				});
			},

			__handleMediaEvent: function(ev) {
				var evmsg = formatVideoStats(this.video);

				if (this.playbackRequested === true) {
					evmsg.push("(>>)");
				} else if (this.playbackRequested === false) {
					evmsg.push("(::)");
				} else {
					evmsg.push("(--)");
				}

				if (this.playbackRequested) {
					evmsg.push(this._playbackTimeoutID !== -1 ? "W" : "-");
				} else {
					evmsg.push(this._playbackTimeoutID !== -1 ? "?" : "!");
				}
				// evmsg.push(this._playToggleSymbol.symbolName);

				var ts, tc;
				if ((this.updatePlaybackEvents.indexOf(ev.type) > -1) || ev.isTimeout) {
					// evmsg.push(this._playbackStartTS.toFixed(2));
					ts = ev.timeStamp - this._playbackStartTS;
					tc = this.video.currentTime - this._playbackStartTC;
					ts *= .001; // s to ms
					evmsg.push(Math.abs(tc - ts).toFixed(3));
				}
				// else {
				// 	ts = this._playbackStartTS;
				// 	tc = this._playbackStartTC;
				// }
				// ts *= .001; // s to ms
				// evmsg.push(Math.abs(tc - ts).toFixed(3));
				// evmsg.push("TC:" + tc.toFixed(3));
				// evmsg.push("TS:" + ts.toFixed(3));

				this.__logEvent(evmsg.join(" "), ev.type);
				if (ev.type === "error" || ev.type === "abort") {
					this.__logMessage(formatVideoError(this.video), ev.type);
				}
			},

			__logEvent: function(msg, logtype, color) {
				var logEntryEl = this.__logElement.lastElementChild;
				if ((logEntryEl && logEntryEl.getAttribute("data-logtype") == logtype) &&
					((logtype === "timeupdate") || (logtype === "progress"))) {
					var logRepeatVal = parseInt(logEntryEl.getAttribute("data-logrepeat"));
					logEntryEl.textContent = this.__getTStamp() + " " + msg;
					logEntryEl.setAttribute("data-logrepeat", isNaN(logRepeatVal) ? 2 : ++logRepeatVal);
				} else {
					this.__logMessage(msg, logtype, color);
				}
			},

			__getHeaderText: function() {
				return getVideoStatsCols();
			},
		});
	})(module.exports);
}
