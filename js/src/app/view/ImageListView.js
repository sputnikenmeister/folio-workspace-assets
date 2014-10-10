/**
* jscs standard:Jquery
* @module view/ImageListView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/ImageList} */
var ImageList = require( "../model/ImageList" );

/** @type {module:app/view/ImageView} */
var ImageView = require( "./ImageView" );

/**
 * @constructor
 * @type {module:app/view/ImageListView
 */
module.exports = Backbone.View.extend({

	tagName: "ul",
	
	className: "bd-images",
	
	images: new ImageList,
	
	initialize: function(options) {
		this.collection.on("collection:select", this.whenBundleSelect, this);
		this.collection.on("error", this.whenFetchError, this);
	},
	
	whenBundleSelect: function(newItem, oldItem) {
		if (newItem && !newItem.has("images")) {
			newItem.once("change:images", this.whenFetchSuccess, this);
			newItem.fetch();
		} else {
			this.render();
		}
	},
	
	whenFetchSuccess: function() {
		this.render();
	},
	
	whenFetchError: function(model, resp, opts) {
		// TODO: something more useful here
		console.log("bundle fetch error");
	},
	
	render: function() {
		var item, view;
		
		item = this.collection.selected;
		if (item) {
			this.images.reset(item.get("images"));
			this.$el.empty();
			
			if (this.images.length) {
				view = new ImageView({model : this.images.first()});
				this.$el.append(view.render().el);
			}
		} else {
			this.$el.empty();
			this.images.reset();
		}
		return this;
	},
});
