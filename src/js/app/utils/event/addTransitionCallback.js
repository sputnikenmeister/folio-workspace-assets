/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var transitionEnd = require("./transitionEnd");

/**
 * get the prefixed transitionend event name
 * @param {String} props
 * @param {Function} action
 * @param {HTMLElement} target
 * @param {Object} context
 * @param {Number} timeout
 */
module.exports = function(prop, action, target, context, timeout) {
	var listener, execute, timeoutId, pending = true;

	context || (context = window);
	timeout || (timeout = 2000);

	timeoutId = window.setTimeout(function() {
		execute(true);
	}, timeout);

	listener = function(ev) {
		if (prop == ev.propertyName) {
			execute(true);
		}
	};

	execute = function(exec) {
		if (pending) {
			pending = false;
			target.removeEventListener(transitionEnd, listener, false);
			window.clearTimeout(timeoutId);
			action && action.call(context, exec, target);
			action = target = context = void 0; // clear refs
		}
	};
	target.addEventListener(transitionEnd, listener, false);

	return execute;
};
