/**
* @module app/view/ItemListView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require( "../helper/DeferredRenderView" );

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
module.exports = DeferredRenderView.extend({

	/** @override */
	tagName: "ul",

	/** @override */
	className: "selectable-list",

	/** @public @type {Object} */
	associations: {},

	/** @type {Object.<String, {String|Function}>} */
	// events: {
	// 	"animationend .item": "onAnimationEnd",
	// 	"transitionend .item": "onAnimationEnd"
	// },

	// onAnimationEnd: function(ev) {
	// 	var elt = ev.originalEvent.originalTarget;
	// 	var parentElt = elt.parentElement;
	// 	console.log(ev.type, parentElt.id, elt.id, elt.className, ev);
	// },

	/** @override */
	initialize: function(options) {
		this.listenTo(this.collection, "collection:select", this.whenCollectionSelect);
		this.listenTo(this.collection, "change:excluded", this.whenExcludedChange);
		this.collection.each(this.assignItemView, this);
		if (options["associations"]) {
			this.associations = options["associations"];
			this.listenTo(this.associations.collection, "collection:select", this.whenAssociationSelect);
		}
		this.skipAnimation = false;
	},

	/*
	* Render functions
	*/

	skipAnimation: true,

	/** @override */
	render: function(timestamp) {

		if (this.skipAnimation) {
			this.$el.removeClass("animate");
			this.skipAnimation = false;
		} else {
			this.$el.addClass("animate");
		}

		if (this.renderJobs.collapsed)
			this.renderJobs.collapsed();
		if (this.renderJobs.filters)
			this.renderJobs.filters();
		if (this.renderJobs.selection)
			this.renderJobs.selection();

		return this;
	},

	renderDebugToConsole: function(ts){
		console.log([ "[render]",
			ts.toFixed(3), this.el.id,
			this.skipAnimation? "anim: skip": "anim: run ",
			_.keys(this.renderJobs).join("|")
		].join(" "));
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
			// if (!oldItem) {
			// 	this.$el.addClass("has-selection");
			// }
		}
		if (oldItem) {
			this.getItemView(oldItem).$el.removeClass("selected");
			// if (!newItem) {
			// 	this.$el.removeClass("has-selection");
			// }
		}
	},


	/** @private */
	renderFilters: function(newAssoc, oldAssoc) {
		var newIncludes, newExcludes;
		var newIds, oldIds;

		this.updateModel(newAssoc, oldAssoc);

		if (newAssoc && oldAssoc) {
			newIds = newAssoc.get(this.associations.key);
			oldIds = oldAssoc.get(this.associations.key);
			// exclude ids already matched by oldAssoc
			newIncludes = _.difference(newIds, oldIds);
			// exclude ids no longer matched by newAssoc
			newExcludes = _.difference(oldIds, newIds);
		} else  if (newAssoc) {
			// New filter set
			newIds = newAssoc.get(this.associations.key);
			oldIds = this.getAllItemIds();
			newIncludes = [];
			newExcludes = _.difference(oldIds, newIds);
			this.$el.addClass("has-filter");
		} else if (oldAssoc) {
			// Clearing filter, no more exclusions
			newIds = this.getAllItemIds();
			oldIds = oldAssoc.get(this.associations.key);
			newIncludes = _.difference(newIds, oldIds);
			newExcludes = [];
			this.$el.removeClass("has-filter");
		} else {
			// No changes (we shouldn't make it here)
		}
		this.renderFilterChanges(newIncludes, newExcludes);

	},

	renderFilterChanges:function(newIncludes, newExcludes) {
		var view;
		var count = newIncludes.length + newExcludes.length;
		var testFn = _.after(count, function(){
			console.log("[Events] " + (count === 0? "Done": "Error: count is " + count));
		});
		console.log("[Events] expected count: " + count);
		_.each(newIncludes, function(id, index, arr) {
			this.getItemView(id).$el
				.removeClass("excluded")//.addClass("included")
				.one("animationend animationcancel transitionend", function(ev) {
					--count;
					// console.log("[Events] " + count + " remaining", ev.type);
					testFn();
				})
			;
		}, this);
		_.each(newExcludes, function(id, index, arr) {
			this.getItemView(id).$el
				.addClass("excluded")// .removeClass("included")
				.one("animationend animationcancel transitionend", function(ev) {
					--count;
					// console.log("[Events] " + count + " remaining", ev.type);
					testFn();
				})
			;
		}, this);

	},

	excludedByFilterCount: 0,
	excludedByEventCount: 0,
	/** @private */
	updateModel: function(newAssoc, oldAssoc){
		var newIds, oldIds;
		var newCount, oldCount, expectedCount;

		this.excludedByEventCount = 0;
		if (newAssoc) {
			newIds = newAssoc.get(this.associations.key);
			this.collection.each(function(model, index, arr) {
				model.set("excluded", _.contains(newIds, model.id));
			});
		} else {
			this.collection.each(function(model, index, arr) {
				model.unset("excluded");
			});
		}
		oldCount = this.excludedByFilterCount;
		newCount = this.collection.where({"excluded": false}).length;
		// if (newCount > 0) {
		// 	if (oldCount > 0) {
		// 		expectedCount = this.excludedByEventCount;
		// 	} else {
		// 		expectedCount = newCount;
		// 	}
		// } else {
		// 	expectedCount = oldCount;
		// }
		if (newCount == 0) {
			expectedCount = oldCount;
		} else if (oldCount == 0) {
			expectedCount = newCount;
		} else {
			expectedCount = this.excludedByEventCount;
		}

		// var finalCount = Math.max(newExcludedCount, oldExcludedCount);
		// console.log("[Models] filter count: " + newCount + " new, " + oldCount + " old");
		console.log("[Models] event/new/old count: " + [this.excludedByEventCount, newCount, oldCount].join(" / "));
		console.log("[Models] expected count: " + expectedCount);

		this.excludedByFilterCount = newCount;
	},

	whenExcludedChange: function(model, excluded) {
		console.log("[Models] change: " + model.get("handle") + (excluded? " excluded": " included"));
		this.excludedByEventCount++;
	},

	/** @private */
	// renderChildrenItems: function(modelIds) {
	// 	if (modelIds) {
	// 		this.collection.each(function(model, index, arr) {
	// 			if (_.contains(modelIds, model.id)) {
	// 				this.getItemView(model).$el
	// 					.addClass("included").removeClass("excluded");
	// 			} else {
	// 				this.getItemView(model).$el
	// 					.addClass("excluded").removeClass("included");
	// 			}
	// 		}, this);
	// 	} else {
	// 		this.$(this.getAllItemElements())
	// 			.removeClass("included").removeClass("excluded");
	// 	}
	// },

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
	whenCollectionSelect: function(newSelection, oldSelection) {
		this.requestRender("selection", this.renderSelection.bind(this, newSelection, oldSelection));
	},

	/** @private */
	whenAssociationSelect: function(newAssoc, oldAssoc) {
		this.requestRender("filters", this.renderFilters.bind(this, newAssoc, oldAssoc));
	},

	/*
	* Create children views
	*/
	/** @private */
	assignItemView: function(item, index, arr) {
		var view = new ItemView({
			model: item,
			el: "#" + item.get("uid")
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
