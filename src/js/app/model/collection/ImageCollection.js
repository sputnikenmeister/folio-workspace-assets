/**
 * @module app/model/collection/ImageCollection
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require( "../../model/SelectableCollection" );

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../item/ImageItem");

/**
 * @constructor
 * @type {module:app/model/collection/ImageCollection}
 */
var ImageCollection = SelectableCollection.extend({

	/** @type {module:app/model/item/ImageItem} */
	model: ImageItem,

});

module.exports = new ImageCollection(void 0, {
	comparator: "o"
});
