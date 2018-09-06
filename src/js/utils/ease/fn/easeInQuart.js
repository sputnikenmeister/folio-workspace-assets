/* easeInQuart */
module.exports = function(x, t, b, c, d) {
	return c * (t /= d) * t * t * t + b;
};
//EOF