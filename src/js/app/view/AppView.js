/**
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

/** @type {module:app/view/SelectableListView} */
var SelectableListView = require( "./SelectableListView" );
/** @type {module:app/view/GroupingListView} */
var GroupingListView = require( "./GroupingListView" );
/** @type {module:app/view/BundleDetailView} */
var BundleDetailView = require( "./BundleDetailView" );
/** @type {module:app/view/CollectionPagerView} */
var CollectionPagerView = require( "./CollectionPagerView" );
/** @type {module:app/view/ImageListView} */
var ImageListView = require( "./ImageListView" );

/** @type {module:app/control/AppRouter} */
var AppRouter = require( "../control/AppRouter" );

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
module.exports = Backbone.View.extend({

	el: "body",

	/** Setup listening to model changes */
	initialize: function(options)
	{
		/* initialize models */
		this.bundleList = new BundleList(options["bundles"]);
		this.keywordList = new KeywordList(options["keywords"]);
		this.typeList = new TypeList(options["types"]);
		this.imageList = new ImageList();

		/* initialize views */
		this.bundleListView = new SelectableListView({
			el: "#bundle-list",
			collection: this.bundleList,
			associations: {
				collection: this.keywordList,
				key: "bundles"
			}
		});

		this.keywordListView = new GroupingListView({
			el: "#keyword-list",
			collection: this.keywordList,
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
			id: "bundle-pager",
			collection:this.bundleList,
			className: "fontello-pill-pager"
		});
		this.$el.append(this.bundlePagerView.render().el);

		// this.bundleDetailView = new BundleDetailView({
		// 	el: "#bundle-detail"
		// 	collection:this.bundleList,
		// });

		// this.imagePagerView = new CollectionPagerView({
		// 	collection:this.imageList, id: "bundle-images-pager", className: "rsquare-pager"
		// });
		// this.$("#navigation").append(this.imagePagerView.render().el);

		this.imageListView = new ImageListView({
			collection:this.imageList, id: "bundle-images"
		});
		this.$("#container-footer").before(this.imageListView.render().el);

		/* initialize router */
		this.router = new AppRouter();

		/* wire view */
		this.listenTo(this.bundleListView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundleListView, "view:itemDeselect", this.whenBundleDeselect);
		this.listenTo(this.bundlePagerView, "view:itemPreceding", this.whenBundlePreceding);
		this.listenTo(this.bundlePagerView, "view:itemFollowing", this.whenBundleFollowing);
		// this.listenTo(this.bundlePagerView, "view:itemSelect", this.whenBundleSelect);
		// this.listenTo(this.bundlePagerView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundlePagerView, "view:itemDeselect", this.whenBundleDeselect);
		// this.listenTo(this.keywordListView, "view:itemSelect", this.whenKeywordSelect);
		// this.listenTo(this.imagePagerView, "view:itemSelect", this.whenImageSelect);
		this.listenTo(this.imageListView, "view:itemSelect", this.whenImageSelect);

		/* wire model */
		this.listenTo(this.bundleList, "error", this.whenBundleSelect_error);

		/* wire router */
		this.listenTo(this.router,"route:bundleList", this.routeToBundleList);
		this.listenTo(this.router,"route:bundleItem", this.routeToBundleItem);

		/* start router, which will request appropiate state */
		Backbone.history.start({pushState: false, hashChange: true});
	},

	events: {
		"click #site-name" : "onSitenameClick"
	},

	onSitenameClick: function(ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			this.whenBundleDeselect();
		}
	},

	/* handle router events */

	routeToBundleItem: function(handle) {
		console.log("AppView.routeToBundleItem", handle);
		var model = this.bundleList.findWhere({handle: handle});
		if (model) {
			this.doBundleSelect(model);
		} else {
			this.doBundleItemError();
		}
	},

	routeToBundleList: function() {
		console.log("AppView.routeToBundleList");
		this.doBundleDeselect();
	},

	/* handle view events */

	whenBundlePreceding: function() {
		// if (this.collection.selected) {
			this.whenBundleSelect(this.bundleList.precedingOrLast(this.bundleList.selected));
		// }
	},

	whenBundleFollowing: function() {
		// if (this.collection.selected) {
			this.whenBundleSelect(this.bundleList.followingOrFirst(this.bundleList.selected));
		// }
	},

	whenBundleSelect: function(model) {
		this.router.navigate("bundles/" + model.get("handle"), {trigger: false});
		this.doBundleSelect(model);
	},

	whenBundleDeselect: function() {
		this.router.navigate("", {trigger: false});
		this.doBundleDeselect();
	},

	whenImageSelect: function(image) {
		this.imageList.select(image);
	},

	/* handle model updates */

	doBundleSelect: function(bundle) {
		this.bundleList.select(bundle);
		if (bundle.has("images")) {
			this.showBundleItemState(bundle);
		} else {
			this.listenToOnce(bundle, "sync", this.doBundleSelect_sync);
			bundle.fetch();
		}
	},
	doBundleSelect_sync: function(bundle) {
		this.showBundleItemState(bundle);
	},
	doBundleSelect_error: function(model, resp, opts) {
		// TODO: something more useful here
		console.log("AppView.whenFetchError (bundleList)", arguments);
		this.showBundleItemError();
	},

	doBundleDeselect: function() {
		this.bundleList.select(null);
		this.showBundleListState();
	},

	/* model is ready, update views */

	showBundleItemState: function(bundle) {
		this.el.className = "app-bundle-item";
		Backbone.trigger("app:bundleItem", bundle);
		this.bundleListView.collapsed(true);
		this.keywordListView.collapsed(true);
	},

	showBundleListState: function() {
		this.el.className = "app-bundle-list";
		Backbone.trigger("app:bundleList");
		this.keywordListView.collapsed(false);
		this.bundleListView.collapsed(false);
	},

	showBundleItemError: function() {
		console.log("AppView.showBundleItemError - Doing nothing as of now!");
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
