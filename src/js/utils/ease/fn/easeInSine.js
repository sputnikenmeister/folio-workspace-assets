/* easeInSine */
module.exports = function(x, t, b, c, d) {
	return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
};
