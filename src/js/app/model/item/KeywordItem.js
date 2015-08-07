/**
* @module app/model/item/KeywordItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/item/KeywordItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object} */
	defaults: {
		name: "",
		handle: "",
		tId: 0,
		attrs: null,
	},
	
	mutators: {
		domid: function() {
			return "k" + this.id;
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
