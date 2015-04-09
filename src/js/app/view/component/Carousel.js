/**
 * @module app/view/component/Carousel
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/utils/event/addTransitionEndCommand} */
var addTransitionCallback = require("../../utils/event/addTransitionCallback");

/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/view/base/DeferredView} */
var DeferredView = require("../base/DeferredView");

/** @type {module:app/view/render/CarouselDefaultRenderer} */
var CarouselDefaultRenderer = require("../render/CarouselDefaultRenderer");
/** @type {module:app/view/render/CarouselEmptyRenderer} */
var CarouselEmptyRenderer = require("../render/CarouselEmptyRenderer");


//var ORIENTED_PROPS = {
//	x: ["x", "y"],
//	y: ["y", "x"],
//	offsetLeft: ["offsetLeft", "offsetTop"],
//	offsetTop: ["offsetTop", "offsetLeft"],
//	offsetWidth: ["offsetWidth", "offsetHeight"],
//	offsetHeight: ["offsetHeight", "offsetWidth"],
//};

/**
 * @constructor
 * @type {module:app/view/component/Carousel}
 */
var Carousel = DeferredView.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel skip-transitions",
	/** @type {int} In pixels */
	tapAreaGrow: 50,
	/** @type {int} In pixels */
	selectThreshold: 20,
	/** @type {int} In pixels */
	panThreshold: 15,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,
	/** @type {Function} */
	renderer: CarouselDefaultRenderer,
	/** @type {Function} */
	emptyRenderer: null,

	/** @override */
	initialize: function (options) {
		_.bindAll(this, "_createChildren", "_measure", "_onPan", "_onTap");

		this.initializeHammer(options);
		options.template && (this.template = options.template);
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);

//		_.isNumber(options.gap) && (this.gap = options.gap);
		this.children = new Container();
		this.childGap = this.dirProp(20, 18);
		this.metrics = {};
		this._precedingDir = (Hammer.DIRECTION_LEFT | Hammer.DIRECTION_UP) & this.direction;
		this._followingDir = (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_DOWN) & this.direction;

		this.createChildrenNow();

		this.listenTo(this.collection, {
			"reset": this._onReset,
			"select:one": this._onSelectAny,
			"select:none": this._onSelectAny,
			"deselect:one": this._onDeselectAny,
			"deselect:none": this._onDeselectAny,
		});

//		this.hammer.on("tap", this._onTap);
		this.hammer.on("panstart panmove panend pancancel", this._onPan);
	},

	remove: function () {
		this._scrollPendingAction && this._scrollPendingAction(true);
//		this.hammer.off("tap", this._onTap);
		this.hammer.off("panstart panmove panend pancancel", this._onPan);
		this.removeChildren();
		return DeferredView.prototype.remove.apply(this);
	},

	initializeHammer: function(options) {
		var hammer, pan, tap;
		// direction from opts/defaults
		if (options.direction === Hammer.DIRECTION_VERTICAL) {
			this.direction = Hammer.DIRECTION_VERTICAL;
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
			pan = new Hammer.Pan({
				threshold: this.panThreshold,
				direction: this.direction,
				//enable: _.bind(this._canEnablePan, this),
			});
			tap = new Hammer.Tap({
				threshold: this.panThreshold - 1,
				interval: 50, time: 200,
				//enable: _.bind(this._canEnableTan, this),
			});
			tap.recognizeWith(pan);
			hammer.add([pan, tap]);
			this.on("view:remove", hammer.destroy, hammer);
		}
		this.hammer = hammer;
	},

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

	dirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
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
		var sIndex;
		this.removeChildren();
		if (this.collection.length) {
			buffer = document.createDocumentFragment();
			sIndex = this.collection.selectedIndex;
			if (this.emptyRenderer) {
				buffer.appendChild(this.createEmptyView().el);
			} else if (sIndex == -1) {
				sIndex = 0;
			}
			this.collection.each(function (item, index, arr) {
				buffer.appendChild(this.createChildView(this.renderer, {model: item}, index, sIndex).el);
			}, this);
			this.$el.append(buffer);
		}
	},

	createEmptyView: function () {
		return this.emptyView = this.createChildView(this.emptyRenderer,
				_.pick(this, Carousel.EMPTY_VIEW_OPTS), -1, this.collection.selectedIndex);
	},

	createChildView: function (renderer, opts, index, sIndex) {
		var view = new renderer(opts);
		this.children.add(view);
		switch (index - sIndex) {
			case  0:
				view.$el.addClass("selected");
				return this._selectedView = view;
			case -1:
				return this._precedingView = view;
			case  1:
				return this._followingView = view;
			default:
				return view;
		}
	},

	removeChildren: function () {
		this.children.each(this.removeChildView, this);
		this.emptyView = void 0;
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
		var m, pos = 0, posInner = 0;
		var maxAcross = 0, maxOuter = 0;
		var maxView = this.emptyView || this.children.first();

		// chidren metrics
		this.children.each(function(view) {
			m = this.measureChildView(view.render());
			m.pos = pos;
			pos += m.outer + this.childGap;
			m.posInner = posInner;
			posInner += m.inner + this.childGap;
			if (view !== this.emptyView) {
				if (m.across > maxAcross) {
					maxAcross = m.across;
				}
				if (m.outer > maxOuter) {
					maxOuter = m.outer;
					maxView = view;
				}
			}
		}, this);

		// measure self
		m = this.metrics[this.cid] || (this.metrics[this.cid] = {});
		m.across = maxAcross;
		m.outer = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		m.inner = maxView.el[this.dirProp("offsetWidth", "offsetHeight")];
		m.before = maxView.el[this.dirProp("offsetLeft", "offsetTop")];
		m.after = m.outer - (m.inner + m.before);

		// tap area
		this.tapAreaBefore = m.before + this.tapAreaGrow;
		this.tapAreaAfter = m.before + m.inner - this.tapAreaGrow;
		this.selectThreshold = Math.min(Carousel.MAX_SELECT_THRESHOLD, m.outer * 0.1);

		//this.$(this.hammer.element).css(this.dirProp({width: maxSize, height: maxAcross }, {width: maxAcross, height: maxSize}));
		//this.$el.css(this.dirProp("minHeight", "minWidth"), (maxAcross > 0)? maxAcross: "");
	},

	measureChildView: function (view) {
		var m, viewEl, sizeEl;

		viewEl = view.el;
		sizeEl = viewEl.querySelector(".sizing") || viewEl.firstChild;

		m = this.metrics[view.cid] || (this.metrics[view.cid] = {});
		m.outer = viewEl[this.dirProp("offsetWidth", "offsetHeight")];
		m.across = viewEl[this.dirProp("offsetHeight", "offsetWidth")];

		if (sizeEl) {
			m.inner = sizeEl[this.dirProp("offsetWidth", "offsetHeight")];
			m.before = sizeEl[this.dirProp("offsetLeft", "offsetTop")];
			m.after = m.outer - (m.inner + m.before);
		} else {
			m.inner = m.outer;
			m.before = 0;
			m.after = 0;
		}
		return m;
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
		var metrics, sView, sMetrics, cView, cMetrics, pos, txProp;

		txProp = this.getPrefixedJS("transform");
		sView = this._scrollCandidateView || this._selectedView;
		cView = this._panCandidateView || this._selectedView;
		sMetrics = this.metrics[sView.cid];
		cMetrics = this.metrics[cView.cid];


//		var opacity, opacityProp;
//		opacityProp = this.getPrefixedJS("opacity");

		this.children.each(function (view) {
			metrics = this.metrics[view.cid];
			pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics, cMetrics));
			view.el.style[txProp] = (this.direction & Hammer.DIRECTION_HORIZONTAL)?
					"translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";

//			if (skipTransitions) {
//				if (view === this._panCandidateView) {
//					opacity = Math.min(1, (1 - Math.abs(pos) / metrics.outer) * 4);
//				} else if (view === this._selectedView) {
//					opacity = 1;
//				} else {
//					opacity = 0;
//				}
//			} else {
//				alphaVal = "";
//			}
//			metrics.content.style[opacityProp] = opacity;
		}, this);

		// cancel callback
		this._scrollEndCancellable && this._scrollEndCancellable(false);
		if (skipTransitions) {
			this.$el.addClass("skip-transitions");
		} else {
			this.$el.removeClass("skip-transitions");
			this._scrollEndCancellable = addTransitionCallback(this.getPrefixedCSS("transform"), function(exec) {
				this._scrollEndCancellable = void 0;
				exec && this.$el.removeClass("scrolling");
			}, this._selectedView.el, this, Globals.TRANSITION_DURATION * 2);
		}

		this.commitScrollSelection();
	},

	_getScrollOffset: function (delta, m, ms, mc) {
		var pos = m.pos - ms.pos + delta;
		var offset = 0;

		if (pos < 0) {
			if (Math.abs(pos) < m.outer) {
				offset += (-m.after) / m.outer * pos;
			} else {
				offset += m.after;
			}
		} else
		if (0 <= pos) {
			if (Math.abs(pos) < m.outer) {
				offset -= m.before / m.outer * pos;
			} else {
				offset -= m.before;
			}
		}
		return pos + offset;
	},

	commitScrollSelection: function () {
		if (this._scrollCandidateView !== void 0) {
			var view = this._scrollCandidateView;
			this._scrollCandidateView = void 0;
			view.$el.removeClass("candidate");

			this._internalSelection = true;
			if (view === this.emptyView) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:one", view.model);
			}
			this._internalSelection = false;
		}
	},

	/* --------------------------- *
	 * touch event: tap
	 * --------------------------- */

	_onTap: function (ev) {
		this.commitScrollSelection();

		var posX = this.dirProp(ev.center.x, ev.center.y);
		var posY = this.dirProp(ev.center.y, ev.center.x);
		if (posX < this.tapAreaBefore) {
			this._scrollCandidateView = this._precedingView;
		} else if (posX > this.tapAreaAfter) {
			this._scrollCandidateView = this._followingView;
		} else {
			this._scrollCandidateView = void 0;
		}

		if (this._scrollCandidateView) {
			this._scrollCandidateView.$el.addClass("candidate");
			this.$el.addClass("scrolling");

			this.scrollByNow(0, Carousel.ANIMATED);
//			this.scrollByLater(0, Carousel.ANIMATED);
		}
	},

	/* --------------------------- *
	 * touch event: pan
	 * --------------------------- */

	_onPan: function (ev) {
		switch (ev.type) {
			case "panstart":	return this._onPanStart(ev);
			case "panmove":		return this._onPanMove(ev);
			case "panend":		return this._onPanFinish(ev);
			case "pancancel":	return this._onPanFinish(ev);
		}
	},

	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.commitScrollSelection();
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.deltaX + ev.thresholdOffsetX : ev.deltaY + ev.thresholdOffsetY;
		this.$el.addClass("panning scrolling");
		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},

	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.deltaX + ev.thresholdOffsetX : ev.deltaY + ev.thresholdOffsetY;
		var view = (ev.offsetDirection & this._precedingDir)? this._precedingView : this._followingView;

		if (this._panCandidateView !== view) {
			this._panCandidateView && this._panCandidateView.$el.removeClass("candidate");
			this._panCandidateView = view;
			this._panCandidateView && this._panCandidateView.$el.addClass("candidate");
		}
		if (this._panCandidateView === void 0) {
			delta *= 0.4;
		}
		this.scrollByNow(delta, Carousel.IMMEDIATE);
		//this.scrollByLater(delta, Carousel.IMMEDIATE);
	},

	/** @param {Object} ev */
	_onPanFinish: function (ev) {
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.deltaX : ev.deltaY;
		var view = (ev.offsetDirection & this._precedingDir)? this._precedingView : this._followingView;
		if ((ev.type == "panend") &&
				((ev.direction ^ ev.offsetDirection) & this.direction) &&	// pan direction (last event) and offsetDirection (whole gesture) must match
				(Math.abs(delta) > this.selectThreshold)) {					// gesture must overshoot selectThreshold
			this._scrollCandidateView = view;					// choose next scroll target
		}
//		if (this._precedingView && (this._precedingView !== this._scrollCandidateView)) {
//			this._precedingView.$el.removeClass("candidate");
//		}
//		if (this._followingView && (this._followingView !== this._scrollCandidateView)) {
//			this._followingView.$el.removeClass("candidate");
//		}
		if (this._panCandidateView && (this._panCandidateView !== this._scrollCandidateView)) {
			this._panCandidateView.$el.removeClass("candidate");
		}
		this.$el.removeClass("panning");
		this._panCandidateView = void 0;
//		this.scrollByLater(0, Carousel.ANIMATED);
		this.scrollByNow(0, Carousel.ANIMATED);
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
	_onSelectAny: function (model) {
		if (DEBUG) {
			if (this._selectedView === (model? this.children.findByModel(model) : (this.emptyView || this.children.first()))) {
				console.error("Carousel._onSelectAny: Select event triggered for model already selected");
			}
		}
		this._selectedView.$el.removeClass("selected");
		this.updateSelection();
		this._selectedView.$el.addClass("selected");
		if (this._internalSelection) {
//			console.log("Internal selection");
			return;
		}
		this.$el.addClass("scrolling");
//		this.scrollByLater(0, Carousel.ANIMATED);
		this.scrollByNow(0, Carousel.ANIMATED);
	},

	_onDeselectAny: function (model) {
//		this._selectedView.$el.removeClass("selected");
	},

	/* --------------------------- *
	 * Private
	 * --------------------------- */

	updateSelection: function () {
		var m, i = this.collection.selectedIndex;
		// assume -1 < index < this.collection.length
		if (this.emptyView) {
			this._selectedView = (m = this.collection.at(i)) ? this.children.findByModel(m) : this.emptyView;
			this._precedingView = m && ((m = this.collection.at(i - 1)) ? this.children.findByModel(m) : this.emptyView);
			this._followingView = (m = this.collection.at(i + 1)) && this.children.findByModel(m);
		} else {
			(i == -1) && i++;
			this._selectedView = (m = this.collection.at(i)) && this.children.findByModel(m);
			this._precedingView = (m = this.collection.at(i - 1)) && this.children.findByModel(m);
			this._followingView = (m = this.collection.at(i + 1)) && this.children.findByModel(m);
		}
	},

	/*
	__getScrollOffset: function (delta, s, ss, sc) {
		var posInner = m.posInner - ms.posInner + delta;
		var offset = 0;

		if (posInner < -ms.inner) {
			offset = -(m.before);
		} else if (posInner > ms.inner) {
			offset = (ms.after);
		} else {
			if (posInner < 0) {
				offset = (m.before) / (m.inner) * posInner;
			} else {
				offset = (ms.after) / (ms.inner) * posInner;
			}
		}
		return posInner + offset;
	},

	__updateSelection2: function () {
		if (this.collection.selectedIndex == -1) {
			this._selectedView = this.emptyView;
		} else {
			this._selectedView = this.children.findByModel(this.collection.selected);
		}
		if (this.collection.selectedIndex == 0) {
			this._precedingView = this.emptyView;
		} else if (this.collection.hasPreceding()) {
			this._precedingView = this.children.findByModel(this.collection.preceding());
		} else {
			this._precedingView = void 0;
		}
		if (this.collection.selectedIndex == -1) {
			this._followingView = this.children.findByModel(this.collection.first());
		} else if (this.collection.hasFollowing()) {
			this._followingView = this.children.findByModel(this.collection.following());
		} else {
			this._followingView = void 0;
		}
	},

	__updateSelection3: function (index) {
		if (index == -1) {
			this._selectedView = this.emptyView;
		} else {
			this._selectedView = this.children.findByModel(this.collection.at(index));
		}
		if (index == 0) {
			this._precedingView = this.emptyView;
		} else if (index > 0) {
			this._precedingView = this.children.findByModel(this.collection.at(index - 1));
		} else {
			this._precedingView = void 0;
		}
		if (index == -1) {
			this._followingView = this.children.findByModel(this.collection.first());
		} else if (index < this.collection.length - 1) {
			this._followingView = this.children.findByModel(this.collection.at(index + 1));
		} else {
			this._followingView = void 0;
		}
	},

	__dispatchSelectionEvent: function (view) {
		if (view) {
			if (view === this.emptyView) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:one", view.model);
			}
		}
	},

	__dispatchSelectionEvent: function(direction) {
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

},{
	/** const */
	MAX_SELECT_THRESHOLD: 50,
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
