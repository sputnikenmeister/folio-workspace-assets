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

/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require( "./component/SelectableListView" );
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

	/** Setup listening to model changes */
	initialize: function(options) {
		/*
		 * initialize views
		 */
		this.bundleListView = new SelectableListView({
			el: this.$("#bundle-list"),
			collection: bundles,
			associations: {
				collection: keywords,
				key: "bIds"
			}
		});

		this.keywordListView = new GroupingListView({
			el: this.$("#keyword-list"),
			collection: keywords,
			associations: {
				collection: bundles,
				key: "kIds"
			},
			groupings: {
				collection: types,
				key: "tIds"
			},
		});

		// this.listenTo(this.keywordListView, "view:itemSelect", this.onKeywordSelect);
		this.listenTo(this.bundleListView, "view:itemSelect", this.onBundleSelect);
		this.listenTo(this.bundleListView, "view:itemDeselect", this.onBundleDeselect);

		this.listenTo(Backbone, "app:bundleItem", this.onAppBundleItem);
		this.listenTo(Backbone, "app:bundleList", this.onAppBundleList);
	},

	onBundleSelect: function(bundle) {
	},

	onBundleDeselect: function() {
	},

	onAppBundleItem: function(bundle) {
	},

	onAppBundleList: function() {
	},

});
