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
		// this._lastBundle = null;
		// this._lastImage = null;
		// this._currentBundle = null;
		// this._currentImage = null;

		this._classProviders = [];
		this._initialBodyClasses = document.body.className;

		this.initializeBrowserTitle();
		this.initializeBundleStyles();
		this.inilializeStateHandlers();
	},

	/* ---------------------------
	 * Document body classes
	 * --------------------------- */

	_applyClassProviders: function(bundle, image) {
		var classes = [this._initialBodyClasses];
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
	
	/*
	 * NOTE: Selection order
	 * - Apply image selection to *incoming bundle*, as not to trigger
	 *	unneccesary events on an outgoing bundle. Outgoing bundle image selection
	 *	remains untouched.
	 * - Apply image selection *before* selecting the incoming bundle. Views
	 *	normally listen to the selected bundle only, so if the bundle is changing,
	 *	they will not be listening to image selection changes yet.
	 */
	/* Select Bundle/image */
	_changeSelection: function (bundle, image) {
		// this._lastBundle = this._currentBundle;
		// this._lastImage = this._currentImage;
		// this._currentBundle = bundle;
		// this._currentImage = image;
		
		var lastBundle = bundles.selected;
		var lastImage = lastBundle? lastBundle.get("images").selected : void 0;
		console.log("----");
		console.log("---- Controller._changeSelection " +
			" [bundle: " + (lastBundle? lastBundle.cid : "none") +
			" => " + (bundle? bundle.cid : "none") +
			"] [image: " + (lastImage? lastImage.cid : "none") +
			" => " + (image? image.cid : "none") +
			"]"
		);
		
		this.trigger("change:before", bundle, image);
		// this._applyClassProviders(bundle, image);
		
		// if (_.isUndefined(bundle)) {
		// 	bundles.deselect();
		// } else {
		// 	if (_.isUndefined(image)) {
		// 		bundle.get("images").deselect();
		// 	} else {
		// 		bundle.get("images").select(image);
		// 	}
		// 	bundles.select(bundle);
		// }
		bundle && bundle.get("images").select(image);
		bundles.select(bundle);
		
		this._applyClassProviders(bundle, image);
		this.trigger("change:after", bundle, image);
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
		var toBodyClass = function (bundle) {
			return "bundle-" + bundle.id;
		};

		var classProvider = function(classes, bundle, image) {
			bundle && classes.push(toBodyClass(bundle));
		};
		this.addClassProvider(classProvider);

		var createDerivedStyles = function() {
			var fgColor, bgColor, bgLum, fgLum;
			var bgDefault, fgDefault;
			var attrs, styles, bodySelector, carouselSelector;
			var bodyStyles = ["background", "background-color", "color"];
			// var fontSmoothingStyles = ["-moz-osx-font-smoothing", "-webkit-font-smoothing"];
			var carouselMediaStyles = ["box-shadow", "border", "border-radius"];//, "background-color"];
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
				
				// per-bundle body rules
				bodySelector = "body." + toBodyClass(bundle);
				styles = _.pick(attrs, bodyStyles);
				styles["-webkit-font-smoothing"] = (bgLum < fgLum? "antialiased" : "auto");
				/* NOTE: In Firefox 'body { -moz-osx-font-smoothing: grayscale; }'
				/* works both in light over dark and dark over light, hardcoded in _base.scss */
				//styles["-moz-osx-font-smoothing"] = (bgLum < fgLum? "grayscale" : "auto");
				Styles.createCSSRule(bodySelector, styles);
				
				styles = {};
				styles["color"] = fgColor.lightness(fgLum * 0.500 + bgLum * 0.500).toHexString();
				styles["border-color"] = fgColor.lightness(fgLum * 0.300 + bgLum * 0.700).toHexString();
				Styles.createCSSRule(bodySelector + " .mutable-faded", styles);
				
				// per-bundle .carousel .media-item rules
				carouselSelector = ".carousel." + bundle.get("handle");
				styles = _.pick(attrs, carouselMediaStyles);//, "background-color"]);
				Styles.createCSSRule(carouselSelector + " .media-item .content", styles);
				
				// text color luminosity is inverse from body, apply oposite rendering mode
				styles = {};
				styles["-webkit-font-smoothing"] = (bgLum < fgLum? "auto" : "antialiased");
				styles["background-color"] = bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString();
				styles["color"] = bgColor.lightness(fgLum * 0.005 + bgLum * 0.995).toHexString();
				("border-radius" in attrs) && (styles["border-radius"] = attrs["border-radius"]);
				Styles.createCSSRule(carouselSelector + " .media-item .content-decoration", styles);
				
				styles = {};
				styles["background-color"] = bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).alpha(0.5).toRgbaString();
				Styles.createCSSRule(carouselSelector + " .media-item .overlay", styles);
				// Styles.createCSSRule(bodySelector + " .mutable-faded", styles);
				// console.log(carouselSelector + " .media-item .content-decoration", styles["background-color"]);
			});
		};
		if (document.readyState == "complete") {
			createDerivedStyles();
		} else {
			document.addEventListener("load", createDerivedStyles);
			console.warn("Controller.initializeBundleStyles: document.readyState is '" +
				document.readyState + "', will wait for 'load' event.");
		}
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
});

module.exports = new Controller();
