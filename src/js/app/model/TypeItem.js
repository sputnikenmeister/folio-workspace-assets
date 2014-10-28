/**
* @module app/model/TypeItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/TypeItem}
 */
module.exports = Backbone.Model.extend({

	/**
	 * @type {Object}
	 */
	defaults: {
		uid: "",
		name: "",
		handle: "",
		attrs: []
	},

	/** @override */
	toString: function() {
		return this.id;
	}

});
