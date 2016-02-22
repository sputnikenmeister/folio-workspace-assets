/**
* @module app/view/render/SequenceRenderer
*/

/* --------------------------- *
/* Imports
/* --------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/render/PlayableRenderer} */
var PlayableRenderer = require("app/view/render/PlayableRenderer");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");

/** @type {module:app/view/component/progress/ProgressMeter} */
var ProgressMeter = require("app/view/component/progress/ProgressMeter");

/** @type {module:utils/Timer} */
var Timer = require("utils/Timer");
/** @type {Function} */
var transitionEnd = require("utils/event/transitionEnd");
/** @type {module:utils/prefixedProperty} */
var prefixed = require("utils/prefixedProperty");

/** @type {Function} */
var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */
var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL");
/** @type {Function} */
var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");
// var whenSelectTransitionEnds = require("app/view/promise/whenSelectTransitionEnds");
// var whenDefaultImageLoads = require("app/view/promise/whenDefaultImageLoads");

// /** @type {Function} */
// var Color = require("color");
// var duotone = require("utils/canvas/bitmap/duotone");
// var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
// var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
// var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");

var errorTemplate = require("../template/ErrorBlock.hbs");

/* --------------------------- *
/* Private classes
/* --------------------------- */

// /**
// * @constructor
// * @type {module:app/view/render/SequenceRenderer.SourceCollection}
// */
// var SourceCollection = SelectableCollection.extend({
// 	model: Backbone.Model
// });

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
	initialize: function (options) {
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
		if (this._ready === ready) return;
		this._ready = !!(ready); // make bool
		this.trigger("renderer:ready", this);
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
	
	initialize: function (options) {
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
	
	render: function () {
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
	className: PlayableRenderer.prototype.className + " sequence-renderer",
	/** @type {Function} */
	template: require("./SequenceRenderer.hbs"),
	
	/* --------------------------- *
	/* initialize
	/* --------------------------- */
	
	initialize: function() {
		this.sources = this.model.get("sources");
		PlayableRenderer.prototype.initialize.apply(this, arguments);
	},
	
	initializeAsync: function() {
		return PlayableRenderer.prototype.initializeAsync.apply(this, arguments)
			.then(
				function(view) {
					return view.whenAttached();
				})
			.then(function(view) {
				view.initializePlayable();
				view.updateOverlay(view.defaultImage, view.overlay);
				view.addSelectionListeners();
				return view;
			});
	},
	
	whenInitialized: function(view) {
		var retval = PlayableRenderer.prototype.whenInitialized.apply(this, arguments);
		view._validatePlayback();
		return retval;
	},
	
	/* --------------------------- *
	/* children
	/* --------------------------- */
	
	/** @override */
	createChildren: function() {
		PlayableRenderer.prototype.createChildren.apply(this, arguments);
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.sequence = this.content.querySelector(".sequence");
		
		this.content.classList.add("started");
		
		// styles
		// ---------------------------------
		var s, attrs = this.model.get("attrs");
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
			model: this.sources.selected
		}));
	},
	
	/* --------------------------- *
	/* layout
	/* --------------------------- */
	
	/** @override */
	render: function () {
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
	
	initializePlayable: function() {
		// Sequence model
		// ---------------------------------
		// this.sources = this._createSourceCollection(this.model);
		whenSelectionDistanceIs(this, 0).then(this._preloadAllItems, function(err) {
			if (err instanceof View.ViewError) { // Ignore ViewError
				// console.warn(err.name, err.message);//, err.view.cid);
				return;
			}
			return err;
		});
		
		// timer
		// ---------------------------------
		this._sequenceInterval = parseInt(this.model.attr("@sequence-interval")) || 2500;
		
		this.timer = new Timer();
		this.listenTo(this, "view:removed", function () {
			this.timer.stop();
			this.stopListening(this.timer);
		});
		this.listenTo(this.timer, {
			"start": this._onTimerStart,
			"resume": this._onTimerResume,
			"pause": this._onTimerPause,
			"end": this._onTimerEnd,
			// "stop": function () { // stop is only called on view remove},
		});
		
		// progress-meter model
		// ---------------------------------
		this._sourceProgressByIdx = this.sources.map(function() { return 0; });
		this._sourceProgressByIdx[0] = 1; // first item is already loaded
		
		// progress-meter
		// ---------------------------------
				
		this.progressMeter = new ProgressMeter({
			values: {
				available: this._sourceProgressByIdx.concat(),
			},
			maxValues: {
				amount: this.sources.length,
				available: this.sources.length,
			},
			color: this.model.attr("color"),
			backgroundColor: this.model.attr("background-color"),
			labelFn: this._progressLabelFn.bind(this)
		});
		
		this.el.querySelector(".top-bar").appendChild(this.progressMeter.render().el);
	},
	
	_progressLabelFn: function() {
		if (this.playbackRequested === false) return Globals.PAUSE_CHAR;
		return (this.sources.selectedIndex + 1) + "/" + this.sources.length;
	},
	
	_preloadAllItems: function(view) {
		view.once("view:remove", function() {
			var silent = { silent: true };
			view.sources.forEach(function(item, index, sources) {
				var prefetched = item.get("prefetched");
				if (prefetched && /^blob\:/.test(prefetched)) {
					item.unset("prefetched", silent);
					item.set("progress", 0, silent);
					URL.revokeObjectURL(prefetched);
				}
			});
		});
		return view.sources.reduce(function(lastPromise, item, index, sources) {
			return lastPromise.then(function(view) {
				if (item.has("prefetched")) {
					view._updateItemProgress(1, index);
					return view;
				} else {
					return _loadImageAsObjectURL(item.get("original"), 
						function(progress) {
							view._updateItemProgress(progress, index);
							item.set("progress", progress);
						})
					.then(
						function(pUrl) {
							view._updateItemProgress(1, index);
							item.set({ prefetched: pUrl, progress: 1 });
							// item.set("prefetched", pUrl);
							return view;
						},
						function(err) {
							view._updateItemProgress(0, index);
							item.set({ error: err, progress: 0 });
							// item.set("error", err);
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
	// 			var itemView = view._getItemRenderer(item);
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
	
	// _getItemRenderer: function(item) {}
	
	_updateItemProgress: function(progress, index) {
		this._sourceProgressByIdx[index] = progress;
		if (this.progressMeter)
			this.progressMeter.valueTo(this._sourceProgressByIdx, 300, "available");
	},
	
	/* ---------------------------
	/* PlayableRenderer implementation
	/* --------------------------- */
	
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
		// if (this.timer.getStatus() === "paused") {
		if (this.timer.status == Timer.PAUSED) {
			this.timer.start(); // resume, actually
		} else {
			this.timer.start(this._sequenceInterval);
		}
	},
	
	/** @override */
	_pauseMedia: function() {
		if (this._paused) return;
		this._paused = true;
		// if (this.timer.getStatus() === "started") {
		if (this.timer.status == Timer.STARTED) {
			this.timer.pause();
		}
	},
	
	/* --------------------------- *
	/* sequence private
	/* --------------------------- */
	
	_onTimerStart: function(duration) {
		this.progressMeter.valueTo(this.sources.selectedIndex + 1, duration, "amount");
		// init next renderer now to have smooth transitions
		this._getItemRenderer(this.sources.followingOrFirst());
	},
	
	_onTimerResume: function(duration) {
		this.progressMeter.valueTo(this.sources.selectedIndex + 1, duration, "amount");
	},
	
	_onTimerPause: function (duration) {
		// var meterDur = this.progressMeter._valueData["amount"]._duration - this.progressMeter._valueData["amount"]._elapsedTime;
		// var meterVal = this.progressMeter.getRenderedValue("amount");
		// var timerVal = (this._sequenceInterval - duration) / this._sequenceInterval + this.sources.selectedIndex;
		// 
		// console.log("%s::_onTimerPause [interval:%sms]\n\tmeter:%s (%sms)\n\ttimer:%s (%sms)\n\tdiffs:%s (%sms)",
		// 		this.cid, this._sequenceInterval,
		// 		meterVal, meterDur,
		// 		timerVal, duration,
		// 		Math.abs(meterVal-timerVal), Math.abs(meterDur-duration));
				
		// this.progressMeter.valueTo(timerVal);
		// this.progressMeter.valueTo(meterVal);
		
		this.progressMeter.valueTo(this.progressMeter.getRenderedValue("amount"));
	},
	
	_onTimerEnd: function() {
		var context = this;
		var nextSource, nextView;
		
		nextSource = this.sources.followingOrFirst();
		// init next renderer
		nextView = this._getItemRenderer(nextSource).el;
		// init second next renderer
		// this._getItemRenderer(this.sources.followingOrFirst(nextSource));
		
		var showNextView = function() {
			context.requestAnimationFrame(function() {
				// context.content.classList.remove("waiting");
				if (!context._paused) {
				// if (context.playbackRequested) {
					context.content.classList.toggle("playback-error", nextSource.has("error"));
					context.sources.select(nextSource);// NOTE: step increase done here
					// view.updateOverlay(nextView.el, view.overlay);
					context.timer.start(context._sequenceInterval);
				}
			});
		};
		
		if (nextSource.has("prefetched") || nextSource.has("error")) {
			// nextView = context._getItemRenderer(nextSource).el;
			_whenImageLoads(nextView.el).then(showNextView, showNextView);
		} else {
			this.content.classList.add("waiting");
			this.listenTo(nextSource, "change:prefetched change:error", function() {
				this.stopListening(nextSource, "change:prefetched change:error");
				context.content.classList.remove("waiting");
				// nextView = context._getItemRenderer(nextSource).el;
				_whenImageLoads(nextView.el).then(showNextView, showNextView);
			});
		}
	},
	
	_getItemRenderer: function(item) {
		var view = this.itemViews.findByModel(item);
		if (!view) {
			var renderer = item.has("error")? SourceErrorRenderer : SequenceStepRenderer;
			view = new renderer({ model: item });
			// view = new SequenceStepRenderer({ model: item });
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
	// 	opts.x00 = isFgDark? fgColor.clone().lighten(0.33) : bgColor.clone().darken(0.33);
	// 	opts.xFF = isFgDark? bgColor.clone().lighten(0.33) : fgColor.clone().darken(0.33);
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
	
	/** @type {module:underscore.strings/lpad} */
	var lpad = require("underscore.string/lpad");
	
	return SequenceRenderer.extend({
		__logTimerEvent: function(evname, msg) {
			var logMsg = [
				"source: ", lpad(this.sources.selectedIndex, 2),
				"duration:", lpad(this.timer.getDuration(), 4),
				"paused:", this.paused,
				"requested:", this.playbackRequested,
				"status:", this.timer.getStatus(),
			];
			msg && logMsg.push(msg);
			logMsg = logMsg.join(" ");
			
			this.__logMessage(logMsg, evname);
			// console.log("%s::[%s] %s", this.cid, evname, logMsg);
		},
		_playMedia: function() {
			this.__logTimerEvent("playback");
			SequenceRenderer.prototype._playMedia.apply(this, arguments);
			// console.log("%s::_playMedia()", this.cid);
		},
		_pauseMedia: function() {
			this.__logTimerEvent("playback");
			SequenceRenderer.prototype._pauseMedia.apply(this, arguments);
			// console.log("%s::_pauseMedia()", this.cid);
		},
		
		_onTimerStart: function() {
			this.__logTimerEvent("timer:start");
			SequenceRenderer.prototype._onTimerStart.apply(this, arguments);
		},
		_onTimerResume: function() {
			this.__logTimerEvent("timer:resume");
			SequenceRenderer.prototype._onTimerStart.apply(this, arguments);
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
				this.__logMessage("idx:" + srcIdx + " progress:" + progress, "load:progress");
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
