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
/** @type {module:app/model/collection/ImageList} */
var images = require("../model/collection/ImageList");

/** @type {module:app/helper/Styles} */
var Styles = require("../helper/Styles");

/* --------------------------- *
 * Static private
 * --------------------------- */

var swap = function (s) {
	return s.replace(/(\,|\;)/g, function (m) {
		return (m == ",") ? ";" : ",";
	});
};

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

	// this.listenTo(this.router, "route:bundleItem", this.routeToBundleItem);
	// this.listenTo(this.router, "route:bundleList", this.routeToBundleList);

	// var traceEvent = function(label) {
	// 	return function(ev) { console.log(label, ev, Array.prototype.slice.call(arguments).join(" ")); };
	// };
	// this.listenTo(this.bundles, "all", traceEvent("bundles"));
	// this.listenTo(this.images, "all", traceEvent("images"));
	// this.listenTo(this.router, "all", traceEvent("router"));

	this.listenTo(bundles, "select:one", this.onBundleItem);
	this.listenTo(bundles, "select:none", this.onBundleList);
}

_.extend(Controller.prototype, Backbone.Events, {

	/* --------------------------- *
	 * Select Image
	 * --------------------------- */

	selectImage: function (image) {
		this.router.navigate("bundles/" + bundles.selected.get("handle") + "/" + (images.indexOf(image)), {
			trigger: false
		});
		this.doSelectImage(image);
	},

	routeToImage: function (bundleHandle, imageIndex) {},

	doSelectImage: function (image) {
		images.select(image);
	},

	/* -------------------------------
	 * Select Bundle
	 * ------------------------------- */

	/* Handle view events */
	selectBundle: function (model) {
		this.router.navigate("bundles/" + model.get("handle") + "/0", {
			trigger: true
		});
		this._selectBundle(model);
	},

	/* Handle router events */
	routeToBundleItem: function (bundleHandle, imageIndex) {
		var bundle = bundles.findWhere({
			handle: bundleHandle
		});
		if (bundle) {
			this._selectBundle(bundle);
			if (imageIndex) {
				var image = images.at(imageIndex);
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
		}
		bundles.select(bundle);
	},

	onBundleItem: function (bundle) {
		images.reset(bundle.get("images"));
		this.applySelectionStyles();
		document.title = "Portfolio – " + bundles.selected.get("name");
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
		}, 350, this);

		Backbone.trigger("app:bundle:list");
	},

	onBundleList: function () {
		images.reset();
		this.clearSelectionStyles();
		document.title = "Portfolio";
	},

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	clearSelectionStyles: function () {
		Backbone.$("body").removeAttr("style");
		//Styles.setCSSProperty(".text-color-faded", "color", "");
		//Styles.setCSSProperty(".image-item .placeholder", "backgroundColor", "");
		//Styles.setCSSProperty(".image-item .placeholder", "borderColor", "");
	},

	applySelectionStyles: function () {
		var attrs = {};
		_.each(bundles.selected.get("attrs"), function (attr) {
			if (attr.indexOf(":") > 0) {
				attr = attr.split(":");
				attrs[attr[0]] = swap(attr[1]);
			}
		});
		Backbone.$("body").removeAttr("style").css(_.pick(attrs, bodyStyles));

		var fgColor, bgColor, cssRule;
		// background color derivates
		bgColor = new Color(attrs["background-color"] || Styles.getCSSProperty("body", "background-color") || "hsl(47, 5%, 95%)");
		cssRule = Styles.getCSSRule(".image-item .placeholder");
		cssRule.style.backgroundColor = bgColor.lightness("-=0.05").toHexString();
		cssRule.style.borderColor = bgColor.lightness("-=0.08").toHexString();

		// text color derivates
		fgColor = new Color(attrs["color"] || Styles.getCSSProperty("body", "color") || "hsl(47, 5%, 15%)");
		cssRule = Styles.getCSSRule(".text-color-faded");
		cssRule.style.color = fgColor.lightness(fgColor.lightness() * 0.666 + bgColor.lightness() * 0.333).toHexString();

		// box-shadow
		Styles.setCSSProperty(".image-item img", "box-shadow", attrs["box-shadow"]);
		Styles.setCSSProperty(".image-item img", "border-radius", attrs["border-radius"]);

		//console.log("CSS: ", bgColor.toHslaString(), fgColor.toHslaString(), attrs);
	},
});

module.exports = new Controller();
