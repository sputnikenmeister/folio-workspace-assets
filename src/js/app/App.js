/**
 * @module app/App
 */
"use strict";

function testStrictMode() {
	try {
		/* jshint -W117 */
		undeclaredVar = 1;
		/* jshint +W117 */
	} catch (e) {
		return true;
	}
	return false;
}

function testWeakMap() {
	return window.WeakMap !== void 0;
}

console.log("App first statement");
console.log("Strict mode", testStrictMode());

require("Modernizr");
Modernizr._config.classPrefix = "has-";
Modernizr._config.enableClasses = false;
Modernizr.addTest("strictmode", testStrictMode);
Modernizr.addTest("weakmap", testWeakMap);

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

window.addEventListener("error", function(ev) {
	if (/iPad/.test(window.navigator.userAgent)) {
		window.alert(ev.type + ": " + JSON.stringify(ev, null, " "));
	} else { 
		console.error("uncaught error", ev);
	}
});

window.addEventListener("load", function(ev) {
// document.addEventListener('DOMContentLoaded', function() {
	
	if (window.bootstrap === void 0) {
		console.error("bootstrap data missing");
		document.body.innerHTML = "<h1>Oops... </h1>";
		document.documentElement.classList.remove("app-initial");
		document.documentElement.classList.add("app-error");
		return;
	}
	
	/** @type {module:app/control/Globals} */
	// var Globals = require("app/control/Globals");
	// $.fx.speeds._default = Globals.TRANSITION_DURATION;

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
	delete window.bootstrap;
	
	require("app/view/template/_helpers");
	// require("app/view/template/_partials");
	
	/** @type {module:app/view/AppView} */
	var AppView = require("app/view/AppView");
	
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
		// fontloading: function(familyName, fvd) { console.log("Webfont fontloading: %s (%s)", familyName, fvd); },
		// fontactive: function(familyName, fvd) { console.log("Webfont fontactive: %s (%s)", familyName, fvd); },
		// fontinactive: function(familyName, fvd) { console.log("Webfont fontinactive: %s (%s)", familyName, fvd); }
	});
});
