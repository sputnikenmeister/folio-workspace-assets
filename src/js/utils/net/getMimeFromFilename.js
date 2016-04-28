/*
	Image download example:
	
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "blob";
	
	var mime = getMimeFromFilename(url);
	mime && request.overrideMimeType(mime + "; charset=x-user-defined");
	
	request.send();
*/

var MIME_TYPES = {
	png: "image\/png",
	jpg: "image\/jpeg"
};
module.exports = function(filename) {
	try {
		return MIME_TYPES[filename.match(/\w+$/)[0].toLowerCase()];
	} catch (ex) {
		return void 0;
	}
}
