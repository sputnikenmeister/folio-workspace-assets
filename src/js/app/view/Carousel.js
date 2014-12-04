/**
 * @module app/view/Carousel
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require("../helper/DeferredRenderView");

/**
 * @constructor
 * @type {module:app/view/Carousel}
 */
module.exports = DeferredRenderView.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel",
	/** @type {Number} factor 0-1 */
	selectThreshold: 0.15,
	/** @type {int} In pixels */
	panThreshold: 20,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,

	/** @override */
	events: {
		"panstart": "onPanStart",
		"panmove": "onPanMove",
		"panend": "onPanEnd",
		"pancancel": "onPanCancel"
	},

	/** @override */
	initialize: function (options) {
		if (options.direction === Hammer.DIRECTION_VERTICAL)
			this.direction = Hammer.DIRECTION_VERTICAL;

		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({
			direction: this.direction,
			threshold: this.panThreshold,
		}));

//		_.bindAll(this, "onPanStart", "onPanMove", "onPanEnd", "onPanCancel");
//		this.hammer.on("panstart", this.onPanStart);
//		this.hammer.on("panmove", this.onPanMove);
//		this.hammer.on("panend", this.onPanEnd);
//		this.hammer.on("pancancel", this.onPanCancel);
//		this.hammer.on("panstart panmove panend pancancel", function(ev) { console.log(ev.type); });

		_.bindAll(this, "onResize");
		Backbone.$(window).on("orientationchange resize", this.onResize);

		this.listenTo(this.collection, "reset", this.onCollectionReset);
		this.listenTo(this.collection, "select:one", this.onSelectOne);
	},

	remove: function () {
		this.removeChildren();
		Backbone.View.prototype.remove.apply(this, arguments);
		Backbone.$(window).off("orientationchange resize", this.onResize);
//		this.hammer.off("panstart panmove panend pancancel");
		this.hammer.destroy();
	},

	/* --------------------------- *
	 * Hammer/DOM events
	 * --------------------------- */

	/** @param {Object} ev */
	onResize: function (ev) {
		delete this.containerSize;
		this.scrollToSelection(true);
	},

	/** @param {Object} ev */
	onPanStart: function (ev) {
		var delta = this.getDirProp(ev.gesture.deltaX, ev.gesture.deltaY);
		// save threshold to prevent jump
		this.thresholdOffset = (delta < 0) ? this.panThreshold : -this.panThreshold;
		this.onPanMove(ev);
	},

	/** @param {Object} ev */
	onPanMove: function (ev) {
		var delta = this.getDirProp(ev.gesture.deltaX, ev.gesture.deltaY);
		delta += this.thresholdOffset;
		// when at first or last index, add feedback to gesture
		if (this.isOutOfBounds(delta)) {
			delta *= 0.2;
		}
		this.scrollByNow(delta);
	},

	/** @param {Object} ev */
	onPanEnd: function (ev) {
		var delta = this.getDirProp(ev.gesture.deltaX, ev.gesture.deltaY);
		delta += this.thresholdOffset;
		// If beyond select threshold, trigger selection
		if (Math.abs(delta) > this.getSelectThreshold() && !this.isOutOfBounds(delta)) {
			this.trigger("view:select:one", (delta < 0) ?
				this.collection.following() : this.collection.preceding());//, {source: this});
		} else {
			this.scrollToSelection(false);
		}
		this.thresholdOffset = void 0;
	},

	/** @param {Object} ev */
	onPanCancel: function (ev) {
		this.scrollToSelection(false);
		this.thresholdOffset = void 0;
	},

	/* --------------------------- *
	 * Selection
	 * --------------------------- */

	/* Model event handlers */
	onCollectionReset: function () {
		//console.log("Carousel.onCollectionReset");
		this.render();
	},

	/** @private */
	onSelectOne: function (image) {
		this.scrollToSelection(false);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function () {
		//console.log("Carousel.render");
		if (this.el.parentElement) {
			this.renderChildrenNow();
			this.scrollByNow(0);
		} else {
			this.renderChildren();
			this.scrollToSelection(true);
		}
		return this;
	},

	/** @override */
	deferredRender: function (timestamp) {
		this.validateRender("renderChildren");
		this.validateRender("scrollBy");
		this.skipAnimation = false;
	},

	/* --------------------------- *
	 * Child create
	 * --------------------------- */

	renderChildrenNow: function (){
		this._renderChildren();
	},
	renderChildren: function () {
		this.requestRender("renderChildren", _.bind(this._renderChildren, this));
	},
	_renderChildren: function () {
		//console.log("Carousel.children: " + (this.collection.length || "empty"));
		var childBuffer, child, crossSize = 0;

		this.removeChildren();
		if (this.collection.length) {
			childBuffer = document.createDocumentFragment();
			this.collection.each(function (model, index) {
				child = this.createChildView(model, index);
				childBuffer.appendChild(child.render().el);
				// Get the largest child cross size
				crossSize = Math.max(crossSize, child[this.getDirProp("constrainedHeight", "constrainedWidth")]);
			}, this);
			if (crossSize > 0) {
				this.$el.css(this.getDirProp("minHeight", "minWidth"), crossSize);
			}
			this.$el.append(childBuffer);
		} else {
			this.$el.css(this.getDirProp("minHeight", "minWidth"), "");
		}
	},

	/* --------------------------- *
	 * Scroll/layout
	 * --------------------------- */

	scrollToSelection: function (skipAnimation) {
		this.scrollBy(0, skipAnimation);
	},

	scrollBy: function (delta, skipAnimation) {
		//this.animationRequests.push(skipAnimation ? "immediate" : "animated");
		_.isBoolean(skipAnimation) && (this.skipAnimation = this.skipAnimation || skipAnimation);
		this.requestRender("scrollBy", _.bind(this._scrollBy, this, delta, this.getScrollIndex()));
	},

	scrollByNow: function (delta) {
		//if (this.getContainerSize() < 1) { console.warn("Carousel container size is >0", this.getContainerSize()); }
		this._scrollBy(delta, this.getScrollIndex(), true);
	},

	_scrollBy: function (delta, scrollIndex, skipAnimation) {
		//console.log("Carousel.scrollBy", this.skipAnimation ? "skipping" : "animating", this.animationRequests.concat());
		var pos, size;
		delta = delta || 0; // non null check
		size = this.getContainerSize();
		scrollIndex = scrollIndex || this.getScrollIndex();
		skipAnimation = _.isBoolean(skipAnimation)? skipAnimation : this.skipAnimation;
		// note: looping through the models, what if views have not been created yet?
		this.collection.each(function (model, index) {
			pos = (size * (index - scrollIndex)) + delta;
			this._scrollChildTo(this.children.findByModel(model), pos, skipAnimation);
		}, this);
	},

	_scrollChildTo: function (view, pos, skipAnimation) {
		var translate = (this.direction & Hammer.DIRECTION_HORIZONTAL) ?
			"translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";
		if (skipAnimation) {
			//view.$el.css({ transform: translate });
			this._setCSSTransform(view.el, translate);
		} else {
			view.$el.transit({
				transform: translate
			}, 400);
		}
	},

	_setCSSTransform: function (el, transform) {
		// faster than jquery?
		el.style.transform = transform;
		el.style.mozTransform = transform;
		el.style.webkitTransform = transform;
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

	getDirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},

	isOutOfBounds: function (delta) {
		var index = this.getScrollIndex();
		return (index == 0 && delta > 0) || (index == this.children.length - 1 && delta < 0);
	},

	getScrollIndex: function () {
		return this.collection.selected ? this.collection.indexOf(this.collection.selected) : 0;
	},

	getContainerSize: function () {
		if (this.containerSize === undefined || this.containerSize === 0) {
			this.containerSize = this.el[this.getDirProp("offsetWidth", "offsetHeight")];
		}
		return this.containerSize;
	},

	getSelectThreshold: function (delta) {
		return this.selectThreshold * this.getContainerSize();
	},

	/* --------------------------- *
	 * Child view mgmt
	 * --------------------------- */

	/** @type {Backbone.ChildViewContainer} */
	children: new Backbone.ChildViewContainer(),

	/** @type {Function} */
	renderer: ImageRenderer,

	createChildView: function (model, index) {
		var view = new this.renderer({
			model: model
		});
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
});
