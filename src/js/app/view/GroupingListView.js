/**
* jscs standard:Jquery
* @module view/ItemListView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:app/view/ItemView} */
//var ItemView = require( "./ItemView" );

/** @type {module:app/view/GroupingView} */
//var GroupingView = require( "./GroupingView" );

/** @type {module:app/view/ItemListView} */
var ItemListView = require( "./ItemListView" );

/**
 * @constructor
 * @type {module:app/view/GroupingView}
 */
var GroupingView = Backbone.View.extend({
});

/*
 * Private mixins
 */

/** @private */
var assignGroupingView = function(model, index, arr)
{
//	console.log("GroupingListView.assignGroupingView");

	var elt = this.$("#" + model.get("handle"));
	var view = new GroupingView({model: model});

	view.setElement(elt);

	this._groupingViewsIndex[model.id] = view;
	this._groupingViews[index] = view;
};

/** @private */
var _junk_whenAssociationSelect = function(newItem, oldItem)
{
//	console.log("GroupingListView.whenAssociationSelect", (newItem? newItem.get("handle"): null));
	if (newItem)
	{
		var refIds = newItem.get(this.groupings.key);
		_.each(this._junk_groupingEls, function(o, i, a)
		{
			var elt = this.$(o);
			if (_.contains(refIds, o.id))
			{
				elt.addClass("highlight");
			}
			else
			{
				elt.removeClass("highlight");
			}
		});
	}
	else
	{
		this.$(this._junk_groupingEls).removeClass("highlight");
	}
	//this.render();
};

/**
 * @constructor
 * @type {module:app/view/GroupingListView}
 */
module.exports = ItemListView.extend({

	groupings: {},

	initialize: function(options) {
		ItemListView.prototype.initialize.apply(this, arguments);

		if (this.associations.collection)
		{
			this.associations = options["associations"];
			this.listenTo(this.associations.collection, "collection:select", _junk_whenAssociationSelect);
		}

		if (options["groupings"]) {
			this.groupings = options["groupings"];
			this.initializeGroups();
		}
		this._junk_groupingEls = this.$(".group");
	},

	initializeGroups: function()
	{
//		var modelGroupings = this.collection.groupBy("type");
		this.groupings.collection.each(assignGroupingView, this);
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
