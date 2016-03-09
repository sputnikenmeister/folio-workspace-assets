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
		
		this._groups = [];
		// this._groupItems = [];
		this._groupsByItemCid = {};
		
		this._groupingFn = options.groupingFn;
		this.groupingRenderer = options.groupingRenderer;
		
		this._refreshGroups();
		if (this._groupingFn) {
			this._groups.forEach(this.createGroupingView, this);
		}
	},
	
	_refreshGroups: function() {
		// this._groups = _.uniq(this.collection.map(this._groupingFn, this));
		this._groups.length = 0;
		// this._groupItems.length = 0;
		if (this._groupingFn) {
			this.collection.forEach(function(item) {
				var gIdx, gObj = this._groupingFn.apply(null, arguments);
				if (gObj) {
					gIdx = this._groups.indexOf(gObj);
					if (gIdx == -1) {
						gIdx = this._groups.length;
						this._groups[gIdx] = gObj;
						// this._groupItems[gIdx] = [];
					}
					// this._groupItems[gIdx].push(item);
				}
				this._groupsByItemCid[item.cid] = gObj;
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
			var filteredGroups = this._filteredItems.map(function(item) {
				return this._groupsByItemCid[item.cid];
			}, this);
			this._groups.forEach(function (group ) {
				this.itemViews.findByModel(group).el.classList.toggle("excluded", filteredGroups.indexOf(group) == -1);
			}, this);
			// this._groupsExclusionIndex = this._groups.map(function (group) {
			// 	return groups.indexOf(group) == -1);
			// }, this);
		}
	},
	
	/** @private Create children views */
	createGroupingView: function (item) {
		var view = new this.groupingRenderer({
			model: item,
			el: this.el.querySelector(".list-group[data-id=\"" + item.id + "\"]")
		});
		this.itemViews.add(view);
		return view;
	},
	
	/* --------------------------- *
	/* Filter 2
	/* --------------------------- */
	
	computeFiltered: function() {
		FilterableListView.prototype.computeFiltered.apply(this, arguments);
	},
	
	renderFiltered: function() {
		FilterableListView.prototype.renderFiltered.apply(this, arguments);
	},

});

module.exports = GroupingListView;
