/**
 * @module module:app/control/Router
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

/**
 * @constructor
 * @type {module:app/control/Router}
 */
var Router = Backbone.Router.extend({

	routes: {
		"bundles/:handle": "bundleItem",
		"": "bundleList",
	},

	initialize: function() {
		this.on("route", function(ev, route) {
			console.log(["Router.route", ev].concat(route).join(" "));
		});
	},

	bundleItem: function(handle) {
	},

	bundleList:function() {
	}

});
module.exports = new Router();
