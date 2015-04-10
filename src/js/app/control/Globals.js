/**
 * @module app/control/Globals
 */

module.exports = (function () {
	var globals = {};

	// to match css values in _globals.scss, units are in seconds
	globals.TRANSITION_GAP				=	0.025 * 1000;
//	globals.TRANSITION_DURATION			=	0.375 * 1000;
	globals.TRANSITION_DURATION			=	0.6 * 1000;
	globals.TRANSITION_DELAY			=	(globals.TRANSITION_DURATION + globals.TRANSITION_GAP);

	globals.EXITING_DELAY 				=	globals.TRANSITION_DELAY * 0 + 1;
	globals.CHANGING_DELAY 				=	globals.TRANSITION_DELAY * 1 + 1;
	globals.ENTERING_DELAY 				=	globals.TRANSITION_DELAY * 2 + 1;
	globals.TRANSITION_END_TIMEOUT		=	(globals.TRANSITION_DELAY) * 3;

	globals.HORIZONTAL_STEP				=	20; // pixels
	globals.VERTICAL_STEP				=	12; // pixels

	globals.APP_ROOT					=	window.approot;
	globals.MEDIA_DIR					=	window.mediadir;

	delete window.approot;
	delete window.mediadir;

	return globals;
}());
