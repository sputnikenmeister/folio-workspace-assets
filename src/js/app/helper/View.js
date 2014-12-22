/**
 * @module app/helper/View
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/**
 * @constructor
 * @type {module:app/helper/View}
 */
var View = Backbone.View.extend({
	constructor: function(options) {
		if (options && options.className && this.className) {
			options.className += " " + _.result(this, 'className');
		}
		Backbone.View.apply(this, arguments);
	}
});

module.exports = View;
