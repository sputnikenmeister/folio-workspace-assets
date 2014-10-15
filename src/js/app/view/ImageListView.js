/**
* jscs standard:Jquery
* @module view/ImageListView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/ImageList} */
var ImageItem = require( "../model/ImageItem" );

/** @type {module:app/model/ImageList} */
var ImageList = require( "../model/ImageList" );

/** @type {module:app/view/ImageView} */
var ImageView = require( "./ImageView" );

/**
 * @constructor
 * @type {module:app/view/ImageListView}
 */
module.exports = Backbone.View.extend({

	tagName: "ul",
	
	className: "image-list",
	
	collection: ImageList,
	
	model: ImageItem,
	
	initialize: function(options) {
		this.listenTo(Backbone, "app:list", this.whenAppList);
		this.listenTo(Backbone, "app:bundle", this.whenAppBundle);
		this.listenTo(this.collection, "collection:select", this.render);
	},
		
	whenAppList: function() {
		this.collection.reset();
		this.render();
	},
			
	whenAppBundle: function(bundle) {
		this.collection.reset(bundle.get("images"));
		this.collection.select(this.collection.first());
	},
	
	render: function()
	{
		this.$el.empty();
		if (this.collection.length) {
			var view = new ImageView({model: this.collection.selected});
			this.$el.append(view.render().el);
		}
		return this;
	},
});
