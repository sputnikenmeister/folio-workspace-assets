/**
* @module app/view/NavigationView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/collection/BundleList} */
var bundles = require( "../model/collection/BundleList" );
/** @type {module:app/model/collection/KeywordList} */
var keywords = require( "../model/collection/KeywordList" );
/** @type {module:app/model/collection/TypeList} */
var types = require( "../model/collection/TypeList" );

/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("./component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require( "./component/GroupingListView" );
/** @type {module:app/control/Presenter} */
var presenter = require("../control/Presenter");

/**
 * @constructor
 * @type {module:app/view/NavigationView}
 */
module.exports = Backbone.View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "navigation",

	/** @type {module:app/model/collection/BundleList} */
	bundles: bundles,
	/** @type {module:app/model/collection/KeywordList} */
	keywords: keywords,
	/** @type {module:app/model/collection/TypeList} */
	types: types,

	/** Setup listening to model changes */
	initialize: function(options) {
		/*
		 * initialize views
		 */
		this.bundleListView = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			associations: { collection: keywords, key: "bIds" }
		});
		this.keywordListView = new GroupingListView({
			el: "#keyword-list",
			collection: keywords,
			associations: { collection: bundles, key: "kIds" },
			groupings: { collection: types, key: "tIds" },
			collapsed: true,
		});
		presenter.listenTo(this.bundleListView, "view:select:one", presenter.selectBundle);
		presenter.listenTo(this.bundleListView, "view:select:none", presenter.deselectBundle);

		this.listenTo(bundles, "select:one", this.onBundleSelect);
		this.listenTo(bundles, "select:none", this.onBundleDeselect);
		// this.listenTo(Backbone, "app:bundle:item", this.onAppBundleItem);
		// this.listenTo(Backbone, "app:bundle:list", this.onAppBundleList);
	},

	onBundleSelect: function(bundle) {
		this.bundleListView.setCollapsed(true);
		this.keywordListView.filterBy(bundle);
	},

	onBundleDeselect: function() {
		this.bundleListView.setCollapsed(false);
		this.keywordListView.filterBy(null);
	},

	// onAppBundleItem: function() {
	// },

	// onAppBundleList: function() {
	// },

});
