/*
 *
 */

/** @type {module:app/utils/strings/camelToDashed} */
var camelToDashed = require("../strings/camelToDashed");

var CSS_VENDOR_PREFIXES = ["", "-webkit-", "-moz-", "-ms-", "-o-"];

/**
 * get the prefixed property
 * @param {Object} style
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
module.exports = function(style, property) {
	var prefixed;
	var normalized = (property.indexOf("-") == -1)? camelToDashed(property): property;

	for (var i = 0; i < CSS_VENDOR_PREFIXES.length; i++) {
		prefixed = CSS_VENDOR_PREFIXES[i] + normalized;
		if (prefixed in style) {
			console.log("Prefix: style name for '" + property + "' is '" + prop + "'");
			return prefixed;
		}
	}
	console.log("Prefix: style name for '" + property + "' not found");
	return void 0;
};
