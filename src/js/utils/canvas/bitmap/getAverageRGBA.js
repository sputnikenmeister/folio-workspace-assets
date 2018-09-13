module.exports = function(imageData, opts) {
	var pixels = imageData.data,
		rgbAvg = [0, 0, 0],
		rgbNum = 0,
		alpha;

	for (var i = 0, ii = pixels.length; i < ii; i += 4) {
		alpha = pixels[i + 3];
		rgbNum += alpha;
		alpha /= 255;
		rgbAvg[0] += pixels[i] * alpha;
		rgbAvg[1] += pixels[i + 1] * alpha;
		rgbAvg[2] += pixels[i + 2] * alpha;
	}
	for (var c = 0; c < 3; c++) {
		rgbAvg[c] /= rgbNum;
		rgbAvg[c] *= 255;
		rgbAvg[c] |= 0;
	}
	return rgbAvg;
};
