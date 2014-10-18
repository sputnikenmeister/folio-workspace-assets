/**
* jscs standard:Jquery
* @module model/ImageList
* @requires module:backbone
*/

/** @type {module:app/model/ItemList} */
var ItemList = require( "./ItemList" );

/** @type {module:app/model/ImageItem} */
var ImageItem = require( "./ImageItem" );

/**
 * @constructor
 * @type {module:app/model/ImageList}
 */
module.exports = ItemList.extend({

	model: ImageItem

});
