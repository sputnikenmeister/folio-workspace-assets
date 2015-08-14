/**
 * @module {module:utils/css/Transition}
 */
/** @type {module:app/utils/css/prefixedProperty} */
var prefixedStyleName = require("./prefixedStyleName");
/** @type {module:utils/css/prefixedProperty} */
var prefixedProperty = require("./prefixedProperty");

var transitionStyles = [
	"transition-duration",
	"transition-delay",
	"transition-property"
];
var transitionProps = [
	"transition",
	"transitionDuration",
	"transitionDelay",
	"transitionProperty",
	"transitionTimingFunction"
];

var Transition = function() {
	this.properties = [];
};


var getTransitionValues = function(v, t) {
	var ret = {};
	var s = window.getComputedStyle(t);
	for (var i = 0, p; i < transitionStyles.length; i++) {
		p = prefixedStyleName(transitionStyles[i]);
		ret[p] = s.getPropertyValue(p);
	}
	return ret;
};

Transition.getComputedDuration = function(element, property) {
	var sProp, sDelay, sDur;
	var s = window.getComputedStyle(element);
	
	sProp = s[prefixedProperty("transition-property")];
	if (sProp == "none" || (sProp != "all" && sProp.indexOf(property) === -1)) {
		return 0;
	} else {
		sDelay = s[prefixedProperty("transition-delay")];
		sDur = s[prefixedProperty("transition-duration")];
		return (parseFloat(sDelay) + parseFloat(sDur)) * 1000;
	}
};

module.exports = Transition;
