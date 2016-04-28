/**
 * @module app/view/promise/whenTransitionEnds
 */

/** @type {Function} */
var transitionEnd = require("utils/event/transitionEnd");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedProperty} */
var prefixedStyleName = require("utils/prefixedStyleName");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError");

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
var timeoutMargin = 200; // NOTE: ms delay timeout to catch late transitionend events
var logMessage = "%s::whenTransitionEnds [%s]: %s";

module.exports = function(view, target, prop, timeout) {
	return new Promise(function(resolve, reject) {
		var resolveOnEvent, rejectOnRemove, timeoutId, cleanupOnSettle;
		var tt = timeout || getComputedTimeout(view, target, prop);
		prop = prefixedStyleName(prop);

		// transition is 0s, resolve immediately
		if (tt === 0) {
			// console.log(logMessage, view.cid, "resolved", "sync");
			resolve(view);
		} else {
			// console.log(logMessage, view.cid, "init", prop, tt + "s");
			cleanupOnSettle = function() {
				// console.log(logMessage, view.cid, "cleanup", timeoutId? transitionEnd : "timeout");
				timeoutId && window.clearTimeout(timeoutId);
				target.removeEventListener(transitionEnd, resolveOnEvent, false);
				view.off("view:removed", rejectOnRemove);
			};

			// resolve on event
			resolveOnEvent = function(ev) {
				if (ev.target === target && prop == ev.propertyName) {
					// console.log(logMessage, view.cid, "resolved", ev.type, ev.propertyName);
					cleanupOnSettle();
					resolve(view);
				}
			};
			target.addEventListener(transitionEnd, resolveOnEvent, false);

			// resolve on timeout
			timeoutId = window.setTimeout(function() {
				console.warn(logMessage, view.cid, "resolved", "timeout", timeoutId);
				timeoutId = null;
				cleanupOnSettle();
				resolve(view);
			}, tt + timeoutMargin);

			// resolve on view removal
			rejectOnRemove = function() {
				cleanupOnSettle();
				reject(new ViewError(view, new Error("whenTransitionEnds: view was removed")));
			};
			view.on("view:removed", rejectOnRemove);
		}
	});
};
