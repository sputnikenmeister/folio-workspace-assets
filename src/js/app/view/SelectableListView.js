/**
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
var whenCollectionSelect = function(newItem, oldItem) {
	if (newItem) {
		this.getItemView(newItem).$el.addClass("selected");
		if (!oldItem) {
			this.$el.addClass("has-selected");
		}
	}
	if (oldItem) {
		this.getItemView(oldItem).$el.removeClass("selected");
		if (!newItem) {
			this.$el.removeClass("has-selected");
		}
	}
};

/** @private */
var whenAssociationSelect = function(newAssoc, oldAssoc) {
	if (newAssoc) {
		var assocIds = newAssoc.get(this.associations.key);

		this.collection.each(function(model, index, arr) {
			var view = this.getItemView(model);
			if (_.contains(assocIds, model.id)) {
				view.$el.addClass("highlight");
			} else {
				view.$el.removeClass("highlight");
			}
		}, this);

		if (!oldAssoc) {
			this.$el.addClass("has-highlight");
		}
	} else {
		this.$(this.getAllItemElements()).removeClass("highlight");
		this.$el.removeClass("has-highlight");
	}
};

/**
 * @constructor
 * @type {ItemView}
 */
var ItemView = Backbone.View.extend({

	events: {
		"click ": "onClick",
	},

	onClick: function (ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
		}
		this.trigger("item:click", this.model);
	},
});

/**
 * @constructor
 * @type {module:app/view/SelectableListView}
 */
module.exports = Backbone.View.extend({

	/** @override */
	tagName: "ul",

	/** @override */
	className: "selectable-list",

	/** @public @type {object} */
	associations: {},

	/** @override */
	initialize: function(options) {
		this.listenTo(this.collection, "collection:select", whenCollectionSelect);
		this.collection.each(this.assignItemView, this);
		if (options["associations"]) {
			this.associations = options["associations"];
			this.listenTo(this.associations.collection, "collection:select", whenAssociationSelect);
		}
	},

	/** @override */
	render: function() {
		return this;
	},

	/** @private */
	whenItemViewClick: function(item) {
		if (this.collection.selected === item) {
			this.trigger("view:itemDeselect");
		} else {
			this.trigger("view:itemSelect", item);
		}
	},

	/** @private */
	assignItemView: function(model, index, arr) {
		var view = new ItemView({model: model, el: "#" + model.get("handle")});
		this._itemViews[index] = this._itemViewsIndex[model.id] = view;
		this._itemEls[index] = this._itemElsIndex[model.id] = view.el;

		this.listenTo(view, "item:click", this.whenItemViewClick);
	},

	/** @private */
	_collapsed: false,
	/**
	 * @param {Boolean}
	 * @return {?Boolean}
	 */
	collapsed: function(value) {
		if (arguments.length === 0) {
			return this._collapsed;
		}
		if (value === this._collapsed) {
			return;
		}
		this._collapsed = value;
		if (value) {
			this.$el.addClass("collapsed");
		} else {
			this.$el.removeClass("collapsed");
		}
	},

	/** @private */
	_itemViewsIndex: {},
	/** @private */
	getItemView: function(model) {
		return this._itemViewsIndex[model.id];
	},

	/** @private */
	_itemElsIndex: {},
	/** @private */
	getItemElement: function(model) {
		return this._itemElsIndex[model.id];
	},

	/** @private */
	_itemViews: [],
	/** @private */
	getAllItemViews: function() {
		return this._itemViews;
	},

	/** @private */
	_itemEls: [],
	/** @private */
	getAllItemElements: function() {
		return this._itemEls;
	},
});
