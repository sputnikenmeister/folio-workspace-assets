
/** @type {module:underscore} */
var _ = require("underscore");

var getPrototypeChainValue = function (obj, propName, root) {
	var objVal, protoVal, proto;
	
	proto = Object.getPrototypeOf(obj);
	root || (root = Object.prototype);
	
	if (proto && proto !== root) {
		protoVal = getPrototypeChainValue(proto, propName, root);
	}
	if (obj.hasOwnProperty(propName)) {
		objVal = obj[propName];
	}
	if (_.isObject(objVal) && _.isObject(protoVal)) {
		return _.defaults(objVal, protoVal);
	}
	return objVal || protoVal;
};
module.exports = getPrototypeChainValue;
