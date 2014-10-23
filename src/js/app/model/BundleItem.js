/**
* @module model/BundleItem
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
		name: "",
		handle: "",
		desc: "",
		completed: 0,
		attrs: []
	},

	/** @override */
	urlRoot: "/json/bundles/",

	/** @private */
	_url: null,

	/** @override */
	url: function() {
		//return Backbone.Model.prototype.url.apply(this, arguments) + "/";
		return this._url = this._url || this.urlRoot + this.attributes["handle"];
	},

	/** @override */
	toString: function() {
		return this.attributes["name"];
	}

});
