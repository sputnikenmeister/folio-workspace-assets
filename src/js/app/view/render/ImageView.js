/**
* @module app/app/view/render/ImageView
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require( "../../model/item/ImageItem" );

/** @type {string} */
var viewTemplate = require( "../template/ImageView.tpl" );
// var viewTemplate = require( "../template/ImageView.Placeholder.tpl" );

/** @type {string} */
var captionTemplate = require( "../template/ImageView.Caption.tpl" );

/** @type {Object} */
// var recipe = { prefix: "/workspace/uploads/", constraint: 700 };		// original file, resized by browser to 700
var recipe = { prefix: "/image/1/700/0/uploads/", constraint: 700 };	// resize to 700
// var recipe = { prefix: "/image/w480/uploads/", constraint: 480 };	// named recipe

/**
 * @constructor
 * @type {module:app/view/render/ImageView}
 */
module.exports = Backbone.View.extend({

	/** @type {string} */
	tagName: "div",

	/** @type {string} */
	className: "image-item",

	/** @type {module:app/model/ImageItem} */
	model: ImageItem,

	/**
	 * @param {Object}
	 * @return {string}
	 */
	template: _.template(viewTemplate),

	/** @override */
	events: {
		"dragstart img": function(ev) { ev.preventDefault(); } /* prevent conflict with hammer.js */
	},

	initialize: function(opts) {
		this.updateProperties();
		this.listenTo(this.model, "change", this.updateProperties);
	},

	/** Update property values */
	updateProperties: function() {
		this.getComputedWidth();
		this.getComputedHeight();
	},

	/**
	 * @return {this}
	 */
	render: function() {
		this.$el.html(this.template({
			url: recipe.prefix + this.model.get("f"),
			width: this.computedWidth,
			height: this.computedHeight,
			desc: this.model.get("desc")
		}));
		return this;
	},

	/** @type {Number} */
	computedWidth: NaN,
	/** @return {Number} */
	getComputedWidth: function() {
		return this.computedWidth = this.computedWidth || recipe.constraint;
	},

	/** @type {Number} */
	computedHeight: NaN,
	/** @return {Number} */
	getComputedHeight: function() {
		return this.computedHeight = this.computedHeight || Math.floor((recipe.constraint / this.model.get("w")) * this.model.get("h"));
	},
});
