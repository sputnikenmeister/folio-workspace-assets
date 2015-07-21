var PREFIXES = ["webkit", "moz", "MS", "ms", "o"];
var PREFIXES_NUM = PREFIXES.length;

/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} style
 * @returns {String|Undefined} prefixed
 */
module.exports = function(prop, style) {
	var prefixedProp, camelProp;
	
	style || (style = document.body.style);
	if (prop in style) {
		return prop;
	}
	camelProp = prop[0].toUpperCase() + prop.slice(1);
	for (var i = 0; i < PREFIXES_NUM; i++) {
		prefixedProp = PREFIXES[i] + camelProp;
		if (prefixedProp in style) {
			console.log("CSS property '" + prop + "' found as '" + prefixedProp + "'");
			return prefixedProp;
		}
	}
	console.error("CSS property '" + prop + "' not found");
	return void 0;
};
