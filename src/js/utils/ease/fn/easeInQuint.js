/* easeInQuint */
module.exports = function(x, t, b, c, d) {
	return c * (t /= d) * t * t * t * t + b;
};
//EOF