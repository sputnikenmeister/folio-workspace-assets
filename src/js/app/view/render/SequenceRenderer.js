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

/** @type {module:app/view/component/progress/CanvasProgressMeter} */
// var ProgressMeter = require("app/view/component/progress/CanvasProgressMeter");
/** @type {module:app/view/component/progress/SVGPathProgressMeter} */
var ProgressMeter = require("app/view/component/progress/SVGPathProgressMeter");
/** @type {module:app/view/component/progress/SVGCircleProgressMeter} */
// var ProgressMeter = require("app/view/component/progress/SVGCircleProgressMeter");

/** @type {module:utils/Timer} */
var Timer = require("utils/Timer");
/** @type {Function} */
var transitionEnd = require("utils/event/transitionEnd");
/** @type {module:utils/prefixedProperty} */
var prefixed = require("utils/prefixedProperty");
/** @type {Function} */
var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {Function} */
var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");
// var whenSelectTransitionEnds = require("app/view/promise/whenSelectTransitionEnds");
// var whenDefaultImageLoads = require("app/view/promise/whenDefaultImageLoads");

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
		whenSelectionDistanceIs(this, 1).then(function(view) {
			if (view.el.src === "")
				view.el.src = Globals.MEDIA_DIR + "/" + view.model.get("src");
		}, function(err) {
			console.log("%s::whenSelectionDistanceIs [rejected]", err.view.cid, err.name, err.message);
		});
	},
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
	// 	
	// 	// var p = Promise.resolve(this);
	// 	// p = p.then(function(view) {
	// 	// 	console.warn("SEQUENCE INIT SYNC 1", view.cid);
	// 	// 	return view;
	// 	// });
	// 	// p = p.then(function(view) {
	// 	// 	console.warn("SEQUENCE INIT SYNC 2", view.cid);
	// 	// 	return view;
	// 	// });
	// 	// this._initChain = this._initChain.then(function(view) {
	// 	// 	console.warn("SEQUENCE INIT CHAIN", view.cid);
	// 	// 	return view;
	// 	// });
	// },
	
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
		this._isSequenceRunning = false;
		this._sequenceInterval = parseInt(this.model.attrs()["@sequence-interval"]) || 2500;
		
		var opts = { silent: true };
		var srcset = this.model.get("srcset");
		var defaultSrc = _.pick(this.model.attributes, ["src"]);
		
		this.sources = new SourceCollection();
		// if not in srcset, create a model for defaultImage
		if (!_.some(srcset, _.matcher(defaultSrc))) {
			this.sources.add(defaultSrc, opts);
		}
		this.sources.add(srcset, opts);
		this.sources.selectAt(0);// select it
		
		// Sequence child views
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
		
		// this._progressFormatter = function(val) { return this.sources.selectedIndex + 1; }.bind(this);
		// this._progressFormatter = function(i, t, s) { return (((i/t)*s) | 0) + 1; };
		this._progressFormatter = function(i, t, s) { return ((((i/t)*s) | 0) + 1) +"/"+s; };
		
		// var progressEl;
		// if (progressEl = this.el.querySelector("canvas.progress-meter")) {
		this.progressMeter = new ProgressMeter({
			total: this.sources.length,
			steps: this.sources.length,
			// color: this.model.attrs()["color"],
			labelFn: this._progressFormatter
		});
		this.el.querySelector(".top-bar").appendChild(this.progressMeter.render().el);
		
		// Sequence timer and listeners
		// ---------------------------------
		this.timer = new Timer();
		this.listenTo(this, "view:removed", function () {
			this.timer.stop();
		});
		this.listenTo(this.timer, {
			"start": this._onTimerStart,
			"pause": this._onTimerPause,
			"end": this._onTimerEnd,
			// "stop": function () { // stop is only called on view remove},
		});
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
		if (_.isBoolean(newPlayState) && newPlayState === this.isSequenceRunning()) {
			return; // requested state is current, do nothing
		} else {
			newPlayState = !this.isSequenceRunning();
		}
		if (newPlayState) { // changing to what?
			this.startSequence();
		} else {
			this.stopSequence();
		}
	},
	
	/* --------------------------- *
	/* sequence private
	/* --------------------------- */
	
	isSequenceRunning: function() {
		return this._isSequenceRunning;
	},
	
	startSequence: function() {
		if (!this._isSequenceRunning) {
			this._isSequenceRunning = true;
			
			this.playbackState = "media";
			if (this.timer.getStatus() === "paused") {
				this.timer.start(); // resume, actually
			} else {
				// this.listenToOnce(this.timer, "end", this._onTimerEnd);
				this.timer.start(this._sequenceInterval);
				// this._startSequenceStep();
			}
			console.log("(%s) SequenceRenderer.startSequence", this.cid);
		}
	},
	
	stopSequence: function() {
		if (this._isSequenceRunning) {
			this._isSequenceRunning = false;
			if (this.timer.getStatus() === "started") {
				this.timer.pause();
			}
			this.playbackState = "user-resume";
			console.log("(%s) SequenceRenderer.stopSequence", this.cid);
		}
	},
	
	_onTimerEnd: function() {
		var view = this;
		var logSeq = function () {
			console.log("(%s) SequenceRenderer::step(%i)::%s[%i] %s",
				view.cid, view.sources.selectedIndex, view.timer.getStatus(), view.timer.getDuration(),
				Array.prototype.join.call(arguments, " "));
		};
		logSeq("_onTimerEnd (calling next step)");
		
		var nextModel = view.sources.followingOrFirst();
		var nextView = view.itemViews.findByModel(nextModel);
		if (!nextView.el.complete) {
			this.playbackState = "network";
		}
		_whenImageLoads(nextView.el).then(function() {
			if (view._isSequenceRunning) {
				// window.requestAnimationFrame(function() {
					logSeq("_whenImageLoads (calling next step)");
					// NOTE: step increase done here
					view.sources.select(nextModel);
					
					view.updateOverlay(nextView.el, view.overlay);
					view.timer.start(view._sequenceInterval);
					view.playbackState = "media";
				// });
			} else {
				logSeq("_whenImageLoads (sequence not running)");
				view.playbackState = "user-resume";
			}
		});
	},
	
	_onTimerStart: function() {
		// var delta = this.timer.getDuration() / this._sequenceInterval;
		this.progressMeter.valueTo(this.sources.selectedIndex + 1, this.timer.getDuration());
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
});

module.exports = SequenceRenderer;
