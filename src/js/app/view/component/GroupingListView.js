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
		
		this.groupingRenderer = options.groupingRenderer || GroupingListView.defaultGroupRenderer;
		
		if (options.groupingFn) {
			this._groupingFn = options.groupingFn;
			// this._groupItems = _.uniq(this.collection.map(this._groupingFn, this));
			this._refreshGroups();
			this._groupItems.forEach(this.createGroupingView, this);
		}
	},
	
	_refreshGroups: function() {
		var group, groupIdx, groupSet = [], groupsByItemCid = {};
		this.collection.forEach(function(item) {
			group = this._groupingFn.apply(null, arguments);
			groupIdx = groupSet.indexOf(group);
			if (groupIdx == -1) {
				groupIdx = groupSet.length;
				groupSet[groupIdx] = group;
			}
			groupsByItemCid[item.cid] = group;
		}, this);
		this._groupItems = groupSet;
		this._groupsByItemCid = groupsByItemCid;
	},
	
	renderFilterFn: function() {
		FilterableListView.prototype.renderFilterFn.apply(this, arguments);
		
		if (this._groupingFn) {
			// groups = this._filteredItems.map(this._groupingFn, this);
			var groups = this._filteredItems.map(function(item) {
				return this._groupsByItemCid[item.cid];
			}, this);
			this._groupItems.forEach(function (group, index, arr) {
				this.itemViews.findByModel(group).el.classList.toggle("excluded", groups.indexOf(group) == -1);
				// this.itemViews.findByModel(group).el.classList.toggle("excluded",!_.contains(groups, group));
			}, this);
		}
		// console.log("%s::renderFilterFn\n\tgroups: [%s]", this.cid, (groupIds? groupIds.join(", "): ""));
	},
	
	/** @private Create children views */
	createGroupingView: function (item) {
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
