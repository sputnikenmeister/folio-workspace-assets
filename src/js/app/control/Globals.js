/**
 * @module app/control/Globals
 */
/** @type {module:underscore} */
var _ = require("underscore");


module.exports = (function () {
	var obj; // reusable var
	var globals = {};

	// SASS <--> JS shared values
	var jsonSassVars = require("../../../sass/variables.json");

	// NOTE: breakpoints have to be enclosed in quotes for the sass-json-vars
	// compass plug-in to work as expected. Removing them here.
	obj = {};
	for (var b in jsonSassVars.breakpoints) {
		obj[b] = jsonSassVars.breakpoints[b].slice(1, -1);
	}
	globals.BREAKPOINTS = obj;

	globals.HORIZONTAL_STEP				=	parseFloat(jsonSassVars.units["hu_px"]);
	globals.VERTICAL_STEP				=	parseFloat(jsonSassVars.units["vu_px"]);

	globals.TRANSITION_GAP				=	parseFloat(jsonSassVars.transitions["delay_interval_ms"]);
	globals.TRANSITION_DURATION			=	parseFloat(jsonSassVars.transitions["duration_ms"]);
	globals.TRANSITION_EASE				=	jsonSassVars.transitions["ease"];

	globals.NO_DELAY	 				=	0;
	globals.TRANSITION_DELAY			=	(globals.TRANSITION_DURATION + globals.TRANSITION_GAP);
	globals.EXITING_DELAY 				=	globals.TRANSITION_DELAY * 0 + 1;
	globals.CHANGING_DELAY 				=	globals.TRANSITION_DELAY * 1 + 1;
	globals.ENTERING_DELAY 				=	globals.TRANSITION_DELAY * 2 + 1;

	/* Removing the gap would be more accutrate, but best to leave it for safety */
	//globals.TRANSITION_END_TIMEOUT	=	(globals.TRANSITION_DELAY) * 3 - globals.TRANSITION_GAP;
	globals.TRANSITION_END_TIMEOUT		=	(globals.TRANSITION_DELAY) * 3;

	obj = {};
	obj.easing = globals.TRANSITION_EASE;
	obj.duration = globals.TRANSITION_DURATION - 1;

	globals.TRANSIT_ENTERING = _.clone(obj);
	globals.TRANSIT_ENTERING.delay = globals.ENTERING_DELAY;
	globals.TRANSIT_ENTERING.className = "transform-entering";

	globals.TRANSIT_EXITING = _.clone(obj);
	globals.TRANSIT_EXITING.delay = globals.EXITING_DELAY;
	globals.TRANSIT_EXITING.className = "transform-exiting";

	globals.TRANSIT_IMMEDIATE = _.clone(obj);
	globals.TRANSIT_IMMEDIATE.delay = globals.NO_DELAY;
	globals.TRANSIT_IMMEDIATE.duration = globals.TRANSITION_DURATION;
	globals.TRANSIT_IMMEDIATE.className = "transform-immediate";

	globals.TRANSIT_CHANGING = _.clone(obj);
	globals.TRANSIT_CHANGING.delay = globals.CHANGING_DELAY;
	globals.TRANSIT_CHANGING.className = "transform-changing";

	globals.TRANSIT_PARENT = _.clone(globals.TRANSIT_CHANGING);
	// globals.TRANSIT_PARENT.delay = globals.CHANGING_DELAY;
	// globals.TRANSIT_PARENT.className = "transform-changing";

	globals.H_PANOUT_DRAG	=	0.4; // factor
	globals.V_PANOUT_DRAG	=	0.1; // factor
	globals.COLLAPSE_THRESHOLD = 75; // px
	globals.PAN_THRESHOLD	=	 15; // px

	globals.APP_ROOT		=	window.approot;
	globals.MEDIA_DIR		=	window.mediadir;

	delete window.approot;
	delete window.mediadir;

	return globals;
}());
