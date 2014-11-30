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
		var container, children;

		// dot nav
		this.imagePager = new SelectableListView({
			id: "images-pager",
			collection: images
		});
		this.imagePager.$el.addClass("dots-fontello text-color-faded");
		controller.listenTo(this.imagePager, "view:select:one", controller.selectImage);

		// selected bundle/image description
		this.bundleDetail = new CollectionStack({
			id: "bundle-detail",
			template: bundleDescTemplate,
			collection: bundles
		});
		this.imageDetail = new CollectionStack({
			id: "image-detail",
			template: imageDescTemplate,
			collection: images
		});

		// content-detail (container)
		container = document.createElement("div");
		container.id = "content-detail";
		container.appendChild(this.bundleDetail.render().el);
		container.appendChild(this.imageDetail.render().el);
		container.appendChild(this.imagePager.render().el);

		// carrousel
		this.imageCarousel = new Carousel({
			id: "bundle-images",
			collection: images
		});
		controller.listenTo(this.imageCarousel, "view:select:one", controller.selectImage);

		children = document.createDocumentFragment();
		children.appendChild(container);
		children.appendChild(this.imageCarousel.render().el);
		this.el.appendChild(children);

		// this.$children = Backbone.$([
		// 		this.bundleDetail.render().el,
		// 		this.imageDetail.render().el,
		// 		this.imagePager.render().el,
		// 		this.imageCarousel.render().el,
		// 	])
		// 	.css({opacity: 0})
		// 	.appendTo(this.$el)
		// 	.transit({opacity: 1}, 300)
		// 	;

	},

	removeChildren: function () {
		controller.stopListening(this.imageCarousel);
		controller.stopListening(this.imagePager);

		this.bundleDetail.remove();
		this.imageDetail.remove();
		this.imagePager.remove();
		this.imageCarousel.remove();

		this.$el.empty(); // removes div#content-detail

		// this.$children
		// 	.clearQueue()
		// 	.transit({opacity: 0}, 300)
		// 	.promise().always(function($children) {
		// 		$children.css({display: "none"});
		// 	})
		// 	;
	},

});

module.exports = ContentView;
