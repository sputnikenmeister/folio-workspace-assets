/**
 * @module app/control/Globals
 */
/** @type {module:underscore} */
var _ = require("underscore");
var sassVars = require("../../../sass/variables.json");

module.exports = (function () {
	var globals = {};
	// to match css values in _globals.scss, units are in seconds
	// globals.TRANSITION_GAP				=	0.025 * 1000;
	// globals.TRANSITION_DURATION			=	0.475 * 1000;
	// globals.TRANSITION_DURATION			=	0.6 * 1000;
	// globals.TRANSITION_EASE				=	"ease-out";
	// globals.HORIZONTAL_STEP				=	20; // pixels
	// globals.VERTICAL_STEP				=	12; // pixels

	globals.HORIZONTAL_STEP				=	parseFloat(sassVars.units["hu_px"]);
	globals.VERTICAL_STEP				=	parseFloat(sassVars.units["vu_px"]);
	globals.TRANSITION_GAP				=	parseFloat(sassVars.transitions["delay_interval_ms"]);
	globals.TRANSITION_DURATION			=	parseFloat(sassVars.transitions["duration_ms"]);
	globals.TRANSITION_EASE				=	sassVars.transitions["ease"];

	globals.TRANSITION_DELAY			=	(globals.TRANSITION_DURATION + globals.TRANSITION_GAP);
	globals.NO_DELAY	 				=	0;
	globals.EXITING_DELAY 				=	globals.TRANSITION_DELAY * 0 + 1;
	globals.CHANGING_DELAY 				=	globals.TRANSITION_DELAY * 1 + 1;
	globals.ENTERING_DELAY 				=	globals.TRANSITION_DELAY * 2 + 1;

	/* Removing the gap would be more accutrate, but best to leave it for safety */
	//globals.TRANSITION_END_TIMEOUT	=	(globals.TRANSITION_DELAY) * 3 - globals.TRANSITION_GAP;
	globals.TRANSITION_END_TIMEOUT		=	(globals.TRANSITION_DELAY) * 3;

	var transit = {};
	transit.easing = globals.TRANSITION_EASE;
	transit.duration = globals.TRANSITION_DURATION - 1;

	globals.TRANSIT_ENTERING = _.clone(transit);
	globals.TRANSIT_ENTERING.delay = globals.ENTERING_DELAY;
	globals.TRANSIT_ENTERING.easing = "ease-out";
	globals.TRANSIT_ENTERING.className = "transform-entering";

	globals.TRANSIT_EXITING = _.clone(transit);
	globals.TRANSIT_EXITING.delay = globals.EXITING_DELAY;
	globals.TRANSIT_EXITING.easing = "ease-in";
	globals.TRANSIT_EXITING.className = "transform-exiting";

	globals.TRANSIT_IMMEDIATE = _.clone(transit);
	globals.TRANSIT_IMMEDIATE.delay = globals.NO_DELAY;
	globals.TRANSIT_IMMEDIATE.duration = globals.TRANSITION_DURATION;
	// globals.TRANSIT_IMMEDIATE.easing = "ease";
	globals.TRANSIT_IMMEDIATE.className = "transform-immediate";

	globals.TRANSIT_CHANGING = _.clone(transit);
	globals.TRANSIT_CHANGING.delay = globals.CHANGING_DELAY;
	globals.TRANSIT_CHANGING.className = "transform-changing";
	// globals.TRANSIT_CHANGING.easing = "ease";

	globals.TRANSIT_PARENT = _.clone(transit);
	globals.TRANSIT_PARENT.delay = globals.CHANGING_DELAY;
	globals.TRANSIT_PARENT.className = "transform-changing";
	// globals.TRANSIT_PARENT.easing = "linear";

	globals.HMOVE_OUT_OF_BOUNDS_DRAG	=	0.4; // factor
	globals.VMOVE_OUT_OF_BOUNDS_DRAG	=	0.1; // factor

	globals.APP_ROOT					=	window.approot;
	globals.MEDIA_DIR					=	window.mediadir;

	delete window.approot;
	delete window.mediadir;

	return globals;
}());
