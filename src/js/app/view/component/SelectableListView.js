/**
 * @module app/view/component/GroupingListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/view/component/DefaultSelectableRenderer} */
var DefaultSelectableRenderer = require("../render/DefaultSelectableRenderer");
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("../render/ClickableRenderer");

var SelectableCollectionView = View.extend({
	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable",
	/** @type {module:app/view/component/DefaultSelectableRenderer} */
	renderer: DefaultSelectableRenderer,

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
		this.el.innerHTML = "";
		
		if (this.collection.length) {
			eltBuffer = document.createDocumentFragment();
			view = this.createNullView();
			eltBuffer.appendChild(view.render().el);
			
			this.collection.each(function (model, index, arr) {
				view = this.createChildView(model, index);
				eltBuffer.appendChild(view.render().el);
			}, this);
			this.el.appendChild(eltBuffer);
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
	
	createNullView: function () {
		var view = new SelectableCollectionView.NullRenderer({
			model: this.collection
		});
		this.children.add(view);
		this.listenTo(view, "renderer:click", function() {
			this.trigger("view:select:none");
		});
		return view;
	},
}, {
	NullRenderer: ClickableRenderer.extend({
		
		/** @override */
		tagName: "li",
		/** @override */
		className: "list-item null-item",
		
		/** @override */
		initialize: function (options) {
			this.listenTo(this.collection, "deselect:none select:none", function() {
				this.el.classList.toggle("selected", !this.model.selected);
			});
			this.el.classList.toggle("selected", !this.model.selected);
		},
		
		/** @override */
		render: function() {
			this.el.innerHTML = "<a href=\"#clear\"><b> </b></a>";
			return this;
		},
	})
});

module.exports = SelectableCollectionView;
