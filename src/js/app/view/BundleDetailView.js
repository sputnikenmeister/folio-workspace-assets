/**
* @module app/view/BundleDetailView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/BundleItem} */
//var BundleItem = require( "../model/BundleItem" );

/** @type {string} */
var viewTemplate = require( "./template/BundleDetailView.tpl" );
// viewTemplate = _.template(viewTemplate);

/**
 * @constructor
 * @type {module:app/view/BundleDetailView}
 */
module.exports = Backbone.View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "bundle-detail",
	/** @override */
	template: viewTemplate,

	initialize: function(options) {
		this.listenTo(Backbone, "app:bundleItem", this.whenAppBundleItem);
		this.listenTo(Backbone, "app:bundleList", this.whenAppBundleList);
	},

	whenAppBundleItem: function(bundle) {
		this.listenTo(this.collection, "select:one select:none", this.render);
		this.listenTo(this.collection, "select:one", this.addModelListeners);
		this.listenTo(this.collection, "deselect:one", this.removeModelListeners);
		if (this.collection.selected){
			this.addModelListeners(this.collection.selected);
		}
		this.render();
	},

	whenAppBundleList: function() {
		this.stopListening(this.collection);
		if (this.collection.selected){
			this.removeModelListeners(this.collection.selected);
		}
		this.render();
	},

	addModelListeners: function(model) {
		this.listenTo(model, "change:desc", this.render);
	},

	removeModelListeners: function(model) {
		this.stopListening(model);
	},

	render: function() {
		var item = this.collection.selected;
		if (item) {
			this.$el.html(this.template(item.attributes));
		} else {
			this.$el.empty();
		}
		return this;
	},
});
