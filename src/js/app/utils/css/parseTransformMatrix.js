/**
 * @module {module:app/utils/css/parseTransformMatrix}
 */

/*
 * matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1).
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function
 */
/**
 * @param {String} cssval
 * @returns {Object}
 */
module.exports = function(cssval) {
	var m, o = {};
	m = cssval.match(/(matrix|matrix3d)\(([^\)]+)\)/);
	if (m) {
		o.css = cssval;
		o.type = mm[1];
		m = m[2].split(",");
		if (o.type === "matrix") {
			o.x = parseFloat(m[4]);
			o.y = parseFloat(m[5]);
			o.z = 0;
		} else {
			o.x = parseFloat(m[12]);
			o.y = parseFloat(m[13]);
			o.z = parseFloat(m[14]);
		}
	} else {
		o.css = "";
		o.type = "";
		o.x = 0;
		o.y = 0;
		o.z = 0;
	}
	return o;
};
