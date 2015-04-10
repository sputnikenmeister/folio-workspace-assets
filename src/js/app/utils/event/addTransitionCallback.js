/** @type {module:underscore} */
var _ = require("underscore");
/** @type {Function} */
var transitionEventName = require("./transitionEventName");

function _log(d) {
	var args = Array.prototype.slice.call(arguments, 0);
	var k, s = "", dd = _.omit(d, ["id", "level", "method"]);
	for (k in dd) s += " "+k+":"+dd[k];
	args[0] = "addTransitionCallback " + d.id + " " + d.method + s;
	console[(console[d.level]? d.level : "log")].apply(console, args);
}
var _logCount = 0;

/**
 * get the prefixed transitionend event name
 * @param {String} props
 * @param {Function} action
 * @param {HTMLElement} target
 * @param {Object} context
 * @param {Number} timeout
 */
module.exports = function(props, action, target, context, timeout) {
	var listener, eventName, execute, timeoutId, pending = true;

	eventName = transitionEventName(target);
	props = props.split(" ");
	timeout || (timeout = 2000);

	var d = { id: _logCount++, level: "log", method: "[prepared]"};
	d.target = target.getAttribute("data-cid") || target.id || target.classList[0];
	d.context = (context.model && context.model.get("name")) || context.cid || context;

	timeoutId = window.setTimeout(function() {
		d = _.extend(d, {level: "warn", method: "[timeout]", timeoutId: timeoutId, elapsed: timeout, props: props.join(" ")});
		execute(true);
	}, timeout);

	listener = function(ev) {
		if (props.indexOf(ev.propertyName) != -1) {
			d = _.extend(d, {method: "[event]", ev: ev.type, prop: ev.propertyName});
			execute(true);
		} else {
			d.ignored = d.ignored? d.ignored + 1 : 1;
		}
	};

	execute = function(exec) {
		if (!pending) {
			d.method = "[expired]";	d.level = "error";
		} else if (!exec) {
			d.method = "[cancelled]"; d.level = "log";
		} else {
			if (d.method == "[prepared]") d.method = "[direct]";
			console[d.level] || (d.level = "log");
		}
		_log(d);//,target);
		d = void 0;

		if (pending) {
			pending = false;
			target.removeEventListener(eventName, listener, false);
			window.clearTimeout(timeoutId);
			action && action.call(context, exec);
			action = target = context = void 0; // clear refs
		}
	};
	target.addEventListener(eventName, listener, false);
	_log(d);
	return execute;
};
