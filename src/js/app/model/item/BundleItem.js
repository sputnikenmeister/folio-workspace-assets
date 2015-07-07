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

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("../../model/SelectableCollection");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../item/MediaItem");

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
		media: {
			set: function (key, value, options, set) {
				_.each(value, function(o) {
					o.bundle = this;
				}, this);
				set(key, new SelectableCollection(value, {
					model: MediaItem,
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
					value = attrs;
				}
				if (!_.isObject(value)) {
					console.warn("MediaItem.attrs", "value set is not an object: " + (typeof value));
					value = void 0;
				} 
				set(key, value, options);
			}
		}
	},

//	initialize: function (attrs, options) {},
//
//	parse: function (resp, options) {
//		return resp;
//	},
//
//	selector: function() {
//		return "#" + this.domId();
//	},
//
//	domId: function() {
//		return "b" + this.id;
//	},

	attrs: function() {
		return this.get("attrs");
	},

	/** @override */
	toString: function () {
		return this.id;
	},

});
