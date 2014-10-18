/**
* jscs standard:Jquery
* @module view/ItemListView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/*
 * Private mixins
 */

/** @private */
var whenCollectionSelect = function(newItem, oldItem)
{
	if (newItem)
	{
		this.getItemView(newItem).$el.addClass("selected");
		if (!oldItem)
		{
			this.$el.addClass("has-selected");
		}
	}
	if (oldItem)
	{
		this.getItemView(oldItem).$el.removeClass("selected");
		if (!newItem)
		{
			this.$el.removeClass("has-selected");
		}
	}
	if (!newItem && !oldItem)
	{
		throw new Error("ItemListView.onModelSelection: both new and old are null");
	}
	//this.render();
};

/** @private */
var whenAssociationSelect = function(newAssoc, oldAssoc)
{
	console.log("ItemListView.whenAssociationSelect", (newAssoc? newAssoc.get("handle"): null));
	if (newAssoc)
	{
		var assocIds = newAssoc.get(this.associations.key);

		this.collection.each(function(model, index, arr)
		{
			var view = this.getItemView(model);
			if (_.contains(assocIds, model.id))
			{
				view.$el.addClass("highlight");
			}
			else
			{
				view.$el.removeClass("highlight");
			}
		}, this);

		if (!oldAssoc)
		{
			this.$el.addClass("has-highlight");
		}
	}
	else
	{
		this.$(this.getAllItemElements()).removeClass("highlight");
		this.$el.removeClass("has-highlight");
	}
	//this.render();
};

/**
 * @constructor
 * @type {ItemView}
 */
var ItemView = Backbone.View.extend({

	events: {
		"click ": "onClick",
	},

	onClick: function (event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
		}
		this.trigger("item:click", this.model);
	},
});

/**
 * @constructor
 * @type {module:app/view/ItemListView}
 */
module.exports = Backbone.View.extend({

	/** @override */
	tagName: "dl",

	/** @override */
	className: "mapped",

	/** @public @type {object} */
	associations: {},

	/** @override */
	initialize: function(options)
	{
		// setup the ViewOptions functionality.
		//Backbone.ViewOptions.add( this, "initializationOptions" );
		// and make use of any provided options
		//this.setOptions( options );
		this.listenTo(this.collection, "collection:select", whenCollectionSelect);

		this.collection.each(this.assignItemView, this);

		if (options["associations"])
		{
			this.associations = options["associations"];
			this.listenTo(this.associations.collection, "collection:select", whenAssociationSelect);
		}
	},

	/** @private */
	whenItemViewClick: function(item)
	{
		this.trigger("view:itemSelect", item);
	},

	/** @private */
	_itemViews: [],

	/** @private */
	_itemViewsIndex: {},

	/** @private */
	_itemEls: [],

	/** @private */
	_itemElsIndex: {},

	/** @private */
	getItemView: function(model)
	{
		return this._itemViewsIndex[model.id];
	},

	/** @private */
	getItemElement: function(model)
	{
		return this._itemElsIndex[model.id];
	},

	/** @private */
	getAllItemViews: function()
	{
		return this._itemViews;
	},

	/** @private */
	getAllItemElements: function()
	{
		return this._itemEls;
	},

	/** @private */
	assignItemView: function(model, index, arr)
	{
		var elt = this.$("#" + model.get("handle"));
		var view = new ItemView({model: model});

		view.setElement(elt);
		this.listenTo(view, "item:click", this.whenItemViewClick);

		this._itemViewsIndex[model.id] = view;
		this._itemViews[index] = view;
		this._itemElsIndex[model.id] = view.el;
		this._itemEls[index] = view.el;
	},

	/** @private */
	_collapsed: false,

	collapsed: function(value)
	{
		if (arguments.length === 0)
		{
			return this._collapsed;
		}
		if (value === this._collapsed)
		{
			return;
		}

		this._collapsed = value;

		if (value)
		{
			this.$el.addClass("collapsed");
		}
		else
		{
			this.$el.removeClass("collapsed");
		}
		//this.render();
	},

	render: function()
	{
		return this;
	}
});
