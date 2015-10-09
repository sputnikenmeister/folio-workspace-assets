/**
 * @module app/control/Globals
 */
/** @type {module:underscore} */
var _ = require("underscore");

var transitionTemplate = function(o) {
	return o.duration/1000 + "s " + o.easing + " " + o.delay/1000 + "s";
};

module.exports = (function () {
	var g = {};
	var sass = require("../../../sass/variables.json"); // SASS <--> JS shared hash
	var o; // reusable var
	
	o = {};
	for (var b in sass.breakpoints) {
		// NOTE: breakpoints have to be enclosed in quotes for the sass-json-vars
		// compass plug-in to work as expected, but hey have to be removed
		o[b] = sass.breakpoints[b].slice(1, -1); // remove first and last char
	}
	g.BREAKPOINTS = o;
	
	g.DEFAULT_COLORS = _.clone(sass.default_colors);
	
	g.HORIZONTAL_STEP			=	parseFloat(sass.units["hu_px"]);
	g.VERTICAL_STEP				=	parseFloat(sass.units["vu_px"]);
	
	g.TRANSITION_GAP			=	parseFloat(sass.transitions["delay_interval_ms"]);
	g.TRANSITION_DURATION		=	parseFloat(sass.transitions["duration_ms"]);
	g.TRANSITION_EASE			=	sass.transitions["ease"];
	
	g.NO_DELAY	 				=	0;
	g.TRANSITION_DELAY			=	(g.TRANSITION_DURATION + g.TRANSITION_GAP);
	g.EXITING_DELAY 			=	g.TRANSITION_DELAY * 0 + 1;
	g.CHANGING_DELAY 			=	g.TRANSITION_DELAY * 1 + 1;
	g.ENTERING_DELAY 			=	g.TRANSITION_DELAY * 2 + 1;
	
	/* Removing the gap would be more accutrate, but best to leave it for safety */
	//g.TRANSITION_END_TIMEOUT	=	(g.TRANSITION_DELAY) * 3 - g.TRANSITION_GAP;
	g.TRANSITION_END_TIMEOUT	=	(g.TRANSITION_DELAY) * 3;
	
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
	
	g.H_PANOUT_DRAG			= 0.4; // factor
	g.V_PANOUT_DRAG			= 0.1; // factor
	g.COLLAPSE_THRESHOLD	= 75; // px
	g.PAN_THRESHOLD			= 15; // px
	
	g.APP_ROOT		=	window.approot;
	g.MEDIA_DIR		=	window.mediadir;
	
	/** @type {Object} */
	g.IMAGE_URL_TEMPLATES = {
		"original" :
			_.template(g.MEDIA_DIR + "/<%= src %>"),
		"constrain-width" :
			_.template(g.APP_ROOT + "image/1/<%= width %>/0/uploads/<%= src %>"),
		"constrain-height" :
			_.template(g.APP_ROOT + "image/1/0/<%= height %>/uploads/<%= src %>")
	};
	
	delete window.approot;
	delete window.mediadir;
	
	return g;
}());
