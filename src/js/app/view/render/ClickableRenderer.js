/**
 * @module app/view/render/ClickableRenderer
 */

/** @type {module:app/view/render/LabelRenderer} */
var LabelRenderer = require("app/view/render/LabelRenderer");

/**
 * @constructor
 * @type {module:app/view/render/ClickableRenderer}
 */
var ClickableRenderer = LabelRenderer.extend({

	/** @type {string} */
	cidPrefix: "clickableRenderer",

	/** @override */
	events: {
		"click": function(ev) {
			this.trigger("renderer:click", this.model);
		},
		"click a": function(ev) {
			ev.defaultPrevented || ev.preventDefault();
		}
	},
});

module.exports = ClickableRenderer;
