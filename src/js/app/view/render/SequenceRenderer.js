/**
 * @module app/view/render/SequenceRenderer
 */

/* --------------------------- *
 * Imports
 * --------------------------- */

/** @type {module:backbone.babysitter} */
const Container = require("backbone.babysitter");

/** @type {module:app/view/base/View} */
const View = require("app/view/base/View");
/** @type {module:app/view/render/PlayableRenderer} */
const PlayableRenderer = require("app/view/render/PlayableRenderer");
// /** @type {module:app/model/SelectableCollection} */
// var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/control/Globals} */
const Globals = require("app/control/Globals");

/** @type {module:app/view/component/CanvasProgressMeter} */
const ProgressMeter = require("app/view/component/CanvasProgressMeter");
/** @type {module:app/view/component/PlayToggleSymbol} */
const PlayToggleSymbol = require("app/view/component/PlayToggleSymbol");

/** @type {module:utils/Timer} */
const Timer = require("utils/Timer");
// /** @type {Function} */
// var transitionEnd = require("utils/event/transitionEnd");
// /** @type {module:utils/prefixedProperty} */
// var prefixed = require("utils/prefixedProperty");

/** @type {Function} */
const _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */
const _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL");
// /** @type {Function} */
// var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");
// var whenSelectTransitionEnds = require("app/view/promise/whenSelectTransitionEnds");
// var whenDefaultImageLoads = require("app/view/promise/whenDefaultImageLoads");

// /** @type {Function} */
// var Color = require("color");
// var duotone = require("utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");

const errorTemplate = require("../template/ErrorBlock.hbs");

var MIN_STEP_INTERVAL = 2 * Globals.TRANSITION_DURATION + Globals.TRANSITION_DELAY_INTERVAL;
var DEFAULT_STEP_INTERVAL = 6 * Globals.TRANSITION_DURATION + Globals.TRANSITION_DELAY_INTERVAL;


/* --------------------------- *
 * Private classes
 * --------------------------- */

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer.PrefetechedSourceRenderer}
 */
var PrefetechedSourceRenderer = View.extend({

	cidPrefix: "sequenceStepRenderer",
	/** @type {string} */
	className: "sequence-step",
	/** @type {string} */
	tagName: "img",

	properties: {
		ready: {
			get: function() {
				return this._ready;
			}
		}
	},

	/** @override */
	initialize: function(opts) {
		!this.el.hasAttribute("alt") && this.el.setAttribute("alt", this.model.get("src"));
		// this.el.setAttribute("longdesc", this.model.get("original"));

		if (this.model.has("prefetched")) {
			this._renderPrefetched();
		} else {
			this.listenTo(this.model, "change:prefetched", this._renderPrefetched);
		}
		this.listenTo(this.model, "selected deselected", this._renderSelection);
		this._renderSelection();
	},

	_renderSelection: function() {
		this.el.classList.toggle("current", !!this.model.selected);
	},

	_renderPrefetched: function() {
		var prefetched = this.model.get("prefetched");
		if (prefetched !== this.el.src) {
			this.el.src = prefetched;
		}
		_whenImageLoads(this.el).then(
			function(el) {
				this.requestAnimationFrame(function(tstamp) {
					this._setReady(true);
				});
			}.bind(this),
			function(err) {
				// this._setReady(false);
				(err instanceof Error) || (err = new Error("cannot load prefetched url"));
				throw err;
			}.bind(this)
		);
	},

	/** @type {boolean} */
	_ready: false,

	_setReady: function(ready) {
		if (this._ready !== ready) {
			this._ready = !!(ready); // make bool
			this.trigger("renderer:ready", this);
		}
	},

	render: function() {
		// if (this.model.has("prefetched")) {
		// 	this._renderPrefetched();
		// }
		// this.el.classList.toggle("current", !!this.model.selected);
		console.log("%s::render", this.cid);
		return this;
	},
});

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer.SimpleSourceRenderer}
 */
// var SimpleSourceRenderer = View.extend({
//
// 	cidPrefix: "sequenceStepRenderer",
// 	/** @type {string} */
// 	className: "sequence-step",
// 	/** @type {string} */
// 	tagName: "img",
//
// 	/** @override */
// 	initialize: function (options) {
// 		// this.el.classList.toggle("current", this.model.hasOwnProperty("selected"));
// 		this.el.classList.toggle("current", !!this.model.selected);
// 		this.listenTo(this.model, {
// 			"selected": function () {
// 				this.el.classList.add("current");
// 			},
// 			"deselected": function () {
// 				this.el.classList.remove("current");
// 			}
// 		});
// 		if (this.el.src === "") {
// 			this.el.src = Globals.MEDIA_DIR + "/" + this.model.get("src");
// 		}
//
// 		if (this.model.has("error")) {
// 			this._onModelError();
// 		} else {
// 			this.listenToOnce(this.model, "change:error", this._onModelError);
// 			// this.listenToOnce(this.model, {
// 			// 	"change:source": this._onModelSource,
// 			// 	"change:error": this._onModelError,
// 			// });
// 		}
// 	},
//
// 	// _onModelSource: function() {
// 	// 	this.el.src = Globals.MEDIA_DIR + "/" + this.model.get("src");
// 	// 	// console.log("%s::change:src", this.cid, this.model.get("src"));
// 	// },
//
// 	_onModelError: function() {
// 		var err = this.model.get("error");
// 		var errEl = document.createElement("div");
// 		errEl.className = "error color-bg" + (this.model.selected? " current" : "");
// 		errEl.innerHTML = errorTemplate(err);
// 		this.setElement(errEl, true);
// 		console.log("%s::change:error", this.cid, err.message, err.infoSrc);
// 	},
// });

var SourceErrorRenderer = View.extend({

	/** @type {string} */
	className: "sequence-step error",
	/** @override */
	cidPrefix: "sourceErrorRenderer",
	/** @override */
	template: errorTemplate,
	/** @type {boolean} */
	ready: true,

	initialize: function(opts) {
		// var handleSelectionChange = function onSelectionChange () {
		// 	this.el.classList.toggle("current", !!this.model.selected);
		// };
		// this.listenTo(this.model, "selected deselected", handleSelectionChange);
		// // this.el.classList.toggle("current", !!this.model.selected);
		// handleSelectionChange.call(this);
		this.listenTo(this.model, "selected deselected", function() {
			this.el.classList.toggle("current", !!this.model.selected);
		});
	},

	render: function() {
		this.el.classList.toggle("current", !!this.model.selected);
		this.el.innerHTML = this.template(this.model.get("error"));
		return this;
	},
});

var SequenceStepRenderer = PrefetechedSourceRenderer;
// var SequenceStepRenderer = SimpleSourceRenderer;

/**
 * @constructor
 * @type {module:app/view/render/SequenceRenderer}
 */
var SequenceRenderer = PlayableRenderer.extend({

	/** @type {string} */
	cidPrefix: "sequenceRenderer",
	/** @type {string} */
	className: PlayableRenderer.prototype.className + " sequence-item",
	/** @type {Function} */
	template: require("./SequenceRenderer.hbs"),

	/* --------------------------- *
	/* initialize
	/* --------------------------- */

	initialize: function(opts) {
		this.sources = this.model.get("sources");
		PlayableRenderer.prototype.initialize.apply(this, arguments);
	},

	/* --------------------------- *
	 * children
	 * --------------------------- */

	/** @override */
	createChildren: function() {
		PlayableRenderer.prototype.createChildren.apply(this, arguments);

		this.placeholder = this.el.querySelector(".placeholder");
		this.sequence = this.content.querySelector(".sequence");

		// styles
		// ---------------------------------
		var s, attrs = this.model.attrs();
		// var s, attrs = this.model.get("attrs");
		s = _.pick(attrs, "box-shadow", "border", "border-radius");
		_.extend(this.content.querySelector(".media-border").style, s);
		s = _.pick(attrs, "border-radius");
		_.extend(this.sequence.style, s);
		_.extend(this.placeholder.style, s);

		// model
		// ---------------------------------
		this.sources.select(this.model.get("source"));

		// itemViews
		// ---------------------------------
		this.itemViews = new Container();
		// add default image as renderer (already in DOM)
		this.itemViews.add(new SequenceStepRenderer({
			el: this.getDefaultImage(),
			model: this.model.get("source")
		}));
	},

	/* --------------------------- *
	 * layout/render
	 * --------------------------- */

	/** @override */
	render: function() {
		PlayableRenderer.prototype.render.apply(this, arguments);

		var els, el, i, cssW, cssH;
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
		content.style.height = cssH;

		// content-position
		// ---------------------------------
		var cssX, cssY;
		cssX = this.metrics.content.x + "px";
		cssY = this.metrics.content.y + "px";
		content.style.left = cssX;
		content.style.top = cssY;

		el = this.el.querySelector(".controls");
		// el.style.left = cssX;
		// el.style.top = cssY;
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

		return this;
	},

	/* --------------------------- *
	 * initializeAsync
	 * --------------------------- */

	initializePlayable: function() {
		// model
		// ---------------------------------
		// this.sources.select(this.model.get("source"));
		this.content.classList.add("started");

		// Sequence model
		// ---------------------------------
		PlayableRenderer.whenSelectionDistanceIs(this, 0)
			// .then(function(view) {
			// 	/* defaultImage is loaded, add `started` rightaway */
			// 	view.content.classList.add("started");
			// 	return view;
			// })
			.then(this._preloadAllItems, function(err) {
				return (err instanceof View.ViewError) ? (void 0) : err; // Ignore ViewError
			});

		this._sequenceInterval = Math.max(parseInt(this.model.attr("@sequence-interval")), MIN_STEP_INTERVAL) || DEFAULT_STEP_INTERVAL;

		// timer
		// ---------------------------------
		/* timer will be started when _validatePlayback is called from _onModelSelected */
		this.timer = new Timer();
		this.listenTo(this, "view:removed", function() {
			this.timer.stop();
			this.stopListening(this.timer);
		});

		this.listenTo(this.timer, {
			"start": this._onTimerStart,
			"resume": this._onTimerResume,
			"pause": this._onTimerPause,
			"end": this._onTimerEnd,
			// "stop": function () {}, // stop is only called on view remove
		});

		// play-toggle-symbol
		// ---------------------------------
		this._playToggleSymbol = new PlayToggleSymbol(_.extend({
			el: this.el.querySelector(".play-toggle")
		}, this._playToggleSymbol || {}));

		// progress-meter model
		// ---------------------------------
		this._sourceProgressByIdx = this.sources.map(function() {
			return 0;
		});
		this._sourceProgressByIdx[0] = 1; // first item is already loaded

		// progress-meter
		// ---------------------------------
		this.progressMeter = new ProgressMeter({
			el: this.el.querySelector(".progress-meter"),
			color: this.model.attr("color"),
			// backgroundColor: this.model.attr("background-color"),
			values: {
				available: this._sourceProgressByIdx.concat(),
			},
			maxValues: {
				amount: this.sources.length,
				available: this.sources.length,
			},
			labelFn: (function() {
				if (this.playbackRequested === false) return Globals.PAUSE_CHAR;
				return (this.sources.selectedIndex + 1) + "/" + this.sources.length;
			}).bind(this)
		});
		// this.el.querySelector(".top-bar")
		//		.appendChild(this.progressMeter.render().el);
	},

	initializeAsync: function() {
		return PlayableRenderer.prototype.initializeAsync.apply(this, arguments)
			.then(
				function(view) {
					return view.whenAttached();
				})
			.then(function(view) {
				view.initializePlayable();
				// view.updateOverlay(view.defaultImage, view.playToggle); //view.overlay);
				view.listenToSelection();
				return view;
			});
	},

	whenInitialized: function(view) {
		var retval = PlayableRenderer.prototype.whenInitialized.apply(this, arguments);
		view._validatePlayback();
		return retval;
	},

	/* --------------------------- *
	 * _preloadAllItems
	 * --------------------------- */

	_preloadAllItems: function(view) {
		view.once("view:remove", function() {
			var silent = { silent: true };
			view.sources.forEach(function(item, index, sources) {
				// view.stopListening(item, "change:progress");
				var prefetched = item.get("prefetched");
				if (prefetched) {
					item.set("progress", 0, silent);
					item.unset("prefetched", silent);
					if (/^blob\:/.test(prefetched)) {
						URL.revokeObjectURL(prefetched);
					}
				}
			});
		});
		return view.sources.reduce(function(lastPromise, item, index, sources) {
			return lastPromise.then(function(view) {
				if (view._viewPhase === "disposed") {
					/** do nothing */
					return view;
				} else
				if (item.has("prefetched")) {
					view._updateItemProgress(1, index);
					return view;
				} else {
					var onItemProgress = function(item, progress) {
						view._updateItemProgress(progress, index);
					};
					view.listenTo(item, "change:progress", onItemProgress);
					view.once("view:remove", function(view) {
						view.stopListening(item, "change:progress", onItemProgress);
					});
					console.log("%s:_preloadAllItems", view.cid, item.get("original"), item.get("mime"));
					return _loadImageAsObjectURL(item.get("original"),
							function(progress, request) {
								/* NOTE: Since we are calling URL.revokeObjectURL when view is removed, also abort incomplete requests. Otherwise, clear the callback reference from XMLHttpRequest.onprogress  */
								if (view._viewPhase === "disposed") {
									//console.warn("%s::_preloadAllItems aborting XHR [%s %s] (%s)", view.cid, request.status, request.readyState, item.get("original"), request);
									request.abort();
									// request.onprogress = void 0;
								} else {
									item.set("progress", progress);
								}
							})
						.then(
							function(pUrl) {
								item.set({
									"progress": pUrl ? 1 : 0,
									"prefetched": pUrl
								});
								return view;
							},
							function(err) {
								item.set({
									"progress": 0,
									"error": err
								});
								return view;
							}
						);
				}
			});
		}, Promise.resolve(view));
	},

	// _preloadAllItems2: function(view) {
	// 	return view.sources.reduce(function(lastPromise, item, index, sources) {
	// 		return lastPromise.then(function(view) {
	// 			var itemView = view._getItemView(item);
	// 			return _whenImageLoads(itemView.el).then(function(url){
	// 				view._updateItemProgress(1, index);
	// 				return view;
	// 			}, function(err) {
	// 				view._updateItemProgress(0, index);
	// 				item.set("error", err);
	// 				return view;
	// 			});
	// 		});
	// 	}, Promise.resolve(view));
	// },

	_updateItemProgress: function(progress, index) {
		this._sourceProgressByIdx[index] = progress;
		if (this.progressMeter) {
			this.progressMeter.valueTo("available", this._sourceProgressByIdx, 300);
		}
	},

	/* ---------------------------
	 * PlayableRenderer implementation
	 * --------------------------- */

	/** @override initial value */
	_playbackRequested: true,

	/** @type {Boolean} internal store */
	_paused: true,

	/** @override */
	_isMediaPaused: function() {
		return this._paused;
	},

	/** @override */
	_playMedia: function() {
		if (!this._paused) return;
		this._paused = false;

		if (!this._isMediaWaiting()) {
			if (this.timer.status === Timer.PAUSED) {
				this.timer.start(); // resume, actually
			} else {
				this.timer.start(this._sequenceInterval);
			}
		}
	},

	/** @override */
	_pauseMedia: function() {
		if (this._paused) return;
		this._paused = true;
		if (this.timer.status === Timer.STARTED) {
			this.timer.pause();
		}
	},

	// /** @override */
	// _renderPlaybackState: function() {
	// 	// if (!this.content.classList.contains("started")) {
	// 	// 	this.content.classList.add("started");
	// 	// }
	// 	PlayableRenderer.prototype._renderPlaybackState.apply(this, arguments);
	// },

	/* --------------------------- *
	/* sequence private
	/* --------------------------- */

	_onTimerStart: function(duration) {
		var item;
		if (this.sources.selectedIndex === -1) {
			item = this.model.get("source");
		} else {
			item = this.sources.followingOrFirst();
		}
		this.sources.select(item);
		this.progressMeter.valueTo("amount", this.sources.selectedIndex + 1, duration);
		this.content.classList.toggle("playback-error", item.has("error"));

		// var currView = this.itemViews.findByModel(item);
		// if (!item.has("error") && currView !== null) {
		// 	this._playToggleSymbol.setImageSource(currView.el);
		// 	// this.updateOverlay(currView.el, this.playToggle);
		// } else {
		// 	this._playToggleSymbol.setImageSource(null);
		// }

		// // init next renderer now to have smoother transitions
		// this._getItemView(this.sources.followingOrFirst());
	},

	_onTimerResume: function(duration) {
		this.progressMeter.valueTo("amount", this.sources.selectedIndex + 1, duration);
	},

	_onTimerPause: function(duration) {
		this.progressMeter.valueTo("amount", this.progressMeter.getRenderedValue("amount"), 0);
	},

	/* last completely played sequence index */
	// _lastPlayedIndex: -1,

	_onTimerEnd: function() {
		var nextItem, nextView;

		var showNextView = function(result) {
			// console.log("%s::showNextView %sms %s", context.cid, context._sequenceInterval, nextItem.cid)
			this.setImmediate(function() {
				if (!this.mediaPaused) {
					this.timer.start(this._sequenceInterval);
				}
			});
			return result;
		}.bind(this);

		// get next item init next renderer
		nextItem = this.sources.followingOrFirst();
		nextView = this._getItemView(nextItem);

		if (nextItem.has("error")) {
			showNextView();
		} else if (nextItem.has("prefetched")) {
			_whenImageLoads(nextView.el).then(showNextView, showNextView);
		} else {
			/* TODO: add ga event 'media-waiting' */
			// window.ga("send", "event", "sequence-item", "waiting", this.model.get("text"));
			// console.log("%s:[waiting] %sms %s", context.cid, nextItem.cid);
			this._toggleWaiting(true);
			this.listenToOnce(nextItem, "change:prefetched change:error", function(model) {
				// console.log("%s:[playing] %sms %s", context.cid, nextItem.cid);
				this._toggleWaiting(false);
				_whenImageLoads(nextView.el).then(showNextView, showNextView);
			});
		}
	},

	_getItemView: function(item) {
		var view = this.itemViews.findByModel(item);
		if (!view) {
			view = new(item.has("error") ? SourceErrorRenderer : SequenceStepRenderer)({
				model: item
			});
			this.itemViews.add(view);
			this.sequence.appendChild(view.render().el);
		}
		return view;
	},

	/* --------------------------- *
	/* progress meter
	/* --------------------------- */

	// _createDefaultItemData: function() {
	// 	var canvas = document.createElement("canvas");
	// 	var context = canvas.getContext("2d");
	// 	var imageData = this._drawMediaElement(context).getImageData(0, 0, canvas.width, canvas.height);
	//
	// 	var opts = { radius: 20 };
	// 	var fgColor = new Color(this.model.attr("color"));
	// 	var bgColor = new Color(this.model.attr("background-color"));
	// 	var isFgDark = fgColor.luminosity() < bgColor.luminosity();
	// 	opts.x00 = isFgDark? Color(fgColor).lighten(0.33) : Color(bgColor).darken(0.33);
	// 	opts.xFF = isFgDark? Color(bgColor).lighten(0.33) : Color(fgColor).darken(0.33);
	//
	// 	stackBlurMono(imageData, opts);
	// 	duotone(imageData, opts);
	// 	// stackBlurRGB(imageData, opts);
	//
	// 	context.putImageData(imageData, 0, 0);
	// 	return canvas.toDataURL();
	// },
});

if (DEBUG) {
	SequenceRenderer = (function(SequenceRenderer) {
		if (!SequenceRenderer.LOG_TO_SCREEN) return SequenceRenderer;

		// /** @type {module:underscore.strings/lpad} */
		// var rpad = require("underscore.string/rpad");
		// /** @type {module:underscore.strings/lpad} */
		// var lpad = require("underscore.string/lpad");
		// /** @type {module:underscore.strings/capitalize} */
		// var caps = require("underscore.string/capitalize");

		return SequenceRenderer.extend({
			/** @override */
			initialize: function() {
				SequenceRenderer.prototype.initialize.apply(this, arguments);

				this.__logColors = _.extend({
					"media:play": "darkred",
					"media:pause": "darkred",

					"timer:start": "darkgreen",
					"timer:end": "darkgreen",
					"timer:resume": "green",
					"timer:pause": "green",

					"load:progress": "blue",
					"load:complete": "darkblue"
				}, this.__logColors);
			},

			// __getHeaderText: function() {
			// 	var fmt1 = function(s) {
			// 		return lpad(caps(s), 8).substr(0, 8).toUpperCase();
			// 	};
			// 	var fmt2 = function(s) {
			// 		return lpad(caps(s), 8).substr(0, 8).toUpperCase();
			// 	};
			// 	var o = {
			// 		"tstamp": fmt1,
			// 		"index": fmt2,
			// 		"duration": fmt1,
			// 		"playback": fmt1,
			// 		"media": fmt1,
			// 		"timer": fmt1,
			// 		"next": fmt1,
			// 	};
			// 	return Object.keys(o).map(function(s, i, a) {
			// 		return o[s](s);
			// 	}).join(" ");
			// 	// Object.keys(o).reduce(function(ss, s, i, a) {
			// 	// 	return ss + " " + lpad(caps(s), 8).substr(0, 8).toUpperCase();
			// 	// }, "");
			// },

			__getHeaderText: function() {
				return [
					"tstamp",
					"index",
					"duration",
					"playback",
					"media",
					"timer",
					"next",
				].map(function(s, i, a) {
					return s.padStart(8).substr(0, 8).toUpperCase();
				}).join(" ");
			},

			__logTimerEvent: function(evname, msg) {
				var logMsg = [
					this.sources.selectedIndex,
					(this.timer.getDuration() * .001).toFixed(3),
					this.playbackRequested ? ">>" : "::",
					this.mediaPaused ? "paused" :
					(this.mediaWaiting ? "waiting" : "playing"),
					this.timer.getStatus(),
					this.sources.followingOrFirst().has("prefetched") ? "ready" : "pending"
				].map(function(s, i, a) {
					return String(s).padStart(8).substr(0, 8).toUpperCase();
				});
				msg && logMsg.push(msg);
				logMsg = logMsg.join(" ");

				this.__logMessage(logMsg, evname);
				// console.log("%s::[%s] %s", this.cid, evname, logMsg);
			},
			_playMedia: function() {
				this.__logTimerEvent("media:play");
				SequenceRenderer.prototype._playMedia.apply(this, arguments);
				// this.__logTimerEvent("< media:play");
				// console.log("%s::_playMedia()", this.cid);
			},
			_pauseMedia: function() {
				this.__logTimerEvent("media:pause");
				SequenceRenderer.prototype._pauseMedia.apply(this, arguments);
				// this.__logTimerEvent("< media:pause");
				// console.log("%s::_pauseMedia()", this.cid);
			},

			_onTimerStart: function() {
				this.__logTimerEvent("timer:start");
				SequenceRenderer.prototype._onTimerStart.apply(this, arguments);
			},
			_onTimerResume: function() {
				this.__logTimerEvent("timer:resume");
				SequenceRenderer.prototype._onTimerResume.apply(this, arguments);
			},
			_onTimerPause: function() {
				this.__logTimerEvent("timer:pause");
				SequenceRenderer.prototype._onTimerPause.apply(this, arguments);
			},
			_onTimerEnd: function() {
				this.__logTimerEvent("timer:end");
				SequenceRenderer.prototype._onTimerEnd.apply(this, arguments);
			},

			_updateItemProgress: function(progress, srcIdx) {
				if (progress == 1) {
					this.__logTimerEvent("load:complete", "item " + srcIdx + ": complete");
				} else
				if (srcIdx === this.sources.selectedIndex) {
					this.__logTimerEvent("load:progress", "item " + srcIdx + ": " + progress);
				}
				SequenceRenderer.prototype._updateItemProgress.apply(this, arguments);
			},

			_preloadAllItems: function(view) {
				view.__logMessage(view.cid + "::_preloadAllItems", "load:start");
				SequenceRenderer.prototype._preloadAllItems.apply(view, arguments);
			},
		});
	})(SequenceRenderer);
}

module.exports = SequenceRenderer;
