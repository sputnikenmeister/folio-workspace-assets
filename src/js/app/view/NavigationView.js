/**
* @module app/view/NavigationView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/collection/BundleList} */
var bundleList = require( "../model/collection/BundleList" );
/** @type {module:app/model/collection/KeywordList} */
var keywordList = require( "../model/collection/KeywordList" );
/** @type {module:app/model/collection/TypeList} */
var typeList = require( "../model/collection/TypeList" );

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
			collection: bundleList,
			associations: {
				collection: keywordList,
				key: "bIds"
			}
		});

		this.keywordListView = new GroupingListView({
			el: this.$("#keyword-list"),
			collection: keywordList,
			associations: {
				collection: bundleList,
				key: "kIds"
			},
			groupings: {
				collection: typeList,
				key: "tIds"
			},
		});

		// this.listenTo(this.keywordListView, "view:itemSelect", this.whenKeywordSelect);
		this.listenTo(this.bundleListView, "view:itemSelect", this.whenBundleSelect);
		this.listenTo(this.bundleListView, "view:itemDeselect", this.whenBundleDeselect);

		this.listenTo(Backbone, "app:bundleItem", this.whenAppBundleItem);
		this.listenTo(Backbone, "app:bundleList", this.whenAppBundleList);
	},

	whenBundleSelect: function(model) {
	},

	whenBundleDeselect: function() {
	},

	whenAppBundleItem: function(newItem) {
	},

	whenAppBundleList: function() {
	},

});
