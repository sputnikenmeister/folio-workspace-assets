/**
 * get the prefixed transitionend event name
 * @param {Object} style object
 * @returns {String|Undefined} prefixed event
 */
module.exports = (function (style) {
	var prop, map = {
		"transition" : "transitionend",
		"WebkitTransition" : "webkitTransitionEnd",
		"MozTransition" : "transitionend",
		"msTransition" : "MSTransitionEnd",
		"OTransition" : "oTransitionEnd"
	};
	for (prop in map) {
		if (prop in style) {
			return map[prop];
		}
	}
})(document.body.style);
