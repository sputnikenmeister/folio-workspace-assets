/**
 * @module app/control/Presenter
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:jquery} */
var $ = Backbone.$;
/** @type {Function} */
var Color = $.Color;
/** @type {Function} */
var Deferred = $.Deferred;

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
var Controller = Backbone.Router.extend({

	/** @override */
	routes: {
		"bundles/:bundleHandle(/:imageIndex)": "toBundleItem",
		"bundles": "toBundleList",
		"": function () {
			this.navigate("bundles", {
				trigger: true, replace: true
			});
		}
	},

	/** @override */
	initialize: function (options) {
		this.listenToOnce(bundles, "all", this.initializeBundleStyles);

		this.listenTo(bundles, {
//			"deselect:one": this._onBundleDeselectOne,
			"select:one": this._onBundleSelectOne,
			"select:none": this._onBundleSelectNone
		});

		if (DEBUG) {
			// error trace
			var bundleTracer =	traceArgs("Bundles \t", "info");
			var imageTracer = 	traceArgs("Images  \t", "info");
			var routeTracer = 	traceArgs("Router  \t", "info");
			var appTracer = 	traceArgs("App     \t", "info");

			this.listenTo(this, "route", routeTracer);
			this.listenTo(Backbone,	"all", appTracer);
			this.listenTo(bundles, {
				"all": bundleTracer,
				"select:one": function(bundle) {
					this.listenTo(bundle.get("images"), "all", imageTracer);
				},
				"deselect:one": function(bundle) {
					this.stopListening(bundle.get("images"), "all", imageTracer);
				}
			});
		}
	},

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
		this.navigate(location, {trigger: false});
	},

	/* --------------------------- *
	 * External redirects
	 * --------------------------- */

	toBundleItem: function (bundleHandle, imageIndex) {
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

	toBundleList: function () {
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

//	_onBundleDeselectOne: function (bundle) {
//		this.stopListening(bundle.get("images"), {
//			"select:one": this._onImageSelectOne,
//			"deselect:one": this._onImageSelectNone
//		});
//		this.clearBundleStyles(bundle);
//	},

	_onBundleSelectOne: function (bundle) {
//		this.listenTo(bundle.get("images"),{
//			"select:one": this._onImageSelectOne,
//			"select:none": this._onImageSelectNone
//		});

		document.title = "Portfolio – " + stripTags(bundle.get("name"));
//		this.applyBundleStyles(bundle);
	},

	_onBundleSelectNone: function () {
		document.title = "Portfolio";
	},

//	_onImageSelectOne: function (image) {
//		this.applyImageStyles(image);
//	},

//	_onImageDeselectOne: function (image) {
//		this.clearImageStyles(image);
//	},

//	_onImageSelectNone: function () {
//	},

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

//	clearImageStyles: function (image) {
//	},

//	applyImageStyles: function (image) {
//	},

	initializeBundleStyles: function() {
		var fgColor, bgColor, bgLum, fgLum;
		var bgDefault, fgDefault;
		var attrs, className;
		var styles;

		bgDefault = Styles.getCSSProperty("body", "background-color");// || "hsl(47, 5%, 95%)");
		fgDefault = Styles.getCSSProperty("body", "color");// || "hsl(47, 5%, 15%)");

		bundles.each(function (bundle) {
			attrs = bundle.get("attrs");
			className = bundle.get("handle");

			bgColor = new Color(attrs["background-color"] || bgDefault);
			fgColor = new Color(attrs["color"] || fgDefault);

			bgLum = bgColor.lightness();
			fgLum = fgColor.lightness();

			styles = _.pick(attrs, ["background-color", "background", "color"]);
			styles["-webkit-font-smoothing"] = (bgLum < fgLum? "antialiased" : "auto");
			// 'body { -moz-osx-font-smoothing: grayscale; }' works ok in all situations: hardcoded in _base.scss
			//styles["-moz-osx-font-smoothing"] = (bgLum < fgLum? "grayscale" : "auto");
			Styles.createCSSRule("body." + className, styles);

			styles = _.pick(attrs, ["box-shadow", "border", "border-radius", "background-color"])
			Styles.createCSSRule("." + className + " > .image-item img", styles);

			Styles.createCSSRule("." + className + " > .image-item .placeholder", {
				"background-color": bgColor.lightness(fgLum * 0.075 + bgLum * 0.925).toHexString(),
				"border-color": bgColor.lightness(fgLum * 0.125 + bgLum * 0.875).toHexString(),
				"color": bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString(),
			});

			Styles.createCSSRule("." + className + " .mutable-faded", {
				"border-color": fgColor.lightness(fgLum * 0.300 + bgLum * 0.700).toHexString(),
				"color": fgColor.lightness(fgLum * 0.500 + bgLum * 0.500).toHexString(),
			});
		});


		var $body = Backbone.$("body");

		this.listenTo(bundles, {
			"deselect:one": function (bundle) {
				$body.removeClass(bundle.get("handle"));
			},
			"select:one": function (bundle) {
				$body.addClass(bundle.get("handle"));
			},
		});
	},
});

module.exports = new Controller();
