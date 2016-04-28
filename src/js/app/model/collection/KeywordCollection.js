/**
 * @module app/model/collection/KeywordCollection
 * @requires module:backbone
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/model/item/KeywordItem} */
var KeywordItem = require("app/model/item/KeywordItem");

/**
 * @constructor
 * @type {module:app/model/collection/KeywordCollection}
 */
var KeywordCollection = SelectableCollection.extend({

	/** @type {Backbone.Model} */
	model: KeywordItem

});

module.exports = new KeywordCollection();
