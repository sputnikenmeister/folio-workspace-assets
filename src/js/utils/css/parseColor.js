var toRGBString =  function() {
	var s = this.r + ", " + this.g + ", " + this.b;
	if (this.hasOwnProperty("a")) {
		return "rgba(" + s + ", " + this.a + ")";
	} else {
		return "rgb(" + s + ")";
	}
};
var toHSLString =  function() {
	var s = this.h + ", " + this.s + "%, " + this.l + "%";
	if (this.hasOwnProperty("a")) {
		return "hsla(" + s + ", " + this.a + ")";
	} else {
		return "hsl(" + s + ")";
	}
};

module.exports = function(str) {
	var m, res = null;
	if (m = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(str)) {
		res = {
			r: parseInt(m[1], 16),
			g: parseInt(m[2], 16),
			b: parseInt(m[3], 16)
		};
		res.toColorString = toRGBString.bind(res);
	} else if (m = /(hsla?|rgba?)\(([^\)]+)\)/.exec(str)) {
		res = {};
		for (var i=0, k=m[1], v=m[2].split(","); i < k.length; i++) {
			res[k.charAt(i)] = parseInt(v[i], 10) || parseFloat(v[i], 10);
		}
		res.toColorString = (res.hasOwnProperty("h")? toHSLString : toRGBString).bind(res);
	}
	return res;
};
