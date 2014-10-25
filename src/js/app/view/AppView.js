/**
* @module view/AppView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );
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
	initialize: function(options) {
		/*
		* Bind callbacks
		*/
		// _.bindAll(this, "showBundleItem", "showBundleItemError");

		/*
		 * initialize models
		 */
		this.bundleList = new BundleList(options["bundles"]);
		this.keywordList = new KeywordList(options["keywords"]);
		this.typeList = new TypeList(options["types"]);
		this.imageList = new ImageList();
		/* model sync handlers */
		this.listenTo(this.bundleList, "error", this.whenBundleSelect_error);

		/*
		 * initialize views
		 */
		this.bundleListView = new SelectableListView({
			el: "#bundle-list",
			collection: this.bundleList,
			associations: {
				collection: this.keywordList,
				key: "bundles"
			}
		});
		this.listenTo(this.bundleListView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundleListView, "view:itemDeselect", this.whenBundleDeselect);

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
		// this.listenTo(this.keywordListView, "view:itemSelect", this.whenKeywordSelect);

		this.bundlePagerView = new CollectionPagerView({
			id: "bundle-pager",
			collection: this.bundleList,
			className: "fontello-pill-pager"
		});
		// this.listenTo(this.bundlePagerView, "view:itemSelect", this.whenBundleSelect);
		// this.listenTo(this.bundlePagerView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundlePagerView, "view:itemPreceding", this.whenBundlePreceding);
		this.listenTo(this.bundlePagerView, "view:itemFollowing", this.whenBundleFollowing);
		this.listenTo(this.bundlePagerView, "view:itemDeselect", this.whenBundleDeselect);
		// append at the bottom of <body/>
		this.$el.append(this.bundlePagerView.render().el);

		// this.bundleDetailView = new BundleDetailView({
		// 	el: "#bundle-detail"
		// 	collection:this.bundleList,
		// });

		// this.imagePagerView = new CollectionPagerView({
		// 	collection:this.imageList, id: "bundle-images-pager", className: "rsquare-pager"
		// });
		// this.$("#navigation").append(this.imagePagerView.render().el);
		// this.listenTo(this.imagePagerView, "view:itemSelect", this.whenImageSelect);

		this.imageListView = new ImageListView({
			collection:this.imageList, id: "bundle-images"
		});
		this.$("#container-footer").before(this.imageListView.render().el);
		this.listenTo(this.imageListView, "view:itemSelect", this.whenImageSelect);

		/*
		 * initialize router
		 */
		this.router = new AppRouter();
		this.listenTo(this.router,"route:bundleList", this.routeToBundleList);
		this.listenTo(this.router,"route:bundleItem", this.routeToBundleItem);

		/* start router, which will request appropiate state */
		Backbone.history.start({pushState: false, hashChange: true});
	},

	/*
	 * Native events
	 */

	events: {
		"click #site-name" : "onSitenameClick"
	},

	onSitenameClick: function(ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			this.whenBundleDeselect();
		}
	},

	/*
	 * Handle router events
	 */

	routeToBundleItem: function(handle) {
		var model = this.bundleList.findWhere({handle: handle});
		if (model) {
			this.selectBundle(model);
		} else {
			this.doBundleItemError();
		}
	},

	routeToBundleList: function() {
		this.deselectBundle();
	},

	/*
	 * Handle view events
	 */

	whenBundlePreceding: function() {
		if (this.bundleList.selected && this.bundleList.hasPreceding(this.bundleList.selected)) {
			this.whenBundleSelect(this.bundleList.precedingOrLast(this.bundleList.selected));
		}
	},

	whenBundleFollowing: function() {
		if (this.bundleList.selected && this.bundleList.hasFollowing(this.bundleList.selected)) {
			this.whenBundleSelect(this.bundleList.following(this.bundleList.selected));
		}
	},

	whenBundleSelect: function(model) {
		this.router.navigate("bundles/" + model.get("handle"), {trigger: false});
		this.selectBundle(model);
	},

	whenBundleDeselect: function() {
		this.router.navigate("", {trigger: false});
		this.deselectBundle();
	},

	whenKeywordSelect: function(keyword)
	{
		// this.router.navigate(/* implement route */);
		this.filterBundles(keyword);
	},

	whenImageSelect: function(image) {
		this.selectBundleImage(image);
	},

	/*
	 * Handle model updates
	 */

	selectBundle: function(bundle) {
		if (bundle.has("images")) {
			this.showBundleItem(bundle);
		} else {
			this.listenToOnce(bundle, "sync", this.selectBundle_sync);
			bundle.fetch();
		}
	},
	selectBundle_sync: function(bundle) {
		this.showBundleItem(bundle);
	},
	selectBundle_error: function(model, resp, opts) {
		// TODO: something more useful here
		console.log("AppView.whenFetchError (bundleList)", arguments);
		this.showBundleItemError();
	},

	deselectBundle: function() {
		this.showBundleList();
	},

	filterBundles: function(keyword) {
		this.keywordList.select(keyword);
		this.showBundleListFiltered(keyword);
	},

	selectBundleImage: function(image) {
		this.imageList.select(image);
	},

	/*
	* model is ready, update views
	*/

	showBundleItem: function(bundle) {
		this.bundleList.select(bundle);
		this.el.className = "app-bundle-item";
		Backbone.trigger("app:bundleItem", bundle);

		this.bundleListView.collapsed(true);
		this.keywordListView.collapsed(true);
	},

	showBundleList: function() {
		this.bundleList.select(null);
		this.el.className = "app-bundle-list";
		Backbone.trigger("app:bundleList");

		this.keywordListView.collapsed(false);
		this.bundleListView.collapsed(false);
	},

	showFilteredBundleList: function() {
		console.log("AppView.showFilteredBundleList - not implemented");
	},

	showBundleItemError: function() {
		console.log("AppView.showBundleItemError - not implemented");
	},
});
