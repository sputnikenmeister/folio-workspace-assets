/**
* jscs standard:Jquery
* @module view/BundleDetailView
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

/**
 * @constructor
 * @type {module:app/view/BundleDetailView}
 */
module.exports = Backbone.View.extend({

	tagName: "div",
	
	className: "bundle-detail",
	
	template: _.template(viewTemplate),

	initialize: function(options)
	{
//		this.listenTo(this.collection, "collection:select", this.whenBundleSelect);
		this.listenTo(Backbone, "app:bundle", this.whenAppBundle);
		this.listenTo(Backbone, "app:list", this.whenAppList);
	},
	
	whenAppBundle: function(newItem)
	{
		this.model = newItem;
		this.render();
	},
	
	whenAppList: function()
	{
		this.model = null;
		this.render();
	},
	
	render: function() {
		var item = this.model;
		if (item)
		{
			this.$el.html(this.template(item.attributes));
		}
		else
		{
			this.$el.empty();
		}
		return this;
	},
});