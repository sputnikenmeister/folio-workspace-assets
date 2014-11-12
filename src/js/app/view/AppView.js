/**
 * @module app/view/AppView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/helper/SelectOneList} */
var SelectOneList = require("../helper/SelectOneList");
/** @type {module:app/helper/SelectableList} */
// var SelectableList = require( "../helper/SelectableList" );

/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("./component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("./component/GroupingListView");
/** @type {module:app/view/component/CollectionPagerView} */
var CollectionPagerView = require("./component/CollectionPagerView");

/** @type {module:app/view/BundleDetailView} */
var BundleDetailView = require("./BundleDetailView");
/** @type {module:app/view/ImageListView} */
var ImageListView = require("./ImageListView");

/** @type {module:app/control/AppRouter} */
var router = require("../control/AppRouter");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/model/collection/KeywordList} */
var keywords = require("../model/collection/KeywordList");
/** @type {module:app/model/collection/TypeList} */
var types = require("../model/collection/TypeList");
/** @type {module:app/model/collection/ImageList} */
var images = require("../model/collection/ImageList");

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
module.exports = Backbone.View.extend({

	/** @override */
	el: "body",
	/** @type {module:app/control/AppRouter} */
	router: router,
	/** @type {module:app/model/collection/BundleList} */
	bundles: bundles,
	/** @type {module:app/model/collection/KeywordList} */
	keywords: keywords,
	/** @type {module:app/model/collection/TypeList} */
	types: types,
	/** @type {module:app/model/collection/ImageList} */
	images: images,
	/** @type {module:app/helper/SelectOneList} */
	bundleImages: new SelectOneList(), // new SelectableList(null, { model:ImageItem });

	/** Setup listening to model changes */
	initialize: function (options) {
		_.bindAll(this, "showBundleItem", "showBundleList", "showError");

		/*
		 * initialize models
		 */
		this.listenTo(this.bundles, "select:one", this.fetchBundle);
		// this.listenTo(this.bundles, "select:none", this.onBundleSelectNone);
		this.images.imageSrcRoot = router.getApplicationRoot();
		// selected bundle image list
		this.bundleImages.imageSrcRoot = router.getApplicationRoot();
		this.bundleImages.on("all", function(){console.log(arguments);});

		/*
		 * initialize views
		 */
		this.bundleListView = new FilterableListView({
			el: "#bundle-list",
			collection: this.bundles,
			associations: {
				collection: this.keywords,
				key: "bIds"
			}
		});
		this.listenTo(this.bundleListView, "view:itemSelect", this.onBundleSelect);
		this.listenTo(this.bundleListView, "view:itemDeselect", this.onBundleDeselect);

		this.keywordListView = new GroupingListView({
			el: "#keyword-list",
			collection: this.keywords,
			filter: function() {},
			associations: {
				collection: this.bundles,
				key: "kIds"
			},
			groupings: {
				collection: this.types,
				key: "tIds"
			},
		});
		this.keywordListView.setCollapsed(true);
		// this.listenTo(this.keywordListView, "view:itemSelect", this.onKeywordSelect);

		this.bundlePagerView = new CollectionPagerView({
			id: "bundle-pager",
			collection: this.bundles,
			className: "fontello-pill-pager",
			labelAttribute: "name"
		});
		// append at the bottom of <body/>
		this.$el.append(this.bundlePagerView.render().el);
		this.listenTo(this.bundlePagerView, "view:itemSelect", this.onBundleSelect);
		this.listenTo(this.bundlePagerView, "view:itemDeselect", this.onBundleDeselect);

		/*
		 * detail views
		 */
		// selected bundle description
		this.bundleDetailView = new BundleDetailView({
			id: "bundle-detail",
			collection: this.bundles
		});
		this.$("#content").append(this.bundleDetailView.render().el);


		// carrousel
		this.imageListView = new ImageListView({
			id: "bundle-images",
			collection: this.bundleImages
		});
		this.$("#content").append(this.imageListView.render().el);
		this.listenTo(this.imageListView, "view:itemSelect", this.onImageSelect);

		// dot nav
		this.imagePagerView = new SelectableListView({
			id: "bundle-images-pager",
			collection: this.bundleImages,
		});
		this.$("#content").append(this.imagePagerView.render().el);
		this.listenTo(this.imagePagerView, "view:itemSelect", this.onImageSelect);

		/*
		 * initialize router
		 */
		// this.listenToOnce(this.router,"route", this.initializeWithRoute);
		this.listenTo(this.router, "route:bundleList", this.routeToBundleList);
		this.listenTo(this.router, "route:bundleItem", this.routeToBundleItem);

		/* start router, which will request appropiate state */
		Backbone.history.start({
			pushState: false,
			hashChange: true
		});
	},

	/*
	 * Native events
	 */

	events: {
		"click #site-name": "onSitenameClick"
	},

	onSitenameClick: function (ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
			this.onBundleDeselect();
		}
	},

	/*
	 * catch all
	 */

	/* Handle router events */
	initializeWithRoute: function (routeName, params) {
		console.log("initializeWithRoute", arguments);
	},
	showError: function () {
		console.log("AppView.showError - not implemented");
	},


	/*
	 * to state: bundle-list
	 */

	/* Handle router events */
	routeToBundleList: function () {
		console.log("AppView.routeToBundleList", arguments);
		this.deselectBundle();
	},

	/* Handle view events */
	onBundleDeselect: function () {
		this.router.navigate("", {
			trigger: false
		});
		this.deselectBundle();
	},

	/* Handle model updates */
	deselectBundle: function () {
		var onStateChangeEnd, stateChanging;

		stateChanging = this.bundles.selected !== null;
		onStateChangeEnd = this.showBundleList;

		this.el.className = "app-bundle-list";

		if (stateChanging) {
			onStateChangeEnd = this.showBundleList;
			// onStateChangeEnd = _.after(2, onStateChangeEnd);
			// this.listenToOnce(this.bundleDetailView, "view:stateTransitionEnd", onStateChangeEnd);
			// this.listenToOnce(this.imageListView, "view:stateTransitionEnd", onStateChangeEnd);
		}
		// onStateChangeEnd();
		_.delay(onStateChangeEnd, 350);
	},

	/* model is ready, update views */
	showBundleList: function () {
		this.bundles.deselect();
		this.bundleListView.setCollapsed(false);
		// this.keywordListView.collapsed(false);
		this.keywordListView.filterBy(null);
		this.bundleImages.reset();

		Backbone.trigger("app:bundleList");
		console.log("AppView.showBundleList");
	},

	doBundleDeselect: function () {

	},

	/*
	 * to state: bundle-item
	 */

	/* Handle router events */
	routeToBundleItem: function (handle) {
		console.log("AppView.routeToBundleItem", arguments);
		var model = this.bundles.findWhere({
			handle: handle
		});
		if (model) {
			this.selectBundle(model);
		} else {
			this.showError();
		}
	},
	/* Handle view events */
	onBundleSelect: function (model) {
		this.router.navigate("bundles/" + model.get("handle"), {
			trigger: false
		});
		this.selectBundle(model);
	},

	/* Handle model updates */
	selectBundle: function (bundle) {
		var onStateChangeEnd, stateChanging;

		stateChanging = this.bundles.selected === null;
		onStateChangeEnd = this.showBundleItem;

		this.bundles.select(bundle);
		if (!this.bundleListView.getCollapsed()) {
			this.bundleListView.setCollapsed(true);
		}
		// Apply filter to keywords
		this.keywordListView.filterBy(bundle);
		// Reset bundleImages with images by bundle ID (image.bId)
		this.bundleImages.reset(this.images.where({
			bId: this.bundles.selected.id
		}));
		// this.bundleImages.selectAt(0);

		if (stateChanging) {
			onStateChangeEnd = _.after(1, onStateChangeEnd);
			// this.listenToOnce(this.bundleListView, "view:stateTransitionEnd", onStateChangeEnd);
			// this.listenToOnce(this.keywordListView, "view:stateTransitionEnd", onStateChangeEnd);
			_.delay(onStateChangeEnd, 700);
		}

	},

	fetchBundle: function (bundle) {
		if (!bundle.has("images")) {
			bundle.fetch({
				success: function (model) {
					console.log("AppView.fetchBundle", model.get("handle"));
					images.set(model.get("images"), {
						add: false,
						remove: false
					});
				}
			})
			.fail(this.showError);
		}
	},

	/* model is ready, update views */
	showBundleItem: function () {
		console.log("AppView.showBundleItem");
		// broadcast app-wide event
		Backbone.trigger("app:bundleItem", this.bundles.selected);
		this.el.className = "app-bundle-item";
	},


	/*
	 * to state: bundle-item/image
	 */

	onImageSelect: function (image) {
		this.selectBundleImage(image);
	},
	selectBundleImage: function (image) {
		this.bundleImages.select(image);
	},

	// onKeywordSelect: function(keyword) {
	// 	// this.router.navigate(/* implement route */);
	// 	this.filterBundles(keyword);
	// },
	// filterBundles: function(keyword) {
	// 	this.keywords.select(keyword);
	// 	this.showBundleListFiltered(keyword);
	// },
	// showFilteredBundleList: function() {
	// 	console.log("AppView.showFilteredBundleList - not implemented");
	// },

});
