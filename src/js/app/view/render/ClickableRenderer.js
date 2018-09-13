/**
 * @module app/view/render/ClickableRenderer
 */
// /** @type {module:underscore} */
// var _ = require("underscore");
/** @type {module:app/view/render/LabelRenderer} */
var LabelRenderer = require("app/view/render/LabelRenderer");

/**
 * @constructor
 * @type {module:app/view/render/ClickableRenderer}
 */
var ClickableRenderer = LabelRenderer.extend({

	/** @type {string} */
	cidPrefix: "clickableRenderer",

	// defaults: {
	// 	target: ".label"
	// },

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

	// initialize: function(options) {
	// 	options || (options = {});
	// 	// if (options) {
	// 	options = _.defaults({}, options, _.result(this, 'defaults'));
	// 	// } else {
	// 	// 	 _.defaults({}, _.result(this, 'defaults'));
	// 	// }
	// 	this.events["click " + options.target] = this.clickHandler;
	// },
	//
	// clickHandler: function(ev) {
	// 	if (ev.defaultPrevented) return;
	//
	// 	ev.preventDefault();
	// 	this.trigger("renderer:click", this.model, ev);
	// }
});

module.exports = ClickableRenderer;
