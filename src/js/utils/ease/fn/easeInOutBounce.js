/* easeInOutBounce */
module.exports = function(t, b, c, d) {
	if (t < d / 2) return require('./easeInBounce')(t * 2, 0, c, d) * .5 + b;
	return require('./easeOutBounce')(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
};
