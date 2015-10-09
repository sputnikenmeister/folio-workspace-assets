/**
 * @module app/view/render/SequenceRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/render/PlayableRenderer} */
var PlayableRenderer = require("app/view/render/PlayableRenderer");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/view/component/CircleProgressMeter} */
var ProgressMeter = require("app/view/component/CircleProgressMeter");

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


/** @type {module:utils/Timer} */
var Timer = require("utils/Timer");

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
	tagName: "img",
	/** @type {string} */
	className: "sequence-step",
	// /** @type {Object|Function} */
	attributes: function() {
		return { src: "" };//Globals.MEDIA_DIR + "/" + this.model.get("src") };
	},
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
		// PlayableRenderer.whenSelectionIsContiguous(this).then(function(view) {
		whenSelectionDistanceIs(this, 2).then(function(view) {
			view.el.src = Globals.MEDIA_DIR + "/" + view.model.get("src");
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
	
	/** @override */
	initialize: function (opts) {
		PlayableRenderer.prototype.initialize.apply(this, arguments);
	},
	
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
	
	initializeSequence: function() {
		//
		// Sequence model
		//
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
		
		//
		// Sequence child views
		//
		this.children = new Container();
		// add default image as renderer (already in DOM)
		this.children.add(new SequenceStepRenderer({
			el: this.getDefaultImage(),
			model: this.sources.selected
		}));
		// create rest of views
		var buffer = document.createDocumentFragment();
		this.sources.each(function (item, index, arr) {
			if (!this.children.findByModel(item)) {
				var view = new SequenceStepRenderer({ model: item });
				this.children.add(view);
				buffer.appendChild(view.render().el);
			}
		}, this);
		this.sequence.appendChild(buffer);
		
		this.progressMeter = this.createProgressMeter();
		
		//
		// Sequence timer and listeners
		//
		this.timer = new Timer();
		this.listenTo(this, "view:remove", function () {
			this.timer.stop();
		});
		this.listenTo(this.timer, {
			"start": this._onTimerStart,
			"pause": this._onTimerPause,
			"end": this._onTimerEnd,
			// "stop": function () { // stop is only called on view remove},
		});
		this.listenTo(this.sources, "select:one", function () {
			this.updateProgressLabel(this.sources.selectedIndex);
		});
		
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		return PlayableRenderer.prototype.initializeAsync.apply(this, arguments)
			.then(function(view) {
				view.initializeSequence();
				view.addSelectionListeners();
				try {
					view.updateOverlay(view.getDefaultImage(), view.overlay);
					return view;
				} catch (err) {
					return Promise.reject(err);
				}
			});
	},
	
	/* --------------------------- *
	/* layout
	/* --------------------------- */
	
	/** @override */
	render: function () {
		PlayableRenderer.prototype.render.apply(this, arguments);
		// this.measure();
		
		// NOTE: image elements are given 100% w/h in CSS (.sequence-renderer .content img);
		// actual dimensions are set to the parent element (.sequence-renderer .content)
		// this.image.setAttribute("width", cW);
		// this.image.setAttribute("height", cH);
		
		var content = this.getContentEl();
		content.style.left = this.metrics.content.x + "px";
		content.style.top = this.metrics.content.y + "px";
		this.sequence.style.width = content.style.width = this.metrics.media.width + "px";
		this.sequence.style.height = content.style.height = this.metrics.media.height + "px";
		this.overlay.style.width = this.metrics.media.width + "px";
		this.overlay.style.height = this.metrics.media.height + "px";
		
		// sizing.style.maxWidth = content.offsetWidth + "px";
		// sizing.style.maxHeight = content.offsetHeight + "px";
		// sizing.style.maxWidth = content.clientWidth + "px";
		// sizing.style.maxHeight = content.clientHeight + "px";
		
		// var sizing = this.getSizingEl();
		// sizing.style.maxWidth = this.metrics.content.width + "px";
		// sizing.style.maxHeight = this.metrics.content.height + "px";
		
		return this;
	},
	
	/* ---------------------------
	/* PlayableRenderer overrides
	/* --------------------------- */
	
	// /** @override */
	// _onModelSelected: function() {
	// 	// this.togglePlayback(true);
	// 	return PlayableRenderer.prototype._onModelSelected.apply(this, arguments);
	// 	// this.content.addEventListener("click", this._onContentClick, false);
	// 	// this.listenTo(this, "view:remove", this._removeClickHandler);
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
			
			this.setPlaybackState("media");
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
			this.setPlaybackState("user-resume");
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
		var nextView = view.children.findByModel(nextModel);
		// this.setPlaybackState("network");
		_whenImageLoads(nextView.el).then(function() {
			if (view._isSequenceRunning) {
				logSeq("_whenImageLoads (calling next step)");
				// NOTE: step increase done here
				view.sources.select(nextModel);
				view.updateOverlay(nextView.el, view.overlay);
				view.timer.start(view._sequenceInterval);
			} else {
				logSeq("_whenImageLoads (sequence not running)");
			}
		});
	},
	
	_onTimerStart: function() {
		var delta = this.timer.getDuration() / this._sequenceInterval;
		this.updateProgress(
			this.sources.selectedIndex + (1 - delta),
			delta, this.timer.getDuration());
	},
	
	_onTimerPause: function () {
		var delta = this.timer.getDuration() / this._sequenceInterval;
		this.updateProgress(
			this.sources.selectedIndex + (1 - delta),
			0, 0);
	},
	
	/* --------------------------- *
	/* progress meter
	/* --------------------------- */
	
	createProgressMeter: function() {
		var view = new ProgressMeter({
			value: 0,
			total: this.sources.length
		});
		this.content.appendChild(view.render().el);
		return view;
	},
	
	updateProgressLabel: function(value) {
		this.progressMeter.labelEl.textContent = (value | 0) + 1;
	},
	
	updateProgress: function(valueFrom, valueDelta, duration) {
		var valueTo = valueFrom + valueDelta;
		var meter = this.progressMeter;
		var shape = this.progressMeter.amountShape;
		
		if (duration > 0) {
			var transitionFn = function(ev) {
				shape.removeEventListener(transitionEnd, transitionFn, false);
				meter.valueTo(valueTo, duration * 0.9);
			};
			shape.addEventListener(transitionEnd, transitionFn, false);
			meter.valueTo(valueFrom + 0.00001, 1);
		} else {
			meter.valueTo(valueTo);
		}
	},
});

module.exports = SequenceRenderer;
