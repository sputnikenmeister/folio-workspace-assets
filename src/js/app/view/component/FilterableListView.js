/**
 * @module app/view/component/FilterableListView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
require("backbone.babysitter");

/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require("../../helper/DeferredRenderView");

//var ANIMATION_EVENTS = "animationend webkitanimationend transitionend";

/**
 * @constructor
 * @type {module:app/view/component/SelectableListView}
 */
module.exports = DeferredRenderView.extend({

	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable filterable",
	/** @public @type {Object} */
	associations: {},

	/** @override */
	initialize: function (options) {
		if (options["associations"]) {
			this.associations = options["associations"];
		}
		// Create children
		this.collection.each(this.assignChildView, this);
		this.itemIds = this.collection.pluck("id");
		// skipAnimation = true;

		this.listenTo(this.collection, "select:one", this.onCollectionSelect);
		this.listenTo(this.collection, "select:none", this.onCollectionSelect);
		// this.listenTo(this.collection, "change:excluded", this.whenExcludedChange);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	skipAnimation: false,

	/** @override */
	render: function (timestamp) {

		if (this.skipAnimation) {
			this.$el.removeClass("animate");
			this.skipAnimation = false;
		} else {
			this.$el.addClass("animate");
		}

		// If changing to collapsed, do it first
		if (this._collapsed && this.renderJobs.collapsed)
			this.renderJobs.collapsed();

		if (this.renderJobs.selection)
			this.renderJobs.selection();

		if (this.renderJobs.filters)
			this.renderJobs.filters();

		// If changing from collapsed, do it last
		if (!this._collapsed && this.renderJobs.collapsed)
			this.renderJobs.collapsed();

		return this;
	},


	/* --------------------------- *
	 * Child views
	 * --------------------------- */

	/** @type {Backbone.ChildViewContainer} */
	children: new Backbone.ChildViewContainer(),

	/** @private */
	assignChildView: function (item, index) {
		var view = new FilterableRenderer({
			model: item,
			el: item.selector()
		});
		this.children.add(view, item.id);
		this.listenTo(view, "item:click", this.onChildViewClick);
	},

	/* --------------------------- *
	 * Selection
	 * --------------------------- */

	/** @private */
	onChildViewClick: function (item) {
		if (this.collection.selected !== item) {
			this.trigger("view:itemSelect", item);
		} else {
			this.trigger("view:itemDeselect");
		}
	},

	_currentItem: null,
	/** @private */
	onCollectionSelect: function (newVal) {
		var oldVal = this._currentItem;
		this._currentItem = newVal;
		this.requestRender("selection", _.bind(this.renderSelection, this, newVal, oldVal));
	},

	/** @private */
	renderSelection: function (newItem, oldItem) {
		if (newItem) {
			this.children.findByModel(newItem).$el.addClass("selected");
		}
		if (oldItem) {
			this.children.findByModel(oldItem).$el.removeClass("selected");
		}
	},

	/* --------------------------- *
	 * Collapse
	 * --------------------------- */

	/** @private */
	_collapsed: false,

	/**
	 * @param {Boolean}
	 * @return {?Boolean}
	 */
	setCollapsed: function (value) {
		if (value === this._collapsed) {
			return;
		}
		this._collapsed = value;
		this.requestRender("collapsed", _.bind(this.renderCollapsed, this, value));
	},
	getCollapsed: function () {
		return this._collapsed;
	},

	/** @private */
	renderCollapsed: function (value) {
		if (value) {
			this.$el.addClass("collapsed");
		} else {
			this.$el.removeClass("collapsed");
		}
	},

	/* --------------------------- *
	 * Filter
	 * --------------------------- */

	_currentFilter: null,

	filterBy: function (newVal) {
		if (newVal === this._currentFilter) {
			return;
		}
		var oldVal = this._currentFilter;
		this._currentFilter = newVal;
		this.requestRender("filters", _.bind(this.renderFilters, this, newVal, oldVal));
	},

	/** @private */
	renderFilters: function (newAssoc, oldAssoc) {
		var newIds, oldIds;
		if (newAssoc) {
			newIds = newAssoc.get(this.associations.key);
		}
		if (oldAssoc) {
			oldIds = oldAssoc.get(this.associations.key);
		}
		this.renderFiltersById(newIds, oldIds);
	},

	renderFiltersById: function (newIds, oldIds) {
		var newIncludes, newExcludes, changedCount = 0;
		// this.itemIds = this.itemIds || this.collection.pluck("id");

		if (newIds) {
			newExcludes = _.difference(oldIds || this.itemIds, newIds);
			_.each(newExcludes, function (id) {
				this.children.findByCustom(id).$el.addClass("excluded");
			}, this);
			changedCount += newExcludes.length;
			// if (!oldIds) this.$el.removeClass("has-filter");
		}
		if (oldIds) {
			newIncludes = _.difference(newIds || this.itemIds, oldIds);
			_.each(newIncludes, function (id) {
				this.children.findByCustom(id).$el.removeClass("excluded");
			}, this);
			changedCount += newIncludes.length;
			// if (!newIds) this.$el.removeClass("has-filter");
		}

		return changedCount;
	},

	/** @private */
	// lastExcludedCount: 0,
	/** @private */
	/*
	renderFilters_1: function(newIds, oldIds) {
		var newCount, oldCount, expectedCount;
		var changedCount = 0, excludedCount = 0;

		if (newIds && newIds.length) {
			this.collection.each(function(model, index, arr) {
				var isExcluded = !_.contains(newIds, model.id);
				model.set("excluded", isExcluded);
				if (isExcluded) {
					this.children.findByModel(model).$el
						.addClass("excluded");
					excludedCount++;
				} else {
					this.children.findByModel(model).$el
						.removeClass("excluded");
				}
				if (model.changed.excluded !== undefined) {
					changedCount++;
				}
			}, this);
		} else {
			this.collection.each(function(model, index, arr) {
				model.unset("excluded");
				this.children.findByModel(model).$el
					.removeClass("excluded");
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

		// console.log("[Models] expected count: " + expectedCount);
		// _.delay(_.bind(this.trigger, this, "view:stateTransitionEnd"), 1000);
		// return expectedCount;
	},
	*/

});

/**
 * @constructor
 * @type {module:app/view/component/ItemView}
 */
var FilterableRenderer = Backbone.View.extend({
	/** @type {Object} */
	events: {
		"click ": "onClick",
	},

	onClick: function (ev) {
		if (!ev.isDefaultPrevented()) {
			ev.preventDefault();
		}
		this.trigger("item:click", this.model);
	},

	// initialize: function(options) {
	// 	this.listenTo(this.model, "change:excluded", this.onExcludedChange);
	// },

	// onExcludedChange: function(model, value) {
	// 	if (value) {
	// 		this.$el.addClass("excluded");
	// 	} else {
	// 		this.$el.removeClass("excluded");
	// 	}
	// },
});
