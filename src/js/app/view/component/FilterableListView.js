/**
/* @module app/view/component/FilterableListView
/*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("app/view/render/ClickableRenderer");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");

var diff = _.difference;

/**
/* @constructor
/* @type {module:app/view/component/SelectableCollectionView}
/*/
var FilterableListView = View.extend({
	
	/** @type {string} */
	cidPrefix: "filterableList",
	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable filterable",
	
	properties: {
		collapsed: {
			get: function() {
				return this._collapsed;
			},
			set: function(value) {
				this.setCollapsed(value);
			}
		}
	},
	
	events: {
		"transitionend .list-item": function(ev) {
			if (this._collapsedTransitioning && ev.propertyName === "visibility" /*&& this.el.classList.contains("collapsed-changed")*/) {
				this._collapsedTransitioning = false;
				this.el.classList.remove("collapsed-changed");
				// console.log("%s:::events[transitionend .list-item] collapsed-changed end", this.cid);
			}
		},
	},
	
	/** @override */
	initialize: function (options) {
		this.itemViews = new Container();
		
		this.renderer = options.renderer || FilterableListView.defaultRenderer;
		this.collection.each(this.assignItemView, this);
		
		this.skipTransitions = true;
		if (options.filterFn) {
			this._filterFn = options.filterFn;
			this.refresh();
		}
		this.setSelection(this.collection.selected);
		this.setCollapsed((_.isBoolean(options.collapsed)? options.collapsed : false));
		
		this.listenTo(this.collection, "select:one select:none", this.setSelection);
	},

	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	/** @override */
	render: function () {
		if (this.domPhase === "created") {
			if (!this._renderPending) {
				this._renderPending = true;
				this.listenTo(this, "view:added", this.render);
			}
		} else {
			if (this._renderPending) {
				this._renderPending = false;
				this.stopListening(this, "view:added", this.render);
			}
			if (this.domPhase === "added") {
				this._layoutChanged = true;
				this.renderNow(true);
			}
		}
		return this;
	},

	// render: function() {
	// 	this.renderNow(true);
	// 	return this;
	// },

	/** @override */
	renderLater: function () {
		if (this.skipTransitions) {
			this.el.classList.add("skip-transitions");
			this.requestAnimationFrame(function() {
				this.skipTransitions = false;
				this.el.classList.remove("skip-transitions");
			});
		}
		// collapsed transition flag
		if (this._collapsedTransitioning) console.warn("%s::renderLater collapse transition interrupted");
		this._collapsedTransitioning = !this.skipTransitions && this._collapsedChanged;
		this.el.classList.toggle("collapsed-changed", this._collapsedTransitioning);
		
		this._layoutChanged = this._layoutChanged || this._collapsedChanged || this._selectionChanged || this._filterChanged;
		
		if (this._collapsedChanged) {
			this._collapsedChanged = false;
			this.el.classList.toggle("collapsed", this._collapsed);
		}
		if (this._selectionChanged) {
			this._selectionChanged = false;
			this.renderSelection(this.collection.selected, this.collection.lastSelected);
		}
		if (this._filterChanged) {
			this._filterChanged = false;
			this.renderFilterFn();
		}
		if (this._layoutChanged) {
			this._layoutChanged = false;
			this.renderLayout();
		}
	},
	
	renderLayout: function() {
		var s = window.getComputedStyle(this.el);
		var posX = parseFloat(s.paddingLeft);
		var posY = parseFloat(s.paddingTop);
		
		var el = this.el.firstElementChild;
		var els = [], tx = [], idx = 0, includeHeigth;
		
		do {
			includeHeigth = !(this._collapsed && el.classList.contains("excluded"));
			if (includeHeigth && el.offsetHeight == 0) {
				posY -= el.offsetTop;
			}
			els[idx] = el;
			tx[idx] = "translate3d(" + posX + "px," + posY + "px, 0px)";
			idx++;
			if (includeHeigth) {
				posY += el.offsetHeight + el.offsetTop;
			}
		} while (el = el.nextElementSibling);
		
		var txProp = prefixedProperty("transform");
		for (var i = 0; i < idx; i++) {
			els[i].style[txProp] = tx[i];
		}
		
		posY += parseFloat(s.paddingBottom);
		this.el.style.height = (posY > 0)? posY + "px" : "";
	},
	
	/* --------------------------- *
	/* Child views
	/* --------------------------- */
	 
	/** @private */
	assignItemView: function (item, index) {
		var view = new this.renderer({
			model: item,
			el: this.el.querySelector(".list-item[data-id=\"" + item.id + "\"]")
		});
		this.itemViews.add(view);
		this.listenTo(view, "renderer:click", this._onRendererClick);
		return view;
	},
	
	/** @private */
	_onRendererClick: function (item) {
		if (this.collection.selected !== item) {
			this.trigger("view:select:one", item);
		} else {
			this.trigger("view:select:none");
		}
	},
	
	/* --------------------------- *
	/* Collapse
	/* --------------------------- */

	/** @private */
	_collapsed: undefined,

	/**
	/* @param {Boolean}
	/* @return {?Boolean}
	/*/
	// setCollapsed: function (collapsed, force) {
	// 	force && console.warn("FilterableListView.setCollapsed", "force=true");
	// 	if (force || collapsed !== this._collapsed) {
	setCollapsed: function (collapsed) {
		if (collapsed !== this._collapsed) {
			this._collapsed = collapsed;
			this._collapsedChanged = true;
			this.requestRender();
			// this.requestRender("collapsed", this.renderCollapsed.bind(this, collapsed));
		}
	},
	getCollapsed: function () {
		return this._collapsed;
	},

	/** @private */
	renderCollapsed: function (collapsed) {
		this.el.classList.toggle("collapsed", collapsed);
	},

	/* --------------------------- *
	/* Selection
	/* --------------------------- */

	/** @private */
	_selectedItem: undefined,

	/** @param {Backbone.Model|null} */
	// setSelection: function (item, force) {
	// 	if (force || item !== this._selectedItem) {
	setSelection: function (item) {
		this._selectionChanged = true;
		this._requestRender();
		
		// if (item !== this._selectedItem) {
		// 	var oldVal = this._selectedItem;
		// 	this._selectionChanged = true;
		// 	this.requestRender("selection", this.renderSelection.bind(this, item, oldVal));
		// }
	},

	/** @private */
	renderSelection: function (newItem, oldItem) {
		// var els = this.el.querySelectorAll(".selected");
		// for (var i = 0, ii = els.length; i < ii; i++) {
		// 	els.item(i).classList.remove("selected");
		// }
		if (oldItem) {
			// this.itemViews.findByModel(oldItem).$el.removeClass("selected");
			this.itemViews.findByModel(oldItem).el.classList.remove("selected");
		}
		if (newItem) {
			// this.itemViews.findByModel(newItem).$el.addClass("selected");
			this.itemViews.findByModel(newItem).el.classList.add("selected");
		}
		this._selectedItem = newItem;
	},

	/* --------------------------- *
	/* Filter
	/* --------------------------- */

	// _filter: undefined,
	// 
	// // filterBy: function (filter, force) {
	// // 	if (force || filter !== this._filter) {
	// filterBy: function (filter) {
	// 	if (filter !== this._filter) {
	// 		// if (this._filterChanged)
	// 		// 	console.warn("%s::filterBy filterBy changed again before render", this.cid);
	// 		this._filterChanged = true;
	// 		this._candidateFilter = filter;
	// 		this.requestRender();
	// 	} else {
	// 		if (this._filterChanged)
	// 			console.warn("%s::filterBy filterBy reverted to unchanged, but render still will happen", this.cid);
	// 		this._filterChanged = false;
	// 		this._candidateFilter = null;
	// 	}
	// 	// if (filter !== this._filter) {
	// 	// 	var oldVal = this._filter;
	// 	// 	this.requestRender("filterBy", this.renderFilterBy.bind(this, filter, oldVal));
	// 	// }
	// },
	
	refresh: function() {
		this._filterChanged = true;
		this.requestRender();
	},
	
	// clearFilter: function(force) {
	// 	this.filterBy(null, force);
	// clearFilter: function() {
	// 	this.filterBy(null);
	// },
	
	renderFilterFn: function() {
		var items = this._filterFn? this.collection.filter(this._filterFn, this) : this._getAllItems();
		this.renderFilters(items, this._filteredItems);
		this._filteredItems = items;
		
		// console.log("%s::renderFilterFn\n\titems:  [%s]", this.cid, (ids? ids.join(", "): ""));
	},
	
	// /** @private */
	// renderFilterBy: function (newVal, oldVal) {
	// 	// this.el.classList.toggle("has-excluded", !!newVal);
	// 	
	// 	// var newByFn, oldByFn, newByKey, oldByKey;
	// 	// var newIds, oldIds;
	// 	// var ids;
	// 	
	// 	// if (this._filterFn) {
	// 		// ids = _.pluck(this.collection.filter(function() {
	// 		// 	return this._filterFn.apply(this, arguments);
	// 		// }, this), "id");
	// 		// ids = _.pluck(this.collection.filter(this._filterFn, this), "id");
	// 		
	// 		
	// 		// newByFn = ids;
	// 		// oldByFn = this._currIds;
	// 		// this.renderFiltersById(ids, this._currIds);
	// 		
	// 		// this.collection.each(function(model) {
	// 		// 	this.itemViews.findByModel(model).el.toggleClass("excluded", !this._filterFn(model, newVal, oldVal));
	// 		// }, this);
	// 	// }
	// 	// if (this.filterKey) {
	// 		// newByKey = newVal && newVal.get(this.filterKey);// : null;
	// 		// oldByKey = oldVal && oldVal.get(this.filterKey);// : null;
	// 		// this.renderFiltersById(newVal && newVal.get(this.filterKey), oldVal && oldVal.get(this.filterKey));
	// 	// }
	// 	
	// 	// console.log("%s::renderFilterBy\n\tbyKey: [%s]\n\tbyFn:  [%s]", this.cid, 
	// 	// 	(newVal? newVal.get(this.filterKey).join(", "): ""), ids.join(", "));
	// 		
	// 	// this.renderFiltersById(newByKey, oldByKey);
	// 	
	// 	// this._currIds = ids;
	// 	this._filter = newVal;
	// 	this._candidateFilter = null;
	// },

	renderFilters: function (newItems, oldItems) {
		// var newIncludes, newExcludes;
		var hasNew = !!(newItems && newItems.length);
		var hasOld = !!(oldItems && oldItems.length);
		
		// this._allItems || (this._allItems = this.collection.pluck("id"));
		
		
		if (hasNew) {
			// newExcludes = _.difference((hasOld? oldItems : this._allItems), newItems);
			// _.each(newExcludes, function (id) {
			// 	// this.itemViews.findByCustom(id).$el.addClass("excluded");
			// 	// this.itemViews.findByModel(this.collection.get(id)).$el.addClass("excluded");
			// 	this.itemViews.findByModel(this.collection.get(id)).el.classList.add("excluded");
			// }, this);
			
			// _.difference((hasOld? oldItems : this._allItems), newItems).forEach(function(id) {
			diff((hasOld? oldItems : this._getAllItems()), newItems).forEach(function(id) {
				// this.itemViews.findByModelCid(id).el.classList.add("excluded");
				this.itemViews.findByModel(id).el.classList.add("excluded");
			}, this);
		}
		if (hasOld) {
			// newIncludes = _.difference((hasNew? newItems : this._allItems), oldItems);
			// _.each(newIncludes, function (id) {
			// 	// this.itemViews.findByCustom(id).$el.removeClass("excluded");
			// 	// this.itemViews.findByModel(this.collection.get(id)).$el.removeClass("excluded");
			// 	this.itemViews.findByModel(this.collection.get(id)).el.classList.remove("excluded");
			// }, this);
			// _.difference((hasNew? newItems : this._allItems), oldItems).forEach(function(id) {
			diff((hasNew? newItems : this._getAllItems()), oldItems).forEach(function(id) {
				// this.itemViews.findByModelCid(id).el.classList.remove("excluded");
				this.itemViews.findByModel(id).el.classList.remove("excluded");
			}, this);
		}
		this.el.classList.toggle("has-excluded", hasNew);
	},
	
	_getAllItems: function() {
		return this._allItems || (this._allItems = this.collection.slice());
	},
	
}, {
	defaultRenderer: ClickableRenderer.extend({
		/** @override */
		cidPrefix: "listItem",
	}),
});

module.exports = FilterableListView;
