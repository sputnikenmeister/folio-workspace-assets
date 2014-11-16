/**
 * @module app/app/view/render/FilterableRenderer
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/view/render/FilterableRenderer}
 */
var FilterableRenderer = Backbone.View.extend({

	events: {
		"click": "onClick",
	},

	onClick: function (event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
			this.trigger("item:click", this.model);
		}
	},

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

module.exports = FilterableRenderer;
