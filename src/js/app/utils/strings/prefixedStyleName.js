/*
 *
 */

var CSS_VENDOR_PREFIXES = ["", "-webkit-", "-moz-", "-ms-", "-o-"];

/** @type {module:app/utils/strings/camelToDashed} */
var camelToDashed = require("./camelToDashed");

var _cachedStyleNames = {};

/**
 * get the prefixed property
 * @param {Object} style
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
module.exports = function(style, property, mode) {
	var prefixed = null;
	var normalized = (property.indexOf("-") == -1)? camelToDashed(property): property;

	if (normalized in _cachedStyleNames) {
		prefixed = _cachedStyleNames[normalized];
	} else {
		for (var i = 0; i < CSS_VENDOR_PREFIXES.length; i++) {
			prefixed = CSS_VENDOR_PREFIXES[i] + normalized;
			if (prefixed in style) {
				console.log("Prefix: style name for '" + property + "' is '" + prop + "'");
				return _cachedStyleNames[normalized] = prefixed;
			}
		}

	}
	console.log("Prefix: style name for '" + property + "' not found");
	return _cachedStyleNames[normalized] = void 0;
	// console.warn("Prefix: style name for '" + property + (prefixed === null? "' not found" : "' is '" + prefixed + "'"));
	// return prefixed === null? void 0 : prefixed;
};
