var toColorString =  function() {
	if (this.hasOwnProperty("a")) {
		return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
	} else {
		return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
	}
};

module.exports = function(str) {
	var m, res;
	if (m = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(str)) {
		res = {
			r: parseInt(m[1], 16),
			g: parseInt(m[2], 16),
			b: parseInt(m[3], 16)
		};
	} else if (m = /(rgba?)\(([^\)]+)\)/.exec(str)) {
		res = {};
		for (var i=0, k=m[1], v=m[2].split(","); i < k.length; i++) {
			res[k.charAt(i)] = parseInt(v[i], 10) || parseFloat(v[i], 10);
		}
	}
	if (res) {
		res.toColorString = toColorString.bind(res);
		return res;
	} else {
		return null;
	}
};
