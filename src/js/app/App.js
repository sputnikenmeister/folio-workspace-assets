/**
 * @module app/App
 */
console.log("App first line");

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
	"use strict";
//	console.log("window.load()", document.readyState, arguments.length, arguments);
// $(document).ready(function($) {
// 	"use strict";
// 	console.log("document.ready()", document.readyState, arguments.length, arguments);

	if (window.bootstrap === void 0) {
		console.error("bootstrap data missing");
		$(document.body).empty().html("<h1>Oops... </h1>");
		$(document.documentElement).removeClass("app-initial").addClass("app-error");
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
	var images = window.bootstrap["images-all"];
	// Fix-ups to bootstrap data.

	// Attach images to their bundles
	var imagesByBundle = _.groupBy(images, "bId");
	// Fill-in back-references:
	// Create Keyword.bundleIds from existing Bundle.keywordIds,
	// then Bundle.typeIds from unique Keyword.typeId
	_.each(bundles, function (bo, bi, ba) {
		bo.tIds = [];
		bo.images = imagesByBundle[bo.id];
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

	/* jshint -W051 */
	delete window.bootstrap;
	/* jshint +W051 */
// });
//
// $(window).load(function() {
// 	"use strict";
// 	console.log("window.load()", document.readyState, arguments.length, arguments);

	/** @type {module:app/view/AppView} */
	var AppView = require("./view/AppView");

	window.app = new AppView();
});
