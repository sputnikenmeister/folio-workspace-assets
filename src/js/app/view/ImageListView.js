/**
 * @module app/view/ImageListView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:velocity-animate} */
var Velocity = require("velocity-animate");
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/view/render/ImageView} */
var ImageView = require( "./render/ImageView" );
/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require("../helper/DeferredRenderView");

/**
 * @constructor
 * @type {module:app/view/ImageListView}
 */
module.exports  = DeferredRenderView.extend({
// module.exports  = Backbone.View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "image-list",
	/** @type {Number} factor 0-1 */
	selectThreshold: 0.15,
	/** @type {int} In pixels */
	panThreshold: 20,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,

	events: {
		"panstart" : "onPanMove",
		"panmove" : "onPanMove",
		"panend" : "onPanEnd",
		"pancancel" : "onPanCancel"
	},

	initialize: function(options) {
		if (options.direction === Hammer.DIRECTION_VERTICAL)
			this.direction = Hammer.DIRECTION_VERTICAL;

		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({
			direction: this.direction,
			threshold: this.panThreshold,
		}));
		// this.hammer.on("panstart panmove panend pancancel", this.onPan);

		_.bindAll(this, "onResize");
		Backbone.$(window).on("orientationchange resize", this.onResize);

		this.listenTo(this.collection, "reset", this.onCollectionReset);
		this.listenTo(this.collection, "select:one", this.onSelectOne);
	},

	remove: function() {
		Backbone.View.prototype.remove.apply(this, arguments);
		Backbone.$(window).off("orientationchange resize", this.onResize);
	},

	/* --------------------------- *
	 * Hammer/DOM events
	 * --------------------------- */

	/** @param {Object} ev */
	onPanMove: function(ev) {
		var delta = this.getDirProp(ev.gesture.deltaX, ev.gesture.deltaY);
		// remove threshold to prevent jump
		delta += (delta < 0) ? this.panThreshold : -this.panThreshold;
		// when at first or last index, add feedback to gesture
		if (this.isOutOfBounds(delta)) {
			delta *= 0.2;
		}
		this.scrollBy(delta, false);
	},

	/** @param {Object} ev */
	onPanEnd: function(ev) {
		var delta = this.getDirProp(ev.gesture.deltaX, ev.gesture.deltaY);
		// If beyond select threshold, trigger selection
		if (Math.abs(delta) > this.getSelectThreshold() && !this.isOutOfBounds(delta)) {
			this.trigger("view:select:one", (delta < 0)?
				this.collection.nextNoLoop(): this.collection.prevNoLoop());
		} else {
			this.scrollToSelection(true);
		}
	},

	/** @param {Object} ev */
	onPanCancel: function(ev) {
		this.scrollToSelection(true);
	},

	/** @param {Object} ev */
	onResize: function (ev) {
		delete this.containerSize;
		this.scrollToSelection(false);
	},

	/* --------------------------- *
	 * Selection
	 * --------------------------- */

	/* Model event handlers */
	onCollectionReset: function() {
		this.render();
	},

	/** @private */
	onSelectOne: function(image) {
		this.scrollToSelection(true);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function() {
		this.renderChildren();
		this.scrollToSelection(false);
		return this;
	},

	/** @override */
	deferredRender: function (timestamp) {
		// console.log("ImageListView.render: " + (this.skipAnimation?"deferred":"animated"));

		if (this.skipAnimation) {
			this.$el.removeClass("animate");
			this.skipAnimation = false;
		} else {
			this.$el.addClass("animate");
		}

		this.validateRender("renderChildren");
		this.validateRender("scrollBy");
	},

	/* --------------------------- *
	 * Child create
	 * --------------------------- */

	renderChildren: function() {
		this.requestRender("renderChildren", _.bind(this.renderChildren_deferred, this));
	},
	renderChildren_deferred: function() {
		var childBuffer, child, childSize, maxSize = 0;
		var containerSize = this.getContainerSize();

		this.removeChildren();

		if (this.collection.length) {
			childBuffer = document.createDocumentFragment();

			this.collection.each(function(model, index) {
				child = this.createChildView(model, index);
				childBuffer.appendChild(child.render().el);
				// Get the largest *opposite* dimension for the container
				// childSize = child[this.getDirProp("getConstrainedHeight", "getConstrainedWidth")]();
				// maxSize = Math.max(maxSize, childSize);
			}, this);

			this.$el.append(childBuffer);
			// console.log(maxSize, this.el.getBoundingClientRect(), this.el.clientHeight, this.el.offsetHeight,
			//	this.$el.outerHeight(), this.$el.innerHeight(), this.$el.children().outerHeight());
			maxSize = this.$el.children()[this.getDirProp("outerHeight", "outerWidth")]();
			this.$el.css(this.getDirProp("minHeight", "minWidth"), maxSize);
		} else {
			this.$el.css(this.getDirProp("minHeight", "minWidth"), "");
		}
		console.log("ImageListView.children: " + (this.collection.length || "empty"));
	},

	/* --------------------------- *
	 * Scroll/layout
	 * --------------------------- */

	scrollToSelection: function (animate) {
		this.scrollBy(0, animate);
	},

	scrollBy: function(delta, animate) {
		// console.log("ImageListView.scrollBy: " + (!animate? "deferred":"animated"));

		this.skipAnimation = this.skipAnimation || !animate;
		this.requestRender("scrollBy", _.bind(this.scrollBy_deferred, this, delta));

	},
	scrollBy_deferred: function(delta) {
		var pos, scrollIndex, size;

		delta = delta || 0; // non null check
		size = this.getContainerSize();
		scrollIndex = this.getScrollIndex();

		this.collection.each(function(model, index) {
			pos = (size * (index - scrollIndex)) + delta;
			this.scrollChildTo(this.children.findByModel(model), pos);
		}, this);

	},

	// scrollChildTo: function (view, pos, animate) {
	scrollChildTo: function (view, pos) {
		var translate = (this.direction & Hammer.DIRECTION_HORIZONTAL)? "translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";
		view.el.style.transform = translate;
		view.el.style.mozTransform = translate;
		view.el.style.webkitTransform = translate;
	},

	scrollChildTo_interpolate: function (view, pos) {
		// if (animate) {
		// 	view.$el.animate(css, 300);
		// } else {
			// _.extend(view.el.style, this.interpolate(pos));
			view.$el.css(this.interpolate(pos));
		// }
	},

	interpolate: function() {
		var css = {}; // keep in closure and reuse same object
		// overwrite this method with the right variant
		this.interpolate = (this.direction & Hammer.DIRECTION_HORIZONTAL)?
			function(pos) { css.transform = css.mozTransform = css.webkitTransform = "translate3d(" + pos + "px,0,0)"; return css;}:
			function(pos) { css.transform = css.mozTransform = css.webkitTransform = "translate3d(0," + pos + "px,0)"; return css;};
		return this.interpolate.apply(this, arguments);
	},

	getScrollTransformAt: function(pos) {
		var	size = this.getContainerSize(),
			beforeGap = 0, afterGap = 0, val = 0;

		if (beforeGap > 0 && 0 > pos) {
			if (pos > (-size)) {
				val = beforeGap/size * pos;
			} else {
				val = -beforeGap;
			}
		} else if (afterGap > 0 && 0 < pos) {
			if (pos < size) {
				val = afterGap/size * pos;
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

	isOutOfBounds: function(delta) {
		var index = this.getScrollIndex();
		return (index == 0 && delta > 0) || (index == this.children.length - 1 && delta < 0);
	},

	getScrollIndex: function () {
		return this.collection.selected? this.collection.indexOf(this.collection.selected) : 0;
	},

	getContainerSize: function () {
		return this.containerSize || (this.containerSize = this.el[this.getDirProp("offsetWidth", "offsetHeight")]);
	},

	getSelectThreshold: function(delta) {
		return this.selectThreshold * this.getContainerSize();
	},

	/* --------------------------- *
	 * Child view mgmt
	 * --------------------------- */

	/** @type {Backbone.ChildViewContainer} */
	children: new Backbone.ChildViewContainer(),

	createChildView: function(model, index) {
		var view = new ImageView({model: model});
		this.children.add(view);
		return view;
	},

	removeChildren: function() {
		this.children.each(this.removeChildView, this);
	},

	removeChildView: function(view) {
		this.children.remove(view);
		view.remove();
		return view;
	},

});
