/**
* @module app/view/ItemListView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:app/view/render/ItemView} */
//var ItemView = require( "./render/ItemView" );

/** @type {module:app/view/render/GroupingView} */
// var GroupingView = require( "./render/GroupingView" );

/** @type {module:app/view/SelectableListView} */
var SelectableListView = require( "./SelectableListView" );

/**
 * @constructor
 * @type {module:app/view/GroupingView}
 */
var GroupingView = Backbone.View.extend({
	/** @override */
	// tagName: "dt",
	/** @override */
	// className: "group"
});

/**
 * @constructor
 * @type {module:app/view/GroupingListView}
 */
module.exports = SelectableListView.extend({

	/** @private */
	groupings: {},

	initialize: function(options) {
		SelectableListView.prototype.initialize.apply(this, arguments);

		if (options["groupings"]) {
			this.groupings = options["groupings"];
			this.groupings.collection.each(this.assignGroupingView, this);
		}
	},

	/** @private */
	renderFilters: function(newAssoc, oldAssoc) {
		var assocIds, groupIds;
		if (newAssoc) {
			// assocIds = newAssoc.get(this.associations.key);
			groupIds = newAssoc.get(this.groupings.key);
			// if (!oldAssoc) {
			// 	this.$el.addClass("has-filter");
			// }
		} else {
			// if (oldAssoc) {
			// 	this.$el.removeClass("has-filter");
			// }
		}
		// this.renderChildrenItems(assocIds);
		this.renderChildrenGroups(groupIds);

		SelectableListView.prototype.renderFilters.apply(this, arguments);
	},

	/** @private */
	renderChildrenGroups: function(modelIds) {
		if (modelIds) {
			this.groupings.collection.each(function(model, index, arr) {
				if (_.contains(modelIds, model.id)) {
					this.getGroupingView(model).$el
						// .addClass("included")
						.removeClass("excluded")
						;
				} else {
					this.getGroupingView(model).$el
						.addClass("excluded")
						// .removeClass("included")
						;
				}
			}, this);
		} else {
			this.$(this.getAllGroupingElements())
				// .removeClass("included")
				.removeClass("excluded")
				;
		}
	},

	/*
	* Create children views
	*/
	/** @private */
	assignGroupingView: function(model, index, arr) {
		var view = new GroupingView({
			model: model,
			el: "#" + model.get("uid")
		});

		this._groupingViews[index] = this._groupingViewsIndex[model.id] = view;
		this._groupingEls[index] = this._groupingElsIndex[model.id] = view.el;
	},

	/*
	 * Child view helpers
	 */

	/** @private */
	_groupingViewsIndex: {},
	/** @private */
	getGroupingView: function(obj) {
		return this._groupingViewsIndex[obj] || this._groupingViewsIndex[obj.id];
	},

	/** @private */
	_groupingElsIndex: {},
	/** @private */
	getGroupingElement: function(obj) {
		return this._groupingElsIndex[obj] || this._groupingElsIndex[obj.id];
	},

	/** @private */
	_groupingViews: [],
	/** @private */
	getAllGroupingViews: function() {
		return this._groupingViews;
	},

	/** @private */
	_groupingEls: [],
	/** @private */
	getAllGroupingElements: function() {
		return this._groupingEls;
	},
});
