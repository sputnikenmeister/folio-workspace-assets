var stackBlurRGBA = require("./bitmap/stackBlurRGBA");
var stackBlurRGB = require("./bitmap/stackBlurRGB");
var stackBlurMono = require("./bitmap/stackBlurMono");
var duotone = require("./bitmap/duotone");

module.exports = function ( src, canvas, width, height, opts ) {
	opts || (opts = {});
	
	var w = width || src.naturalWidth || src.videoWidth || src.width;
	var h = height || src.naturalHeight || src.videoHeight || src.height;
	
	canvas.style.width  = w + "px";
	canvas.style.height = h + "px";
	canvas.width = w;
	canvas.height = h;
	
	var top_x = 0, top_y = 0;
	var context, imageData;
	
	context = canvas.getContext("2d");
	context.clearRect( 0, 0, w, h );
	context.drawImage( src, 0, 0, w, h );
	
	imageData = context.getImageData(top_x, top_y, w, h);
	// imageData = duotone(imageData, opts);
	
	switch (opts.filter) {
		case "duo":
			imageData = duotone(imageData, opts);
			break;
		case "rgba":
			imageData = stackBlurRGBA(imageData, opts);
			break;
		case "rgb":
			imageData = stackBlurRGB(imageData, opts);
			break;
		case "mono":
			imageData = stackBlurMono(imageData, opts);
			break;
	}
	
	context.putImageData(imageData, top_x, top_y);
};

/*
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
