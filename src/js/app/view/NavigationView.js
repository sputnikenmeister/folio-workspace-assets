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
		this.$sitename = this.$("#site-name");
		//this.$sitename.on("click", _.bind(this.onSitenameClick, this));
		this.$sitename.wrap("<div id=\"site-name-wrapper\" class=\"transform-wrapper\"></div>");

		// bundle-pager
//		this.bundlePager = this.createBundlePager(bundles, this.el);

		// bundle-list
		this.bundlesView = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			// collapsed is set later by showBundleItem/showBundleList
			//collapsed: bundles.selected,
			filterBy: keywords.selected,
			filterKey: "bIds",
//			filterFn: function () {
//				return keywords.selected? keywords.selected.get("bIds"): null;
//			},
		});
		controller.listenTo(this.bundlesView, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
		this.bundlesView.$el.wrap("<div id=\"bundle-list-wrapper\" class=\"transform-wrapper\"></div>");

		// keyword-list
		this.keywordsView = new GroupingListView({
			el: "#keyword-list",
			collection: keywords,
			collapsed: true,
			filterBy: bundles.selected,
			filterKey: "kIds",
			groupings: {
				collection: types,
				key: "tIds"
			},
//			filterFn: function () {
//				return bundles.selected? bundles.selected.get("kIds"): null;
//			},
//			groupingFn: function (item) {
//				return item.get("tIds");
//			},
		});
		this.keywordsView.$el.wrap("<div id=\"keyword-list-wrapper\" class=\"transform-wrapper\"></div>");

		this.listenTo(bundles, {
			"select:one": this.onSelectOne,
			"select:none": this.onSelectNone
		});
	},

	createBundlePager: function(bundles, parent) {
		// Component: bundle pager
		var view = new CollectionPager({
			id: "bundle-pager",
			className: "folio mutable-faded",
			collection: bundles,
			labelAttribute: "name",
		});
		view.render().$el.appendTo(parent);
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
		return view;
	},

//	remove: function () {
//		//this.$sitename.off("click");
//		View.prototype.remove.apply(this, arguments);
//	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

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

	/* --------------------------- *
	 * Event handlers
	 * --------------------------- */

	onSelectOne: function() {
//		this.$el.removeClass("without-bundle").addClass("with-bundle");
		this.bundlesView.setCollapsed(true);
		this.keywordsView.filterBy(bundles.selected);
//		this.keywordsView.renderNow();
	},

	onSelectNone: function() {
//		this.$el.removeClass("with-bundle").addClass("without-bundle");
		this.bundlesView.setCollapsed(false);
		this.keywordsView.filterBy(null);
//		this.keywordsView.renderNow();
	},

	onSitenameClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		controller.deselectBundle();
	},

});
