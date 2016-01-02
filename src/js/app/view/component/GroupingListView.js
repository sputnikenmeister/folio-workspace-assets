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
	cidPrefix: "groupingList",
	/** @override */
	tagName: "dl",
	/** @override */
	className: "grouped",
	
	/** @type {Function|null} empty array */
	_groupingFn: null,//function() { return null; },

	/** @override */
	initialize: function (options) {
		FilterableListView.prototype.initialize.apply(this, arguments);
		
		// this.groupingCollection = new Backbone.Collection();
		this.groupingRenderer = options.groupingRenderer || GroupingListView.defaultGroupRenderer;
		
		if (options.groupingFn) {
			this._groupingFn = options.groupingFn;
			this._groupItems = _.uniq(this.collection.map(this._groupingFn, this));
			// this.groupingCollection.reset(this._groupItems);
			// this.groupingCollection.each(this.assignGroupingView, this);
			this._groupItems.forEach(this.assignGroupingView, this);
		}
		// else if (options.groupings) {
		// 	options.filterFn && (this._filterFn = options.filterFn);
		// 	this.groupingKey = options.groupings.key;
		// 	this.groupingCollection = options.groupings.collection;
		// 	// this.groupingRenderer = options.groupings.renderer || GroupingListView.defaultGroupRenderer;
		// 	this.groupingCollection.each(this.assignGroupingView, this);
		// }
	},

	// /** @private */
	// renderFilterBy: function (newVal, oldVal) {
	// 	FilterableListView.prototype.renderFilterBy.apply(this, arguments);
	// // 	this.renderFilteredGroupsById(newVal && newVal.get(this.groupingKey));
	// },
	
	renderFilterFn: function() {
		FilterableListView.prototype.renderFilterFn.apply(this, arguments);
		
		var groups;
		if (this._groupingFn) {
			groups = this._filteredItems.map(this._groupingFn, this);
			// groupIds = _.pluck(groups, "id");
			// this.renderChildrenGroups(groups);
			this._groupItems.forEach(function (group, index, arr) {
				this.itemViews.findByModel(group).el.classList.toggle("excluded", groups.indexOf(group) == -1);
				// this.itemViews.findByModel(group).el.classList.toggle("excluded",!_.contains(groups, group));
			}, this);
		}
		// this.renderFilteredGroupsById(groupIds);
		// this._filteredGroups = groups;
		// this._filteredGroupIds = groupIds;
		
		// console.log("%s::renderFilterFn\n\tgroups: [%s]", this.cid, (groupIds? groupIds.join(", "): ""));
	},

	// /** @private */
	// renderFilteredGroups: function (groups) {
	// 	
	// },

	// /** @private */
	// renderFilteredGroupsById: function (groupIds) {
	// 	if (groupIds && groupIds.length) {
	// 		// this.groupingCollection.each(function (item, index, arr) {
	// 		this._groupItems.forEach(function (item, index, arr) {
	// 			this.itemViews.findByModel(item).el.classList.toggle("excluded", groupIds.indexOf(item.id) == -1);
	// 		}, this);
	// 	} else {
	// 		// this.groupingCollection.each(function (item, index, arr) {
	// 		this._groupItems.forEach(function (item, index, arr) {
	// 			this.itemViews.findByModel(item).el.classList.remove("excluded");
	// 		}, this);
	// 		// this.itemViews.each(function (view) {
	// 		// 	view.el.classList.remove("excluded");
	// 		// });
	// 	}
	// },

	// renderLayout: function () {
	// 	return FilterableListView.prototype.renderLayout.apply(this, arguments);
	// },

	/** @private Create children views */
	assignGroupingView: function (item) {
		// var groupEl = this.el.querySelector(".list-group[data-id=\"" + item.id + "\"]");
		// console.log(item.id, groupEl);
		var view = new this.groupingRenderer({
			model: item,
			el: this.el.querySelector(".list-group[data-id=\"" + item.id + "\"]")
		});
		this.itemViews.add(view);//, item.id);
		return view;
	},

}, {
	/**
	/* @constructor
	/* @type {module:app/view/component/GroupingListView.defaultGroupRenderer}
	/*/
	defaultGroupRenderer: View.extend({
		/** @override */
		cidPrefix: "listGroup",
		/** @override */
		tagName: "dt",
		/** @override */
		className: "list-group",
	})
});

module.exports = GroupingListView;
