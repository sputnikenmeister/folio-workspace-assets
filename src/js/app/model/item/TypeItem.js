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
		attrs: [],
		excluded: false,
	},

	selector: function() {
		return "#" + this.domId();
	},

	domId: function() {
		return "t" + this.id;
	},

	/** @override */
	toString: function() {
		return this.id;
	}

});
