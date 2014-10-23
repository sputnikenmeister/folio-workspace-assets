/**
* @module model/KeywordList
* @requires module:backbone
*/

/** @type {module:app/model/SelectableList} */
var SelectableList = require( "./SelectableList" );

/** @type {module:app/model/KeywordItem} */
var KeywordItem = require( "./KeywordItem" );

/**
 * @constructor
 * @type {module:app/model/KeywordList}
 */
module.exports = SelectableList.extend({

	/**
	 * @type {Backbone.Model}
	 */
	model: KeywordItem

});
