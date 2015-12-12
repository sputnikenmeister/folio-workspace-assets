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
* @type {module:app/view/render/SequenceRenderer.SequenceStepRenderer}
*/
var SequenceStepRenderer = View.extend({
	
	cidPrefix: "sequenceStepRenderer",
	/** @type {string} */
	className: "sequence-step",
	/** @type {string} */
	tagName: "img",
	
	/** @override */
	initialize: function (options) {
		this.el.classList.toggle("current", this.model.hasOwnProperty("selected"));
		this.listenTo(this.model, {
			"selected": function () {
				this.el.classList.add("current");
			},
			"deselected": function () {
				this.el.classList.remove("current");
			}
		});
		var view = this;
		// whenSelectionDistanceIs(this, 1).then(function(view) {
			if (view.el.src === "") {
				if (view.model.has("prefetched")) {
					view._onModelPrefetched();
				} else if (view.model.has("error")) {
					view._onModelError();
				} else {
					view.listenToOnce(view.model, {
						"change:prefetched": view._onModelPrefetched,
						"change:error": view._onModelError,
					});
				}
				// view.el.src = Globals.MEDIA_DIR + "/" + view.model.get("src");
			}
		// }, function(err) {
		// 	console.log("%s::whenSelectionDistanceIs [rejected]", err.view.cid, err.name, err.message);
		// });
	},
	
	_onModelPrefetched: function() {
		this.el.src = this.model.get("prefetched");
		console.log("%s::change:prefetched", this.cid, this.model.get("prefetched"));
	},
	
	_onModelError: function() {
		var err = this.model.get("error");
		
		var errEl = document.createElement("div");
		errEl.className = "error color-bg" + (this.model.selected? " current" : "");
		errEl.innerHTML = errorTemplate(err);
		this.setElement(errEl, true);
		
		console.log("%s::change:error", this.cid, err.message, err.infoSrc);
	},
	
	// whenMediaIsReady: function() {
	// 	return 
	// },
});

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
	
	// /** @override */
	// initialize: function (opts) {
	// 	PlayableRenderer.prototype.initialize.apply(this, arguments);
	// 	
	// 	// var autoplay = _.once(function() {
	// 	// 	this._validatePlayback();
	// 	// }.bind(this));
	// 	
	// 	// if (!this.model.selected) {
	// 	// 	this.listenToOnce(this.model, "selected", function(model) {
	// 	// 		if (this.parentView.scrolling) {
	// 	// 			this.listenToOnce(this.parentView, "view:scrollend", function() {
	// 	// 				this._validatePlayback();
	// 	// 			});
	// 	// 		} else {
	// 	// 			this._validatePlayback();
	// 	// 		}
	// 	// 	});
	// 	// } else {
	// 	// 	this._validatePlayback();
	// 	// }
	// },
	
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
	
	_playbackRequested: true,
	
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
		
		// var opts = { silent: true };
		// var srcset = this.model.get("srcset");
		// var defaultSrc = _.pick(this.model.attributes, ["src"]);
		// 
		// this.sources = new SourceCollection();
		// // if not in srcset, create a model for defaultImage
		// if (!_.some(srcset, _.matcher(defaultSrc))) {
		// 	this.sources.add(defaultSrc, opts);
		// }
		// this.sources.add(srcset, opts);
		// this.sources.selectAt(0);// select it
		
		// this.sources = this.model.getSources();
		this.sources = this._createSourceCollection(this.model);
		this.listenTo(this.sources, {
			"select:one": function(model) {
				
			},
			"deselect:one": function(model) {
				
			}
		});
		
		whenSelectionDistanceIs(this, 0)
			.then(this._preloadAllSources)
			.then(function() {
				console.log("%s::_preloadAllSources resolved", this.cid);
				// console.log("%s::_preloadAllSources", JSON.stringify(this._mediaProgress));
			}.bind(this))
			// .catch(function(err) {
			// 	console.error("%s::_preloadAllSources rejected", this.cid, JSON.stringify(err));
			// 	console.log("%s::_preloadAllSources", JSON.stringify(this._mediaProgress));
			// }.bind(this))
			;
		
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
		// create rest of views
		var buffer = document.createDocumentFragment();
		this.sources.each(function (item, index, arr) {
			if (!this.itemViews.findByModel(item)) {
				var view = new SequenceStepRenderer({ model: item });
				this.itemViews.add(view);
				buffer.appendChild(view.render().el);
			}
		}, this);
		this.sequence.appendChild(buffer);
		
		// progress-meter
		// ---------------------------------
		// var progressEl;
		// if (progressEl = this.el.querySelector("canvas.progress-meter")) {
		this.progressMeter = new ProgressMeter({
			available: this.sources.length,
			total: this.sources.length,
			steps: this.sources.length,
			// color: this.model.attrs()["color"],
			// labelFn: function(i, t, s) { return (((i/t)*s) | 0) + 1; },
			// labelFn: function(i, t, s) { return ((((i/t)*s) | 0) + 1) +"/"+s; },
			labelFn: function(val) { 
				return (this.selectedIndex + 1) + "/" + this.length;
			}.bind(this.sources)
		});
		this.el.querySelector(".top-bar").appendChild(this.progressMeter.render().el);
	},
	
	_createSourceCollection: function(mediaItem) {
		var opts = { silent: true };
		var srcset = mediaItem.get("srcset");
		var sources = new SourceCollection();
		var defaultSrc = _.pick(mediaItem.attributes, ["src"]);
		var defaultModel;
		// if not in srcset, create a model for defaultImage
		if (!_.some(srcset, _.matcher(defaultSrc))) {
			sources.add(defaultSrc, opts);
		}
		sources.add(srcset, opts);
		// sources[0].prefetched is bound to this.prefetched
		defaultModel = sources.at(0);
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
	
	/* ---------------------------
	/* PlayableRenderer overrides
	/* --------------------------- */
	
	/** @override */
	// _onModelSelected: function() {
	// 	this.togglePlayback(true);
	// 	return PlayableRenderer.prototype._onModelSelected.apply(this, arguments);
	// 	// this.content.addEventListener("click", this._onContentClick, false);
	// 	// this.listenTo(this, "view:removed", this._removeClickHandler);
	// },
	
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
			// this.listenToOnce(this.timer, "end", this._onTimerEnd);
			this.timer.start(this._sequenceInterval);
			// this._startSequenceStep();
		}
		console.log("%s::_play()", this.cid);
	},
	
	_pause: function() {
		if (this._paused) return;
		
		this._paused = true;
		if (this.timer.getStatus() === "started") {
			this.timer.pause();
		}
		this.playbackState = "user-resume";
		console.log("%s::_pause()", this.cid);
	},
	
	_onTimerEnd: function() {
		var view = this;
		var logSeq = function (name, msg) {
			console.log("%s::%s [%s] idx: %i dur: %ims [%s]", view.cid, name,
				view.timer.getStatus(),
				view.sources.selectedIndex,
				view.timer.getDuration(),
				msg
			);
		};
		logSeq("_onTimerEnd", "step ended");
		
		var nextModel = view.sources.followingOrFirst();
		
		var showNextStep = function() {
			if (view.paused) {
				view.playbackState = "user-resume";
			} else {
				view.sources.select(nextModel);// NOTE: step increase done here
				// view.updateOverlay(view.itemViews.findByModel(nextModel).el, view.overlay);
				view.timer.start(view._sequenceInterval);
				view.playbackState = "media";
			}
		};
		var nextModelHandlers = {
			"change:prefetched": showNextStep,
			"change:error": showNextStep
		};
		
		if (nextModel.has("prefetched")) {
			nextModelHandlers["change:prefetched"].call(this);
		} else if (nextModel.has("error")) {
			nextModelHandlers["change:error"].call(this);
		} else {
			this.playbackState = "network";
			this.listenToOnce(nextModel, nextModelHandlers);
			// nextModel.once("change:prefetched change:error", showNextStep);
		}
		
		// var nextView = view.itemViews.findByModel(nextModel);
		// if (!nextView.el.complete || nextView.el.src !== "") {
		// 	this.playbackState = "network";
		// }
		// _whenImageLoads(nextView.el).then(showNextStep);
		
	},
	
	_onTimerStart: function(duration) {
		this.progressMeter.valueTo(this.sources.selectedIndex + 1, duration);
	},
	
	_onTimerResume: function(duration) {
		// var delta = this.timer.getDuration() / this._sequenceInterval;
		this.progressMeter.valueTo(this.sources.selectedIndex + 1, duration);
	},
	
	_onTimerPause: function () {
		// var delta = this.timer.getDuration() / this._sequenceInterval;
		this.progressMeter.valueTo(this.progressMeter.renderedValue);
	},
	
	/* --------------------------- *
	/* sequence promises
	/* --------------------------- */
	
	whenNextImageLoads: function(view) {
		var nextModel = view.sources.followingOrFirst();
		var nextView = view.itemViews.findByModel(nextModel);
		return _whenImageLoads(nextView.el);
	},
	
	whenCurrentTimerEnds: function(view) {
		return new Promise(function(resolve, reject) {
			view.timer.once("stop end", function() {
				resolve(view);
			});
		});
	},
	
	whenNextStepIsReady: function(view) {
		return Promise.all([
			view.whenNextImageLoads(view),
			view.whenCurrentTimerEnds(view)
		]);
	},
	
	/* --------------------------- *
	/* progress meter
	/* --------------------------- */
	
	_updateAllSourcesProgress: function(progress, sUrl) {
		this._mediaProgress || (this._mediaProgress = {});
		this._mediaProgress[sUrl] = progress;
		
		var sum = 0;
		for (var url in this._mediaProgress) {
			sum += this._mediaProgress[url];
		}
		if (this.progressMeter)
			this.progressMeter.valueTo(sum, 300, "available");
	},
	
	_preloadAllSources: function(view) {
		view.once("view:remove", function(){
			view.sources.forEach(function(o, i, a) {
				if (o.has("prefetched")) {
					URL.revokeObjectURL(o.get("prefetched"));
				}
			});
		});
		return view.sources.reduce(function(p, o) {
			// return new Promise(function(resolve, reject) { });
			return p.then(function(view) {
				var sUrl = Globals.MEDIA_DIR + "/" + o.get("src");
				if (o.has("prefetched")) {
					// console.log("%s::_preloadAllSources resolve-sync %s -> %s", view.cid, sUrl, o.get("prefetched"));
					view._updateAllSourcesProgress(1, sUrl);
					return view;
				} else {
					return _loadImageAsObjectURL(sUrl, function(progress) {
						view._updateAllSourcesProgress(progress, sUrl);
					}).then(function(pUrl) {
						// console.log("%s::_preloadAllSources resolve-async %s -> %s", view.cid, sUrl, pUrl);
						view._updateAllSourcesProgress(1, sUrl);
						o.set("prefetched", pUrl);
						return view;
					}, function(err) {
						// console.warn("%s::_preloadAllSources reject-async %s ERR: %s", view.cid, sUrl, err.message);
						view._updateAllSourcesProgress(1, sUrl);
						o.set("error", err);
						return view;
					});
				}
			});
		}, Promise.resolve(view));
	},
});

if (DEBUG) {
	
SequenceRenderer = (function(SequenceRenderer) {
	return SequenceRenderer.extend({
		__logTimerEvent: function(evname, msg) {
			var logMsg = [
				"status:", this.timer.getStatus(),
				"idx:", this.sources.selectedIndex,
				"dur:", this.timer.getDuration()
			];
			msg && logMsg.push(msg);
			this.__logMessage(logMsg.join(" "), evname);
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
	});
})(SequenceRenderer);

}

module.exports = SequenceRenderer;
