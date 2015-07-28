/**
 * @module app/view/render/CarouselDefaultRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/**
 * @constructor
 * @type {module:app/view/render/CarouselRenderer}
 */
module.exports = View.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel-item",
	/** @override */
	template: _.template("<div class=\"content sizing\"><%= name %></div>"),
	
	/** @override */
	initialize: function (options) {
		this.el.innerHTML = this.template(this.model.toJSON());
	},
	
	// /** @override */
	// render: function() {
	// 	this.el.innerHTML = this.template(this.model.attributes);
	// 	return this;
	// }
});
