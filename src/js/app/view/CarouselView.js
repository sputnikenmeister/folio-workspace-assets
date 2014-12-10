/*jslint nomen: true, vars: true, undef: true, eqeq: true, bitwise: true, sloppy: true, white: true */
/*global require, module*/

/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/view/Carousel} */
var Carousel = require("./Carousel");
/** @type {module:app/view/render/ImageRenderer} */
//var ImageRenderer = require("./render/ImageRenderer");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
module.exports = Backbone.View.extend({

	/** Setup listening to model changes */
	initialize: function (options) {
//		this.listenTo(Backbone, {
//			"app:BundleItem:done": this.createChildren,
//			"app:BundleItem:change": this.updateChildren,
//			"app:BundleList:start": this.removeChildren
//		});
		this.listenTo(Backbone, "app:BundleItem:done", this.createChildren);
		this.listenTo(Backbone, "app:BundleItem:change", this.updateChildren);
		this.listenTo(Backbone, "app:BundleList:start", this.removeChildren);
	},

	/** @override */
	render: function () {
		return this;
	},

	/** @override */
	remove: function () {
		this.removeChildren();
		Backbone.View.prototype.remove.apply(this, arguments);
	},

	/* -------------------------------
	 * Bundle Components
	 * ------------------------------- */

	createChildren: function () {
		this.createCarousel();
//		this.listenTo(bundles, "select:one", this.updateChildren);
	},

	updateChildren: function () {
		this.destroyCarousel();
		this.createCarousel();
	},

	removeChildren: function () {
//		this.stopListening(bundles);
		this.destroyCarousel();
	},

	/* -------------------------------
	 * Create carousel
	 * ------------------------------- */
	createCarousel: function () {
		var handle = bundles.selected.get("handle");
		var images = bundles.selected.get("images");

		this._carousel = new Carousel({
			id: "carousel-" + handle,
			collection: images
		});
		this.listenTo(this._carousel, "view:select:one", this.onCarouselSelect);
		this.el.appendChild(this._carousel.render().el);
	},

	/* -------------------------------
	 * Destroy carousel
	 * ------------------------------- */
	destroyCarousel: function () {
		this.stopListening(this._carousel);
		this._carousel.remove();
	},

	/* -------------------------------
	 * Component listeners
	 * ------------------------------- */
	onCarouselSelect: function(model) {
		controller.selectImage(model)
	},
});
