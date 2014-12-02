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
/** @type {module:app/model/collection/ImageList} */
var images = require("../model/collection/ImageList");

/** @type {module:app/view/Carousel} */
var Carousel = require("./Carousel");
/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");

/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/DotNavigationRenderer} */
var DotNavigationRenderer = require("./render/DotNavigationRenderer");

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
//		this.listenTo(Backbone, "all", this.onApplicationEvent);
		this.listenTo(Backbone, "app:bundle:item", this.createChildren);
		this.listenTo(Backbone, "app:bundle:list", this.removeChildren);
	},

	render: function() {
		return this;
	},

	onApplicationEvent: function (eventName) {
		switch (eventName) {
		case "app:bundle:item":
			this.createChildren();
			this.listenTo(bundles, "select:one", this.updateChildren);
			break;
		case "app:bundle:list":
			this.removeChildren();
			this.stopListening(bundles);
			break;
		}
	},

	updateChildren: function () {
//		this.removeChildren();
//		this.createChildren();
	},

	createChildren: function () {
		var container, buffer;

		// create & render children outside the dom
		buffer = document.createDocumentFragment();

		// content-detail (layout container)
		container = document.createElement("div");
		container.id = "content-detail";
		buffer.appendChild(container);

		// selected bundle description
		this.bundleDetail = new CollectionStack({
			id: "bundle-detail",
			collection: bundles,
			model: bundles.selected,
			template: bundleDescTemplate,
		});
		container.appendChild(this.bundleDetail.render().el);

		// dot nav
		this.imagePager = new SelectableListView({
			id: "images-pager",
			collection: images,
			renderer: DotNavigationRenderer
		});
		controller.listenTo(this.imagePager, "view:select:one", controller.selectImage);
		container.appendChild(this.imagePager.render().el);

		// selected image description
//		this.imageDetail = new CollectionStack({
//			id: "image-detail",
//			collection: images,
//			model: images.selected,
//			template: imageDescTemplate,
//		});
//		this.imageDetail.$el.addClass("text-color-faded animated");
//		container.appendChild(this.imageDetail.render().el);

		// carousel
		this.imageCarousel = new Carousel({
			id: "bundle-images",
			collection: images,
			renderer: ImageRenderer
		});
		controller.listenTo(this.imageCarousel, "view:select:one", controller.selectImage);
		buffer.appendChild(this.imageCarousel.render().el);

		this.el.appendChild(buffer);
	},

	removeChildren: function () {
		controller.stopListening(this.imageCarousel);
		this.imageCarousel.remove();

		this.bundleDetail.remove();

		if (this.imagePager) {
			controller.stopListening(this.imagePager);
			this.imagePager.remove();
		}
//		if (this.imageDetail) {
//			this.imageDetail.remove();
//		}

		this.$el.empty(); // removes div#content-detail
	},

	/** @override */
	remove: function() {
		this.removeChildren();
		Backbone.View.prototype.remove.apply(this, arguments);
	},

});

module.exports = ContentView;
