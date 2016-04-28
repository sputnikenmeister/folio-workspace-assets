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

// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");

// Globals.DEFAULT_COLORS["color"];
// Globals.DEFAULT_COLORS["background-color"];
var attrsDefault = _.defaults({
	"has-colors": "defaults"
}, Globals.DEFAULT_COLORS);

/** @private */
var MediaCollection = SelectableCollection.extend({
	model: MediaItem,
	comparator: "o"
});

/**
 * @constructor
 * @type {module:app/model/item/BundleItem}
 */
module.exports = BaseItem.extend({

	_domPrefix: "b",

	/** @type {Object|Function} */
	// defaults: function() {
	// 	return {
	// 		name: "",
	// 		handle: "",
	// 		desc: "",
	// 		completed: 0,
	// 		kIds: [],
	// 	};
	// },
	defaults: {
		name: "",
		handle: "",
		desc: "",
		completed: 0,
		get kIds() {
			return [];
		},
		// get keywords() { return []; },
	},

	getters: ["name", "media"],

	mutators: {
		text: function() {
			return stripTags(this.get("desc"));
		},
		// kIds: {
		// 	set: function (key, value, options, set) {
		// 		if (Array.isArray(value)) {
		// 			set("keywords", value.map(function(id) {
		// 				var obj = keywords.get(id);
		// 				return obj;
		// 			}, this), options;
		// 		}
		// 		set(key, value, options);
		// 	},
		// },
		media: {
			transient: true,
			set: function(key, value, options, set) {
				if (Array.isArray(value)) {
					value.forEach(function(o) {
						o.bundle = this;
					}, this);
					value = new MediaCollection(value);
				}
				set(key, value, options);
			},
		},
	},

	initialize: function(attrs, options) {
		this.colors = {
			fgColor: new Color(this.attr("color")),
			bgColor: new Color(this.attr("background-color"))
		};
		this.colors.hasDarkBg = this.colors.fgColor.luminosity() > this.colors.bgColor.luminosity();
	},

	attrs: function() {
		return this._attrs || (this._attrs = _.defaults({}, this.get("attrs"), attrsDefault));
	},
});
