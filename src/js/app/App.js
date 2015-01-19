/**
 * @module app/App
 */

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

$(document).ready(function() {
	"use strict";

	/** @type {module:app/view/AppView} */
	var AppView = require("./view/AppView");

	(function(){
		/** @type {module:app/model/collection/TypeList} */
		var typeList = require("./model/collection/TypeList");
		/** @type {module:app/model/collection/KeywordList} */
		var keywordList = require("./model/collection/KeywordList");
		/** @type {module:app/model/collection/BundleList} */
		var bundleList = require("./model/collection/BundleList");

		// Fix-ups to bootstrap data.
		if (window.bootstrap) {
			var types, keywords, bundles, images;

			types = window.bootstrap["types-all"];
			keywords = window.bootstrap["keywords-all"];
			bundles = window.bootstrap["bundles-all"];
			images = window.bootstrap["images-all"];

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
		}
	})();

	window.app = new AppView();
});
