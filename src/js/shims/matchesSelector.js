
// ep.matchesSelector = ep.matchesSelector || ep.mozMatchesSelector ||ep.msMatchesSelector || ep.oMatchesSelector || ep.webkitMatchesSelector
(function(ep) {
	var vendors = ["ms", "moz", "webkit", "o"], x;
	for (x = 0; x < vendors.length && !ep.matches; ++x) {
		ep.matches = ep[vendors[x] + "MatchesSelector"];
	}
	if (!ep.matches) {
		// @see https://gist.github.com/jonathantneal/3062955
		ep.matches = function (selector) {
			var node = this,
				nodes = (node.parentNode || node.document).querySelectorAll(selector),
				i = -1;
			while (nodes[++i] && nodes[i] != node);
			return !!nodes[i];
		};
	}
})(window.Element.prototype);

module.exports = window.Element.prototype.matches;
