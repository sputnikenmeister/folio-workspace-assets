/**
 * @module app/view/component/GroupingListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:backbone} */
// var Backbone = require("backbone");
// /** @type {module:backbone.babysitter} */
// var Container = require("backbone.babysitter");
// /** @type {module:app/view/base/View} */
// var View = require("app/view/base/View");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("app/view/render/ClickableRenderer");
/** @type {module:app/view/render/LabelRenderer} */
var LabelRenderer = require("app/view/render/LabelRenderer");
// /** @type {module:utils/array/difference} */
// var diff = require("utils/array/difference");

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
	_groupingFn: null, //function() { return null; },

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
		groupingRenderer: LabelRenderer.extend({
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

	properties: {
		groups: {
			get: function() {
				return this._groups;
			}
		},
		filteredGroups: {
			get: function() {
				return this._filteredGroups;
			}
		},
	},

	/** @override */
	initialize: function(options) {
		FilterableListView.prototype.initialize.apply(this, arguments);

		this._groups = [];
		this._filteredGroups = [];
		this._changedFilteredGroups = [];
		this._groupsByItemCid = {};

		this._groupingFn = options.groupingFn;
		this.groupingRenderer = options.groupingRenderer;
		this._computeGroups();
		if (this._groupingFn) {
			this._groups.forEach(this.createGroupingView, this);
		}
	},

	/**
	 * Called once on collection change
	 * @private
	 */
	_computeGroups: function() {
		// this._groups = _.uniq(this.collection.map(this._groupingFn, this));
		this._groups.length = 0;
		// this._groupItems.length = 0;
		if (this._groupingFn) {
			this.collection.forEach(function(item) {
				var gIdx, gObj;
				gObj = this._groupingFn.apply(null, arguments);
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

	/** @private Create children views */
	createGroupingView: function(item) {
		var view = new this.groupingRenderer({
			model: item,
			el: this.el.querySelector(".list-group[data-id=\"" + item.id + "\"]")
		});
		this.itemViews.add(view);
		return view;
	},

	/* --------------------------- *
	/* Filter impl 1
	/* --------------------------- */

	/** @override */
	/*
	computeFilter_1: function() {
		FilterableListView.prototype.computeFilter_1.apply(this, arguments);

		if (this._groupingFn) {
			if (this._filteredItems.length == 0) {
				this._filteredGroups = [];
			} else {
				this._filteredGroups = _.uniq(this._filteredItems.map(function(item) {
					return this._groupsByItemCid[item.cid];
				}, this));
			}
		}
		// if (this._groupingFn) {
		// 	if (this._filteredItems.length == 0) {
		// 		this._filteredGroups = [];
		// 		this._groups.forEach(function(group) {
		// 			this.itemViews.findByModel(group).el.classList.remove("excluded");
		// 		}, this);
		// 	} else {
		// 		this._filteredGroups = _.uniq(this._filteredItems.map(function(item) {
		// 			return this._groupsByItemCid[item.cid];
		// 		}, this));
		// 		this._groups.forEach(function(group) {
		// 			this.itemViews.findByModel(group).el.classList.toggle("excluded", this._filteredGroups.indexOf(group) == -1);
		// 		}, this);
		// 	}
		// }
	},
	*/

	/* --------------------------- *
	/* Filter impl 2
	/* --------------------------- */

	// /** @override */
	// renderFilterFn_2: function() {
	// 	FilterableListView.prototype.renderFilterFn_2.apply(this, arguments);
	// },

	/** @override */
	computeFilter: function() {
		FilterableListView.prototype.computeFilter.apply(this, arguments);

		if (this._groupingFn) {
			if (this._filteredItems.length == 0) {
				this._filteredGroups = this._groups.concat(); //[];
			} else {
				this._filteredGroups = _.uniq(this._filteredItems.map(function(item) {
					return this._groupsByItemCid[item.cid];
				}, this));
			}
		}
	},

	/** @override */
	applyFilter: function() {
		FilterableListView.prototype.applyFilter.apply(this, arguments);

		this._groups.forEach(function(group) {
			this.itemViews.findByModel(group).el.classList.toggle("excluded", (this._filteredGroups.indexOf(group) == -1));
		}, this);
	},

	// computeFiltered: function() {
	// 	FilterableListView.prototype.computeFiltered.apply(this, arguments);
	// },
	//
	// renderFiltered: function() {
	// 	FilterableListView.prototype.renderFiltered.apply(this, arguments);
	// },

});

module.exports = GroupingListView;
