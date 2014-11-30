/*jslint nomen: true, vars: true, undef: true, eqeq: true, bitwise: true, sloppy: true, white: true */
/*global require, module*/

/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/view/Carousel} */
var Carousel = require("./Carousel");
/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");

/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/model/collection/ImageList} */
var images = require("../model/collection/ImageList");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageDescTemplate = require("./template/CollectionStack.Image.tpl");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = Backbone.View.extend({

	/** Setup listening to model changes */
	initialize: function (options) {
		this.listenTo(Backbone, "all", this.onApplicationEvent);
	},

	onApplicationEvent: function (eventName) {
		switch (eventName) {
		case "app:bundle:item":
			this.createChildren();
			break;
		case "app:bundle:list":
			/* falls through */
		default:
			this.removeChildren();
			break;
		}
	},

	createChildren: function () {
		var container, buffer;
		// create & render children outside the dom
		buffer = document.createDocumentFragment();
		// content-detail (layout container)
		container = document.createElement("div");
		container.id = "content-detail";
		buffer.appendChild(container);
		// selected bundle/image description
		this.bundleDetail = new CollectionStack({
			id: "bundle-detail",
			template: bundleDescTemplate,
			collection: bundles
		});
		container.appendChild(this.bundleDetail.render().el);
		this.imageDetail = new CollectionStack({
			id: "image-detail",
			template: imageDescTemplate,
			collection: images
		});
		container.appendChild(this.imageDetail.render().el);
		// dot nav, if there's more than one image
		if (images.length > 1) {
			this.imagePager = new SelectableListView({
				id: "images-pager",
				collection: images
			});
			this.imagePager.$el.addClass("dots-fontello text-color-faded");
			controller.listenTo(this.imagePager, "view:select:one", controller.selectImage);
			container.appendChild(this.imagePager.render().el);
		}
		// carousel
		this.imageCarousel = new Carousel({
			id: "bundle-images",
			collection: images
		});
		controller.listenTo(this.imageCarousel, "view:select:one", controller.selectImage);
		buffer.appendChild(this.imageCarousel.render().el);
		this.el.appendChild(buffer);
	},

	removeChildren: function () {
		if (this.imagePager) {
			controller.stopListening(this.imagePager);
			this.imagePager.remove();
		}
		this.imageDetail.remove();
		this.bundleDetail.remove();

		controller.stopListening(this.imageCarousel);
		this.imageCarousel.remove();

		this.$el.empty(); // removes div#content-detail
	},

});

module.exports = ContentView;
