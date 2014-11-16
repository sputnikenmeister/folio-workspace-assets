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
/** @type {module:app/view/BundleDetailView} */
var BundleDetailView = require("./BundleDetailView");

/** @type {module:app/helper/SelectableList} */
// var SelectableList = require( "../helper/SelectableList" );
/** @type {module:app/helper/SelectOneList} */
var SelectOneList = require("../helper/SelectOneList");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/model/collection/ImageList} */
var images = require("../model/collection/ImageList");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
module.exports = Backbone.View.extend({
	/** @type {module:app/model/collection/BundleList} */
	bundles: bundles,
	/** @type {module:app/model/collection/ImageList} */
	images: images,
	/** @type {module:app/helper/SelectOneList} */
	bundleImages: new SelectOneList(), // new SelectableList(null, { model:ImageItem });

	/** Setup listening to model changes */
	initialize: function (options) {
		_.bindAll(this, "showError");
		/*
		 * initialize models
		 */
		this.listenTo(this.bundles, "select:one", this.onBundleSelectOne);
		this.listenTo(this.bundles, "select:none", this.onBundleSelectNone);

		// this.bundleImages.on("all", function(ev, model, old) {
		// 	console.log(["ContentView.bundleImages", ev, model.cid].join(" "));
		// });

		/*
		 * initialize views
		 */
		// selected bundle description
		this.bundleDetailView = new BundleDetailView({
			id: "bundle-detail",
			collection: this.bundles
		});
		this.$el.append(this.bundleDetailView.render().el);

		// carrousel
		this.imageListView = new ImageListView({
			id: "bundle-images",
			collection: this.bundleImages
		});
		this.$el.append(this.imageListView.render().el);
		this.listenTo(this.imageListView, "view:itemSelect", this.onImageSelect);

		// dot nav
		this.imagePagerView = new SelectableListView({
			id: "bundle-images-pager",
			collection: this.bundleImages,
		});
		this.$el.append(this.imagePagerView.render().el);
		this.listenTo(this.imagePagerView, "view:itemSelect", this.onImageSelect);
	},

	/*
	 * to state: bundle-item/image
	 */
	onImageSelect: function (image) {
		this.bundleImages.select(image);
	},

	showError: function () {
		console.log("ContentView.showError: needs implementation :-)");
	},

	/*
	 * THIS MUST GO: the selected model has changed
	 */
	onBundleSelectOne: function (bundle) {
		this.bundleImages.reset(this.images.where({bId: bundle.id}));

		if (!bundle.has("images")) {
			bundle.fetch().done(function() {
				images.set(bundle.get("images"), { add: false, remove: false });
			}).fail(this.showError);
		}
	},

	onBundleSelectNone: function() {
		this.bundleImages.reset();
	}


});
