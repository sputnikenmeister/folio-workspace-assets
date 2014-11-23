/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/view/ImageListView} */
var ImageListView = require("./ImageListView");
/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/DescriptionView} */
var DescriptionView = require("./DescriptionView");

/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/model/collection/ImageList} */
var images = require("../model/collection/ImageList");
/** @type {module:app/control/Presenter} */
var presenter = require("../control/Presenter");

/** @type {Function} */
// var bundleDescTemplate = require("./template/DescriptionView.Bundle.tpl");
/** @type {Function} */
var imageDescTemplate = require("./template/DescriptionView.Image.tpl");

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
		this.imageListView = new ImageListView({
			id: "bundle-images",
			collection: images
		});

		// dot nav
		this.imagePagerView = new SelectableListView({
			id: "images-pager",
			collection: images,
		});
		this.imagePagerView.$el.addClass("dots-fontello");

		// selected bundle description
		this.bundleDetailView = new DescriptionView({
			id: "bundle-detail",
			// template: bundleDescTemplate,
			collection: bundles
		});

		// selected image description
		this.imageDetailView = new DescriptionView({
			id: "image-detail",
			template: imageDescTemplate,
			collection: images
		});

		this.$el.append(
			this.bundleDetailView.render().el,
			this.imageDetailView.render().el,
			this.imageListView.render().el,
			this.imagePagerView.render().el
		);

		presenter.listenTo(this.imageListView, "view:select:one", presenter.selectImage);
		presenter.listenTo(this.imagePagerView, "view:select:one", presenter.selectImage);
	},

});

module.exports = ContentView;
