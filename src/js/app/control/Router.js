/**
 * @module module:app/control/Router
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/model/collection/ImageList} */
var images = require("../model/collection/ImageList");

/**
 * @constructor
 * @type {module:app/control/Router}
 */
var Router = Backbone.Router.extend({

	routes: {
		"bundles/:bundle/:image": "bundleItem",
		"bundles/:bundle": "bundleItemRedirect",
		"bundles": "bundleList",
		"": "bundleListRedirect",
	},

	initialize: function() {
		this.on("route", function() {
			console.log("Router.route", arguments);
		});
	},

	bundleListRedirect: function() {
		this.navigate("bundles", { trigger: true, replace: true });
	},

	bundleItemRedirect: function (bundle) {
		this.navigate("bundles/" + bundle + "/0", { trigger: true, replace: true });
	},

});
module.exports = new Router();
