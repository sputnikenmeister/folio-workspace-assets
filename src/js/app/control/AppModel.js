/**
 * @module app/control/AppModel
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/collection/BundleList} */
var BundleList = require( "../model/collection/BundleList" );
/** @type {module:app/model/collection/KeywordList} */
var KeywordList = require( "../model/collection/KeywordList" );
/** @type {module:app/model/collection/TypeList} */
var TypeList = require( "../model/collection/TypeList" );
/** @type {module:app/model/collection/ImageList} */
var ImageList = require( "../model/collection/ImageList" );

/**
 * @constructor
 * @type {module:app/control/AppModel}
 */
var AppModel = Backbone.Model.extend({
	defaults: {
		// bundles: new BundleList(),
		// keywords: new KeywordList(),
		// types: new TypeList(),
		// images: new ImageList(),

		root: "",
		selectedBundle: null,
	},

	bundles: function() {
		return this.get("bundles");
	},
	keywords: function() {
		return this.get("keywords");
	},
	types: function() {
		return this.get("types");
	},
	images: function() {
		return this.get("images");
	},
});

// module.exports = (function(){
// 	var instance = new AppModel();
// 	return instance;
// }());
module.exports = new AppModel();
