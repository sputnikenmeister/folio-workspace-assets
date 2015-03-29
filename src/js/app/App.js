/**
 * @module app/App
 */
console.log("App.js", "first-line");

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:jquery} */
var $ = require("jquery");
/** @type {module:backbone} */
var Backbone = require("backbone");

window.jQuery = Backbone.$ = $;
require("hammerjs");
require("jquery.transit");
require("jquery-color");
require("backbone.babysitter");
require("Backbone.Mutators");

$(window).load(function() {
//$(document).ready(function() {
	"use strict";
//	console.log("App.ready()", arguments.length, arguments);
	console.log("App.load()", arguments.length, arguments);

	/** @type {module:app/model/collection/TypeList} */
	var typeList = require("./model/collection/TypeList");
	/** @type {module:app/model/collection/KeywordList} */
	var keywordList = require("./model/collection/KeywordList");
	/** @type {module:app/model/collection/BundleList} */
	var bundleList = require("./model/collection/BundleList");
	/** @type {module:app/view/AppView} */
	var AppView = require("./view/AppView");

	(function(){
		if (window.bootstrap === void 0) {
			console.error("bootstrap data missing");
			return;
		}

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
	})();

	window.app = new AppView();
});
