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


/**
 * @constructor
 * @type {module:app/view/component/SelectableListView}
 */
var FilterableListView = DeferredRenderView.extend({

	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable filterable skip-transitions",

	/** @override */
	initialize: function (options) {
		this.children = new Container();
		this.renderer = options.renderer || FilterableListView.FilterableRenderer;

		this.itemIds = this.collection.pluck("id");
		this.filterKey = options.filterKey;
		this.filterBy(options.filterBy);
		this.setSelection(this.collection.selected);
		this.setCollapsed((_.isBoolean(options.collapsed)? options.collapsed : false));

		this.skipTransitions = false;
		this.$el.addClass("skip-transitions");
		this.collection.each(this.assignChildView, this);
//		this._renderLayout();

		_.bindAll(this, "_onResize");
		Backbone.$(window).on("orientationchange resize", this._onResize);

		this.listenTo(this.collection, {
			"select:one": this.setSelection,
			"select:none": this.setSelection
		});

//		this.listenTo(this.collection, {
//			"reset": this._onCollectionReset,
//			"select:one": this._onSelectOne,
//			"select:none": this._onSelectNone,
//			"deselect:one": this._onDeselectOne,
//		});
		// this.listenTo(this.collection, "change:excluded", this.whenExcludedChange);
	},

	remove: function () {
		Backbone.$(window).off("orientationchange resize", this._onResize);
		DeferredRenderView.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	/** @param {Object} ev */
	_onResize: function (ev) {
		this._renderLayout();
	},

	render: function() {
		return this;
	},

	/** @override */
	renderLater: function () {
		if (this.skipTransitions) {
			this.$el.addClass("skip-transitions");
		}
		_.defer(_.bind(function() {
			this.skipTransitions = false;
			this.$el.removeClass("skip-transitions");
		}, this));

		this.validateRender("collapsed");
		this.validateRender("selection");
		this.validateRender("filterBy");
		this._renderLayout();
	},

	_renderLayout: function() {
		var tx, elt = this.el.firstElementChild, pos = elt.offsetTop;
//		var tx, elt = this.el.firstElementChild, pos = elt.clientTop;
		do {
//			tx = "translate3d(" + elt.clientLeft + "px," + pos + "px, 0)";
			tx = "translate3d(0," + pos + "px, 0)";
			elt.style.position = "absolute";
			elt.style.webkitTransform = tx;
			elt.style.mozTransform = tx;
			elt.style.transform = tx;
			if (elt.className.indexOf("excluded") === -1) {
				pos += elt.offsetHeight;
//				pos += elt.clientHeight;
			}
		} while (elt = elt.nextElementSibling);
		this.el.style.minHeight = pos + "px";
	},

	/* --------------------------- *
	 * Child views
	 * --------------------------- */

	/** @private */
	assignChildView: function (item, index) {
		var view = new this.renderer({
			model: item,
			el: item.selector()
		});
		this.children.add(view);//, item.id);
		this.listenTo(view, "renderer:click", this.onChildClick);
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
	setCollapsed: function (collapsed, force) {
		if (force || collapsed !== this._collapsed) {
			this._collapsed = collapsed;
			this.requestRender("collapsed", _.bind(this.renderCollapsed, this, collapsed));
		}
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
	setSelection: function (item, force) {
		if (force || item !== this._selectedItem) {
			var oldVal = this._selectedItem;
			this._selectedItem = item;
			this.requestRender("selection", _.bind(this.renderSelection, this, item, oldVal));
		}
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

	filterBy: function (filter, force) {
		if (force || filter !== this._filter) {
			var oldVal = this._filter;
			this._filter = filter;
			this.requestRender("filterBy", _.bind(this.renderFilterBy, this, filter, oldVal));
		}
	},

	/** @private */
	renderFilterBy: function (newVal, oldVal) {
//		var newIds, oldIds;
//		if (newVal) {
//			newIds = newVal.get(this.filterKey);
//		}
//		if (oldVal) {
//			oldIds = oldVal.get(this.filterKey);
//		}
//		this.renderFiltersById(newIds, oldIds);
		this.renderFiltersById(
			newVal && newVal.get(this.filterKey),
			oldVal && oldVal.get(this.filterKey)
		);
	},

	renderFiltersById: function (newIds, oldIds) {
		var newIncludes, newExcludes;
		if (newIds) {
			newExcludes = _.difference(oldIds || this.itemIds, newIds);
			_.each(newExcludes, function (id) {
//				this.children.findByCustom(id).$el.addClass("excluded");
				this.children.findByModel(this.collection.get(id)).$el.addClass("excluded");
			}, this);
		}
		if (oldIds) {
			newIncludes = _.difference(newIds || this.itemIds, oldIds);
			_.each(newIncludes, function (id) {
//				this.children.findByCustom(id).$el.removeClass("excluded");
				this.children.findByModel(this.collection.get(id)).$el.removeClass("excluded");
			}, this);
		}
	},

}, {
	/**
	 * @constructor
	 * @type {module:app/view/component/ItemView}
	 */
	FilterableRenderer: Backbone.View.extend({
		/** @type {Object} */
		events: {
			"click": function (ev) {
				ev.isDefaultPrevented() || ev.preventDefault();
				this.trigger("renderer:click", this.model);
			}
		},
	})
});

module.exports = FilterableListView;
