/** @type {module:underscore} */
var _ = require("underscore");

var cmdCount = 0;
var addTransitionEndCommand = function(action, target, context) {
	var listener, cleanup, timeout, once, id = cmdCount++;
	timeout = window.setTimeout(function() {
		console.log("addTransitionEndCommand -> timeout", id);
		cleanup.call() && action.apply(context);
	}, 1000);
	listener = function(ev) {
		console.log("addTransitionEndCommand -> event", id);
		ev.propertyName == "transform" && cleanup() && action.apply(context);
	};
	cleanup = function(target, listener, timeout, cancel) {
		console.log("addTransitionEndCommand ---> " + (cancel? "cancelled":"executed"), id);
		target.removeEventListener("webkittransitionend", listener, false);
		target.removeEventListener("transitionend", listener, false);
		window.clearTimeout(timeout);
		return cancel === void 0;
	};
	target.addEventListener("webkittransitionend", listener, false);
	target.addEventListener("transitionend", listener, false);
	console.log("addTransitionEndCommand prepared", id);
	return cleanup = _.partial(cleanup, target, listener, timeout);
};

module.exports = addTransitionEndCommand;
