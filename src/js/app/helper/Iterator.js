/**
 * jscs standard:Jquery
 * @module model/ItemList
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/helper/Iterator}
 */
var Iterator = function(collection){
	this.collection = collection;
};

_.extend(Iterator.prototype, {
	
	/** @return boolean  */
	hasFollowing:function(model) {
		return this.collection.indexOf(model) < (this.collection.length - 1);
	},
	
	/** @return next model  */
	following: function(model) {
		return this.hasFollowing(model)? this.collection.at(this.collection.indexOf(model) + 1): null;
	},
	
	/** @return next model or the beginning if at the end */
	followingOrFirst: function(model) {
		return this.collection.at((this.collection.indexOf(model) + 1) % this.collection.length);
	},
	
	/** @return boolean  */
	hasPreceding: function(model) {
		return this.collection.indexOf(model) > 0;
	},
	
	/** @return the previous model */
	preceding: function(model) {
		return this.hasPreceding(model)? this.collection.at(this.collection.indexOf(model) - 1): null;
	},
	
	/** @return the previous model or the end if at the beginning */
	precedingOrLast: function(model) {
		var index = this.collection.indexOf(model) - 1;
		return this.collection.at(index > -1 ? index : this.collection.length - 1);
	}
	
});

module.exports = Iterator;
