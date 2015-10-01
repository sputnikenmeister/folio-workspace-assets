/**
 * @module app/view/component/SelectableListView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/component/DefaultSelectableRenderer} */
var DefaultSelectableRenderer = require("app/view/render/DefaultSelectableRenderer");
/** @type {module:app/view/component/ClickableRenderer} */
var ClickableRenderer = require("app/view/render/ClickableRenderer");

var SelectableListView = View.extend({
	
	/** @type {string} */
	cidPrefix: "selectable-list-",
	/** @override */
	tagName: "ul",
	/** @override */
	className: "list selectable",
	/** @type {module:app/view/component/DefaultSelectableRenderer} */
	renderer: DefaultSelectableRenderer,

	initialize: function (options) {
		this._enabled = true;
		this._childrenInvalid = true;
		
		options.renderer && (this.renderer = options.renderer);
		this.showEmpty = !!options.showEmpty;
		this.children = new Container();
		
		this.listenTo(this.collection, "add remove reset", this._onCollectionChange);
	},
	
	_onCollectionChange: function(ev) {
		this._childrenInvalid = true;
		this.render();
	},
	
	render: function () {
		if (this._childrenInvalid) {
			this._childrenInvalid = false;
			this.createChildren();
		}
		return this;
	},
	
	setEnabled: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			this.el.classList.toggle("disabled", !this._enabled);
		}
	},
	
	/* --------------------------- *
	 * Child views
	 * --------------------------- */
	
	createChildren: function() {
		var eltBuffer, view;
		
		this.removeChildren();
		this.el.innerHTML = "";
		
		if (this.collection.length) {
			eltBuffer = document.createDocumentFragment();
			if (this.showEmpty) {
				view = this.createEmptyView();
				eltBuffer.appendChild(view.render().el);
			}
			this.collection.each(function (model, index, arr) {
				view = this.createChildView(model, index);
				eltBuffer.appendChild(view.render().el);
			}, this);
			this.el.appendChild(eltBuffer);
		}
	},
	
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
		if (this.collection.selected !== item && this._enabled) {
			this.trigger("view:select:one", item);
		}
	},
	
	/* --------------------------- *
	 * Empty view
	 * --------------------------- */
	
	createEmptyView: function () {
		var view = new SelectableListView.EmptyRenderer({
			model: this.collection
		});
		this.children.add(view);
		this.listenTo(view, "renderer:click", function() {
			this._enabled && this.trigger("view:select:none");
		});
		return view;
	},
}, {
	EmptyRenderer: ClickableRenderer.extend({
		
		/** @override */
		tagName: "li",
		/** @override */
		className: "list-item empty-item",
		
		/** @override */
		initialize: function (options) {
			this.listenTo(this.model, "selected deselected", this.renderClassList);
			this.renderClassList();
		},
		
		/** @override */
		render: function() {
			this.el.innerHTML = "<a href=\"#clear\"><b> </b></a>";
			this.renderClassList();
			return this;
		},
		
		renderClassList: function () {
			this.el.classList.toggle("selected", this.model.selectedIndex === -1);
		},
	})
});

module.exports = SelectableListView;
