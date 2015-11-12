/**
 * @module app/control/Globals
 */
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
	g.H_PANOUT_DRAG			= 0.4; // factor
	g.V_PANOUT_DRAG			= 0.1; // factor
	g.PAN_THRESHOLD			= 15; // px
	g.COLLAPSE_THRESHOLD	= 75; // px
	
	// breakpoints
	// - - - - - - - - - - - - - - - - -
	g.BREAKPOINTS = {};
	for (var b in sass.breakpoints) {
		// NOTE: breakpoints have to be enclosed in quotes for the sass-json-vars
		// compass plug-in to work as expected, but hey have to be removed
		g.BREAKPOINTS[b] = sass.breakpoints[b].slice(1, -1); // remove first and last char
	}
	
	// base colors, dimensions
	// - - - - - - - - - - - - - - - - -
	g.DEFAULT_COLORS			=	_.clone(sass.default_colors);
	g.HORIZONTAL_STEP			=	parseFloat(sass.units["hu_px"]);
	g.VERTICAL_STEP				=	parseFloat(sass.units["vu_px"]);
	
	// timing, easing
	// - - - - - - - - - - - - - - - - -
	g.TRANSITION_GAP			=	parseFloat(sass.transitions["delay_interval_ms"]);
	g.TRANSITION_DURATION		=	parseFloat(sass.transitions["duration_ms"]);
	g.TRANSITION_EASE			=	sass.transitions["ease"];
	
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
		"FolioFigures-Regular": {
			"unitsPerEm": 1024,
			"ascent": 939,
			"descent": -256
		},
		// "FolioClaimcheck-Figures": {
		// 	"unitsPerEm": 1024,
		// 	"ascent": 939,
		// 	"descent": -256
		// },
	};
	
	// o = g.FONT_METRICS["FolioClaimcheck-Figures"];
	// g.FONT_METRICS["Numbers"] = o;
	// g.FONT_METRICS["NumbersClaimcheck"] = o;
	// g.FONT_METRICS["NumbersGreenback"] = o;
	// g.FONT_METRICS["NumbersIndicia"] = o;
	// g.FONT_METRICS["NumbersPremium"] = o;
	// g.FONT_METRICS["NumbersRedbird"] = o;
	// g.FONT_METRICS["NumbersRevenue"] = o;
	// o = g.FONT_METRICS["ITCFranklinGothicStd"];
	// g.FONT_METRICS["ITCFranklinGothicStd-Condensed"];
	// g.FONT_METRICS["ITCFranklinGothicStd-Compressed"];
	// g.FONT_METRICS["ITCFranklinGothicStd-ExtraCompressed"];
	
	// css transition presets
	// TODO: get rid of this
	// - - - - - - - - - - - - - - - - -
	
	g.NO_DELAY	 				=	0;
	g.TRANSITION_DELAY			=	(g.TRANSITION_DURATION + g.TRANSITION_GAP);
	g.EXITING_DELAY 			=	g.TRANSITION_DELAY * 0 + 1;
	g.CHANGING_DELAY 			=	g.TRANSITION_DELAY * 1 + 1;
	g.ENTERING_DELAY 			=	g.TRANSITION_DELAY * 2 + 1;
	
	/* Removing the gap would be more accutrate, but best to leave it for safety */
	//g.TRANSITION_END_TIMEOUT	=	(g.TRANSITION_DELAY) * 3 - g.TRANSITION_GAP;
	g.TRANSITION_END_TIMEOUT	=	(g.TRANSITION_DELAY) * 3;

	var transitionTemplate = function(o) {
		return o.duration/1000 + "s " + o.easing + " " + o.delay/1000 + "s";
	};
	
	o = {};
	o.easing = g.TRANSITION_EASE;
	o.duration = g.TRANSITION_DURATION - 1;
	
	g.TRANSIT_ENTERING = _.clone(o);
	g.TRANSIT_ENTERING.delay = g.ENTERING_DELAY;
	g.TRANSIT_ENTERING.className = "transform-entering";
	g.TRANSIT_ENTERING.cssText = transitionTemplate(g.TRANSIT_ENTERING);
	
	g.TRANSIT_EXITING = _.clone(o);
	g.TRANSIT_EXITING.delay = g.EXITING_DELAY;
	g.TRANSIT_EXITING.className = "transform-exiting";
	g.TRANSIT_EXITING.cssText = transitionTemplate(g.TRANSIT_EXITING);
	
	g.TRANSIT_IMMEDIATE = _.clone(o);
	g.TRANSIT_IMMEDIATE.delay = g.NO_DELAY;
	g.TRANSIT_IMMEDIATE.duration = g.TRANSITION_DURATION;
	g.TRANSIT_IMMEDIATE.className = "transform-immediate";
	g.TRANSIT_IMMEDIATE.cssText = transitionTemplate(g.TRANSIT_IMMEDIATE);
	
	g.TRANSIT_CHANGING = _.clone(o);
	g.TRANSIT_CHANGING.delay = g.CHANGING_DELAY;
	g.TRANSIT_CHANGING.className = "transform-changing";
	g.TRANSIT_CHANGING.cssText = transitionTemplate(g.TRANSIT_CHANGING);
	
	g.TRANSIT_PARENT = _.clone(g.TRANSIT_CHANGING);
	// g.TRANSIT_PARENT.delay = g.CHANGING_DELAY;
	// g.TRANSIT_PARENT.className = "transform-changing";
	g.TRANSIT_ENTERING.cssText = transitionTemplate(g.TRANSIT_ENTERING);
	
	// Symphony CMS jit-image url templates
	// TODO: get rid of this
	// - - - - - - - - - - - - - - - - -
	g.IMAGE_URL_TEMPLATES = {
		"original" :
			_.template(g.MEDIA_DIR + "/<%= src %>"),
		"constrain-width" :
			_.template(g.APP_ROOT + "image/1/<%= width %>/0/uploads/<%= src %>"),
		"constrain-height" :
			_.template(g.APP_ROOT + "image/1/0/<%= height %>/uploads/<%= src %>")
	};
	
	return g;
}());
