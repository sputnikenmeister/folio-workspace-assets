/**
 * @module app/view/render/ClickableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/**
 * @constructor
 * @type {module:app/view/render/ClickableRenderer}
 */
var ClickableRenderer = Backbone.View.extend({
	/** @override */
	events: {
		"click": function (ev) {
			this.trigger("renderer:click", this.model);
		},
		"click a": function (ev) {
			ev.defaultPrevented || ev.preventDefault();
		}
	},
});

module.exports = ClickableRenderer;
