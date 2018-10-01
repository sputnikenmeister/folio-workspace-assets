/**
 * @module app/model/collection/TypeCollection
 * @requires module:backbone
 */

/** @type {module:backbone} */
const Backbone = require("backbone");

/** @type {module:app/model/item/TypeItem} */
const TypeItem = require("app/model/item/TypeItem");

/**
 * @constructor
 * @type {module:app/model/collection/TypeCollection}
 */
var TypeCollection = Backbone.Collection.extend({

	/** @type {Backbone.Model} */
	model: TypeItem

});

module.exports = new TypeCollection();
