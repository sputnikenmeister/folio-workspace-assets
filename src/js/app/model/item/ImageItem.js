/**
* @module app/model/item/ImageItem
* @requires module:backbone
*/

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/item/ImageItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object} */
	defaults: {
		bId: 0,
		o: 0,
		f: "",
		w: 0,
		h: 0,
		desc: "<p><em>No description</em></p>",
		attrs: [],
	},

	selector: function() {
		return "#i" + this.id;
	},

	/** @override */
	toString: function() {
		return this.id;
	},

});
