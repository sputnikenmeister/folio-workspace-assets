/**
 * @module app/view/AppView
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");

/**
 * @constructor
 * @type {module:app/control/AppRouter}
 */
var AppRouter = Backbone.Router.extend({

	routes: {
		"bundles/:handle": "bundleItem",
		"": "bundleList",
	},

	getApplicationRoot: function () {
		return this.approot = this.approot || window.location;
	},
	setApplicationRoot: function (approot) {
		this.approot = approot;
	},

	// bundleHandle: null,

	// bundleItem: function(handle) {
	// 	this.bundleHandle = handle;
	// 	// console.log("AppRouter.bundleItem", handle);
	// },

	// bundleList:function() {
	// 	this.bundleHandle = null;
	// 	// console.log("AppRouter.bundleList");
	// }

});
module.exports = new AppRouter();