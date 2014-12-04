/**
 * @module app/model/item/BundleItem
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("../../utils/strings/stripTags");
/** @type {module:app/utils/strings/parseTaglist} */
var parseSymAttrs = require("../../utils/strings/parseSymAttrs");

/** @type {module:app/helper/SelectableList} */
var SelectableList = require("../../helper/SelectableList");
/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../item/ImageItem");

/**
 * @constructor
 * @type {module:app/model/item/BundleItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object} */
	defaults: {
		name: "",
		handle: "",
		desc: "",
		completed: 0,
		attrs: {},
		kIds: [],
		excluded: false,
	},

	mutators: {
		text: function () {
			return stripTags(this.get("desc"));
		},
		images: {
			set: function (key, value, options, set) {
				set(key, new SelectableList(value, {
					model: ImageItem,
					comparator: "o"
				}), options);
			}
		},
		attrs: {
			set: function (key, value, options, set) {
				if (_.isArray(value)) {
					var attrs = {};
					_.each(value, function (attr) {
						var idx = attr.indexOf(":");
						if (idx > 0) {
							attrs[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
						} // else drop it
					});
					set(key, attrs, options);
				} else {
					set(key, value, options);
				}
			}
		}
	},

	initialize: function (attrs, options) {},

	parse: function (resp, options) {
		return resp;
	},

	selector: function () {
		return "#b" + this.id;
	},

	/** @override */
	toString: function () {
		return this.id;
	},

});
