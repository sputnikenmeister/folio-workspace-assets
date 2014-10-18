/**
* jscs standard:Jquery
* @module view/AppView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/BundleList} */
var BundleList = require( "../model/BundleList" );
/** @type {module:app/model/KeywordList} */
var KeywordList = require( "../model/KeywordList" );
/** @type {module:app/model/TypeList} */
var TypeList = require( "../model/TypeList" );
/** @type {module:app/model/ImageList} */
var ImageList = require( "../model/ImageList" );

/** @type {module:app/view/ItemListView} */
var ItemListView = require( "./ItemListView" );
/** @type {module:app/view/GroupingListView} */
var GroupingListView = require( "./GroupingListView" );
/** @type {module:app/view/BundleDetailView} */
var BundleDetailView = require( "./BundleDetailView" );
/** @type {module:app/view/CollectionPagerView} */
var CollectionPagerView = require( "./CollectionPagerView" );
/** @type {module:app/view/ImageListView} */
var ImageListView = require( "./ImageListView" );

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
module.exports = Backbone.View.extend({

	el: "#container",

	/** Setup listening to model changes */
	initialize: function(options)
	{
		this.bundleList = new BundleList(options["bundles"]);
		this.keywordList = new KeywordList(options["keywords"]);
		this.typeList = new TypeList(options["types"]);
		this.imageList = new ImageList();

		this.bundleListView = new ItemListView({
			collection: this.bundleList, el: "#bundle-list",
			associations: {
				collection: this.keywordList,
				key: "bundles"
			}
		});
		this.keywordListView = new GroupingListView({
			collection: this.keywordList, el: "#keyword-list",
			associations: {
				collection: this.bundleList,
				key: "keywords"
			},
			groupings: {
				collection: this.typeList,
				key: "_domIds"
			},
		});

		this.bundlePagerView = new CollectionPagerView({
			collection:this.bundleList, el: "#bundle-pager"
		});
		this.bundleDetailView = new BundleDetailView({
			collection:this.bundleList, el: "#bundle-detail"
		});
		this.imagePagerView = new CollectionPagerView({
			collection:this.imageList, id: "bundle-images-pager", className: "rsquare-pager"
		});
		this.$("#main").append(this.imagePagerView.render().el);

		this.imageListView = new ImageListView({
			collection:this.imageList, id: "bundle-images"
		});
		this.$("#main").append(this.imageListView.render().el);

		// View events
		//this.listenTo(this.keywordListView, "view:itemSelect", this.whenKeywordSelect);
		this.listenTo(this.bundleListView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundlePagerView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundlePagerView, "view:itemDeselect", this.whenBundleDeselect);
		this.listenTo(this.imagePagerView, "view:itemSelect", this.whenImageSelect);

		// Model events
		this.listenTo(this.bundleList, "error", this.whenBundleSelect_error);

		// Show default state
		this.showListState();

	},

	whenImageSelect: function(image)
	{
		this.imageList.select(image);
	},

	whenBundleSelect: function(bundle)
	{
		this.bundleList.select(bundle);
		if (bundle.has("images")) {
			this.showBundleState(bundle);
		} else {
			this.listenToOnce(bundle, "sync", this.whenBundleSelect_sync);
			bundle.fetch();
		}
	},
	whenBundleSelect_sync: function(bundle) {
		this.showBundleState(bundle);
	},
	whenBundleSelect_error: function(model, resp, opts) {
		// TODO: something more useful here
		console.log("AppView.whenFetchError (bundleList)", arguments);
	},

	whenBundleDeselect: function()
	{
		this.bundleList.select(null);
		this.showListState();
	},

	showBundleState: function(bundle)
	{
		Backbone.trigger("app:bundle", bundle);
		this.el.className = "app-bundle";
		this.bundleListView.collapsed(true);
		this.keywordListView.collapsed(true);

	},

	showListState: function()
	{
		Backbone.trigger("app:default");
		this.el.className = "app-default";
		this.keywordListView.collapsed(false);
		this.bundleListView.collapsed(false);

	},

//	whenKeywordSelect: function(keyword)
//	{
//		this.keywordList.select(keyword);
//		this.showKeywordState(keyword);
//	},

//	showKeywordState: function(keyword)
//	{
//		this.keywordListView.collapsed(false);
//		this.bundleListView.collapsed(false);
//
//		this.bundlePagerView.$el.hide();
//		this.bundleDetailView.$el.hide();
//		this.imageListView.$el.hide();
//
//		Backbone.trigger("app:keyword", keyword);
//
//	},
});
