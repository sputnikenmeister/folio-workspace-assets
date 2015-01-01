/**
 * @module app/view/FooterView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/helper/View} */
var View = require("../helper/View");

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
