/**
* jscs standard:Jquery
* @module model/BundleItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/BundleItem
 */
module.exports = Backbone.Model.extend({
	/**
	 * @type {Object}
	 */
   	defaults: {
   		name: "",
   		handle: "",
   		description: "",
   		completed: 0,
   		attributes: []
   		// images
   	},
   	
   	url: function() {
   		return Backbone.Model.prototype.url.apply(this, arguments) + "/";
   	},
   	
   	toString: function() {
   		return this.attributes["name"];
   	}

});
