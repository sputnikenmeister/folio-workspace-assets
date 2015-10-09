// var _documentFontSize;
// function getDocumentFontSize() {
// 	// Returns a number of the computed font-size, so it is guaranteed to be in px
// 	return _documentFontSize || (_documentFontSize = parseFloat(
// 		window.getComputedStyle(document.documentElement).fontSize));
// }

module.exports = function(val, el) {
	//val = val.match(/^(-?[\d\.]+)(px|em|rem)?$/);
	if (val.indexOf("px")) {
		return parseFloat(val);
	} else if (/rem$/.test(val)) {
		return parseFloat(val) * window.getComputedStyle(document.documentElement).fontSize;
	} else if (/em$/.test(val) && el) {
		return parseFloat(val) * window.getComputedStyle(el).fontSize;
	} else {
		console.warn("unit not recognized in " + val);
		return NaN;
	}
};
