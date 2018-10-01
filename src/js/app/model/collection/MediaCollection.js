/**
 * @module app/model/collection/MediaCollection
 */

/** @type {module:app/model/SelectableCollection} */
const SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/model/item/MediaItem} */
const MediaItem = require("app/model/item/MediaItem");

/**
 * @constructor
 * @type {module:app/model/collection/SelectableCollection}
 */
var MediaCollection = SelectableCollection.extend({

	/** @type {module:app/model/item/MediaItem} */
	model: MediaItem,

});

module.exports = new MediaCollection(void 0, {
	comparator: "o"
});
