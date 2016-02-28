/**
/* @module app/App
/*/
"use strict";

/** @type {module:underscore} */
var _ = require("underscore");

if (DEBUG) {
	if (/Firefox/.test(window.navigator.userAgent)) {
		console.prefix = "# ";
		var shift = [].shift;
		var logWrapFn = function() {
			if (typeof arguments[1] == "string") arguments[1] = console.prefix + arguments[1];
			return shift.apply(arguments).apply(console, arguments);
		};
		console.group = _.wrap(console.group, logWrapFn);
		console.log = _.wrap(console.log, logWrapFn);
		console.info = _.wrap(console.info, logWrapFn);
		console.warn = _.wrap(console.warn, logWrapFn);
		console.error = _.wrap(console.error, logWrapFn);
	}
	// handle error events on some platforms and production
	if (/iPad|iPhone/.test(window.navigator.userAgent)) {
		window.addEventListener("error", function() {
			var args = Array.prototype.slice.apply(arguments),
				el = document.createElement("div"),
				html = "";
			_.extend(el.style, {
				fontfamily: "monospace",
				display: "block",
				position: "absolute",
				zIndex: "999",
				backgroundColor: "white",
				color: "black",
				width: "calc(100% - 3em)",
				bottom: "0",
				margin: "1em 1.5em",
				padding: "1em 1.5em",
				outline: "0.5em solid red",
				outlineOffset: "0.5em",
				boxSizing: "border-box",
				overflow: "hidden",
			});
			html +=  "<pre><b>location:<b> " + window.location + "</pre>";
			html += "<pre><b>event:<b> " + JSON.stringify(args.shift(), null, " ") + "</pre>";
			if (args.length) html += "<pre><b>rest:<b> " + JSON.stringify(args, null, " ") + "</pre>";
			el.innerHTML = html;
			document.body.appendChild(el);
		});
	} else { 
		window.addEventListener("error", function(ev) {
			console.error("Uncaught Error", ev);
		});
	}
}

console.log("App first statement (DEBUG: %s)", DEBUG);

require("Modernizr");

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

// document.addEventListener('DOMContentLoaded', function() {
// });

window.addEventListener("load", function(ev) {
	try {
		// process bootstrap data, let errors go up the stack
		require("app/model/helper/bootstrap")(window.bootstrap);
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
				"Franklin Gothic FS:n4,i4,n7,i7",
				"ITCFranklinGothicStd-Compressed",
				"FolioFigures-Regular", 
			],
			testStrings: { 
				"FolioFigures-Regular": "hms"
			},
		},
		active: function() { 
			console.log("WebFont::active"); 
			AppView.getInstance();
		},
		fontactive: function(familyName, variantFvd) {
			console.log("WebFont::fontactive '%s' (%s)", familyName, variantFvd);
		},
		inactive: function() {
			console.log("WebFont::inactive");
			AppView.getInstance();
		},
		fontinactive: function(familyName, variantFvd) {
			console.log("WebFont::fontinactive '%s' (%s)", familyName, variantFvd);
		},
		// loading: function() {
		// 	console.log("WebFont::loading");
		// },
		// fontloading: function(familyName, variantDesc) {
		// 	console.log("WebFont::fontloading", familyName, JSON.stringify(variantDesc, null, " "));
		// },
	});
});
