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

var DefaultEmptyRenderer = View.extend({
	className: "carousel-item empty-item",
	initialize: function (options) {
		this.listenTo(this.collection, "select:one select:none", this.render);
	},
	render: function() {
		if (this.collection.selected) {
			this.$el.removeClass("selected");
		} else {
			this.$el.addClass("selected");
		}
		return this;
	}
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
	emptyRenderer: DefaultEmptyRenderer,

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
		DeferredRenderView.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * Hammer events
	 * --------------------------- */

	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.$el.addClass("panning");
		this.children.each(function(view) {
			view.$el.clearQueue();
		});
		this.thresholdOffset = (this.getEventDelta(ev) < 0)? this.panThreshold : -this.panThreshold;
		this._onPanMove(ev);
	},

	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var delta = this.getEventDelta(ev);
		delta += this.thresholdOffset;
		// when at first or last index, add feedback to gesture
		if (this.isOutOfBounds(delta)) {
			delta *= 0.2;
		}
		this.scrollByNow(delta, IMMEDIATE);
	},

	/** @param {Object} ev */
	_onPanCancel: function (ev) {
		this.scrollByLater(0, ANIMATED);
		this.$el.removeClass("panning");
	},

	/** @param {Object} ev */
	_onPanEnd: function (ev) {
		var delta = this.getEventDelta(ev);
		delta += this.thresholdOffset;
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
		this.$el.removeClass("panning");
	},

	/* --------------------------- *
	 * event helper functions
	 * --------------------------- */

	getEventDelta: function (ev) {
		var delta = 0;
		delta += (this.direction & Hammer.DIRECTION_HORIZONTAL)? ev.deltaX : ev.deltaY;
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
		if (this.el.parentElement) {
			this.createChildrenNow();
			this.scrollByNow(0, IMMEDIATE);
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
		return this.emptyChild = new this.emptyRenderer({
			collection: this.collection
		});
	},

	removeEmptyChildView: function () {
		if (this.emptyChild) {
			this.emptyChild.remove();
			delete this.emptyChild;
		} else {
			console.warn("Carousel.removeEmptyChildView called while emptyChild is undefined");
		}
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
		var buffer;
		if (this._resetPending) {
			this.removeChildren();
			this._resetPending = false;
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
		this.removeEmptyChildView();
		this.children.each(this.removeChildView, this);
	},

	/* --------------------------- *
	 * resize
	 * --------------------------- */

	/** @param {Object} ev */
	_onResize: function (ev) {
		this.updateSize();
		this.scrollByNow(0, IMMEDIATE);
	},

	updateSize: function() {
		var size;
//		var minSize = Number.POSITIVE_INFINITY;
		var maxSize = 0;
		var maxAcross = 0;

		var measure = function(child) {
			size = this.measureChild(child.render());
//			minSize = Math.min(minSize, size.inner);
			maxSize = Math.max(maxSize, size.outer);
			maxAcross = Math.max(maxAcross, size.across);
		};

		this.children.each(measure, this);
		measure.call(this, this.emptyChild);

		this.childSize = maxSize;
		this.containerSize = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		this.$el.css(this.dirProp("minHeight", "minWidth"), (maxAcross > 0)? maxAcross: "");
	},

	_childSizes: {},

	measureChild: function(child) {
		var sizes = {};
		var childEl = child.el;
		var contentEl = childEl.firstChild;

		sizes.outer = childEl[this.dirProp("offsetWidth", "offsetHeight")];
		sizes.across = childEl[this.dirProp("offsetHeight", "offsetWidth")];

		if (contentEl) {
			sizes.inner = contentEl[this.dirProp("offsetWidth", "offsetHeight")];
			sizes.before = contentEl[this.dirProp("offsetLeft", "offsetTop")];
			sizes.after = sizes.outer - (sizes.inner + sizes.before);
		} else {
			sizes.inner = sizes.outer;
			sizes.before = 0;
			sizes.after = 0;
		}
//		console.log("carousel sizes", sizes);

		return this._childSizes[child.cid] = sizes;
	},

	/* --------------------------- *
	 * Scroll/layout
	 * --------------------------- */

	getScrollIndex: function () {
		return this.collection.selectedIndex;
	},

	scrollByLater: function (delta, skipAnimation) {
		_.isBoolean(skipAnimation) && (this.skipAnimation = this.skipAnimation || skipAnimation);
		this.requestRender("scrollBy", _.bind(this._scrollBy, this, delta, this.getScrollIndex()));
	},

	scrollByNow: function (delta, skipAnimation) {
		this._scrollBy(delta, this.getScrollIndex(), skipAnimation);
	},

	_scrollBy: function (delta, scrollIndex, skipAnimation) {
		var pos, size, child;
		skipAnimation = _.isBoolean(skipAnimation)? skipAnimation : this.skipAnimation;

//		size = this.containerSize;
		size = this.childSize;
		pos = (size * (-1 - scrollIndex)) + delta;
		pos += this._scrollOffset(this.emptyChild, pos, size);
		this._scrollChildTo(this.emptyChild, pos, skipAnimation);

		// NOTE: looping through the models, not children; what if they have not been created yet?
		this.collection.each(function (model, index) {
			child = this.children.findByModel(model);
			pos = (size * (index - scrollIndex)) + delta;
			pos += this._scrollOffset(child, pos, size);
			this._scrollChildTo(child, pos, skipAnimation);
		}, this);
	},

	_scrollOffset: function (child, pos, size) {
		var val = 0;
		var s = this._childSizes[child.cid];

		if (0 > pos) {
			if (Math.abs(pos) < size) {
				val += (-s.after) / size * pos;
			} else {
				val += (-s.after) * -1;
			}
		} else
		if (0 <= pos) {
			if (Math.abs(pos) < size) {
				val -= s.before / size * pos;
			} else {
				val -= s.before;
			}
		}
		return val;
	},

	_scrollChildTo: function (view, pos, skipAnimation) {
		var duration = 400;
		var translate = this.dirProp("translate3d(" + pos + "px,0,0)", "translate3d(0," + pos + "px,0)");
		if (skipAnimation) {
			view.$el.css({ transform: translate });
		} else {
			view.$el.transit({ transform: translate }, duration);
		}
	},

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

	dirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},
});

module.exports = Carousel;
