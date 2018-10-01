/** @type {Function} */
const transitionEnd = require("./transitionEnd");

/**
 * get the prefixed transitionend event name
 * @param {String} props
 * @param {Function} action
 * @param {HTMLElement} target
 * @param {Object} context
 * @param {Number} timeout
 */
module.exports = function(target, prop, callback, context, timeout) {
	var listener, execute, timeoutId, pending = true;

	context || (context = window);
	timeout || (timeout = 2000);
	timeoutId = window.setTimeout(function() {
		execute(true);
	}, timeout);
	listener = function(ev) {
		if (ev.target === target && prop == ev.propertyName) {
			execute(true);
		}
	};
	execute = function(exec) {
		if (pending) {
			pending = false;
			target.removeEventListener(transitionEnd, listener, false);
			window.clearTimeout(timeoutId);
			callback.call(context, exec, target);
		}
	};
	target.addEventListener(transitionEnd, listener, false);
	return execute;
};
