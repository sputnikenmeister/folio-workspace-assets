/**
 * @module app/model/collection/BundleCollection
 */

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/model/item/BundleItem} */
var BundleItem = require("app/model/item/BundleItem");

/**
 * @constructor
 * @type {module:app/model/collection/BundleCollection}
 */
var BundleCollection = SelectableCollection.extend({

	/** @type {Backbone.Model} */
	model: BundleItem,

	/** @type {Function} */
	comparator: function(oa, ob) {
		var a = oa.get("completed");
		var b = ob.get("completed");
		if (a > b) {
			return -1;
		} else if (a < b) {
			return 1;
		} else {
			return 0;
		}
	},

	/** @type {String} */
	url: "/json/bundles/",

});

module.exports = new BundleCollection();
