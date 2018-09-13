/** @type {module:underscore} */
var _ = require("underscore");

module.exports = function(bootstrap) {

	/** @type {module:app/control/Globals} */
	var Globals = require("app/control/Globals");

	// Globals.GA_TAGS = bootstrap["ga-tags"];
	// Globals.PARAMS = bootstrap["params"];
	// Globals.APP_ROOT = bootstrap["params"]["root"];
	// Globals.MEDIA_DIR = bootstrap["params"]["uploads"];
	Globals.APP_NAME = bootstrap["params"]["website-name"];

	/** @type {module:app/model/collection/TypeCollection} */
	var typeList = require("app/model/collection/TypeCollection");
	/** @type {module:app/model/collection/KeywordCollection} */
	var keywordList = require("app/model/collection/KeywordCollection");
	/** @type {module:app/model/collection/BundleCollection} */
	var bundleList = require("app/model/collection/BundleCollection");
	/** @type {module:app/model/collection/ArticleCollection} */
	var articleList = require("app/model/collection/ArticleCollection");

	// Fix-ups to bootstrap data.
	var articles = bootstrap["articles-all"];
	var types = bootstrap["types-all"];
	var keywords = bootstrap["keywords-all"];
	var bundles = bootstrap["bundles-all"];
	var media = bootstrap["media-all"];

	// Attach media to their bundles
	var mediaByBundle = _.groupBy(media, "bId");

	// Fill-in back-references:
	// Create Keyword.bundleIds from existing Bundle.keywordIds,
	// then Bundle.typeIds from unique Keyword.typeId

	// _.each(bundles, function (bo, bi, ba) {
	bundles.forEach(function(bo, bi, ba) {
		bo.tIds = [];
		bo.media = mediaByBundle[bo.id];
		// _.each(keywords, function (ko, ki, ka) {
		keywords.forEach(function(ko, ki, ka) {
			if (bi === 0) {
				ko.bIds = [];
			}
			// if (_.contains(bo.kIds, ko.id)) {
			if (bo.kIds.indexOf(ko.id) != -1) {
				ko.bIds.push(bo.id);
				// if (!_.contains(bo.tIds, ko.tId)) {
				if (bo.tIds.indexOf(ko.tId) == -1) {
					bo.tIds.push(ko.tId);
				}
			}
		});
	});

	// Fill collection singletons
	articleList.reset(articles);
	typeList.reset(types);
	keywordList.reset(keywords);
	bundleList.reset(bundles);

	// bootstrap["params"] = bootstrap["articles-all"] = bootstrap["types-all"] = bootstrap["keywords-all"] = bootstrap["bundles-all"] = bootstrap["media-all"] = null;
};
