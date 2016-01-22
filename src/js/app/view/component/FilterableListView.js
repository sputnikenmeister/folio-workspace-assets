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

var diff = function(a1, a2) {
	return a1.reduce(function(res, o, i, a) {
		if (a2.indexOf(o) == -1) res.push(o);
		return res;
	}, []);
};

var transformProp = prefixedProperty("transform");

/** @const */
var CHILDREN_INVALID = View.CHILDREN_INVALID,
	CLASSES_INVALID = View.CLASSES_INVALID,
	SIZE_INVALID = View.SIZE_INVALID,
	LAYOUT_INVALID = View.LAYOUT_INVALID,
	RENDER_INVALID = View.RENDER_INVALID;
	
var RENDER_INVALID = SIZE_INVALID | LAYOUT_INVALID;

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
		
		this.skipTransitions = true;
		// create children
		this.collection.each(this.assignItemView, this);
		if (options.filterFn) {
			this._filterFn = options.filterFn;
			this.refresh();
		}
		this.setSelection(this.collection.selected);
		this.setCollapsed((_.isBoolean(options.collapsed)? options.collapsed : false));
		
		// if (this.attached) {
		// 	this.skipTransitions = true;
		// 	this.invalidateSize();
		// }
		this.listenTo(this, "view:added", function() {
			this.skipTransitions = true;
			this.invalidateSize();
			this.renderNow();
		});
		
		this.listenTo(this.collection, "select:one select:none", this.setSelection);
		this.listenTo(this.collection, "reset", function() {
			this._allItems = null;
			throw new Error("not implemented");
		});
	},

	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	// // /** @override */
	// render: function () {
	// 	if (this.domPhase === "created") {
	// 		if (!this._renderPending) {
	// 			this._renderPending = true;
	// 			this.listenTo(this, "view:added", this.render);
	// 		}
	// 	} else {
	// 		if (this._renderPending) {
	// 			this._renderPending = false;
	// 			this.stopListening(this, "view:added", this.render);
	// 		}
	// 		if (this.domPhase === "added") {
	// 			this.skipTransitions = true;
	// 			// this._layoutChanged = true;
	// 			this.invalidateSize();
	// 			this.renderNow();
	// 		}
	// 	}
	// 	return this;
	// },
	
	/** @override */
	renderFrame: function () {
		// collapsed transition flag
		if (this._collapsedTransitioning)
			console.warn("%s::renderFrame collapse transition interrupted", this.cid);
		
		if (this.skipTransitions) {
			this.el.classList.add("skip-transitions");
			this.requestAnimationFrame(function() {
				this.skipTransitions = false;
				this.el.classList.remove("skip-transitions");
			}.bind(this));
		}
		this._collapsedTransitioning = !this.skipTransitions && this._collapsedChanged;
		this.el.classList.toggle("collapsed-changed", this._collapsedTransitioning);
		
		if (this._collapsedChanged || this._selectionChanged || this._filterChanged) {
			this._renderFlags |= View.RENDER_INVALID;
		}
		
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
		if (this._renderFlags & View.RENDER_INVALID) {
			this._renderFlags &= ~View.RENDER_INVALID;
			this.renderLayout();
		}
	},
	
	renderLayout: function() {
		// console.log("%s::renderLayout", this.cid);
		var s = window.getComputedStyle(this.el);
		var posX = parseFloat(s.paddingLeft);
		var posY = parseFloat(s.paddingTop);
		
		var el = this.el.firstElementChild, idx = 0;
		var els = [], tx = [], includeHeigth;
		
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
		
		for (var i = 0; i < idx; i++) {
			els[i].style[transformProp] = tx[i];
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
	/*/
	setCollapsed: function (collapsed) {
		if (collapsed !== this._collapsed) {
			this._collapsed = collapsed;
			this._collapsedChanged = true;
			this.requestRender();
		}
	},
	
	/* --------------------------- *
	/* Selection
	/* --------------------------- */
	
	/** @private */
	_selectedItem: undefined,
	
	/** @param {Backbone.Model|null} */
	setSelection: function (item) {
		this._selectionChanged = true;
		this._selectedItem = item;
		this._requestRender();
	},
	
	/** @private */
	renderSelection: function (newItem, oldItem) {
		if (oldItem) {
			this.itemViews.findByModel(oldItem).el.classList.remove("selected");
		}
		if (newItem) {
			this.itemViews.findByModel(newItem).el.classList.add("selected");
		}
	},
	
	/* --------------------------- *
	/* Filter
	/* --------------------------- */
	
	refresh: function() {
		this._filterChanged = true;
		this.requestRender();
	},
	
	renderFilterFn: function() {
		var items = this._filterFn? this.collection.filter(this._filterFn, this) : this._getAllItems();
		this.renderFilters(items, this._filteredItems);
		this._filteredItems = items;
	},
	
	renderFilters: function (newItems, oldItems) {
		var hasNew = !!(newItems && newItems.length);
		var hasOld = !!(oldItems && oldItems.length);
		
		if (hasNew) {
			diff((hasOld? oldItems : this._getAllItems()), newItems).forEach(function(id) {
				this.itemViews.findByModel(id).el.classList.add("excluded");
			}, this);
		}
		if (hasOld) {
			diff((hasNew? newItems : this._getAllItems()), oldItems).forEach(function(id) {
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
