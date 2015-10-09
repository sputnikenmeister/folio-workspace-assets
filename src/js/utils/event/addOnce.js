module.exports = function(target, event, handler, useCapture) {
	var wrapper = function(ev) {
		target.removeEventListener(event, wrapper, useCapture);
		handler(ev)
	};
	target.addEventListener(event, wrapper, useCapture);
	return wrapper;
};
