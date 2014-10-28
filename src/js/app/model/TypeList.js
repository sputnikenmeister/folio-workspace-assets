/**
* @module app/model/TypeList
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/TypeItem} */
var TypeItem = require( "./TypeItem" );

/**
 * @constructor
 * @type {module:app/model/TypeList}
 */
module.exports = Backbone.Collection.extend({

	/**
	 * @type {Backbone.Model}
	 */
	model: TypeItem

});
