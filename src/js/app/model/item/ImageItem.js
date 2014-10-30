/**
* @module app/model/item/ImageItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/item/ImageItem}
 */
module.exports = Backbone.Model.extend({

	/**
	 * @type {Object}
	 */
	defaults: {
		f: "",
		w: 0,
		h: 0,
		desc: "",
		attrs: [],
		bId: 0,
		excluded: false,
	},

	selector: function() {
		return "#i" + this.id;
	},

	/** @override */
	toString: function() {
		return this.id;
	}

});
