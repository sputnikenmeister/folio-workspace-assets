/**
 * @module app/view/component/GroupingListView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
require("backbone.babysitter");

var SelectableListView = Backbone.View.extend({
	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable",

	initialize: function (options) {
		this.listenTo(this.collection, "add remove reset", this.onCollectionChange);
		this.onCollectionChange();
	},

	onCollectionChange: function () {
		// if (this.collection.length > 1) {
		// 	this.addCollectionListeners();
		// } else {
		// 	this.removeCollectionListeners();
		// }
		this.render();
	},

	// addCollectionListeners: function () {
	// 	this.listenTo(this.collection, "select:one", this.onSelectOne);
	// 	this.listenTo(this.collection, "deselect:one", this.onDeselectOne);
	// },

	// removeCollectionListeners: function () {
	// 	this.stopListening(this.collection, "select:one", this.onSelectOne);
	// 	this.stopListening(this.collection, "deselect:one", this.onDeselectOne);
	// },

	render: function () {
		var eltBuffer, view;

		this.removeChildren();
		this.$el.empty();

		if (this.collection.length > 1) {
			eltBuffer = document.createDocumentFragment();
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

	/** @type {Backbone.ChildViewContainer} */
	children: new Backbone.ChildViewContainer(),

	createChildView: function (model, index) {
		var view = new SelectableRenderer({
			model: model
		});
		this.children.add(view);
		this.listenTo(view, "item:click", this.onChildViewClick);
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
	 * Selection
	 * --------------------------- */

	/** @private */
	onChildViewClick: function (item) {
		if (this.collection.selected !== item) {
			this.trigger("view:select:one", item);
		}
	},

	// /** @private */
	// onSelectOne: function (model) {
	// 	var view = this.children.findByModel(model);
	// 	if (view)
	// 		view.$el.addClass("selected");
	// },

	// onDeselectOne: function (model) {
	// 	var view = this.children.findByModel(model);
	// 	if (view)
	// 		view.$el.removeClass("selected");
	// },
});

/**
 * @constructor
 * @type {module:app/view/render/SelectableRenderer}
 */
var SelectableRenderer = Backbone.View.extend({

	/** @override */
	tagName: "li",
	/** @override */
	className: "list-item",
	/** @override */
	events: {
		"click": "onClick",
	},
	/** @override */
	template: _.template("<span class=\"label\"><%= label %></span><a href=\"#<%= href %>\"><b></b></a>"),

	initialize: function (options) {
		this.listenTo(this.model, "selected", function () {
			this.$el.addClass("selected");
		});
		this.listenTo(this.model, "deselected", function () {
			this.$el.removeClass("selected");
		});
	},

	/** @override */
	render: function () {
		if (this.model.selected) {
			this.$el.addClass("selected");
		}
		this.$el.html(this.template({
			href: this.model.cid,
			label: this.model.toString()
		}));
		return this;
	},

	onClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		this.trigger("item:click", this.model);
	},
});

module.exports = SelectableListView;
