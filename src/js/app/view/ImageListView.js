/**
* jscs standard:Jquery
* @module view/ImageListView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/ImageList} */
var ImageItem = require( "../model/ImageItem" );

/** @type {module:app/model/ImageList} */
var ImageList = require( "../model/ImageList" );

/** @type {string} */
var imageViewTemplate = require( "./template/ImageView.tpl" );

/**
 * @constructor
 * @type {ImageView}
 */
var ImageView = Backbone.View.extend({

	tagName: "li",

	className: "image-item",

	model: ImageItem,

	template: _.template(imageViewTemplate),

	_recipe: { prefix: "/image/1/700/0", constraint: 700, }, // resize to 700
//	_recipe: { prefix: "/w480", constraint: 480, }, // named recipe

	render: function() {
		var values = {
			url: this._recipe.prefix + this.model.get("url"),
			desc: this.model.get("desc"),
			width: this._recipe.constraint,
			height: Math.floor((this._recipe.constraint / this.model.get("w")) * this.model.get("h")),
		};
		this.$el.html(this.template(values));
		return this;
	},
});

/**
 * @constructor
 * @type {module:app/view/ImageListView}
 */
var ImageListView = Backbone.View.extend({

	tagName: "ul",

	className: "image-list",

	collection: ImageList,

	model: ImageItem,

	initialize: function(options) {
		this.listenTo(Backbone, "app:default", this.whenAppList);
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
module.exports = ImageListView;
