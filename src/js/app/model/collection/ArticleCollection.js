/**
 * @module app/model/collection/ArticleCollection
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/model/item/ArticleItem} */
var ArticleItem = require("app/model/item/ArticleItem");

/**
 * @constructor
 * @type {module:app/model/collection/ArticleCollection}
 */
var ArticleCollection = SelectableCollection.extend({

	/** @type {Backbone.Model} */
	model: ArticleItem

});

module.exports = new ArticleCollection();