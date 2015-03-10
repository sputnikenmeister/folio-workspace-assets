/*jslint nomen: true, vars: true, undef: true, eqeq: true, bitwise: true, sloppy: true, white: true */
/*global require, module*/

/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/helper/View} */
var View = require("../helper/View");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");

/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/render/DotNavigationRenderer} */
var DotNavigationRenderer = require("./render/DotNavigationRenderer");

/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");
/** @type {module:app/view/BundleCarousel} */
var BundleCarousel = require("./BundleCarousel");
/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/CarouselEmptyRenderer} */
var CarouselEmptyRenderer = require("./render/CarouselEmptyRenderer");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageCaptionTemplate = require("./template/CollectionStack.Image.tpl");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = View.extend({

	initialize: function (options) {
		_.bindAll(this, "_onPan", "_onResize");
		this.children = [];
		Backbone.$(window).on("orientationchange resize", this._onResize);

//		this.carousel = this.createBundleCarousel(bundles);
		// Model listeners
		this.listenTo(bundles, {
			"select:one": function (bundle) {
				this.createChildren(bundle, false);
			},
			"deselect:one": function (bundle) {
				this.removeChildren(bundle, false);
			}
		});

		if (bundles.selected) {
			this.createChildren(bundles.selected, true);
		}
	},

	/** Create children on bundle select */
	createChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

//		this.createImageCaptionCarousel(bundle, images);
		this.createImageCaptionStack(bundle, images);
		this.carousel = this.createImageCarousel(bundle, images);
		// Show views
		if (!skipAnimation) {
			_.each(this.children, function(child) {
				child.$el.css({
					opacity: 0
				})
				.delay(Globals.TRANSITION_DELAY * 2)
				.transit({
					delay: 1,
//					delay: Globals.TRANSITION_DELAY * 2,
					opacity: 1
				}, Globals.TRANSITION_DURATION);
			});
		}
	},

	/* -------------------------------
	 * Remove
	 * ------------------------------- */

	/** @override */
//	remove: function () {
//		if (bundles.selected) {
//			this.removeChildren(bundles.selected, true);
//		}
//		this.hammer.destroy();
//		View.prototype.remove.apply(this, arguments);
//	},

	removeChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

		this.stopListening(images);
		_.each(this.children, function(child) {
			controller.stopListening(child);
			if (skipAnimation) {
				child.remove();
			} else {
				child.$el.css({
					position: "absolute",
					top: child.el.offsetTop,
					left: child.el.offsetLeft
				})
				.transit({
					opacity: 0,
					delay: 1 // delay 0.001s - helps tx sync on webkit
				}, Globals.TRANSITION_DURATION)
				.queue(function(next) {
					child.remove();
					next();
				});
			}
		});
		// clear child references
		this.children.length = 0;
	},

//	removeChildren: function (bundle, skipAnimation) {
//		var images = bundle.get("images");
//		var childEls = [];
//		this.stopListening(images);
//		_.each(this.children, function(child) {
//			controller.stopListening(child);
//			childEls.push(child.el);
//		});
//		if (skipAnimation) {
//			this._removeChildren();
//		} else {
//			Backbone.$(childEls).css({position: "absolute"})
//				.transit({opacity: 0}, Globals.TRANSITION_DURATION)
//				.promise().done(_.bind(this._removeChildren, this));
//		}
//	},
//
//	_removeChildren: function() {
//		_.each(this.children, function(child) {
//			child.remove();
//		});
//		this.$el.css("display", "none");
//		this.children.length = 0;
//	},

//	registerHammer: function() {
//		var keywordList = Backbone.$("#keyword-list");
//		if (keywordList) {
//			this.hammer.on("panstart panmove panend pancancel", this._onPan);
//		}
//	},
//
	_onPan: function(ev) {
		switch (ev.type) {
			case "panstart":
				break;
			case "panmove":
				break;
			case "panend":
				break;
			case "pancancel":
				break;

		}
	},

	/** @param {Object} ev */
	_onResize: function (ev) {
		this.carousel.render();
	},

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	getHammered: function() {
		if (!this._hammer) {
			this._hammer = this.createHammer();
		}
		return this._hammer;
//		return void 0;
	},

	createHammer: function() {
		var hammer, hammerPan, hammerTap;
		hammer = new Hammer.Manager(this.el);
		hammerPan = new Hammer.Pan({
			threshold: 15, direction: Hammer.DIRECTION_HORIZONTAL,
		});
		hammerTap = new Hammer.Tap({
			threshold: 10, interval: 50//, time: 200
		});
//		hammerTap.requireFailure(hammerPan);

//		hammerPan.recognizeWith(hammerTap);
//		hammer.add([hammerTap, hammerPan]);

		hammerTap.recognizeWith(hammerPan);
		hammer.add([hammerPan, hammerTap]);

		this.on("view:remove", hammer.destroy, hammer);
		return hammer;
	},

	createImageCarousel: function(bundle, images) {
		var attrs = bundle.get("attrs");
		var classname =  "image-carousel " + bundle.get("handle");
		if (attrs && attrs.hasOwnProperty("@classname")) {
			classname += " " + attrs["@classname"];
		}
		var emptyRenderer = CarouselEmptyRenderer.extend({
			model: bundle,
			template: bundleDescTemplate,
		});
		// Create carousel
		var view = new Carousel({
			className: classname,
			collection: images,
			renderer: ImageRenderer,
			emptyRenderer: emptyRenderer,
			direction: Carousel.DIRECTION_HORIZONTAL,
			hammer: this.getHammered(),
		});
		view.render().$el.appendTo(this.el);
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		return this.children[this.children.length] = view;
	},

	createImageCaptionCarousel: function(bundle, images) {
		// Create label-carousel
		var view = new Carousel({
			className: "label-carousel",
			collection: images,
			gap: Globals.HORIZONTAL_STEP,
			hammer: this.getHammered(),
		});
		view.render().$el.appendTo(this.el);
//		view.render().$el.prependTo(this.el);
//		controller.listenTo(view, {
//			"view:select:one": controller.selectImage,
//			"view:select:none": controller.deselectImage
//		});
		return this.children[this.children.length] = view;
	},

	createImageCaptionStack: function(bundle, images) {
		var view = new CollectionStack({
			collection: images,
			template: imageCaptionTemplate,
			className: "image-caption-stack"
		});
		view.render().$el.appendTo(this.el);
		return this.children[this.children.length] = view;
	},

	createImagePager: function(bundle, images) {
		var view = new SelectableListView({
			collection: images,
			renderer: DotNavigationRenderer,
			className: "image-pager dots-fontello mutable-faded"
		});
		view.render().$el.appendTo(this.el);
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		return this.children[this.children.length] = view;
	},

	createBundleCarousel: function(bundles) {
		var view = new BundleCarousel({
//			direction: Carousel.DIRECTION_HORIZONTAL,
			direction: Carousel.DIRECTION_VERTICAL,
			collection: bundles,
//			renderer: ImageRenderer,
//			emptyRenderer: CarouselEmptyRenderer.extend({
//				model: bundle,
//				template: bundleDescTemplate,
//			}),
		});
		view.render().$el.appendTo(this.el);
//		view.$el.appendTo(this.el);
//		view.render();

//		controller.listenTo(view, {
//			"view:select:one": controller.selectBundle,
//			"view:select:none": controller.deselectBundle
//		});
		return view;
	},

});

module.exports = ContentView;
