/**
 * Some static helper functions
 * @module app/helper/Strings
 */

/**
 * Some static helper functions
 * @type {Object}
 */
var Strings = {
	stripTags: function(s) {
		return s.replace(/<[^>]+>/g, "");
	}
};
module.exports = Strings;
