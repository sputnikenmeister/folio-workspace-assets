/**
 * @module app/control/Presenter
 */

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );
/** @type {module:jquery-color} */
var Color = Backbone.$.Color;

/** @type {module:app/model/collection/TypeList} */
var types = require( "../model/collection/TypeList" );
/** @type {module:app/model/collection/KeywordList} */
var keywords = require( "../model/collection/KeywordList" );
/** @type {module:app/model/collection/BundleList} */
var bundles = require( "../model/collection/BundleList" );
/** @type {module:app/model/collection/ImageList} */
var images = require( "../model/collection/ImageList" );

/** @type {module:app/control/Router} */
// var router = require( "./Router" );

function invert(s) {
	return s.replace(/(\,|\;)/g, function(m) { return (m == ",")?";":","; });
}

/**
 * @constructor
 * @type {module:app/control/Presenter}
 */
function Presenter() {
	this.bundles = bundles;
	this.images = images;

	// _.bindAll(this, "routeToBundleItem", "routeToBundleList");
	var redirectToBundleItem = function (bundleHandle) {
		this.navigate("bundles/" + bundleHandle + "/0", { trigger: true, replace: true });
	};
	var redirectToBundleList = function() {
		this.navigate("bundles", { trigger: true, replace: true });
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

	var traceEvent = function(label) {
		return function(ev) { console.log(label, ev, Array.prototype.slice.call(arguments).join(" ")); };
	};
	// this.listenTo(this.bundles, "all", traceEvent("bundles"));
	// this.listenTo(this.images, "all", traceEvent("images"));
	// this.listenTo(this.router, "all", traceEvent("router"));

	this.listenTo(this.bundles, "select:one", this.onBundleItem);
	this.listenTo(this.bundles, "select:none", this.onBundleList);
}

_.extend(Presenter.prototype, Backbone.Events, {

	/* --------------------------- *
	 * Select Image
	 * --------------------------- */

	selectImage: function (image) {
		this.router.navigate("bundles/" + bundles.selected.get("handle") + "/" + (images.indexOf(image)), {trigger: false});
		this.doSelectImage(image);
	},
	routeToImage: function (bundleHandle, imageIndex) {
	},
	doSelectImage: function(image) {
		images.select(image);
	},

	/* -------------------------------
	 * Select Bundle
	 * ------------------------------- */

	/* Handle view events */
	selectBundle: function (model) {
		this.router.navigate("bundles/" + model.get("handle") + "/0", {trigger: false});
		this._selectBundle(model);
	},
	/* Handle router events */
	routeToBundleItem: function (bundleHandle, imageIndex) {
		var bundle = bundles.findWhere({handle: bundleHandle});
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

	onBundleItem: function(bundle) {
		images.reset(bundle.get("images"));
		this.applySelectionStyles();
		document.title = "Portfolio – " + bundles.selected.get("name");
	},

	/* -------------------------------
	 * Deselect Bundle
	 * ------------------------------- */

	/* Handle view events */
	deselectBundle: function () {
		this.router.navigate("bundles", { trigger: false });
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

	onBundleList: function() {
		images.reset();
		this.clearSelectionStyles();
		document.title = "Portfolio";
	},

	/* --------------------------- *
	 * Helpers
	 * --------------------------- */

	bodyStyles: ["background", "background-color", "color", "-moz-osx-font-smoothing", "-webkit-font-smoothing"],

	clearSelectionStyles: function() {
		Backbone.$("body").removeAttr("style");
	},
	applySelectionStyles: function() {
		var css = {};

		_.each(bundles.selected.get("attrs"), function(o) {
			o = o.split(":");
			if (o.length > 1)
				css[o[0]] = invert(o[1]);
		});
		css = _.pick(css, this.bodyStyles);
		Backbone.$("body").removeAttr("style").css(css);

		////
		var bgColor, fgColor;
		var bodyCssRule = _.findWhere(document.styleSheets[0].cssRules, {selectorText: "body"});
		var bodyBgColor = bodyCssRule.style.backgroundColor;
		bodyBgColor = new Color(bodyBgColor).toHexString();

		if (css["background-color"]) {
			bgColor = new Color(css["background-color"]);
		} else {
			bgColor = new Color(bodyBgColor);
		}

		var selectorText = ".image-item .placeholder";
		var bgPh = bgColor.lightness("-=0.05");
		var borderPh = bgColor.lightness("-=0.08");

		var cssRule = _.findWhere(document.styleSheets[0].cssRules, {selectorText: selectorText});
		cssRule.style.backgroundColor = bgPh.toHexString();
		cssRule.style.borderColor = borderPh.toHexString();

		console.log("Color attrs: ", css);
		console.log("Color bgColor: ", bodyBgColor, [bgColor, bgPh, borderPh]);
	},

	// fetchBundleData: function (bundle) {
	// 	if (!bundle.has("images")) {
	// 		bundle.fetch().done(
	// 			function (bundle) {
	// 				images.set(bundle.get("images"), {add: false, remove: false});
	// 			}
	// 		).fail(
	// 			function () {
	// 				// Should provide more info here...
	// 				Backbone.trigger("app:error");
	// 			}
	// 		);
	// 	}
	// },
});

module.exports = new Presenter();
