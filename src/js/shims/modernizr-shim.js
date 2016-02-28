require("modernizr-dist");

Modernizr._config.classPrefix = "has-";
Modernizr._config.enableClasses = false;
Modernizr.addTest("weakmap", function () { 
	return window.WeakMap !== void 0; 
});
/* jshint -W117 */
Modernizr.addTest("strictmode", function() {
	try { undeclaredVar = 1; }
	catch (e) { return true; }
	return false;
});
/* jshint +W117 */

module.exports = window.Modernizr;
