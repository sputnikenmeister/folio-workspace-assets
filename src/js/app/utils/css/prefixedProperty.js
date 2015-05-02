var VENDOR_PREFIXES = ["", "webkit", "moz", "MS", "ms", "o"];

/**
 * get the prefixed property
 * @param {Object} style
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
module.exports = function(style, property) {
	var prefix, prop;
	var camelProp = property[0].toUpperCase() + property.slice(1);

	for (var i = 0; i < VENDOR_PREFIXES.length; i++) {
		prefix = VENDOR_PREFIXES[i];
		prop = (prefix) ? prefix + camelProp : property;

		if (prop in style) {
			console.log("Prefixed property '" + property + "' is '" + prop + "'");
			return prop;
		}
	}
	console.log("Prefixed property '" + property + "' not found");
	return void 0;
};
