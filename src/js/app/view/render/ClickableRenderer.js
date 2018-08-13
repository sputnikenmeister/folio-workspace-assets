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
		"click .label": function(ev) {
			if (ev.defaultPrevented) return;

			ev.preventDefault();
			this.trigger("renderer:click", this.model, ev);
		},
		"click a": function(ev) {
			ev.defaultPrevented || ev.preventDefault();
		}
	},
});

module.exports = ClickableRenderer;