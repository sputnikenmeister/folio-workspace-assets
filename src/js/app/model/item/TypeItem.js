/**
 * @module app/model/item/TypeItem
 */

// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:app/model/item/SourceItem} */
const BaseItem = require("app/model/BaseItem");

/**
 * @constructor
 * @type {module:app/model/item/TypeItem}
 */
module.exports = BaseItem.extend({

	_domPrefix: "t",

	/** @type {Object} */
	defaults: {
		name: "",
		handle: "",
		// get kIds() { return []; },
		// get keywords() { return []; },
	},

});
