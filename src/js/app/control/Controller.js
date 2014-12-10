/**
 * @module app/control/Presenter
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery-color} */
var Color = Backbone.$.Color;
/** @type {Function} */
var Deferred = Backbone.$.Deferred;

/** @type {module:app/model/collection/TypeList} */
var types = require("../model/collection/TypeList");
/** @type {module:app/model/collection/KeywordList} */
var keywords = require("../model/collection/KeywordList");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/utils/Styles} */
var Styles = require("../utils/Styles");

/* --------------------------- *
 * Static private
 * --------------------------- */

var bodyStyles = ["background", "background-color", "color", "-moz-osx-font-smoothing", "-webkit-font-smoothing"];

/**
 * @constructor
 * @type {module:app/control/Controller}
 */
function Controller() {
	this.router = new Backbone.Router({
		routes: {
			"bundles/:bundleHandle(/:imageIndex)": "bundleItem",
			"bundles": "bundleList",
			"": function () {
				/* redirect root to bundleList */
				this.navigate("bundles", {
					trigger: true,
					replace: true
				});
			}
		}
	});

	this.listenTo(this.router, "route:bundleItem", this.routeToBundleItem);
	this.listenTo(this.router, "route:bundleList", this.routeToBundleList);

	this.listenTo(bundles, "select:one", this.onBundleItem);
	this.listenTo(bundles, "select:none", this.onBundleList);

	var traceArgs = function(label) {
	 	return function() { console.info(label, arguments); };
		//Array.prototype.slice.call(arguments).join(" "));
	};
	this.listenTo(this.router,	"route", 		traceArgs("Router \t"));
	this.listenTo(Backbone,		"all", 			traceArgs("App    \t"));
	this.listenTo(bundles,		"all",			traceArgs("Bundles\t"));

	//images.on("all", 			traceArgs("Images \t"));
	//this.listenTo(this.bundles, "all", traceEvent("bundles"));
	//this.listenTo(this.images, "all", traceEvent("images"));
	//this.listenTo(this.router, "all", traceEvent("router"));
}

_.extend(Controller.prototype, Backbone.Events, {

	/* ---------------------------
	 * Public command methods
	 * --------------------------- */

	selectImage: function (image) {
		var bundle = image.get("bundle");
		this._changeSelection(bundle, image);
		this._updateLocation();
	},

	selectBundle: function (bundle) {
		var image = bundle.get("images").at(0);
		this._changeSelection(bundle, image);
		this._updateLocation();
	},

	/* --------------------------- *
	 * External redirects
	 * --------------------------- */

	/* Handle router events */
	routeToBundleItem: function (bundleHandle, imageIndex) {
		var bundle = bundles.findWhere({handle: bundleHandle});
		var image = bundle.get("images").at(imageIndex);
		this._changeSelection(bundle, image);
	},

//	redirectToBundleItem: function (handle) {
//		this.router.navigate("bundles/" + handle + "/0", {
//			trigger: true,
//			replace: true
//		});
//	},

	/* -------------------------------
	 * Select Bundle/image
	 * ------------------------------- */

	/* Handle model updates */
	_changeSelection: function (bundle, image) {
		if (!bundle) {
			new Error("cannot select undefined bundle");
		}
		if (!image) {
			new Error("cannot select undefined image");
		}
		if (bundle !== image.get("bundle")) {
			new Error("cannot select image not in bundle");
		}
		if (bundles.selected === bundle) {
			new Error("cannot select a bundle already selected");
		}

		var stateChanging = !bundles.selected;

		if (stateChanging) {
			_.delay(function (context) {
				Backbone.trigger("app:bundle:item");
				Backbone.trigger("app:BundleItem:done");
			}, 700, this);
			Backbone.trigger("app:BundleItem:start");
		}

		bundle.get("images").select(image);
		bundles.select(bundle);

		Backbone.trigger("app:BundleItem:change");
	},

	/* -------------------------------
	 * Deselect Bundle
	 * ------------------------------- */

	/* Handle view calls */
	deselectBundle: function () {
		this._deselectBundle();
		this._updateLocation();
	},

	/* Handle router events */
	routeToBundleList: function () {
		this._deselectBundle();
	},

	/* Handle model updates */
	_deselectBundle: function () {
		if (!bundles.selected) {
			new Error("No bundle is selected, cannot deselect");
		}
		_.delay(function (context) {
			Backbone.trigger("app:BundleList:done");
		}, 350, this);
		Backbone.trigger("app:bundle:list");
		bundles.deselect();
		Backbone.trigger("app:BundleList:start");
	},

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	onBundleItem: function (bundle) {
		document.title = "Portfolio – " + bundles.selected.get("name");
		this.applySelectionStyles();
	},

	onBundleList: function () {
		document.title = "Portfolio";
		this.clearSelectionStyles();
	},

	_updateLocation: function() {
		var bundle, images, image, location;
		location = "bundles";
		bundle = bundles.selected;
		if (bundle) {
			location += "/" + bundle.get("handle");
			images = bundle.get("images");
			image = images.selected;
			if (image) {
				location += "/" + images.indexOf(image);
			}
		}
		this.router.navigate(location, {trigger: false});
	},

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	clearSelectionStyles: function () {
		Styles.setCSSProperty("body", "color", "");
		Styles.setCSSProperty("body", "background-color", "");
	},

	applySelectionStyles: function () {
		var fgColor, bgColor, bgLum, fgLum, cssRule;
		var attrs = bundles.selected.get("attrs");

		Styles.setCSSProperty("body", "color", attrs["color"]);
		Styles.setCSSProperty("body", "background-color", attrs["background-color"]);

		// image-item img
		Styles.setCSSProperty(".image-item img", "box-shadow", attrs["box-shadow"]);
		Styles.setCSSProperty(".image-item img", "border-radius", attrs["border-radius"]);
		Styles.setCSSProperty(".image-item img", "background-color", attrs["background-color"]);

		// base colors for mutable classes
		bgColor = new Color(attrs["background-color"] || Styles.getCSSProperty("body", "background-color"));// || "hsl(47, 5%, 95%)");
		fgColor = new Color(attrs["color"] || Styles.getCSSProperty("body", "color"));// || "hsl(47, 5%, 15%)");

		// get luminosity
		bgLum = bgColor.lightness();
		fgLum = fgColor.lightness();

		cssRule = Styles.getCSSRule("body");
		cssRule.style.WebkitFontSmoothing = (bgLum < fgLum)? "antialiased":"";
		cssRule.style.MozOSXFontSmoothing = (bgLum < fgLum)? "grayscale":"";
//		Styles.setCSSProperty("body", "-webkit-font-smoothing", "antialiased");

		// background color derivates
		cssRule = Styles.getCSSRule(".image-item .placeholder");
		cssRule.style.backgroundColor = bgColor.lightness(fgLum * 0.100 + bgLum * 0.900).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "background-color", bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString());
		cssRule.style.borderColor = bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "border-color", bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString());
		cssRule.style.color =  bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "color", bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString());

		// text color derivates
		cssRule = Styles.getCSSRule(".mutable-faded");
		cssRule.style.color = fgColor.lightness(fgLum * 0.500 + bgLum * 0.500).toHexString();
//		Styles.setCSSProperty(".mutable-faded", "color", fgColor.lightness(fgLum * 0.666 + bgLum * 0.333).toHexString());
//		Styles.setCSSProperty(".mutable-color", "color", fgColor.toHexString());

		//console.log("CSS: ", bgColor.toHslaString(), fgColor.toHslaString(), attrs);
	},
});

module.exports = new Controller();
