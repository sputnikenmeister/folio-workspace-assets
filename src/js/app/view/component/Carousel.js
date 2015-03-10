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
		_.bindAll(this, "_createChildren", "_measure", "_onTouch");

		this.initializeHammer(options);

		options.template && (this.template = options.template);
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);

//		_.isNumber(options.gap) && (this.gap = options.gap);
		this.children = new Container();
		this.childGap = this.dirProp(20, 18);
		this.metrics = {};
		this.createChildrenNow();

		this.listenTo(this.collection, {
			"reset": this._onReset,
			"select:one": this._onSelect,
			"select:none": this._onSelect,
//			"deselect:one": this._onDeselect,
//			"deselect:none": this._onDeselect,
		});
	},

	remove: function () {
		this.hammer.off("panstart panmove panend pancancel tap", this._onTouch);
		this.removeChildren();
		DeferredRenderView.prototype.remove.apply(this);
	},

	initializeHammer: function(options) {
		var hammer, pan, tap;

		// direction from opts/defaults
		if (options.direction === Carousel.DIRECTION_VERTICAL) {
			this.direction = Carousel.DIRECTION_VERTICAL;
		} // do nothing: the default is horizontal

		// validate external hammer or create one if neccesary
		if ((hammer = options.hammer) && (pan = hammer.get("pan")) && hammer.get("tap")) {
			// Override direction only if specific
			if (pan.options.direction !== Hammer.DIRECTION_ALL) {
				this.direction = pan.options.direction;
			}
			this.panThreshold = pan.options.threshold;
		} else {
			hammer = new Hammer.Manager(this.el);
			pan = new Hammer.Pan({threshold: this.panThreshold, direction: this.direction});
			tap = new Hammer.Tap({threshold: this.panThreshold-1,	interval: 50, time: 200});
			tap.recognizeWith(pan);
			hammer.add([pan, tap]);
			this.on("view:remove", hammer.destroy, hammer);
		}
		hammer.on("panstart panmove panend pancancel tap", this._onTouch);

		this.hammer = hammer;
		this.tapRecognizer = tap;
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
			this.$el.append(buffer);
		}
	},

	createEmptyView: function () {
		return this.emptyView = this.createChildView(this.emptyRenderer,
				_.pick(this, Carousel.EMPTY_VIEW_OPTS), -1, this.collection.selectedIndex);
	},

	createChildView: function (renderer, opts, index, sel) {
		var view = new renderer(opts);
		var d = index - sel;
		switch (d) {
			case  0:
				this.selectedView = view;
				view.$el.addClass("selected");
				break;
			case -1:
				this.precedingView = view;
				break;
			case  1:
				this.followingView = view;
				break;
		}
		this.children.add(view);
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

		// chidren metrics
		this.children.each(function(view) {
			s = this.measureChildView(view.render());
			s.pos = pos;
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

		// measure self
		s = this.metrics[this.cid] || (this.metrics[this.cid] = {});
		s.across = maxAcross;
		s.outer = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		s.inner = maxView.el[this.dirProp("offsetWidth", "offsetHeight")];
		s.before = maxView.el[this.dirProp("offsetLeft", "offsetTop")];
		s.after = s.outer - (s.inner + s.before);

		// tap area
		this.tapAreaBefore = s.before + this.tapAreaGrow;
		this.tapAreaAfter = s.before + s.inner - this.tapAreaGrow;
		this.selectThreshold = Math.min(Carousel.MAX_SELECT_THRESHOLD, s.outer * 0.2);

		//this.$(this.hammer.element).css(this.dirProp({width: maxSize, height: maxAcross }, {width: maxAcross, height: maxSize}));
		//this.$el.css(this.dirProp("minHeight", "minWidth"), (maxAcross > 0)? maxAcross: "");
	},

	measureChildView: function (view) {
		var s = this.metrics[view.cid] || (this.metrics[view.cid] = {});
		var viewEl = view.el;
		var contentEl = viewEl.querySelector(".sizing") || viewEl.firstChild;

		s.outer = viewEl[this.dirProp("offsetWidth", "offsetHeight")];
		s.across = viewEl[this.dirProp("offsetHeight", "offsetWidth")];

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
		this.requestRender("scrollBy", _.bind(this._scrollBy, this, delta, skipTransitions));
	},

	scrollByNow: function (delta, skipTransitions) {
		this._scrollBy(delta, skipTransitions);
	},

	_scrollBy: function (delta, skipTransitions) {
		var sView, sMetrics, metrics, pos, txVal;
		var scrollEndCommand, scrollEventHandler, scrollTimeoutId;

		sView = this._scrollCandidateView || this.selectedView;
		sMetrics = this.metrics[sView.cid];

		this.children.each(function (view) {
			var cssVal = this._getCSSTransformValue(
				this._getScrollOffset(this.metrics[view.cid], sMetrics, delta));
			view.el.style.webkitTransform = cssVal;
			view.el.style.mozTransform = cssVal;
			view.el.style.transform = cssVal;
		}, this);

		if (this._scrollPendingAction) {
			this._scrollPendingAction("scroll:cancel");
		}

		if (skipTransitions) {
			this.skipTransitions = false;
			this.$el.addClass("skip-transitions");
			this.commitScrollSelection();
		} else {
			this.$el.removeClass("skip-transitions");
//			if (this._scrollCandidateView) {
//				this.selectedView.$el.removeClass("selected");
//			}
			this.commitScrollSelection();

			// Timeout
			scrollTimeoutId = window.setTimeout(function() {
				scrollEndCommand("scroll:end:timeout");
			}, 1000);
			// Event handler
			scrollEventHandler = function(ev) {
				if (ev.originalEvent.propertyName == "transform") {
					scrollEndCommand("scroll:end:event");
				}
			};
			sView.$el.on("webkittransitionend transitionend", scrollEventHandler);
			// Command
			scrollEndCommand = function(view, handler, timeoutId, label) {
//				console.log(timeoutId, label);
				view.$el.off("webkittransitionend transitionend", handler);
				window.clearTimeout(timeoutId);
				this._scrollPendingAction = void 0;

				if (label !== "scroll:cancel") {
					this.$el.removeClass("scrolling");
				}
			};
			// Bind argument values into command, except 4th
			scrollEndCommand = _.once(_.bind(scrollEndCommand, this, sView, scrollEventHandler, scrollTimeoutId));
			this._scrollPendingAction = scrollEndCommand;
//			console.log(scrollTimeoutId, "scroll:start");

		}
	},

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

	commitScrollSelection: function () {
		if (this._scrollCandidateView) {
			var view = this._scrollCandidateView;
			this._scrollCandidateView.$el.removeClass("candidate");
			this._scrollCandidateView = void 0;

			if (view === this.emptyView) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:one", view.model);
			}
		}
	},

	/* --------------------------- *
	 * Hammer events
	 * --------------------------- */

	_onTouch: function (ev) {
//		ev.preventDefault();
		switch (ev.type) {
			case "tap": 		return this._onTap(ev);
			case "panstart":	return this._onPanStart(ev);
			case "panmove":		return this._onPanMove(ev);
			case "panend":		return this._onPanFinish(ev);
			case "pancancel": 	return this._onPanFinish(ev);
		}
	},

	/* --------------------------- *
	 * pan
	 * --------------------------- */

	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.commitScrollSelection();

		this._panStartOffset = (ev.offsetDirection & this.direction & Carousel.DIRECTION_BEFORE)? -this.panThreshold : this.panThreshold;
		var delta = this.getEventDelta(ev) + this._panStartOffset;

		this.$el.addClass("panning scrolling");
		this.precedingView && this.precedingView.$el.addClass("candidate");
		this.followingView && this.followingView.$el.addClass("candidate");

		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},

	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var delta = this.getEventDelta(ev) + this._panStartOffset;
		var view = (ev.offsetDirection & this.direction & Carousel.DIRECTION_BEFORE)? this.precedingView : this.followingView;

//		if (view !== this._panCandidateView) {
//			this._panCandidateView && this._panCandidateView.$el.removeClass("candidate");
//			view && view.$el.removeClass("candidate");
//		}
		this._panCandidateView = view;
		if (_.isUndefined(this._panCandidateView)) {
			delta *= 0.4;
		}
		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},

	/** @param {Object} ev */
	_onPanFinish: function (ev) {
		var delta = this.getEventDelta(ev) + this._panStartOffset;

		if ((ev.type == "panend") &&
				((ev.direction ^ ev.offsetDirection) & this.direction) &&	// pan direction (last event) and offsetDirection (whole gesture) must match
				(Math.abs(delta) > this.selectThreshold)) {					// gesture must overshoot selectThreshold
			this._scrollCandidateView =
				(ev.offsetDirection & Carousel.DIRECTION_BEFORE & this.direction)? // choose next scroll target
				this.precedingView : this.followingView;
		}

		if (this.precedingView && (this.precedingView !== this._scrollCandidateView)) {
			this.precedingView.$el.removeClass("candidate");
		}
		if (this.followingView && (this.followingView !== this._scrollCandidateView)) {
			this.followingView.$el.removeClass("candidate");
		}
		this.$el.removeClass("panning");

		this._panStartOffset = void 0;
		this._panCandidateView = void 0;

		this.scrollByLater(0, Carousel.ANIMATED);
	},

	/* --------------------------- *
	 * tap
	 * --------------------------- */

	_onTap: function (ev) {
		this.commitScrollSelection();

		var pos = ev.center[this.dirProp("x", "y")];
		if (pos < this.tapAreaBefore) {
			this._scrollCandidateView = this.precedingView;
		} else if (pos > this.tapAreaAfter) {
			this._scrollCandidateView = this.followingView;
		} else {
			this._scrollCandidateView = void 0;
		}

		if (this._scrollCandidateView) {
			this.hammer.stop();
			this._scrollCandidateView.$el.addClass("candidate");
			this.$el.addClass("scrolling");
			this.scrollByLater(0, Carousel.ANIMATED);
		}
	},

	/* --------------------------- *
	 * Model listeners
	 * --------------------------- */

	/** @private */
	_onReset: function () {
		this.createChildrenLater();
		this.render();
	},

	/** @private */
	_onSelect: function (model) {
		var lastSelectedView = this.selectedView;
		this.updateSelection();
		if (lastSelectedView !== this.selectedView) {
			lastSelectedView.$el.removeClass("selected");
			this.selectedView.$el.addClass("selected");
			this.$el.addClass("scrolling");
			this.scrollByLater(0, Carousel.ANIMATED);
		} else {
			console.warn("Should not happen: _onSelectionChange lastSelectedView === this.selectedView");
		}
	},

//	_onDeselect: function (model) {
//		(model? this.children.findByModel(model) : this.emptyView).$el.removeClass("selected");
//	},

	/* --------------------------- *
	 * Private
	 * --------------------------- */

	updateSelection: function () {
		if (this.collection.selectedIndex === -1) {
			this.selectedView = this.emptyView;
		} else {
			this.selectedView = this.children.findByModel(this.collection.selected);
		}

		if (this.collection.selectedIndex === 0) {
			this.precedingView = this.emptyView;
		} else if (this.collection.hasPreceding()) {
			this.precedingView = this.children.findByModel(this.collection.preceding());
		} else {
			this.precedingView = void 0;
		}

		if (this.collection.selectedIndex === -1) {
			this.followingView = this.children.findByModel(this.collection.first());
		} else if (this.collection.hasFollowing()) {
			this.followingView = this.children.findByModel(this.collection.following());
		} else {
			this.followingView = void 0;
		}
	},

	/*
	updateSelectedModel: function (model) {
		var index = this.collection.indexOf(model);
		if (index === 0) {
			this.precedingView = this.emptyView;
		} else if (index > 0) {
			this.precedingView = this.children.findByModel(this.collection.at(index - 1));
		} else {
			this.precedingView = void 0;
		}
		if (index === -1) {
			this.followingView = this.children.findByModel(this.collection.first());
		} else if (index < this.collection.length - 1) {
			this.followingView = this.children.findByModel(this.collection.at(index + 1));
		} else {
			this.followingView = void 0;
		}
		this.selectedView = (model? this.children.findByModel(model) : this.emptyView);
	},

	dispatchSelectionEvent: function (view) {
		if (view) {
			if (view === this.emptyView) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:one", view.model);
			}
		}
	},

	dispatchSelectionEvent: function(direction) {
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
	},
	*/

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

	getEventDelta: function (ev) {
		return (this.direction & Carousel.DIRECTION_HORIZONTAL)? ev.deltaX : ev.deltaY;
	},

	dirProp: function (hProp, vProp) {
		return (this.direction & Carousel.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},

},{
	/** const */
	DIRECTION_BEFORE: Hammer.DIRECTION_LEFT | Hammer.DIRECTION_UP,
	/** const */
	DIRECTION_AFTER: Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_DOWN,
	/** const */
	MAX_SELECT_THRESHOLD: 100,
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
