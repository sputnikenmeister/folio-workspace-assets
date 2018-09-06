/* easeOutExpo */
module.exports = function(t, b, c, d) {
	return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
};
//EOF