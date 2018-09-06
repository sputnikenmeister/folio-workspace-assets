/* easeInCirc */
module.exports = function(t, b, c, d) {
	return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
};
//EOF