/**
/* @module utils/prefixedStyleName
/*/

/** @type {module:utils/prefixes} */
var prefixes = require("./prefixes");//.map(function(prefix) { return "-" + prefix + "-"; });
/** @type {Number} prefix count */
var _prefixNum = prefixes.length;
/** @type {Array} cached values */
var _cache = {};

var _prefixedStyleName = function(style, styleObj) {
	var prefixedStyle;
	
	if (style in styleObj) {
		console.log("CSS style '%s' found unprefixed", style);
		return style;
	}
	for (var i = 0; i < _prefixNum; i++) {
		prefixedStyle = "-" + prefixes[i] + "-" + style;
		// prefixedStyle = prefixes[i] + style;
		if (prefixedStyle in styleObj) {
			console.log("CSS style '%s' found as '%s'", style, prefixedStyle);
			return prefixedStyle;
		}
	}
	console.warn("CSS style '%s' not found", style);
	return null;
};

/**
 * get the prefixed style name
 * @param {String} style name
 * @param {Object} look-up style object
 * @returns {String|Undefined} prefixed
 */
module.exports = function (style, styleObj) {
	// return _cache[style] || (_cache[style] = _prefixedStyleName_reverse(style, styleObj || document.body.style));
	return _cache[style] || (_cache[style] = _prefixedStyleName(style, styleObj || document.body.style));
};

// /** @type {module:utils/strings/camelToDashed} */
// var camelToDashed = require("./strings/camelToDashed");
// /** @type {module:utils/prefixedProperty} */
// var prefixedProperty = require("./prefixedProperty");
// /** @type {module:utils/strings/dashedToCamel} */
// var dashedToCamel = require("./strings/dashedToCamel");
//
// var _prefixedStyleName_reverse = function (style, styleObj) {
// 	var camelProp, prefixedProp;
// 	camelProp = dashedToCamel(style);
// 	prefixedProp = prefixedProperty(camelProp, styleObj);
// 	return prefixedProp? (camelProp === prefixedProp? "" : "-") + camelToDashed(prefixedProp) : null;
// };
