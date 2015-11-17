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

/** @type {Function} */
var Color = require("color");
var duotone = require("utils/canvas/bitmap/duotone");
var stackBlurRGB = require("utils/canvas/bitmap/stackBlurRGB");
var stackBlurMono = require("utils/canvas/bitmap/stackBlurMono");
var getAverageRGBA = require("utils/canvas/bitmap/getAverageRGBA");

var errorTemplate = require("../template/ErrorBlock.hbs");

/* --------------------------- *
/* Private classes
/* --------------------------- */

/**
* @constructor
* @type {module:app/view/render/SequenceRenderer.SourceCollection}
*/
var SourceCollection = SelectableCollection.extend({
	model: Backbone.Model
});

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
	
	/** @override */
	initialize: function (options) {
		// this.el.classList.toggle("current", this.model.hasOwnProperty("selected"));
		this.el.classList.toggle("current", !!this.model.selected);
		this.listenTo(this.model, {
			"selected": function () {
				this.el.classList.add("current");
			},
			"deselected": function () {
				this.el.classList.remove("current");
			}
		});
		if (this.el.src === "") {
			if (this.model.has("prefetched")) {
				this._onModelPrefetched();
			} else if (this.model.has("error")) {
				this._onModelError();
			} else {
				this.listenToOnce(this.model, {
					"change:prefetched": this._onModelPrefetched,
					"change:error": this._onModelError,
				});
			}
		}
	},
	
	_onModelPrefetched: function() {
		this.el.src = this.model.get("prefetched");
		// console.log("%s::change:prefetched", this.cid, this.model.get("src"));
	},
	
	_onModelError: function() {
		var err = this.model.get("error");
		var errEl = document.createElement("div");
		errEl.className = "error color-bg" + (this.model.selected? " current" : "");
		errEl.innerHTML = errorTemplate(err);
		this.setElement(errEl, true);
		console.log("%s::change:error", this.cid, err.message, err.infoSrc);
	},
});

// /**
// * @constructor
// * @type {module:app/view/render/SequenceRenderer.SimpleSourceRenderer}
// */
// var SimpleSourceRenderer = View.extend({
// 	
// 	/** @type {string} */
// 	tagName: "img",
// 	/** @type {string} */
// 	className: "sequence-step",
// 	/** @override */
// 	cidPrefix: "sequenceStepRenderer",
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

// var SourceErrorRenderer = View.extend({
// 	
// 	/** @type {string} */
// 	className: "sequence-step error color-bg",
// 	/** @override */
// 	cidPrefix: "sourceErrorRenderer",
// 	/** @override */
// 	template: errorTemplate,
// 	
// 	initialize: function (options) {
// 		var handleSelectionChange = function onSelectionChange () {
// 			this.el.classList.toggle("selected", this.model.selected);
// 		};
// 		this.listenTo(this.model, "selected deselected", handleSelectionChange);
// 		handleSelectionChange.call(this);
// 	},
// 	
// 	render: function () {
// 		this.el.innerHTML = this.template(this.model.get("error"));
// 		return this;
// 	},
// });

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
	
	properties: {
		paused: {
			get: function() {
				return this._paused;
			}
		},
	},
	
	/* --------------------------- *
	/* initialize
	/* --------------------------- */
	
	_userPlaybackRequested: true,
	
	initializeAsync: function() {
		return PlayableRenderer.prototype.initializeAsync.apply(this, arguments)
			.then(function(view) {
				view.initializeSequence();
				view.updateOverlay(view.getDefaultImage(), view.overlay);
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
		this.content = this.el.querySelector(".content");
		
		var contentStyles = ["box-shadow", "border", "border-radius"];
		var placeholderStyles = ["border-radius"];
		var attrs = this.model.get("attrs");
		// for (var s in attrs) {
		// 	if (typeof attrs[s] != "string") {
		// 		continue;
		// 	}
		// 	if (contentStyles.indexOf(s) != -1) {
		// 		this.content.style[s] = attrs[s];
		// 	}
		// 	if (placeholderStyles.indexOf(s) != -1) {
		// 		this.placeholder.style[s] = attrs[s];
		// 	}
		// }
		var s, i, ii;
		for (i = 0, ii = contentStyles.length; i < ii; i++) {
			s = contentStyles[i];
			if (typeof attrs[s] == "string") {
				this.content.style[s] = attrs[s];
			}
		}
		for (i = 0, ii = placeholderStyles.length; i < ii; i++) {
			s = placeholderStyles[i];
			if (typeof attrs[s] == "string") {
				this.placeholder.style[s] = attrs[s];
			}
		}
		
		this.playToggle = this.el.querySelector(".play-toggle");
		this.sequence = this.content.querySelector(".sequence");
		this.overlay = this.content.querySelector(".overlay");
	},
	
	/* --------------------------- *
	/* layout
	/* --------------------------- */
	
	/** @override */
	render: function () {
		PlayableRenderer.prototype.render.apply(this, arguments);
		
		var els, el, i, cssW, cssH;
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
		content.style.height = cssH;
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
		
		return this;
	},
	
	initializeSequence: function() {
		// Sequence model
		// ---------------------------------
		this.sources = this._createSourceCollection(this.model);
		whenSelectionDistanceIs(this, 0).then(this._preloadAllSources);
		
		// timer
		// ---------------------------------
		this._sequenceInterval = parseInt(this.model.attrs()["@sequence-interval"]) || 2500;
		
		this.timer = new Timer();
		this.listenTo(this, "view:removed", function () {
			this.timer.stop();
		});
		this.listenTo(this.timer, {
			"start": this._onTimerStart,
			"resume": this._onTimerResume,
			"pause": this._onTimerPause,
			"end": this._onTimerEnd,
			// "stop": function () { // stop is only called on view remove},
		});
		
		// itemViews
		// ---------------------------------
		this.itemViews = new Container();
		// add default image as renderer (already in DOM)
		this.itemViews.add(new SequenceStepRenderer({
			el: this.getDefaultImage(),
			model: this.sources.selected
		}));
		// // create rest of views
		// var buffer = document.createDocumentFragment();
		// this.sources.each(function (item, index, arr) {
		// 	if (!this.itemViews.findByModel(item)) {
		// 		var view = new SequenceStepRenderer({ model: item });
		// 		this.itemViews.add(view);
		// 		buffer.appendChild(view.render().el);
		// 	}
		// }, this);
		// this.sequence.appendChild(buffer);
		
		// progress-meter
		// ---------------------------------
		this._sourceProgressByIdx = this.sources.map(function() { return 0; });
		this._sourceProgressByIdx[0] = 1; // first item is already loaded
		
		this.progressMeter = new ProgressMeter({
			values: {
				available: this._sourceProgressByIdx.concat(),
			},
			maxValues: {
				amount: this.sources.length,
				available: this.sources.length,
			},
			
			color: this.model.attrs()["color"],
			backgroundColor: this.model.attrs()["background-color"],
			
			labelFn: function() { 
				return (this.selectedIndex + 1) + "/" + this.length;
			}.bind(this.sources)
		});
		this.el.querySelector(".top-bar").appendChild(this.progressMeter.render().el);
	},
	
	_createSourceCollection: function(mediaItem) {
		var sources = new SourceCollection(mediaItem.get("srcset"));
		// bind sources[0].prefetched to this.model.prefetched
		var defaultModel = sources.at(0);
		if (mediaItem.has("prefetched")) {
			defaultModel.set("prefetched", mediaItem.get("prefetched"));
		} else {
			mediaItem.once("change:prefetched", function() {
				defaultModel.set("prefetched", mediaItem.get("prefetched"));
			});
		}
		// select it
		sources.select(defaultModel);
		// return collection
		return sources;
	},
	
	_preloadAllSources: function(view) {
		view.once("view:remove", function() {
			var opts = { silent: true };
			view.sources.forEach(function(item, index, sources) {
				var prefetched = item.get("prefetched");
				if (prefetched && /^blob\:/.test(prefetched)) {
					item.unset("prefetched", opts);
					URL.revokeObjectURL(prefetched);
				}
			});
		});
		return view.sources.reduce(function(lastPromise, item, index, sources) {
			return lastPromise.then(function(view) {
				if (item.has("prefetched")) {
					view._updateSourceProgress(1, index);
					return view;
				} else {
					var sUrl = Globals.MEDIA_DIR + "/" + item.get("src");
					return _loadImageAsObjectURL(sUrl, function(progress) {
						view._updateSourceProgress(progress, index);
					}).then(function(pUrl) {
						item.set("prefetched", pUrl);
						view._updateSourceProgress(1, index);
						view._createSourceRenderer(item);
						return view;
					}, function(err) {
						item.set("error", err);
						view._updateSourceProgress(0, index);
						view._createSourceRenderer(item);
						return view;
					});
				}
			});
		}, Promise.resolve(view));
	},
	
	// _preloadAllSources2: function(view) {
	// 	return view.sources.reduce(function(lastPromise, item, index, sources) {
	// 		return lastPromise.then(function(view) {
	// 			var itemView = view._createSourceRenderer(item);
	// 			return _whenImageLoads(itemView.el).then(function(url){
	// 				view._updateSourceProgress(1, index);
	// 				return view;
	// 			}, function(err) {
	// 				view._updateSourceProgress(0, index);
	// 				item.set("error", err);
	// 				return view;
	// 			});
	// 		});
	// 	}, Promise.resolve(view));
	// },
	
	_createSourceRenderer: function(item) {
		var view = this.itemViews.findByModel(item);
		if (!view) {
			// var renderer = item.has("error")? SourceErrorRenderer : SequenceStepRenderer;
			// view = new renderer({ model: item });
			view = new SequenceStepRenderer({ model: item });
			this.itemViews.add(view);
			this.sequence.appendChild(view.render().el);
		}
		return view;
	},
	
	_updateSourceProgress: function(progress, index) {
		this._sourceProgressByIdx[index] = progress;
		if (this.progressMeter)
			this.progressMeter.valueTo(this._sourceProgressByIdx, 300, "available");
	},
	
	/* ---------------------------
	/* PlayableRenderer overrides
	/* --------------------------- */
	
	/** @override */
	togglePlayback: function(newPlayState) {
		if (_.isBoolean(newPlayState) && newPlayState !== this._paused) {
			return; // requested state is current, do nothing
		} else {
			newPlayState = this._paused;
		}
		if (newPlayState) { // changing to what?
			this._play();
		} else {
			this._pause();
		}
	},
	
	/* --------------------------- *
	/* sequence private
	/* --------------------------- */
	
	_paused: true,
	
	_play: function() {
		if (!this._paused) return;
		this._paused = false;
		this.playbackState = "media";
		if (this.timer.getStatus() === "paused") {
			this.timer.start(); // resume, actually
		} else {
			this.timer.start(this._sequenceInterval);
		}
	},
	
	_pause: function() {
		if (this._paused) return;
		this._paused = true;
		if (this.timer.getStatus() === "started") {
			this.timer.pause();
		}
		this.playbackState = "user-resume";
	},
	
	_onTimerEnd: function() {
		var nextModel = this.sources.followingOrFirst();
		var nextView = this.itemViews.findByModel(nextModel);
		
		var showNextStep = function() {
			if (this.paused) {
				this.playbackState = "user-resume";
			} else {
				this.sources.select(nextModel);// NOTE: step increase done here
				// view.updateOverlay(nextView.el, view.overlay);
				this.timer.start(this._sequenceInterval);
				this.playbackState = "media";
			}
		};
		
		if (nextModel.has("prefetched") || nextModel.has("error")) {
			showNextStep.call(this);
		} else {
			this.playbackState = "network";
			this.listenTo(nextModel, "change:prefetched change:error", showNextStep);
		}
		
		// if (nextView.el.complete || nextModel.has("error")) {
		// 	showNextStep.call(this);
		// } else {
		// 	this.playbackState = "network";
		// 	_whenImageLoads(nextView.el).then(showNextStep.bind(this));
		// }
	},
	
	_onTimerStart: function(duration) {
		this.progressMeter.valueTo(this.sources.selectedIndex + 1, duration, "amount");
	},
	
	_onTimerResume: function(duration) {
		this.progressMeter.valueTo(this.sources.selectedIndex + 1, duration, "amount");
	},
	
	_onTimerPause: function () {
		this.progressMeter.valueTo(this.progressMeter.getRenderedValue("amount"));
	},
	
	/* --------------------------- *
	/* progress meter
	/* --------------------------- */
	
	// _createDefaultSourceData: function() {
	// 	var canvas = document.createElement("canvas");
	// 	var context = canvas.getContext("2d");
	// 	var imageData = this._drawMediaElement(context).getImageData(0, 0, canvas.width, canvas.height);
	// 	
	// 	var opts = { radius: 20 };
	// 	var fgColor = new Color(this.model.attrs()["color"]);
	// 	var bgColor = new Color(this.model.attrs()["background-color"]);
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
	/** @type {module:underscore.strings/lpad} */
	var lpad = require("underscore.string/lpad");
	
	return SequenceRenderer.extend({
		__logTimerEvent: function(evname, msg) {
			var logMsg = [
				"source: ", lpad(this.sources.selectedIndex, 2),
				"duration:", lpad(this.timer.getDuration(), 4),
				"status:", this.timer.getStatus()
			];
			msg && logMsg.push(msg);
			logMsg = logMsg.join(" ");
			
			this.__logMessage(logMsg, evname);
			console.log("%s::[%s] %s", this.cid, evname, logMsg);
		},
		_play: function() {
			this.__logTimerEvent("playback");
			SequenceRenderer.prototype._play.apply(this, arguments);
			console.log("%s::_play()", this.cid);
		},
		_pause: function() {
			this.__logTimerEvent("playback");
			SequenceRenderer.prototype._pause.apply(this, arguments);
			console.log("%s::_pause()", this.cid);
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
		
		_updateSourceProgress: function(progress, srcIdx) {
			if (progress == 1) {
				this.__logMessage("idx:" + srcIdx + " progress:" + progress, "load:progress");
			}
			SequenceRenderer.prototype._updateSourceProgress.apply(this, arguments);
		},
		
		_preloadAllSources: function(view) {
			view.__logMessage(view.cid + "::_preloadAllSources", "load:start");
			SequenceRenderer.prototype._preloadAllSources.apply(view, arguments);
		},
	});
})(SequenceRenderer);
}

module.exports = SequenceRenderer;
