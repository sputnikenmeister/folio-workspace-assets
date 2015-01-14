/**
 * @module app/view/component/GroupingListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("./FilterableListView");

/**
 * @constructor
 * @type {module:app/view/component/GroupingListView}
 */
var GroupingListView = FilterableListView.extend({

	/** @override */
	tagName: "dl",
	/** @override */
	className: "grouped",

	/** @override */
	initialize: function (options) {
		FilterableListView.prototype.initialize.apply(this, arguments);
		if (options.groupings) {
			this.groupingKey = options.groupings.key;
			this.groupingCollection = options.groupings.collection;

			this.groupingChildren = new Container();
			this.groupingRenderer = options.groupings.renderer || GroupingListView.GroupingRenderer;
			this.groupingCollection.each(this.assignGroupingView, this);
		}
	},

	/** @private */
	renderFilterBy: function (newAssoc) {
		FilterableListView.prototype.renderFilterBy.apply(this, arguments);
		var groupIds;
		if (newAssoc) {
			groupIds = newAssoc.get(this.groupingKey);
		}
		this.renderChildrenGroups(groupIds);
	},

	/** @private */
	renderChildrenGroups: function (modelIds) {
		if (modelIds) {
			this.groupingCollection.each(function (model, index, arr) {
				if (_.contains(modelIds, model.id)) {
					this.groupingChildren.findByModel(model).$el.removeClass("excluded");
				} else {
					this.groupingChildren.findByModel(model).$el.addClass("excluded");
				}
			}, this);
		} else {
			this.groupingChildren.each(function (view) {
				view.$el.removeClass("excluded");
			});
		}
	},

	/** @private Create children views */
	assignGroupingView: function (item) {
		var view = new this.groupingRenderer({
			model: item,
			el: item.selector()
		});
		this.groupingChildren.add(view, item.id);
		return view;
	},

}, {
	/**
	 * @constructor
	 * @type {module:app/view/component/GroupingRenderer}
	 */
	GroupingRenderer: Backbone.View.extend({
		/** @override */
		tagName: "dt",
		/** @override */
		className: "list-group",
	})
});

module.exports = GroupingListView;
