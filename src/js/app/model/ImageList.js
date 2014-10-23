/**
* @module model/ImageList
* @requires module:backbone
*/

/** @type {module:app/model/SelectableList} */
var SelectableList = require( "./SelectableList" );

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
