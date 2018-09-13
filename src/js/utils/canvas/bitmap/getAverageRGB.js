module.exports = function(imageData, opts) {
	var pixels = imageData.data;
	var pixelsNum = pixels.length;
	var rgbAvg = [0, 0, 0];
	var i;

	for (i = 0; i < pixelsNum; i += 4) {
		rgbAvg[0] += pixels[i];
		rgbAvg[1] += pixels[i + 1];
		rgbAvg[2] += pixels[i + 2];
	}
	for (i = 0; i < 3; i++) {
		rgbAvg[i] = (rgbAvg[i] / (pixelsNum / 4)) | 0;
	}
	return rgbAvg;
};
