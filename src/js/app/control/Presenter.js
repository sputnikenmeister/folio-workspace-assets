/**
 * @module app/control/Presenter
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
	_.bindAll(this, "routeToBundleItem", "routeToBundleList")
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
			"bundles/:bundleHandle/:imageIndex": _.bind(this.routeToBundleItem, this),//"bundleItem",
			"bundles/:bundleHandle": bundleRedirect,
			"bundles": _.bind(this.routeToBundleList, this),//"bundleList",
			"": rootRedirect,
		}
	});

	// this.listenTo(this.router, "route:bundleItem", this.routeToBundleItem);
	// this.listenTo(this.router, "route:bundleList", this.routeToBundleList);

	var traceEvent = function(label) {
		return function(ev) { console.log(label, ev, Array.prototype.slice.call(arguments).join(" ")); };
	};
	// this.listenTo(this.bundles, "all", traceEvent("bundles"));
	// this.listenTo(this.images, "all", traceEvent("images"));
	// this.listenTo(this.router, "all", traceEvent("router"));
}

_.extend(Presenter.prototype, Backbone.Events, {

	/* --------------------------- *
	 * Select Image
	 * --------------------------- */

	selectImage: function (image) {
		this.router.navigate("bundles/" + bundles.selected.get("handle") + "/" + (images.indexOf(image)), {trigger: false});
		this.doSelectImage(image);
	},
	doSelectImage: function(image) {
		images.select(image);
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
		var bundle = bundles.findWhere({handle: bundleHandle});
		if (bundle) {
			this.doSelectBundle(bundle);
			if (imageIndex) {
				var image = images.at(imageIndex);
				if (image) {
					images.select(image);
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
		var stateChanging = bundles.selected === null;

		bundles.select(bundle);
		images.reset(bundle.get("images"));

		if (stateChanging) {
			_.delay(function (context) {
				Backbone.trigger("app:bundle:item");
				context.applySelectionStyles();
			}, 700, this);
		} else {
			this.applySelectionStyles();
		}
	},

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
		// bundles.deselect();
		// images.reset();
		Backbone.trigger("app:bundle:list");
		this.clearSelectionStyles();
		_.delay(function (context) {
			bundles.deselect();
			images.reset();
		}, 350, this);
	},

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	bodyStyles: ["background", "background-color", "color"],

	clearSelectionStyles: function() {
		Backbone.$("body").removeAttr("style");
	},
	applySelectionStyles: function() {
	 	var css = {};
	 	_.each(bundles.selected.get("attrs"), function(o) {
	 		o = o.split(":");
	 		css[o[0]] = o[1].replace(/(?:hsla?\(|rgba?\()([^\)]+)/g, function(m) {
	 			return m.replace(/\s+/g,",");
	 			//return m.split(" ").join(",");
	 		});
	 		console.log(o);
	 	});
	 	css = _.pick(css, this.bodyStyles);
	 	console.log(css);
	 	Backbone.$("body").removeAttr("style").css(css);
	},

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
