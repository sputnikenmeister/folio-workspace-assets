/**
 * @module app/view/promise/whenTransitionEnds
 */

/** @type {Function} */
var transitionEnd = require("../../../utils/event/transitionEnd");
/** @type {module:utils/css/prefixedProperty} */
var prefixedProperty = require("../../../utils/css/prefixedProperty");
/** @type {module:utils/css/prefixedProperty} */
var prefixedStyleName = require("../../../utils/css/prefixedStyleName");
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

var idSeed = 0;

module.exports = function(view, target, prop, timeout) {
	return new Promise(function(resolve, reject) {
		var resolveOnEvent, rejectOnRemove, timeoutId, cleanup;
		var tt = timeout || getComputedTimeout(view, target, prop);
		var pid = view.cid + " " + view.model.cid + " id:" + idSeed++;
		// prop = view.getPrefixedStyle(prop);
		prop = prefixedStyleName(prop);
		
		if (tt === 0) {
			// transition is 0s, resolve immediately
			console.log(pid, "whenTransitionEnds: init resolve cleanup");
			resolve(view);
		} else {
			console.log(pid, "whenTransitionEnds: init");
			cleanup = function() {
				console.log(pid, "whenTransitionEnds: cleanup" + (timeoutId? "":" (timeout)"));
				timeoutId && window.clearTimeout(timeoutId);
				target.removeEventListener(transitionEnd, resolveOnEvent, false);
				view.off("view:remove", rejectOnRemove);
			};
			// resolve on event
			resolveOnEvent = function(ev) {
				if (ev.target === target && prop == ev.propertyName) {
					console.log(pid, "whenTransitionEnds: resolve", transitionEnd, ev.propertyName);
					cleanup();
					resolve(view);
				}
			};
			target.addEventListener(transitionEnd, resolveOnEvent, false);
			// resolve on timeout
			timeoutId = window.setTimeout(function () {
				console.log(pid, "whenTransitionEnds: resolve", "timeoutId: " + timeoutId);
				timeoutId = null;
				cleanup();
				resolve(view);
			}, tt + 200);
			// resolve on view removal
			rejectOnRemove = function() {
				cleanup();
				reject(new ViewError(view, new Error("whenTransitionEnds: view was removed")));
			};
			view.on("view:remove", rejectOnRemove);
		}
	});
};

/*
module.exports = function(view, target, prop, timeout) {
	var eventHandler, timeoutId, viewRemoveHandler, cleanup;
	var resolveOnEvent, rejectOnRemove, timeoutId, cleanupOnSettle;
	var pid = view.model.cid + ":" + idSeed++;
	
	cleanupOnSettle = function(view) {
		console.log(pid, "whenTransitionEnds: cleanup" + (timeoutId? "":" (timeout)"));
		timeoutId && window.clearTimeout(timeoutId);
		target.removeEventListener(transitionEnd, resolveOnEvent, false);
		view.off("view:remove", rejectOnRemove);
		return view;
	};
	
	return Promise.race([
		new Promise(function(resolve, reject){
			// resolve on event
			resolveOnEvent = function(ev) {
				if (ev.target === target && prop == ev.propertyName) {
					console.log(pid, "whenTransitionEnds: resolved", transitionEnd, ev.propertyName);
					resolve(view);
				}
			};
			target.addEventListener(transitionEnd, resolveOnEvent, false);
		}),
		new Promise(function(resolve, reject){
			// console.log("computedTimeoutMs", computedTimeoutMs(view, target, prop));
			// console.log("getTransitionValues", getTransitionValues(view, target));
			var tt = getComputedTimeout(view, target, prop);
			console.log("getComputedTimeout", tt);
			if (tt > 0) {
				// resolve on timeout
				timeoutId = window.setTimeout(function () {
					console.log(pid, "whenTransitionEnds: resolved", "timeoutId: " + timeoutId);
					timeoutId = null;
					resolve(view);
				}, tt + 200);
			} else {
				console.log(view.cid, "whenTransitionEnds promise", "transition is 0s");
				resolve(view);
			}
		}),
		new Promise(function(resolve, reject){
			// resolve on view removal
			rejectOnRemove = function() {
				reject(new ViewError(view, new Error("whenTransitionEnds: view was removed")));
			};
			view.on("view:remove", rejectOnRemove);
		}),
	]).then(cleanupOnSettle, cleanupOnSettle);
};
*/
