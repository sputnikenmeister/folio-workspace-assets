/**
/* @module app/control/Globals
/*/
/** @type {module:underscore} */
var _ = require("underscore");

module.exports = (function () {
	// reusable vars
	var o, s;
	// global hash
	var g = {};
	// SASS <--> JS shared hash
	var sass = require("../../../sass/variables.json");
	
	// JUNK FIRST: Some app-wide defaults
	// - - - - - - - - - - - - - - - - -
	g.VPAN_DRAG				= 0.95; // as factor of pointer delta
	g.HPAN_OUT_DRAG			= 0.4; // factor
	g.VPAN_OUT_DRAG			= 0.1; // factor
	g.PAN_THRESHOLD			= 15; // px
	g.COLLAPSE_THRESHOLD	= 75; // px
	g.COLLAPSE_OFFSET		= parseInt(sass.temp["collapse_offset"]);
	
	// breakpoints
	// - - - - - - - - - - - - - - - - -
	g.BREAKPOINTS = {};
	for (s in sass.breakpoints) {
		g.BREAKPOINTS[s] = window.matchMedia(sass.breakpoints[s]);
	}
	
	// base colors, dimensions
	// - - - - - - - - - - - - - - - - -
	g.DEFAULT_COLORS			=	_.clone(sass.default_colors);
	g.HORIZONTAL_STEP			=	parseFloat(sass.units["hu_px"]);
	g.VERTICAL_STEP				=	parseFloat(sass.units["vu_px"]);
	
	// timing, easing
	// - - - - - - - - - - - - - - - - -
	g.TRANSITION_DELAY_INTERVAL	=	parseFloat(sass.transitions["delay_interval_ms"]);
	g.TRANSITION_DURATION		=	parseFloat(sass.transitions["duration_ms"]);
	g.TRANSITION_MIN_DELAY		=	parseFloat(sass.transitions["min_delay_ms"]);
	g.TRANSITION_EASE			=	sass.transitions["ease"];
	g.TRANSITION_DELAY			=	g.TRANSITION_DURATION + g.TRANSITION_DELAY_INTERVAL;
	
	// paths, networking
	// - - - - - - - - - - - - - - - - -
	g.APP_ROOT		=	window.approot;
	g.MEDIA_DIR		=	window.mediadir;
	
	delete window.approot;
	delete window.mediadir;
	
	// hardcoded font data
	// - - - - - - - - - - - - - - - - -
	g.FONT_METRICS = {
		"Franklin Gothic FS" : {
			"unitsPerEm": 1000,
			"ascent": 827,
			"descent": -173
		},
		"ITCFranklinGothicStd" : {
			"unitsPerEm": 1000,
			"ascent": 686,
			"descent": -314
		},
		"FolioFigures": {
			"unitsPerEm": 1024,
			"ascent": 939,
			"descent": -256
		},
	};
	
	g.PAUSE_CHAR = String.fromCharCode(0x23F8);
	g.PLAY_CHAR = String.fromCharCode(0x23F5);
	g.STOP_CHAR = String.fromCharCode(0x23F9);
	
	// css transition presets
	// TODO: get rid of this
	// - - - - - - - - - - - - - - - - -
	
	o = {};
	
	o.NONE = {
		easing: "step-start",
		duration: 0,
		delay: 0,
	};
	o.NOW = {
		easing: g.TRANSITION_EASE,
		duration: g.TRANSITION_DURATION,
		delay: 0,
	};
	o.UNSET = _.defaults({ cssText: "" }, o.NONE);
	
	o.FIRST = {
		easing: g.TRANSITION_EASE,
		duration: g.TRANSITION_DURATION - g.TRANSITION_MIN_DELAY,
		delay: g.TRANSITION_DELAY * 0 + g.TRANSITION_MIN_DELAY,
	};
	o.BETWEEN = _.defaults({
		delay: g.TRANSITION_DELAY * 1 + g.TRANSITION_MIN_DELAY
	}, o.FIRST);
	o.LAST = _.defaults({
		delay: g.TRANSITION_DELAY * 2 + g.TRANSITION_MIN_DELAY
	}, o.FIRST);
	o.AFTER = _.defaults({
		delay: g.TRANSITION_DELAY * 2 + g.TRANSITION_MIN_DELAY
	}, o.FIRST);
	
	// var easing = "ease-in";
	// o.FIRST_LINEAR = _.defaults({ easing: easing }, o.FIRST);
	// o.BETWEEN_LINEAR = _.defaults({ easing: easing }, o.BETWEEN);
	// o.LAST_LINEAR = _.defaults({ easing: easing }, o.LAST);
	
	var so, transToCSS = function(o) {
		return o.duration/1000 + "s " + o.easing + " " + o.delay/1000 + "s";
	};
	for (s in o) {
		so = o[s];
		so.name = s;
		so.className = "tx-" + s.toLowerCase();
		if (!so.hasOwnProperty("cssText")) {
			so.cssText = transToCSS(so);
		}
	}
	g.transitions = o;
	
	return g;
}());
