var PREFIXES = ["webkit", "moz", "MS", "ms", "o"];
var PREFIXES_NUM = PREFIXES.length;

var _prefixedProperty = function(prop, styleObj) {
	var prefixedProp, camelProp;
	styleObj || (styleObj = document.body.style);
	
	if (prop in styleObj) {
		return prop;
	}
	camelProp = prop[0].toUpperCase() + prop.slice(1);
	for (var i = 0; i < PREFIXES_NUM; i++) {
		prefixedProp = PREFIXES[i] + camelProp;
		if (prefixedProp in styleObj) {
			return prefixedProp;
		}
	}
	console.error("CSS property '" + prop + "' not found");
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
module.exports = function (prop, styleObj) {
	if (!_cache.hasOwnProperty(prop)) {
		_cache[prop] = _prefixedProperty(prop, styleObj);
		console.log("CSS property '" + prop + "' found as '" + _cache[prop] + "'");
	}
	return _cache[prop];
};
