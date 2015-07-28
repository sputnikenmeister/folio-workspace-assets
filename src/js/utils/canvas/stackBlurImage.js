var stackBlurCanvasRGBA = require("./blur/stackBlurCanvasRGBA");
var stackBlurCanvasRGB = require("./blur/stackBlurCanvasRGB");
var stackBlurCanvasMono = require("./blur/stackBlurCanvasMono");

module.exports = function ( img, canvas, radius, width, height, opts ) {
	opts || (opts = {});
	
	var w = width || img.naturalWidth;
	var h = height || img.naturalHeight;
	
	canvas.style.width  = w + "px";
	canvas.style.height = h + "px";
	canvas.width = w;
	canvas.height = h;
	
	var context = canvas.getContext("2d");
	context.clearRect( 0, 0, w, h );
	context.drawImage( img, 0, 0, w, h );
	
	if ( isNaN(radius) || radius < 1 ) return;
	
	switch (opts.channels) {
		case "rgba":
			stackBlurCanvasRGBA( canvas, 0, 0, w, h, radius, opts );
			break;
		case "mono":
			stackBlurCanvasMono( canvas, 0, 0, w, h, radius, opts );
			break;
		default:
			stackBlurCanvasRGB( canvas, 0, 0, w, h, radius, opts );
			break;
	}
};

/*

// if ( opts.channels == "rgba" )
// 	stackBlurCanvasRGBA( canvas, 0, 0, w, h, radius );
// if ( opts.channels == "mono" )
// 	stackBlurCanvasMono( canvas, 0, 0, w, h, radius );
// else 
// 	stackBlurCanvasRGB( canvas, 0, 0, w, h, radius );

// canvas.style.width = (width > 0? Math.min(w, width) : w) + "px";
// canvas.style.height = (height > 0? Math.min(h, height) : h) + "px";

try {
	try {
		imageData = context.getImageData( top_x, top_y, width, height );
	} catch(e) {
		// NOTE: this part is supposedly only needed if you want to work with local files
		// so it might be okay to remove the whole try/catch block and just use
		// imageData = context.getImageData( top_x, top_y, width, height );
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			imageData = context.getImageData( top_x, top_y, width, height );
		} catch(e) {
			alert("Cannot access local image");
			throw new Error("unable to access local image data: " + e);
			return;
		}
	}
} catch(e) {
	alert("Cannot access image");
	throw new Error("unable to access image data: " + e);
}

*/
