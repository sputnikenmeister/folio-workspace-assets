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
	tagName: "dt",
	/** @override */
	className: "group"
});

/*
 * Private mixins
 */

/** @private */
// var assignGroupingView = function(model, index, arr) {
// 	var view = new GroupingView({model: model});
// 	var elt = this.$("#" + model.get("handle"));
// 	view.setElement(elt);
// 	this._groupingViewsIndex[model.id] = view;
// 	this._groupingViews[index] = view;
// };
var assignGroupingView = function(model, index, arr) {
	this._groupingViews[index] = this._groupingViewsIndex[model.id] =
			new GroupingView({model: model, el: "#" + model.get("handle")});
};

/** @private */
var _junk_whenAssociationSelect = function(newItem, oldItem) {
//	console.log("GroupingListView.whenAssociationSelect", (newItem? newItem.get("handle"): null));
	if (newItem) {
		var refIds = newItem.get(this.groupings.key);
		_.each(this._junk_groupingEls, function(o, i, a) {
			var elt = this.$(o);
			if (_.contains(refIds, o.id)) {
				elt.addClass("highlight");
			} else {
				elt.removeClass("highlight");
			}
		});
	} else {
		this.$(this._junk_groupingEls).removeClass("highlight");
	}
	//this.render();
};

/**
 * @constructor
 * @type {module:app/view/GroupingListView}
 */
module.exports = SelectableListView.extend({

	/** @private */
	groupings: {},

	initialize: function(options) {
		SelectableListView.prototype.initialize.apply(this, arguments);

		if (this.associations.collection) {
			this.associations = options["associations"];
			this.listenTo(this.associations.collection, "collection:select", _junk_whenAssociationSelect);
		}
		if (options["groupings"]) {
			this.groupings = options["groupings"];
			this.initializeGroups();
		}
	},

	/** @private */
	initializeGroups: function()
	{
		// var modelGroupings = this.collection.groupBy("type");
		this.groupings.collection.each(assignGroupingView, this);

		this._junk_groupingEls = this.$(".group");
	},

	/** @private */
	_junk_groupingEls: null,

	/** @private */
	_groupingViews: [],

	/** @private */
	_groupingViewsIndex: {},

	/** @private */
	getGroupingView: function(model)
	{
		return this._groupingViewsIndex[model.id];
	},
});
