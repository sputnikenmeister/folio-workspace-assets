/**
 * @module app/view/component/FilterableListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/view/base/DeferredView} */
var DeferredView = require("../base/DeferredView");
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("../render/ClickableRenderer");

/**
 * @constructor
 * @type {module:app/view/component/SelectableCollectionView}
 */
var FilterableListView = DeferredView.extend({

	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable filterable skip-transitions",

	/** @override */
	initialize: function (options) {
		this.children = new Container();
		this.renderer = options.renderer || FilterableListView.defaultRenderer;
		options.filterFn && (this._filterFn = options.filterFn);
		
		this.filterKey = options.filterKey;
		this.filterBy(options.filterBy);
		this.setSelection(this.collection.selected);
		this.setCollapsed((_.isBoolean(options.collapsed)? options.collapsed : false));

		this.skipTransitions = true;
		this.el.classList.add("skip-transitions");
		this.collection.each(this.assignChildView, this);

		this.listenTo(this.collection, "select:one select:none", this.setSelection);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function() {
		this.renderNow();
		return this;
	},

	/** @override */
	renderLater: function () {
		if (this.skipTransitions) {
			this.el.classList.add("skip-transitions");
			this.requestAnimationFrame(function() {
				this.skipTransitions = false;
				this.el.classList.remove("skip-transitions");
			});
		}
		this.el.classList.toggle("collapsed-changed", this.needsRender("collapsed"));
		this.validateRender("collapsed");
		this.validateRender("selection");
		this.validateRender("filterBy");
		
		this.renderLayout();
	},

	renderLayout: function() {
		var _transformProp = this.getPrefixedProperty("transform");
		var el = this.el.firstElementChild, isExcluded;
		var style = window.getComputedStyle(this.el);
		var posX = parseFloat(style.paddingLeft);
		var posY = parseFloat(style.paddingTop);
		// var posX = el.offsetLeft;
		// var posY = el.offsetTop;
		var els = [], tx = [], idx = 0;
		do {
			isExcluded = el.className.indexOf("excluded") != -1;
			if ((!this._collapsed || !isExcluded) && el.offsetHeight == 0) {
				posY -= el.offsetTop;
			}
			// el.style.position = "absolute";
			// el.style[_transformProp] = "translate3d(" + posX + "px," + posY + "px, 0px)";
			els[idx] = el;
			tx[idx] = "translate3d(" + posX + "px," + posY + "px, 0px)";
			idx++;

			if (!this._collapsed || !isExcluded) {
				posY += el.offsetHeight + el.offsetTop;
			}
		} while (el = el.nextElementSibling);
		
		for (var i = 0; i < idx; i++) {
			els[i].style[_transformProp] = tx[i];
		}

		posY += parseFloat(style.paddingBottom);
		this.el.style.height = (posY > 0)? posY + "px" : "";
	},

	/* --------------------------- *
	 * Child views
	 * --------------------------- */

	/** @private */
	assignChildView: function (item, index) {
		var view = new this.renderer({
			model: item,
			el: this.el.querySelector(".list-item[data-id=\"" + item.id + "\"]")
		});
		this.children.add(view);//, item.id);
		this.listenTo(view, "renderer:click", this.onChildClick);
		// this._rendererInstance || (this._rendererInstance = view);
		return view;
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
	// setCollapsed: function (collapsed, force) {
	// 	force && console.warn("FilterableListView.setCollapsed", "force=true");
	// 	if (force || collapsed !== this._collapsed) {
	setCollapsed: function (collapsed) {
		if (collapsed !== this._collapsed) {
			this._collapsed = collapsed;
			this.requestRender("collapsed", this.renderCollapsed.bind(this, collapsed));
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
	 * Selection
	 * --------------------------- */

	/** @private */
	_selectedItem: undefined,

	/** @param {Backbone.Model|null} */
	// setSelection: function (item, force) {
	// 	if (force || item !== this._selectedItem) {
	setSelection: function (item) {
		if (item !== this._selectedItem) {
			var oldVal = this._selectedItem;
			this.requestRender("selection", this.renderSelection.bind(this, item, oldVal));
		}
	},

	/** @private */
	renderSelection: function (newItem, oldItem) {
		// var els = this.el.querySelectorAll(".selected");
		// for (var i = 0, ii = els.length; i < ii; i++) {
		// 	els.item(i).classList.remove("selected");
		// }
		if (oldItem) {
			// this.children.findByModel(oldItem).$el.removeClass("selected");
			this.children.findByModel(oldItem).el.classList.remove("selected");
		}
		if (newItem) {
			// this.children.findByModel(newItem).$el.addClass("selected");
			this.children.findByModel(newItem).el.classList.add("selected");
		}
		this._selectedItem = newItem;
	},

	/* --------------------------- *
	 * Filter
	 * --------------------------- */

	_filter: undefined,
	
	// filterBy: function (filter, force) {
	// 	if (force || filter !== this._filter) {
	filterBy: function (filter) {
		if (filter !== this._filter) {
			var oldVal = this._filter;
			this.requestRender("filterBy", this.renderFilterBy.bind(this, filter, oldVal));
		}
	},
	
	// clearFilter: function(force) {
	// 	this.filterBy(null, force);
	clearFilter: function() {
		this.filterBy(null);
	},

	/** @private */
	renderFilterBy: function (newVal, oldVal) {
		this.el.classList.toggle("has-excluded", !!newVal);
		// if (this._filterFn) {
		// 	this.collection.each(function(model) {
		// 		this.children.findByModel(model).$el.toggleClass("excluded", !this._filterFn(model, newVal, oldVal));
		// 		// this.children.findByModel(model).el.classList.toggle("excluded", !this._filterFn(model, newVal, oldVal));
		// 	}, this);
		// } else {
			this.renderFiltersById(
				newVal && newVal.get(this.filterKey),
				oldVal && oldVal.get(this.filterKey)
			);
		// }
		this._filter = newVal;
	},

	renderFiltersById: function (newIds, oldIds) {
		var newIncludes, newExcludes;
		this.itemIds || (this.itemIds = this.collection.pluck("id"));
		if (newIds) {
			newExcludes = _.difference(oldIds || this.itemIds, newIds);
			_.each(newExcludes, function (id) {
				// this.children.findByCustom(id).$el.addClass("excluded");
				// this.children.findByModel(this.collection.get(id)).$el.addClass("excluded");
				this.children.findByModel(this.collection.get(id)).el.classList.add("excluded");
			}, this);
		}
		if (oldIds) {
			newIncludes = _.difference(newIds || this.itemIds, oldIds);
			_.each(newIncludes, function (id) {
				// this.children.findByCustom(id).$el.removeClass("excluded");
				// this.children.findByModel(this.collection.get(id)).$el.removeClass("excluded");
				this.children.findByModel(this.collection.get(id)).el.classList.remove("excluded");
			}, this);
		}
	},
}, {
	defaultRenderer: ClickableRenderer,
});

module.exports = FilterableListView;
