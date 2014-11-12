/**
 * @module app/view/ImageListView
 * @requires module:backbone
 */

/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/view/render/ImageView} */
var ImageView = require( "./render/ImageView" );
require("backbone.babysitter");

/**
 * @constructor
 * @type {module:app/view/ImageListView}
 */
module.exports  = Backbone.View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "image-list",
	/** @type {Number} */
	threshold: 20,
	/** @type {Number} */
	direction: Hammer.DIRECTION_HORIZONTAL,

	initialize: function(options) {
		_.bindAll(this, "onPan", "renderLayout");

		this.container = this.el;
		this.$container = this.$el;

		this.hammer = new Hammer.Manager(this.container);
		this.hammer.add(new Hammer.Pan({
			direction: this.direction,
			threshold: this.threshold,
		}));

		this.hammer.on("panstart panmove panend pancancel", this.onPan);
		Backbone.$(window).on("orientationchange resize", this.renderLayout);

		this.listenTo(this.collection, "reset", this.onCollectionReset);
		this.listenTo(this.collection, "deselect:one", this.onDeselectOne);
		this.listenTo(this.collection, "select:one", this.onSelectOne);
		this.listenTo(this.collection, "select:none", this.onSelectNone);

		this.listenTo(Backbone, "app:bundleList", this.whenAppBundleList);
		this.listenTo(Backbone, "app:bundleItem", this.whenAppBundleItem);

	},

	render: function() {
		var eltBuffer, view, viewSize, maxSize = 0;

		this.removeChildren();
		this.$container.empty();

		if (this.collection.length) {
			eltBuffer = document.createDocumentFragment();
			// eltBuffer = document.createElement("div");
			this.collection.each(function(model, index, arr) {
				view = this.createChildView(model, index);
				eltBuffer.appendChild(view.render().el);
				// Get the tallest height for the container
				viewSize = view[this.getDirProp("getConstrainedHeight", "getConstrainedWidth")]();
				maxSize = Math.max(maxSize, viewSize);
			}, this);

			this.$container.css(this.getDirProp("height", "width"), maxSize);
			this.$container.append(eltBuffer);
			this.renderLayout();
		}
		return this;
	},

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

	/* --------------------------- *
	 * app state
	 * --------------------------- */

	/* App event handlers */
	whenAppBundleList: function() {
		// this.collection.reset();
	},

	whenAppBundleItem: function(bundle) {
		// this.collection.reset(bundle.get("images"));
	},

	/* --------------------------- *
	 * Selection
	 * --------------------------- */

	/* Model event handlers */
	onCollectionReset: function() {
		this.render();
		this.animate = false;
		// if (this.collection.length > 0) {
		// 	var firstItem = this.collection.first();
		// }
	},

	/** @private */
	onSelectNone: function() {
	},
	onSelectOne: function(image) {
		this.children.findByModel(image).startImageLoad();
		var nextImage = this.collection.nextNoLoop();
		if (nextImage) {
			this.children.findByModel(nextImage).startImageLoad();
		}
		this.scrollToIndex(0, this.animate);
		this.animate = true;
		// this.children.findByModel(image).$el.addClass("selected");
	},
	onDeselectOne: function(image) {
		// this.children.findByModel(image).$el.removeClass("selected");
	},

	/**
	 * handle pan
	 * @param {Object} ev
	 */
	onPan : function (ev) {
		var index = this.getScrollIndex();
		// var index = this.currentIndex;
		var delta = this.getDirProp(ev.deltaX, ev.deltaY);
		// delta /= this.containerSize;

		var isOutOfBounds =
			(index == 0 && delta > 0) ||
			(index == this.children.length - 1 && delta < 0);

		switch(ev.type) {
			case "panstart":
			/* falls through */
			case "panmove":
				if (isOutOfBounds) {
					// when at first or last index, add feedback to gesture
					delta *= 0.2;
				} else {
					// remove threshold to prevent pan jump
					delta += (delta < 0) ? this.threshold : -this.threshold;
				}
				this.scrollToIndex(delta/this.containerSize, false);
				break;
			case "panend":
				if (!isOutOfBounds && Math.abs(delta/this.containerSize) > 0.15) {
					this.trigger("view:itemSelect", (delta < 0)?
						this.collection.next(): this.collection.prev());
				} else {
					this.scrollToIndex(0, true);
				}
				break;
			case "pancancel":
				this.scrollToIndex(0, true);
				break;
			default:
				return;
		}
	},

	/** @private */
	renderLayout : function () {
		this.containerSize = this.container[this.getDirProp("offsetWidth", "offsetHeight")];
		this.scrollToIndex(0, false);
	},

	/**
	 * @param {Number} [delta] percentage visible
	 * @param {Boolean} [animate]
	 */
	scrollToIndex: function(delta, animate) {
		if (animate) {
			this.$el.addClass("animate");
		} else {
			this.$el.removeClass("animate");
		}

		var pos, scrollIndex;
		scrollIndex = this.getScrollIndex();
		// scrollIndex = Math.max(0, Math.min(scrollIndex, this.children.length - 1)); // out of bounds check
		delta = delta || 0; // non null check

		this.collection.each(function(model, index) {
			pos = this.containerSize * ((index - scrollIndex) + delta);
			this.scrollElementTo(this.children.findByModel(model).el, pos);
		}, this);

		/*
		var elementIndex, numElements;
		var beforeGap = 0, afterGap = 0;
		numElements = this.elements.length;
		scrollIndex = Math.max(0, Math.min(scrollIndex, numElements - 1)); // out of bounds check
		for (elementIndex = 0; elementIndex < numElements; elementIndex++) {
			pos = this.containerSize * ((elementIndex - scrollIndex) + delta);
			if (beforeGap > 0 && 0 > pos) {
				if (pos > (-this.containerSize)) {
					pos += beforeGap/this.containerSize * pos;
				} else {
					pos += -beforeGap;
				}
			} else
			if (afterGap > 0 && 0 < pos) {
				if (pos < this.containerSize) {
					pos += afterGap/this.containerSize * pos;
				} else {
					pos += afterGap;
				}
			}
			this.scrollElementTo(this.elements[elementIndex], pos);
		}*/
	},

	scrollElementTo:function(elt, pos) {
		var translate;
		if(this.direction & Hammer.DIRECTION_HORIZONTAL) {
			translate = "translate3d(" + pos + "px, 0, 0)";
		} else {
			translate = "translate3d(0, " + pos + "px, 0)";
		}
		elt.style.transform = translate;
		elt.style.mozTransform = translate;
		elt.style.webkitTransform = translate;
	},

	getScrollIndex: function () {
		return this.collection.selected? this.collection.indexOf(this.collection.selected) : 0;
	},

	/**
	 * @param
	 * @param
	 * @return {hProp|vProp}
	 */
	getDirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},

});
