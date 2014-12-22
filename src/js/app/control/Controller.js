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

/** @type {module:app/utils/Styles} */
var Styles = require("../utils/Styles");
/** @type {module:app/utils/debug/traceArgs} */
var traceArgs = require("../utils/debug/traceArgs");
/** @type {module:app/utils/debug/traceArgs} */
var stripTags = require("../utils/strings/stripTags");

/** @type {module:app/model/collection/TypeList} */
var types = require("../model/collection/TypeList");
/** @type {module:app/model/collection/KeywordList} */
var keywords = require("../model/collection/KeywordList");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

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
//			"bundles/:bundleHandle": function (handle) {
//				/* redirect to first image */
//				this.navigate("bundles/" + handle + "/0", {
//					trigger: true, replace: true
//				});
//			},
			"bundles": "bundleList",
			"": function () {
				/* redirect root to bundleList */
				this.navigate("bundles", {
					trigger: true, replace: true
				});
			}
		}
	});

	this.listenTo(this.router, "route:bundleItem", this.routeToBundleItem);
	this.listenTo(this.router, "route:bundleList", this.routeToBundleList);

	this.listenTo(bundles, "deselect:one", this._onBundleDeselectOne);
	this.listenTo(bundles, "select:one", this._onBundleSelectOne);
	this.listenTo(bundles, "select:none", this._onBundleSelectNone);

	this.listenTo(this.router,	"route", 		traceArgs("Router \t", "info"));
	this.listenTo(bundles,		"all",			traceArgs("Bundles\t", "info"));
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

	deselectImage: function () {
		var bundle = bundles.selected;
		this._changeSelection(bundle);
		this._updateLocation();
	},

	selectBundle: function (bundle) {
		this._changeSelection(bundle);
		this._updateLocation();
	},

	deselectBundle: function () {
		this._changeSelection();
		this._updateLocation();
	},

	/** Update location when navigation happens internally */
	_updateLocation: function() {
		var bundle, imageIndex, location;
		location = "bundles";
		bundle = bundles.selected;
		if (bundle) {
			location += "/" + bundle.get("handle");
			imageIndex = bundle.get("images").selectedIndex;
			if (imageIndex >= 0) {
				location += "/" + imageIndex;
			}
		}
		this.router.navigate(location, {trigger: false});
	},

	/* --------------------------- *
	 * External redirects
	 * --------------------------- */

	routeToBundleItem: function (bundleHandle, imageIndex) {
		var bundle, image;
		bundle = bundles.findWhere({handle: bundleHandle});
		if (!bundle) {
			throw new Error("Cannot find bundle with handle \"" + bundleHandle + "\"");
		}
		if (imageIndex) {
			image = bundle.get("images").at(imageIndex);
			if (!image) {
				throw new Error("No image at index " + imageIndex + " bundle with handle \"" + bundleHandle + "\"");
			}
		}
		this._changeSelection(bundle, image);
	},

	routeToBundleList: function () {
		this._changeSelection();
	},

	/* -------------------------------
	 * Select Bundle/image
	 * ------------------------------- */

	/* Select Bundle/image */
	_changeSelection: function (bundle, image) {
		if (_.isUndefined(bundle)) {
			bundles.deselect();
		}
		else {
			if (_.isUndefined(image)) {
				//bundle.get("images").selectAt(0);
				bundle.get("images").deselect();
			} else {
				bundle.get("images").select(image);
			}
			bundles.select(bundle);
		}
	},

	/* --------------------------- *
	 * Model listeners
	 * --------------------------- */

	_location: {},

	_onBundleDeselectOne: function (bundle) {
		this.stopListening(bundle.get("images"));
	},

	_onBundleSelectOne: function (bundle) {
		this.listenTo(bundle.get("images"), "select:one", this._onImageSelectOne);
		this.listenTo(bundle.get("images"), "select:none", this._onImageSelectNone);
		this.listenTo(bundle.get("images"), "all", traceArgs("Images \t", "info"));

		this._location.bundle = bundle.get("handle");
		this.applyBundleStyles(bundle);
		document.title = "Portfolio – " + stripTags(bundle.get("name"));
	},

	_onBundleSelectNone: function () {
		delete this._location.bundle;
		this.clearBundleStyles();
		document.title = "Portfolio";
	},

	_onImageSelectOne: function (image) {
		this._location.image = image.get("handle");
		this.applyImageStyles(image);
	},

	_onImageSelectNone: function () {
		delete this._location.image;
		this.clearImageStyles();
	},

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	clearImageStyles: function () {
	},

	applyImageStyles: function (image) {
	},

	clearBundleStyles: function () {
		Styles.setCSSProperty("body", "color", "");
		Styles.setCSSProperty("body", "background-color", "");
		Styles.setCSSProperty(".mutable-faded", "color", "");
		Styles.setCSSProperty(".mutable-faded", "border-color", "");
	},

	applyBundleStyles: function (bundle) {
		var fgColor, bgColor, bgLum, fgLum, cssRule;
		var attrs = bundle.get("attrs");

		Styles.setCSSProperty("body", "color", attrs["color"]);
		Styles.setCSSProperty("body", "background-color", attrs["background-color"]);

		// image-item img
		Styles.setCSSProperty(".image-item img", "box-shadow", attrs["box-shadow"]);
		Styles.setCSSProperty(".image-item img", "border", attrs["border"]);
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

		// text color derivates
		Styles.setCSSProperty(".mutable-faded", "color", fgColor.lightness(fgLum * 0.500 + bgLum * 0.500).toHexString());
		Styles.setCSSProperty(".mutable-faded", "border-color", fgColor.lightness(fgLum * 0.300 + bgLum * 0.700).toHexString());
//		cssRule = Styles.getCSSRule(".mutable-faded");
//		cssRule.style.color = fgColor.lightness(fgLum * 0.500 + bgLum * 0.500).toHexString();
//		cssRule.style.borderColor = fgColor.lightness(fgLum * 0.300 + bgLum * 0.700).toHexString();

		// .image-item .placeholder
		cssRule = Styles.getCSSRule(".image-item .placeholder");
		cssRule.style.backgroundColor = bgColor.lightness(fgLum * 0.100 + bgLum * 0.900).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "background-color", bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString());
		cssRule.style.borderColor = bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "border-color", bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString());
		cssRule.style.color =  bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "color", bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString());


		//console.log("CSS: ", bgColor.toHslaString(), fgColor.toHslaString(), attrs);
	},
});

module.exports = new Controller();
