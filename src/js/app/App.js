/**
/* @module app/App
/*/
"use strict";

console.info("Portfolio App started");

if (!DEBUG) {
	window.addEventListener("error", function(ev) {
		console.error("Uncaught Error", ev);
	});
}

require("Modernizr");
require("es6-promise").polyfill();
require("classlist-polyfill");
require("raf-polyfill");
require("matches-polyfill");
require("fullscreen-polyfill");
require("math-sign-polyfill");
require("setimmediate");

require("backbone").$ = require("backbone.native");
require("backbone.babysitter");
require("Backbone.Mutators");
require("hammerjs");

// document.addEventListener('DOMContentLoaded', function(ev) {
// 	console.log("%s:[event %s]", ev.target, ev.type);
// });

window.addEventListener("load", function(ev) {
	console.log("%s:[event %s]", ev.target, ev.type);

	// process bootstrap data, let errors go up the stack
	try {
		require("app/model/helper/bootstrap")(window.bootstrap);
	} catch (err) {
		var el = document.querySelector(".app");
		el.classList.remove("app-initial");
		el.classList.add("app-error");
		throw new Error("bootstrap data error (" + err.message + ")", err.fileName, err.lineNumber);
	} finally { // detele global var
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
		async: true,
		classes: false,
		custom: {
			families: [
				// "Franklin Gothic FS:n4,n7",
				"Franklin Gothic FS:n4,i4,n7,i7",
				"FolioFigures:n4",
			],
			testStrings: {
				"FolioFigures": "hms"
			},
		},
		active: function() {
			console.info("WebFont::active");
			// AppView.getInstance();
		},
		fontactive: function(familyName, variantFvd) {
			console.info("WebFont::fontactive '%s' (%s)", familyName, variantFvd);
		},
		inactive: function() {
			console.warn("WebFont::inactive");
			// AppView.getInstance();
		},
		fontinactive: function(familyName, variantFvd) {
			console.warn("WebFont::fontinactive '%s' (%s)", familyName, variantFvd);
		},
		// loading: function() {
		// 	console.log("WebFont::loading");
		// },
		// fontloading: function(familyName, variantDesc) {
		// 	console.log("WebFont::fontloading", familyName, JSON.stringify(variantDesc, null, " "));
		// },
	});
	AppView.getInstance();
});


if (DEBUG) {
	// /** @type {module:underscore} */
	// var _ = require("underscore");

	// var isFF = /Firefox/.test(window.navigator.userAgent);
	// var isIOS = /iPad|iPhone/.test(window.navigator.userAgent);
	/*
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
	*/
	/*
	var saveLogs = function() {
		var logWrapFn = function(name, fn, msg) {
			document.documentElement.appendChild(
				document.createComment("[" + name + "] " + msg));
		};
		console.group = _.wrap(console.group, _.partial(logWrapFn, "group"));
		console.log = _.wrap(console.log, _.partial(logWrapFn, "log"));
		console.info = _.wrap(console.info, _.partial(logWrapFn, "info"));
		console.warn = _.wrap(console.warn, _.partial(logWrapFn, "warn"));
		console.error = _.wrap(console.error, _.partial(logWrapFn, "error"));
	};
	*/

	// handle error events on some platforms and production
	/*
	if (isIOS) {
		// saveLogs();
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
			html += "<pre><b>location:<b> " + window.location + "</pre>";
			html += "<pre><b>event:<b> " + JSON.stringify(args.shift(), null, " ") + "</pre>";
			if (args.length) html += "<pre><b>rest:<b> " + JSON.stringify(args, null, " ") + "</pre>";
			el.innerHTML = html;
			document.body.appendChild(el);
		});
	}*/
}