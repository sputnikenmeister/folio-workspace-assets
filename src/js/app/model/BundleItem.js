/**
* jscs standard:Jquery
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

	_url: null,

	urlRoot: "/json/bundles/",

	url: function() {
		//return Backbone.Model.prototype.url.apply(this, arguments) + "/";
		return this._url = this._url || this.urlRoot + this.attributes["handle"];
	},

	toString: function() {
		return this.attributes["name"];
	}

});
