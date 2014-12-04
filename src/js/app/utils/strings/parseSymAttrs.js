/* specific to symphony's taglist */
module.exports = function (s, m1, m2) {
	return s.replace(/(\,|\;)/g, function (m) {
		return (m == ",") ? ";" : ",";
	});
};
