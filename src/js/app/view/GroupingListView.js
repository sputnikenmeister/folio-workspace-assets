/**
* @module view/ItemListView
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

/*
 * Private mixins
 */


/** @private */
// var whenAssociationSelect = function(newAssoc, oldAssoc) {
// 	if (newAssoc) {
// 		var assocIds = newAssoc.get(this.groupings.key);
// 		this.groupings.collection.each(function (model, index, arr) {
// 			var view = this.getGroupingView(model);
// 			if (_.contains(assocIds, model.get("handle"))) {
// 				view.$el.addClass("included").removeClass("excluded");
// 			} else {
// 				view.$el.addClass("excluded").removeClass("included");
// 			}
// 		}, this);
// 	} else {
// 		this.$(this.getAllGroupingElements()).removeClass("included").removeClass("excluded");
// 	}
// };

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

	renderFilters: function(newAssoc, oldAssoc) {
		SelectableListView.prototype.renderFilters.apply(this, arguments);
		if (newAssoc) {
			var assocIds = newAssoc.get(this.groupings.key);
			this.groupings.collection.each(function (model, index, arr) {
				var view = this.getGroupingView(model);
				if (_.contains(assocIds, model.get("handle"))) {
					view.$el.addClass("included").removeClass("excluded");
				} else {
					view.$el.addClass("excluded").removeClass("included");
				}
			}, this);
		} else {
			this.$(this.getAllGroupingElements()).removeClass("included").removeClass("excluded");
		}
	},

	/*
	* Create children views
	*/
	/** @private */
	assignGroupingView: function(model, index, arr) {
		var selector = "#" + model.get("handle");
		var view = new GroupingView({model: model, el: selector});
		this._groupingViews[index] = this._groupingViewsIndex[model.id] = view;
		this._groupingEls[index] = this._groupingElsIndex[model.id] = view.el;
	},

	/*
	 * Child view helpers
	 */

	/** @private */
	_groupingViewsIndex: {},
	/** @private */
	getGroupingView: function(model) {
		return this._groupingViewsIndex[model.id];
	},

	/** @private */
	_groupingElsIndex: {},
	/** @private */
	getGroupingElement: function(model) {
		return this._groupingElsIndex[model.id];
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
