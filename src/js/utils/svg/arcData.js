/**
 * @param {array} d target data array
 * @param {number} a1 arc start in radians
 * @param {number} a2 arc length in radians
 * @param {number} r1 radius
 * @param {number} r2 second radius
 * @param {number} x arc center
 * @param {number} y arc center
 * @return {array} d first argument
 */
var arcData = function(d, a1, a2, r1, r2, x, y) {
	x || (x = 0);
	y || (y = 0);

	// a2 = a2 + (a1 % (Math.PI*2));
	// if (a2 >= Math.PI*2) { a2 += Number.MIN_VALUE; }

	a2 = Math.min(a2, (Math.PI * 2) - 0.0001);
	a2 += a1;

	var x1 = Math.cos(a1) + x,
		y1 = Math.sin(a1) + y,
		x2 = Math.cos(a2) + x,
		y2 = Math.sin(a2) + y,
		f1 = Math.abs(a1 - a2) > Math.PI,
		f2 = a1 < a2;

	d.push(
		"M", x1 * r1, y1 * r1,
		"A", r1, r1, 0, f1 | 0, f2 | 0, x2 * r1, y2 * r1);
	if (r2) {
		// var r3 = Math.abs(r1 - r2);
		// d.push("A", r3, r3, 0, 1, 0, x2*r2, y2*r2);
		d.push(
			"L", x2 * r2, y2 * r2,
			"A", r2, r2, 0, f1 | 0, (!f2) | 0, x1 * r2, y1 * r2,
			"Z");
	}
	return d;
};

module.exports = arcData;
