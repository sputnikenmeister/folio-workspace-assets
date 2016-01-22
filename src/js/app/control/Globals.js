/**
/* @module app/control/Globals
/*/
/** @type {module:underscore} */
var _ = require("underscore");

module.exports = (function () {
	// reusable var
	var o; 
	// SASS <--> JS shared hash
	var sass = require("../../../sass/variables.json");
	// global hash
	var g = {};
	
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
	for (var b in sass.breakpoints) {
		// NOTE: breakpoints have to be enclosed in quotes for the sass-json-vars
		// compass plug-in to work as expected, but hey have to be removed
		// g.BREAKPOINTS[b] = sass.breakpoints[b];//.slice(1, -1); // remove first and last char
		g.BREAKPOINTS[b] = window.matchMedia(sass.breakpoints[b]);
	}
	
	// base colors, dimensions
	// - - - - - - - - - - - - - - - - -
	g.DEFAULT_COLORS			=	_.clone(sass.default_colors);
	g.HORIZONTAL_STEP			=	parseFloat(sass.units["hu_px"]);
	g.VERTICAL_STEP				=	parseFloat(sass.units["vu_px"]);
	
	// timing, easing
	// - - - - - - - - - - - - - - - - -
	g.TRANSITION_DELAY_INTERVAL			=	parseFloat(sass.transitions["delay_interval_ms"]);
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

	var transitionTemplate = function(o) {
		return o.duration/1000 + "s " + o.easing + " " + o.delay/1000 + "s";
	};
	
	g.transitions = {};
	
	o = g.transitions.FIRST = {};
	o.className = "tx-first";
	o.easing = g.TRANSITION_EASE;
	o.duration = g.TRANSITION_DURATION - g.TRANSITION_MIN_DELAY;
	o.delay = g.TRANSITION_DELAY * 0 + g.TRANSITION_MIN_DELAY;
	o.cssText = transitionTemplate(o);
	
	o = g.transitions.BETWEEN = _.clone(o);
	o.className = "tx-between";
	o.delay = g.TRANSITION_DELAY * 1 + g.TRANSITION_MIN_DELAY;
	o.cssText = transitionTemplate(o);
	
	o = g.transitions.LAST = _.clone(o);
	o.className = "tx-last";
	o.delay = g.TRANSITION_DELAY * 2 + g.TRANSITION_MIN_DELAY;
	o.cssText = transitionTemplate(o);
	
	o = g.transitions.AFTER = _.clone(o);
	o.className = "tx-after";
	o.delay = g.TRANSITION_DELAY * 2 + g.TRANSITION_MIN_DELAY;
	o.cssText = transitionTemplate(o);
	
	o = g.transitions.NOW = _.clone(o);
	o.className = "tx-now";
	o.duration = g.TRANSITION_DURATION;
	o.delay = 0;
	o.cssText = transitionTemplate(o);
	
	return g;
}());
