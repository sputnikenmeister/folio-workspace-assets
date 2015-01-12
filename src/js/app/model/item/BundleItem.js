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
				_.each(value, function(o) {
					o.bundle = this;
				}, this);
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
					_.each(value, function (s) {
						var i = s.indexOf(":");
						if (i > 0) {
							attrs[s.substring(0, i)] = parseSymAttrs(s.substring(i + 1));
						}
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

	selector: function() {
		return "#" + this.domId();
	},

	domId: function() {
		return "b" + this.id;
	},

	/** @override */
	toString: function () {
		return this.id;
	},

});
