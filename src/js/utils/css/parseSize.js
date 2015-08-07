
// var CSS_BOX_PROPS =  [
// 	"top", "bottom", //"left", "right",
// 	"paddingTop","paddingBottom",//"paddingLeft","paddingRight",
// 	"marginTop","marginBottom",//"marginLeft","marginRight"
// ];

// var _documentFontSize;
// function getDocumentFontSize() {
// 	// Returns a number of the computed font-size, so it is guaranteed to be in px
// 	return _documentFontSize || (_documentFontSize = parseFloat(
// 		window.getComputedStyle(document.documentElement).fontSize));
// }

// function measure(el)
// {
// 	var prop, val, ret = {}, styles = window.getComputedStyle(el);
// 	for (var i = 0; i < CSS_BOX_PROPS.length; i++)
// 	{
// 		prop = CSS_BOX_PROPS[i];
// 		if (prop in styles)
// 		{
// 			val = styles[prop];
// 			if (val.indexOf("px")) {
// 				ret[prop] = parseFloat(val);
// 			} else if (/em$/.test(val)) {
// 				ret[prop] = parseFloat(val) * styles.fontSize;
// 			} else if (/rem$/.test(val)) {
// 				ret[prop] = parseFloat(val) * getDocumentFontSize();
// 			} else {
// 				console.warn("unit " + val[2] + " not recognized in " + styles[prop]);
// 				ret[prop] = 0;
// 			}
// 			//val = val.match(/^([-\.0-9]+)([rem]+)$/);
// 		}
// 	}
// 	// return ret;
// 	return _.extend(ret, {
// 		// el: 			el,
// 		clientTop: 		el.clientTop,
// 		clientHeight: 	el.clientHeight,
// 		offsetTop: 		el.offsetTop,
// 		offsetHeight: 	el.offsetHeight,
// 	});
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
