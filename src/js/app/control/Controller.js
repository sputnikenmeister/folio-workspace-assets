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
		this.listenToOnce(bundles, "all", this.routeInitialized);

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
		this._goToLocation(bundle, image);
//		this._changeSelection(bundle, image);
//		this._updateLocation();
	},

	deselectImage: function () {
		var bundle = bundles.selected;
		this._goToLocation(bundle);
//		this._changeSelection(bundle);
//		this._updateLocation();
	},

	selectBundle: function (bundle) {
		this._goToLocation(bundle);
//		this._changeSelection(bundle);
//		this._updateLocation();
	},

	deselectBundle: function () {
		this._goToLocation();
//		this._changeSelection();
//		this._updateLocation();
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
		_.defer(_.bind(this.navigate, this), location, {trigger: false});
//		this.navigate(location, {trigger: false});
	},

	_goToLocation: function(bundle, image) {
		var imageIndex, location;
		location = "bundles";
		if (bundle) {
			location += "/" + bundle.get("handle");
			imageIndex = bundle.get("images").indexOf(image);
			if (imageIndex >= 0) {
				location += "/" + imageIndex;
			}
		}
		this.navigate(location, {trigger: true});
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
//		var lastBundle = bundles.selected;
		if (_.isUndefined(bundle)) {
			bundles.deselect();
//			if (lastBundle) {
//				lastBundle.get("images").deselect();
//			}
		}
		else {
			if (_.isUndefined(image)) {
				bundle.get("images").deselect();
			} else {
				bundle.get("images").select(image);
			}
			bundles.select(bundle);
		}
	},

	/* --------------------------- *
	 * Initialization
	 * --------------------------- */

	routeInitialized: function() {
		this.inilializeHandlers();
		this.initializeBundleStyles();
		this.initializeBrowserTitle();
	},

	inilializeHandlers: function() {
		var toClassName = function (prefix, val) {
			return (val? "with-":"without-") + prefix;
		};

		var $body = Backbone.$("body");
		var withBundle, withoutBundle, withImage, withoutImage;
		var images = null;

		withImage = function() {
			$body.removeClass(toClassName("image", false)).addClass(toClassName("image", true));
			this.listenToOnce(images, "select:none", withoutImage);
		};
		withoutImage = function () {
			$body.removeClass(toClassName("image", true)).addClass(toClassName("image", false));
			this.listenToOnce(images, "select:one", withImage);
		};
		withBundle = function() {
			$body.removeClass(toClassName("bundle", false)).addClass(toClassName("bundle", true));
			this.listenToOnce(bundles, "select:none", withoutBundle);
		};
		withoutBundle = function () {
			$body.removeClass(toClassName("bundle", true)).addClass(toClassName("bundle", false));
			this.listenToOnce(bundles, "select:one", withBundle);
		};

		var bundleHandlers = {
			"select:one": function (bundle) {
				images = bundle.get("images");
				(images.selected? withImage : withoutImage).call(this);
			},
			"deselect:one": function (bundle) {
				images = bundle.get("images");
				$body.removeClass(toClassName("image", true)).removeClass(toClassName("image", false));
				this.stopListening(images, { "select:none": withoutImage, "select:one": withImage });
//				this.stopListening(images, "select:none", withoutImage);
//				this.stopListening(images, "select:one", withImage);
				images = null;
			},
		};
		this.listenTo(bundles, bundleHandlers);

//		if (bundles.selected) {
//			withBundle.call(this);
//			images = bundles.selected.get("images");
//			if (images.selected) {
//				withImage.call(this);
//			} else {
//				withoutImage.call(this);
//			}
//		} else {
//			withoutBundle.call(this);
//		}
		(bundles.selected? withBundle : withoutBundle).call(this);
	},

	/* --------------------------- *
	 * browser title
	 * --------------------------- */

	initializeBrowserTitle: function() {
		var handlers = {
			"select:one": function (bundle) {
				document.title = "Portfolio – " + stripTags(bundle.get("name"));
			},
			"select:none": function () {
				document.title = "Portfolio";
			},
		};
		this.listenTo(bundles, handlers);
		if (bundles.selected) {
			handlers["select:one"].call(this, bundles.selected);
		} else {
			handlers["select:none"].call(this);
		}
	},

	/* --------------------------- *
	 * pre-bundle styles
	 * --------------------------- */

	initializeBundleStyles: function() {
		var fgColor, bgColor, bgLum, fgLum;
		var bgDefault, fgDefault;
		var attrs, styles, bodySelector, carouselSelector;

		var toBodyClass = function (bundle) {
			return "bundle-" + bundle.id;
		};

		bgDefault = Styles.getCSSProperty("body", "background-color");// || "hsl(47, 5%, 95%)");
		fgDefault = Styles.getCSSProperty("body", "color");// || "hsl(47, 5%, 15%)");

		bundles.each(function (bundle) {
			attrs = bundle.get("attrs");
			bodySelector = "body." + toBodyClass(bundle);
			carouselSelector = ".carousel." + bundle.get("handle");
			bgColor = new Color(attrs["background-color"] || bgDefault);
			fgColor = new Color(attrs["color"] || fgDefault);
			bgLum = bgColor.lightness();
			fgLum = fgColor.lightness();

			styles = _.pick(attrs, ["background-color", "background", "color"]);
			styles["-webkit-font-smoothing"] = (bgLum < fgLum? "antialiased" : "auto");
			/* 'body { -moz-osx-font-smoothing: grayscale; }' works ok in all situations: hardcoded in _base.scss */
			//styles["-moz-osx-font-smoothing"] = (bgLum < fgLum? "grayscale" : "auto");
			Styles.createCSSRule(bodySelector, styles);

			styles = {
				"border-color": 	fgColor.lightness(fgLum * 0.300 + bgLum * 0.700).toHexString(),
				"color":			fgColor.lightness(fgLum * 0.500 + bgLum * 0.500).toHexString(),
			};
			Styles.createCSSRule(bodySelector + " .mutable-faded", styles);

			styles = _.pick(attrs, ["box-shadow", "border", "border-radius", "background-color"]);
			Styles.createCSSRule(carouselSelector + " > .image-item img", styles);

			styles = {
				"background-color": bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString(),
				"border-color": 	bgColor.lightness(fgLum * 0.150 + bgLum * 0.850).toHexString(),
				"color": 			bgColor.lightness(fgLum * 0.150 + bgLum * 0.850).toHexString(),
			};
			Styles.createCSSRule(carouselSelector + " > .image-item .placeholder", styles);

		});

		var $body = Backbone.$("body");
		var handlers = {
			"deselect:one": function (bundle) {
				$body.removeClass(toBodyClass(bundle));
			},
			"select:one": function (bundle) {
				$body.addClass(toBodyClass(bundle));
			},
		};
		this.listenTo(bundles, handlers);
		if (bundles.selected) {
			handlers["select:one"].call(this, bundles.selected);
		}
	},
});

module.exports = new Controller();
