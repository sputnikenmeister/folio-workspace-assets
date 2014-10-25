/**
* @module model/ImageList
* @requires module:backbone
*/

/** @type {module:app/helper/SelectableList} */
var SelectableList = require( "../helper/SelectableList" );

/** @type {module:app/model/ImageItem} */
var ImageItem = require( "./ImageItem" );

/**
 * @constructor
 * @type {module:app/model/ImageList}
 */
module.exports = SelectableList.extend({

	/**
	 * @type {Backbone.Model}
	 */
	model: ImageItem

});
