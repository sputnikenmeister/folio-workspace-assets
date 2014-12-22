/**
 * @module app/view/component/FilterableListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
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
		this.itemIds = this.collection.pluck("id");
		// Create children
		this.children = new Container();
		this.collection.each(this.assignChildView, this);

		if (options.associations) {
			this.associations = options.associations;
			this.filterBy(this.associations.collection.selected);
		}

		this.setSelection(this.collection.selected);
		this.setCollapsed(_.isBoolean(options.collapsed)? options.collapsed : false);
		this.skipAnimation = true;

		this.listenTo(this.collection, "select:one", this.setSelection);
		this.listenTo(this.collection, "select:none", this.setSelection);
		// this.listenTo(this.collection, "change:excluded", this.whenExcludedChange);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function() {
		return this;
	},

	/** @override */
	renderLater: function () {
		if (this.skipAnimation) {
			this.$el.removeClass("animate");
			this.skipAnimation = false;
		} else {
			this.$el.addClass("animate");
		}
		// If changing to collapsed, do it first
		if (this.getCollapsed()) {
			this.validateRender("collapsed");
		}
		this.validateRender("selection");
		this.validateRender("filterBy");
		// If changing from collapsed, do it last
		if (!this.getCollapsed()) {
			this.validateRender("collapsed");
		}
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
		this.listenTo(view, "item:click", this.onChildClick);
	},

	/** @private */
	onChildClick: function (item) {
		if (this.collection.selected !== item) {
			this.trigger("view:select:one", item);
		} else {
			this.trigger("view:select:none");
		}
	},

	/* --------------------------- *
	 * Collapse
	 * --------------------------- */

	/** @private */
	_collapsed: undefined,

	/**
	 * @param {Boolean}
	 * @return {?Boolean}
	 */
	setCollapsed: function (collapsed) {
		if (collapsed === this._collapsed) {
			return;
		}
		this._collapsed = collapsed;
		this.requestRender("collapsed", _.bind(this.renderCollapsed, this, collapsed));
	},
	getCollapsed: function () {
		return this._collapsed;
	},

	/** @private */
	renderCollapsed: function (collapsed) {
		if (collapsed) {
			this.$el.addClass("collapsed");
		} else {
			this.$el.removeClass("collapsed");
		}
	},

	/* --------------------------- *
	 * Selection
	 * --------------------------- */

	/** @private */
	_selectedItem: undefined,

	/** @param {Backbone.Model|null} */
	setSelection: function (item) {
		if (item === this._selectedItem) {
			return;
		}
		var oldVal = this._selectedItem;
		this._selectedItem = item;
		this.requestRender("selection", _.bind(this.renderSelection, this, item, oldVal));
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
	 * Filter
	 * --------------------------- */

	_filter: undefined,

	filterBy: function (filter) {
		if (filter === this._filter) {
			return;
		}
		var oldVal = this._filter;
		this._filter = filter;
		this.requestRender("filterBy", _.bind(this.renderFilterBy, this, filter, oldVal));
	},

	/** @private */
	renderFilterBy: function (newVal, oldVal) {
		var newIds, oldIds;
		if (newVal) {
			newIds = newVal.get(this.associations.key);
		}
		if (oldVal) {
			oldIds = oldVal.get(this.associations.key);
		}
		this.renderFiltersById(newIds, oldIds);
	},

	renderFiltersById: function (newIds, oldIds) {
		var newIncludes, newExcludes;
		var changedCount = 0;
		// this.itemIds = this.itemIds || this.collection.pluck("id");

		if (newIds) {
			newExcludes = _.difference(oldIds || this.itemIds, newIds);
			_.each(newExcludes, function (id) {
				this.children.findByCustom(id).$el.addClass("excluded");
			}, this);
			// changedCount += newExcludes.length;
			// if (!oldIds) this.$el.removeClass("has-filter");
		}
		if (oldIds) {
			newIncludes = _.difference(newIds || this.itemIds, oldIds);
			_.each(newIncludes, function (id) {
				this.children.findByCustom(id).$el.removeClass("excluded");
			}, this);
			// changedCount += newIncludes.length;
			// if (!newIds) this.$el.removeClass("has-filter");
		}

		// return changedCount;
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
		"click": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			this.trigger("item:click", this.model);
		}
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
