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
// module.exports  = DeferredRenderView.extend({
module.exports  = Backbone.View.extend({

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
		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({
			direction: this.direction,
			threshold: this.panThreshold,
		}));
		// this.hammer.on("panstart panmove panend pancancel", this.onPan);

		_.bindAll(this, "onResize");
		Backbone.$(window).on("orientationchange resize", this.onResize);

		this.listenTo(this.collection, "reset", this.onCollectionReset);
		this.listenTo(this.collection, "deselect:one", this.onDeselectOne);
		this.listenTo(this.collection, "select:one", this.onSelectOne);
		this.listenTo(this.collection, "select:none", this.onSelectNone);
	},

	remove: function() {
		Backbone.View.prototype.remove.apply(this, arguments);
		Backbone.$(window).off("orientationchange resize", this.onResize);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function() {
		return this;
	},

	// /** @override */
	// deferredRender: function (timestamp) {
	// 	this.validateRender("updateChildren");
	// 	this.validateRender("scrollBy");
	// },

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
			this.trigger("view:itemSelect", (delta < 0)?
				this.collection.nextNoLoop(): this.collection.prevNoLoop());
		} else {
			this.scrollBy(0, true);
		}
	},

	/** @param {Object} ev */
	onPanCancel: function(ev) {
		this.scrollBy(0, true);
	},

	/** @param {Object} ev */
	onResize: function (ev) {
		this.containerSize = null;
		this.scrollBy(0, false);
	},

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

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
	 * Selection
	 * --------------------------- */

	/* Model event handlers */
	onCollectionReset: function() {
		this.updateChildren();
		this.animate = false;
	},

	/** @private */
	onSelectOne: function(image) {
		// this.requestImageLoad(image);
		// this.requestImageLoad(this.collection.nextNoLoop());
		// this.requestImageLoad(this.collection.prevNoLoop());

		this.scrollBy(0, this.animate);
		this.animate = true;
	},

	// requestImageLoad: function (model) {
	// 	if (model) {
	// 		var view = this.children.findByModel(model);
	// 		if (view) {
	// 			view.requestImageLoad();
	// 		}
	// 	}
	// },

	onSelectNone: function() {},

	onDeselectOne: function(image) {},

	/* --------------------------- *
	 * Child views
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

	updateChildren: function() {
	// 	this.requestRender("updateChildren", _.bind(this.renderUpdateChildren, this));
	// },
	// renderUpdateChildren: function() {
		var elBuffer, view, maxSize = 0;
		var containerSize = this.getContainerSize();

		this.removeChildren();
		this.$el.empty();

		if (this.collection.length) {
			elBuffer = document.createDocumentFragment();
			this.collection.each(function(model, index, arr) {
				view = this.createChildView(model, index);
				elBuffer.appendChild(view.render().el);
				// Get the largest *opposite* dimension for the container
				maxSize = Math.max(maxSize,
					view[this.getDirProp("getConstrainedHeight", "getConstrainedWidth")]());
				// this.scrollElementTo(view.el, containerSize * index);
			}, this);

			this.$el.css(this.getDirProp("height", "width"), maxSize);
			this.$el.append(elBuffer);
		} else {
			this.$el.css(this.getDirProp("height", "width"), "0");
		}
	},

	/* --------------------------- *
	 * Scroll
	 * --------------------------- */

	/**
	 * @param {Number} [delta] pixels visible
	 * @param {Boolean} [animate]
	 */
	scrollBy: function(delta, animate) {
	// 	this.requestRender("scrollBy", _.bind(this.renderScrollBy, this, delta, animate));
	// },
	// renderScrollBy: function(delta, animate) {
		var pos, scrollIndex, size;

		if (animate) {
			this.$el.addClass("animate");
		} else {
			this.$el.removeClass("animate");
		}

		delta = delta || 0; // non null check
		size = this.getContainerSize();
		scrollIndex = this.getScrollIndex();

		this.collection.each(function(model, index) {
			pos = (size * (index - scrollIndex)) + delta;
			this.scrollElementTo(this.children.findByModel(model).el, pos);
		}, this);
	},

	scrollElementTo: function (el, pos) {
		var translate;
		if(this.direction & Hammer.DIRECTION_HORIZONTAL) {
			translate = "translate3d(" + pos + "px, 0, 0)";
		} else {
			translate = "translate3d(0, " + pos + "px, 0)";
		}
		el.style.transform = translate;
		el.style.mozTransform = translate;
		el.style.webkitTransform = translate;
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
		} else
		if (afterGap > 0 && 0 < pos) {
			if (pos < size) {
				val = afterGap/size * pos;
			} else {
				val = afterGap;
			}
		}
		return val;
	},

	getDirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},

});
