/** @type {module:utils/prefixes} */
var lcPrefixes = [""].concat(require("./prefixes"));
var ucPrefixes = [""].concat(require("./prefixes").map(function(s){
	return s.charAt(0).toUpperCase() + s.substr(1);
}));

module.exports = function(name, obj, testProp) {
	var prefixes = /^[A-Z]/.test(name)? ucPrefixes : lcPrefixes;
	obj || (obj = document);
	for (var i = 0; i < prefixes.length; i++) {
		if (testProp) {
			if ((prefixes[i] + testProp) in obj) {
				console.log("Event %s inferred as %s from property %s", name, prefixes[i] + name, testProp);
				return prefixes[i] + name;
			}
		}
		if (("on" + prefixes[i] + name) in obj) {
			console.log("Event %s found as %s", name, prefixes[i] + name);
			return prefixes[i] + name;
		}
	}
	console.warn("Event %s not found", name);
	return null;
};
