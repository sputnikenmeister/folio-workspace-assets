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
/** @type {module:app/helper/StyleHelper} */
var Styles = require("../helper/StyleHelper");
/** @type {module:app/utils/debug/traceArgs} */
var traceArgs = require("../utils/debug/traceArgs");
/** @type {module:app/utils/debug/traceArgs} */
var stripTags = require("../utils/strings/stripTags");

/** @type {module:app/model/collection/TypeCollection} */
var types = require("../model/collection/TypeCollection");
/** @type {module:app/model/collection/KeywordCollection} */
var keywords = require("../model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("../model/collection/BundleCollection");

/* --------------------------- *
 * Static private
 * --------------------------- */

/**
 * @constructor
 * @type {module:app/control/Controller}
 */
var Controller = Backbone.Router.extend({

	/** @override */
	routes: {
		"bundles/:bundleHandle(/:imageIndex)": "toBundleItem",
		"bundles": "toBundleCollection",
		"": function () {
			this.navigate("bundles", {
				trigger: true, replace: true
			});
		}
	},

	/** @override */
	initialize: function (options) {
		this._classProviders = [];

		this.initializeBrowserTitle();
		this.initializeBundleStyles();
		this.inilializeStateHandlers();

		// this.listenToOnce(bundles, "all", this.routeInitialized);
		// if (DEBUG) {
		// 	// error trace
		// 	var bundleTracer =	traceArgs("Bundles \t", "info");
		// 	var imageTracer = 	traceArgs("Images  \t", "info");
		// 	var routeTracer = 	traceArgs("Router  \t", "info");
		// 	var appTracer = 	traceArgs("App     \t", "info");
		//
		// 	this.listenTo(this, "route", routeTracer);
		// 	this.listenTo(Backbone,	"all", appTracer);
		// 	this.listenTo(bundles, {
		// 		"all": bundleTracer,
		// 		"select:one": function(bundle) {
		// 			this.listenTo(bundle.get("images"), "all", imageTracer);
		// 		},
		// 		"deselect:one": function(bundle) {
		// 			this.stopListening(bundle.get("images"), "all", imageTracer);
		// 		}
		// 	});
		// }
	},

	// listenTo: function() {
	// 	console.log("Controller.listenTo", arguments);
	// 	return Backbone.Router.prototype.listenTo.apply(this, arguments);
	// },

	// stopListening: function() {
	// 	console.log("Controller.stopListening", arguments);
	// 	return Backbone.Router.prototype.stopListening.apply(this, arguments);
	// },

	/* ---------------------------
	 * Document body classes
	 * --------------------------- */

	_applyClassProviders: function(bundle, image) {
		var classes = [];
		_.each(this._classProviders, function(fn) {
			fn(classes, bundle, image);
		});
		document.body.className = classes.join(" ");
	},

	addClassProvider: function(fn) {
		this._classProviders.push(fn);
	},

	/* ---------------------------
	 * Public command methods
	 * --------------------------- */

	selectImage: function (image) {
		var bundle = image.get("bundle");
		//this._goToLocation(bundle, image);
		this._changeSelection(bundle, image);
		this._updateLocation();
	},

	selectBundle: function (bundle) {
		//var image = bundle.get("images").selected;
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
	_updateLocation: function() {
		var bundle, image;
		bundle = bundles.selected;
		if (bundle) {
			image = bundle.get("images").selected;
		}
		//_.defer(_.bind(this.navigate, this), this._getLocation(bundle, image), {trigger: false});
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

	toBundleCollection: function () {
		this._changeSelection();
	},

	/* -------------------------------
	 * Select Bundle/image
	 * ------------------------------- */

	/* Select Bundle/image */
	_changeSelection: function (bundle, image) {
		console.log("Controller._changeSelection [before] bundle:" +
					(bundle? bundle.cid : "-") + " image:" + (image? image.cid : "-"));

		this._applyClassProviders(bundle, image);

		if (_.isUndefined(bundle)) {
			bundles.deselect();
		} else {
			var opts = { silent: (bundle !== bundles.selected) };
			if (_.isUndefined(image)) {
				bundle.get("images").deselect(opts);
			} else {
				bundle.get("images").select(image, opts);
			}
			bundles.select(bundle);
		}
//		this._applyClassProviders(bundle, image);
		console.log("Controller._changeSelection [after]  bundle:" +
					(bundle? bundle.cid : "-") + " image:" + (image? image.cid : "-"));
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
	 * per-bundle styles
	 * --------------------------- */

	initializeBundleStyles: function() {
		var classProvider, toBodyClass, createDerivedStyles;
		toBodyClass = function (bundle) {
			return "bundle-" + bundle.id;
		};
		classProvider = function(classes, bundle, image) {
			bundle && classes.push(toBodyClass(bundle));
		};
		createDerivedStyles = function() {
			var fgColor, bgColor, bgLum, fgLum;
			var bgDefault, fgDefault;
			var attrs, styles, bodySelector, carouselSelector;
			var bodyStyles = ["background", "background-color", "color"];
			// var fontSmoothingStyles = ["-moz-osx-font-smoothing", "-webkit-font-smoothing"];
			var carouselImageStyles = ["box-shadow", "border", "border-radius"];//, "background-color"];
			// var placeholderStyles = ["border-radius"];

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
				styles = _.pick(attrs, bodyStyles);
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
				styles = _.pick(attrs, carouselImageStyles);//, "background-color"]);
				Styles.createCSSRule(carouselSelector + " .image-item img", styles);

				// text color luminosity is inverse from body, apply oposite rendering mode
				styles = {
					"-webkit-font-smoothing": (bgLum < fgLum? "auto" : "antialiased"),
					"background-color": bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString(),
					"color": 			bgColor.lightness(fgLum * 0.005 + bgLum * 0.995).toHexString(),
				};
				("border-radius" in attrs) && (styles["border-radius"] = attrs["border-radius"]);
				Styles.createCSSRule(carouselSelector + " .image-item .placeholder", styles);
			});
		};
		// var $body = Backbone.$("body");
		// var handlers = {
		// 	"deselect:one": function (bundle) {
		// 		$body.removeClass(toBodyClass(bundle));
		// 	},
		// 	"select:one": function (bundle) {
		// 		$body.addClass(toBodyClass(bundle));
		// 	},
		// };
		// this.listenTo(bundles, handlers);
		// if (bundles.selected) {
		// 	handlers["select:one"].call(this, bundles.selected);
		// }
		if (document.readyState === "complete") {
			createDerivedStyles();
		} else {
			$(window).load(createDerivedStyles);
		}
		this.addClassProvider(classProvider);
	},

	/* --------------------------- *
	 * state handlers
	 * --------------------------- */

	inilializeStateHandlers: function() {
		this.addClassProvider(function(classes, bundle, image) {
			classes.push(bundle? "with-bundle":"without-bundle");
			bundle && classes.push(image? "with-image":"without-image");
		});
	},

	/*
	inilializeHandlers: function() {
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
	*/
	/*
	inilializeHandlers2: function() {
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

		// if (bundles.selected) {
		// 	withBundle.call(this);
		// 	images = bundles.selected.get("images");
		// 	if (images.selected) {
		// 		withImage.call(this);
		// 	} else {
		// 		withoutImage.call(this);
		// 	}
		// } else {
		// 	withoutBundle.call(this);
		// }
		(bundles.selected? withBundle : withoutBundle).call(this);
	},*/

	/*
	initializeEnteringHandlers: function () {
		var $body = Backbone.$("body");
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
	*/
});

module.exports = new Controller();
