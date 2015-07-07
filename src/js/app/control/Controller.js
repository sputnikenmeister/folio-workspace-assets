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
		"bundles/:bundleHandle(/:mediaIndex)": "toBundleItem",
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
		// this._lastMedia = null;
		// this._currentBundle = null;
		// this._currentMedia = null;

		this._classProviders = [];
		this._initialBodyClasses = document.body.className;

		this.initializeBrowserTitle();
		this.initializeBundleStyles();
		this.inilializeStateHandlers();
	},

	/* ---------------------------
	 * Document body classes
	 * --------------------------- */

	_applyClassProviders: function(bundle, media) {
		var classes = [this._initialBodyClasses];
		_.each(this._classProviders, function(fn) {
			fn(classes, bundle, media);
		});
		document.body.className = classes.join(" ");
	},

	addClassProvider: function(fn) {
		this._classProviders.push(fn);
	},

	/* ---------------------------
	 * Public command methods
	 * --------------------------- */

	selectMedia: function (media) {
		var bundle = media.get("bundle");
		//this._goToLocation(bundle, media);
		this._changeSelection(bundle, media);
		this._updateLocation();
	},

	selectBundle: function (bundle) {
		//var media = bundle.get("media").selected;
		var media = void 0;
		this._changeSelection(bundle, media);
		this._updateLocation();
	},
	
	deselectMedia: function () {
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
		var bundle, media;
		bundle = bundles.selected;
		if (bundle) {
			media = bundle.get("media").selected;
		}
		//_.defer(_.bind(this.navigate, this), this._getLocation(bundle, media), {trigger: false});
		this.navigate(this._getLocation(bundle, media), {trigger: false});
	},
	
	_getLocation: function(bundle, media) {
		var mediaIndex, location;
		location = "bundles";
		if (bundle) {
			location += "/" + bundle.get("handle");
			if (media) {
				mediaIndex = bundle.get("media").indexOf(media);
				if (mediaIndex >= 0) {
					location += "/" + mediaIndex;
				}
			}
		}
		return location;
	},
	
	_goToLocation: function(bundle, media) {
		this.navigate(this._getLocation(bundle, media), {trigger: true});
	},
	
	/* --------------------------- *
	 * Router handlers (browser address changes)
	 * --------------------------- */
	
	toBundleItem: function (bundleHandle, mediaIndex) {
		var bundle, media;
		bundle = bundles.findWhere({handle: bundleHandle});
		if (!bundle) {
			throw new Error("Cannot find bundle with handle \"" + bundleHandle + "\"");
		}
		if (mediaIndex) {
			media = bundle.get("media").at(mediaIndex);
			if (!media) {
				throw new Error("No media at index " + mediaIndex + " bundle with handle \"" + bundleHandle + "\"");
			}
		}
		this._changeSelection(bundle, media);
	},

	toBundleCollection: function () {
		this._changeSelection();
	},
	
	/* -------------------------------
	 * Select Bundle/media
	 * ------------------------------- */
	
	/*
	 * NOTE: Selection order
	 * - Apply media selection to *incoming bundle*, as not to trigger
	 *	unneccesary events on an outgoing bundle. Outgoing bundle media selection
	 *	remains untouched.
	 * - Apply media selection *before* selecting the incoming bundle. Views
	 *	normally listen to the selected bundle only, so if the bundle is changing,
	 *	they will not be listening to media selection changes yet.
	 */
	/* Select Bundle/media */
	_changeSelection: function (bundle, media) {
		// this._lastBundle = this._currentBundle;
		// this._lastMedia = this._currentMedia;
		// this._currentBundle = bundle;
		// this._currentMedia = media;
		
		var lastBundle = bundles.selected;
		var lastMedia = lastBundle? lastBundle.get("media").selected : void 0;
		console.log("----");
		console.log("---- Controller._changeSelection " +
			" [bundle: " + (lastBundle? lastBundle.cid : "none") +
			" => " + (bundle? bundle.cid : "none") +
			"] [media: " + (lastMedia? lastMedia.cid : "none") +
			" => " + (media? media.cid : "none") +
			"]"
		);
		
		this.trigger("change:before", bundle, media);
		// this._applyClassProviders(bundle, media);
		
		// if (_.isUndefined(bundle)) {
		// 	bundles.deselect();
		// } else {
		// 	if (_.isUndefined(media)) {
		// 		bundle.get("media").deselect();
		// 	} else {
		// 		bundle.get("media").select(media);
		// 	}
		// 	bundles.select(bundle);
		// }
		bundle && bundle.get("media").select(media);
		bundles.select(bundle);
		
		this._applyClassProviders(bundle, media);
		this.trigger("change:after", bundle, media);
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

		var classProvider = function(classes, bundle, media) {
			bundle && classes.push(toBodyClass(bundle));
		};
		this.addClassProvider(classProvider);

		var createDerivedStyles = function() {
			var bodyStyles = ["background", "background-color", "color"];
			// var fontSmoothingStyles = ["-moz-osx-font-smoothing", "-webkit-font-smoothing"];
			var carouselMediaStyles = ["box-shadow", "border", "border-radius"];//, "background-color"];
			// var placeholderStyles = ["border-radius"];
			var attrs, styles, bodySelector, carouselSelector;
			var fgColor, bgColor, bgLum, fgLum, isLightOverDark, tmpVal;
			var bgDefault, fgDefault;
			
			bgDefault = new Color(Styles.getCSSProperty("body", "background-color") || "hsl(47, 5%, 95%)");
			fgDefault = new Color(Styles.getCSSProperty("body", "color") || "hsl(47, 5%, 15%)");
			
			bundles.each(function (bundle) {
				attrs = bundle.attrs();//get("attrs");
				fgColor = attrs["color"]? new Color(attrs["color"]) : fgDefault;
				bgColor = attrs["background-color"]? new Color(attrs["background-color"]) : bgDefault;
				//bgColor = bgDefault; fgColor = fgDefault;
				bgLum = bgColor.lightness();
				fgLum = fgColor.lightness();
				isLightOverDark = bgLum < fgLum;
				
				// per-bundle body rules
				bodySelector = "body." + toBodyClass(bundle);
				styles = _.pick(attrs, bodyStyles);
				styles["-webkit-font-smoothing"] = (isLightOverDark? "antialiased" : "auto");
				/* NOTE: In Firefox 'body { -moz-osx-font-smoothing: grayscale; }'
				/* works both in light over dark and dark over light, hardcoded in _base.scss */
				//styles["-moz-osx-font-smoothing"] = (isLightOverDark? "grayscale" : "auto");
				Styles.createCSSRule(bodySelector, styles);
				
				styles = {};
				styles["color"] = fgColor.lightness(fgLum * 0.5 + bgLum * 0.5).toHexString();
				styles["border-color"] = fgColor.lightness(fgLum * 0.3 + bgLum * 0.7).toHexString();
				Styles.createCSSRule(bodySelector + " .mutable-faded", styles);
				
				// inverted fg/bg (slightly muted)
				styles = {};
				styles["color"] = bgColor.lightness(bgLum * 0.9 + fgLum * 0.1).toHexString();
				styles["border-color"] = bgColor.lightness(bgLum * 0.7 + fgLum * 0.3).toHexString();
				Styles.createCSSRule(bodySelector + " .color-invert-fg", styles);
				styles = {};
				styles["background-color"] = fgColor.lightness(fgLum * 0.9 + bgLum * 0.1).toHexString();
				Styles.createCSSRule(bodySelector + " .color-invert-bg", styles);
				
				// styles = {};
				// styles["background-color"] = "transparent";
				// styles["background"] = "linear-gradient(to bottom, " +
				// 		bgColor.alpha(0.11).toRgbaString() + " 33%, " +
				// 		bgColor.alpha(0.66).toRgbaString() + " 66%)";
				// Styles.createCSSRule(carouselSelector + " .media-item[data-state=\"user\"] .gradient", styles);
				
				// per-bundle .carousel .media-item rules
				carouselSelector = ".carousel." + bundle.get("handle");
				styles = _.pick(attrs, carouselMediaStyles);//, "background-color"]);
				Styles.createCSSRule(carouselSelector + " .media-item .content", styles);
				
				// text color luminosity is inverse from body, apply oposite rendering mode
				styles = {};
				styles["-webkit-font-smoothing"] = (isLightOverDark? "auto" : "antialiased");
				styles["background-color"] = bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString();
				styles["color"] = bgColor.lightness(fgLum * 0.005 + bgLum * 0.995).toHexString();
				("border-radius" in attrs) && (styles["border-radius"] = attrs["border-radius"]);
				Styles.createCSSRule(carouselSelector + " .media-item .placeholder", styles);
				
				styles = {};
				// Darken if dark, lighten if light, then clamp value to 0-1
				tmpVal = Math.min(Math.max(bgLum * (isLightOverDark? 0.95 : 1.05), 0), 1); 
				// tmpVal = fgLum * 0.050 + bgLum * 0.950;
				styles["background-color"] = bgColor.lightness(tmpVal).alpha(0.66).toRgbaString();
				Styles.createCSSRule(carouselSelector + " .video-renderer.selected .overlay[data-state=\"user\"]", styles);
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
		this.addClassProvider(function(classes, bundle, media) {
			classes.push(bundle? "with-bundle":"without-bundle");
			bundle && classes.push(media? "with-media":"without-media");
		});
	},

	/*
	inilializeHandlers: function() {
		var $body = Backbone.$("body");
		var mediaHandlers = {
			"select:none": function () {
				$body.removeClass("with-media").addClass("without-media");
			},
			"deselect:none": function () {
				$body.removeClass("without-media").addClass("with-media");
			},
		};
		var bundleHandlers = {
			"select:one": function (bundle) {
				var media = bundle.get("media");
				this.listenTo(media, mediaHandlers);
				$body.addClass((media.selected? "with-media" : "without-media"));
			},
			"deselect:one": function (bundle) {
				var media = bundle.get("media");
				this.stopListening(media, mediaHandlers);
				$body.removeClass((media.selected? "with-media" : "without-media"));
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
		var media = null;
		var withBundle, withoutBundle, withMedia, withoutMedia;

		withMedia = function() {
			$body.removeClass("without-media").addClass("with-media");
			this.listenToOnce(media, "select:none", withoutMedia);
		};
		withoutMedia = function () {
			$body.removeClass("with-media").addClass("without-media");
			this.listenToOnce(media, "select:one", withMedia);
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
				media = bundle.get("media");
				(media.selected? withMedia : withoutMedia).call(this);
			},
			"deselect:one": function (bundle) {
				media = null;
				$body.removeClass("with-media without-media");
				this.stopListening(bundle.get("media"), {"select:none": withoutMedia, "select:one": withMedia });
			},
		};
		this.listenTo(bundles, bundleHandlers);

		// if (bundles.selected) {
		// 	withBundle.call(this);
		// 	media = bundles.selected.get("media");
		// 	if (media.selected) {
		// 		withMedia.call(this);
		// 	} else {
		// 		withoutMedia.call(this);
		// 	}
		// } else {
		// 	withoutBundle.call(this);
		// }
		(bundles.selected? withBundle : withoutBundle).call(this);
	},*/
});

module.exports = new Controller();
