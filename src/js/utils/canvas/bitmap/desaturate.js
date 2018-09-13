module.exports = function(imageData, opts) {
	var pixels = imageData.data,
		width = imageData.width,
		height = imageData.height;

	for (var i = 0, ii = pixels.length; i < ii; i += 4) {
		pixels[i] = (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 144) / 1000;
	}
	return imageData;
};
