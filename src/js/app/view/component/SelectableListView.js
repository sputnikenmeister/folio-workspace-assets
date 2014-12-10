/**
 * @module app/view/component/GroupingListView
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
	/** @type {module:app/view/component/DefaultSelectableRenderer} */
	renderer: require("../render/DefaultSelectableRenderer"),
	/** @type {Backbone.ChildViewContainer} */
	children: null,

	initialize: function (options) {
		options.renderer && (this.renderer = options.renderer);
		this.listenTo(this.collection, "add remove reset", this.render);
//		this.listenTo(this.collection, "add remove reset", this.updateCollectionListeners);
//		this.onCollectionChange();
		this.children = new Backbone.ChildViewContainer();
	},

	render: function () {
		var eltBuffer, view;

		this.removeChildren();
		this.$el.empty();

		if (this.collection.length) {
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
