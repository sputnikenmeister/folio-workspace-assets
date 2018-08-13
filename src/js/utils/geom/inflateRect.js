/**
 * @module app/view/component/GraphView
 */

// /** @type {module:underscore} */
// var _ = require("underscore");

module.exports = function(rect, dx, dy) {
	if (arguments.length == 2) {
		dy = dx;
	}
	var r = {
		width: rect.width + dx * 2,
		height: rect.height + dy * 2
	};
	if (r.width >= 0) {
		r.left = rect.left - dx;
		r.right = r.left + r.width;
		r.x = r.left;
	} else {
		r.right = rect.right + dx;
		r.left = rect.right - r.width;
		r.y = r.right;
	}
	if (r.height >= 0) {
		r.top = rect.top - dy;
		r.bottom = r.top + r.height;
		r.y = r.top;
	} else {
		r.bottom = rect.bottom + dy;
		r.top = rect.bottom - r.height;
		r.y = r.bottom;
	}

	return r;
};