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

		// Component: bundle pager
		this.bundlePager = new CollectionPager({
			id: "bundle-pager",
			className: "folio mutable-faded",
			collection: bundles,
			template: bundlePagerTemplate,
			labelAttribute: "name",
		});
		this.bundlePager.render().$el.appendTo(this.el);
		controller.listenTo(this.bundlePager, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});

		// collapsed is set later by showBundleItem/showBundleList
		this.bundlesView = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			filterBy: keywords.selected,
			filterKey: "bIds",
//			collapsed: bundles.selected,
		});
		controller.listenTo(this.bundlesView, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});

		this.keywordsView = new GroupingListView({
			el: "#keyword-list",
			collection: keywords,
			filterBy: bundles.selected,
			filterKey: "kIds",
			groupings: {
				collection: types,
				key: "tIds"
			},
			collapsed: true,
		});

		this.listenTo(bundles, {
			"select:one": this.onSelectOne,
			"select:none": this.onSelectNone
		});
	},

	render: function () {
		if (bundles.selected) {
			this.onSelectOne();
		} else {
			this.onSelectNone();
		}
//		this.keywordsView.renderNow();
//		this.bundlesView.renderNow();
		return this;
	},

	remove: function () {
		//this.$sitename.off("click");
		View.prototype.remove.apply(this, arguments);
	},

	/* --------------------------- *
	 * Event handlers
	 * --------------------------- */

	onSelectOne: function() {
//		this.$el.removeClass("without-bundle").addClass("with-bundle");
		this.keywordsView.filterBy(bundles.selected);
		this.bundlesView.setCollapsed(true);
	},

	onSelectNone: function() {
//		this.$el.removeClass("with-bundle").addClass("without-bundle");
		this.keywordsView.filterBy(null);
		this.bundlesView.setCollapsed(false);
	},

	onSitenameClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		controller.deselectBundle();
	},

});
