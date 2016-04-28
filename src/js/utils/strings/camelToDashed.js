module.exports = function(str) {
	return str.replace(/[A-Z]/g, function($0) {
		return "-" + $0.toLowerCase();
	});
};
