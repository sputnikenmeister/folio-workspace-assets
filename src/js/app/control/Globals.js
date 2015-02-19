/**
 * @module app/control/Globals
 */

module.exports = (function () {
	// to match css values in _base.scss, units are seconds
	var txDuration		=	0.375 * 1000;
	var txDelayInterval	=	0.025 * 1000;
	var retval = {
		TRANSITION_DURATION			:	txDuration,
		TRANSITION_DELAY_INTERVAL	:	txDelayInterval,
		TRANSITION_DELAY			:	(txDuration + txDelayInterval),
		HORIZONTAL_STEP				:	20,
		APP_ROOT					:	window.approot,
		MEDIA_DIR					:	window.mediadir,
	};
	delete window.approot;
	delete window.mediadir;
	return retval;
}());
