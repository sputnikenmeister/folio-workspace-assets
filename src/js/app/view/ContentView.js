/**
* @module app/view/NavigationView
* @requires module:backbone
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

var bundleDescTemplate = require("./template/DescriptionView.Bundle.tpl");
var imageDescTemplate = require("./template/DescriptionView.Image.tpl");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
module.exports = Backbone.View.extend({

	/** @type {module:app/model/collection/BundleList} */
	bundles: bundles,
	/** @type {module:app/model/collection/ImageList} */
	images: images,
	/** @type {module:app/control/Presenter} */
	presenter: presenter,

	/** Setup listening to model changes */
	initialize: function (options) {
		/*
		 * initialize views
		 */
		// selected bundle description
		this.bundleDetailView = new DescriptionView({
			id: "bundle-detail",
			className: "item-detail",
			template: bundleDescTemplate,
			collection: this.bundles
		});
		this.$el.append(this.bundleDetailView.render().el);

		// selected image description
		this.imageDetailView = new DescriptionView({
			id: "image-detail",
			className: "item-detail",
			template: imageDescTemplate,
			collection: this.images
		});
		this.$el.append(this.imageDetailView.render().el);

		// carrousel
		this.imageListView = new ImageListView({
			id: "bundle-images",
			collection: this.images
		});
		this.$el.append(this.imageListView.render().el);
		this.listenTo(this.imageListView, "view:select:one", this.onImageSelectOne);

		// dot nav
		this.imagePagerView = new SelectableListView({
			id: "bundle-images-pager",
			collection: this.images,
		});
		this.$el.append(this.imagePagerView.render().el);
		this.listenTo(this.imagePagerView, "view:select:one", this.onImageSelectOne);
	},

	onImageSelectOne: function (image) {
		this.presenter.selectImage(image);
	},

});
