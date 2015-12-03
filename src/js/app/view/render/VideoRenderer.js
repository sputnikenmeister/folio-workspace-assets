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
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */
var PlayableRenderer = require("app/view/render/PlayableRenderer");
/** @type {module:app/view/component/progress/ProgressMeter} */
var ProgressMeter = require("app/view/component/progress/ProgressMeter");
/** @type {module:utils/prefixedStyleName} */
var prefixedStyleName = require("utils/prefixedStyleName");
/** @type {module:utils/prefixedEvent} */
var prefixedEvent = require("utils/prefixedEvent");

/* --------------------------- *
/* private static
/* --------------------------- */

var fullscreenChangeEvent = prefixedEvent("fullscreenchange", document);
var fullscreenErrorEvent = prefixedEvent("fullscreenerror", document);

var progressLabelFn = function(value, total) {
	value = isNaN(value)? total : total - value;
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
	
	events: {
		"mouseup .fullscreen-toggle": "_onFullscreenToggle",
	},
	
	properties: {
		paused: {
			get: function() {
				return this.video.paused;
			}
		},
	},
	
	/** @override */
	initialize: function (opts) {
		PlayableRenderer.prototype.initialize.apply(this, arguments);
		
		_.bindAll(this,
			"_updatePlaybackState",
			"_updatePlayedValue",
			"_updateBufferedValue",
			"_onMediaError",
			"_onMediaEnded",
			"_onMediaFirstPlaying",
			"_onFullscreenChange"
		);
		// var onPeerSelect = function() {
		// 	this.getContentEl().style.display = (this.getSelectionDistance() > 1)? "none": "";
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
		
		var content = this.getContentEl();
		this.overlay = content.querySelector(".overlay");
		this.placeholder = this.el.querySelector(".placeholder");
		
		this.video = content.querySelector("video");
		this.video.loop = this.model.attrs().hasOwnProperty("@video-loop");
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
	render: function () {
		PlayableRenderer.prototype.render.apply(this, arguments);
		
		var els, el, i, cssW, cssH;
		var img = this.getDefaultImage();
		var content = this.getContentEl();
		
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
		content.style.left = this.metrics.content.x + "px";
		content.style.top = this.metrics.content.y + "px";
		
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
					view.addMediaListeners();
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
					view.addSelectionListeners();
					view.updateOverlay(view.getDefaultImage(), view.el.querySelector(".overlay"));
					view.progressMeter = new ProgressMeter({
						maxValues: {
							amount: view.video.duration,
							available: view.video.duration,
						},
						color: view.model.attrs()["color"],
						backgroundColor: view.model.attrs()["background-color"],
						labelFn: function(value, total) {
							return progressLabelFn.call(null, (view.video.ended? 0 : value), total);
						}.bind(view)
						// labelFn: function(value, total) {
						// 	return (!this._notPlayed && !this.video.ended && this.video.paused)?
						// 		String.fromCharCode(0x23F8) : // play: 0x23F5, pause: 0x23F8, stop: 0x23F9
						// 		progressLabelFn.call(null, (view.video.ended? 0 : value), total);
						// }.bind(view)
					});
					var parentEl = view.el.querySelector(".top-bar");
					parentEl.insertBefore(view.progressMeter.render().el, parentEl.firstChild);
					return view;
				});
	},
	
	whenVideoHasMetadata: function(view) {
		return new Promise(function(resolve, reject) {
			var mediaEl = view.video;
			
			var handlers = {
				loadedmetadata: function(ev) {
					if (ev) removeEventListeners();
					console.log("%s::whenVideoHasMetadata [%s] %s", view.cid, "resolved", ev? ev.type : "sync");
					resolve(view);
				},
				abort: function(ev) {
					if (ev) removeEventListeners();
					reject(new PlayableRenderer.ViewError(view, new Error("whenVideoHasMetadata: view was removed")));
				},
				error: function(ev) {
					if (ev) removeEventListeners();
					var err = new Error(mediaEl.error?_.invert(MediaError)[mediaEl.error.code]:"Unspecified error");
					err.infoSrc = mediaEl.src;
					err.infoCode = mediaEl.error? mediaEl.error.code: null;
					err.logMessage = "whenVideoHasMetadata: " + err.name + " " + err.infoSrc;
					err.logEvent = ev;
					reject(err);
				},
			};
			
			// if ((mediaEl.preload === "auto" && mediaEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) ||
			// 	(mediaEl.preload === "metadata" && mediaEl.readyState >= HTMLMediaElement.HAVE_METADATA)) {
			if (mediaEl.error) {
				handlers.error();
			} else if (mediaEl.readyState >= HTMLMediaElement.HAVE_METADATA) {
				handlers.loadedmetadata();
			} else {
				var sources = mediaEl.querySelectorAll("source");
				var errTarget = sources.length > 0? sources.item(sources.length - 1) : mediaEl;
				var errCapture = errTarget === mediaEl; // use capture with HTMLMediaElement
				
				var removeEventListeners = function () {
					errTarget.removeEventListener("error", handlers.error, errCapture);
					for (var ev in handlers) {
						if (ev !== "error" && handlers.hasOwnProperty(ev)) {
							mediaEl.removeEventListener(ev, handlers[ev], false);
						}
					}
				};
				errTarget.addEventListener("error", handlers.error, errCapture);
				for (var ev in handlers) {
					if (ev !== "error" && handlers.hasOwnProperty(ev)) {
						mediaEl.addEventListener(ev, handlers[ev], false);
					}
				}
				mediaEl.preload = "metadata";
			}
		});
	},
	
	findPlayableSource: function(video) {
		var prefix = (this.model.attrs()["@debug"] === "slow")? Globals.MEDIA_DIR_SLOW : Globals.MEDIA_DIR;
		var playable = _.find(this.model.get("srcset"), function(source) {
			return /^video\//.test(source.mime) && video.canPlayType(source.mime) != "";
		});
		return (playable === void 0)? "" : prefix + "/" + playable.src;// + "?" + Date.now(): "";
	},
	
	/* ---------------------------
	/* PlayableRenderer overrides
	/* --------------------------- */
	
	togglePlayback: function(newPlayState) {
		// is playback changing?
		if (_.isBoolean(newPlayState) && newPlayState !== this.video.paused) {
			return; // requested state is current, do nothing
		} else {
			newPlayState = this.video.paused;
		}
		// changing to what?
		if (newPlayState) {
			if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && this.video.seekable.length == 0) {
				console.warn(this.cid, "WTF! got video data, but cannot seek, calling load()");
				// this._logMessage("call:load", "got video data, but cannot seek, calling load()", "orange");
				this.video.load();
			} else if (this.video.ended) {
				this.video.currentTime = this.video.seekable.start(0);
			}
			this.video.play();
		} else {
			this.video.pause();
		}
	},
	
	/* ---------------------------
	/* media events
	/* --------------------------- */
	
	addMediaListeners: function() {
		//loadeddata progress canplay canplaythrough
		this.addListener(this.video, "playing waiting pause seeking", this._updatePlaybackState);
		this.addListener(this.video, "progress canplay canplaythrough timeupdate", this._updateBufferedValue);
		this.addListener(this.video, "timeupdate", this._updatePlayedValue);
		this.video.addEventListener("ended", this._onMediaEnded, false);
		this.video.addEventListener("error", this._onMediaError, true);
		if (this._notPlayed) this.video.addEventListener("play", this._onMediaFirstPlaying, false);
		
		this.on("view:removed", this.removeMediaListeners, this);
	},
	
	removeMediaListeners: function() {
		this.off("view:removed", this.removeMediaListeners, this);
		
		this.removeListener(this.video, "play playing waiting pause seeking", this._updatePlaybackState);
		this.removeListener(this.video, "progress canplay canplaythrough timeupdate", this._updateBufferedValue);
		this.removeListener(this.video, "timeupdate", this._updatePlayedValue);
		this.video.removeEventListener("ended", this._onMediaEnded, false);
		this.video.removeEventListener("error", this._onMediaError, true);
		if (this._notPlayed) this.video.removeEventListener("play", this._onMediaFirstPlaying, false);
	},
	
	/* ---------------------------
	/* media event handlers
	/* --------------------------- */
	
	_notPlayed: true,
	
	_onMediaFirstPlaying: function(ev) {
		this.video.removeEventListener("play", this._onMediaFirstPlaying, false);
		if (this._notPlayed) {
			this._notPlayed = false;
			this._updateBufferedValue(ev);
			this.getContentEl().classList.remove("not-played");
		}
	},
	
	_updatePlaybackState: function(ev) {
		if (this.video.paused) {
			if (this.video.ended) {
				this._userPlaybackRequested = false;
				this.playbackState = "user-replay";
				// this.progressMeter.valueTo(0);
				// this._updatePlayedValue(ev);
			} else {
				this.playbackState = "user-resume";
			}
		} else if (this.video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
			this.playbackState = "media";
		} else {
			this.playbackState = "network";
		}
		this._updatePlayedValue(ev);
	},
		
	_updateBufferedValue: function(ev) {
		var bRanges = this.video.buffered;
		if (bRanges.length > 0) {
			this._bufferedValue = bRanges.end(bRanges.length - 1);
			if (this.progressMeter && !this._notPlayed) {
				this.progressMeter.valueTo(this._bufferedValue, 300, "available");
				// this.progressMeter.valueTo(this._bufferedValue, Math.max(0, 1000 * (this._bufferedValue - (this.progressMeter.getValue("available") | 0))), "available");
			}
		}
	},
	
	_updatePlayedValue: function(ev) {
		this._currentTimeValue = this.video.currentTime;
		if (this.progressMeter) {
			this.progressMeter.valueTo(this._currentTimeValue, 0, "amount");
			// this.progressMeter.valueTo(this._currentTimeValue, Math.max(0, 1000 * (this._currentTimeValue - (this.progressMeter.getValue("amount") | 0))), "amount");
			this.progressMeter.indeterminate = (this.playbackState === "network");
		}
	},
	
	_onMediaEnded: function(ev) {
		if (this.video.webkitDisplayingFullscreen) {
			this.video.webkitExitFullscreen();
		}
		if (document.fullscreenElement === this.video) {
			this.video.exitFullscreen();
		}
	},
	
	_onMediaError: function(ev) {
		this.removeMediaListeners();
		this.removeSelectionListeners();
		this.mediaState = "error";
	},
	
	/* ---------------------------
	/* fullscreen api
	/* --------------------------- */
	
	_onFullscreenToggle: function (ev) {
		// NOTE: Ignore if MouseEvent.button is 0 or undefined (0: left-button)
		if (!ev.defaultPrevented && !ev.button && this.model.selected) { //
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
	
	/** @type {Function} */
	var Color = require("color");
	/** @type {module:underscore.strings/lpad} */
	var lpad = require("underscore.string/lpad");
	/** @type {module:underscore.strings/rpad} */
	var rpad = require("underscore.string/rpad");
	
	var fullscreenEvents = [
		fullscreenChangeEvent, fullscreenErrorEvent,
		"webkitbeginfullscreen","webkitendfullscreen",
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
			bRanges = video.buffered, bRangeIdx,
			sRanges = video.seekable, sRangeIdx;
		
		bRangeIdx = findRangeIndex(bRanges, currTime);
		sRangeIdx = findRangeIndex(sRanges, currTime);
		return [
			"[t:" +	lpad(currTime.toFixed(1), 5) +
				" " + lpad((!isNaN(durTime)? durTime.toFixed(1) : "-"), 5) + "]",
			"[s:" + lpad((sRangeIdx >= 0? sRanges.end(sRangeIdx).toFixed(1): "-"), 5) + 
				" " + (sRangeIdx >= 0? sRangeIdx : "-") + "/" + sRanges.length + "]",
			"[b:" +	lpad((bRangeIdx >= 0? bRanges.end(bRangeIdx).toFixed(1): "-"), 5) +
				" " + (bRangeIdx >= 0? bRangeIdx : "-") + "/" + bRanges.length + "]",
			rpad(networkStateToString(video).substr(8), 12),
			rpad(readyStateToString(video).substr(5), 15),
			(video.ended? ">:" : (video.paused? "::" : ">>")),
		].join(" ");
	};
	
	return VideoRenderer.extend({
		
		/** @override */
		initialize: function() {
			VideoRenderer.prototype.initialize.apply(this, arguments);
			
			_.bindAll(this, "__handleMediaEvent");
			
			var fgColor = this.model.attrs()["color"],
				red = new Color("red"),
				blue = new Color("blue"),
				green = new Color("green");
			
			for (var i = 0; i < mediaEvents.length; i++) {
				var ev = mediaEvents[i];
				this.video.addEventListener(ev, this.__handleMediaEvent, false);
				
				var c = new Color(fgColor), cc = 1;
				if (updateBufferedEvents.indexOf(ev) != -1)	c.mix(green, (cc/=2));
				if (updatePlayedEvents.indexOf(ev) != -1) c.mix(blue, (cc/=2));
				if (updatePlaybackStateEvents.indexOf(ev) != -1) c.mix(red, (cc/=2));
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
			this.__logEvent("visibilityState:" + stateVal, ev.type +":"+ stateVal);
		},
		
		/** @override */
		_onFullscreenChange: function(ev) {
			VideoRenderer.prototype._onFullscreenChange.apply(this, arguments);
			var logtype = (document.fullscreenElement === this.video? "enter:":"exit:") + ev.type;
			this.__logEvent("document.fullscreenElement: " + this.cid, logtype);
		},
		
		/** @override */
		_onFullscreenToggle: function (ev) {
			VideoRenderer.prototype._onFullscreenToggle.apply(this, arguments);
			if (!ev.defaultPrevented && this.model.selected) {
				this.__logEvent("fullscreen-toggle", ev.type);
			}
		},
		
		__handleMediaEvent: function(ev) {
			var evmsg, errmsg;
			evmsg = formatVideoStats(this.video) + " " + rpad(this._lastPlaybackStates || "-", 9);
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
				logEntryEl.setAttribute("data-logrepeat", isNaN(logRepeatVal)? 2 : ++logRepeatVal);
			} else {
				this.__logMessage(msg, logtype, color);
			}
		},
	});
})(VideoRenderer);

}

module.exports = VideoRenderer;
