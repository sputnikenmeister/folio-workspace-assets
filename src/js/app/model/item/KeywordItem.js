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
		attrs: [],
		tId: 0,
		excluded: false,
	},

//	selector: function() {
//		return "#" + this.domId();
//	},
//
//	domId: function() {
//		return "k" + this.id;
//	},

	/** @override */
	toString: function() {
		return this.id;
	}

});
