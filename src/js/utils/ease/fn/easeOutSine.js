/* easeOutSine */
module.exports = function(t, b, c, d) {
	return c * Math.sin(t / d * (Math.PI / 2)) + b;
};
