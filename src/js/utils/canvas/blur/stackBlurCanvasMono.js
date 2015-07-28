/* jshint ignore:start */
/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version:  0.5
Author: Mario Klingemann
Contact:  mario@quasimondo.com
Website: http://www.quasimondo.com/StackBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var mul_table = require("./mul_table");
var shg_table = require("./shg_table");
var BlurStack = require("./BlurStack");

module.exports = function(canvas, top_x, top_y, width, height, radius, opts) {
	if (isNaN(radius) || radius < 1) return;
	radius |= 0;

	var context = canvas.getContext("2d");
	var imageData = context.getImageData(top_x, top_y, width, height);
	var pixels = imageData.data;

	var x, y, i, p, yp, yi, yw,
		r_sum, r_out_sum, r_in_sum,
		pr, pg, pb, rbs;

	var div = radius + radius + 1;
	var w4 = width << 2;
	var widthMinus1 = width - 1;
	var heightMinus1 = height - 1;
	var radiusPlus1 = radius + 1;
	var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

	var stackStart = new BlurStack();
	var stack = stackStart;
	for (i = 1; i < div; i++) {
		stack = stack.next = new BlurStack();
		if (i == radiusPlus1) var stackEnd = stack;
	}
	stack.next = stackStart;
	var stackIn = null;
	var stackOut = null;

	yw = yi = 0;

	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];

	var pixelsNum = pixels.length;

	for (i = 0; i < pixelsNum; i += 4) {
		pixels[i] = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.144;
	}

	for (y = 0; y < height; y++) {
		r_in_sum = r_sum = 0;
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		r_sum += sumFactor * pr;
		stack = stackStart;

		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack = stack.next;
		}

		for (i = 1; i < radiusPlus1; i++) {
			p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
			r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
			r_in_sum += pr;
			stack = stack.next;
		}

		stackIn = stackStart;
		stackOut = stackEnd;
		for (x = 0; x < width; x++) {
			pixels[yi] = (r_sum * mul_sum) >> shg_sum;
			r_sum -= r_out_sum;
			r_out_sum -= stackIn.r;
			p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
			r_in_sum += (stackIn.r = pixels[p]);
			r_sum += r_in_sum;
			stackIn = stackIn.next;
			r_out_sum += (pr = stackOut.r);
			r_in_sum -= pr;
			stackOut = stackOut.next;
			yi += 4;
		}
		yw += width;
	}

	for (x = 0; x < width; x++) {
		r_in_sum = r_sum = 0;
		yi = x << 2;
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		r_sum += sumFactor * pr;
		stack = stackStart;

		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack = stack.next;
		}

		yp = width;

		for (i = 1; i <= radius; i++) {
			yi = (yp + x) << 2;
			r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
			r_in_sum += pr;
			stack = stack.next;
			if (i < heightMinus1) {
				yp += width;
			}
		}

		yi = x;
		stackIn = stackStart;
		stackOut = stackEnd;
		for (y = 0; y < height; y++) {
			p = yi << 2;
			pixels[p] = (r_sum * mul_sum) >> shg_sum;
			r_sum -= r_out_sum;
			r_out_sum -= stackIn.r;
			p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
			r_sum += (r_in_sum += (stackIn.r = pixels[p]));
			stackIn = stackIn.next;
			r_out_sum += (pr = stackOut.r);
			r_in_sum -= pr;
			stackOut = stackOut.next;
			yi += width;
		}
	}
	
	var r1, g1, b1, w1, r2, g2, b2, w2;
	if (opts && opts.x00 && opts.xFF) {
		
		r1 = opts.xFF.red();
		g1 = opts.xFF.green();
		b1 = opts.xFF.blue();
		
		r2 = opts.x00.red();
		g2 = opts.x00.green();
		b2 = opts.x00.blue();
		
		for (i = 0; i < pixelsNum; i += 4) {
			w1 = pixels[i] / 256;
			// w1 = 2 * (pixels[i] / 256) - 1;
			w2 = 1 - w1;
			pixels[i]     = (w1 * r1 + w2 * r2);
			pixels[i + 1] = (w1 * g1 + w2 * g2);
			pixels[i + 2] = (w1 * b1 + w2 * b2);
		}
	} else {
		for (i = 0; i < pixelsNum; i += 4) {
			pixels[i+2] = pixels[i+1] = pixels[i];
			// pixels[i + 2] = pixels[i + 1] = pixels[i] = pixels[i] / 2 + 127;
		}
	}


	context.putImageData(imageData, top_x, top_y);
};

/* jshint ignore:end */
