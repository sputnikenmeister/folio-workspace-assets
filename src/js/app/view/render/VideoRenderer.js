/*global HTMLMediaElement, MediaError*/

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
/** @type {module:underscore.strings/lpad} */
var lpad = require("underscore.string/lpad");
/** @type {module:underscore.strings/rpad} */
var rpad = require("underscore.string/rpad");

/** @type {module:Modernizr} */
// require("Modernizr");
var Modernizr = global.Modernizr || (require("Modernizr") && global.Modernizr);

/** @type {module:utils/toggleFullScreen} */
// var toggleFullScreen = require("utils/toggleFullScreen");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */
var PlayableRenderer = require("app/view/render/PlayableRenderer");


/** @type {Array} */
var prefixedEvent = require("utils/prefixedEvent");

var fullscreenChangeEvent = prefixedEvent("fullscreenchange", document);
var fullscreenErrorEvent = prefixedEvent("fullscreenerror", document);

/** @type {Array} */
var mediaEvents = require("utils/event/mediaEventsEnum")
	.concat([
		"webkitbeginfullscreen","webkitendfullscreen",
		fullscreenChangeEvent, fullscreenErrorEvent
		// "fullscreenchange", "fullscreenerror",
		// "mozfullscreenchange", "mozfullscreenerror",
		// "webkitfullscreenchange", "webkitfullscreenerror",
	]);

/** @type {Array} */
var stateMediaEvents = [
	"loadstart",
	// "progress",
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
	// "volumechange"
];
var ignoredMediaEvents = _.difference(mediaEvents, stateMediaEvents);

function createTraceEnum(obj, keys) {
	var ret = {};
	for (var val, key, i = 0; i < keys.length; i++) {
		key = keys[i];
		val = obj[key];
		if (_.isNumber(val)) {
			ret[val] = key + "(" + val + ")";
		}
	}
	return ret;
}
// networkStateSymbols[HTMLMediaElement.NETWORK_NO_SOURCE] = "NETWORK_NO_SOURCE:" + HTMLMediaElement.NETWORK_NO_SOURCE;
// networkStateSymbols[HTMLMediaElement.NETWORK_IDLE] = "NETWORK_IDLE:" + HTMLMediaElement.NETWORK_IDLE;
// networkStateSymbols[HTMLMediaElement.NETWORK_LOADING] = "NETWORK_LOADING:" + HTMLMediaElement.NETWORK_LOADING;
// networkStateSymbols[HTMLMediaElement.NETWORK_NO_SOURCE] = "NETWORK_NO_SOURCE:" + HTMLMediaElement.NETWORK_NO_SOURCE;

var networkStateSymbols = createTraceEnum(HTMLMediaElement, [
	"NETWORK_EMPTY",
	"NETWORK_IDLE",
	"NETWORK_LOADING",
	"NETWORK_NO_SOURCE"
]);
var readyStateSymbols = createTraceEnum(HTMLMediaElement, [
	"HAVE_NOTHING",
	"HAVE_METADATA",
	"HAVE_CURRENT_DATA",
	"HAVE_FUTURE_DATA",
	"HAVE_ENOUGH_DATA"
]);
var mediaErrorSymbols = createTraceEnum(MediaError, _.keys(MediaError));

// var visibilityHiddenProp, visibilityStateProp, visibilityChangeEvent; 
// if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
// 	visibilityHiddenProp = "hidden";
// 	visibilityChangeEvent = "visibilitychange";
// 	visibilityStateProp = "visibilityState";
// 	console.log("Found page visibility API: '%s', 'document.%s', 'document.%s' (unprefixed) ", visibilityChangeEvent, visibilityStateProp, visibilityHiddenProp);
// } else {
// 	if (typeof document.mozHidden !== "undefined") {
// 		visibilityHiddenProp = "mozHidden";
// 		visibilityChangeEvent = "mozvisibilitychange";
// 		visibilityStateProp = "mozVisibilityState";
// 	} else if (typeof document.msHidden !== "undefined") {
// 		visibilityHiddenProp = "msHidden";
// 		visibilityChangeEvent = "msvisibilitychange";
// 		visibilityStateProp = "msVisibilityState";
// 	} else if (typeof document.webkitHidden !== "undefined") {
// 		visibilityHiddenProp = "webkitHidden";
// 		visibilityChangeEvent = "webkitvisibilitychange";
// 		visibilityStateProp = "webkitVisibilityState";
// 	}
// 	console.warn("Found page visibility API: '%s', '%document.%s', 'document.%s' (prefixed) ", visibilityChangeEvent, visibilityStateProp, visibilityHiddenProp);
// }

var viewTemplate = require("./VideoRenderer.hbs");
// var videoSourcesTemplate = require("./VideoRenderer.Sources.hbs");

/**
* @constructor
* @type {module:app/view/render/VideoRenderer}
*/
module.exports = PlayableRenderer.extend({
	
	/** @type {string} */
	cidPrefix: "video-renderer-",
	/** @type {string} */
	className: PlayableRenderer.prototype.className + " video-renderer",
	/** @type {Function} */
	template: viewTemplate,
	
	events: {
		// "fullscreenchange video": "_onFullscreenChange",
		// "mozfullscreenchange video": "_onFullscreenChange",
		// "webkitfullscreenchange video": "_onFullscreenChange",
		"mouseup .fullscreen-toggle": "_onFullscreenToggleClick",
	},
	
	/** @override */
	initialize: function (opts) {
		PlayableRenderer.prototype.initialize.apply(this, arguments);
		_.bindAll(this, "_onMediaEvent", "_onPollInterval", "_onFullscreenChange", "_onFullscreenToggleClick");
		// this.createChildren();
		
		_.extend(this, _logMixin);
		this._logInit();
		
		// this.listenTo(document, fullscreenChangeEvent, this._onFullscreenChange);
		
		document.addEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
		this.once("view:remove", function() {
			document.removeEventListener(fullscreenChangeEvent, this._onFullscreenChange, false);
		}, this);
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.content = this.getContentEl();
		
		this.video = this.content.querySelector("video");
		this.overlay = this.content.querySelector(".overlay");
		
		this.playToggle = this.el.querySelector(".play-toggle");
		this.fullscreenToggle = this.el.querySelector(".fullscreen-toggle");
		this.currentTimeLabel = this.el.querySelector(".current-time");
		this.durationLabel = this.el.querySelector(".duration");
		// this.overlaySymbol = this.overlay.querySelector("svg.symbol");
		
		// this.video.style.backgroundColor = this.model.attrs()["background-color"];
		this.video.loop = this.model.attrs().hasOwnProperty("@video-loop");
	},
	
	// measure: function() {
	// 	PlayableRenderer.prototype.measure.apply(this, arguments);
	// },
	
	/** @override */
	render: function () {
		var els, el, i;
		var cssX, cssY, cssW, cssH;
		
		this.measure();
		
		// crop video 1px top
		// NOTE: other elements must use video's CROPPED height 
		this.video.setAttribute("width", this.metrics.media.width);
		this.video.setAttribute("height", this.metrics.media.height);
		
		var img = this.getDefaultImage();
		img.setAttribute("width", this.metrics.media.width);
		img.setAttribute("height", this.metrics.media.height);
		
		 // NOTE: CSS: video, img.poster { margin-top: -1px }
		// this.video.style.marginTop = "-1px";
		// img.style.marginTop = "-1px";
		this.metrics.media.height -= 2;
		// this.metrics.media.width -= 2;
		
		var content = this.getContentEl();
		content.style.left = this.metrics.content.x + "px";
		content.style.top = this.metrics.content.y + "px";
		content.style.width = this.metrics.media.width + "px";
		content.style.height = this.metrics.media.height + "px";
		
		// var m = this.contentMetrics;
		// cssX = (this.metrics.content.x + m.paddingLeft + m.borderLeftWidth) + "px";
		// cssY = (this.metrics.content.y + m.paddingTop + m.borderTopWidth) + "px";
		
		// els = this.el.querySelectorAll(".content, .content-pos");
		// for (i = 0; i < els.length; i++) {
		// 	el = els.item(i);
		// 	el.style.left = cssX;
		// 	el.style.top = cssY;
		// }
		
		// content.style.width = cssW;
		// content.style.height = cssH;
		
		cssW = this.metrics.media.width + "px";
		cssH = this.metrics.media.height + "px";
		
		els = this.el.querySelectorAll(".media-size");
		for (i = 0; i < els.length; i++) {
			el = els.item(i);
			el.style.width = cssW;
			el.style.height = cssH;
		}
		
		cssW = this.metrics.content.width + "px";
		cssH = this.metrics.content.height + "px";
		
		els = this.el.querySelectorAll(".content-size");
		for (i = 0; i < els.length; i++) {
			el = els.item(i);
			el.style.width = cssW;
			el.style.height = cssH;
		}
		
		// this.fullscreenToggle.style.top = cssH;
		
		// sizing.style.maxWidth = content.offsetWidth + "px";
		// sizing.style.maxHeight = content.offsetHeight + "px";
		// sizing.style.maxWidth = content.clientWidth + "px";
		// sizing.style.maxHeight = content.clientHeight + "px";
		
		var sizing = this.getSizingEl();
		sizing.style.maxWidth = this.metrics.content.width + "px";
		sizing.style.maxHeight = this.metrics.content.height + "px";
		
		this._logRender();
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		return PlayableRenderer.whenSelectionIsContiguous(this)
		// return Promise.resolve(this)
		// 	.then(PlayableRenderer.whenSelectionIsContiguous)
			.then(PlayableRenderer.whenSelectTransitionEnds)
			// .then(
			// 	function(view) {
			// 		view.addMediaListeners();
			// 		return new Promise(function(resolve, reject) {
			// 			// view.video.setAttribute("preload", "auto");
			// 			var handleLoadStart = function(ev) {
			// 				view.video.removeEventListener("loadstart", handleLoadStart);
			// 				resolve(view);
			// 			};
			// 			view.video.addEventListener("loadstart", handleLoadStart);
			// 			view.video.preload = "auto";
			// 			view.video.innerHTML = videoSourcesTemplate(view.model.toJSON());
			// 			view.video.load();
			// 		});
			// 	})
			.then(PlayableRenderer.whenDefaultImageLoads)
			.then(
				function(view) {
					// view.video.setAttribute("preload", "auto");
					view.addMediaListeners();
					view.addSelectionListeners();
					
					view.video.preload = "auto";
					// view.video.innerHTML = videoSourcesTemplate(view.model.toJSON());
					// view.video.load();
					return view;
				})
			.then(
				function(view) {
					try {
						view.updateOverlay(view.getDefaultImage(), view.overlay);
						return view;
					} catch (err) {
						return Promise.reject(err);
					}
				})
			// .catch(
			// 	function(err) {
			// 		if (err instanceof PlayableRenderer.ViewError) {
			// 			// console.log(err.view.cid, err.view.model.cid, "VideoRenderer: " + err.message);
			// 		} else {
			// 			console.error("VideoRenderer promise error", err);
			// 		}
			// 	})
			;
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
			if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && this.video.seekable.length == 0) {
				this._logMessage("call:load", "got video data, but cannot seek, calling load()", "orange");
				console.warn(this.cid, "got video data, but cannot seek, calling load()");
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
	/* events
	/* --------------------------- */
	
	addMediaListeners: function() {
		// document.addEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		// this.video.addEventListener("error", this._onMediaEvent, true);
		for (var i = 0; i < mediaEvents.length; i++) {
			// this.video.addEventListener(mediaEvents[i], this._onMediaEvent, false);
			this.video.addEventListener(mediaEvents[i], this._onMediaEvent, true);
		}
	},
	
	removeMediaListeners: function() {
		// document.removeEventListener(visibilityChangeEvent, this._onVisibilityChange, false);
		// this.video.removeEventListener("error", this._onMediaEvent, true);
		for (var i = 0; i < mediaEvents.length; i++) {
			// this.video.removeEventListener(mediaEvents[i], this._onMediaEvent, false);
			this.video.removeEventListener(mediaEvents[i], this._onMediaEvent, true);
		}
	},
	
	// updateOverlayFromVideo: function(targetEl) {
	// 	if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
	// 		this.updateOverlay(this.video, targetEl);
	// 	}
	// },
	
	// /** @override */
	_onVisibilityChange: function(ev) {
		var stateVal = Modernizr.prefixed("visibilityState", document);
		this._logEvent("visibilityState:" + stateVal, ev.type +":"+ stateVal);
		
		PlayableRenderer.prototype._onVisibilityChange.apply(this, arguments);
		// this.togglePlayback(false);
	},
	
	_onFullscreenChange: function(ev) {
		var isOwnEv = document.fullscreenElement === this.video;
		this.video.controls = isOwnEv;
		// if (isOwnEv) {
		// 	this.video.setAttribute("controls", "controls");
		// } else {
		// 	this.video.removeAttribute("controls");
		// }
		
		this._logEvent("document.fullscreenElement: " + this.cid,
			(document.fullscreenElement? "enter:":"exit:") + ev.type);
		console.log(this.cid, "_onFullscreenChange", ev.type, ev);
	},
	
	_onFullscreenToggleClick: function (ev) {
		if (!ev.defaultPrevented && this.model.selected) {
			this._logEvent("fullscreen-toggle", ev.type);
			// console.log("click .fullscreen-toggle", prefixedEvent("fullscreenchange", this.video));
			try {
				if (document.hasOwnProperty("fullscreenElement") &&
						document.fullscreenElement !== this.video) {
							
							
					// var evtarget = document, evname = prefixedEvent("fullscreenchange", document);
							
					this.video.requestFullscreen();
				} else
				if (this.video.webkitSupportsFullscreen && !this.video.webkitDisplayingFullscreen) {
					this.video.webkitEnterFullScreen();
				}
			} catch (err) {
				// this.video.removeAttribute("controls");
				this.video.controls = false;
				console.error(err);
			}
		} 
	},
	
	_onMediaEvent: function(ev) {
		var isMediaStateEvent = stateMediaEvents.indexOf(ev.type) !== -1;
		
		if (this.video.error || this.video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
			var errmsg = [
				"networkState:", networkStateSymbols[this.video.networkState],
				"error:", (this.video.error? mediaErrorSymbols[this.video.error.code] : "null"),
			].join(" ");
			this.removeMediaListeners();
			this.removeSelectionListeners();
			this.setState("error");
			
			this._logMediaEvent(ev.type, !isMediaStateEvent);
			this._logMessage(errmsg, ev.type, "brown");
			console.error(this.cid, ev.type, errmsg);
			return;
			// throw new Error("HTMLMediaElement.NETWORK_NO_SOURCE");
		}
		
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
			// case "play":
			// 	if (this._pollIntervalID) {
			// 		console.warn(this.cid, ev.type, "_pollIntervalID is set", this._pollIntervalID);
			// 		window.clearInterval(this._pollIntervalID);
			// 	} else {
			// 		this._pollIntervalID = window.setInterval(this._onPollInterval, 500);
			// 		console.info(this.cid, ev.type, "started _pollIntervalID", this._pollIntervalID);
			// 	}
			// 	break;
			// case "pause":
			// 	if (this._pollIntervalID) {
			// 		console.info(this.cid, ev.type, "clearing _pollIntervalID", this._pollIntervalID);
			// 		window.clearInterval(this._pollIntervalID);
			// 		this._pollIntervalID = void 0;
			// 	} else {
			// 		console.warn(this.cid, ev.type, "_pollIntervalID not set");
			// 	}
			// 	break;
			case "playing":
				// this.poster.style.display = "none";
				if (this.content.classList.contains("not-played")) {
					this.content.classList.remove("not-played");
				}
				// var srcObject = Modernizr.prefixed("srcObject", this.video);
				// console.log(srcObject, this.video[srcObject]);
				// console.log(this.video.mozSrcObject);
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
			case "mozfullscreenchange":
			case "webkitfullscreenchange":
				console.log(this.cid, "_onMediaEvent", ev.type, ev);
				this.video.controls = document.fullscreenElement === this.video;
				break;
			case "fullscreenerror":
			case "mozfullscreenerror":
			case "webkitfullscreenerror":
				console.log(this.cid, "_onMediaEvent", ev.type, ev);
				this.video.controls = false;
				break;
			case "durationchange":
				this.durationLabel.textContent = this.video.duration.toFixed(0);
				break;
			case "timeupdate":
				this.currentTimeLabel.textContent = this.video.currentTime.toFixed(0);
				break;
			default:
		}
		
		this._logMediaEvent(ev.type, !isMediaStateEvent);
	},
	
	_onPollInterval: function() {
		this._logMediaEvent();
		if (!this.model.selected) console.warn(this.cid, "_onPollInterval ran on deselected model");
	},
});

/* ---------------------------
/* log to screen
/* --------------------------- */
var _logMixin = (function(){
	var _noopMixin = {
		_logInit: function(){},
		_logRender: function(){},
		_logMessage: function(){},
		_logEvent: function(){},
		_logMediaEvent: function(){},
	};
	
	if (DEBUG) {
		return {
			_logInit: function() {
				if (this._logElement === void 0) {
					var el = this.el.querySelector(".debug-log");
					if (_.isElement(el)) {
						this._logElement = el;
					} else {
						_.extend(this, _noopMixin);
					}
				}
			},
			
			_logRender: function() {
				this._logElement.style.marginTop = "3rem";
				this._logElement.style.maxHeight = "calc(100% - " + (this.metrics.media.height) + "px - 3rem)";
				this._logElement.style.width = this.metrics.media.width + "px";
				this._logElement.scrollTop = this._logElement.scrollHeight;
			},
			
			_logMessage: function(msg, type, color) {
				var logEntryEl = document.createElement("pre");
				logEntryEl.textContent = msg;
				logEntryEl.setAttribute("data-logtype", type || "-");
				if (color !== void 0) logEntryEl.style.color = color;
				this._logElement.appendChild(logEntryEl);
				this._logElement.scrollTop = this._logElement.scrollHeight;
			},
			
			_logEvent: function(msg, evtype, dim) {
				var logRepeatVal, logEntryEl = this._logElement.lastElementChild;
				if ((typeof evtype !== "string") || (logEntryEl.getAttribute("data-logtype") == evtype)) {
					logRepeatVal = parseInt(logEntryEl.getAttribute("data-logrepeat"));
					logEntryEl.setAttribute("data-logrepeat", isNaN(logRepeatVal)? 2 : ++logRepeatVal);
					logEntryEl.textContent = msg;
				} else {
					logEntryEl = document.createElement("pre");
					logEntryEl.textContent = msg;
					logEntryEl.setAttribute("data-logtype", evtype);
					logEntryEl.style.opacity = ignoredMediaEvents.indexOf(evtype) == -1? 1 : 0.3;
					this._logElement.appendChild(logEntryEl);
					this._logElement.scrollTop = this._logElement.scrollHeight;
				} 
			},
			
			_logMediaEvent: function(evType, logOnly) {
				var logStr;
				var entryDate = new Date(Date.now()),
					currTime = this.video.currentTime,
					durTime = this.video.duration,
					bRanges = this.video.buffered,
					sRanges = this.video.seekable,
					bRangeIdx = -1;
					
				if (evType === void 0 || evType == "") {
					evType = this._logElement.lastElementChild.getAttribute("data-logtype");
				}
				for (var i = 0, ii = bRanges.length; i < ii; i++) {
					if (bRanges.start(i) <= currTime && currTime <= bRanges.end(i)) {
						bRangeIdx = i;
						break;
					}
				}
				logStr = [
					(this.video.ended? ">:" : (this.video.paused? "::" : ">>")),
					entryDate.toISOString().substr(11, 12),
					lpad(currTime.toFixed(3), 7),
					lpad(durTime.toFixed(3), 7),
					lpad((bRangeIdx >= 0? bRanges.end(bRangeIdx).toFixed(3): "-"), 7),
					"b:" + bRanges.length +"[" + (bRangeIdx >= 0? bRangeIdx: "-") + "]",
					"s:" + sRanges.length,
					rpad(networkStateSymbols[this.video.networkState].substr(8), 12),//17+3
					rpad(readyStateSymbols[this.video.readyState].substr(5), 15),//17+3
					// rpad(this.video.videoWidth + "x" + this.video.videoHeight, 9),
					rpad(this._lastMediaState, 9),
				].join(" ");
				
				this._logEvent(logStr, evType, logOnly);
			},
		};
	}
	return _noopMixin;
})();
