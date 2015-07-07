/**
* @module app/model/item/MediaItem
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("../../utils/strings/stripTags");
/** @type {module:app/utils/strings/parseTaglist} */
var parseSymAttrs = require("../../utils/strings/parseSymAttrs");
/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");

/** @type {Object} */
var mediaUrlTemplates = {
	"original" : _.template(Globals.MEDIA_DIR + "/<%= src %>"),
//	"original" : _.template(Globals.APP_ROOT + Globals.MEDIA_DIR + "/<%= src %>"),
	"constrain-width" : _.template(Globals.APP_ROOT + "media/1/<%= width %>/0/uploads/<%= src %>"),
	"constrain-height" : _.template(Globals.APP_ROOT + "media/1/0/<%= height %>/uploads/<%= src %>")
};
/** @type {Function} */
var longdescTemplate = _.template("i<%= id %>-caption");

/**
 * @constructor
 * @type {module:app/model/item/MediaItem}
 */
module.exports = Backbone.Model.extend({
	
	/** @type {Object} */
	defaults: {
		bId: 0,
		o: 0,
		src: "",
		w: 0,
		h: 0,
		desc: "<p><em>No description</em></p>",
		attrs: {},
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
				if (!_.isObject(value)) {
					console.warn("MediaItem.attrs", "value set is not an object: " + (typeof value));
					value = void 0;
				} 
				set(key, value, options);
				_.extend(this.attrs(), this.get("attrs"));
			}
		},
		bundle: {
			set: function (key, value, options, set) {
				set(key, value, options);
				_.defaults(this.attrs(), value.get("attrs"));
			},
		},
	},
	
	attrs: function() {
		return this._attrs || (this._attrs = {});
	},
	
	setImageUrl: function(url) {
		this._mediaUrl = url;
	},
	
	getImageUrl: function() {
		if (_.isUndefined(this._mediaUrl)) {
			this._mediaUrl = mediaUrlTemplates.original(this.attributes);
		}
		return this._mediaUrl;
	},
	
	/** @override */
	toString: function() {
		return this.id;
	},

});
