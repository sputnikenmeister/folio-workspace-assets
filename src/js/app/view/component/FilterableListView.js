/**
 * @module app/view/component/FilterableListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;

/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/DeferredView} */
var DeferredView = require("../base/DeferredView");

/**
 * @constructor
 * @type {module:app/view/component/SelectableListView}
 */
var FilterableListView = DeferredView.extend({

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
		DeferredView.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	/** @param {Object} ev */
	_onResize: function (ev) {
		this.renderLayout();
	},

	render: function() {
		this.renderNow();
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

		if (this.needsRender("collapsed")) {
			this.validateRender("collapsed");
			this.$el.addClass("entering");
		} else {
			this.$el.removeClass("entering");
		}

		this.validateRender("selection");
		this.validateRender("filterBy");
		this.renderLayout();
	},

	renderLayout: function() {
		var elt, posX, posY;
		var _transformProp = this.getPrefixedProperty("transform");
		elt = this.el.firstElementChild;
		posY = elt.clientTop;
		//posY = elt.offsetTop;
		posX = 0;
		do {
			elt.style.position = "absolute";
			elt.style[_transformProp] = "translate3d(" + posX + "px," + posY + "px, 0px)";
			if (!this._collapsed || elt.className.indexOf("excluded") === -1) {
				posY += elt.clientHeight;
				//posY += elt.offsetHeight;
			}
		} while (elt = elt.nextElementSibling);

		this.el.style.minHeight = (posY > 0)? posY + "px" : "";
	},

//	measure: function(force) {
//		if (_.isUndefined(this.childSizes) || force) {
//			this.childSizes = {};
//			this.children.each(this.measureChild, this);
//		}
//	},

//	measureElements: function() {
//		if (_.isUndefined(this.childSizes)) {
//			this.childSizes = {};
//			elt = this.el.firstElementChild;
//			do {
//				this.childSizes[elt] = elt.clientHeight;
//				elt.style.position = "absolute";
//			} while (elt = elt.nextElementSibling);
//		}
//	},

//	measureChild: function(child) {
//		var sizes = {}, elt = child.el;
//		sizes.height = elt.clientHeight;
//		sizes.left = elt.clientLeft;
//		this.childSizes[child.cid] = sizes;
//		return sizes;
//	},

	/* --------------------------- *
	 * Child views
	 * --------------------------- */

	/** @private */
	assignChildView: function (item, index) {
		var view = new this.renderer({
			model: item,
			el: this.$(".list-item[data-id=" + item.id + "]")
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
//			this.requestRender("collapsed");
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
