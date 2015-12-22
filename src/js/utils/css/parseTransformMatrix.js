/**
 * @module {module:utils/css/parseTransformMatrix}
 */

/*
 * matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1).
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function
 */
/**
 * @param {String} cssval	css value
 * @param {Object} o 		optional value host
 * @returns {Object}
 */
module.exports = function(cssText, o) {
	var m = cssText.match(/(matrix|matrix3d)\(([^\)]+)\)/);
	o || (o = {});
	o.cssText = cssText;
	if (m) {
		o.type = m[1];
		o.values = m[2].split(",");
		if (o.type === "matrix") {
			o.x = parseFloat(o.values[4]);
			o.y = parseFloat(o.values[5]);
			o.z = 0;
		} else {
			o.x = parseFloat(o.values[12]);
			o.y = parseFloat(o.values[13]);
			o.z = parseFloat(o.values[14]);
		}
	} else {
		o.type = "none";
		o.x = 0;
		o.y = 0;
		o.z = 0;
	}
	return o;
};
