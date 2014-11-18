/**
 * @module app/control/Presenter
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/collection/TypeList} */
var types = require( "../model/collection/TypeList" );
/** @type {module:app/model/collection/KeywordList} */
var keywords = require( "../model/collection/KeywordList" );
/** @type {module:app/model/collection/BundleList} */
var bundles = require( "../model/collection/BundleList" );
/** @type {module:app/model/collection/ImageList} */
var images = require( "../model/collection/ImageList" );

/** @type {module:app/control/Router} */
// var router = require( "./Router" );

/**
 * @constructor
 * @type {module:app/control/Presenter}
 */
function Presenter() {
	this.bundles = bundles;
	this.images = images;

	var bundleRedirect = function (bundleHandle) {
		this.navigate("bundles/" + bundleHandle + "/0", { trigger: true, replace: true });
	};
	var rootRedirect = function() {
		this.navigate("bundles", { trigger: true, replace: true });
	};
	this.router = new Backbone.Router({
		routes: {
			"bundles/:bundleHandle/:imageIndex": "bundleItem",
			"bundles/:bundleHandle": bundleRedirect,
			"bundles": "bundleList",
			"": rootRedirect,
		}
	});
	// this.listenTo(this.router, "route", function() {
	// 	console.log("bundleRouter ", arguments);
	// });
	this.listenTo(this.router, "route:bundleItem", this.routeToBundleItem);
	this.listenTo(this.router, "route:bundleList", this.routeToBundleList);

	// this.imageRouter = new Backbone.Router({
	// 	routes: {
	// 		"bundles/:bundleParentHandle/:imageIndex": "imageItem2",
	// 		"bundles/:bundleParentHandle": bundleRedirect,
	// 	}
	// });
	// this.listenTo(this.imageRouter, "route", function() {
	// 	console.log("imageRouter ", arguments);
	// });
}

_.extend(Presenter.prototype, Backbone.Events, {


	/* -------------------------------
	 * Deselect Bundle
	 * ------------------------------- */

	/* Handle view events */
	deselectBundle: function () {
		this.router.navigate("bundles", { trigger: false });
		this.doDeselectBundle();
	},
	/* Handle router events */
	routeToBundleList: function () {
		this.doDeselectBundle();
	},
	/* Handle model updates */
	doDeselectBundle: function () {
		var stateChanging = this.bundles.selected !== null;
		var onStateChangeEnd = this.showBundleList;

		if (stateChanging) {
			Backbone.trigger("app:bundle:list");
			_.delay(function (context) {
				context.bundles.deselect();
				context.images.reset();
			}, 350, this);
		}
	},

	/* -------------------------------
	 * Select Bundle
	 * ------------------------------- */

	/* Handle view events */
	selectBundle: function (model) {
		this.router.navigate("bundles/" + model.get("handle") + "/0", {trigger: false});
		this.doSelectBundle(model);
	},
	/* Handle router events */
	routeToBundleItem: function (bundleHandle, imageIndex) {
		var bundle = this.bundles.findWhere({handle: bundleHandle});
		if (bundle) {
			this.doSelectBundle(bundle);
			if (imageIndex) {
				var image = this.images.at(imageIndex);
				if (image) {
					this.images.select(image);
				} else {
					Backbone.trigger("app:error", "Image not found");
				}
			}
		} else {
			Backbone.trigger("app:error", "Bundle not found");
		}
	},
	/* Handle model updates */
	doSelectBundle: function (bundle) {
		var stateChanging = this.bundles.selected === null;
		var onStateChangeEnd = this.showBundleItem;

		this.bundles.select(bundle);
		this.images.reset(bundle.get("images"));

		if (stateChanging) {
			_.delay(function (context) {
				Backbone.trigger("app:bundle:item");
			}, 700, this);
		}
	},

	/* --------------------------- *
	 * Select Image
	 * --------------------------- */

	selectImage: function (image) {
		this.router.navigate("bundles/" + bundles.selected.get("handle") + "/" + (images.indexOf(image)), {trigger: false});
		this.doSelectImage(image);
	},
	doSelectImage: function(image) {
		this.images.select(image);
	}

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	// fetchBundleData: function (bundle) {
	// 	if (!bundle.has("images")) {
	// 		bundle.fetch().done(
	// 			function (bundle) {
	// 				images.set(bundle.get("images"), {add: false, remove: false});
	// 			}
	// 		).fail(
	// 			function () {
	// 				// Should provide more info here...
	// 				Backbone.trigger("app:error");
	// 			}
	// 		);
	// 	}
	// },
});

module.exports = new Presenter();
// module.exports = (function(){
// 	var instance = null;
// 	return {
// 		/**
// 		 * Construct Router
// 		 * @returns {module:app/control/Mediator}
// 		 */
// 		init: function(){
// 			instance = new Mediator();
// 			return this.getInstance();
// 		},
// 		/**
// 		 * Go singleton
// 		 * @returns {module:app/control/Mediator}
// 		 */
// 		getInstance: function() {
// 			return instance;
// 		}
// 	};
// }());
