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

	/** @type {String} */
	urlRoot: "/json/bundles/",

	/** @override */
	url: function() {
		//return Backbone.Model.prototype.url.apply(this, arguments) + "/";
		return this._url = this._url || this.urlRoot + this.attributes["handle"];
	},
	/** @private */
	_url: null,

	/** @override */
	toString: function() {
		return this.attributes["name"];
	}

});
