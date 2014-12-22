/**
* @module app/model/item/ImageItem
*/

/** @type {module:backbone} */
var Backbone = require( "backbone" );
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("../../utils/strings/stripTags");
/** @type {module:app/utils/strings/parseTaglist} */
var parseSymAttrs = require("../../utils/strings/parseSymAttrs");

/** @type {Object} */
var imageUrlTemplates = {
	"original" : _.template(window.approot + "workspace/uploads/<%= f %>"),
	"constrain-width" : _.template(window.approot + "image/1/<%= width %>/0/uploads/<%= f %>"),
	"constrain-height" : _.template(window.approot + "image/1/0/<%= height %>/uploads/<%= f %>")
};
/** @type {Function} */
var longdescTemplate = _.template("i<%= id %>-caption");

/**
 * @constructor
 * @type {module:app/model/item/ImageItem}
 */
module.exports = Backbone.Model.extend({

	/** @type {Object} */
	defaults: {
		bId: 0,
		o: 0,
		f: "",
		w: 0,
		h: 0,
		desc: "<p><em>No description</em></p>",
		attrs: [],
	},

	mutators: {
		name: function () {
			return this.get("text") || this.get("f");
		},
		handle: function () {
			return this.get("f");
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
					set(key, attrs, options);
				} else {
					set(key, value, options);
				}
			}
		}
	},

	initialize: function() {
		_.once(_.bind(this.getImageUrl, this));
		_.once(_.bind(this.selector, this));
	},

	getImageUrl: function() {
		return imageUrlTemplates.original(this.attributes);
	},

	selector: function() {
		return "#i" + this.id;
	},

	/** @override */
	toString: function() {
		return this.id;
	},

});
