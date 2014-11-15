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
// var DeferredRenderView = require("../helper/DeferredRenderView");

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
	/** @type {Number} */
	threshold: 20,
	/** @type {Number} */
	direction: Hammer.DIRECTION_HORIZONTAL,

	events: {
		"panstart" : "onPan",
		"panmove" : "onPan",
		"panend" : "onPan",
		"pancancel" : "onPan"
	},

	onPanEvent: function(ev) {
		console.log(ev.type);
	},

	initialize: function(options) {
		_.bindAll(this, "onPan", "onContainerResize");

		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({
			direction: this.direction,
			threshold: this.threshold,
		}));

		// this.hammer.on("panstart panmove panend pancancel", this.onPan);
		Backbone.$(window).on("orientationchange resize", this.onContainerResize);
		// this.listenTo(Backbone.$(window), "orientationchange resize", this.onContainerResize);

		this.listenTo(this.collection, "reset", this.onCollectionReset);
		this.listenTo(this.collection, "deselect:one", this.onDeselectOne);
		this.listenTo(this.collection, "select:one", this.onSelectOne);
		this.listenTo(this.collection, "select:none", this.onSelectNone);

		// this.listenTo(Backbone, "app:bundleList", this.whenAppBundleList);
		// this.listenTo(Backbone, "app:bundleItem", this.whenAppBundleItem);

	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function() {
		return this;
	},

	// /** @override */
	// deferredRender: function (timestamp) {
	// 	if (this.renderJobs.updateChildren)
	// 		this.renderJobs.updateChildren();
	// 	if (this.renderJobs.scrollBy)
	// 		this.renderJobs.scrollBy();
	// },

	/* --------------------------- *
	 * Hammer/DOM events
	 * --------------------------- */

	/**
	 * handle pan
	 * @param {Object} ev
	 */
	onPan : function (ev) {
		var index = this.getScrollIndex();
		// var delta = this.getDirProp(ev.deltaX, ev.deltaY);
		var delta = this.getDirProp(ev.gesture.deltaX, ev.gesture.deltaY);
		var size = this.getContainerSize();

		var isOutOfBounds =
			(index == 0 && delta > 0) ||
			(index == this.children.length - 1 && delta < 0);

		switch(ev.type) {
			case "panstart":
			/* falls through */
			case "panmove":
				if (isOutOfBounds) {
					// when at first or last index,
					// add feedback to gesture
					delta *= 0.2;
				} else {
					// remove threshold to prevent jump
					delta += (delta < 0) ? this.threshold : -this.threshold;
				}
				this.scrollBy(delta/size, false);
				break;
			case "panend":
				if (!isOutOfBounds && Math.abs(delta/size) > 0.15) {
					this.trigger("view:itemSelect", (delta < 0)?
						this.collection.next(): this.collection.prev());
				} else {
					this.scrollBy(0, true);
				}
				break;
			case "pancancel":
				this.scrollBy(0, true);
				break;
			default:
				break;
		}
	},

	/* --------------------------- *
	 * app state
	 * --------------------------- */

	whenAppBundleList: function() {},

	whenAppBundleItem: function() {},

	/* --------------------------- *
	 * Selection
	 * --------------------------- */

	/* Model event handlers */
	onCollectionReset: function() {
		this.updateChildren();
		// this.render();
		this.animate = false;
	},

	/** @private */
	onSelectOne: function(image) {
		this.requestImageLoad(image);
		this.requestImageLoad(this.collection.nextNoLoop());
		this.requestImageLoad(this.collection.prevNoLoop());

		this.scrollBy(0, this.animate);
		this.animate = true;
	},

	onSelectNone: function() {},

	onDeselectOne: function(image) {},

	/* --------------------------- *
	 * Child views
	 * --------------------------- */

	updateChildren: function() {
	// 	this.requestRender("updateChildren", _.bind(this.renderUpdateChildren, this));
	// },
	// renderUpdateChildren: function() {
		var elBuffer, elSize, view, viewSize, maxSize = 0;

		this.removeChildren();
		this.$el.empty();

		if (this.collection.length) {
			elBuffer = document.createDocumentFragment();
			// elBuffer = document.createElement("div");
			this.collection.each(function(model, index, arr) {
				view = this.createChildView(model, index);
				elBuffer.appendChild(view.render().el);
				this.scrollElementTo(view.el, elSize * index);

				// Get the tallest height for the container
				viewSize = view[this.getDirProp("getConstrainedHeight", "getConstrainedWidth")]();
				maxSize = Math.max(maxSize, viewSize);
			}, this);

			this.$el.css(this.getDirProp("height", "width"), maxSize);
			this.$el.append(elBuffer);
		} else {
			this.$el.css(this.getDirProp("height", "width"), "");
		}
	},

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

	/* --------------------------- *
	 * Scroll
	 * --------------------------- */

	/**
	 * @param {Number} [delta] percentage visible
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
			pos = size * ((index - scrollIndex) + delta);
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

	getScrollIndex: function () {
		return this.collection.selected? this.collection.indexOf(this.collection.selected) : 0;
	},

	getContainerSize: function () {
		return this.containerSize || (this.containerSize = this.el[this.getDirProp("offsetWidth", "offsetHeight")]);
	},

	onContainerResize: function () {
		this.containerSize = null;
		this.scrollBy(0, false);
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

	requestImageLoad: function (model) {
		if (model) {
			var view = this.children.findByModel(model);
			if (view) {
				view.requestImageLoad();
			}
		}
	},

});
