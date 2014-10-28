/**
* @module app/model/ImageItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/ImageItem}
 */
module.exports = Backbone.Model.extend({

	/**
	 * @type {Object}
	 */
	defaults: {
		uid: "",
		file: "",
		w: 0,
		h: 0,
		desc: "",
		attrs: []
	},

	/** @override */
	toString: function() {
		return this.id;
	}

});
