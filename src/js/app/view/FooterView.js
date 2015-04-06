/**
 * @module app/view/FooterView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("./base/View");

/**
 * @constructor
 * @type {module:app/view/FooterView}
 */
var FooterView = View.extend({

	/** @override */
	className: "footer mutable-faded",

	/** @override */
	initialize: function (options) {
	},
});

module.exports = FooterView;
