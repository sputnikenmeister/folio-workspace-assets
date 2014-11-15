/**
 * @module app/control/Mediator
 * @requires module:backbone
 */

/** @type {module:backbone} */
var Backbone = require( "backbone" );
/** @type {module:underscore} */
var _ = require( "underscore" );

/** @type {module:app/control/Router} */
var router = require( "./Router" );

/** @type {module:app/model/collection/BundleList} */
var bundles = require( "../model/collection/BundleList" );
/** @type {module:app/model/collection/KeywordList} */
var keywords = require( "../model/collection/KeywordList" );
/** @type {module:app/model/collection/TypeList} */
var types = require( "../model/collection/TypeList" );
/** @type {module:app/model/collection/ImageList} */
var images = require( "../model/collection/ImageList" );

/**
 * @constructor
 * @type {module:app/control/Mediator}
 */
var Mediator = function () {
	this.listenTo(bundles, "select:one", this.onBundleSelect);
	this.listenTo(bundles, "select:none", this.onBundleDeselect);
	this.listenTo(router, "route:bundleItem", this.routeToBundleItem);
	this.listenTo(router, "route:bundleList", this.routeToBundleList);
};

_.extend(Mediator.prototype, Backbone.Events, {

	routeToBundleItem: function (handle) {
		var model = this.bundles.findWhere({ handle: handle });
		if (model) {
			this.selectBundle(model);
		} else {
			Backbone.trigger("app:error");
		}
	},
	/* Handle view events */
	onBundleSelect: function (model) {
		this.router.navigate("bundles/" + model.get("handle"), {trigger: false});
		this.selectBundle(model);
	},

	/* Handle model updates */
	selectBundle: function (bundle) {
		var stateChanging = this.bundles.selected === null;

		this.bundles.select(bundle);
		// Reset bundleImages with images by bundle ID (image.bId)
		this.bundleImages.reset(this.images.where({
			bId: this.bundles.selected.id
		}));
		// this.bundleImages.selectAt(0);
		this.fetchBundleData(bundle);
		if (stateChanging) {
			Backbone.trigger("app:bundleItem", this.bundles.selected);
		}
	},

	fetchBundleData: function (bundle) {
		if (!bundle.has("images")) {
			bundle.fetch().done(
				function (bundle) {
					images.set(bundle.get("images"), {add: false, remove: false});
				}
			).fail(
				function () {
					Backbone.trigger("app:error");
				}
			);
		}
	},

	/* Handle router events */
	routeToBundleList: function () {
		this.requestDeselectBundle();
	},

	/* Handle view events */
	onBundleDeselect: function () {
		this.router.navigate("", { trigger: false });
		this.requestDeselectBundle();
	},

	/* Handle model updates */
	requestDeselectBundle: function () {
		_.delay(this.doBundleDeselect, 350);
	},

	/* model is ready, update views */
	doBundleDeselect: function () {
		bundles.deselect();
		this.bundleImages.reset();
		Backbone.trigger("app:bundleList");
	},
});

// module.exports = (function(){
// 	var instance = new Mediator();
// 	return instance;
// }());
module.exports = new Mediator();
