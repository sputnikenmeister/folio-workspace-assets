/* global HTMLElement, CSSStyleDeclaration */

// var parseSize = require("./parseSize");

var CSS_BOX_PROPS = [
	"boxSizing", "position", "objectFit"
];
var CSS_EDGE_PROPS = [
	"marginTop", "marginBottom", "marginLeft", "marginRight",
	"borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth",
	"paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
];
var CSS_POS_PROPS = ["top", "bottom", "left", "right"];
var CSS_SIZE_PROPS = ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"];
var CSS_ALL_PROPS = CSS_EDGE_PROPS.concat(CSS_SIZE_PROPS, CSS_POS_PROPS);

// var COMPUTED_PROPS = [
// 	"clientLeft", "clientTop", "clientWidth", "clientHeight",
// 	"offsetLeft", "offsetTop", "offsetWidth", "offsetHeight"
// ];
// var o = _.pick(element, function(val) {
// 	return /^(offset|client)(Left|Top|Width|Height)/.test(val);
// });

var cssDimensionRE = /^(-?[\d\.]+)(px|em|rem)$/;
// var cssDimRe = /^([-\.0-9]+)([rem]+)$/;

module.exports = function(s, m, includeSizePos) {
	if (s instanceof HTMLElement) {
		s = getComputedStyle(s);
	}
	if (DEBUG) {
		if (!(s instanceof CSSStyleDeclaration)) {
			throw new Error("Not a CSSStyleDeclaration nor HTMLElement");
		}
	}
	var v, p, i, ii, emPx, remPx;
	m || (m = {});

	emPx = m.fontSize = parseFloat(s.fontSize);

	for (i = 0, ii = CSS_BOX_PROPS.length; i < ii; i++) {
		p = CSS_BOX_PROPS[i];
		if (p in s) {
			m[p] = s[p];
		}
	}
	var cssProps = includeSizePos ? CSS_EDGE_PROPS : CSS_ALL_PROPS;
	for (i = 0, ii = cssProps.length; i < ii; i++) {
		p = cssProps[i];
		m["_" + p] = s[p];
		if (s[p] && (v = cssDimensionRE.exec(s[p]))) {
			if (v[2] === "px") {
				m[p] = parseFloat(v[1]);
			} else if (v[2] === "em") {
				m[p] = parseFloat(v[1]) * emPx;
			} else if (v[2] === "rem") {
				remPx || (remPx = parseFloat(getComputedStyle(document.documentElement).fontSize));
				m[p] = parseFloat(v[1]) * remPx;
			} else {
				console.warn("Ignoring value", p, v[1], v[2]);
				m[p] = null;
			}
		} // else {
		//	console.warn("Ignoring unitless value", p, v);
		//}
	}
	return m;
};
