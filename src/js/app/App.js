/**
 * @module app/App
 */
"use strict";

console.info(`Portfolio App started GIT:${GIT_REV}`);

// if (!DEBUG) {
// 	window.addEventListener("error", function(ev) {
// 		console.error("Uncaught Error", ev);
// 	});
// }

/*
var features = [
	'default-3.4',
	// 'Date.now',
	// 'Element.prototype.classList',
	// 'Element.prototype.matches',
	// 'Event.hashchange',
	// 'Function.prototype.bind',
	'IntersectionObserver',
	'IntersectionObserverEntry',
	'Math.sign',
	'MutationObserver',
	// 'Object.create',
	// 'Object.defineProperties',
	// 'Object.defineProperty',
	// 'Object.keys',
	'Promise',
	'Promise.prototype.finally',
	'devicePixelRatio',
	'document.head',
	// 'document.querySelector',
	// 'document.visibilityState',
	'getComputedStyle',
	'matchMedia',
	// 'requestAnimationFrame',
	'setImmediate',
];

if (features.length) {
  var s = document.createElement('script');
  s.src = 'https://cdn.polyfill.io/v2/polyfill.min.js?features='+features.join(',')+'&callback=main';
  s.async = true;
  document.head.appendChild(s);
} else {
	main();
}
function main() {
	console.log('Now to do the cool stuff...');
}

if (DEBUG) {
	require("Modernizr");
}
require("setimmediate");
require("es6-promise/auto");
require("classlist-polyfill");
require("raf-polyfill");
require("matches-polyfill");
require("fullscreen-polyfill");
require("math-sign-polyfill");
require("mutation-observer");
// require("path2d-polyfill");
*/

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

	/** @type {module:app/view/helper/createColorStyleSheet} */
	require("app/view/helper/createColorStyleSheet").call(); /** @type {module:app/view/AppView} */
	var AppView = require("app/view/AppView");
	// var startApp = AppView.getInstance.bind(AppView);

	/** @type {module:webfontloader} */
	var WebFont = require("webfontloader");
	var loadOpts = {
		async: false,
		groupName: "",
		classes: false,
		loading: function() {
			console.log("WebFont:%s:loading", this.groupName);
		},
		active: function() {
			console.info("WebFont:%s:active", this.groupName);
		},
		inactive: function() {
			console.warn("WebFont:%s:inactive", this.groupName);
		},
		fontactive: function(familyName, variantFvd) {
			console.info("WebFont:%s:fontactive '%s' (%s)", this.groupName, familyName, variantFvd);
		},
		fontinactive: function(familyName, variantFvd) {
			console.warn("WebFont:%s:fontinactive '%s' (%s)", this.groupName, familyName, variantFvd);
		},
		// fontloading: function(familyName, variantDesc) {
		// 	console.log("WebFont::fontloading", familyName, JSON.stringify(variantDesc, null, " "));
		// },
	};

	WebFont.load(_.defaults({
		async: false,
		groupName: "required",
		custom: {
			families: [
				"FranklinGothicFS:n4,n6",
				// "FranklinGothicFS:i4,i6"
				"FolioFigures:n4",
			],
			testStrings: {
				"FolioFigures": "hms"
			},
		},
		active: () => AppView.getInstance(),
		inactive: () => AppView.getInstance(),
	}, loadOpts));

	WebFont.load(_.defaults({}, loadOpts));

	// requestAnimationFrame(function(tstamp) {
	// 	AppView.getInstance();
	// });
});


// if (DEBUG) {
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
// }
