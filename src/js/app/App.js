/**
 * @module app/App
 */
"use strict";

console.log("App first statement");

require("Modernizr");
Modernizr._config.classPrefix = "has-";
Modernizr._config.enableClasses = false;
Modernizr.addTest("weakmap", function () { 
	return window.WeakMap !== void 0; 
});
Modernizr.addTest("strictmode", function testStrictMode() {
	try {
		/* jshint -W117 */
		undeclaredVar = 1;
		/* jshint +W117 */
		return false;
	} catch (e) {
		return true;
	}
});
// Modernizr.promises || require("es6-promise").polyfill();
// Modernizr.classlist || require("classlist-polyfill");
// Modernizr.raf || require("raf-polyfill");

require("es6-promise").polyfill();
require("classlist-polyfill");
require("raf-polyfill");
require("matches-polyfill");
require("fullscreen-polyfill");

/** @type {module:underscore} */
var _ = require("underscore");

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
	if (window.bootstrap === void 0) {
		throw new Error("bootstrap data is missing");
		// document.body.innerHTML = "<h1>Oops... </h1>";
		// document.documentElement.classList.remove("app-initial");
		// document.documentElement.classList.add("app-error");
		// return;
	}

	/** @type {module:app/model/collection/TypeCollection} */
	var typeList = require("app/model/collection/TypeCollection");
	/** @type {module:app/model/collection/KeywordCollection} */
	var keywordList = require("app/model/collection/KeywordCollection");
	/** @type {module:app/model/collection/BundleCollection} */
	var bundleList = require("app/model/collection/BundleCollection");

	var types = window.bootstrap["types-all"];
	var keywords = window.bootstrap["keywords-all"];
	var bundles = window.bootstrap["bundles-all"];
	var media = window.bootstrap["media-all"];
	// Fix-ups to bootstrap data.

	// Attach media to their bundles
	var mediaByBundle = _.groupBy(media, "bId");
	// Fill-in back-references:
	// Create Keyword.bundleIds from existing Bundle.keywordIds,
	// then Bundle.typeIds from unique Keyword.typeId
	_.each(bundles, function (bo, bi, ba) {
		bo.tIds = [];
		bo.media = mediaByBundle[bo.id];
		_.each(keywords, function (ko, ki, ka) {
			if (bi === 0) { ko.bIds = []; }
			if (_.contains(bo.kIds, ko.id)) {
				ko.bIds.push(bo.id);
				if (!_.contains(bo.tIds, ko.tId)) {
					bo.tIds.push(ko.tId);
				}
			}
		});
	});
	// Fill collection singletons
	typeList.reset(types);
	keywordList.reset(keywords);
	bundleList.reset(bundles);
	// detele global var
	delete window.bootstrap;
	
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
			console.log("Webfont loading");
		},
		active: function() { 
			console.log("Webfont active"); 
			AppView.getInstance();
		},
		inactive: function() {
			console.log("Webfont inactive");
			AppView.getInstance();
		},
		// fontloading: function(familyName, fvd) {},
		// fontactive: function(familyName, fvd) {},
		// fontinactive: function(familyName, fvd) {},
	});
});
