/**
 * @module app/view/AppView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/view/component/CollectionPagerView} */
var CollectionPagerView = require("./component/CollectionPagerView");

/** @type {module:app/view/NavigationView} */
var NavigationView = require("./NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("./ContentView");

/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/control/Router} */
var router = require("../control/Router");

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
module.exports = Backbone.View.extend({

	/** @override */
	el: "body",
	/** @type {module:app/model/collection/BundleList} */
	bundles: bundles,
	/** @type {module:app/model/collection/ImageList} */
	router: router,

	/** Setup listening to model changes */
	initialize: function (options) {
		_.bindAll(this, "showError");

		/*
		 * initialize views
		 */
		this.navigationView = new NavigationView({
			el: "#navigation"
		});
		this.listenTo(this.navigationView, "view:itemSelect", this.onBundleSelect);
		this.listenTo(this.navigationView, "view:itemDeselect", this.onBundleDeselect);

		this.contentView = new ContentView({
			el: "#content"
		});

		// this.bundlePagerView = new CollectionPagerView({
		// 	id: "bundle-pager",
		// 	collection: this.bundles,
		// 	className: "fontello-pill-pager",
		// 	labelAttribute: "name"
		// });
		// // append at the bottom of <body/>
		// this.$el.append(this.bundlePagerView.render().el);
		// this.listenTo(this.bundlePagerView, "view:itemSelect", this.onBundleSelect);
		// this.listenTo(this.bundlePagerView, "view:itemDeselect", this.onBundleDeselect);

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

	/* -------------------------------
	 * to state: bundle-list
	 * ------------------------------- */

	/* Handle router events */
	routeToBundleList: function () {
		this.deselectBundle();
	},
	/* Handle view events */
	onBundleDeselect: function () {
		this.router.navigate("", {trigger: false});
		this.deselectBundle();
	},

	/* Handle model updates */
	deselectBundle: function () {
		var stateChanging = this.bundles.selected !== null;
		var onStateChangeEnd = this.showBundleList;

		if (stateChanging) {
			console.log("AppView.showBundleList");
			this.el.className = "app-bundle-list";
			Backbone.trigger("app:bundleList");

			_.delay(function(context) {
				context.bundles.deselect();
			}, 350, this);
		}
	},

	/* -------------------------------
	 * to state: bundle-item
	 * ------------------------------- */

	/* Handle view events */
	onBundleSelect: function (model) {
		this.router.navigate("bundles/" + model.get("handle"), {trigger: false});
		this.selectBundle(model);
	},
	/* Handle router events */
	routeToBundleItem: function (handle) {
		var model = this.bundles.findWhere({handle: handle});
		if (model) {
			this.selectBundle(model);
		} else {
			this.showError();
		}
	},
	/* FROM VIEW/ROUTER: Handle model updates */
	selectBundle: function (bundle) {
		var stateChanging = this.bundles.selected === null;
		var onStateChangeEnd = this.showBundleItem;

		this.bundles.select(bundle);
		if (stateChanging) {
			_.delay(function (context) {
				console.log("AppView.showBundleItem");
				context.el.className = "app-bundle-item";
				Backbone.trigger("app:bundleItem");
			}, 700, this);
		}
	},


	/* model is ready, update views */
	showBundleItem: function () {
		// broadcast app-wide event
	},

	showError: function () {
		console.log("AppView.showError - not implemented");
	},

});
