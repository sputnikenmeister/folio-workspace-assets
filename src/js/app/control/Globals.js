/**
 * @module app/control/Globals
 */

module.exports = (function () {
	// to match css values in _globals.scss, units are in seconds
	var txGap						=	0.025 * 1000;
//	var txDuration					=	0.375 * 1000;
	var txDuration					=	0.7 * 1000;

	var globals = {
		TRANSITION_GAP				:	txGap,
		TRANSITION_DURATION			:	txDuration,
		TRANSITION_DELAY			:	(txDuration + txGap),
		HORIZONTAL_STEP				:	20, // pixels
		VERTICAL_STEP				:	12, // pixels
		APP_ROOT					:	window.approot,
		MEDIA_DIR					:	window.mediadir,
	};

	delete window.approot;
	delete window.mediadir;

	return globals;
}());
