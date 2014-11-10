/**
 * @module app/model/collection/ImageList
 * @requires module:backbone
 */

// /** @type {module:app/helper/SelectableList} */
// var SelectableList = require( "../../helper/SelectableList" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require( "../item/ImageItem" );

/**
 * @constructor
 * @type {module:app/model/collection/ImageList}
 */
var ImageList = Backbone.Collection.extend({

	/**
	 * @type {Backbone.Model}
	 */
	model: ImageItem

});

module.exports = new ImageList();
