/**
 * @module app/model/BaseItem
 * @requires module:backbone
 */

/** @type {module:app/model/BaseModel} */
const BaseModel = require("app/model/BaseModel");

// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
// /** @type {module:app/utils/strings/stripTags} */
// var stripTags = require("utils/strings/stripTags");
// /** @type {module:app/model/parseSymAttrs} */
//var parseSymAttrs = require("app/model/parseSymAttrs");

var parseSymAttrs = function(s) {
	return s.replace(/(\,|\;)/g, function(m) {
		return (m == ",") ? ";" : ",";
	});
};
var toAttrsHash = function(obj, attr) {
	if (_.isString(attr)) {
		var idx = attr.indexOf(":");
		if (idx > 0) {
			obj[attr.substring(0, idx)] = parseSymAttrs(attr.substring(idx + 1));
		} else {
			obj[attr] = attr; // to match HTML5<>XHTML valueless attributes
		}
	} // else ignore non-string values
	return obj;
};
/**
 * @constructor
 * @type {module:app/model/BaseItem}
 */
module.exports = BaseModel.extend({

	_domPrefix: "_",

	/** @type {Object} */
	defaults: {
		// attrs: function() { return {}; },
		get attrs() {
			return {};
		},
	},

	getters: ["domid"],

	mutators: {
		domid: function() {
			if (!this.hasOwnProperty("_domId"))
				this._domId = this._domPrefix + this.id;
			return this._domId;
		},
		attrs: {
			set: function(key, value, options, set) {
				if (Array.isArray(value)) {
					value = value.reduce(toAttrsHash, {});
				}
				if (!_.isObject(value)) {
					console.error("%s::attrs value not an object or string array", this.cid, value);
					value = {};
				}
				set(key, value, options);
			}
		},
	},

	attr: function(attr) {
		return this.attrs()[attr];
	},

	attrs: function() {
		return this.get("attrs");
	},

	toString: function() {
		return this.get("domid");
	},

	getDistanceToSelected: function() {
		if (this.collection && this.collection.selectedIndex > 0) {
			return this.collection.indexOf(this) - this.collection.selectedIndex;
		}
		return -1;
	},

	getIndex: function() {
		if (this.collection) {
			return this.collection.indexOf(this);
		}
		return -1;
	}
});
