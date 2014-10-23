/**
* @module model/ImageItem
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
		// url: null, w: NaN, h: NaN, desc: null, attrs: []
		url: "", w: 0, h: 0, desc: "", attrs: []
	},

	/** @override */
	toString: function() {
		return this.attributes["url"];
	}

});
