/**
* jscs standard:Jquery
* @module model/BundleList
* @requires module:backbone
*/

/** @type {module:app/model/ItemList} */
var ItemList = require( "./ItemList" );

/** @type {module:app/model/BundleItem} */
var BundleItem = require( "./BundleItem" );

/**
 * @constructor
 * @type {module:app/model/List}
 */
module.exports = ItemList.extend({

	model: BundleItem,

	url: "/json/bundles/"

});
