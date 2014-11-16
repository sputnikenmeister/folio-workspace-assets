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
			collection: this.bundles,
			associations: { collection: this.keywords, key: "bIds" }
		});
		this.keywordListView = new GroupingListView({
			el: "#keyword-list",
			collection: this.keywords,
			associations: { collection: this.bundles, key: "kIds" },
			groupings: { collection: this.types, key: "tIds" },
		});
		this.keywordListView.setCollapsed(true);
		// this.listenTo(this.keywordListView, "view:itemSelect", this.onKeywordSelect);

		this.listenTo(this.bundleListView, "view:itemSelect", function(bundle) {
			this.trigger("view:itemSelect", bundle);
		});
		this.listenTo(this.bundleListView, "view:itemDeselect", function() {
			this.trigger("view:itemDeselect");
		});

		this.listenTo(this.bundles, "select:one", this.onBundleSelect);
		this.listenTo(this.bundles, "select:none", this.onBundleDeselect);
		this.listenTo(Backbone, "app:bundleItem", this.onAppBundleItem);
		this.listenTo(Backbone, "app:bundleList", this.onAppBundleList);
	},

	onBundleSelect: function(bundle) {
		this.bundleListView.setCollapsed(true);
		this.keywordListView.filterBy(bundle);
	},

	onBundleDeselect: function() {
		this.bundleListView.setCollapsed(false);
		this.keywordListView.filterBy(null);
	},

	onAppBundleItem: function() {
	},

	onAppBundleList: function() {
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
