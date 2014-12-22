/**
 * @module app/view/component/GroupingListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/helper/View} */
var View = require("../../helper/View");

var NullRenderer = View.extend({
	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item null-item",
	/** @override */
	events: {
		"click": "onClick",
	},
	render: function() {
		this.$el.html("<a href=\"#clear\"><b> </b></a>");
		return this;
	},

	onClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		this.trigger("renderer:click");
	},
});

var SelectableListView = View.extend({
	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable",
	/** @type {module:app/view/component/DefaultSelectableRenderer} */
	renderer: require("../render/DefaultSelectableRenderer"),

	initialize: function (options) {
		options.renderer && (this.renderer = options.renderer);
		this.listenTo(this.collection, "add remove reset", this.render);
//		this.listenTo(this.collection, "add remove reset", this.updateCollectionListeners);
//		this.onCollectionChange();
		this.children = new Container();
	},

	render: function () {
		var eltBuffer, view;

		this.removeChildren();
		this.$el.empty();

		if (this.collection.length) {
			eltBuffer = document.createDocumentFragment();
			view = this.createNullView();
			eltBuffer.appendChild(view.render().el);

			this.collection.each(function (model, index, arr) {
				view = this.createChildView(model, index);
				eltBuffer.appendChild(view.render().el);
			}, this);
			this.$el.append(eltBuffer);
		}
		return this;
	},

	/* --------------------------- *
	 * Child views
	 * --------------------------- */

	createChildView: function (model, index) {
		var view = new (this.renderer)({
			model: model
		});
		this.children.add(view);
		this.listenTo(view, "renderer:click", this.onChildViewClick);
		return view;
	},

	removeChildren: function () {
		this.children.each(this.removeChildView, this);
	},

	removeChildView: function (view) {
		this.stopListening(view);
		this.children.remove(view);
		view.remove();
		return view;
	},

	/* --------------------------- *
	 * Child event handlers
	 * --------------------------- */

	/** @private */
	onChildViewClick: function (item) {
		if (this.collection.selected !== item) {
			this.trigger("view:select:one", item);
		}
	},

	/* --------------------------- *
	 * Null child view
	 * --------------------------- */

	createNullView: function (model, index) {
		var view = new NullRenderer({
		});
		this.children.add(view);
		this.listenTo(view, "renderer:click", function() {
			this.trigger("view:select:none");
		});
		return view;
	},

//	/* --------------------------- *
//	 * Collection event handlers
//	 * --------------------------- */
//
//	updateCollectionListeners: function () {
//		if (this.collection.length > 1) {
//			this.addCollectionListeners();
//		} else {
//			this.removeCollectionListeners();
//		}
//	},
//
//	addCollectionListeners: function () {
//		this.listenTo(this.collection, "select:one", this.onSelectOne);
//		this.listenTo(this.collection, "deselect:one", this.onDeselectOne);
//	},
//
//	removeCollectionListeners: function () {
//		this.stopListening(this.collection, "select:one", this.onSelectOne);
//		this.stopListening(this.collection, "deselect:one", this.onDeselectOne);
//	},
//
//	/** @private */
//	onSelectOne: function (model) {
//		var view = this.children.findByModel(model);
//		if (view)
//			view.$el.addClass("selected");
//	},
//
//	onDeselectOne: function (model) {
//		var view = this.children.findByModel(model);
//		if (view)
//			view.$el.removeClass("selected");
//	},
});

module.exports = SelectableListView;
