/**
 * @module app/view/promise/whenTransitionEnds
 */

/** @type {Function} */
var transitionEnd = require("../../../utils/event/transitionEnd");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("../../../utils/prefixedProperty");
/** @type {module:utils/prefixedProperty} */
var prefixedStyleName = require("../../../utils/prefixedStyleName");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");

var getComputedTimeout = function(v, t, p) {
	var sProp, sDelay, sDur;
	var s = window.getComputedStyle(t);
	
	sProp = s[prefixedProperty("transitionProperty", t.style)];
	// sProp = s.getPropertyValue(v.getPrefixedStyle("transition-property"));
	if (sProp == "none" || (sProp != "all" && sProp.indexOf(p) === -1)) {
		return 0;
	} else {
		sDelay = s[prefixedProperty("transitionDelay", t.style)];
		sDur = s[prefixedProperty("transitionDuration", t.style)];
		// sDelay = s.getPropertyValue(v.getPrefixedStyle("transition-delay"));
		// sDur = s.getPropertyValue(v.getPrefixedStyle("transition-duration"));
		return (parseFloat(sDelay) + parseFloat(sDur)) * 1000;
	}
};

// var idSeed = 0;

module.exports = function(view, target, prop, timeout) {
	return new Promise(function(resolve, reject) {
		var resolveOnEvent, rejectOnRemove, timeoutId, cleanupOnSettle;
		var tt = timeout || getComputedTimeout(view, target, prop);
		prop = prefixedStyleName(prop);
		
		if (tt === 0) {
			// transition is 0s, resolve immediately
			console.log(view.cid, view.model.cid, "whenTransitionEnds: sync resolve");
			resolve(view);
		} else {
			console.log(view.cid, view.model.cid, "whenTransitionEnds: async init ("+tt+"s)");
			cleanupOnSettle = function() {
				console.log(view.cid, view.model.cid, "whenTransitionEnds: cleanup" + (timeoutId? "":" (timeout)"));
				timeoutId && window.clearTimeout(timeoutId);
				target.removeEventListener(transitionEnd, resolveOnEvent, false);
				view.off("view:remove", rejectOnRemove);
			};
			// resolve on event
			resolveOnEvent = function(ev) {
				if (ev.target === target && prop == ev.propertyName) {
					console.log(view.cid, view.model.cid, "whenTransitionEnds: async resolve", transitionEnd, ev.propertyName);
					cleanupOnSettle();
					resolve(view);
				}
			};
			target.addEventListener(transitionEnd, resolveOnEvent, false);
			// resolve on timeout
			timeoutId = window.setTimeout(function () {
				console.warn(view.cid, view.model.cid, "whenTransitionEnds: async resolve", "timeoutId: " + timeoutId);
				timeoutId = null;
				cleanupOnSettle();
				resolve(view);
			}, tt + 200);
			// resolve on view removal
			rejectOnRemove = function() {
				cleanupOnSettle();
				reject(new ViewError(view, new Error("whenTransitionEnds: view was removed")));
			};
			view.on("view:remove", rejectOnRemove);
		}
	});
};
