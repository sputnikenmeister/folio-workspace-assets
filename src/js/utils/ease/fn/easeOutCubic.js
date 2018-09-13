/* easeOutCubic */
module.exports = function(t, b, c, d) {
	return c * ((t = t / d - 1) * t * t + 1) + b;
};
