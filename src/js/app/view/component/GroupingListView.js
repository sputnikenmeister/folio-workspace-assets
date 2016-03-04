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
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("app/view/render/ClickableRenderer");

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
	defaults: _.defaults({
	// defaults: {
		renderer: ClickableRenderer.extend({
			/** @override */
			cidPrefix: "groupingListItem",
			/** @override */
			tagName: "dl",
			/** @override */
			className: "list-item list-node",
		}),
		groupingRenderer: View.extend({
			/** @override */
			cidPrefix: "groupingListGroup",
			/** @override */
			tagName: "dt",
			/** @override */
			className: "list-group list-node",
		}),
		groupingFn: null,
	// },
	}, FilterableListView.prototype.defaults),
	
	/** @override */
	initialize: function (options) {
		FilterableListView.prototype.initialize.apply(this, arguments);
		
		this._groupItems = [];
		this._groupsByItemCid = {};
		
		this._groupingFn = options.groupingFn;
		this.groupingRenderer = options.groupingRenderer;// || GroupingListView.defaultGroupRenderer;
		
		this._refreshGroups();
		if (this._groupingFn) {
			this._groupItems.forEach(this.createGroupingView, this);
		}
	},
	
	_refreshGroups: function() {
		// this._groupItems = _.uniq(this.collection.map(this._groupingFn, this));
		this._groupItems.length = 0;
		if (this._groupingFn) {
			this.collection.forEach(function(item) {
				var groupObj = this._groupingFn.apply(null, arguments);
				if (groupObj && this._groupItems.indexOf(groupObj) == -1) {
					this._groupItems.push(groupObj);
				}
				this._groupsByItemCid[item.cid] = groupObj;
			}, this);
		} else {
			this.collection.forEach(function(item) {
				this._groupsByItemCid[item.cid] = null;
			}, this);
		}
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

});

module.exports = GroupingListView;
