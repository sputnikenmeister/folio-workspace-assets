/**
* @module view/AppView
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );

module.exports = Backbone.Router.extend({

	routes: {
		"bundles/:handle" : "bundleItem",
		"" : "bundleList",
	},

	// bundleItem: function(handle) {
	// 	console.log("AppRouter.bundleItem", handle);
	// },

	// bundleList:function() {
	// 	console.log("AppRouter.bundleList");
	// }

});
