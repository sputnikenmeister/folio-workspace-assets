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
// var whenAssociationSelect = function(newAssoc, oldAssoc) {
// 	if (newAssoc) {
// 		var assocIds = newAssoc.get(this.associations.key);
// 		this.collection.each(function(model, index, arr) {
// 			var view = this.getItemView(model);
// 			if (_.contains(assocIds, model.id)) {
// 				view.$el.addClass("included").removeClass("excluded");
// 			} else {
// 				view.$el.addClass("excluded").removeClass("included");
// 			}
// 		}, this);
// 		if (!oldAssoc) {
// 			this.$el.addClass("has-filter");
// 		}
// 	} else {
// 		this.$(this.getAllItemElements()).removeClass("included").removeClass("excluded");
// 		this.$el.removeClass("has-filter");
// 	}
// };

/**
 * @constructor
 * @type {ItemView}
 */
var ItemView = Backbone.View.extend({

	/** @type {Object} */
	events: {
		"click ": "onClick",
	},

	/** Event handler */
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

	// /** @override */
	// events: {
	// 	"animationend .item": "onAnimationEnd",
	// 	"transitionend .item": "onAnimationEnd"
	// },

	// onAnimationEnd: function(ev) {
	// 	console.log(ev.type, ev.originalEvent);
	// },

	/** @override */
	initialize: function(options) {
		_.bindAll(this, "validateRender");

		this.listenTo(this.collection, "collection:select", this.whenCollectionSelect);
		this.collection.each(this.assignItemView, this);

		if (options["associations"]) {
			this.associations = options["associations"];
			this.listenTo(this.associations.collection, "collection:select", this.whenAssociationSelect);
		}
		this.$el.addClass("animate");
	},

	/*
	* Render methods
	*/

	initialized: false,
	/** @type {Object.<String, {Function|true}}>} */
	renderJobs: null,
	/** @type {long} */
	renderRequestId: 0,

	/**
	* @param {String} [key]
	* @param [value]
	*/
	requestRender: function(key, value) {
		if (this.renderJobs == null) {
			this.renderRequestId = window.requestAnimationFrame(this.validateRender);
			this.renderJobs = {};
		}
		if (key) {
			this.renderJobs[key] = value? value: true;
		}
	},

	validateRender: function(timestamp) {
		this.render(timestamp);
		this.renderJobs = null;
	},

	/** @override */
	render: function(timestamp) {

		if (this.renderJobs.collapsed) this.renderJobs.collapsed();
		if (this.renderJobs.filters) this.renderJobs.filters();
		if (this.renderJobs.selection) this.renderJobs.selection();

		console.log(["[render]", timestamp, this.el.id, this.el.className].join(" "));
		return this;
	},

	/** @private */
	renderCollapsed: function(value) {
		if (value) {
			this.$el.addClass("collapsed");
		} else {
			this.$el.removeClass("collapsed");
		}
	},

	/** @private */
	renderSelection: function(newItem, oldItem) {
		if (newItem) {
			this.getItemView(newItem).$el.addClass("selected");
			if (!oldItem) {
				this.$el.addClass("has-selection");
			}
		}
		if (oldItem) {
			this.getItemView(oldItem).$el.removeClass("selected");
			if (!newItem) {
				this.$el.removeClass("has-selection");
			}
		}
	},

	/** @private */
	renderFilters: function(newAssoc, oldAssoc) {
		if (newAssoc) {
			var assocIds = newAssoc.get(this.associations.key);
			this.collection.each(function(model, index, arr) {
				var view = this.getItemView(model);
				if (_.contains(assocIds, model.id)) {
					view.$el.addClass("included").removeClass("excluded");
				} else {
					view.$el.addClass("excluded").removeClass("included");
				}
			}, this);
			if (!oldAssoc) {
				this.$el.addClass("has-filter");
			}
		} else {
			this.$(this.getAllItemElements()).removeClass("included").removeClass("excluded");
			this.$el.removeClass("has-filter");
		}
	},

	/*
	 * Public properties
	 */

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
		this.requestRender("collapsed", this.renderCollapsed.bind(this, value));
	},

	/*
	 * Event handlers
	 */

	/** @private */
	whenItemViewClick: function(item) {
		if (this.collection.selected !== item) {
			this.trigger("view:itemSelect", item);
		} else {
			this.trigger("view:itemDeselect");
		}
	},

	/** @private */
	whenCollectionSelect: function(newItem, oldItem) {
		this.requestRender("selection", this.renderSelection.bind(this, newItem, oldItem));
	},

	/** @private */
	whenAssociationSelect: function(newAssoc, oldAssoc) {
		this.requestRender("filters", this.renderFilters.bind(this, newAssoc, oldAssoc));
	},

	/*
	* Create children views
	*/
	/** @private */
	assignItemView: function(model, index, arr) {
		var selector = "#" + model.get("handle");
		var view = new ItemView({model: model, el: selector});
		this._itemViews[index] = this._itemViewsIndex[model.id] = view;
		this._itemEls[index] = this._itemElsIndex[model.id] = view.el;
		this.listenTo(view, "item:click", this.whenItemViewClick);
	},

	/*
	 * Child view helpers
	 */

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
