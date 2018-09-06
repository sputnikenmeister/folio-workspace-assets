/* easeInQuad */
module.exports = function(x, t, b, c, d) {
	return c * (t /= d) * t + b;
};
//EOF