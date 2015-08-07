/**
* @module app/model/item/TypeItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/item/TypeItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object} */
	defaults: {
		name: "",
		handle: "",
		attrs: null,
	},
	
	mutators: {
		domid: function() {
			return "t" + this.id;
		},
	},
	
	attrs: function() {
		return this.get("attrs");
	},
		
	/** @override */
	toString: function() {
		return this.id;
	}

});
