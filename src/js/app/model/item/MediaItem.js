/**
* @module app/model/item/MediaItem
*/

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("utils/strings/stripTags");
/** @type {module:app/model/parseSymAttrs} */
var parseSymAttrs = require("app/model/parseSymAttrs");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");

/** @type {module:app/model/SelectableCollection} */
var SelectableCollection = require("app/model/SelectableCollection");
/** @type {module:app/model/item/SourceItem} */
var SourceItem = require("app/model/item/SourceItem");

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
module.exports = Backbone.Model.extend({
	
	/** @type {Object} */
	defaults: function () {
		return {
			o: 0,
			bId: -1,
			desc: "<p><em>Untitled</em></p>",
			// src: "", w: 0, h: 0,
			srcIdx: 0,
			srcset: function() { return [{ src: "", mime: "", w: 0, h: 0 }]; },
			attrs: {},
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
		attrs: {
			set: function (key, value, options, set) {
				if (Array.isArray(value)) {
					value = value.reduce(function(attrs, attr, attrIdx) {
						if (_.isString(attr)) {
							var idx = attr.indexOf(":");
							if (idx > 0) {
								attrs[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
							} else {
								attrs[attr] = attr; // to match HTML5<>XHTML valueless attributes
							}
						} else {
							console.warn("%s::attrs[%i] value not a string", this.cid, attrIdx, value);
						}
						return attrs;
					}, {});
				}
				if (_.isObject(value)) {
					_.extend(this.attrs(), value);
				} else {
					console.warn("%s::attrs value not an object or string array", this.cid, value);
					value = {};//void 0;
				}
				set(key, value, options);
			}
		},
		bundle: {
			set: function (key, value, options, set) {
				_.defaults(this.attrs(), value.get("attrs"));
				set(key, value, options);
			},
			transient: true
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
	},
	
	initialize: function() {
		var src = this._getDefaultSource()["src"];
		this._imageUrl = Globals.IMAGE_URL_TEMPLATES["original"]({ src: src });
		this._thumbUrl = Globals.IMAGE_URL_TEMPLATES["constrain-width"]({ src: src, width: 60 });
		// _.defaults(_.extend(this.attrs(), this.get("attrs")), this.get("bundle").get("attrs"));
	},
	
	attrs: function() {
		return this._attrs || (this._attrs = {});
	},
	
	_getDefaultSource: function () {
		if (this._defaultSource === void 0) {
			this._defaultSource = this.get("srcset")[this.get("srcIdx")];
		}
		return this._defaultSource;
	},
	
	// getSources: function() {
	// 	var opts = { silent: true };
	// 	var srcset = this.get("srcset");
	// 	var sources = new SourceCollection();
	// 	var defaultSrc = _.pick(this.attributes, ["src"]);
	// 	var defaultModel;
	// 	
	// 	// if not in srcset, create a model for defaultImage
	// 	if (!_.some(srcset, _.matcher(defaultSrc))) {
	// 		sources.add(defaultSrc, opts);
	// 	}
	// 	sources.add(srcset, opts);
	// 	
	// 	// sources[0].prefetched is bound to this.prefetched
	// 	defaultModel = sources.at(0);
	// 	if (this.has("prefetched")) {
	// 		defaultModel.set("prefetched", this.get("prefetched"));
	// 	} else {
	// 		this.once("change:prefetched", function() {
	// 			defaultModel.set("prefetched", this.get("prefetched"));
	// 		}, this);
	// 	}
	// 	// select it
	// 	sources.select(defaultModel);
	// 	// return collection
	// 	return sources;
	// },
	
	// getImageUrl: function() {
	// 	return this._imageUrl;
	// },
	// 
	// getThumbUrl: function() {
	// 	return this._thumbUrl;
	// },
	
	/** @override */
	toString: function() {
		return this.id;
	},

});
