/**
 * @module app/view/component/GroupingListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("app/view/component/FilterableListView");

/**
 * @constructor
 * @type {module:app/view/component/GroupingListView}
 */
var GroupingListView = FilterableListView.extend({
	
	/** @type {string} */
	cidPrefix: "grouping-list-",
	/** @override */
	tagName: "dl",
	/** @override */
	className: "grouped",

	/** @override */
	initialize: function (options) {
		FilterableListView.prototype.initialize.apply(this, arguments);
		if (options.groupings) {
			// options.filterFn && (this._filterFn = options.filterFn);
			this.groupingKey = options.groupings.key;
			this.groupingCollection = options.groupings.collection;
			this.groupingRenderer = options.groupings.renderer || GroupingListView.defaultGroupRenderer;
			this.groupingCollection.each(this.assignGroupingView, this);
		}
	},

	/** @private */
	renderFilterBy: function (newVal, oldVal) {
		this.renderChildrenGroups(newVal && newVal.get(this.groupingKey));
		FilterableListView.prototype.renderFilterBy.apply(this, arguments);
	},

	/** @private */
	renderChildrenGroups: function (modelIds) {
		if (modelIds) {
			this.groupingCollection.each(function (model, index, arr) {
				this.children.findByModel(model).el.classList.toggle("excluded", !_.contains(modelIds, model.id));
			}, this);
		} else {
			this.children.each(function (view) {
				view.el.classList.remove("excluded");
			});
		}
	},

	// renderLayout: function () {
	// 	return FilterableListView.prototype.renderLayout.apply(this, arguments);
	// },

	/** @private Create children views */
	assignGroupingView: function (item) {
		var view = new this.groupingRenderer({
			model: item,
			el: this.el.querySelector(".list-group[data-id=\"" + item.id + "\"]")
		});
		this.children.add(view);//, item.id);
		return view;
	},

}, {
	/**
	 * @constructor
	 * @type {module:app/view/component/GroupingListView.defaultGroupRenderer}
	 */
	defaultGroupRenderer: View.extend({
		/** @override */
		tagName: "dt",
		/** @override */
		className: "list-group",
	})
});

module.exports = GroupingListView;
