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

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require( "../model/item/ImageItem" );
/** @type {module:app/model/collection/ImageList} */
var ImageList = require( "../model/collection/ImageList" );
/** @type {module:app/view/render/ImageView} */
var ImageView = require( "./render/ImageView" );

/**
 * @constructor
 * @type {module:app/view/ImageListView}
 */
module.exports  = Backbone.View.extend({

	tagName: "div",

	className: "image-list",

	collection: ImageList,

	model: ImageItem,

	initialize: function(options) {
		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({direction: this.direction, threshold: 10}));

		_.bindAll(this, "onPan", "onWindowResize");
		this.hammer.on("panstart panmove panend pancancel", this.onPan);
		Backbone.$(window).on("load orientationchange resize", this.onWindowResize);

		this.listenTo(Backbone, "app:bundleList", this.whenAppBundleList);
		this.listenTo(Backbone, "app:bundleItem", this.whenAppBundleItem);

		this.listenTo(this.collection, "reset", this.whenCollectionReset);
		this.listenTo(this.collection, "collection:select", this.whenCollectionSelect);
	},

	/* App event handlers */
	whenAppBundleList: function() {
		this.collection.reset();
	},

	whenAppBundleItem: function(bundle) {
		this.collection.reset(bundle.get("images"));
		this.collection.select(this.collection.first());
	},

	/* Model event handlers */
	whenCollectionReset: function() {
		this.render();
	},

	whenCollectionSelect: function(newItem, oldItem) {
		if (newItem) {
			this.getItemView(newItem).$el.addClass("selected");
		}
		if (oldItem) {
			this.getItemView(oldItem).$el.removeClass("selected");
		}
	},

	render: function() {
		var eltBuffer, view, viewSize, maxSize = 0;

		eltBuffer = document.createDocumentFragment();
		// eltBuffer = document.createElement("div");
		this._itemViews = [];
		this._itemViewsIndex = {};
		this._itemEls = [];
		this._itemElsIndex = {};

		this.collection.each(function(model, index, arr) {
			// Create view and render element into buffer
			view = new ImageView({model: model});
			eltBuffer.appendChild(view.render().el);
			this._itemViews[index] = this._itemViewsIndex[model.id] = view;
			this._itemEls[index] = this._itemElsIndex[model.id] = view.el;

			// Get the tallest height for the container
			viewSize = view[this.getDirProp("computedHeight", "computedWidth")];
			maxSize = Math.max(maxSize, viewSize);
			console.log("[ImageListView] view "+ model.selector(), view.computedWidth, view.computedHeight);
		}, this);

		console.log("[ImageListView] max: " + this.getDirProp("computedWidth","computedHeight") + " = " + maxSize);
		this.$el.empty();
		this.$el.css(this.getDirProp("height", "width"), maxSize);
		this.$el.append(eltBuffer);

		this.containerSize = this.el[this.getDirProp("offsetWidth", "offsetHeight")];
		this.currentIndex = 0;
		this.show(this.currentIndex);

		return this;
	},

	/**
	 * handle pan
	 * @param {Object} ev
	 */
	onPan : function (ev) {
		var delta = this.getDirProp(ev.deltaX, ev.deltaY);
		var percent = (100 / this.containerSize) * delta;
		var animate = false;
		var proposedIndex = this.currentIndex;
		var lastIndex = this.collection.length - 1;


		if (ev.type == "panend" || ev.type == "pancancel") {
			if (Math.abs(percent) > 20 && ev.type == "panend") {
				// when panned by >20%, selection may need change
				proposedIndex += (percent < 0) ? 1 : -1;
				if (0 <= proposedIndex && proposedIndex <= lastIndex) {
					this.trigger("view:itemSelect", this.collection.at(proposedIndex));
					this.currentIndex = proposedIndex;
				}
			}
			percent = 0;
			animate = true;
		} else if ((this.currentIndex == 0 && percent > 0) || (this.currentIndex == lastIndex && percent < 0)) {
			// when at first or last index, add factor for a spring-like effect
			percent *= 0.2;
		}
		this.show(this.currentIndex, percent, animate);
	},

	/** @private */
	onWindowResize : function (ev) {
		this.containerSize = this.el[this.getDirProp("offsetWidth", "offsetHeight")];
		this.show(this.currentIndex);
	},

	/**
	 * show a pane
	 * @param {Number} showIndex
	 * @param {Number} [percent] percentage visible
	 * @param {Boolean} [animate]
	 */
	show: function(showIndex, percent, animate){
		var elements = this.getAllItemElements();
		var numElements = elements.length;
		// out of bounds check
		showIndex = Math.max(0, Math.min(showIndex, numElements - 1));
		percent = percent || 0;

		if (animate) {
			this.$el.addClass("animate");
		} else {
			this.$el.removeClass("animate");
		}

		var elementIndex, pos, translate, indexDelta;
		for (elementIndex = 0; elementIndex < numElements; elementIndex++) {
			pos = (this.containerSize / 100) * (((elementIndex - showIndex) * 100) + percent);

			// indexDelta =  (elementIndex - showIndex) / numElements;
			// console.log("show:", pos, indexDelta);
			// pos *= (elementIndex - showIndex) / numElements + 0.25;

			if(this.direction & Hammer.DIRECTION_HORIZONTAL) {
				translate = "translate3d(" + pos + "px, 0, 0)";
			} else {
				translate = "translate3d(0, " + pos + "px, 0)";
			}
			 elements[elementIndex].style.transform = translate;
			 elements[elementIndex].style.mozTransform = translate;
			 elements[elementIndex].style.webkitTransform = translate;
		}

		this.currentIndex = showIndex;
	},

	/** @type {Number} */
	direction: Hammer.DIRECTION_HORIZONTAL,

	/**
	 * @param
	 * @param
	 * @return {hProp|vProp}
	 */
	getDirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},

	/** @private */
	_itemViewsIndex: {},
	/** @private */
	getItemView: function(model) {
		return this._itemViewsIndex[model.id];
	},

	/** @private */
	_itemElsIndex: {},
	/** @private */
	getItemElement: function(model) {
		return this._itemElsIndex[model.id];
	},

	/** @private */
	_itemViews: [],
	/** @private */
	getAllItemViews: function() {
		return this._itemViews;
	},

	/** @private */
	_itemEls: [],
	/** @private */
	getAllItemElements: function() {
		return this._itemEls;
	},

});
