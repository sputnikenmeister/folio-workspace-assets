/**
* @module app/model/BundleList
* @requires module:backbone
*/

/** @type {module:app/helper/SelectableList} */
var SelectableList = require( "../helper/SelectableList" );

/** @type {module:app/model/BundleItem} */
var BundleItem = require( "./BundleItem" );

/**
 * @constructor
 * @type {module:app/model/List}
 */
module.exports = SelectableList.extend({

	/** @type {Backbone.Model} */
	model: BundleItem,

	/** @type {String} */
	url: "/json/bundles/",

});
