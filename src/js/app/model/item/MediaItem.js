/**
* @module app/model/item/MediaItem
*/

// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/model/item/SourceItem} */
var BaseItem = require("app/model/BaseItem");
/** @type {module:app/model/item/SourceItem} */
var SourceItem = require("app/model/item/SourceItem");
/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("utils/strings/stripTags");
// /** @type {module:app/model/parseSymAttrs} */
// var parseSymAttrs = require("app/model/parseSymAttrs");

/**
* @constructor
* @type {module:app/model/item/MediaItem.SourceCollection}
*/
var SourceCollection = SelectableCollection.extend({
	model: SourceItem
});

/**
 * @constructor
 * @type {module:app/model/item/MediaItem}
 */
module.exports = BaseItem.extend({
	
	/** @type {Object} */
	defaults: function () {
		return {
			o: 0,
			bId: -1,
			desc: "<p><em>Untitled</em></p>",
			// src: "", w: 0, h: 0,
			srcIdx: 0,
			// srcset: function() { return [{ src: "", mime: "", w: 0, h: 0 }]; },
			srcset: function() { return []; },
			// attrs: function() { return {}; },
		};
	},
	
	mutators: {
		domid: function() {
			return "m" + this.id;
		},
		name: function () {
			return this.get("text") || this.get("src");
		},
		handle: function () {
			return this.get("src");
		},
		text: function () {
			return stripTags(this.get("desc"));
		},
		srcset: {
			set: function (key, value, options, set) {
				if (Array.isArray(value)) {
					for (var i = 0; i < value.length; i++) {
						value[i]["src"] += "?" + Date.now();
					}
				}
				set(key, value, options);
			}
		},
		src: function() { 
			return this._getDefaultSource()["src"] || "";
		},
		w: function() { 
			return this._getDefaultSource()["w"] || 0;
		},
		h: function() { 
			return this._getDefaultSource()["h"] || 0;
		},
		// attrs: {
		// 	set: function (key, value, options, set) {
		// 		if (Array.isArray(value)) {
		// 			value = value.reduce(function(attrs, attr, attrIdx) {
		// 				if (_.isString(attr)) {
		// 					var idx = attr.indexOf(":");
		// 					if (idx > 0) {
		// 						attrs[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
		// 					} else {
		// 						attrs[attr] = attr; // to match HTML5<>XHTML valueless attributes
		// 					}
		// 				} else {
		// 					console.warn("%s::attrs[%i] value not a string", this.cid, attrIdx, value);
		// 				}
		// 				return attrs;
		// 			}, {});
		// 		}
		// 		if (!_.isObject(value)) {
		// 			console.error("%s::attrs value not an object or string array", this.cid, value);
		// 			value = {};
		// 		}
		// 		set(key, value, options);
		// 	}
		// },
		// bundle: {
		// 	set: function (key, value, options, set) {
		// 		_.defaults(this.attrs(), value.get("attrs"));
		// 		set(key, value, options);
		// 	},
		// 	transient: true
		// },
	},
	
	initialize: function() {
		var src = this._getDefaultSource()["src"];
		this._imageUrl = Globals.IMAGE_URL_TEMPLATES["original"]({ src: src });
		this._thumbUrl = Globals.IMAGE_URL_TEMPLATES["constrain-width"]({ src: src, width: 60 });
	},
	
	attrs: function() {
		if (this._attrs === void 0) {
			// this._attrs = _.defaults(_.extend({}, this.get("attrs")), this.get("bundle").get("attrs"));
			this._attrs = _.defaults({}, this.get("attrs"), this.get("bundle").attrs());
		}
		return this._attrs;// || (this._attrs = {});
	},
	
	_getDefaultSource: function () {
		if (this._defaultSource === void 0) {
			this._defaultSource = this.get("srcset")[this.get("srcIdx")];
		}
		return this._defaultSource;
	},
	
	/** @override */
	toString: function() {
		return this.id;
	},

});
