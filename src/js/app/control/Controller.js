/**
/* @module app/control/Controller
/*/

// /** @type {module:underscore} */
// var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

// /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");
// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");

/* --------------------------- *
/* Static private
/* --------------------------- */

/**
/* @constructor
/* @type {module:app/control/Controller}
/*/
var Controller = Backbone.Router.extend({

	/** @override */
	routes: {
		"bundles/:bundleHandle(/:mediaIndex)": "toBundleItem",
		"bundles": "toBundleCollection",
		"": function() {
			this.navigate("bundles", {
				trigger: true,
				replace: true
			});
		}
	},

	/** @override */
	initialize: function(options) {},

	/* ---------------------------
	/* Public command methods
	/* --------------------------- */

	selectMedia: function(media) {
		this._goToLocation(media.get("bundle"), media);
		// this._changeSelection(media.get("bundle"), media);
		// this._updateLocation();
	},

	selectBundle: function(bundle) {
		this._goToLocation(bundle);
		// this._changeSelection(bundle);
		// this._updateLocation();
	},

	deselectMedia: function() {
		this._goToLocation(bundles.selected);
		// this._changeSelection(bundles.selected);
		// this._updateLocation();
	},

	deselectBundle: function() {
		this._goToLocation();
		// this._changeSelection();
		// this._updateLocation();
	},

	/** Update location when navigation happens internally */
	_updateLocation: function() {
		var bundle, media;
		bundle = bundles.selected;
		if (bundle) {
			media = bundle.get("media").selected;
		}
		this.navigate(this._getLocation(bundle, media), {
			trigger: false
		});
	},

	_getLocation: function(bundle, media) {
		var mediaIndex, location = [];
		location.push("bundles");
		if (bundle) {
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
	/* Router handlers (browser address changes)
	/* --------------------------- */

	toBundleItem: function(bundleHandle, mediaIndex) {
		var bundle, media;
		bundle = bundles.findWhere({
			handle: bundleHandle
		});
		if (!bundle) {
			throw new Error("Cannot find bundle with handle \"" + bundleHandle + "\"");
		}
		if (mediaIndex) {
			media = bundle.get("media").at(mediaIndex);
			if (!media) {
				throw new Error("No media at index " + mediaIndex + " bundle with handle \"" + bundleHandle + "\"");
			}
		}
		this._changeSelection(bundle, media);
	},

	toBundleCollection: function() {
		this._changeSelection();
	},

	/* -------------------------------
	/* Select Bundle/media
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
		if (bundle === void 0) bundle = null;
		if (media === void 0) media = null;

		var lastBundle = bundles.selected;
		var lastMedia = lastBundle ? lastBundle.get("media").selected : null;

		console.log("controller::_changeSelection bundle:[%s => %s] media:[%s => %s]",
			(lastBundle ? lastBundle.cid : lastBundle), (bundle ? bundle.cid : bundle),
			(lastMedia ? lastMedia.cid : lastMedia), (media ? media.cid : bundle)
		);

		if (lastBundle === bundle && lastMedia === media) {
			return;
		}

		this.trigger("change:before", bundle, media);

		bundle && bundle.get("media").select(media);
		bundles.select(bundle);

		this.trigger("change:after", bundle, media);
	},
});

module.exports = new Controller();
