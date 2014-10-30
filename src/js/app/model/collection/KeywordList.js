/**
* @module app/model/collection/KeywordList
* @requires module:backbone
*/

/** @type {module:app/helper/SelectableList} */
var SelectableList = require( "../../helper/SelectableList" );

/** @type {module:app/model/item/KeywordItem} */
var KeywordItem = require( "../item/KeywordItem" );

/**
 * @constructor
 * @type {module:app/model/collection/KeywordList}
 */
var KeywordList = SelectableList.extend({

	/**
	 * @type {Backbone.Model}
	 */
	model: KeywordItem

});

module.exports = new KeywordList();
