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
/** @type {module:app/view/render/DefaultCarouselRenderer} */
var DefaultCarouselRenderer = require("../render/DefaultCarouselRenderer");

var EmptyRenderer = View.extend({
	className: "carousel-item empty-item",
});

var ANIMATED = false;
var IMMEDIATE = true;

/**
 * @constructor
 * @type {module:app/view/component/Carousel}
 */
var Carousel = DeferredRenderView.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel",
	/** @type {int} In pixels */
	selectThreshold: 65,
	/** @type {int} In pixels */
	panThreshold: 15,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,
	/** @type {Function} */
	renderer: DefaultCarouselRenderer,
	/** @type {Function} */
	emptyRenderer: EmptyRenderer,

	/** @override */
	initialize: function (options) {
		if (options.direction === Hammer.DIRECTION_VERTICAL) this.direction = Hammer.DIRECTION_VERTICAL;
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);

		this.children = new Container();

		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({
			direction: this.direction,
			threshold: this.panThreshold,
		}));


		_.bindAll(this, "_onPanStart", "_onPanMove", "_onPanEnd", "_onPanCancel");
		this.hammer.on("panstart", this._onPanStart);
		this.hammer.on("panmove", this._onPanMove);
		this.hammer.on("panend", this._onPanEnd);
		this.hammer.on("pancancel", this._onPanCancel);

		_.bindAll(this, "_onResize");
		Backbone.$(window).on("orientationchange resize", this._onResize);

		this.listenTo(this.collection, {
			"reset": this._onCollectionReset,
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
		});
	},

	remove: function () {
		Backbone.$(window).off("orientationchange resize", this._onResize);
		this.hammer.off("panstart panmove panend pancancel");
		this.hammer.destroy();
		this.removeChildren();
		Backbone.View.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * Hammer events
	 * --------------------------- */

	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.children.each(function(view) {
			view.$el.clearQueue();
		});
		this._onPanMove(ev);
	},

	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var delta = this.getEventDelta(ev);
		// when at first or last index, add feedback to gesture
		if (this.isOutOfBounds(delta)) {
			delta *= 0.2;
		}
		this.scrollByNow(delta);
	},

	/** @param {Object} ev */
	_onPanCancel: function (ev) {
		this.scrollByLater(0, ANIMATED);
	},

	/** @param {Object} ev */
	_onPanEnd: function (ev) {
		var delta = this.getEventDelta(ev);
		// If beyond select threshold, trigger selection
		if (Math.abs(delta) > this.selectThreshold && !this.isOutOfBounds(delta)) {
			var item;
			if (this.collection.selectedIndex == -1) {
				item = this.collection.first();
			} else if (delta < 0) {
				item = this.collection.following();
			} else {
				item = this.collection.preceding();
			}
			if (item) {
				this.trigger("view:select:one", item);
			} else {
				this.trigger("view:select:none");
			}
		} else {
			this.scrollByLater(0, ANIMATED);
		}
	},

	/* --------------------------- *
	 * event helper functions
	 * --------------------------- */

	getEventDelta: function (ev) {
		var delta = 0;
		delta += (this.direction & Hammer.DIRECTION_HORIZONTAL)? ev.deltaX : ev.deltaY;
		delta += (delta < 0) ? this.panThreshold : -this.panThreshold;
		return delta;
	},

	isOutOfBounds: function (delta) {
		return (this.collection.selectedIndex == -1 && delta > 0) ||
			(this.collection.selectedIndex == this.collection.length - 1 && delta < 0);
	},

	/* --------------------------- *
	 * Model listeners
	 * --------------------------- */

	/* Model event handlers */
	_onCollectionReset: function () {
		this._resetPending = true;
		this.render();
	},

	/** @private */
	_onSelectOne: function (image) {
		this.scrollByLater(0, ANIMATED);
	},

	/** @private */
	_onSelectNone: function (image) {
		this.scrollByLater(0, ANIMATED);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function () {
//		console.log("Carousel.render");
		if (this.el.parentElement) {
			this.createChildrenNow();
			this.scrollByNow(0);
		} else {
			this.createChildrenLater();
			this.scrollByLater(0, IMMEDIATE);
		}
		return this;
	},

	/** @override */
	renderLater: function () {
		this.validateRender("createChildren");
		this.validateRender("scrollBy");
		this.skipAnimation = false;
	},

	/* --------------------------- *
	 * Create children
	 * --------------------------- */

	createEmptyChildView: function () {
		return this.emptyChild = new this.emptyRenderer();
	},
	removeEmptyChildView: function () {
		this.emptyChild.remove();
		delete this.emptyChild;
	},

	createChildView: function (item) {
		var view = new this.renderer({
			model: item
		});
		this.children.add(view);
		return view;
	},
	removeChildView: function (view) {
		this.children.remove(view);
		view.remove();
		return view;
	},

	_createChildren: function () {
		//console.log("Carousel.children: " + (this.collection.length || "empty"));
		var buffer;
		if (this._resetPending) {
			this.removeChildren();
			delete this._resetPending;
		}
		if (this.collection.length) {
			buffer = document.createDocumentFragment();
			buffer.appendChild(this.createEmptyChildView().el);
			this.collection.each(function (item, index) {
				buffer.appendChild(this.createChildView(item, index).el);
			}, this);
			this.$el.append(buffer);
		}
		this.updateSize();
	},
	createChildrenNow: function (){
		this._createChildren();
	},
	createChildrenLater: function () {
		this.requestRender("createChildren", _.bind(this._createChildren, this));
	},

	removeChildren: function () {
		this.children.each(this.removeChildView, this);
	},

	/* --------------------------- *
	 * resize
	 * --------------------------- */

	/** @param {Object} ev */
	_onResize: function (ev) {
		this.updateSize();
		this.scrollByNow(0);
	},

	updateSize: function() {
		var maxSize = 0, sizeProp = this.dirProp("offsetHeight", "offsetWidth");
		// viewport length
		this.containerSize = this.emptyChild.render().el[this.dirProp("offsetWidth", "offsetHeight")];
		// viewport width
		this.children.each(function(child) {
			maxSize = Math.max(maxSize, child.render().el[sizeProp]);
		}, this);
		this.$el.css(this.dirProp("minHeight", "minWidth"), (maxSize > 0)? maxSize: "");
	},

	getContainerSize: function () {
		if (this.containerSize === undefined || this.containerSize === 0) {
			this.containerSize = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		}
		return this.containerSize;
	},

	/* --------------------------- *
	 * Scroll/layout
	 * --------------------------- */

//	animationRequests: [],

	getScrollIndex: function () {
		return this.collection.selectedIndex;
	},

	scrollByLater: function (delta, skipAnimation) {
//		this.animationRequests.push(skipAnimation ? "immediate" : "animated");
		_.isBoolean(skipAnimation) && (this.skipAnimation = this.skipAnimation || skipAnimation);
		this.requestRender("scrollBy", _.bind(this._scrollBy, this, delta, this.getScrollIndex()));
	},

	scrollByNow: function (delta) {
		this._scrollBy(delta, this.getScrollIndex(), true);
	},

	_scrollBy: function (delta, scrollIndex, skipAnimation) {
//		console.log("Carousel.scrollBy", this.skipAnimation ? "skipping" : "animating", this.animationRequests.concat());
//		this.animationRequests.length = 0;

		var pos, size = this.getContainerSize();
		skipAnimation = _.isBoolean(skipAnimation)? skipAnimation : this.skipAnimation;

		pos = (size * (-1 - scrollIndex)) + delta;
		this._scrollChildTo(this.emptyChild, pos, skipAnimation);
		// NOTE: looping through the models, not children; what if they have not been created yet?
		this.collection.each(function (model, index) {
			pos = (size * (index - scrollIndex)) + delta;
			this._scrollChildTo(this.children.findByModel(model), pos, skipAnimation);
		}, this);
	},

	_scrollChildTo: function (view, pos, skipAnimation) {
		var translate = this.dirProp(
			"translate3d(" + pos + "px,0,0)",
			"translate3d(0," + pos + "px,0)"
		);
		if (skipAnimation) {
			view.$el.css({ transform: translate });
		} else {
			view.$el.transit({
				transform: translate
			}, 400);
		}
	},

	_positionTransformFilter: function (pos, size, beforeGap, afterGap) {
		var val = 0;
		if (beforeGap > 0 && 0 > pos) {
			if (pos > (-size)) {
				val = beforeGap / size * pos;
			} else {
				val = -beforeGap;
			}
		} else if (afterGap > 0 && 0 < pos) {
			if (pos < size) {
				val = afterGap / size * pos;
			} else {
				val = afterGap;
			}
		}
		return val;
	},

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

	dirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},
});

module.exports = Carousel;
