/**
* @module app/model/item/BundleItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/item/BundleItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object} */
	defaults: {
		name: "",
		handle: "",
		desc: "",
		completed: 0,
		attrs: [],
		kIds: [],
		iIds: [],
		excluded: false,
	},

	selector: function() {
		return "#b" + this.id;
	},

	/** @override */
	toString: function() {
		return this.id;
	},

});
