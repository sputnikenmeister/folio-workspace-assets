module.exports = function(imageData, opts) {

	if (!(opts && opts.x00 && opts.xFF)) return;

	var pixels = imageData.data,
		width = imageData.width,
		height = imageData.height;
	var r1, g1, b1, w1, r2, g2, b2, w2;

	r1 = opts.xFF.red() / 255;
	g1 = opts.xFF.green() / 255;
	b1 = opts.xFF.blue() / 255;

	r2 = opts.x00.red() / 255;
	g2 = opts.x00.green() / 255;
	b2 = opts.x00.blue() / 255;

	// blue = pixelBuffer[k] + (255 - pixelBuffer[k]) * blueTint; 
	// green = pixelBuffer[k + 1] + (255 - pixelBuffer[k + 1]) * greenTint; 
	// red = pixelBuffer[k + 2] + (255 - pixelBuffer[k + 2]) * redTint; 

	for (var i = 0, ii = pixels.length; i < ii; i += 4) {
		w1 = (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 144) / 1000;
		w2 = 255 - w1;

		pixels[i] = (w1 * r1 + w2 * r2);
		pixels[i + 1] = (w1 * g1 + w2 * g2);
		pixels[i + 2] = (w1 * b1 + w2 * b2);
	}
	return imageData;
};
