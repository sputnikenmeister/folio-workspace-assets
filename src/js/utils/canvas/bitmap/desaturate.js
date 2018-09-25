module.exports = function(imageData, adj) {
	var pixels = imageData.data;
	var r, g, b, s;
	var i, ii;

	if (arguments.length === 1) {
		for (i = 0, ii = pixels.length; i < ii; i += 4) {
			pixels[i] = (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 144) / 1000;
		}
	} else
	if (arguments.length === 2) {
		if (0 >= adj > 1) {
			console.warn("argument out of range (1-0)", adj);
			return imageData;
		}
		for (i = 0, ii = pixels.length; i < ii; i += 4) {
			r = pixels[i];
			g = pixels[i + 1];
			b = pixels[i + 2];
			// s = ((r * 299 + g * 587 + b * 144) / 1000) * (1 - adj);
			// pixels[i] = r * adj + s;
			// pixels[i + 1] = g * adj + s;
			// pixels[i + 2] = b * adj + s;
			s = Math.max(r, g, b);
			if (s === 0) {
				pixels[i] = Math.round(255 * adj);
				pixels[i + 1] = Math.round(255 * adj);
				pixels[i + 2] = Math.round(255 * adj);
			} else {
				s = 255 * adj / s;
				pixels[i] = Math.round(r * s);
				pixels[i + 1] = Math.round(g * s);
				pixels[i + 2] = Math.round(b * s);
			}
		}
	}
	return imageData;
};

// function saturation(r,g,b, s) {
//     var min = rgb.indexOf(Math.min.apply(null, rgb)), // index of min
//         max = rgb.indexOf(Math.max.apply(null, rgb)), // index of max
//         mid = [0, 1, 2].filter(function (i) {return i !== min && i !== max;})[0],
//         a = rgb[max] - rgb[min],
//         b = rgb[mid] - rgb[min],
//         x = rgb[max],
//         arr = [x, x, x];
//     if (min === max) {
//         min = 2; // both max = min = 0, => mid = 1, so set min = 2
//         a = 1;   // also means a = b = 0, don't want division by 0 in `b / a`
//     }
//
//     arr[max] = x;
//     arr[min] = Math.round(x * (1 - s));
//     arr[mid] = Math.round(x * ((1 - s) + s * b / a));
//
//     return arr;
// }


// function nvalue(rgb, v) {
//     var x = Math.max.apply(null, rgb);
//     if (x === 0)
//         return [
//             Math.round(255 * v),
//             Math.round(255 * v),
//             Math.round(255 * v)
//         ];
//     x = 255 * v / x;
//     return [
//         Math.round(rgb[0] * x),
//         Math.round(rgb[1] * x),
//         Math.round(rgb[2] * x)
//     ];
// }
