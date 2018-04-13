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

var BaseItemProto = {

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
			return this._domId || (this._domId = this._domPrefix + this.id);
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
	}
};

var BaseItem = {
	extend: function(proto, obj) {
		var constr, propName; //, propDef;
		for (propName in proto) {
			if (proto.hasOwnProperty(propName) && _.isObject(proto[propName])) { //(Object.getPrototypeOf(proto[propName]) === Object.prototype)) {
				_.defaults(proto[propName], BaseItemProto[propName]);
				// console.log("BaseItem::extend '%s:%s' is Object\n%s", proto._domPrefix, p, JSON.stringify(proto[p]));
			}
		}
		// if (proto.properties && this.prototype.properties) {
		// 	_.defaults(proto.properties, this.prototype.properties);
		// }
		constr = Model.extend.apply(this, arguments);

		if (Array.isArray(constr.prototype.getters)) {
			constr.prototype.getters.forEach(function(getterName) {
				Object.defineProperty(constr.prototype, getterName, {
					enumerable: true,
					get: function() {
						return this.get(getterName);
					}
				});
			});
		}
		// if (_.isObject(proto.properties)) {
		// 	for (propName in proto.properties) {
		// 		if (proto.properties.hasOwnProperty(propName)) {
		// 			propDef = proto.properties[propName];
		// 			if (_.isFunction(propDef)) {
		// 				proto.properties[propName] = {
		// 					enumerable: true, get: propDef
		// 				};
		// 			} else if (_.isObject(propDef)){
		// 				propDef.enumerable = true;
		// 			} else {
		// 				delete proto.properties[propName];
		// 			}
		// 		}
		// 	}
		// 	Object.defineProperties(proto, proto.properties);
		// 	delete proto.properties;
		// }
		return constr;
	}
};

/**
 * @constructor
 * @type {module:app/model/BaseItem}
 */
module.exports = BaseItem.extend.call(Model, BaseItemProto, BaseItem);
// module.exports = Model.extend(BaseItemProto, BaseItem);
