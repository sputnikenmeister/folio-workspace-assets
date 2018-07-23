/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

module.exports = Backbone.Model.extend({

	defaults: {
		routeName: "initial",
		collapsed: false,
		article: null,
		withArticle: false,
		bundle: null,
		withBundle: false,
		media: null,
		withMedia: false,
	},

	initialize: function() {
		Object.keys(this.defaults).forEach(function(getterName) {
			Object.defineProperty(this, getterName, {
				enumerable: true,
				get: function() {
					return this.get(getterName);
				}
			});
		});
	}
});