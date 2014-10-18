/**
* jscs standard:Jquery
* @module app/view/render/ImageView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/ImageItem} */
var ImageItem = require( "../../model/ImageItem" );

/** @type {string} */
var viewTemplate = require( "../template/ImageView.tpl" );

/**
 * @constructor
 * @type {module:app/view/render/ImageView}
 */
module.exports = Backbone.View.extend({
	
	tagName: "li",
	
	className: "image-item",
	
	model: ImageItem,
	
	template: _.template(viewTemplate),
	
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
