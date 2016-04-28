/** @type {module:app/utils/prefixedProperty} */
// var prefixedStyle = require("utils/prefixedStyleName");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");

var transitionStyles = ["transition-duration", "transition-delay", "transition-property"];
var transitionProps = ["transition", "transitionDuration", "transitionDelay", "transitionProperty", "transitionTimingFunction"];

// var transitionProp = prefixedProperty("transition");
// var transitionDelayProp = prefixedProperty("transitionDelay");
// var transitionDurationProp = prefixedProperty("transitionDuration");
// var transitionPropertyProp = prefixedProperty("transitionProperty");
// var transitionStyle = prefixedStyle("transition");
// var transitionDelayStyle = prefixedStyle("transition-delay");
// var transitionDurationStyle = prefixedStyle("transition-duration");
// var transitionPropertyStyle = prefixedStyle("transition-property");
// "transition: " + s.getPropertyValue(view.getPrefixedStyle("transition")),
// "transition-delay: " + s.getPropertyValue(view.getPrefixedStyle("transition-delay")),
// "transition-duration: " + s.getPropertyValue(view.getPrefixedStyle("transition-duration")),
// "transition-property: " + s.getPropertyValue(view.getPrefixedStyle("transition-property"))

var getTransitionValues = function(v, t) {
	var ret = {};
	var s = window.getComputedStyle(t);
	for (var i = 0, p; i < transitionStyles.length; i++) {
		p = v.getPrefixedStyle(transitionStyles[i]);
		ret[p] = s.getPropertyValue(p);
	}
	return ret;
};

module.exports = function(v, t, p) {
	var sProp, sDelay, sDur;
	var s = window.getComputedStyle(t);

	sProp = s.getPropertyValue(v.getPrefixedStyle("transition-property"));
	if (sProp == "none" || (sProp != "all" && sProp.indexOf(p) === -1)) {
		return 0;
	} else {
		sDelay = s.getPropertyValue(v.getPrefixedStyle("transition-delay"));
		sDur = s.getPropertyValue(v.getPrefixedStyle("transition-duration"));
		return (parseFloat(sDelay) + parseFloat(sDur)) * 1000;
	}
};
