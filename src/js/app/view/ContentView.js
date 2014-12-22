/*jslint nomen: true, vars: true, undef: true, eqeq: true, bitwise: true, sloppy: true, white: true */
/*global require, module*/

/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {jQuery.Deferred} */
var Deferred = Backbone.$.Deferred;

/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/helper/View} */
var View = require("../helper/View");
/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");
/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");

/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/DotNavigationRenderer} */
var DotNavigationRenderer = require("./render/DotNavigationRenderer");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageDescTemplate = require("./template/CollectionStack.Image.tpl");


/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = View.extend({

	/** Setup listening to model changes */
	initialize: function (options) {

		// content-detail (layout container)
		this.container = document.createElement("div");
		this.container.id = "content-detail";
		this.$el.append(this.container);

		/* -------------------------------
		 * selected bundle detail
		 * ------------------------------- */
//		this.bundleDetail = new CollectionStack({
//			id: "bundle-detail",
//			collection: bundles,
//			template: bundleDescTemplate,
//			className: "bundle-detail full-width"
//		});
//		this.bundleDetail.render().$el.appendTo(this.container);

		this.listenTo(bundles, {
			"select:one": this._onBundleSelect,
			"deselect:one": this._onBundleDeselect
		});
		if (bundles.selected) {
			this.createChildren(bundles.selected, true);
		}
	},

	/** @override */
	remove: function () {
		View.prototype.remove.apply(this, arguments);
		if (bundles.selected) {
			this.removeChildren();
		}
//		this.bundleDetail.remove();
		this.$el.remove(this.container);
	},

	/* -------------------------------
	 * removeChildren
	 * ------------------------------- */

	_onBundleDeselect: function (bundle) {
		this.removeChildren(bundle, false);
	},
	removeChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

		this.stopListening(images);
		this.stopListening(this.pager);
		this.stopListening(this.carousel);

		//var deferred = new Deferred();
		if (skipAnimation) {
			this.imageDetail.remove();
			this.pager.remove();
			this.carousel.remove();
		//	deferred.resolveWith(this);
		} else {
			this.imageDetail.stopListening();
			this.pager.stopListening();
			this.carousel.stopListening();
			this.$([this.imageDetail.el, this.pager.el, this.carousel.el])
				.css({
					position: "absolute"
				})
				.transit({
					opacity: 0
				}, 300, "ease", _.bind(function (carousel, pager, imageDetail) {
					imageDetail.remove();
					pager.remove();
					carousel.remove();
					//deferred.resolveWith(this);
				}, this, this.carousel, this.pager, this.imageDetail));
		}

		this.pager = void 0;
		this.carousel = void 0;
		this.imageDetail = void 0;
		//return deferred.promise();
	},

	/* -------------------------------
	 * createChildren
	 * ------------------------------- */

	_onBundleSelect: function (bundle) {
		this.createChildren(bundle, false);
	},
	createChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

		/* -------------------------------
		 * Create views
		 * ------------------------------- */

		this.pager = new SelectableListView({
			collection: images,
			renderer: DotNavigationRenderer,
			className: "images-pager dots-fontello mutable-faded"
		});
		this.carousel = new Carousel({
			collection: images,
			renderer: ImageRenderer,
			emptyRenderer: View.extend({
				className: "carousel-item empty-item",
				render: function() {
					this.$el.html(bundleDescTemplate(bundle.attributes));
					return this;
				}
			})
		});
		this.imageDetail = new CollectionStack({
			collection: images,
			template: imageDescTemplate,
			className: "image-detail aside"
		});
		this.imageDetail.render().$el.appendTo(this.container);
		this.pager.render().$el.appendTo(this.container);
		this.carousel.render().$el.appendTo(this.el);

		/* -------------------------------
		 * Attach event handlers
		 * ------------------------------- */

		controller.listenTo(this.pager, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		controller.listenTo(this.carousel, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});

//		this.listenTo(images, {
//			"select:one": this._onSelecteOneImage,
//			"select:none": this._onSelectNoImage
//		});

		if (images.selected) {
			this._onOneImageSelected();
//			this.listenToOnce(this.carousel.collection, "select:none", this._onNoImageSelected);
		} else {
			this._onNoImageSelected();
//			this.listenToOnce(this.carousel.collection, "select:one", this._onOneImageSelected);
		}

		/* -------------------------------
		 * Show/animate views
		 * ------------------------------- */

		//var deferred = new Deferred();
		if (skipAnimation) {
			//deferred.resolveWith(this);
		} else {
			this.$([this.imageDetail.el, this.pager.el, this.carousel.el])
				.css({
					opacity: 0
				}).delay(700)
				.transit({
					opacity: 1
				}, 300);//, "ease", _.bind(deferred.resolveWith, deferred, this));
		}
		//return deferred.promise();
	},

	/* -------------------------------
	 * Image view listeners
	 * ------------------------------- */

	_onOneImageSelected: function () {
//		this.bundleDetail.$el.fadeOut();
		this.listenToOnce(this.carousel.collection, "select:none", this._onNoImageSelected);
	},

	_onNoImageSelected: function () {
//		this.bundleDetail.$el.fadeIn();
		this.listenToOnce(this.carousel.collection, "select:one", this._onOneImageSelected);
	},

});

module.exports = ContentView;
