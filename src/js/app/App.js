/**
/* @module app/App
/*/
"use strict";


/** @type {module:underscore} */
var _ = require("underscore");

// if (DEBUG) {
	console.prefix = "# ";
	var shift = [].shift;
	var logWrapFn = function() {
		if (typeof arguments[1] == "string") arguments[1] = console.prefix + arguments[1];
		return shift.apply(arguments).apply(console, arguments);
	};
	console.log = _.wrap(console.log, logWrapFn);
	console.info = _.wrap(console.info, logWrapFn);
	console.warn = _.wrap(console.warn, logWrapFn);
	console.error = _.wrap(console.error, logWrapFn);
// }

console.log("App first statement");

require("Modernizr");
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

// Modernizr.promises || require("es6-promise").polyfill();
// Modernizr.classlist || require("classlist-polyfill");
// Modernizr.raf || require("raf-polyfill");

require("es6-promise").polyfill();
require("classlist-polyfill");
require("raf-polyfill");
require("matches-polyfill");
require("fullscreen-polyfill");

/** @type {module:backbone} */
var Backbone = require("backbone");
Backbone.$ = require("backbone.native");
require("backbone.babysitter");
require("Backbone.Mutators");
require("hammerjs");

// handle error events on some platforms and production
if (/iPad|iPhone/.test(window.navigator.userAgent)) {
	window.addEventListener("error", function(ev) {
		window.alert(ev.type + ": " + JSON.stringify(ev, null, " "));
	});
} else if (!window.DEBUG) { 
	window.addEventListener("error", function(ev) {
		console.error("uncaught error", ev);
	});
}

window.addEventListener("load", function(ev) {
// document.addEventListener('DOMContentLoaded', function() {
	try {
		// process bootstrap data, let errors go up the stack
		require("app/model/bootstrap")(window.bootstrap);
	// } catch (err) {
	// 	// document.body.innerHTML = "<h1>Oops... </h1>";
	// 	// document.documentElement.classList.remove("app-initial");
	// 	// document.documentElement.classList.add("app-error");
	// 	throw new Error("bootstrap data is missing");
	} finally {
		// detele global var
		delete window.bootstrap; 
	}
	
	require("app/view/template/_helpers");
	// require("app/view/template/_partials");
	/** @type {module:app/view/helper/createColorStyleSheet} */
	require("app/view/helper/createColorStyleSheet").call();
	
	/** @type {module:app/view/AppView} */
	var AppView = require("app/view/AppView");
	
	/** @type {module:webfontloader} */
	var WebFont = require("webfontloader");
	WebFont.load({
		classes: false,
		custom: {
			families: [
				"FolioFigures-Regular", 
				"Franklin Gothic FS",
				"ITCFranklinGothicStd-Compressed"
			],
			testStrings: { 
				"FolioFigures-Regular": "hms"
			},
		},
		loading: function() {
			console.log("webfontloader::loading");
		},
		active: function() { 
			console.log("webfontloader::active"); 
			AppView.getInstance();
		},
		inactive: function() {
			console.log("webfontloader::inactive");
			AppView.getInstance();
		},
		// fontloading: function(familyName, fvd) {},
		// fontactive: function(familyName, fvd) {},
		// fontinactive: function(familyName, fvd) {},
	});
});
