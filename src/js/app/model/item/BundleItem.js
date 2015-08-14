/**
 * @module app/model/item/BundleItem
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("../../model/SelectableCollection");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../item/MediaItem");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("../../../utils/strings/stripTags");
/** @type {module:app/utils/strings/parseTaglist} */
var parseSymAttrs = require("../parseSymAttrs");

/** @private */
var BundleMediaCollection = SelectableCollection.extend({
	model: MediaItem, comparator: "o"
});

	// Globals.DEFAULT_COLORS["color"];
	// Globals.DEFAULT_COLORS["background-color"];
var attrsDefault = _.defaults({ "has-colors": "defaults" }, Globals.DEFAULT_COLORS);

/**
 * @constructor
 * @type {module:app/model/item/BundleItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object|Function} */
	defaults: function() {
		return {
			name: "",
			handle: "",
			desc: "",
			completed: 0,
			kIds: [],
			attrs: _.clone(attrsDefault)
		};
	},
	
	mutators: {
		domid: function() {
			return "b" + this.id;
		},
		text: function () {
			return stripTags(this.get("desc"));
		},
		media: {
			set: function (key, value, options, set) {
				_.each(value, function(o) {
					o.bundle = this;
				}, this);
				set(key, new BundleMediaCollection(value), options);
				// set(key, new SelectableCollection(value, {
				// 	model: MediaItem,
				// 	comparator: "o"
				// }), options);
			},
			transient: true
		},
		attrs: {
			set: function (key, value, options, set) {
				// console.warn(this.cid, "MediaItem.attrs", value, this.attributes.attrs, this.get("attrs"));
				if (_.isArray(value)) {
					var attrs = _.clone(attrsDefault);
					_.each(value, function (attr) {
						if (_.isString(attr)) {
							var idx = attr.indexOf(":");
							if (idx > 0) {
								attrs[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
							} else {
								attrs[attr] = attr; // to match HTML5<>XHTML valueless attributes
							}
						} else {
							console.warn("MediaItem.attrs.item", "value set is not a String", (typeof value), value);
						}
					});
					value = attrs;
				} else if (_.isObject(value)) {
					value = _.defaults(value, attrsDefault);
				} else {
					console.warn(this.cid, "BundleItem.attrs", "value set is an Object or parseable Array", (typeof value), value);
					value = _.clone(attrsDefault);
					value._value = value;
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
