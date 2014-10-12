/**
* jscs standard:Jquery
* @module model/ItemList
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/ItemList}
 */
module.exports = Backbone.Collection.extend({
	
	selected: null,
	
	select: function(newItem) {
		if (this.selected === newItem) {
			return;
		}
		oldItem = this.selected;
		this.selected = newItem;
		this.trigger("collection:select", newItem, oldItem);
	},
	
	selectedItem: function(){
		return this.selected;
	},
	
	hasFollowing:function(model) {
		return this.indexOf(model) < (this.length - 1);
	},
	
	hasPreceding: function(model) {
		return this.indexOf(model) > 0;
	},
	
	/** return next model  */
	following: function(model) {
		return this.hasFollowing(model)? this.at(this.indexOf(model) + 1): null;
	},
	
	/** return the previous model */
	preceding: function(model) {
		return this.hasPreceding(model)? this.at(this.indexOf(model) - 1): null;
	},
	
	/** return next model or the beginning if at the end */
	followingOrFirst: function(model) {
		return this.at((this.indexOf(model) + 1) % this.length);
	},
	
	/** return the previous model or the end if at the beginning */
	precedingOrLast: function(model) {
		var index = this.indexOf(model) - 1;
		return this.at(index > -1 ? index : this.length - 1);
	}
	
});
