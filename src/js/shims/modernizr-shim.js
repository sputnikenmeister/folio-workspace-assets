require("modernizr-dist");

Modernizr._config.classPrefix = "mod-";
Modernizr._config.enableClasses = false;
Modernizr._config.enableJSClasses = false;
Modernizr.addTest("weakmap", function() {
	return window.WeakMap !== void 0;
});
/* eslint-disable no-undef */
Modernizr.addTest("strictmode", function() {
	try { undeclaredVar = 1; } catch (e) { return true; }
	return false;
});
/* eslint-enable no-undef */

module.exports = window.Modernizr;
