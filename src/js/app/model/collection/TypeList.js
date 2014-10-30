/**
* @module app/model/collection/TypeList
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/item/TypeItem} */
var TypeItem = require( "../item/TypeItem" );

/**
 * @constructor
 * @type {module:app/model/collection/TypeList}
 */
var TypeList = Backbone.Collection.extend({

	/**
	 * @type {Backbone.Model}
	 */
	model: TypeItem

});

module.exports = new TypeList();
