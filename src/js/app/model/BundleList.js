/**
* @module model/BundleList
* @requires module:backbone
*/

/** @type {module:app/model/SelectableList} */
var SelectableList = require( "./SelectableList" );

/** @type {module:app/model/BundleItem} */
var BundleItem = require( "./BundleItem" );

/**
 * @constructor
 * @type {module:app/model/List}
 */
module.exports = SelectableList.extend({

	/**
	 * @type {Backbone.Model}
	 */
	model: BundleItem,

	url: "/json/bundles/"

});
