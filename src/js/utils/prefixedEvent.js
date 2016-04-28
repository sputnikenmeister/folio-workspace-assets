/** @type {Array} lowercase prefixes */
var lcPrefixes = [""].concat(require("./prefixes"));

/** @type {Array} capitalized prefixes */
var ucPrefixes = lcPrefixes.map(function(s) {
	return (s === "") ? s : s.charAt(0).toUpperCase() + s.substr(1);
});

/** @type {Object} specific event solvers */
var _solvers = {};

/** @type {Object} cached values */
var _cache = {};

/**
 * @param {String} name Unprefixed event name
 * @param {?Object} obj Prefix test target
 * @param {?String} testProp Proxy property to test prefixes
 * @return {String|null}
 */
var _prefixedEvent = function(name, obj, testProp) {
	var prefixes = /^[A-Z]/.test(name) ? ucPrefixes : lcPrefixes;
	obj || (obj = document);
	for (var i = 0; i < prefixes.length; i++) {
		if (testProp) {
			if ((prefixes[i] + testProp) in obj) {
				return prefixes[i] + name;
			}
		}
		if (("on" + prefixes[i] + name) in obj) {
			return prefixes[i] + name;
		}
	}
	return null;
};

// transitionend
_solvers["transitionend"] = function() {
	var prop, style = document.body.style,
		map = {
			"transition": "transitionend",
			"WebkitTransition": "webkitTransitionEnd",
			"MozTransition": "transitionend",
			// "msTransition" : "MSTransitionEnd",
			"OTransition": "oTransitionEnd"
		};
	for (prop in map) {
		if (prop in style) {
			return map[prop];
		}
	}
	return null;
};

/**
 * get the prefixed property
 * @param {String} property name
 * @param {Object} look-up object
 * @returns {String|null} prefixed
 */
module.exports = function(evName) {
	if (!_cache.hasOwnProperty(evName)) {
		_cache[evName] = _solvers.hasOwnProperty(evName) ? _solvers[evName]() : _prefixedEvent.apply(null, arguments);
		if (_cache[evName] === null) {
			console.warn("Event '%s' not found", evName);
		} else {
			console.log("Event '%s' found as '%s'", evName, _cache[evName]);
		}
	}
	return _cache[evName];
	// return _cache[evName] || (_cache[evName] = _solvers[evName]? _solvers[evName].call() : _prefixedProperty.apply(null, arguments));
};

/*
var defaultTest = function(name, obj) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	for (var i = 0; i < prefixes.length; i++) {
		if (("on" + prefixes[i] + name) in obj) {
			console.log("Event '%s' found as '%s'", name, prefixes[i] + name);
			return prefixes[i] + name;
		}
	}
	return null;
};

var proxyTest = function(name, obj, testProp) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	for (var i = 0; i < prefixes.length; i++) {
		if ((prefixes[i] + testProp) in obj) {
			console.log("Event %s inferred as '%s' from property '%s'", name, prefixes[i] + name, testProp);
			return prefixes[i] + name;
		}
	}
	return null;
};
*/
