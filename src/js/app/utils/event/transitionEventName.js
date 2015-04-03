/** @type {String} Cached value */
var _cached;

/**
 * get the prefixed transitionend event name
 * @param {Object} source element
 * @returns {String|Undefined} prefixed
 */
module.exports = function (el) {
	return _cached || (_cached = (function(el) {
		var p, pp = { "WebkitTransition" : "webkitTransitionEnd", "MozTransition" : "transitionend", "OTransition" : "oTransitionEnd", "transition" : "transitionend" };
		for (p in pp) {
			if (p in el.style) {
				return pp[p];
			}
		}
	})(el));
};
