/** @type {module:utils/prefixes} */
var lcPrefixes = [""].concat(require("./prefixes"));
var ucPrefixes = [""].concat(require("./prefixes").map(function(s){
	return s.charAt(0).toUpperCase() + s.substr(1);
}));

/**
* @param {String} name Unprefixed event name
* @param {?Object} obj Prefix test target
* @param {?String} testProp Proxy property to test prefixes
* @return {String|null}
*/
module.exports = function(name, obj, testProp) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	obj || (obj = document);
	for (var i = 0; i < prefixes.length; i++) {
		if (testProp) {
			if ((prefixes[i] + testProp) in obj) {
				console.log("Event %s inferred as '%s' from property '%s'", name, prefixes[i] + name, testProp);
				return prefixes[i] + name;
			}
		}
		if (("on" + prefixes[i] + name) in obj) {
			console.log("Event '%s' found as '%s'", name, prefixes[i] + name);
			return prefixes[i] + name;
		}
	}
	console.warn("Event '%s' not found", name);
	return null;
};

/*
var tests = {
	"transitionend" : function (style) {
		style || (style = document.body.style);
		var prop, map = {
			"transition" : "transitionend",
			"WebkitTransition" : "webkitTransitionEnd",
			"MozTransition" : "transitionend",
			// "msTransition" : "MSTransitionEnd",
			"OTransition" : "oTransitionEnd"
		};
		for (prop in map) {
			if (prop in style) {
				return map[prop];
			}
		}
	}
};

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

var propTest = function(name, obj, testProp) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	for (var i = 0; i < prefixes.length; i++) {
		if ((prefixes[i] + testProp) in obj) {
			console.log("Event %s inferred as '%s' from property '%s'", name, prefixes[i] + name, testProp);
			return prefixes[i] + name;
		}
	}
	return null;
};

module.exports = function(name, obj, testProp) {
	if (name in tests) {
		return tests[name]();
	}
	obj || (obj = document);
	if (testProp) {
		return propTest(name, obj, testProp);
	}
	return defaultTest(name, obj);
	
	console.warn("Event '%s' not found", name);
	return null;
};
*/
