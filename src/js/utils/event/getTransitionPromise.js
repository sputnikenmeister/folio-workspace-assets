/** @type {Function} */
const transitionEnd = require("./transitionEnd");
/** @type {{module:jquery}.Deferred} */
const Deferred = require("jquery").Deferred;

/**
 * get the prefixed transitionend event name
 * @param {String} props
 * @param {Function} action
 * @param {HTMLElement} target
 * @param {Object} context
 * @param {Number} timeout
 */
module.exports = function(target, prop, context, timeout) {
	var deferred = new Deferred(),
		mixin = {};
	var resolveArgs = [target];
	var eventHandler, timeoutId;

	context || (context = window);
	timeout || (timeout = 1000);

	// resolve on event
	eventHandler = function(ev) {
		if (ev.target === target && prop == ev.propertyName) {
			deferred.resolveWith(context, resolveArgs);
		}
	};
	target.addEventListener(transitionEnd, eventHandler, false);
	// resolve on timeout
	timeoutId = window.setTimeout(function() {
		deferred.resolveWith(context, resolveArgs);
	}, timeout);
	// allow cancellation
	mixin.cancel = function() {
		deferred.rejectWith(context, resolveArgs);
	};
	// cleanup tasks
	deferred.always(function() {
		target.removeEventListener(transitionEnd, eventHandler, false);
		window.clearTimeout(timeoutId);
	});
	deferred.promise(mixin);
	return mixin;
};
