/**
* jscs standard:Jquery
* @module model/KeywordList
* @requires module:backbone
*/

/** @type {module:app/model/ItemList} */
var ItemList = require( "./ItemList" );

/** @type {module:app/model/KeywordItem} */
var KeywordItem = require( "./KeywordItem" );

/**
 * @constructor
 * @type {module:app/model/KeywordList}
 */
module.exports = ItemList.extend({

 	model: KeywordItem

});
