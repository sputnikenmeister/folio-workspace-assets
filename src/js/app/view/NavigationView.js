/**
 * @module app/view/NavigationView
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/model/collection/KeywordList} */
var keywords = require("../model/collection/KeywordList");
/** @type {module:app/model/collection/TypeList} */
var types = require("../model/collection/TypeList");

/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("./component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("./component/GroupingListView");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");

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
	initialize: function (options) {
		this.bundleListView = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			collapsed: (bundles.selected !== null),
			associations: {
				collection: keywords,
				key: "bIds"
			},
		});
		this.keywordListView = new GroupingListView({
			el: "#keyword-list",
			collection: keywords,
			collapsed: true,
			associations: {
				collection: bundles,
				key: "kIds"
			},
			groupings: {
				collection: types,
				key: "tIds"
			},
		});
		controller.listenTo(this.bundleListView, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});

		this.listenTo(bundles, {
			"select:one": function () {
				this.bundleListView.setCollapsed(true);
				this.keywordListView.filterBy(bundles.selected);
			},
			"select:none": function () {
				this.bundleListView.setCollapsed(false);
				this.keywordListView.filterBy(null);
			}
		});
		this.listenTo(Backbone, {
			"app:bundle:item": function () {},
			"app:bundle:list": function () {}
		});

//		controller.listenTo(this.bundleListView, "view:select:one", controller.selectBundle);
//		controller.listenTo(this.bundleListView, "view:select:none", controller.deselectBundle);

//		this.listenTo(bundles, "select:one select:none", this.render);
	},

//	render: function () {
//		if (bundles.selected) {
//			this.bundleListView.setCollapsed(true);
//			this.keywordListView.filterBy(bundles.selected);
//		} else {
//			this.bundleListView.setCollapsed(false);
//			this.keywordListView.filterBy(null);
//		}
//		return this;
//	},

});
