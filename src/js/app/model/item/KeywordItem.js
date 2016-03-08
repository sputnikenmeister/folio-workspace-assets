/**
* @module app/model/item/KeywordItem
* @requires module:app/model/BaseItem
*/

/** @type {module:app/model/BaseItem} */
var BaseItem = require("app/model/BaseItem");

// /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");

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
	},
	
	// mutators: {
	// 	tId: {
	// 		set: function (key, value, options, set) {
	// 			var type = types.get(value);
	// 			if (type) {
	// 				type.get("keywords").push(this);
	// 				set("type", type, options);
	// 			}
	// 			set(key, value, options);
	// 		}
	// 	},
	// }
});
