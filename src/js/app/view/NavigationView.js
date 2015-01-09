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
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");

/** @type {module:app/helper/View} */
var View = require("../helper/View");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("./component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("./component/GroupingListView");
/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("./component/CollectionPager");
/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");

/** @type {Function} */
var bundlePagerTemplate = require("./template/CollectionPager.Bundle.tpl");

/**
 * @constructor
 * @type {module:app/view/NavigationView}
 */
module.exports = View.extend({

	/** @override */
	className: "navigation",
	/** @override */
	events: {
		"click #site-name a": "onSitenameClick"
	},

	/** @override */
	initialize: function (options) {
//		this.$sitename = this.$("#site-name a");
//		this.$sitename.on("click", _.bind(this.onSitenameClick, this));

		// collapsed is set later by showBundleItem/showBundleList
		this.bundlesView = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			associations: {
				collection: keywords,
				key: "bIds"
			},
		});
		controller.listenTo(this.bundlesView, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
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

		// Component: bundle pager
		this.bundlePager = new CollectionPager({
			className: "bundle-nav folio mutable-faded",
			collection: bundles,
			template: bundlePagerTemplate,
			labelAttribute: "name",
		});
		this.bundlePager.render().$el.appendTo(this.el);
		controller.listenTo(this.bundlePager, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});

		this.listenTo(bundles, {
			"select:one": this.onSelectOne,
			"select:none": this.onSelectNone
		});
		if (bundles.selected) {
			this.onSelectOne();
		} else {
			this.onSelectNone();
		}
	},

//	remove: function () {
//		this.$sitename.off("click");
//		View.prototype.remove.apply(this, arguments);
//	},

	onSelectNone: function() {
		this.$el.removeClass("bundle-item").addClass("bundle-list");
		this.keywordsView.filterBy(null);
		this.bundlesView.setCollapsed(false);
	},

	onSelectOne: function() {
		this.$el.removeClass("bundle-list").addClass("bundle-item");
		this.keywordsView.filterBy(bundles.selected);
		this.bundlesView.setCollapsed(true);
	},

	onSitenameClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		controller.deselectBundle();
	},

});
