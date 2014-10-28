/**
 * @module app/model/ItemList
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @param {Backbone.Collection} [collection]
 * @type {module:app/helper/Iterator}
 */
function Iterator(collection){
	this.collection = collection;
}

Iterator.prototype = {
	/**
	 * @param {Backbone.Model} [model]
	 * @return {Boolean}
	 */
	hasFollowing:function(model) {
		return this.collection.indexOf(model) < (this.collection.length - 1);
	},

	/**
	 * @param {Backbone.Model} [model]
	 * @return {Backbone.Model} the following (next) model
	 */
	following: function(model) {
		return this.hasFollowing(model)? this.collection.at(this.collection.indexOf(model) + 1): null;
	},

	/**
	 * @param {Backbone.Model} [model]
	 * @return {Backbone.Model} the next model, or the first if [model] is last
	 */
	followingOrFirst: function(model) {
		return this.collection.at((this.collection.indexOf(model) + 1) % this.collection.length);
	},

	/**
	 * @param {Backbone.Model} [model]
	 * @return {Boolean}
	 */
	hasPreceding: function(model) {
		return this.collection.indexOf(model) > 0;
	},

	/**
	 * @param {Backbone.Model} [model]
	 * @return {Backbone.Model} the preceding model
	 */
	preceding: function(model) {
		return this.hasPreceding(model)? this.collection.at(this.collection.indexOf(model) - 1): null;
	},

	/**
	 * @param {Backbone.Model} [model]
	 * @return {Backbone.Model} the preceding (previous) model, or the last if [model] is first
	 */
	precedingOrLast: function(model) {
		var index = this.collection.indexOf(model) - 1;
		return this.collection.at(index > -1 ? index : this.collection.length - 1);
	}
};

module.exports = Iterator;
