/**
 * @module app/model/collection/ImageList
 */

/** @type {module:app/helper/SelectableList} */
var SelectableList = require( "../../helper/SelectableList" );

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../item/ImageItem");

/**
 * @constructor
 * @type {module:app/model/collection/ImageList}
 */
var ImageList = SelectableList.extend({

	/** @type {module:app/model/item/ImageItem} */
	model: ImageItem,

});

module.exports = new ImageList(void 0, {
	comparator: "o"
});
