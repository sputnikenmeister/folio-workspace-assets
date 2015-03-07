/**
 * @module app/view/component/Carousel
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/helper/View} */
var View = require("../../helper/View");
/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require("../../helper/DeferredRenderView");

/** @type {module:app/view/render/CarouselDefaultRenderer} */
var CarouselDefaultRenderer = require("../render/CarouselDefaultRenderer");
/** @type {module:app/view/render/CarouselEmptyRenderer} */
var CarouselEmptyRenderer = require("../render/CarouselEmptyRenderer");

var traceDirection = function (dir) {
	switch (dir) {
		case 1: 	return "DIRECTION_NONE  (1)";
		case 2: 	return "DIRECTION_LEFT  (2)";
		case 4: 	return "DIRECTION_RIGHT (4)";
		case 8: 	return "DIRECTION_UP    (8)";
		case 16:	return "DIRECTION_DOWN (16)";
	}
};

/**
 * @constructor
 * @type {module:app/view/component/Carousel}
 */
var Carousel = DeferredRenderView.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel skip-transitions",
	/** @type {int} In pixels */
	tapAreaGrow: 50,
	/** @type {int} In pixels */
	selectThreshold: 40,
	/** @type {int} In pixels */
	panThreshold: 15,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,
	/** @type {Function} */
	renderer: CarouselDefaultRenderer,
	/** @type {Function} */
	emptyRenderer: CarouselEmptyRenderer,

	/** @override */
	initialize: function (options) {
		if (options.hammer) {
			this.hammer = options.hammer;
			this.direction = options.hammer.get("pan").direction || options.direction || this.direction;
		} else {
			(options.direction === Carousel.DIRECTION_VERTICAL) && (this.direction = Carousel.DIRECTION_VERTICAL);
			this.hammer = this.createHammer();
		}

		options.template && (this.template = options.template);
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);

//		_.isNumber(options.gap) && (this.gap = options.gap);
		this.childGap = this.dirProp(20, 18);
		this.metrics = {};
		this.children = new Container();

		_.bindAll(this, "_createChildren", "_measure", "_onTouch");//, "_onScrollTransitionEnd");
		this.hammer.on("panstart panmove panend pancancel tap", this._onTouch);

		this.listenTo(this.collection, {
			"select:one": this._onSelectionChange,
			"select:none": this._onSelectionChange,
			"reset": this._onCollectionReset,
//			"select:one": this._onSelectOne,
//			"select:none": this._onSelectNone,
//			"deselect:one": this._onDeselectOne,
//			"deselect:none": this._onDeselectNone,
		});
		this.listenTo(this.collection, "select:one select:none", this._onSelectionChange);

//		this.skipTransitions = true;
		this.createChildrenNow();
//		if (this.el.parentElement) {
//			this.createChildrenNow();
//		} else {
//			this.createChildrenLater();
//		}
	},

	remove: function () {
		this.hammer.off("panstart panmove panend pancancel tap", this._onTouch);
		this.removeChildren();
		DeferredRenderView.prototype.remove.apply(this);
	},

	createHammer: function() {
		var hammer, hammerPan, hammerTap;
		hammer = new Hammer.Manager(this.el);
		hammerPan = new Hammer.Pan({
			direction: this.direction,
			threshold: this.panThreshold,
		});
		hammerTap = new Hammer.Tap({
			threshold: this.panThreshold / 2,
			interval: 50, time: 200
		});
		hammerTap.requireFailure(hammerPan);
		hammer.add([hammerPan, hammerTap]);
		this.on("view:remove", hammer.destroy, hammer);
		return hammer;
	},

	/* --------------------------- *
	 * Create children
	 * --------------------------- */

	createChildrenNow: function () {
		this._createChildren();
	},

	createChildrenLater: function () {
		this.requestRender("createChildren", this._createChildren);
	},

	_createChildren: function () {
		var buffer;
		var sel = this.collection.selectedIndex;
		this.removeChildren();
		if (this.collection.length) {
			buffer = document.createDocumentFragment();
			buffer.appendChild(this.createEmptyView().el);
			this.collection.each(function (item, index, arr) {
				buffer.appendChild(this.createChildView(this.renderer, {model: item}, index, sel).el);
			}, this);
//			this.$el.prepend(buffer);
			this.$el.append(buffer);
		}
		this.updateSelection();
	},

	createEmptyView: function () {
		return this.emptyView = this.createChildView(this.emptyRenderer,
				_.pick(this, Carousel.EMPTY_VIEW_OPTS), -1, this.collection.selectedIndex);
	},

	createChildView: function (renderer, opts, index, sel) {
		var view = new renderer(opts);
		this.children.add(view);
//		var d = index - sel;
//		switch (d) {
//			case  0:
//				this.selectedView = view;
//				view.$el.addClass("selected");
//				break;
//			case -1:
//				this.precedingView = view;
////				view.$el.addClass("preceding");
//				break;
//			case  1:
//				this.followingView = view;
////				view.$el.addClass("following");
//				break;
//		}
		return view;
	},

	removeChildren: function () {
		this.children.each(this.removeChildView, this);
	},

	removeChildView: function (view) {
		this.children.remove(view);
		view.remove();
		return view;
	},

	/* --------------------------- *
	 * measure
	 * --------------------------- */

	measureNow: function () {
		this._measure();
	},

	measureLater: function () {
		this.requestRender("measure", this._measure);
	},

	_measure: function() {
		var s, pos = 0, maxAcross = 0, maxOuter = 0, maxView = this.emptyView;

		this.children.each(function(view) {
			s = this.measureChildView(view.render());
			s.pos = pos;
			this.metrics[view.cid] = s;
			pos += s.outer + this.childGap;
			if (view !== this.emptyView) {
				if (s.across > maxAcross) {
					maxAcross = s.across;
				}
				if (s.outer > maxOuter) {
					maxOuter = s.outer;
					maxView = view;
				}
			}
		}, this);

		// self metrics
		s = {};
		s.across = maxAcross;
		s.outer = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		s.inner = maxView.el[this.dirProp("offsetWidth", "offsetHeight")];
		s.before = maxView.el[this.dirProp("offsetLeft", "offsetTop")];
		s.after = s.outer - (s.inner + s.before);
		this.metrics[this.cid] = s;

		// tap area
		this.tapAreaBefore = s.before + this.tapAreaGrow;
		this.tapAreaAfter = s.before + s.inner - this.tapAreaGrow;
		this.selectThreshold = Math.min(Carousel.MAX_SELECT_THRESHOLD, s.outer * 0.1);

//		this.$(this.hammer.element).css(this.dirProp({width: maxSize, height: maxAcross }, {width: maxAcross, height: maxSize}));
//		this.$el.css(this.dirProp("maxHeight", "maxWidth"), (maxAcross > 0)? maxAcross: "");
	},

	measureChildView: function (child) {
		var s = {};
		var childEl = child.el;
		var contentEl = childEl.querySelector(".sizing") || childEl.firstChild;

		s.outer = childEl[this.dirProp("offsetWidth", "offsetHeight")];
		s.across = childEl[this.dirProp("offsetHeight", "offsetWidth")];

		if (contentEl) {
			s.inner = contentEl[this.dirProp("offsetWidth", "offsetHeight")];
			s.before = contentEl[this.dirProp("offsetLeft", "offsetTop")];
			s.after = s.outer - (s.inner + s.before);
		} else {
			s.inner = s.outer;
			s.before = 0;
			s.after = 0;
		}
		return s;
	},

	/* --------------------------- *
	 * Scroll/layout
	 * --------------------------- */

	scrollByLater: function (delta, skipTransitions) {
		if (!_.isBoolean(skipTransitions)) {
			throw new Error("argument missing: skipTransitions");
		}
//		_.isBoolean(skipTransitions) || (skipTransitions = this.skipTransitions);
		if (!skipTransitions) {
			this.$el.addClass("scrolling");
		}
		this.requestRender("scrollBy", _.bind(this._scrollBy, this, delta, skipTransitions));
	},

	scrollByNow: function (delta, skipTransitions) {
		if (!_.isBoolean(skipTransitions)) {
			throw new Error("argument missing: skipTransitions");
		}
//		_.isBoolean(skipTransitions) || (skipTransitions = this.skipTransitions);
		if (!skipTransitions) {
			this.$el.addClass("scrolling");
		}
		this._scrollBy(delta, skipTransitions);
	},

	_scrollBy: function (delta, skipTransitions) {
		var sView, sMetrics, metrics, pos, txVal;
		var scrollEndHandler, scrollEndAction;

//		sView = this.collection.selected? this.children.findByModel(this.collection.selected) : this.emptyView;
		sView = this.candidateView || this.selectedView;
//		sView = this.selectedView;
		sMetrics = this.metrics[sView.cid];

		if (skipTransitions) {
			this.skipTransitions = false;
			this.$el.addClass("skip-transitions");
			this.applyCandidateSelection();
//			this._onScrollTransitionEnd();
//			_.defer(_.bind(function() {
//				this._onScrollTransitionEnd();
//				this.$el.removeClass("skip-transitions");
//			}, this));
		} else {
			this.$el.removeClass("skip-transitions");
			if (this.candidateView) {
				this.selectedView.$el.removeClass("selected");
			}
			this.applyCandidateSelection();

			scrollEndHandler = function(ev) {
				(ev.originalEvent.propertyName == "transform") && scrollEndAction();
			};
			scrollEndAction = function() {
				sView.$el.off("webkittransitionend transitionend", scrollEndHandler);
				this.$el.removeClass("scrolling");
//				this.applyCandidateSelection();
//				this._onScrollTransitionEnd();
			};
			scrollEndAction = _.once(_.bind(scrollEndAction, this));
			sView.$el.on("webkittransitionend transitionend", scrollEndHandler);
			_.delay(scrollEndAction, 1000);
		}

		this.children.each(function (view) {
			var cssVal = this._getCSSTransformValue(
				this._getScrollOffset(this.metrics[view.cid], sMetrics, delta));
			view.el.style.webkitTransform = cssVal;
			view.el.style.mozTransform = cssVal;
			view.el.style.transform = cssVal;
		}, this);
	},

//	_onScrollTransitionEnd: function () {
//		this.dispatchSelectionEvent();
//		if (this.candidateView) {
//			if (this.candidateView !== this.emptyView) {
//				this.trigger("view:select:one", this.candidateView.model);
//			} else {
//				this.trigger("view:select:none");
//			}
//			this.candidateView = void 0;
//		}
//	},

	_getCSSTransformValue: function(pos) {
		return this.dirProp("translate3d(" + pos + "px,0,0)", "translate3d(0," + pos + "px,0)");
	},

	_getScrollOffset: function (s, ss, delta) {
		var pos = s.pos - ss.pos + delta;
		var offset = 0;

		if (pos < 0) {
			if (Math.abs(pos) < s.outer) {
				offset += (-s.after) / s.outer * pos;
			} else {
				offset += s.after;
			}
		} else
		if (0 <= pos) {
			if (Math.abs(pos) < s.outer) {
				offset -= s.before / s.outer * pos;
			} else {
				offset -= s.before;
			}
		}
		return pos + offset;
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function () {
		this.measureLater();
		this.scrollByLater(0, Carousel.IMMEDIATE);
		if (this.el.parentElement) {
			this.renderNow();
		}
		return this;
	},

	/** @override */
	renderLater: function () {
		this.validateRender("createChildren");
		this.validateRender("measure");
		this.validateRender("scrollBy");
//		this.skipTransitions = false;
	},

	/* --------------------------- *
	 * Hammer events
	 * --------------------------- */

	_onTouch: function (ev) {
		ev.preventDefault();
		switch (ev.type) {
			case "tap": 		return this._onTap(ev);
			case "panstart":	return this._onPanStart(ev);
			case "panmove":		return this._onPanMove(ev);
			case "panend":		return this._onPanFinish(ev);
			case "pancancel": 	return this._onPanFinish(ev);
		}
	},

	_onTap: function (ev) {
		this.applyCandidateSelection();
//		var item;
		var pos = ev.center[this.dirProp("x", "y")];
		if (pos < this.tapAreaBefore) {
			this.candidateView = this.precedingView;
		} else if (pos > this.tapAreaAfter) {
			this.candidateView = this.followingView;
		} else {
			this.candidateView = void 0;
		}
//		if (this.candidateView) {
//			this.candidateView.$el.addClass("candidate");
//			this.scrollByLater(0, Carousel.ANIMATED);
//		}
		this.applyCandidateSelection();
//		if (item) {
//			this.trigger("view:select:one", item);
//		}
		// else if { /* ignore event, proposed selection is out of bounds */ }
	},

	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.applyCandidateSelection();
		this._panThresholdOffset = this.getEventDelta(ev);
//		if (this.followingView) {
//			this.followingView.$el.addClass("candidate");
//		}
//		if (this.precedingView) {
//			this.precedingView.$el.addClass("candidate");
//		}
		this.$el.addClass("panning");
	},

	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var delta = this.getEventDelta(ev) + this._panThresholdOffset;
		var dir = ev.offsetDirection & this.direction;
		var ahead, past;

		if (dir & Carousel.DIRECTION_BEFORE) {
			ahead = this.precedingView;
			past = this.followingView;
		} else {
			ahead = this.followingView;
			past = this.precedingView;
		}

		if (dir &~ this._panLastDirection) {
			if (ahead)
				ahead.$el.addClass("candidate");
			if (past)
				past.$el.removeClass("candidate");
			this._panLastDirection = dir;
		}

		if (_.isUndefined(ahead)) {
			delta *= 0.4;
		}

//		if (direction & Carousel.DIRECTION_BEFORE) {
//			if (_.isUndefined(this.precedingView)) {
//				delta *= 0.4;
//			} else if (dirChanged) {
//				this.precedingView.$el.addClass("candidate");
//				if (this.followingView) {
//					this.followingView.$el.removeClass("candidate");
//				}
//				this._panLastDirection = direction
//			}
////		} else if (direction & Carousel.DIRECTION_AFTER) {
//		} else {
//			if (_.isUndefined(this.precedingView)) {
//				delta *= 0.4;
//			} else if (dirChanged) {
//				this.precedingView.$el.addClass("candidate");
//				if (this.followingView) {
//					this.followingView.$el.removeClass("candidate");
//				}
//				this._panLastDirection = direction
//			}
//		}


//		if (direction &~ this._panLastDirection) {
//			if (direction & Carousel.DIRECTION_BEFORE) {
//				this.followingView && this.followingView.$el.removeClass("candidate");
//				this.precedingView && this.precedingView.$el.addClass("candidate");
//			} else if (direction & Carousel.DIRECTION_AFTER) {
////			} else {
//				this.precedingView && this.precedingView.$el.removeClass("candidate");
//				this.followingView && this.followingView.$el.addClass("candidate");
//			}
//			this._panLastDirection = direction;
//		}
//		if ( _.isUndefined(this.candidateView)) {
//			delta *= 0.4;
//		}

//		if (((direction & Carousel.DIRECTION_BEFORE) && _.isUndefined(this.precedingView)) ||
//			((direction & Carousel.DIRECTION_AFTER) && _.isUndefined(this.followingView))) {
//			// when at first or last index, add feedback to gesture
//			delta *= 0.4;
//		}

		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},

	/** @param {Object} ev */
	_onPanFinish: function (ev) {
		var delta = this.getEventDelta(ev) + this._panThresholdOffset;

//		if (this.candidateView && (Math.abs(delta) > this.selectThreshold)) {// && (ev.offsetDirection & this.direction)) {
//			if (this.candidateView === this.emptyView) {
//				this.trigger("view:select:none");
//			} else {
//				this.trigger("view:select:one", this.candidateView.model);
//			}
//		} else {
//			this.scrollByLater(0, Carousel.ANIMATED);
//		}
//		if ((ev.type === "panend") && (Math.abs(delta) > this.selectThreshold)) {
//			var direction = ev.offsetDirection & this.direction;
//			if (direction & Carousel.DIRECTION_BEFORE) {
//				this.candidateView = this.precedingView;
//			} else if (direction & Carousel.DIRECTION_AFTER) {
//				this.candidateView = this.followingView;
//			} else {
//				this.candidateView = void 0;
//			}
//		}

		// If beyond selectThreshold, trigger selection
		if ((ev.type == "panend") && (Math.abs(delta) > this.selectThreshold)) {
			this.candidateView = (this.direction & ev.offsetDirection & Carousel.DIRECTION_BEFORE)? this.precedingView : this.followingView;
		} else {
			this.candidateView = void 0;
		}
//		if (this.candidateView) {
//		} else {
//			this.scrollByLater(0, Carousel.ANIMATED);
//		}
//		this.applyCandidateSelection();

		this._panThresholdOffset = void 0;
		this._panLastDirection = void 0;
		this.$el.removeClass("panning");

		this.scrollByLater(0, Carousel.ANIMATED);
	},

//	/** @param {Object} ev */
//	_onPanCancel: function (ev) {
//		this.candidateView = void 0;
//		this.scrollByLater(0, Carousel.ANIMATED);
//		this._onPanFinished(ev);
//	},

//	_onPanFinished: function(ev) {
//		if (this.followingView && (this.followingView !== this.candidateView)) {
//			this.followingView.$el.removeClass("candidate");
//		}
//		if (this.precedingView && (this.precedingView !== this.candidateView)) {
//			this.precedingView.$el.removeClass("candidate");
//		}
//		this.followingView && this.followingView.$el.removeClass("candidate");
//		this.precedingView && this.precedingView.$el.removeClass("candidate");
//	},

	/* --------------------------- *
	 * Model listeners
	 * --------------------------- */

	updateSelection: function () {
//		var lastSelectedView = this.selectedView;
		this.selectedView && this.selectedView.$el.removeClass("selected");
		if (this.collection.selectedIndex === -1) {
			this.selectedView = this.emptyView;
		} else {
			this.selectedView = this.children.findByModel(this.collection.selected);
		}
		this.selectedView && this.selectedView.$el.addClass("selected");

		if (this.collection.selectedIndex === 0) {
			this.precedingView = this.emptyView;
		} else if (this.collection.hasPreceding()){
			this.precedingView = this.children.findByModel(this.collection.preceding());
		} else {
			this.precedingView = void 0;
		}

		if (this.collection.selectedIndex === -1) {
			this.followingView = this.children.findByModel(this.collection.first());
		} else if (this.collection.hasFollowing()){
			this.followingView = this.children.findByModel(this.collection.following());
		} else {
			this.followingView = void 0;
		}
	},

	applyCandidateSelection: function () {
//		this.$el.children(".candidate").removeClass("candidate");
		if (this.candidateView) {
			this.candidateView.$el.removeClass("candidate");
			if (this.candidateView === this.emptyView) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:one", this.candidateView.model);
			}
			this.candidateView = void 0;
		}
	},

	/*dispatchSelectionEvent: function(direction) {
		var item;
		direction &= this.direction;
		if (direction & Carousel.DIRECTION_BEFORE) {
			if (this.collection.selectedIndex == 0) {
				this.trigger("view:select:none");
			} else {
				item = this.collection.preceding();
			}
		} else if (direction & Carousel.DIRECTION_AFTER) {
			if (this.collection.selectedIndex == -1) {
				item = this.collection.first();
			} else {
				item = this.collection.following();
			}
		}
		if (item) {
			this.trigger("view:select:one", item);
		}
	},*/

	/** @private */
	_onSelectionChange: function () {
		this.updateSelection();
		this.scrollByLater(0, Carousel.ANIMATED);
	},

	/** @private */
	_onCollectionReset: function () {
		throw new Error("not implemented");
//		this.createChildrenLater();
//		this.render();
	},

//	/** @private */
//	_onDeselectOne: function (model) {
//		var view = this.children.findByModel(model);
//		if (view) {
//			view.$el.removeClass("selected");
//		} // else if children have not been created yet, selection will be applied then
//	},
//
//	/** @private */
//	_onSelectOne: function (model) {
//		var view = this.children.findByModel(model);
//		if (view) {
//			view.$el.addClass("selected");
//			this.scrollByNow(0, Carousel.ANIMATED);
//		} // else idem
//	},
//
//	/** @private */
//	_onSelectNone: function () {
//		if (this.emptyView) {
//			this.emptyView.$el.addClass("selected");
//			this.scrollByNow(0, Carousel.ANIMATED);
//		} // else idem
//	},
//
//	_onDeselectNone: function () {
//		if (this.emptyView) {
//			this.emptyView.$el.removeClass("selected");
//		}
//	},

	/* --------------------------- *
	 * event helper functions
	 * --------------------------- */

	getEventDelta: function (ev) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL)? ev.deltaX : ev.deltaY;
	},

//	isOutOfBounds: function (delta) {
//		return (this.collection.selectedIndex === -1 && delta > 0) || (this.collection.selectedIndex === this.collection.length - 1 && delta < 0);
//	},

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

	dirProp: function (hProp, vProp) {
		return (this.direction & Carousel.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},

},{
	/** const */
	DIRECTION_BEFORE: Hammer.DIRECTION_LEFT | Hammer.DIRECTION_UP,
	/** const */
	DIRECTION_AFTER: Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_DOWN,
	/** const */
	MAX_SELECT_THRESHOLD: 40,
	/** const arg in scrollByNow, scrollByLater */
	ANIMATED: false,
	/** const arg in scrollByNow, scrollByLater */
	IMMEDIATE: true,
	/** copy of Hammer.DIRECTION_VERTICAL */
	DIRECTION_VERTICAL: Hammer.DIRECTION_VERTICAL,
	/** copy of Hammer.DIRECTION_HORIZONTAL */
	DIRECTION_HORIZONTAL: Hammer.DIRECTION_HORIZONTAL,
	/** used in crateEmptyChildView */
	EMPTY_VIEW_OPTS: ["model", "collection", "template"],

});

module.exports = Carousel;
