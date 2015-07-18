/**
 * @module app/App
 */
"use strict";

console.log("App first statement");
console.log("Strict mode", (function() {
	try {
		/* jshint -W117 */
		undeclaredVar = 1;
		/* jshint +W117 */
	} catch (e) {
		return true;
	}
	return false;
})());

require("es6-promise").polyfill();
require("classlist-polyfill");
require("../shims/requestAnimationFrame");
require("../shims/matchesSelector");

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:jquery} */
var $ = require("jquery");
/** @type {module:backbone} */
var Backbone = require("backbone");

global.jQuery = Backbone.$ = $;
require("hammerjs");
require("jquery.transit");
require("jquery-color");
require("backbone.babysitter");
require("Backbone.Mutators");

//global._ = _;
//global.$ = $;

$(window).load(function(ev) {
// 	console.log("window.load()", document.readyState, arguments.length, arguments);
// $(document).ready(function($) {
// 	console.log("document.ready()", document.readyState, arguments.length, arguments);

	if (window.bootstrap === void 0) {
		console.error("bootstrap data missing");
		document.body.innerHTML = "<h1>Oops... </h1>";
		document.documentElement.classList.remove("app-initial");
		document.documentElement.classList.add("app-error");
		return;
	}

	/** @type {module:app/control/Globals} */
	var Globals = require("./control/Globals");
	$.fx.speeds._default = Globals.TRANSITION_DURATION;

	/** @type {module:app/model/collection/TypeCollection} */
	var typeList = require("./model/collection/TypeCollection");
	/** @type {module:app/model/collection/KeywordCollection} */
	var keywordList = require("./model/collection/KeywordCollection");
	/** @type {module:app/model/collection/BundleCollection} */
	var bundleList = require("./model/collection/BundleCollection");

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
// });
//
// $(window).load(function() {
// 	"use strict";
// 	console.log("window.load()", document.readyState, arguments.length, arguments);

	/** @type {module:app/view/AppView} */
	var AppView = require("./view/AppView");

	window.app = new AppView();
});
