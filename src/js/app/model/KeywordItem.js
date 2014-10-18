/**
* jscs standard:Jquery
* @module model/KeywordItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/KeywordItem}
 */
module.exports = Backbone.Model.extend({
	/**
	 * @type {Object}
	 */
	defaults: {
		name: "",
		handle: "",
		type: "",
		attributes: []
	},

	toString: function() {
		return this.attributes["name"];
	}

});
