/**
 * @module app/control/Presenter
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery-color} */
var Color = Backbone.$.Color;

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
	// _.bindAll(this, "routeToBundleItem", "routeToBundleList");
	var redirectToBundleItem = function (bundleHandle) {
		this.navigate("bundles/" + bundleHandle + "/0", {
			trigger: true,
			replace: true
		});
	};
	var redirectToBundleList = function () {
		this.navigate("bundles", {
			trigger: true,
			replace: true
		});
	};
	this.router = new Backbone.Router({
		routes: {
			"bundles/:bundleHandle/:imageIndex": _.bind(this.routeToBundleItem, this),
			"bundles/:bundleHandle": redirectToBundleItem,
			"bundles": _.bind(this.routeToBundleList, this),
			"": redirectToBundleList,
		}
	});

	this.listenToOnce(this.router, "all", function() {
		Backbone.$(document.body).removeClass("app-initial").addClass("app-ready");
	});

	// this.listenTo(this.router, "route:bundleItem", this.routeToBundleItem);
	// this.listenTo(this.router, "route:bundleList", this.routeToBundleList);

	this.listenTo(bundles, "select:one", this.onBundleItem);
	this.listenTo(bundles, "select:none", this.onBundleList);

	// var traceEvent = function(label) {
	// 	return function(ev) { console.log(label, ev, Array.prototype.slice.call(arguments).join(" ")); };
	// };
	// this.listenTo(this.bundles, "all", traceEvent("bundles"));
	// this.listenTo(this.images, "all", traceEvent("images"));
	// this.listenTo(this.router, "all", traceEvent("router"));
}

_.extend(Controller.prototype, Backbone.Events, {

	/* --------------------------- *
	 * Select Image
	 * --------------------------- */

	selectImage: function (image) {
		this.router.navigate("bundles/" + bundles.selected.get("handle") + "/" + (bundles.selected.get("images").indexOf(image)), {
			trigger: false
		});
		this._selectImage(image);
	},

	routeToImage: function (bundleHandle, imageIndex) {},

	_selectImage: function (image) {
		bundles.selected.get("images").select(image);
	},

	/* -------------------------------
	 * Select Bundle
	 * ------------------------------- */

	/* Handle view events */
	selectBundle: function (bundle) {
		this.router.navigate("bundles/" + bundle.get("handle") + "/0", {
			trigger: true
		});
		this._selectBundle(bundle);
	},

	/* Handle router events */
	routeToBundleItem: function (handle, imageIndex) {
		var bundle, images, image;
		bundle = bundles.findWhere({
			handle: handle
		});
		if (bundle) {
			this._selectBundle(bundle);
			if (imageIndex) {
				images = bundle.get("images");
				image = images.at(imageIndex);
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
	_selectBundle: function (bundle) {
		if (bundles.selected === null) {
			_.delay(function (context) {
				Backbone.trigger("app:bundle:item", bundle);
			}, 700, this);
			Backbone.trigger("app:bundle:item:before", bundle);
		} else {
			Backbone.trigger("app:bundle:item:change", bundle);
		}
		bundles.select(bundle);
	},

	/* -------------------------------
	 * Deselect Bundle
	 * ------------------------------- */

	/* Handle view events */
	deselectBundle: function () {
		this.router.navigate("bundles", {
			trigger: false
		});
		this._deselectBundle();
	},

	/* Handle router events */
	routeToBundleList: function () {
		this._deselectBundle();
	},

	/* Handle model updates */
	_deselectBundle: function () {
		_.delay(function (context) {
			bundles.deselect();
			Backbone.trigger("app:bundle:list:after");
		}, 350, this);
		Backbone.trigger("app:bundle:list");
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

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	clearSelectionStyles: function () {
//		Backbone.$("body").removeAttr("style");
		Styles.setCSSProperty("body", "color", "");
		Styles.setCSSProperty("body", "background-color", "");

//		Styles.setCSSProperty(".mutable-faded", "color", "");
//		Styles.setCSSProperty(".image-item .placeholder", "backgroundColor", "");
//		Styles.setCSSProperty(".image-item .placeholder", "borderColor", "");
	},

	applySelectionStyles: function () {
		var attrs = bundles.selected.get("attrs");

//		Backbone.$("body").removeAttr("style").css(_.pick(attrs, bodyStyles));
		Styles.setCSSProperty("body", "color", attrs["color"]);
		Styles.setCSSProperty("body", "background-color", attrs["background-color"]);
//		Styles.setCSSProperty(".mutable", "color", attrs["color"]);
//		Styles.setCSSProperty(".mutable", "background-color", attrs["background-color"]);

		// image-item img
		Styles.setCSSProperty(".image-item img", "box-shadow", attrs["box-shadow"]);
		Styles.setCSSProperty(".image-item img", "border-radius", attrs["border-radius"]);

		// mutable classes
		var fgColor, bgColor, bgLum, fgLum, cssRule;
		bgColor = new Color(attrs["background-color"] || Styles.getCSSProperty("body", "background-color"));// || "hsl(47, 5%, 95%)");
		fgColor = new Color(attrs["color"] || Styles.getCSSProperty("body", "color"));// || "hsl(47, 5%, 15%)");
		bgLum = bgColor.lightness();
		fgLum = fgColor.lightness();

		// background color derivates
		cssRule = Styles.getCSSRule(".image-item .placeholder");
		cssRule.style.backgroundColor = bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "background-color", bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString());
		cssRule.style.borderColor = bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "border-color", bgColor.lightness(fgLum * 0.200 + bgLum * 0.800).toHexString());
		cssRule.style.color =  bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString();
//		Styles.setCSSProperty(".image-item .placeholder", "color", bgColor.lightness(fgLum * 0.050 + bgLum * 0.950).toHexString());

		// text color derivates
		cssRule = Styles.getCSSRule(".mutable-faded");
		cssRule.style.color = fgColor.lightness(fgLum * 0.666 + bgLum * 0.333).toHexString();
//		Styles.setCSSProperty(".mutable-faded", "color", fgColor.lightness(fgLum * 0.666 + bgLum * 0.333).toHexString());
//		Styles.setCSSProperty(".mutable-color", "color", fgColor.toHexString());

		//console.log("CSS: ", bgColor.toHslaString(), fgColor.toHslaString(), attrs);
	},
});

module.exports = new Controller();
