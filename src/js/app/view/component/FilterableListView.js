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
/** @type {module:utils/css/getBoxEdgeStyles} */
var getBoxEdgeStyles = require("utils/css/getBoxEdgeStyles");

var diff = function(a1, a2) {
	return a1.reduce(function(res, o, i, a) {
		if (a2.indexOf(o) == -1) res.push(o);
		return res;
	}, []);
};

var translateCssValue =  function(x, y) {
	return "translate3d(" + x + "px, " + y + "px ,0px)";
};

/** @const */
var transformProp = prefixedProperty("transform");

/** @const */
var CHILDREN_INVALID = View.CHILDREN_INVALID,
	STYLES_INVALID = View.STYLES_INVALID,
	SIZE_INVALID = View.SIZE_INVALID,
	LAYOUT_INVALID = View.LAYOUT_INVALID,
	RENDER_INVALID = View.RENDER_INVALID;

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
		this._metrics = {};
		this._itemMetrics = [];
		this.itemViews = new Container();
		this.renderer = options.renderer || FilterableListView.defaultRenderer;
		
		this.skipTransitions = true;
		// create children
		this.collection.each(this.createItemView, this);
		if (options.filterFn) {
			this._filterFn = options.filterFn;
			this.refresh();
		}
		this.setSelection(this.collection.selected);
		this.setCollapsed((_.isBoolean(options.collapsed)? options.collapsed : false));
		
		// will trigger on return if this.el is already attached
		this.listenTo(this, "view:attached", function() {
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
	
	/** @override */
	renderFrame: function (tstamp, flags) {
		// collapsed transition flag
		if (this._collapsedTransitioning)
			console.warn("%s::renderFrame collapsed transition interrupted", this.cid);
		
		if (this.skipTransitions) {
			this.el.classList.add("skip-transitions");
			this.requestAnimationFrame(function() {
				this.el.classList.remove("skip-transitions");
			});
		}
		this._collapsedTransitioning = !this.skipTransitions && this._collapsedChanged;
		this.el.classList.toggle("collapsed-changed", this._collapsedTransitioning);
		
		if (this._collapsedChanged || this._selectionChanged || this._filterChanged) {
			flags |= View.RENDER_INVALID;
		}
		if (this._collapsedChanged) {
			this.el.classList.toggle("collapsed", this._collapsed);
		}
		if (this._selectionChanged) {
			this.renderSelection(this.collection.selected, this.collection.lastSelected);
		}
		if (this._filterChanged) {
			this.renderFilterFn();
		}
		if (flags & View.SIZE_INVALID) {
			this.measure();
		}
		if (flags & View.RENDER_INVALID) {
			this.renderLayout();
		}
		this.skipTransitions = this._collapsedChanged = this._selectionChanged = this._filterChanged = false;
	},
	
	measure: function() {
		var i, ii, el, els, m, mm;
		els = this.el.children;
		ii = els.length;
		mm = this._itemMetrics;
		
		// measure
		for (i = 0; i < ii; i++) {
			mm[i] = _.pick(els[i], "offsetTop", "offsetHeight");
		}
		this._metrics = getBoxEdgeStyles(this.el, this._metrics);
	},
	
	renderLayout: function() {
		var i, ii, el, els, m, mm;
		els = this.el.children;
		ii = els.length;
		mm = this._itemMetrics;
		
		var posX, posY;
		posX = this._metrics.paddingLeft;
		posY = this._metrics.paddingTop;
		
		// render
		for (i = 0; i < ii; i++) {
			el = els[i];
			m = mm[i];
			
			if (!this._collapsed || !el.classList.contains("excluded")) {
				if (m.offsetHeight == 0)
					posY -= m.offsetTop;
				el.style[transformProp] = translateCssValue(posX, posY);
				posY += m.offsetHeight + m.offsetTop;
			} else {
				el.style[transformProp] = translateCssValue(posX, posY);
			}
		}
		
		posY += this._metrics.paddingBottom;
		this.el.style.height = (posY > 0)? posY + "px" : "";
	},
	
	/* --------------------------- *
	/* Child views
	/* --------------------------- */
	 
	/** @private */
	createItemView: function (item, index) {
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
	/* Collapsed
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
