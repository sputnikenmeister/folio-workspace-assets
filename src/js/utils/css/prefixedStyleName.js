/** @type {module:utils/strings/camelToDashed} */
var camelToDashed = require("../strings/camelToDashed");

// /** @type {module:utils/css/prefixedProperty} */
// var prefixedProperty = require("./prefixedProperty");
// /** @type {module:utils/strings/dashedToCamel} */
// var dashedToCamel = require("../strings/dashedToCamel");
// 
// var _prefixedStyleName_reverse = function (style, styleObj) {
// 	var camelProp, prefixedProp;
// 	camelProp = dashedToCamel(style);
// 	prefixedProp = prefixedProperty(camelProp, styleObj);
// 	return prefixedProp? (camelProp === prefixedProp? "" : "-") + camelToDashed(prefixedProp) : null;
// };

var PREFIXES = ["-webkit-", "-moz-", "-ms-", "-o-"];
var PREFIXES_NUM = PREFIXES.length;

var _prefixedStyleName = function(style, styleObj) {
	var prefixedStyle;
	var normStyle = style.indexOf("-")? camelToDashed(style) : style;
	styleObj || (styleObj = document.body.style);
	
	if (normStyle in styleObj) {
		return normStyle;
	}
	for (var i = 0; i < PREFIXES_NUM; i++) {
		prefixedStyle = PREFIXES[i] + normStyle;
		if (prefixedStyle in styleObj) {
			// console.log("CSS style '" + style + "' found as '" + prefixedStyle + "'");
			return prefixedStyle;
		}
	}
	console.error("CSS style '" + style + "' not found");
	return null;
};

/* cached values */
var _cache = {};

/**
 * get the prefixed style name
 * @param {String} style name
 * @param {Object} look-up style object
 * @returns {String|Undefined} prefixed
 */
module.exports = function (style, styleObj) {
	if (!_cache.hasOwnProperty(style)) {
		_cache[style] = _prefixedStyleName(style, styleObj);
		console.log("CSS style '" + style + "' found as '" + _cache[style] + "'");
	}
	return _cache[style];
};
