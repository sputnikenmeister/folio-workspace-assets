/**
 * @module app/model/item/BundleItem
 * @requires module:backbone
 */

// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("app/model/item/MediaItem");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("utils/strings/stripTags");
// /** @type {module:app/utils/strings/parseTaglist} */
// var parseSymAttrs = require("app/model/parseSymAttrs");

// Globals.DEFAULT_COLORS["color"];
// Globals.DEFAULT_COLORS["background-color"];
var attrsDefault = _.defaults({ "has-colors": "defaults" }, Globals.DEFAULT_COLORS);

/** @private */
var MediaCollection = SelectableCollection.extend({
	model: MediaItem, comparator: "o"
});

/**
 * @constructor
 * @type {module:app/model/item/BundleItem}
 */
module.exports = BaseItem.extend({

	/** @type {Object|Function} */
	defaults: function() {
		return {
			name: "",
			handle: "",
			desc: "",
			completed: 0,
			kIds: [],
			// attrs: _.clone(attrsDefault)
			// attrs: function() { return {}; },
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
				if (Array.isArray(value)) {
					value.forEach(function(o) {
						o.bundle = this;
					}, this);
					value = new MediaCollection(value);
				}
				set(key, value, options);
			},
			transient: true
		},
		// attrs: {
		// 	set: function (key, value, options, set) {
		// 		// console.warn(this.cid, "MediaItem.attrs", value, this.attributes.attrs, this.get("attrs"));
		// 		if (_.isArray(value)) {
		// 			var attrs = _.clone(attrsDefault);
		// 			_.each(value, function (attr) {
		// 				if (_.isString(attr)) {
		// 					var idx = attr.indexOf(":");
		// 					if (idx > 0) {
		// 						attrs[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
		// 					} else {
		// 						attrs[attr] = attr; // to match HTML5<>XHTML valueless attributes
		// 					}
		// 				} else {
		// 					console.warn("MediaItem.attrs.item", "value set is not a String", (typeof value), value);
		// 				}
		// 			});
		// 			value = attrs;
		// 		}
		// 		if (!_.isObject(value)) {
		// 			console.error("%s::attrs value not an object or string array", this.cid, value);
		// 			value = {};
		// 		}
		// 		// else if (_.isObject(value)) {
		// 		// 	value = _.defaults(value, attrsDefault);
		// 		// } else {
		// 		// 	console.warn(this.cid, "BundleItem.attrs", "value set is an Object or parseable Array", (typeof value), value);
		// 		// 	value = _.clone(attrsDefault);
		// 		// 	value._value = value;
		// 		// }
		// 		set(key, value, options);
		// 	}
		// }
	},

	initialize: function (attrs, options) {
		this.colors = {
			fgColor: new Color(this.attrs()["color"]),
			bgColor: new Color(this.attrs()["background-color"])
		};
		this.colors.hasDarkBg = this.colors.fgColor.luminosity() > this.colors.bgColor.luminosity();
	},
	
	
	attrs: function() {
		if (this._attrs === void 0) {
			this._attrs = _.defaults({}, this.get("attrs"), attrsDefault);
		}
		return this._attrs;// || (this._attrs = {});
		// return this.get("attrs");
	},
	
	/** @override */
	toString: function () {
		return this.id;
	},

});
