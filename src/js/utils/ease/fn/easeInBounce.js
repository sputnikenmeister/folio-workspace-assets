/* easeInBounce */
module.exports = function(t, b, c, d) {
	return c - require('./easeOutBounce')(d - t, 0, c, d) + b;
};
//EOF