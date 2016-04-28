module.exports = function(s) {
	return s.replace(/<[^>]+>/g, "");
};
