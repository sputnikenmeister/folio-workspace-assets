/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require( "backbone" );

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
/** @type {module:app/control/Presenter} */
var presenter = require("../control/Presenter");

/** @type {Function} */
// var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageDescTemplate = require("./template/CollectionStack.Image.tpl");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = Backbone.View.extend({

	/** @type {module:app/model/collection/BundleList} */
	// bundles: bundles,
	/** @type {module:app/model/collection/ImageList} */
	// images: images,
	/** @type {module:app/control/Presenter} */
	// presenter: presenter,

	/** Setup listening to model changes */
	initialize: function (options) {
		// carrousel
		this.imageCarousel = new Carousel({
			id: "bundle-images",
			collection: images
		});

		// dot nav
		this.imagePager= new SelectableListView({
			id: "images-pager",
			collection: images,
		});
		this.imagePager.$el.addClass("dots-fontello");

		// selected bundle description
		this.bundleDetailView = new CollectionStack({
			id: "bundle-detail",
			// template: bundleDescTemplate,
			collection: bundles
		});

		// selected image description
		this.imageDetailView = new CollectionStack({
			id: "image-detail",
			template: imageDescTemplate,
			collection: images
		});

		this.$children = Backbone.$([
			this.bundleDetailView.render().el,
			this.imageDetailView.render().el,
			this.imageCarousel.render().el,
			this.imagePager.render().el
		]);
		// this.$el.append(
		// 	this.bundleDetailView.render().el,
		// 	this.imageDetailView.render().el,
		// 	this.imageCarousel.render().el,
		// 	this.imagePager.render().el
		// );

		presenter.listenTo(this.imageCarousel, "view:select:one", presenter.selectImage);
		presenter.listenTo(this.imagePager, "view:select:one", presenter.selectImage);

		this.listenTo(Backbone, "all", this.onApplicationEvent);
	},

	onApplicationEvent: function(eventName) {
		switch (eventName){
			case "app:bundle:item":
				// this.$el.append(this.$children);
				this.imageCarousel.render();
				// this.$children.appendTo(this.$el);
				this.$children.css({opacity: 0})
					.appendTo(this.$el)
					.velocity({opacity: 1}, 300)
					;
				// this.$el.append(
				// 	this.bundleDetailView.render().el,
				// 	this.imageDetailView.render().el,
				// 	this.imageCarousel.render().el,
				// 	this.imagePager.render().el
				// );
				break;
			case "app:bundle:list":
				/* falls through */
			default:
				// this.$el.detach(this.$children);
				// this.$children.detach();
				this.$children
					.clearQueue()
					.velocity({opacity: 0}, 300)
					.promise().always(function($content) {
						$content.detach();
					})
					;
				// this.$el.empty();
				break;
		}
	},

});

module.exports = ContentView;
