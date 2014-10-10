/**
* jscs standard:Jquery
* @module model/ImageItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/ImageItem
 */
module.exports = Backbone.Model.extend({
	/**
	 * @type {Object}
	 */
   	defaults: {
   		url: null,
   		width: NaN,
   		height: NaN,
   		description: null,
   		attributes: []
   	},
   	
   	toString: function() {
   		return this.attributes["description"];
   	}

});
