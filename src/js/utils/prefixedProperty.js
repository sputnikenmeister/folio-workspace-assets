// var PREFIXES = ["webkit", "moz", "MS", "ms", "o"];
// var PREFIXES_NUM = PREFIXES.length;
/** @type {module:utils/prefixes} */
var prefixes = require("./prefixes");

var _prefixedProperty = function(prop, obj) {
	var prefixedProp, camelProp;
	obj || (obj = document.body.style);
	
	if (prop in obj) {
		return prop;
	}
	camelProp = prop[0].toUpperCase() + prop.slice(1);
	for (var i = 0; i < prefixes.length; i++) {
		prefixedProp = prefixes[i] + camelProp;
		if (prefixedProp in obj) {
			return prefixedProp;
		}
	}
	console.error("Property '" + prop + "' not found");
	return null;
};

/* cached values */
var _cache = {};

/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} look-up style object
 * @returns {String|Undefined} prefixed
 */
module.exports = function (prop, obj) {
	if (_cache[prop] === void 0) {
		_cache[prop] = _prefixedProperty(prop, obj);
		console.log("Property '" + prop + "' found as '" + _cache[prop] + "'");
	}
	return _cache[prop];
};
