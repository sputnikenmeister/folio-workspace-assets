/* easeInCubic */
module.exports = function(t, b, c, d) {
	return c * (t /= d) * t * t + b;
};
