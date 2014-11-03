/**
* @module app/view/AppView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/collection/BundleList} */
var bundleList = require( "../model/collection/BundleList" );
/** @type {module:app/model/collection/KeywordList} */
var keywordList = require( "../model/collection/KeywordList" );
/** @type {module:app/model/collection/TypeList} */
var typeList = require( "../model/collection/TypeList" );
/** @type {module:app/model/collection/ImageList} */
var ImageList = require( "../model/collection/ImageList" );

/** @type {module:app/model} */
// var model = require("../control/AppModel");

/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require( "./component/SelectableListView" );
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require( "./component/GroupingListView" );
/** @type {module:app/view/component/CollectionPagerView} */
var CollectionPagerView = require( "./component/CollectionPagerView" );

/** @type {module:app/view/BundleDetailView} */
var BundleDetailView = require( "./BundleDetailView" );
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
		_.bindAll(this, "updateBundleImages","showBundleItem", "showBundleList", "showError");

		/*
		 * initialize models
		 */
		this.bundleList = bundleList;
		this.keywordList = keywordList;
		this.typeList = typeList;
		this.imageList = new ImageList();


		/*
		 * initialize views
		 */
		this.bundleListView = new SelectableListView({
			el: "#bundle-list",
			collection: this.bundleList,
			associations: {
				collection: this.keywordList,
				key: "bIds"
			}
		});
		this.listenTo(this.bundleListView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundleListView, "view:itemDeselect", this.whenBundleDeselect);

		this.keywordListView = new GroupingListView({
			el: "#keyword-list",
			collection: this.keywordList,
			associations: {
				collection: this.bundleList,
				key: "kIds"
			},
			groupings: {
				collection: this.typeList,
				key: "tIds"
			},
		});
		this.keywordListView.setCollapsed(true);
		// this.listenTo(this.keywordListView, "view:itemSelect", this.whenKeywordSelect);

		this.bundlePagerView = new CollectionPagerView({
			id: "bundle-pager",
			collection: this.bundleList,
			className: "fontello-pill-pager",
			labelAttribute: "name"
		});
		// append at the bottom of <body/>
		this.$el.append(this.bundlePagerView.render().el);
		this.listenTo(this.bundlePagerView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundlePagerView, "view:itemDeselect", this.whenBundleDeselect);

		// this.imagePagerView = new CollectionPagerView({
		// 	collection:this.imageList, id: "bundle-images-pager", className: "rsquare-pager"
		// });
		// this.$("#navigation").append(this.imagePagerView.render().el);
		// this.listenTo(this.imagePagerView, "view:itemSelect", this.whenImageSelect);

		this.bundleDetailView = new BundleDetailView({
			id: "bundle-detail",
			collection:this.bundleList
		});
		this.$("#content").append(this.bundleDetailView.render().el);

		this.imageListView = new ImageListView({
			id: "bundle-images",
			collection: this.imageList
		});
		this.$("#content").append(this.imageListView.render().el);
		this.listenTo(this.imageListView, "view:itemSelect", this.whenImageSelect);

		/*
		 * initialize router
		 */
		this.router = new AppRouter();
		// this.listenToOnce(this.router,"route", this.initializeWithRoute);
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
	 * catch all
	 */

	/* Handle router events */
	initializeWithRoute: function(routeName, params) {
		console.log("initializeWithRoute", arguments);
	},
	showError: function() {
		console.log("AppView.showError - not implemented");
	},


	/*
	 * to state: bundle-list
	 */

	/* Handle router events */
	routeToBundleList: function() {
		console.log("AppView.routeToBundleList", arguments);
		this.deselectBundle();
	},
	/* Handle view events */
	whenBundleDeselect: function() {
		this.router.navigate("", {trigger: false});
		this.deselectBundle();
	},
	/* Handle model updates */
	deselectBundle: function() {
		var whenStateChangeEnd, stateChanging;

		stateChanging = this.bundleList.selected !== null;
		whenStateChangeEnd = this.showBundleList;
		// this.keywordListView.collapsed(false);

		this.el.className = "app-bundle-list";

		if (stateChanging) {
			whenStateChangeEnd = this.showBundleList;
			// whenStateChangeEnd = _.after(2, whenStateChangeEnd);
			// this.listenToOnce(this.bundleDetailView, "view:stateTransitionEnd", whenStateChangeEnd);
			// this.listenToOnce(this.imageListView, "view:stateTransitionEnd", whenStateChangeEnd);
		}
		// whenStateChangeEnd();
		_.delay(whenStateChangeEnd, 350);
	},
	/* model is ready, update views */
	showBundleList: function() {
		this.bundleList.deselect();
		this.bundleListView.setCollapsed(false);
		this.keywordListView.filterBy(null);
		this.imageList.reset();
		Backbone.trigger("app:bundleList");
		console.log("AppView.showBundleList");
	},

	/*
	 * to state: bundle-item
	 */

	/* Handle router events */
	routeToBundleItem: function(handle) {
		console.log("AppView.routeToBundleItem", arguments);
		var model = this.bundleList.findWhere({handle: handle});
		if (model) {
			this.selectBundle(model);
		} else {
			this.showError();
		}
	},
	/* Handle view events */
	whenBundleSelect: function(model) {
		this.router.navigate("bundles/" + model.get("handle"), {trigger: false});
		this.selectBundle(model);
	},
	/* Handle model updates */
	selectBundle: function(bundle) {
		var whenStateChangeEnd, stateChanging;

		stateChanging = this.bundleList.selected === null;
		whenStateChangeEnd = this.showBundleItem;
		this.bundleList.select(bundle);
		this.keywordListView.filterBy(bundle);

		if (stateChanging) {
			whenStateChangeEnd = _.after(2, whenStateChangeEnd);
			// this.listenToOnce(this.bundleListView, "view:stateTransitionEnd", whenStateChangeEnd);
			// this.listenToOnce(this.keywordListView, "view:stateTransitionEnd", whenStateChangeEnd);
			_.delay(whenStateChangeEnd, 700);
			this.bundleListView.setCollapsed(true);
		}

		if (bundle.has("images")) {
			this.updateBundleImages();
			whenStateChangeEnd();
		} else {
			bundle.fetch()
				.fail(this.showError)
				.done(this.updateBundleImages)
				.always(whenStateChangeEnd)
				;
		}
	},
	updateBundleImages: function() {
		console.log("AppView.updateBundleImages", arguments);

		this.imageList.reset(this.bundleList.selected.get("images"));
		Backbone.trigger("app:bundleItem", this.bundleList.selected);
	},
	/* model is ready, update views */
	showBundleItem: function() {
		console.log("AppView.showBundleItem");
		this.el.className = "app-bundle-item";
	},


	/*
	 * to state: bundle-item/image
	 */

	whenImageSelect: function(image) {
		this.selectBundleImage(image);
	},
	selectBundleImage: function(image) {
		this.imageList.select(image);
	},

	// whenKeywordSelect: function(keyword) {
	// 	// this.router.navigate(/* implement route */);
	// 	this.filterBundles(keyword);
	// },
	// filterBundles: function(keyword) {
	// 	this.keywordList.select(keyword);
	// 	this.showBundleListFiltered(keyword);
	// },
	// showFilteredBundleList: function() {
	// 	console.log("AppView.showFilteredBundleList - not implemented");
	// },

});
