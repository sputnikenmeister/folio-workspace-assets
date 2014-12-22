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

/** @type {module:app/helper/View} */
var View = require("../helper/View");
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
module.exports = View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "navigation",
//	/** @override */
//	events: {
//		"click #site-name a": function (ev) {
//			ev.isDefaultPrevented() || ev.preventDefault();
//			controller.deselectBundle();
//		}
//	},

	/** @override */
	initialize: function (options) {
		//this.listenTo(this.$("#site-name a"), "click", function (ev) {
		//this.$siteNameButton = this.$("#site-name");
		//this.$siteNameButton.find("a").on("click", function (ev) {
		this.$("#site-name a").on("click", function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			controller.deselectBundle();
		});

		// collapsed is set later by showBundleItem/showBundleList
		this.bundlesView = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			associations: {
				collection: keywords,
				key: "bIds"
			},
		});

		this.keywordsView = new GroupingListView({
			el: "#keyword-list",
			collapsed: true,
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

		controller.listenTo(this.bundlesView, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});

		this.listenTo(bundles, {
			"select:one": this.showBundleItem,
			"select:none": this.showBundleList
		});

		if (bundles.selected) {
			this.showBundleItem();
		} else {
			this.showBundleList();
		}
	},

	showBundleList: function() {
		this.$el.removeClass("bundle-item").addClass("bundle-list");
		this.keywordsView.filterBy(null);
		this.bundlesView.setCollapsed(false);
	},
	showBundleItem: function() {
		this.$el.removeClass("bundle-list").addClass("bundle-item");
		this.keywordsView.filterBy(bundles.selected);
		this.bundlesView.setCollapsed(true);
	},
//	changeBundleList: function() {
//		this.keywordsView.filterBy(bundles.selected);
//	}

});
