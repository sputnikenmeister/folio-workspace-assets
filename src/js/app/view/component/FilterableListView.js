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
/** @type {module:utils/array/difference} */
var diff = require("utils/array/difference");

var resolveAll = function(pp, result) {
	if (pp.length != 0) {
		pp.forEach(function(p, i, a) {
			p.resolve(result);
			a[i] = null;
		});
		pp.length = 0;
	}
	return pp;
};

var rejectAll = function(pp, reason) {
	if (pp.length != 0) {
		pp.forEach(function(p, i, a) {
			p.reject(reason);
			a[i] = null;
		});
		pp.length = 0;
	}
	return pp;
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
		selectedItem: {
			get: function() {
				return this._selectedItem;
			},
			set: function(value) {
				this._setSelection(value);
			}
		},
		filteredItems: {
			get: function() {
				return this._filteredItems;
			}
		},
		metrics: {
			get: function() {
				return this._metrics;
			}
		}
	},

	/** @override */
	events: {
		"transitionend .list-item": function(ev) {
			if (this._collapsedChanging && ev.propertyName === "visibility" /*&& this.el.classList.contains(".collapsed-changing")*/ ) {
				console.log("%s::events[transitionend .list-item] .collapsed-changing end", this.cid);
				this._collapsedChanging = false;
				this.el.classList.remove(".collapsed-changing");
				resolveAll(this._collapsePromises, this);
			}
		},
	},

	/** @override */
	initialize: function(options) {
		this._filteredItems = [];
		this._filteredIncoming = [];
		this._filteredOutgoing = [];

		this._metrics = {};
		this._itemMetrics = [];
		this._collapsePromises = [];
		this.itemViews = new Container();

		_.defaults(options, this.defaults);
		this.renderer = options.renderer;
		this._filterFn = options.filterFn;

		this.collection.each(this.createItemView, this);
		this._setSelection(this.collection.selected);
		this._setCollapsed(options.collapsed);
		this.refreshFilter();

		// will trigger on return if this.el is already attached
		this.skipTransitions = true;
		this.el.classList.add("skip-transitions");
		this.listenTo(this, "view:attached", function() {
			// this.skipTransitions = true;
			this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
		});

		// this.listenTo(this.collection, "select:one select:none", this._setSelection);
		this.listenTo(this.collection, "reset", function() {
			this._allItems = null;
			throw new Error("not implemented");
		});
	},

	/**
	 * Get an array with a collection contens
	 * @private
	 */
	_getAllItems: function() {
		return this._allItems || (this._allItems = this.collection.slice());
	},

	/* --------------------------- *
	/* Transition promises
	/* --------------------------- */

	whenCollapseChangeEnds: function() {
		if (this._collapsedChanged) {
			var view = this;
			return new Promise(function(resolve, reject) {
				view.on("view:render:after", resolve);
			})
		} else {
			return Promise.resolve(this);
		}
	},

	_whenCollapseChangeEnds: function() {
		var d, p, pp;
		if (this._collapsedChanging || this._collapsedChanged) {
			d = {};
			p = new Promise(function(resolve, reject) {
				d.resolve = resolve;
				d.reject = reject;
			});
			pp = this._collapsePromises;
			pp.push(d);
		} else {
			p = Promise.resolve(this);
		}
		return p;
	},

	/* --------------------------- *
	/* Render
	/* --------------------------- */

	/** @override */
	renderFrame: function(tstamp, flags) {
		// if (DEBUG) {
		// 	var changed = [];
		// 	this._collapsedChanged && changed.push("collapsed");
		// 	this._selectionChanged && changed.push("selection");
		// 	this._filterChanged && changed.push("filter");
		// 	console.log("%s::renderFrame [%s]", this.cid, changed.join(" "));
		// }

		// collapsed transition flag
		if (this._collapsedChanging) {
			console.warn("%s::renderFrame collapsed tx interrupted", this.cid);
			// rejectAll(this._collapsePromises, this);
		}
		if (this.skipTransitions) {
			// resolveAll(this._collapsePromises, this.el);
			this.el.classList.add("skip-transitions");
			this.requestAnimationFrame(function() {
				// this.setImmediate(function() {
				// Invalidate again after frame render loop to reapply transforms:
				// that should kill any running transitions.
				// this.requestRender(View.LAYOUT_INVALID).renderNow();
				this.skipTransitions = false;
				this.el.classList.remove("skip-transitions");
			});
			this._collapsedChanging = false;
		} else {
			this._collapsedChanging = this._collapsedChanged;
		}
		this.el.classList.toggle("collapsed-changing", this._collapsedChanging);

		if (this._collapsedChanged) {
			this._collapsedChanged = false;
			this._filterChanged = true;
			flags |= (View.SIZE_INVALID);
			this.el.classList.toggle("collapsed", this._collapsed);
		}
		if (this._selectionChanged) {
			this._selectionChanged = false;
			flags |= View.LAYOUT_INVALID;
			this.renderSelection(this.collection.selected, this.collection.lastSelected);
		}
		if (this._filterChanged) {
			this._filterChanged = false;
			flags |= View.LAYOUT_INVALID;
			this._printStats();
			this.computeFilter();

			this.applyFilter();
			this._printStats();
		}
		if (flags & View.SIZE_INVALID) {
			this.measure(); // NOTE: measures children
		}
		if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
			this.renderLayout();
		}
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
		// view.listenTo(item, "change:excluded", function(item, newVal) {
		// 	// console.log(arguments);
		// 	if (this.el.classList.contains("excluded") !== newVal) {
		// 		console.warn("%s:[change:excluded] m:%o css: %o", this.cid, newVal, this.el.classList.contains("excluded"));
		// 	}
		// 	// this.el.classList.toggle("excluded", excluded);
		// });
		this.listenTo(view, "renderer:click", this._onRendererClick);
		this.itemViews.add(view);
		return view;
	},

	/** @private */
	_onRendererClick: function(item, ev) {
		if (this._collapsedChanging
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
	 * @param {Boolean}
	 */
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
		if (item !== this._selectedItem) {
			this._selectedItem = item;
			this._selectionChanged = true;
			this.requestRender(View.MODEL_INVALID);
		}
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

	_printStats: function() {
		console.log("%o::renderFrame %s filtered:%o:%o/%o (changed:%o, in:%o, out:%o)", this.cid,
			this.filteredItems.length > 0 ? "has" : "has not",
			this.filteredItems.length,
			((this.filteredItems.length + this._filteredIncoming.length) - this._filteredOutgoing.length),
			this.collection.length,
			(this._filteredIncoming.length + this._filteredOutgoing.length),
			this._filteredIncoming.length,
			this._filteredOutgoing.length);
	},

	/* --------------------------- *
	/* Filter
	/* --------------------------- */

	refreshFilter: function() {
		if (this._filterFn) {
			this._filterChanged = true;
			this.requestRender(View.MODEL_INVALID);
		}
	},

	/* --------------------------- *
	/* Filter impl 2
	/* --------------------------- */

	computeFilter: function() {
		var newItems, oldItems;
		var hasNew, hasOld;
		this._filteredIncoming.length = 0;
		this._filteredOutgoing.length = 0;

		newItems = this._filterFn ? this.collection.filter(this._filterFn, this) : this._getAllItems();
		oldItems = this._filteredItems;
		hasNew = !!(newItems && newItems.length);
		hasOld = !!(oldItems && oldItems.length);
		// NOTE: diff third arg is destination array
		if (hasNew) {
			// incoming exclusions
			diff((hasOld ? oldItems : this._getAllItems()), newItems, this._filteredIncoming);
			// this._filteredIncoming.forEach(function(item) {
			// 	item.set("excluded", true);
			// });
		}
		if (hasOld) {
			// outgoing exclusions
			diff((hasNew ? newItems : this._getAllItems()), oldItems, this._filteredOutgoing);
			// this._filteredOutgoing.forEach(function(item) {
			// 	item.set("excluded", false);
			// });
		}
		// console.log("%s::renderFilterFn", this.cid, newItems);
		this._filteredItems = newItems;
	},

	applyFilter: function() {
		// this.itemViews.forEach(function(view) {
		// 	view.el.classList.toggle("excluded", view.model.get("excluded"));
		// });
		this._filteredIncoming.forEach(function(item) {
			this.itemViews.findByModel(item).el.classList.add("excluded");
			item.set("excluded", true);
		}, this);
		this._filteredOutgoing.forEach(function(item) {
			this.itemViews.findByModel(item).el.classList.remove("excluded");
			item.set("excluded", false);
		}, this);

		this.el.classList.toggle("has-excluded", this.filteredItems.length > 0);
	},

	/* --------------------------- *
	/* Filter impl 1
	/* --------------------------- */

	computeFilter_1: function() {
		var items = this._filterFn ? this.collection.filter(this._filterFn, this) : this._getAllItems();
		this.renderFilters(items, this._filteredItems);
		this._filteredItems = items;
	},

	renderFilters: function(newItems, oldItems) {
		var hasNew = !!(newItems && newItems.length);
		var hasOld = !!(oldItems && oldItems.length);
		var inExcl = [];
		var outExcl = [];

		// console.log("%s::renderFilterFn", this.cid, newItems);
		// NOTE: diff third arg is destination array
		if (hasNew) {
			diff((hasOld ? oldItems : this._getAllItems()), newItems, inExcl)
			// .forEach(function(item) {
			// 	this.itemViews.findByModel(item).el.classList.add("excluded");
			// 	item.set("excluded", true);
			// }, this);
		}
		if (hasOld) {
			diff((hasNew ? newItems : this._getAllItems()), oldItems, outExcl)
			// .forEach(function(item) {
			// 	this.itemViews.findByModel(item).el.classList.remove("excluded");
			// 	item.set("excluded", false);
			// }, this);
		}
		this._filteredIncoming = inExcl;
		this._filteredOutgoing = outExcl;
		// this.el.classList.toggle("has-excluded", hasNew);
		// this.applyFilter();
	},

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