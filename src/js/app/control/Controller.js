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

/** @type {module:app/control/Globals} */
var Globals = require("./Globals");
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
//		this._goToLocation(bundle, image);
		this._changeSelection(bundle, image);
		this._updateLocation();
	},

	deselectImage: function () {
		var bundle = bundles.selected;
//		this._goToLocation(bundle);
		this._changeSelection(bundle);
		this._updateLocation();
	},

	selectBundle: function (bundle) {
		var image = bundle.get("images").selected;
//		this._goToLocation(bundle, image);
		this._changeSelection(bundle, image);
		this._updateLocation();
	},

	deselectBundle: function () {
//		this._goToLocation();
		this._changeSelection();
		this._updateLocation();
	},

	/** Update location when navigation happens internally */
//	_updateLocation: function() {
//		var bundle, imageIndex, location;
//		location = "bundles";
//		bundle = bundles.selected;
//		if (bundle) {
//			location += "/" + bundle.get("handle");
//			imageIndex = bundle.get("images").selectedIndex;
//			if (imageIndex >= 0) {
//				location += "/" + imageIndex;
//			}
//		}
//		_.defer(_.bind(this.navigate, this), location, {trigger: false});
////		this.navigate(location, {trigger: false});
//	},
	_updateLocation: function() {
		var bundle, image;
		bundle = bundles.selected;
		if (bundle) {
			image = bundle.get("images").selected;
		}
		_.defer(_.bind(this.navigate, this), this._getLocation(bundle, image), {trigger: false});
//		this.navigate(this._getLocation(bundle, image), {trigger: false});
	},

	_getLocation: function(bundle, image) {
		var images, imageIndex, location;
		location = "bundles";
		if (bundle) {
			location += "/" + bundle.get("handle");
			if (image) {
				imageIndex = bundle.get("images").indexOf(image);
				if (imageIndex >= 0) {
					location += "/" + imageIndex;
				}
			}
		}
		return location;
	},

	_goToLocation: function(bundle, image) {
		this.navigate(this._getLocation(bundle, image), {trigger: true});
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
		} else {
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

	inilializeHandlers: function()
	{
		var $body = Backbone.$("body");
		var imageHandlers = {
			"select:none": function () {
				$body.removeClass("with-image").addClass("without-image");
			},
			"deselect:none": function () {
				$body.removeClass("without-image").addClass("with-image");
			},
		};
		var bundleHandlers = {
			"select:one": function (bundle) {
				var images = bundle.get("images");
				this.listenTo(images, imageHandlers);
				$body.addClass((images.selected? "with-image" : "without-image"));
			},
			"deselect:one": function (bundle) {
				var images = bundle.get("images");
				this.stopListening(images, imageHandlers);
				$body.removeClass((images.selected? "with-image" : "without-image"));
			},
			"select:none": function () {
				$body.removeClass("with-bundle").addClass("without-bundle");
			},
			"deselect:none": function () {
				$body.removeClass("without-bundle").addClass("with-bundle");
			},
		};
		this.listenTo(bundles, bundleHandlers);
		$body.addClass((bundles.selected? "with-bundle" : "without-bundle"));
		if (bundles.selected) {
			bundleHandlers["select:one"].call(this, bundles.selected);
		}
	},
	/*{
		var toClassName = function (prefix, val) {
			return (val? "with-":"without-") + prefix;
		};

		var $body = Backbone.$("body");
		var withBundle, withoutBundle, withImage, withoutImage;
		var images = null;
		//toClassName\(\"(image|bundle)\", (true|false)\)
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
				this.stopListening(images, {"select:none": withoutImage, "select:one": withImage });
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
	},*/

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

		bgDefault = new Color(Styles.getCSSProperty("body", "background-color") || "hsl(47, 5%, 95%)");
		fgDefault = new Color(Styles.getCSSProperty("body", "color") || "hsl(47, 5%, 15%)");

		bundles.each(function (bundle) {

			attrs = bundle.get("attrs");
//			bgColor = attrs["background-color"]? new Color(attrs["background-color"]) : bgDefault;
//			fgColor = attrs["color"]? new Color(attrs["color"]) : fgDefault;
			bgColor = bgDefault;
			fgColor = fgDefault;
			bgLum = bgColor.lightness();
			fgLum = fgColor.lightness();

			bodySelector = "body." + toBodyClass(bundle);
			styles = {};//_.pick(attrs, ["background-color", "background", "color"]);
			styles["-webkit-font-smoothing"] = (bgLum < fgLum? "antialiased" : "auto");
			/* 'body { -moz-osx-font-smoothing: grayscale; }' works ok in all situations: hardcoded in _base.scss */
			//styles["-moz-osx-font-smoothing"] = (bgLum < fgLum? "grayscale" : "auto");
			Styles.createCSSRule(bodySelector, styles);

			styles = {
				"color":			fgColor.lightness(fgLum * 0.500 + bgLum * 0.500).toHexString(),
				"border-color": 	fgColor.lightness(fgLum * 0.300 + bgLum * 0.700).toHexString(),
			};
			Styles.createCSSRule(bodySelector + " .mutable-faded", styles);

			carouselSelector = ".carousel." + bundle.get("handle");
			styles = _.pick(attrs, ["box-shadow", "border", "border-radius"]);//, "background-color"]);
			Styles.createCSSRule(carouselSelector + " .image-item img", styles);

			styles = {
				// text color luminosity is inverse from body, apply oposite rendering mode
				"-webkit-font-smoothing": (bgLum < fgLum? "auto" : "antialiased"),
//				"color": 			bgColor.toHexString(),
				"color": 			bgColor.lightness(fgLum * 0.005 + bgLum * 0.995).toHexString(),
//				"color": 			bgColor.lightness(fgLum * 0.125 + bgLum * 0.875).toHexString(),
//				"border-color": 	bgColor.lightness(fgLum * 0.075 + bgLum * 0.925).toHexString(),
				"background-color": bgColor.lightness(fgLum * 0.100 + bgLum * 0.900).toHexString(),
//				"box-shadow":		"inset 0 0 3px -2px " + bgColor.lightness(fgLum * 0.5 + bgLum * 0.5).toHexString(),
//				"border": 			"0 none transparent",
			};
			Styles.createCSSRule(carouselSelector + " .image-item .placeholder", styles);

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
