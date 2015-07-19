/**
* @module app/model/item/MediaItem
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("../../../utils/strings/stripTags");
/** @type {module:app/utils/strings/parseTaglist} */
var parseSymAttrs = require("../parseSymAttrs");
/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");

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
			src: "", w: 0, h: 0,
			srcset: [],
			attrs: {},
		};
	},
	
	mutators: {
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
				if (_.isArray(value)) {
					var attrs = {};
					_.each(value, function (attr) {
						var idx = attr.indexOf(":");
						if (idx > 0) {
							attrs[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
						} else {
							attrs[attr] = "";
						}
					});
					value = attrs;
				}
				if (_.isObject(value)) {
					_.extend(this.attrs(), value);
				} else {
					console.warn("MediaItem.attrs", "value set is not an object: " + (typeof value));
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
		},
	},
	
	initialize: function() {
		var src = this.get("src");
		this._imageUrl = Globals.IMAGE_URL_TEMPLATES["original"]({ src: src });
		this._thumbUrl = Globals.IMAGE_URL_TEMPLATES["constrain-width"]({ src: src, width: 60 });
		// _.defaults(_.extend(this.attrs(), this.get("attrs")), this.get("bundle").get("attrs"));
	},
	
	attrs: function() {
		return this._attrs || (this._attrs = {});
	},
	
	getImageUrl: function() {
		return this._imageUrl;
	},
	
	getThumbUrl: function() {
		return this._thumbUrl;
	},
	
	/** @override */
	toString: function() {
		return this.id;
	},

});
