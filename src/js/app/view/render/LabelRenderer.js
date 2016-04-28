/**
 * @module app/view/render/LabelRenderer
 */

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

/**
 * @constructor
 * @type {module:app/view/render/LabelRenderer}
 */
var LabelRenderer = View.extend({

	/** @type {string} */
	cidPrefix: "labelRenderer",

	properties: {
		label: {
			get: function() {
				return this._label || (this._label = this.el.querySelector(".label"));
			}
		}
		// measuredWidth: {
		// 	get: function() {
		// 		return this._measuredWidth;
		// 	}
		// },
		// measuredHeight: {
		// 	get: function() {
		// 		return this._measuredHeight;
		// 	}
		// },
	},

	/* -------------------------------
	/* measure
	/* ------------------------------- */

	// _measuredWidth: null,
	// _measuredHeight: null,
	// measure: function() {},
});

module.exports = LabelRenderer;
