/**
 * @module app/model/BaseModel
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:underscore} */
var _ = require("underscore");

var BaseModelProto = {
	// constructor: function() {
	// 	if (this.properties) {
	// 		Object.defineProperties(this, this.properties);
	// 	}
	// 	Backbone.Model.apply(this, arguments);
	// }
};

var BaseModel = {
	extend: function(proto, obj) {
		var constr, propName; //, propDef;
		for (propName in proto) {
			if (proto.hasOwnProperty(propName) && _.isObject(proto[propName])) { //(Object.getPrototypeOf(proto[propName]) === Object.prototype)) {
				proto[propName] = _.defaults(proto[propName], this.prototype[propName]);
				// console.log("BaseModel::extend '%s:%s' is Object\n%s", proto._domPrefix, propName, JSON.stringify(proto[propName]));
			}
		}

		// if (_.isObject(proto.properties)) {
		// 	if (Array.isArray(proto.getters)) {
		// 		proto.properties = _.omit(proto.properties, proto.getters);
		// 	}
		// }
		// if (proto.properties && this.prototype.properties) {
		// 	_.defaults(proto.properties, this.prototype.properties);
		// }

		constr = Backbone.Model.extend.apply(this, arguments);

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
		// if (Array.isArray(constr.prototype.properties)) {
		// }

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
 * @type {module:app/model/BaseModel}
 */
module.exports = Backbone.Model.extend.call(Backbone.Model, BaseModelProto, BaseModel);
// module.exports = Model.extend(BaseModelProto, BaseModel);