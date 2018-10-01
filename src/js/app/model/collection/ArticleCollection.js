/**
 * @module app/model/collection/ArticleCollection
 */

/** @type {module:app/model/SelectableCollection} */
const SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/model/item/ArticleItem} */
const ArticleItem = require("app/model/item/ArticleItem");

/**
 * @constructor
 * @type {module:app/model/collection/ArticleCollection}
 */
var ArticleCollection = SelectableCollection.extend({

	/** @type {Backbone.Model} */
	model: ArticleItem

});

module.exports = new ArticleCollection();
