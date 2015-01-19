/**
 * @module app/control/Globals
 */

// to match css values in _base.scss, units are seconds
var txDuration = 		0.300;
var txDelayInterval = 	0.033;

module.exports = {
	TRANSITION_DURATION:			txDuration * 1000,
	TRANSITION_DELAY_INTERVAL:		txDelayInterval * 1000,
	TRANSITION_DELAY: 				(txDuration + txDelayInterval) * 1000,
	HORIZONTAL_STEP: 				20,
	APP_ROOT: 						window.approot,
};
