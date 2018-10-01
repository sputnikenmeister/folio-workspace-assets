/**
 * @module app/model/item/ArticleItem
 */

// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:app/model/item/SourceItem} */
const BaseItem = require("app/model/BaseItem");

/**
 * @constructor
 * @type {module:app/model/item/ArticleItem}
 */
module.exports = BaseItem.extend({

	_domPrefix: "a",

	/** @type {Object} */
	defaults: {
		name: "",
		handle: "",
		text: ""
	},

});
