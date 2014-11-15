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
		this.listenTo(this.bundleListView, "view:itemSelect", this.onBundleSelect);
		this.listenTo(this.bundleListView, "view:itemDeselect", this.onBundleDeselect);

		this.keywordListView = new GroupingListView({
			el: "#keyword-list",
			collection: this.keywords,
			associations: { collection: this.bundles, key: "kIds" },
			groupings: { collection: this.types, key: "tIds" },
		});
		this.keywordListView.setCollapsed(true);
		// this.listenTo(this.keywordListView, "view:itemSelect", this.onKeywordSelect);

		this.listenTo(Backbone, "app:bundleItem", this.onAppBundleItem);
		this.listenTo(Backbone, "app:bundleList", this.onAppBundleList);
	},

	onBundleSelect: function(bundle) {
	},

	onBundleDeselect: function() {
	},

	onAppBundleItem: function() {
	},

	onAppBundleList: function() {
	},

});
