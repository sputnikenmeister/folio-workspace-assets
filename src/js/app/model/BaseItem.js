/**
* @module app/model/BaseItem
* @requires module:backbone
*/

/** @type {module:backbone} */
var Model = require("backbone").Model;
/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("utils/strings/stripTags");
/** @type {module:app/model/parseSymAttrs} */
var parseSymAttrs = function (s, m1, m2) {
	return s.replace(/(\,|\;)/g, function (m) {
		return (m == ",") ? ";" : ",";
	});
};//require("app/model/parseSymAttrs");

var BaseItemProto = {
	
	_domPrefix: "_",
	
	/** @type {Object} */
	defaults: {
		// attrs: function() { return {}; },
		get attrs() { return {}; },
	},
	
	mutators: {
		domid: function() {
			return this._domId || (this._domId = this._domPrefix + this.id);
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
	}
};

var BaseItem = {
	extend: function(proto, obj) {
		for (var p in BaseItemProto) {
			if (proto.hasOwnProperty(p) && (Object.getPrototypeOf(proto[p]) === Object.prototype)) {
				_.defaults(proto[p], BaseItemProto[p]);
				// console.log("BaseItem::extend '%s:%s' is Object\n%s", proto._domPrefix, p, JSON.stringify(proto[p]));
			}
		}
		return Model.extend.apply(this, arguments);
	}
};


/**
 * @constructor
 * @type {module:app/model/BaseItem}
 */
module.exports = Model.extend(BaseItemProto, BaseItem);
