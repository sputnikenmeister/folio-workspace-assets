module.exports = function(str) {
	// return str.replace(/-([a-z])/g, function($0, $1) {
	// 	return $1.toUpperCase();
	// });
	return str.split("-").reduce(function(ss, s, i, a) {
		return ss + (ss != "" ? s[0].toUpperCase() + s.slice(1) : s);
	});
};
