/** @type {module:utils/prefixes} */
var prefixes = [""].concat(require("./prefixes"));

module.exports = function(name, obj, testProp) {
	for (var i = 0; i < prefixes.length; i++) {
		if (testProp) {
			if ((prefixes[i] + testProp) in obj) {
				console.log("Event '" + name + "' inferred as '"+ prefixes[i] + name +"' from property '" + testProp + "'");
				return prefixes[i] + name;
			}
		} else if (("on" + prefixes[i] + name) in obj) {
			console.log("Event '" + name + "' found as '"+ prefixes[i] + name +"'");
			return prefixes[i] + name;
		}
	}
	console.error("Event '" + name + "' not found");
	return null;
};
