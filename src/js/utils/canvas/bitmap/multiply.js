module.exports = function(pixels, adjustment) {
	var d = pixels.data;
	for (var i = 0; i < d.length; i += 4) {
		d[i] *= adjustment;
		d[i + 1] *= adjustment;
		d[i + 2] *= adjustment;
	}
	return pixels;
};
