// var Handlebars = require("handlebars")["default"];
const Handlebars = require("hbsfy/runtime");
/** @type {Function} */
const Color = require("color");
/** @type {module:app/control/Globals} */
const Globals = require("app/control/Globals");

// (function() {
var helpers = {
	/*
	/* Arithmetic helpers
	/*/
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

	/*
	/* Flow control helpers
	/*/
	is: function(a, b, opts) {
		return (a === b) ? opts.fn(this) : opts.inverse(this);
	},
	isnot: function(a, b, opts) {
		return (a !== b) ? opts.fn(this) : opts.inverse(this);
	},
	isany: function(value) {
		var i = 0,
			ii = arguments.length - 2,
			opts = arguments[ii + 1];
		do
			if (value === arguments[++i]) {
				return opts.fn(this);
			}
		while (i < ii);
		return opts.inverse(this);
	},
	contains: function(a, b, opts) {
		return (a.indexOf(b) !== -1) ? opts.fn(this) : opts.inverse(this);
	},
	ignore: function() {
		return "";
	},

	/*
	/* Color helpers
	/*/
	mix: function(colora, colorb, amount) {
		return new Color(colora).mix(new Color(colorb), amount).rgb().string();
	},
	lighten: function(color, amount) {
		return new Color(color).lighten(amount).rgb().string();
	},
	darken: function(color, amount) {
		return new Color(color).darken(amount).rgb().string();
	},
	// colorFormat: function(color, fmt) {
	// 	switch (fmt) {
	// 		case "rgb":
	// 			return new Color(color).rgb().string();
	// 		case "hsl":
	// 			return new Color(color).hsl().string();
	// 		case "hex": default:
	// 			return new Color(color).hex().string();
	// 	}
	// },
};
for (var helper in helpers) {
	if (helpers.hasOwnProperty(helper)) {
		Handlebars.registerHelper(helper, helpers[helper]);
	}
}
// })();

// module.exports = Handlebars;
