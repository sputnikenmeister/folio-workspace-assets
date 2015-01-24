/**
 * @module app/control/Globals
 */

// to match css values in _base.scss, units are seconds
var txDuration		=	0.350 * 1000;
var txDelayInterval	=	0.050 * 1000;

module.exports = {
	TRANSITION_DURATION			:	txDuration,
	TRANSITION_DELAY_INTERVAL	:	txDelayInterval,
	TRANSITION_DELAY			:	(txDuration + txDelayInterval),
	HORIZONTAL_STEP				:	20,
	APP_ROOT					:	window.approot,
};
