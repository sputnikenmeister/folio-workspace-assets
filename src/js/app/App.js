/**
 * @module app/App
 */

/** @type {module:jquery} */
var $ = require("jquery");
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
// require("backbone.babysitter");
// require("backbone.cycle");
Backbone.$ = $;

/** @type {module:app/model/collection/BundleList} */
var bundleList = require("./model/collection/BundleList");
/** @type {module:app/model/collection/KeywordList} */
var keywordList = require("./model/collection/KeywordList");
/** @type {module:app/model/collection/TypeList} */
var typeList = require("./model/collection/TypeList");
/** @type {module:app/model/collection/ImageList} */
var imageList = require("./model/collection/ImageList");

/** @type {module:app/control/AppRouter} */
var router = require("./control/AppRouter");
/** @type {module:app/view/AppView} */
var AppView = require("./view/AppView");

$(document).ready(function ($) {
	"use strict";
	var keywords, bundles, types, images, approot;

	if (window.bootstrap) {
		types = window.bootstrap["all-types"],
		keywords = window.bootstrap["all-keywords"],
		bundles = window.bootstrap["all-bundles"],
		images = window.bootstrap["all-images"],

		// Fill-in back-references:
		// Create Keyword.bundleIds from existing Bundle.keywordIds,
		// then Bundle.typeIds from unique Keyword.typeId
		_.each(bundles, function (bo, bi, ba) {
			bo.tIds = [];
			_.each(keywords, function (ko, ki, ka) {
				if (bi === 0) ko.bIds = [];
				if (_.contains(bo.kIds, ko.id)) {
					ko.bIds.push(bo.id);
					if (!_.contains(bo.tIds, ko.tId)) {
						bo.tIds.push(ko.tId);
					}
				}
			});
		});

		bundleList.reset(bundles);
		imageList.reset(images);
		keywordList.reset(keywords);
		typeList.reset(types);

		router.setApplicationRoot(window.bootstrap["root"]);

		/* jshint -W051 */
		delete window.bootstrap;
		/* jshint +W051 */
	}

	window.app = new AppView();
});
