/**
* @module app/model/BundleItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/model/BundleItem}
 */
module.exports = Backbone.Model.extend({

	/**
	 * @type {Object}
	 */
	defaults: {
		excluded: false,
		uid: "",
		name: "",
		handle: "",
		desc: "",
		completed: 0,
		attrs: [],
		keywordIds: [],
		imageIds: [],
	},

	// /** @override */
	// url: function() {
	// 	//return Backbone.Model.prototype.url.apply(this, arguments) + "/";
	// 	return (this.collection.url || this.urlRoot) + this.attributes["handle"];
	// },

	/** @override */
	toString: function() {
		return this.id;
	}

});
