/**
 * @module app/control/Controller
 */

/** @type {module:backbone} */
const Backbone = require("backbone");

// /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");
// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");
/** @type {module:app/model/collection/ArticleCollection} */
const articles = require("app/model/collection/ArticleCollection");
/** @type {module:app/model/collection/BundleCollection} */
const bundles = require("app/model/collection/BundleCollection");

/* --------------------------- *
/* Static private
/* --------------------------- */

/**
/* @constructor
/* @type {module:app/control/Controller}
/*/
var Controller = Backbone.Router.extend({

	// /** @override */
	// routes: {},

	/** @override */
	initialize: function(options) {

		if (DEBUG) {
			this._routeNames = [];
			this.route = function(route, name, callback) {
				this._routeNames.push(_.isString(name) ? name : '');
				return Backbone.Router.prototype.route.apply(this, arguments);
			};
			this.on("route", function(routeName, args) {
				console.log("controller:[route] %s [%s]", routeName, args.join());
			});
		}

		/*
		 * Prefixed article regexp: /^article(?:\/([^\/]+))\/?$/
		 * Single bundle regexp: /^bundles(?:\/([^\/]+)(?:\/(\d+))?)?\/?$/
		 */
		this.route(/(.*)/,
			"notfound", this.toNotFound);
		this.route(/^([a-z][a-z0-9\-]*)\/?$/,
			"article-item", this.toArticleItem);
		this.route(/^(?:bundles)?\/?$/,
			"root", this.toRoot);
		// this.route(/^bundles\/?$/,
		// 	"bundle-list", this.toBundleList);
		this.route(/^bundles\/([^\/]+)\/?$/,
			"bundle-item", this.toBundleItem);
		this.route(/^bundles\/([^\/]+)\/(\d+)\/?$/,
			"media-item", this.toMediaItem);

		if (DEBUG) {
			console.log("%s::initialize routes: %o", "controller", this._routeNames);
		}
	},



	/* ---------------------------
	/* JS to URL: public command methods
	/* --------------------------- */

	selectMedia: function(media) {
		this._goToLocation(media.get("bundle"), media);
	},

	selectBundle: function(bundle) {
		this._goToLocation(bundle);
	},

	deselectMedia: function() {
		this._goToLocation(bundles.selected);
	},

	deselectBundle: function() {
		this._goToLocation();
	},

	selectArticle: function(article) {
		this.navigate(article.get("handle"), { trigger: true });
	},

	deselectArticle: function() {
		this.navigate("", { trigger: true });
	},

	/* ---------------------------
	/* JS to URL: private helpers
	/* --------------------------- */

	/** Update location when navigation happens internally */
	/*_updateLocation: function() {
		var bundle, media;
		bundle = bundles.selected;
		if (bundle) {
			media = bundle.get("media").selected;
		}
		this.navigate(this._getLocation(bundle, media), {
			trigger: false
		});
	},*/

	_getLocation: function(bundle, media) {
		var mediaIndex, location = [];
		if (bundle) {
			location.push("bundles");
			location.push(bundle.get("handle"));
			if (media) {
				mediaIndex = bundle.get("media").indexOf(media);
				if (mediaIndex >= 0) {
					location.push(mediaIndex);
				}
			}
		}
		// location.push("");
		return location.join("/");
	},

	_goToLocation: function(bundle, media) {
		this.navigate(this._getLocation(bundle, media), {
			trigger: true
		});
	},

	/* --------------------------- *
	/* URL to JS: router handlers
	/* --------------------------- */

	toRoot: function() {
		this.trigger("change:before");
		if (bundles.selected) {
			// bundles.selected.get("media").deselect();
			bundles.deselect();
		}
		// keywords.deselect();
		articles.deselect();
		this.trigger("change:after");
	},

	toNotFound: function(slug) {
		console.info("route:[*:%s]", slug);
	},

	// toBundleList: function() {
	// 	this.navigate("", {
	// 		trigger: true,
	// 		replace: true
	// 	});
	// },

	toBundleItem: function(bundleHandle) {
		var bundle = bundles.findWhere({
			handle: bundleHandle
		});
		if (!bundle) {
			throw new Error("Cannot find bundle with handle \"" + bundleHandle + "\"");
		}
		this._changeSelection(bundle);
	},

	toMediaItem: function(bundleHandle, mediaIndex) {
		var bundle, media;
		// if (bundleHandle) {
		bundle = bundles.findWhere({ handle: bundleHandle });
		if (!bundle) {
			throw new Error("No bundle with handle \"" + bundleHandle + "\" found");
		}
		// if (mediaIndex) {
		media = bundle.get("media").at(mediaIndex);
		if (!media) {
			throw new Error("No media at index " + mediaIndex + " in bundle with handle \"" + bundleHandle + "\" found");
		}
		// }
		// }
		this._changeSelection(bundle, media);
	},

	toArticleItem: function(articleHandle) {
		var article = articles.findWhere({ handle: articleHandle });
		if (!article) {
			throw new Error("Cannot find article with handle \"" + articleHandle + "\"");
		}
		this.trigger("change:before", article);
		bundles.deselect();
		articles.select(article);
		this.trigger("change:after", article);
	},

	/* -------------------------------
	/* URL to JS: private helpers
	/* ------------------------------- */

	/*
	/* NOTE: Selection order
	/* - Apply media selection to *incoming bundle*, as not to trigger
	/*	unneccesary events on an outgoing bundle. Outgoing bundle media selection
	/*	remains untouched.
	/* - Apply media selection *before* selecting the incoming bundle. Views
	/*	normally listen to the selected bundle only, so if the bundle is changing,
	/*	they will not be listening to media selection changes yet.
	/*/
	_changeSelection: function(bundle, media) {
		var lastBundle, lastMedia;
		if (bundle === void 0) bundle = null;
		if (media === void 0) media = null;

		lastBundle = bundles.selected;
		lastMedia = lastBundle ? lastBundle.get("media").selected : null;
		console.log("controller::_changeSelection bundle:[%s -> %s] media:[%s -> %s]",
			(lastBundle ? lastBundle.cid : lastBundle), (bundle ? bundle.cid : bundle),
			(lastMedia ? lastMedia.cid : lastMedia), (media ? media.cid : media)
		);

		if (!articles.selected && (lastBundle === bundle) && (lastMedia === media)) {
			return;
		}

		this.trigger("change:before", bundle, media);
		bundle && bundle.get("media").select(media);
		bundles.select(bundle);
		articles.deselect();
		this.trigger("change:after", bundle, media);
	},
});


module.exports = new Controller();
