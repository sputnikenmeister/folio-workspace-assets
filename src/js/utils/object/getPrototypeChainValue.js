
/** @type {module:underscore} */
var _ = require("underscore");

var getPrototypeChainValue = function (obj, prop, root) {
	var objVal, protoVal, proto;
	
	proto = Object.getPrototypeOf(obj);
	root || (root = Object.prototype);
	
	if (proto && proto !== root) {
		protoVal = getPrototypeChainValue(proto, prop, root);
	}
	
	if (obj.hasOwnProperty(prop)) {
		objVal = obj[prop];
	}
	
	if (_.isObject(objVal) && _.isObject(protoVal)) {
		return _.defaults(objVal, protoVal);
	}
	
	return objVal || protoVal;
	
	// if (obj.hasOwnProperty(prop)) {
	// 	if (_.isObject(objVal) && _.isObject(protoVal)) {
	// 		return _.defaults(objVal, protoVal)
	// 	} else {
	// 		// only merging objects
	// 		return objVal;
	// 	}
	// 	// val = _.isObject(protoVal)? _.extend(val, obj[prop]) : obj[prop];
	// 	// val = _.isObject(val)? _.extend(obj[prop] || {}, val) : obj[prop];
	// } else {
	// 	return protoVal;
	// }
	//// return _.isObject(val)? val: void 0;
};
module.exports = getPrototypeChainValue;
