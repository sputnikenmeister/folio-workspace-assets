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
/** @type {module:app/view/component/ProgressMeter} */
var ProgressMeter = require("app/view/component/ProgressMeter");
// /** @type {module:utils/prefixedStyleName} */
// var prefixedStyleName = require("utils/prefixedStyleName");
/** @type {module:utils/prefixedEvent} */
var prefixedEvent = require("utils/prefixedEvent");

/* --------------------------- *
/* private static
/* --------------------------- */

// var whenViewIsAttached = require("app/view/promise/whenViewIsAttached");

var fullscreenChangeEvent = prefixedEvent("fullscreenchange", document);
var fullscreenErrorEvent = prefixedEvent("fullscreenerror", document);

var formatTimecode = function(value) {
	if (isNaN(value)) return ""; //value = 0;
	if (value >= 3600) return ((value / 3600) | 0) + "H";
	if (value >= 60) return ((value / 60) | 0) + "M";
	// if (value >= 10) return "0" + (value | 0) + "S";
	return (value | 0) + "S";
};

/**
 * @constructor
 * @type {module:app/view/render/VideoRenderer}
 */
var VideoRenderer = PlayableRenderer.extend({

	/** @type {string} */
	cidPrefix: "videoRenderer",
	/** @type {string} */
	className: PlayableRenderer.prototype.className + " video-renderer",
	/** @type {Function} */
	template: require("./VideoRenderer.hbs"),

	events: (function() {
		return window.hasOwnProperty("onpointerup")
			? { "pointerup .fullscreen-toggle": "_onFullscreenToggle" }
			: { "mouseup .fullscreen-toggle": "_onFullscreenToggle" }
	}()),

	// events: {
	// 	"click .fullscreen-toggle": "_onFullscreenToggle",
	// },

	// properties: {
	// 	paused: {
	// 		get: function() {
	// 			return this.video.paused;
	// 		}
	// 	},
	// },

	/** @override */
	initialize: function(opts) {
		PlayableRenderer.prototype.initialize.apply(this, arguments);

		_.bindAll(this,
			"_updatePlaybackState",
			"_updatePlayedValue",
			"_updateBufferedValue",
			"_onMediaError",
			"_onMediaEnded",
			"_onMediaPlayingOnce",
			"_onFullscreenChange"
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
		this.video.loop = this.model.attr("@video-loop") !== void 0;
		this.video.src = this.findPlayableSource(this.video);
	},

	measure: function() {
		PlayableRenderer.prototype.measure.apply(this, arguments);

		// NOTE: Top/bottom 1px video crop
		// - Cropped in CSS: video, .poster { margin-top: -1px; margin-bottom: -1px;}
		// - Cropped height is adjusted in metrics obj
		// - Crop amount added back to actual video on render()
		this.metrics.media.height -= 2;
		this.metrics.content.height -= 2;
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
		content.style.height = (this.metrics.media.height - 1) + "px";

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
		this.video.setAttribute("height", this.metrics.media.height + 2);
		img.setAttribute("width", this.metrics.media.width);
		img.setAttribute("height", this.metrics.media.height + 2);

		return this;
	},

	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */

	initializeAsync: function() {
		return Promise.resolve(this)
			.then(PlayableRenderer.whenSelectionIsContiguous)
			.then(PlayableRenderer.whenScrollingEnds)
			.then(
				function(view) {
					return Promise.all([
						view.whenVideoHasMetadata(view),
						PlayableRenderer.whenDefaultImageLoads(view),
					]).then(
						function(arr) {
							return Promise.resolve(view);
						},
						function(err) {
							return Promise.reject(err);
						}
					);
				})
			.then(
				function(view) {
					return view.whenAttached();
				})
			.then(
				function(view) {
					view.initializePlayable();
					view.updateOverlay(view.defaultImage, view.overlay);
					view.addSelectionListeners();
					return view;
				});
	},

	initializePlayable: function() {
		// video
		// ---------------------------------
		this.addMediaListeners();

		// progress-meter
		// ---------------------------------
		this.progressMeter = new ProgressMeter({
			maxValues: {
				amount: this.video.duration,
				available: this.video.duration,
			},
			color: this.model.attr("color"),
			backgroundColor: this.model.attr("background-color"),
			labelFn: this._progressLabelFn.bind(this)
		});
		var parentEl = this.el.querySelector(".top-bar");
		parentEl.insertBefore(this.progressMeter.render().el, parentEl.firstChild);
	},

	_progressLabelFn: function(value, total) {
		if (!this._started || this.video.ended || isNaN(value)) {
			return formatTimecode(total);
		} else if (!this.playbackRequested) {
			return Globals.PAUSE_CHAR;
		} else {
			return formatTimecode(total - value);
		}
	},

	/* ---------------------------
	/* whenVideoHasMetadata promise
	/* --------------------------- */

	whenVideoHasMetadata: function(view) {
		// NOTE: not pretty !!!
		return new Promise(function(resolve, reject) {
			var mediaEl = view.video;
			var eventHandlers = {
				loadedmetadata: function(ev) {
					if (ev) removeEventListeners();
					// console.log("%s::whenVideoHasMetadata [%s] %s", view.cid, "resolved", ev? ev.type : "sync");
					resolve(view);
				},
				abort: function(ev) {
					if (ev) removeEventListeners();
					reject(new PlayableRenderer.ViewError(view, new Error("whenVideoHasMetadata: view was removed")));
				},
				error: function(ev) {
					if (ev) removeEventListeners();
					var err;
					if (mediaEl.error) {
						err = new Error(_.invert(MediaError)[mediaEl.error.code]);
						err.infoCode = mediaEl.error.code;
					} else {
						err = new Error("Unspecified error");
					}
					err.infoSrc = mediaEl.src;
					err.logMessage = "whenVideoHasMetadata: " + err.name + " " + err.infoSrc;
					err.logEvent = ev;
					reject(err);
				},
			};
			//  (mediaEl.preload == "auto" && mediaEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
			// 	(mediaEl.preload == "metadata" && mediaEl.readyState >= HTMLMediaElement.HAVE_METADATA)
			if (mediaEl.error) {
				eventHandlers.error();
			} else if (mediaEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
				eventHandlers.loadedmetadata();
			} else {
				var sources = mediaEl.querySelectorAll("source");
				var errTarget = sources.length > 0 ? sources.item(sources.length - 1) : mediaEl;
				var errCapture = errTarget === mediaEl; // use capture with HTMLMediaElement

				var removeEventListeners = function() {
					errTarget.removeEventListener("error", eventHandlers.error, errCapture);
					for (var ev in eventHandlers) {
						if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
							mediaEl.removeEventListener(ev, eventHandlers[ev], false);
						}
					}
				};
				errTarget.addEventListener("error", eventHandlers.error, errCapture);
				for (var ev in eventHandlers) {
					if (ev !== "error" && eventHandlers.hasOwnProperty(ev)) {
						mediaEl.addEventListener(ev, eventHandlers[ev], false);
					}
				}
				mediaEl.preload = "metadata";
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
			this.video.load();
			// this.video.currentTime = 0;
		} else if (this.video.ended) {
			this.video.currentTime = this.video.seekable.start(0);
		}
		this.video.play();
	},

	/** @override */
	_pauseMedia: function() {
		this.video.pause();
	},

	/* ---------------------------
	/* media events
	/* --------------------------- */

	// updatePlaybackEvents: "play playing waiting pause seeking seeked ended",
	// updateBufferedEvents: "progress canplay canplaythrough playing timeupdate",//loadeddata
	updatePlaybackEvents: "playing waiting pause",
	updateBufferedEvents: "progress canplay canplaythrough play playing",
	updatePlayedEvents: "timeupdate seeked",

	addMediaListeners: function() {
		if (!this._started) this.video.addEventListener("playing", this._onMediaPlayingOnce, false);
		this.addListener(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
		this.addListener(this.video, this.updateBufferedEvents, this._updateBufferedValue);
		this.addListener(this.video, this.updatePlayedEvents, this._updatePlayedValue);
		this.video.addEventListener("ended", this._onMediaEnded, false);
		this.video.addEventListener("error", this._onMediaError, true);

		this.on("view:removed", this.removeMediaListeners, this);
	},

	removeMediaListeners: function() {
		this.off("view:removed", this.removeMediaListeners, this);

		if (!this._started) this.video.removeEventListener("playing", this._onMediaPlayingOnce, false);
		this.removeListener(this.video, this.updatePlaybackEvents, this._updatePlaybackState);
		this.removeListener(this.video, this.updateBufferedEvents, this._updateBufferedValue);
		this.removeListener(this.video, this.updatePlayedEvents, this._updatePlayedValue);
		this.video.removeEventListener("ended", this._onMediaEnded, false);
		this.video.removeEventListener("error", this._onMediaError, true);
	},

	/* ---------------------------
	/* media event handlers
	/* --------------------------- */

	_onMediaError: function(ev) {
		this.removeMediaListeners();
		this.removeSelectionListeners();

		this._onMediaEnded(ev);
		this.content.classList.remove("ended");
		this.content.classList.remove("waiting");
		this.content.classList.remove("started");
		this._started = false;

		this.mediaState = "error";
	},

	_onMediaPlayingOnce: function(ev) {
		this.video.removeEventListener("playing", this._onMediaPlayingOnce, false);
		if (!this._started) {
			this._started = true;
			this.content.classList.add("started");
		}
	},

	_onMediaEnded: function(ev) {
		this.playbackRequested = false;
		if (this.video.webkitDisplayingFullscreen) {
			this.video.webkitExitFullscreen();
		}
		if (document.fullscreenElement === this.video) {
			this.video.exitFullscreen();
		}
	},

	_updatePlaybackState: function(ev) {
		var classList = this.content.classList;
		if (this.playbackRequested) {
			switch (ev.type) {
				case "pause":
				case "playing":
					classList.remove("waiting");
					break;
				case "waiting":
					classList.add("waiting");
					break;
			}
		} else {
			classList.remove("waiting");
		}
		classList.toggle("ended", this.video.ended);

		this._updatePlayedValue(ev);
	},

	_updatePlayedValue: function(ev) {
		this._currentTimeValue = this.video.currentTime;
		if (this.progressMeter) {
			this.progressMeter.valueTo(this._currentTimeValue, 0, "amount");
		}
	},

	_updateBufferedValue: function(ev) {
		var bRanges = this.video.buffered;
		if (bRanges.length > 0) {
			this._bufferedValue = bRanges.end(bRanges.length - 1);
			if (this.progressMeter && ((this.video.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA) || (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && this.video.networkState == HTMLMediaElement.NETWORK_LOADING))) {
				this.progressMeter.valueTo(this._bufferedValue, 300, "available");
				// this.progressMeter.valueTo(this._bufferedValue, Math.max(0, 1000 * (this._bufferedValue - (this.progressMeter.getValue("available") | 0))), "available");
			}
		}
	},

	/* ---------------------------
	/* fullscreen api
	/* --------------------------- */

	_onFullscreenToggle: function(ev) {
		// NOTE: Ignore if MouseEvent.button is 0 or undefined (0: left-button)
		if (!ev.defaultPrevented && !ev.button && this.model.selected) {
			// ev.preventDefault();
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
				this.video.controls = false;
				this.video.removeEventListener("webkitendfullscreen", this._onFullscreenChange, false);
				break;
		}
	},

	/* ---------------------------
	/* event helpers
	/* --------------------------- */

	addListener: function(target, events, handler, useCapture) {
		(typeof events === "string") && (events = events.split(" "));
		for (var i = 0; i < events.length; i++) {
			target.addEventListener(events[i], handler, !!useCapture);
		}
	},

	removeListener: function(target, events, handler, useCapture) {
		(typeof events === "string") && (events = events.split(" "));
		for (var i = 0; i < events.length; i++) {
			target.removeEventListener(events[i], handler, !!useCapture);
		}
	},
});

/* ---------------------------
/* log to screen
/* --------------------------- */
if (DEBUG) {

	VideoRenderer = (function(VideoRenderer) {
		if (!VideoRenderer.LOG_TO_SCREEN) return VideoRenderer;

		/** @type {Function} */
		var Color = require("color");
		/** @type {module:underscore.strings/lpad} */
		var lpad = require("underscore.string/lpad");
		/** @type {module:underscore.strings/rpad} */
		var rpad = require("underscore.string/rpad");

		var fullscreenEvents = [
		fullscreenChangeEvent, fullscreenErrorEvent,
		"webkitbeginfullscreen", "webkitendfullscreen",
	];

		// var mediaEvents = [];
		var mediaEvents = _.without(require("utils/event/mediaEventsEnum"), "resize", "error");
		var updatePlaybackStateEvents = ["playing", "waiting", "ended", "pause", "seeking", "seeked"],
			updateBufferedEvents = ["progress", "durationchange", "canplay", "play"],
			updatePlayedEvents = ["playing", "timeupdate"];

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
			"[t:" + lpad(currTime.toFixed(1), 5) +
				" " + lpad((!isNaN(durTime) ? durTime.toFixed(1) : "-"), 5) + "]",
			"[s:" + lpad((sRangeIdx >= 0 ? sRanges.end(sRangeIdx).toFixed(1) : "-"), 5) +
				" " + (sRangeIdx >= 0 ? sRangeIdx : "-") + "/" + sRanges.length + "]",
			"[b:" + lpad((bRangeIdx >= 0 ? bRanges.end(bRangeIdx).toFixed(1) : "-"), 5) +
				" " + (bRangeIdx >= 0 ? bRangeIdx : "-") + "/" + bRanges.length + "]",
			rpad(networkStateToString(video).substr(8), 12),
			rpad(readyStateToString(video).substr(5), 15),
				(video.ended ? ">:" : (video.paused ? "::" : ">>")),
		].join(" ");
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
					if (updateBufferedEvents.indexOf(ev) != -1) c.mix(green, (cc /= 2));
					if (updatePlayedEvents.indexOf(ev) != -1) c.mix(blue, (cc /= 2));
					if (updatePlaybackStateEvents.indexOf(ev) != -1) c.mix(red, (cc /= 2));
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

			/** @override */
			_onVisibilityChange: function(ev) {
				VideoRenderer.prototype._onVisibilityChange.apply(this, arguments);
				var stateVal = Modernizr.prefixed("visibilityState", document);
				this.__logEvent("visibilityState:" + stateVal, ev.type + ":" + stateVal);
			},

			/** @override */
			_onFullscreenChange: function(ev) {
				VideoRenderer.prototype._onFullscreenChange.apply(this, arguments);
				var logtype = (document.fullscreenElement === this.video ? "enter:" : "exit:") + ev.type;
				this.__logEvent("document.fullscreenElement: " + this.cid, logtype);
			},

			/** @override */
			_onFullscreenToggle: function(ev) {
				VideoRenderer.prototype._onFullscreenToggle.apply(this, arguments);
				if (!ev.defaultPrevented && this.model.selected) {
					this.__logEvent("fullscreen-toggle", ev.type);
				}
			},

			__handleMediaEvent: function(ev) {
				var evmsg, errmsg;
				// evmsg = formatVideoStats(this.video) + " " + rpad(this._lastPlaybackStates || "-", 9);
				evmsg = formatVideoStats(this.video);
				if (this.playbackRequested === true) {
					evmsg += " (>>)";
				} else if (this.playbackRequested === false) {
					evmsg += " (::)";
				} else {
					evmsg += " (--)";
				}
				this.__logEvent(evmsg, ev.type);
				if (ev.type === "error" || ev.type === "abort") {
					this.__logMessage(formatVideoError(this.video), ev.type);
				}
			},

			__logEvent: function(msg, logtype, color) {
				var logEntryEl = this.__logElement.lastElementChild;
				if ((logEntryEl && logEntryEl.getAttribute("data-logtype") == logtype) &&
					(logtype === "timeupdate")) {
					var logRepeatVal = parseInt(logEntryEl.getAttribute("data-logrepeat"));
					logEntryEl.textContent = this.__getTStamp() + " " + msg;
					logEntryEl.setAttribute("data-logrepeat", isNaN(logRepeatVal) ? 2 : ++logRepeatVal);
				} else {
					this.__logMessage(msg, logtype, color);
				}
			},
		});
	})(VideoRenderer);

}

module.exports = VideoRenderer;
