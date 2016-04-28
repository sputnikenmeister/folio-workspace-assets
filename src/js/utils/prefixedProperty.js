/**
/* @module utils/prefixedProperty
/*/

/** @type {module:utils/prefixes} */
var prefixes = require("./prefixes");
/** @type {Number} prefix count */
var _prefixNum = prefixes.length;
/** @type {Array} cached values */
var _cache = {};

var _prefixedProperty = function(prop, obj) {
	var prefixedProp, camelProp;

	if (prop in obj) {
		console.log("Property '%s' found unprefixed", prop);
		return prop;
	}
	camelProp = prop[0].toUpperCase() + prop.slice(1);
	for (var i = 0; i < _prefixNum; i++) {
		prefixedProp = prefixes[i] + camelProp;
		if (prefixedProp in obj) {
			console.log("Property '%s' found as '%s'", prop, prefixedProp);
			return prefixedProp;
		}
	}
	console.error("Property '%s' not found", prop);
	return null;
};

/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} look-up object
 * @returns {String|null} prefixed
 */
module.exports = function(prop, obj) {
	return _cache[prop] || (_cache[prop] = _prefixedProperty(prop, obj || document.body.style));
};
