/** @type {module:underscore} */
var _ = require("underscore");

var _eventName;
var whichTransitionEvent = function (el){
	return _eventName || (_eventName = (function () {
		var p, pp = {
			"transition" : "transitionend", "OTransition" : "oTransitionEnd",
			"MozTransition" : "transitionend", "WebkitTransition" : "webkitTransitionEnd"
		};
		for (p in pp) {
			if (el.style[p] !== void 0) {
				return pp[p];
			}
		}
	}()));
};

var cmdCount = 0;
var addTransitionCallback = function(prop, action, target, context, timeout) {
	var eventName = whichTransitionEvent(target);
	var listener, execute, timeoutId, pending = true, id = cmdCount++, ignoredCount = 0;
	timeout || (timeout = 2000);
	timeoutId = window.setTimeout(function() {
		execute(true, "[timeout]  id:" + timeoutId + " elapsed:" + timeout + "ms prop:" + prop + " ignored:" + ignoredCount, "warn");
	}, timeout);
	listener = function(ev) {
		if (ev.propertyName == prop) {
			execute(true, "[event]    ev:" + ev.type + " prop:" + ev.propertyName + " ignored:" + ignoredCount);
		} else {
			ignoredCount++;
		}
	};
	execute = function(exec, msg, lvl) {
		if (pending) {
			pending = false;
			target.removeEventListener(eventName, listener, false);
			window.clearTimeout(timeoutId);
			exec && action && action.apply(context);
			action = target = context = void 0; // clear refs
			console[lvl] || (lvl = "log");
		} else {
			lvl = "error";
		}
		console[lvl]("addTransitionCallback " + id + " " + msg);
	};
	target.addEventListener(eventName, listener, false);
	console.log("addTransitionCallback " + id + " [prepared] ev:" + eventName + " prop:" + prop);
	return _.partial(execute, false, "[cancelled]", "warn");
};
addTransitionCallback.timeout = 2000;

module.exports = addTransitionCallback;
