var getPrototypeChainValue = function (obj, prop, root) {
	var val, proto;
	proto = Object.getPrototypeOf(obj);
	root || (root = Object.prototype);
	if (proto !== root) {
		val = getPrototypeChainValue(proto, prop, root);
	}
	if (obj.hasOwnProperty(prop) && _.isObject(obj[prop])) {
		val = _.isObject(val)? _.extend(val, obj[prop]) : obj[prop];
	}
	return _.isObject(val)? val: void 0;
};
module.exports = getPrototypeChainValue;
