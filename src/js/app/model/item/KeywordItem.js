/**
* @module app/model/item/KeywordItem
* @requires module:app/model/BaseItem
*/

/** @type {module:app/model/BaseItem} */
var BaseItem = require("app/model/BaseItem");

/**
 * @constructor
 * @type {module:app/model/item/KeywordItem}
 */
module.exports = BaseItem.extend({
	
	_domPrefix: "k",
	
	/** @type {Object} */
	defaults: {
		name: "",
		handle: "",
		tId: -1,
		// attrs: null,
	},
});
