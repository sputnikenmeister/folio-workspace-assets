/**
 * @module utils/net/toAbsoluteURL
 */

var a;
/**
 * @param url String URL relative to current document
 * @returns Absolute URL
 */
module.exports = function(url) {
	a = a || document.createElement('a');
	a.href = url;
	return a.href;
};
