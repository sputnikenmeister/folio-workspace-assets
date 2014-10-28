/**
 * @module app/model
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/BundleList} */
var BundleList = require( "../model/BundleList" );
/** @type {module:app/model/KeywordList} */
var KeywordList = require( "../model/KeywordList" );
/** @type {module:app/model/TypeList} */
var TypeList = require( "../model/TypeList" );
/** @type {module:app/model/ImageList} */
var ImageList = require( "../model/ImageList" );

/**
 * @constructor
 * @type {module:app/AppModel}
 */
var AppModel = Backbone.Model.extend({
	defaults: {
		bundles: new BundleList(),
		keywords: new KeywordList(),
		types: new TypeList(),
		images: new ImageList(),

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
