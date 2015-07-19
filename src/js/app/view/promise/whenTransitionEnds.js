/**
 * @module app/view/promise/whenTransitionEnds
 */

/** @type {Function} */
var transitionEnd = require("../../../utils/event/transitionEnd");
/** @type {module:app/utils/css/prefixedProperty} */
// var prefixedStyle = require("../../../utils/css/prefixedStyleName");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");


var transitionStyles = ["transition-duration", "transition-delay", "transition-property"];
// var transitionProps = ["transition", "transitionDuration", "transitionDelay", "transitionProperty", "transitionTimingFunction"];

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

var getComputedTimeout = function(v, t, p) {
	var sProp, sDelay, sDur;
	var s = window.getComputedStyle(t);
	
	sProp = s.getPropertyValue(v.getPrefixedStyle("transition-property"));
	if (sProp == "none" || (sProp != "all" && sProp.indexOf(p) == -1)) {
		return 0;
	} else {
		sDelay = s.getPropertyValue(v.getPrefixedStyle("transition-delay"));
		sDur = s.getPropertyValue(v.getPrefixedStyle("transition-duration"));
		return (parseFloat(sDelay) + parseFloat(sDur)) * 1000;
	}
};

var idSeed = 0;

var whenTransitionEnds2 = function(view, target, prop, timeout) {
	return new Promise(function(resolve, reject) {
		var resolveOnEvent, rejectOnRemove, timeoutId, cleanupOnSettle;
		var tt = getComputedTimeout(view, target, prop);
		var pid = idSeed++;
		
		if (tt === 0) {
			// console.log(pid, view.model.cid, "whenTransitionEnds2: resolved: transition is 0s (no cleanup)");
			resolve(view);
		} else {
			console.log(pid, view.model.cid, "whenTransitionEnds2: init async");
			cleanupOnSettle = function() {
				console.log(pid, view.model.cid, "whenTransitionEnds2: cleanup");
				timeoutId && window.clearTimeout(timeoutId);
				target.removeEventListener(transitionEnd, resolveOnEvent, false);
				view.off("view:remove", rejectOnRemove);
			};
			// resolve on event
			resolveOnEvent = function(ev) {
				if (ev.target === target && prop == ev.propertyName) {
					console.log(pid, view.model.cid, "whenTransitionEnds2: resolved: DOMEvent: " + transitionEnd, ev.propertyName);
					cleanupOnSettle();
					resolve(view);
				}
			};
			target.addEventListener(transitionEnd, resolveOnEvent, false);
			
			// resolve on timeout
			timeoutId = window.setTimeout(function () {
				console.log(pid, view.model.cid, "whenTransitionEnds2: resolved: timeoutId: " + timeoutId);
				timeoutId = null;
				cleanupOnSettle();
				resolve(view);
			}, tt + 200);
			
			// resolve on view removal
			rejectOnRemove = function() {
				// console.error(view.cid, "whenTransitionEnds promise", "view:remove");
				cleanupOnSettle();
				reject(new ViewError(view, new Error("whenTransitionEnds2: view was removed")));
			};
			view.on("view:remove", rejectOnRemove);
		}
	});
};

/*var whenTransitionEnds1 = function(view, target, prop, timeout) {
	var eventHandler, timeoutId, viewRemoveHandler, cleanup;
	
	cleanup = function(view) {
		// console.log(view.cid, "whenTransitionEnds promise: cleanup");
		timeoutId && window.clearTimeout(timeoutId);
		target.removeEventListener(transitionEnd, eventHandler, false);
		view.off("view:remove", viewRemoveHandler);
		return view;
	};
	
	return Promise.race([
		new Promise(function(resolve, reject){
			// resolve on event
			eventHandler = function(ev) {
				if (ev.target === target && prop == ev.propertyName) {
					console.log(view.cid, "whenTransitionEnds promise", "DOM Event: " + transitionEnd, ev.propertyName);
					resolve(view);
				}
			};
			target.addEventListener(transitionEnd, eventHandler, false);
		}),
		new Promise(function(resolve, reject){
			// console.log("computedTimeoutMs", computedTimeoutMs(view, target, prop));
			// console.log("getTransitionValues", getTransitionValues(view, target));
			var tt = getComputedTimeout(view, target, prop);
			console.log("getComputedTimeout", tt);
			if (tt > 0) {
				// resolve on timeout
				timeoutId = window.setTimeout(function () {
					console.log(view.cid, "whenTransitionEnds promise", "timeoutId: " + timeoutId);
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
			viewRemoveHandler = function() {
				// console.error(view.cid, "whenTransitionEnds promise", "view:remove");
				reject(new ViewError(view, new Error("whenTransitionEnds: view was removed")));
			};
			view.on("view:remove", viewRemoveHandler);
		}),
	]).then(cleanup, cleanup);
};*/

module.exports = whenTransitionEnds2;
