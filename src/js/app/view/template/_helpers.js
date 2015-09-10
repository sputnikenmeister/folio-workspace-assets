// var Handlebars = require("handlebars")["default"];
var Handlebars = require("hbsfy/runtime");
/** @type {Function} */
var Color = require("color");
/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");

// (function() {
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
		is: function(a, b, opts) {
			return (a === b)? opts.fn(this) : opts.inverse(this);
		},
		isnot: function(a, b, opts) {
			return (a !== b)? opts.fn(this) : opts.inverse(this);
		},
		isany: function(value) {
			var i = 0, ii = arguments.length - 2, opts = arguments[ii+1];
			do if (value === arguments[++i]) {
				return opts.fn(this);
			} while (i < ii);
			return opts.inverse(this);
		},
		contains: function(a, b, opts) {
			return (a.indexOf(b) !== -1)? opts.fn(this) : opts.inverse(this);
		},
	};
	for (var helper in helpers) {
		if (helpers.hasOwnProperty(helper)) {
			Handlebars.registerHelper(helper, helpers[helper]);
		}
	}
// })();

// module.exports = Handlebars;
