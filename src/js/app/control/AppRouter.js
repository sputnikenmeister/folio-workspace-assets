/**
* @module app/view/AppView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

module.exports = Backbone.Router.extend({

	routes: {
		"bundles/:handle" : "bundleItem",
		"" : "bundleList",
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
