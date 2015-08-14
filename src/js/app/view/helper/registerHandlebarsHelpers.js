// var Handlebars = require("handlebars")["default"];
var Handlebars = require("hbsfy/runtime");
var Globals = require("../../control/Globals");

// The module to be exported
var helpers = {
	add: function(value, addition) {
		return value + addition;
	},
	subtract: function(value, substraction) {
		return value - substraction;
	},
	divide: function(value, divisor) {
		return value / divisor;
	},
	multiply: function(value, multiplier) {
		return value * multiplier;
	},
	floor: function(value) {
		return Math.floor(value);
	},
	ceil: function(value) {
		return Math.ceil(value);
	},
	round: function(value) {
		return Math.round(value);
	},
	global: function(value) {
		return Globals[value];
	},
};

module.exports = (function() {
	for (var helper in helpers) {
		if (helpers.hasOwnProperty(helper)) {
			Handlebars.registerHelper(helper, helpers[helper]);
		}
	}
})();

// module.exports = null;
