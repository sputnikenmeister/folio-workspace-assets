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
//		var DEBOUNCE = 500;
//		this.selectBundle = _.debounce(this.selectBundle, DEBOUNCE);
//		this.deselectBundle = _.debounce(this.deselectBundle, DEBOUNCE);
//		this.selectImage = _.debounce(this.selectImage, DEBOUNCE);
//		this.deselectImage = _.debounce(this.deselectImage, DEBOUNCE);

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

		this.listenToOnce(bundles, "all", this.routeInitialized);
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

	selectBundle: function (bundle) {
//		var image = bundle.get("images").selected;
		var image = void 0;
		this._changeSelection(bundle, image);
		this._updateLocation();
	},

	deselectImage: function () {
		var bundle = bundles.selected;
		this._changeSelection(bundle);
		this._updateLocation();
	},

	deselectBundle: function () {
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
//		_.defer(_.bind(this.navigate, this), this._getLocation(bundle, image), {trigger: false});
		this.navigate(this._getLocation(bundle, image), {trigger: false});
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
	 * Router handlers (browser address changes)
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
		console.log("Controller._changeSelection [before] bundle:" + (bundle? bundle.cid : "-") + " image:" + (image? image.cid : "-"));
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
		console.log("Controller._changeSelection [after]  bundle:" + (bundle? bundle.cid : "-") + " image:" + (image? image.cid : "-"));
	},

	/* --------------------------- *
	 * Initialization
	 * --------------------------- */

	routeInitialized: function() {
		console.log("Controller.routeInitialized");
		var $body = Backbone.$("body");
		this.addClass = function () {
			var retval = $body.addClass.apply($body, arguments);
			console.log("Controller $body.addClass", arguments[0]);
			return retval;
		};
		this.removeClass = function () {
			var retval = $body.removeClass.apply($body, arguments);
			console.log("Controller $body.removeClass", arguments[0]);
			return retval;
		};
//		this.addClass = _.bind($body.addClass, $body);
//		this.removeClass = _.bind($body.removeClass, $body);

		this.inilializeHandlers();
		this.initializeEnteringHandlers();
		this.initializeBundleStyles();
		this.initializeBrowserTitle();
	},

	inilializeHandlers: function() {
//		var $body = Backbone.$("body");
		var $body = this;
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

	/*inilializeHandlers2: function() {
		var $body = Backbone.$("body");
		var images = null;
		var withBundle, withoutBundle, withImage, withoutImage;

		withImage = function() {
			$body.removeClass("without-image").addClass("with-image");
			this.listenToOnce(images, "select:none", withoutImage);
		};
		withoutImage = function () {
			$body.removeClass("with-image").addClass("without-image");
			this.listenToOnce(images, "select:one", withImage);
		};
		withBundle = function() {
			$body.removeClass("without-bundle").addClass("with-bundle");
			this.listenToOnce(bundles, "select:none", withoutBundle);
		};
		withoutBundle = function () {
			$body.removeClass("with-bundle").addClass("without-bundle");
			this.listenToOnce(bundles, "select:one", withBundle);
		};

		var bundleHandlers = {
			"select:one": function (bundle) {
				images = bundle.get("images");
				(images.selected? withImage : withoutImage).call(this);
			},
			"deselect:one": function (bundle) {
				images = null;
				$body.removeClass("with-image without-image");
				this.stopListening(bundle.get("images"), {"select:none": withoutImage, "select:one": withImage });
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

	initializeEnteringHandlers: function () {
//		var $body = Backbone.$("body");
		var $body = this;
		var enteringBundle = function () {
			$body.removeClass("entering-bundle");
		};
		var bundleEnteringHandlers = {
			"select:one": function (bundle) {
				$body.addClass("entering-bundle");
				this.listenToOnce(bundle.get("images"), "select:one select:none", enteringBundle);
			},
			"deselect:one": function (bundle) {
				$body.removeClass("entering-bundle");
				this.stopListening(bundle.get("images"), "select:one select:none", enteringBundle);
			},
		};
		this.listenTo(bundles, bundleEnteringHandlers);
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

		bgDefault = new Color(Styles.getCSSProperty("body", "background-color") || "hsl(47, 5%, 95%)");
		fgDefault = new Color(Styles.getCSSProperty("body", "color") || "hsl(47, 5%, 15%)");

		bundles.each(function (bundle) {
			attrs = bundle.get("attrs");
			fgColor = attrs["color"]? new Color(attrs["color"]) : fgDefault;
			bgColor = attrs["background-color"]? new Color(attrs["background-color"]) : bgDefault;
			//bgColor = bgDefault; fgColor = fgDefault;
			bgLum = bgColor.lightness();
			fgLum = fgColor.lightness();

			bodySelector = "body." + toBodyClass(bundle);
			//styles = {};
			styles = _.pick(attrs, ["background-color", "background", "color"]);
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

//		var $body = Backbone.$("body");
		var $body = this;

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
