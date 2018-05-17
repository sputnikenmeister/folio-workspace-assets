/**
/* @module app/view/component/FilterableListView
/*/

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:backbone} */
// var Backbone = require("backbone");
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

/** @type {module:app/control/Globals.TRANSLATE_TEMPLATE} */
var translateCssValue = require("app/control/Globals").TRANSLATE_TEMPLATE;

/** @const */
var transformProp = prefixedProperty("transform");

/**
/* @constructor
/* @type {module:app/view/component/FilterableListView}
/*/
var FilterableListView = View.extend({

	/** @type {string} */
	cidPrefix: "filterableList",
	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable filterable",

	/** @override */
	defaults: {
		collapsed: true,
		filterFn: function() {
			return true;
		},
		renderer: ClickableRenderer.extend({
			/** @override */
			cidPrefix: "listItem",
		}),
	},

	/** @override */
	properties: {
		collapsed: {
			get: function() {
				return this._collapsed;
			},
			set: function(value) {
				this._setCollapsed(value);
			}
		},
		filteredItems: {
			get: function() {
				return this._filteredItems;
			}
		}
	},

	/** @override */
	events: {
		"transitionend .list-item": function(ev) {
			if (this._collapsedTransitioning && ev.propertyName === "visibility" /*&& this.el.classList.contains("collapsed-changed")*/ ) {
				this._collapsedTransitioning = false;
				this.el.classList.remove("collapsed-changed");
				// console.log("%s:::events[transitionend .list-item] collapsed-changed end", this.cid);
			}
		},
	},

	/** @override */
	initialize: function(options) {
		this._metrics = {};
		this._itemMetrics = [];
		this.itemViews = new Container();

		_.defaults(options, this.defaults);
		this.renderer = options.renderer;
		this._filterFn = options.filterFn;

		this.collection.each(this.createItemView, this);
		this.refresh();
		this._setSelection(this.collection.selected);
		this._setCollapsed(options.collapsed);

		// will trigger on return if this.el is already attached
		// this.skipTransitions = true;
		this.listenTo(this, "view:attached", function() {
			this.skipTransitions = true;
			this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID); //.renderNow();
		});

		this.listenTo(this.collection, "select:one select:none", this._setSelection);
		this.listenTo(this.collection, "reset", function() {
			this._allItems = null;
			throw new Error("not implemented");
		});
	},

	/* --------------------------- *
	/* Render
	/* --------------------------- */

	/** @override */
	renderFrame: function(tstamp, flags) {
		// collapsed transition flag
		if (this._collapsedTransitioning)
			console.warn("%s::renderFrame collapsed transition interrupted", this.cid);

		this._collapsedTransitioning = !this.skipTransitions && this._collapsedChanged;

		// this.el.classList.toggle("animate", !this.skipTransitions);
		this.el.classList.toggle("collapsed-changed", this._collapsedTransitioning);
		this.el.classList.toggle("skip-transitions", this.skipTransitions);
		if (this.skipTransitions) {
			this.skipTransitions = false;
			// Invalidate again after frame render loop to reapply transforms:
			// that should kill any running transitions.
			this.setImmediate(function() {
				this.requestRender(View.LAYOUT_INVALID);
			});
		}
		if (this._collapsedChanged) {
			flags |= View.SIZE_INVALID;
			this.el.classList.toggle("collapsed", this._collapsed);
		}
		if (this._selectionChanged) {
			flags |= View.LAYOUT_INVALID;
			this.renderSelection(this.collection.selected, this.collection.lastSelected);
		}
		if (this._filterChanged) {
			flags |= View.LAYOUT_INVALID;
			this.renderFilterFn();
		}
		if (flags & View.SIZE_INVALID) {
			this.measure();
		}
		if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
			this.renderLayout();
		}
		this._collapsedChanged = this._selectionChanged = this._filterChanged = false;
	},

	measure: function() {
		// var i, ii, el, els, m, mm;
		// els = this.el.children;
		// ii = els.length;
		// mm = this._itemMetrics;
		// for (i = 0; i < ii; i++) {
		// 	mm[i] = _.pick(els[i], "offsetTop", "offsetHeight");
		// }

		this._metrics = getBoxEdgeStyles(this.el, this._metrics);

		// var itemEl, itemView, baseline = 0;
		// if (itemEl = this.el.querySelector(".list-item:not(.excluded) .label")) {
		// 	// itemView = this.itemViews.findByCid(itemEl.cid);
		// 	var elA = itemEl, elB = itemEl.parentElement;
		// 	var yA = elA.offsetTop,
		// 		hA = elA.offsetHeight,
		// 		yB = elB.offsetTop,
		// 		hB = elB.offsetHeight;
		// 	baseline = ((yA + hA) - (yB + hB));
		// 	console.log("%s::measure fontSize: %spx (%s+%s)-(%s+%s)=%s", this.cid, this._metrics.fontSize,
		// 		yA, hA, yB, hB, baseline
		// 	);
		// }

		this.itemViews.forEach(function(view) {
			if (!view._metrics) view._metrics = {};
			// view._metrics.baseline = this._metrics.fontSize - baseline;
			view._metrics.offsetTop = view.el.offsetTop;
			view._metrics.offsetHeight = view.el.offsetHeight;
			view._metrics.offsetLeft = view.el.offsetLeft;
			view._metrics.offsetWidth = view.el.offsetWidth;
			if (!this._collapsed && view.label) {
				view._metrics.textLeft = view.label.offsetLeft;
				view._metrics.textWidth = view.label.offsetWidth;
			} else {
				view._metrics.textLeft = view._metrics.offsetLeft;
				view._metrics.textWidth = view._metrics.offsetWidth;
			}
		}, this);

		// this._metrics.baseline = this._metrics.fontSize - baseline;
	},

	renderLayout: function() {
		var posX, posY;
		posX = this._metrics.paddingLeft;
		posY = this._metrics.paddingTop;

		for (var i = 0, ii = this.el.children.length; i < ii; i++) {
			var view = this.itemViews.findByCid(this.el.children[i].cid);
			if (((this.collection.selected && !view.model.selected) ||
					view.el.classList.contains("excluded")) && this._collapsed) {
				view.transform.tx = posX;
				view.transform.ty = posY;
			} else {
				if (view._metrics.offsetHeight == 0)
					posY -= view._metrics.offsetTop;
				view.transform.tx = posX;
				view.transform.ty = posY;
				posY += view._metrics.offsetHeight + view._metrics.offsetTop;
			}
			view.el.style[transformProp] = translateCssValue(view.transform.tx, view.transform.ty);
		}

		// posY += this._metrics.paddingBottom;
		this._metrics.height = Math.max(0, posY + this._metrics.paddingBottom);
		this.el.style.height = this._metrics.height + "px";
		// this.el.style.height = (posY > 0) ? posY + "px" : "";
	},

	/* --------------------------- *
	/* Child views
	/* --------------------------- */

	/** @private */
	createItemView: function(item, index) {
		var view = new this.renderer({
			model: item,
			el: this.el.querySelector(".list-item[data-id=\"" + item.id + "\"]")
		});
		item.set("excluded", false, { silent: true });
		this.listenTo(view, "renderer:click", this._onRendererClick);
		view.listenTo(item, "change:excluded", function(item, newVal) {
			// console.log(arguments);
			if (this.el.classList.contains("excluded") !== newVal) {
				console.warn("%s:[change:excluded] m:%o css: %o", this.cid, newVal, this.el.classList.contains("excluded"));
			}
			// this.el.classList.toggle("excluded", excluded);
		});
		this.itemViews.add(view);
		return view;
	},

	/** @private */
	_onRendererClick: function(item, ev) {
		if (this._collapsedTransitioning
			|| (this._collapsed && item.get("excluded"))) {
			return;
		}
		if (this.collection.selected !== item) {
			this.trigger("view:select:one", item);
		} else {
			if (ev.altKey) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:same", item);
			}
			// this.trigger("view:select:none");
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
	_setCollapsed: function(collapsed) {
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
	_setSelection: function(item) {
		this._selectedItem = item;
		this._selectionChanged = true;
		this._requestRender();
	},

	/** @private */
	renderSelection: function(newItem, oldItem) {
		var view;
		if (oldItem) {
			view = this.itemViews.findByModel(oldItem);
			view.el.classList.remove("selected");
			// view.label.classList.remove("color-fg");
			// view.label.classList.remove("color-reverse");
		}
		if (newItem) {
			view = this.itemViews.findByModel(newItem);
			view.el.classList.add("selected");
			// view.label.classList.add("color-fg");
			// view.label.classList.add("color-reverse");
		}
	},

	/* --------------------------- *
	/* Filter
	/* --------------------------- */

	refresh: function() {
		if (this._filterFn) {
			this._filterChanged = true;
			this.requestRender();
		}
	},

	renderFilterFn: function() {
		var items = this._filterFn ? this.collection.filter(this._filterFn, this) : this._getAllItems();
		this.renderFilters(items, this._filteredItems);
		this._filteredItems = items;
	},

	renderFilters: function(newItems, oldItems) {
		var hasNew = !!(newItems && newItems.length);
		var hasOld = !!(oldItems && oldItems.length);

		console.log("%s::renderFilterFn", this.cid, newItems);

		if (hasNew) {
			diff((hasOld ? oldItems : this._getAllItems()), newItems).forEach(function(item) {
				this.itemViews.findByModel(item).el.classList.add("excluded");
				item.set("excluded", true);
			}, this);
		}
		if (hasOld) {
			diff((hasNew ? newItems : this._getAllItems()), oldItems).forEach(function(item) {
				this.itemViews.findByModel(item).el.classList.remove("excluded");
				item.set("excluded", false);
			}, this);
		}
		this.el.classList.toggle("has-excluded", hasNew);
	},

	_getAllItems: function() {
		return this._allItems || (this._allItems = this.collection.slice());
	},

	/* --------------------------- *
	/* Filter 2
	/* --------------------------- */

	// computeFiltered: function() {
	// 	this._filterResult = this.collection.map(this._filterFn, this);
	// },
	//
	// renderFiltered: function() {
	// 	this.collection.forEach(function(item, index) {
	// 		this.itemViews.findByModel(item).el.classList.toggle("excluded", !this._filterResult[index]);
	// 	}, this);
	// },

});

module.exports = FilterableListView;