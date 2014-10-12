/**
* jscs standard:Jquery
* @module view/ImageView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/ImageItem} */
var ImageItem = require( "../model/ImageItem" );

/** @type {string} */
var viewTemplate = require( "./ImageView.tpl" );

/**
 * @constructor
 * @type {module:app/view/ImageView}
 */
module.exports = Backbone.View.extend({
	
	model: ImageItem,
	
	className: "bd-images-item",
	
	template: _.template(viewTemplate),
	
	_recipe: { prefix: "/image/1/700/0", constraint: 700, }, // resize to 700
//	_recipe: { prefix: "/w480", constraint: 480, }, // named recipe 
	
	initialize: function(options) {
//		this.template = _.template(viewTemplate);
	},
	
	render: function() {
		var values = {
			url: this._recipe.prefix + this.model.get("url"),
			description: this.model.get("description"),
			width: this._recipe.constraint,
			height: Math.floor((this._recipe.constraint / this.model.get("width")) * this.model.get("height")),
		};
		this.$el.html(this.template(values));
		return this;
	},
});
