/** @type {module:utils/prefixes} */
var prefixes = [""].concat(require("./prefixes"));

module.exports = function(name, obj) {
	for (var i = 0; i < prefixes.length; i++) {
		if (("on" + prefixes[i] + name) in obj){
			return prefixes[i] + name;
		}
	}
	return null;
};
