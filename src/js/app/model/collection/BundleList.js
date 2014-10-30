/**
* @module app/model/collection/BundleList
* @requires module:backbone
*/

/** @type {module:app/helper/SelectableList} */
var SelectableList = require( "../../helper/SelectableList" );

/** @type {module:app/model/item/BundleItem} */
var BundleItem = require( "../item/BundleItem" );

/**
 * @constructor
 * @type {module:app/model/collection/List}
 */
var BundleList = SelectableList.extend({

	/** @type {Backbone.Model} */
	model: BundleItem,

	/** @type {String} */
	url: "/json/bundles/",

});

module.exports = new BundleList();
