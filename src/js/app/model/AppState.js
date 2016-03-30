/**
* @module app/model/BaseItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Backbone = require("backbone");

var AppState = Backbone.Model.extend({
	defaults: {
		bundle: null,
		withBundle: false,
		media: null,
		withMedia: false,
		collapsed: false,
		layoutName: "default-layout"
	},

	// /** @type {module:app/model/collection/TypeCollection} */
	// types: require("app/model/collection/TypeCollection"),
	// /** @type {module:app/model/collection/KeywordCollection} */
	// keywords: require("app/model/collection/KeywordCollection"),
	// /** @type {module:app/model/collection/BundleCollection} */
	// bundles: require("app/model/collection/BundleCollection"),
});

// Object.defineProperties(AppState.prototype, {
// 	types: { value: require("app/model/collection/TypeCollection") },
// 	keywords: { value: require("app/model/collection/KeywordCollection") },
// 	bundles: { value: require("app/model/collection/BundleCollection") },
// })

// module.exports = new AppState();
module.exports = AppState;
