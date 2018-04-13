/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

var defaults = {
	routeName: "initial",
	collapsed: false,
	article: null,
	withArticle: false,
	bundle: null,
	withBundle: false,
	media: null,
	withMedia: false,
};

var AppState = Backbone.Model.extend({
	defaults: defaults,
	// getters: Object.keys(defaults),
});

module.exports = AppState;