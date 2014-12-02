/**
 * jscs standard:Jquery
 * @module app/view/render/GroupingRenderer
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

/**
 * @constructor
 * @type {module:app/view/render/GroupingRenderer}
 */
var GroupingRenderer = Backbone.View.extend({
	/** @override */
	tagName: "dt",
	/** @override */
	className: "list-group",

	// initialize: function(options) {
	// 	this.listenTo(this.model, "change:excluded", this.onExcludedChange);
	// },

	// onExcludedChange: function(model, value) {
	// 	if (value) {
	// 		this.$el.addClass("excluded");
	// 	} else {
	// 		this.$el.removeClass("excluded");
	// 	}
	// },
});

module.exports = GroupingRenderer;
