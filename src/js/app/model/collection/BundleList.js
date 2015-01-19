/**
* @module app/model/collection/BundleList
* @requires module:backbone
*/

/** @type {module:app/helper/SelectableList} */
var SelectableList = require( "../../helper/SelectableList" );

/** @type {module:app/model/item/BundleItem} */
var BundleItem = require( "../item/BundleItem" );

/**
 * @constructor
 * @type {module:app/model/collection/List}
 */
var BundleList = SelectableList.extend({

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

module.exports = new BundleList();
