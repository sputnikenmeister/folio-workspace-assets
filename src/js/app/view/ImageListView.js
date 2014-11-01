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

	events: {
		"resize": "onWindowResize"
	},

	initialize: function(options) {
		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({direction: this.direction, threshold: 10}));

		_.bindAll(this, "onPan", "onWindowResize");
		this.hammer.on("panstart panmove panend pancancel", this.onPan);
		Backbone.$(window).on("load orientationchange resize", this.onWindowResize);
		// this.listenTo(this.$el, "resize", this.onWindowResize);

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
	// 	this.renderSelection(newItem, oldItem);
	// },

	// renderSelection: function(newItem, oldItem) {
		if (oldItem) {
			this.getItemView(oldItem).$el.removeClass("selected");
		}

		if (newItem) {
			this.getItemView(newItem).$el.addClass("selected");
		}
	},

	/** @private */
	onWindowResize : function (ev) {
		this.containerSize = this.el[this.getDirProp("offsetWidth", "offsetHeight")];
		this.scrollToIndex(this.currentIndex, 0, false);
	},

	render: function() {
		var eltBuffer, view, viewSize, maxSize = 0;

		this.removeAllChildViews();

		eltBuffer = document.createDocumentFragment();
		// eltBuffer = document.createElement("div");
		this.collection.each(function(model, index, arr) {
			view = this.createChildViewAt(model, index);
			eltBuffer.appendChild(view.render().el);
			// Get the tallest height for the container
			maxSize = Math.max(maxSize, view[this.getDirProp("computedHeight", "computedWidth")]);
		}, this);

		this.$el.css(this.getDirProp("height", "width"), maxSize);
		this.$el.append(eltBuffer);
		this.containerSize = this.el[this.getDirProp("offsetWidth", "offsetHeight")];

		this.currentIndex = 0;
		this.scrollToIndex(this.currentIndex, 0, false);

		return this;
	},

	removeAllChildViews: function() {
		this._itemViews = [];
		this._itemViewsIndex = {};
		this._itemEls = [];
		this._itemElsIndex = {};
		this.$el.empty();
	},

	createChildViewAt: function(model, index) {
		var view = new ImageView({model: model});
		this._itemViews[index] = this._itemViewsIndex[model.id] = view;
		this._itemEls[index] = this._itemElsIndex[model.id] = view.el;
		return view;
	},

	/**
	 * handle pan
	 * @param {Object} ev
	 */
	onPan : function (ev) {
		var delta = this.getDirProp(ev.deltaX, ev.deltaY);
		var percent = delta / this.containerSize;
		var animate = false;
		var proposedIndex = this.currentIndex;
		var lastIndex = this.collection.length - 1;

		if (ev.type == "panend" || ev.type == "pancancel") {
			if (Math.abs(percent) > 0.2 && ev.type == "panend") {
				// when panned by >20%, selection may need change
				proposedIndex += (percent < 0) ? 1 : -1;
				if (0 <= proposedIndex && proposedIndex <= lastIndex) {
					this.trigger("view:itemSelect", this.collection.at(proposedIndex));
				}
			}
			percent = 0;
			animate = true;
		} else {
			if ((proposedIndex == 0 && percent > 0) || (proposedIndex == lastIndex && percent < 0)) {
				percent *= 0.2; // when at first or last index, add feedback to gesture
			}
		}
		this.scrollToIndex(proposedIndex, percent, animate);
	},

	/**
	 * show a pane
	 * @param {Number} showIndex
	 * @param {Number} [percent] percentage visible
	 * @param {Boolean} [animate]
	 */
	scrollToIndex: function(showIndex, percent, animate){
		var els, numEls, elsIndex, pos;
		els = this.getAllItemElements();
		numEls = els.length;
		showIndex = Math.max(0, Math.min(showIndex, numEls - 1)); // out of bounds check
		percent = percent || 0; // non null check

		if (animate) {
			this.$el.addClass("animate");
		} else {
			this.$el.removeClass("animate");
		}

		// var beforeGap = 50, afterGap = 100;
		for (elsIndex = 0; elsIndex < numEls; elsIndex++) {
			pos = this.containerSize * ((elsIndex - showIndex) + percent);
			// if (0 > pos) {
			// 	if (pos > (-this.containerSize)) {
			// 		pos += beforeGap/this.containerSize * pos;
			// 	} else {
			// 		pos += -beforeGap;
			// 	}
			// } else
			// if (0 < pos) {
			// 	if (pos < this.containerSize) {
			// 		pos += afterGap/this.containerSize * pos;
			// 	} else {
			// 		pos += afterGap;
			// 	}
			// }
			this.applyTranslate(els[elsIndex], pos);
		}
		this.currentIndex = showIndex;
	},

	applyTranslate:function(elt, pos) {
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

	/**
	 * @param
	 * @param
	 * @return {hProp|vProp}
	 */
	getDirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},

	/** @type {Number} */
	direction: Hammer.DIRECTION_HORIZONTAL,

	/*
	 * Child view mgmt
	 */

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
