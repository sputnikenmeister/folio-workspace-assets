// var parseSize = require("./parseSize");

var CSS_BOX_PROPS = [ "boxSizing", "position", "objectFit" ];
// var CSS_POS_PROPS = [ "top", "bottom", "left", "right"];
// var CSS_SIZE_PROPS = [ "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"];
var CSS_EDGE_PROPS = [
	"marginTop","marginBottom","marginLeft","marginRight",
	"borderTopWidth","borderBottomWidth","borderLeftWidth","borderRightWidth",
	"paddingTop","paddingBottom","paddingLeft","paddingRight",
];
// var o = _.pick(element, function(val) {
// 	return /^(offset|client)(Left|Top|Width|Height)/.test(val);
// });
var COMPUTED_PROPS = [
	"clientLeft",
	"clientTop",
	"clientWidth",
	"clientHeight",
	"offsetLeft",
	"offsetTop",
	"offsetWidth",
	"offsetHeight"
];
var cssDimRe = /^(-?[\d\.]+)(px|em|rem)$/;
// var cssDimRe = /^([-\.0-9]+)([rem]+)$/;

module.exports = function(el, m) {
	var v, p, i, ii, emPx, remPx;
	var s = getComputedStyle(el);
	m || (m = {});
	
	emPx = m.fontSize = parseFloat(s.fontSize);
	
	for (i = 0, ii = CSS_BOX_PROPS.length; i < ii; i++) {
		p = CSS_BOX_PROPS[i];
		if (p in s) {
			m[p] = s[p];
		}
	}
	
	for (i = 0, ii = CSS_EDGE_PROPS.length; i < ii; i++) {
		p = CSS_EDGE_PROPS[i];
		if (s[p] && (v = cssDimRe.exec(s[p]))) {
			if (v[2] === "px") {
				m[p] = parseFloat(v[1]);
			} else if (v[2] === "em") {
				m[p] = parseFloat(v[1]) * emPx;
			} else if (v[2] === "rem") {
				remPx || (remPx = parseFloat(getComputedStyle(document.documentElement).fontSize));
				m[p] = parseFloat(v[1]) * remPx;
			} else {
				console.warn("Ignoring value", p, v[1], v[2]);
			}
		} else {
			// console.warn("Ignoring unitless value", p, v);
		}
	}
	return m;
};
