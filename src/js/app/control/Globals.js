/**
/* @module app/control/Globals
/*/
/** @type {module:underscore} */
var _ = require("underscore");

module.exports = (function () {
	// reusable vars
	var o, s, so;
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
	
	// timing, easing
	// - - - - - - - - - - - - - - - - -
	g.TRANSITION_DELAY_INTERVAL	=	parseFloat(sass.transitions["delay_interval_ms"]);
	g.TRANSITION_DURATION		=	parseFloat(sass.transitions["duration_ms"]);
	g.TRANSITION_MIN_DELAY		=	parseFloat(sass.transitions["min_delay_ms"]);
	g.TRANSITION_EASE			=	sass.transitions["ease"];
	g.TRANSITION_DELAY			=	g.TRANSITION_DURATION + g.TRANSITION_DELAY_INTERVAL;
	
	// css transition presets
	// TODO: get rid of this
	// - - - - - - - - - - - - - - - - -
	var txDur = g.TRANSITION_DURATION,
		txDelay = g.TRANSITION_DELAY,
		txIntDelay = g.TRANSITION_DELAY_INTERVAL,
		txMinDelay = g.TRANSITION_MIN_DELAY;
	
	o = {};
	
	o.NONE = 	{ delay: 0, duration: 0, easing: "step-start" };
	o.NOW = 	{ delay: 0, duration: txDur, easing: g.TRANSITION_EASE };
	o.UNSET = 	_.defaults({ cssText: "" }, o.NONE);
	
	var txAligned = 	_.defaults({duration: txDur - txMinDelay}, o.NOW);
	o.FIRST = 			_.defaults({delay: txDelay*0.0 + txMinDelay}, txAligned);
	o.BETWEEN = 		_.defaults({delay: txDelay*1.0 + txMinDelay}, txAligned);
	o.LAST = 			_.defaults({delay: txDelay*2.0 + txMinDelay}, txAligned);
	o.AFTER = 			_.defaults({delay: txDelay*2.0 + txMinDelay}, txAligned);
	
	o.BETWEEN_EARLY = 		_.defaults({delay: txDelay*1 + txMinDelay - 60}, txAligned);
	o.BETWEEN_LATE = 		_.defaults({delay: txDelay*1 + txMinDelay + 60}, txAligned);
	
	o.FIRST_LATE = 		_.defaults({delay: txDelay*0.5 + txMinDelay}, txAligned);
	o.LAST_EARLY = 		_.defaults({delay: txDelay*1.5 + txMinDelay}, txAligned);
	// o.FIRST_LATE = 		_.defaults({delay: txDelay*0.0 + txMinDelay*2}, txAligned);
	// o.LAST_EARLY = 		_.defaults({delay: txDelay*2.0 + txMinDelay*0}, txAligned);
	// o.AFTER = 			_.defaults({delay: txDelay*2.0 + txMinDelay}, txAligned);
	
	for (s in o) {
		so = o[s];
		so.name = s;
		so.className = "tx-" + s.replace("_", "-").toLowerCase();
		if (!so.hasOwnProperty("cssText")) {
			so.cssText = so.duration/1000 + "s " + so.easing + " " + so.delay/1000 + "s";
		}
	}
	g.transitions = o;
	
	return g;
}());
