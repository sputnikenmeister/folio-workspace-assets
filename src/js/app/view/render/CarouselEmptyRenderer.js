/**
 * @module app/view/render/CarouselEmptyRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/**
 * @constructor
 * @type {module:app/view/render/CarouselEmptyRenderer}
 */
module.exports = View.extend({
	
	/** @override */
	//	model: Backbone.Model,
	/** @override */
	className: "carousel-item empty-item",
	/** @override */
	template: _.template("<div class=\"content sizing\"><%= name %></div>"),
	
	/** @override */
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});
