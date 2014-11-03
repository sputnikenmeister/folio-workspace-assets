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

var ANIMATION_EVENTS = "animationend webkitanimationend transitionend";

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
	/** @type {Backbone.ChildViewContainer} */
	itemViews: new Backbone.ChildViewContainer(),

	/** @override */
	initialize: function(options) {
		this.listenTo(this.collection, "collection:select", this.whenCollectionSelect);
		// this.listenTo(this.collection, "change:excluded", this.whenExcludedChange);
		if (options["associations"]) {
			this.associations = options["associations"];
		}
		// Create children
		this.collection.each(this.assignItemView, this);
		this.itemIds = this.collection.pluck("id");
		// skipAnimation = true;
	},

	/*
	 * Create children views
	 */
	/** @private */
	assignItemView: function(item, index) {
		var view = new ItemView({
			model: item,
			el: item.selector()
		});
		this.itemViews.add(view, item.id);
		this.listenTo(view, "item:click", this.whenItemViewClick);
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
	 * Selection
	 * --------------------------- */

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
	renderSelection: function(newItem, oldItem) {
		if (newItem) {
			this.itemViews.findByModel(newItem).$el
				.addClass("selected");
		}
		if (oldItem) {
			this.itemViews.findByModel(oldItem).$el
				.removeClass("selected");
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
	setCollapsed: function(value) {
		if (value === this._collapsed) {
			return;
		}
		this._collapsed = value;
		this.requestRender("collapsed", _.bind(this.renderCollapsed, this, value));
	},
	getCollapsed: function() {
		return this._collapsed;
	},

	/** @private */
	renderCollapsed: function(value) {
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

	filterBy:function(model) {
		if (model === this._currentFilter) {
			return;
		}
		var lastFilter = this._currentFilter;
		this._currentFilter = model;
		this.requestRender("filters", _.bind(this.renderFilters, this, this._currentFilter, lastFilter));
	},

	/** @private */
	renderFilters: function(newAssoc, oldAssoc) {
		var newIds, oldIds;
		if (newAssoc) {
			newIds = newAssoc.get(this.associations.key);
		}
		if (oldAssoc) {
			oldIds = oldAssoc.get(this.associations.key);
		}
		this.renderFilters_1(newIds, oldIds);
	},

	/** @private */
	lastExcludedCount: 0,
	/** @private */
	renderFilters_1: function(newIds, oldIds) {
		var newCount, oldCount, expectedCount;
		var changedCount = 0, excludedCount = 0;

		if (newIds && newIds.length) {
			this.collection.each(function(model, index, arr) {
				var isExcluded = !_.contains(newIds, model.id);
				model.set("excluded", isExcluded);
				if (isExcluded) {
					excludedCount++;
					this.itemViews.findByModel(model).$el
						.addClass("excluded");
				} else {
					this.itemViews.findByModel(model).$el
						.removeClass("excluded");
				}
				if (model.changed.excluded !== undefined) {
					changedCount++;
				}
			}, this);
		} else {
			this.collection.each(function(model, index, arr) {
				model.unset("excluded");
				this.itemViews.findByModel(model).$el
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
		console.log("[Models] expected count: " + expectedCount);
		// _.delay(_.bind(this.trigger, this, "view:stateTransitionEnd"), 1000);
		// return expectedCount;
	},

	/*
	renderFilters_2: function(newIds, oldIds) {
		var newIncludes, newExcludes, changedCount;
		var whenAllAnimationsEnd;
		//this.itemIds = this.collection.pluck("id");

		if (newIds && oldIds) {
			// exclude ids already matched by oldAssoc
			newIncludes = _.difference(newIds, oldIds);
			// exclude ids no longer matched by newAssoc
			newExcludes = _.difference(oldIds, newIds);
			changedCount = newIncludes.length + newExcludes.length;
		} else if (newIds) {
			// New filter set
			newExcludes = _.difference(this.itemIds, newIds);
			changedCount = newExcludes.length;
			// this.$el.addClass("has-filter");
		} else if (oldIds) {
			// Clearing filter, no more exclusions
			newIncludes = _.difference(this.itemIds, oldIds);
			changedCount = newIncludes.length;
			// this.$el.removeClass("has-filter");
		} else {
			// No changes (we shouldn't make it here)
			// changedCount = 0;
			// return 0;
		}

		// console.log("[Events] expected count: " + eventCount);

		// whenAllAnimationsEnd = _.after(changedCount,
		// 	_.bind(this.trigger, this, "view:stateTransitionEnd"));
		// 	_.bind(function(ev){
		// 		this.trigger("view:stateTransitionEnd");
		// 		console.log("[Event view:stateTransitionEnd]", ev);
		// 	}, this));

		if (newIncludes) {
			_.each(newIncludes, function(id, index, arr) {
				this.itemViews.findByCustom(id).$el.removeClass("excluded")
					// .one(ANIMATION_EVENTS, whenAllAnimationsEnd)
					;
			}, this);
		}

		if (newExcludes) {
			_.each(newExcludes, function(id, index, arr) {
				this.itemViews.findByCustom(id).$el.addClass("excluded")
					// .one(ANIMATION_EVENTS, whenAllAnimationsEnd)
					;
			}, this);
		}

		return changedCount;
	},
	*/

});
