/** @type {Function} */
var transitionEnd = require("../../utils/event/transitionEnd");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");

//whenTransitionEnds
module.exports = function(view, target, prop, timeout) {
	var eventHandler, timeoutId, viewRemoveHandler;
	var cleanup = function() {
		// console.log(view.cid, "whenTransitionEnds promise: cleanup");
		timeoutId && window.clearTimeout(timeoutId);
		target.removeEventListener(transitionEnd, eventHandler, false);
		view.off("view:remove", viewRemoveHandler);
	};
	
	return Promise.race([
		new Promise(function(resolve, reject){
			// resolve on event
			eventHandler = function(ev) {
				if (ev.target === target && prop == ev.propertyName) {
					console.log(view.cid, "whenTransitionEnds promise", "DOM Event: " + transitionEnd);
					resolve(view);
				}
			};
			target.addEventListener(transitionEnd, eventHandler, false);
		}),
		new Promise(function(resolve, reject){
			// resolve on timeout
			timeoutId = window.setTimeout(function () {
				console.log(view.cid, "whenTransitionEnds promise", "timeoutId: " + timeoutId);
				timeoutId = null;
				resolve(view);
			}, timeout || 1000);
		}),
		new Promise(function(resolve, reject){
			// resolve on view removal
			viewRemoveHandler = function() {
				console.error(view.cid, "whenTransitionEnds promise", "view:remove");
				// reject();
				reject(new ViewError(view, new Error("whenTransitionEnds: view was removed)")));
			};
			view.on("view:remove", viewRemoveHandler);
		}),
	]).then(cleanup, cleanup);
};
