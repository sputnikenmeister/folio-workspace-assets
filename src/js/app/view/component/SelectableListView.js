/**
* @module app/view/component/SelectableListView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require( "../../helper/DeferredRenderView" );

/**
 * @constructor
 * @type {module:app/view/component/ItemView}
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
 * @type {module:app/view/component/SelectableListView}
 */
module.exports = DeferredRenderView.extend({

	/** @override */
	tagName: "ul",

	/** @override */
	className: "selectable-list",

	/** @public @type {Object} */
	associations: {},

	/** @override */
	initialize: function(options) {
		this.listenTo(this.collection, "collection:select", this.whenCollectionSelect);
		// this.listenTo(this.collection, "change:excluded", this.whenExcludedChange);
		if (options["associations"]) {
			this.associations = options["associations"];
			this.listenTo(this.associations.collection, "collection:select", this.whenAssociationSelect);
		}
		// Create children
		this.collection.each(this.assignItemView, this);
		// skipAnimation = true;
	},

	/*
	* Render functions
	*/

	skipAnimation: false,

	/** @override */
	render: function(timestamp) {

		if (this.skipAnimation) {
			this.$el.removeClass("animate");
			this.skipAnimation = false;
		} else {
			this.$el.addClass("animate");
		}

		// If changing to collapsed, do it first
		if (this._collapsed && this.renderJobs.collapsed)
			this.renderJobs.collapsed();

		if (this.renderJobs.filters)
			this.renderJobs.filters();

		if (this.renderJobs.selection)
			this.renderJobs.selection();

		// If changing from collapsed, do it last
		if (!this._collapsed && this.renderJobs.collapsed)
			this.renderJobs.collapsed();

		return this;
	},

	/** @private */
	renderSelection: function(newItem, oldItem) {
		if (newItem) {
			this.getItemView(newItem).$el.addClass("selected");
		}
		if (oldItem) {
			this.getItemView(oldItem).$el.removeClass("selected");
		}
	},

	/** @private */
	renderFilters: function(newAssoc, oldAssoc) {
		this.renderFilters_1(newAssoc, oldAssoc);
	},

	/** @private */
	lastExcludedCount: 0,
	/** @private */
	renderFilters_1: function(newAssoc, oldAssoc) {
		var newIds, newCount, oldCount, expectedCount;
		var changedCount = 0, excludedCount = 0;

		if (newAssoc) {
			newIds = newAssoc.get(this.associations.key);
			this.collection.each(function(model, index, arr) {
				var isExcluded = !_.contains(newIds, model.id);
				model.set("excluded", isExcluded);
				if (model.changed.excluded !== undefined) {
					changedCount++;
				}
				if (isExcluded) {
					excludedCount++;
					this.getItemView(model).$el.addClass("excluded");
				} else {
					this.getItemView(model).$el.removeClass("excluded");
				}
			}, this);
		} else {
			this.collection.each(function(model, index, arr) {
				model.unset("excluded");
				this.getItemView(model).$el.removeClass("excluded")
					.one;
			}, this);
		}

		oldCount = this.lastExcludedCount;
		newCount = excludedCount;
		if (newCount == 0) {
			expectedCount = oldCount;
		} else if (oldCount == 0) {
			expectedCount = newCount;
		} else {
			expectedCount = changedCount;
		}
		this.lastExcludedCount = excludedCount;

		console.log("[Models] expected count: " + expectedCount);
		return expectedCount;
	},

	renderFilters_2: function(newAssoc, oldAssoc) {
		var newIncludes, newExcludes, changedCount;
		var newIds, oldIds;

		if (newAssoc && oldAssoc) {
			newIds = newAssoc.get(this.associations.key);
			oldIds = oldAssoc.get(this.associations.key);
			// exclude ids already matched by oldAssoc
			newIncludes = _.difference(newIds, oldIds);
			// exclude ids no longer matched by newAssoc
			newExcludes = _.difference(oldIds, newIds);
		} else if (newAssoc) {
			// New filter set
			newIds = newAssoc.get(this.associations.key);
			oldIds = this.getAllItemIds();
			newIncludes = [];
			newExcludes = _.difference(oldIds, newIds);
			// this.$el.addClass("has-filter");
		} else if (oldAssoc) {
			// Clearing filter, no more exclusions
			newIds = this.getAllItemIds();
			oldIds = oldAssoc.get(this.associations.key);
			newIncludes = _.difference(newIds, oldIds);
			newExcludes = [];
			// this.$el.removeClass("has-filter");
		} else {
			// No changes (we shouldn't make it here)
		}
		changedCount = newIncludes.length + newExcludes.length;

		// var eventCount = changedCount;
		// var whenAllAnimationsDone = _.after(changedCount, _.bind(function(ev){
		// 	this._willCollapse.resolve();
		// 	//console.log("[Events] final count: " + eventCount);
		// }, this));
		// var eventFn = function(ev) {
		// 	eventCount--;
		// 	console.log("[Events] remaining: " + eventCount, ev.type);
		// 	testFn();
		// };
		// console.log("[Events] expected count: " + eventCount);

		_.each(newIncludes, function(id, index, arr) {
			this.getItemView(id).$el.removeClass("excluded")
				// .one("animationend webkitanimationend transitionend", whenAllAnimationsDone)
				;
		}, this);
		_.each(newExcludes, function(id, index, arr) {
			this.getItemView(id).$el.addClass("excluded")
				// .one("animationend webkitanimationend transitionend", whenAllAnimationsDone)
				;
		}, this);

		return changedCount;
	},

	/** @private */
	// renderChildrenItems: function(modelIds) {
	// 	if (modelIds) {
	// 		this.collection.each(function(model, index, arr) {
	// 			if (_.contains(modelIds, model.id)) {
	// 				this.getItemView(model).$el.removeClass("excluded");
	// 			} else {
	// 				this.getItemView(model).$el.addClass("excluded");
	// 			}
	// 		}, this);
	// 	} else {
	// 		this.$(this.getAllItemElements()).removeClass("excluded");
	// 	}
	// },

	/*
	 * Public properties
	 */

	/** @private */
	_collapsed: false,

	_willCollapse: null,

	/**
	 * @param {Boolean}
	 * @return {?Boolean}
	 */
	collapsed: function(value) {
		// if (arguments.length === 0) {
		// 	return this._collapsed;
		// }
		if (value === this._collapsed) {
			return;
		}
		this._collapsed = value;
		this.requestRender("collapsed", _.bind(this.renderCollapsed, this, value));

		// if (this._willCollapse && this._willCollapse.state() == "pending") {
		// 	this._willCollapse.reject();
		// }
		// this._willCollapse = Backbone.$.Deferred();

		// return this._willCollapse.promise();
	},

	/** @private */
	renderCollapsed: function(value) {
		if (value) {
			this.$el.addClass("collapsed");
		} else {
			this.$el.removeClass("collapsed");
		}
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
	whenCollectionSelect: function(newSelection, oldSelection) {
		this.requestRender("selection", _.bind(this.renderSelection, this, newSelection, oldSelection));
	},

	/** @private */
	whenAssociationSelect: function(newAssoc, oldAssoc) {
		this.requestRender("filters", _.bind(this.renderFilters, this, newAssoc, oldAssoc));
	},

	/*
	* Create children views
	*/
	/** @private */
	assignItemView: function(item, index, arr) {
		var view = new ItemView({
			model: item,
			el: item.selector()
		});

		this._itemIds[index] = item.id;
		this._itemViews[index] = this._itemViewsIndex[item.id] = view;
		this._itemEls[index] = this._itemElsIndex[item.id] = view.el;

		this.listenTo(view, "item:click", this.whenItemViewClick);
	},

	/*
	 * Child view helpers
	 */

	/** @private */
	_itemIds: [],
	/** @private */
	getItemId: function(index) {
		return this._itemIds[index];
	},
	/** @private */
	getAllItemIds: function() {
		return this._itemIds;
	},

	/** @private */
	_itemViewsIndex: {},
	/** @private */
	getItemView: function(obj) {
		return this._itemViewsIndex[obj] || this._itemViewsIndex[obj.id];
	},

	/** @private */
	_itemElsIndex: {},
	/** @private */
	getItemElement: function(obj) {
		return this._itemElsIndex[obj] || this._itemElsIndex[obj.id];
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
