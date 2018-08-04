module.exports = function(a1, a2, dest) {
	return a1.reduce(function(res, o, i, a) {
		if (a2.indexOf(o) == -1) res.push(o);
		return res;
	}, (dest !== void 0) ? dest : []);
};