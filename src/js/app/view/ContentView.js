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

/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
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
//		_.bindAll(this, "_onPan");

		this.children = [];
		this.hammer = this.createHammer(this.el);

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
		} else {
//			this.$el.css("display", "none");
		}
	},

	/** @override */
	remove: function () {
		if (bundles.selected) {
			this.removeChildren(bundles.selected, true);
		}
		this.hammer.destroy();
		this.$el.remove(this.container);
		View.prototype.remove.apply(this, arguments);
	},

	/* -------------------------------
	 * Create children on bundle select
	 * ------------------------------- */

	createChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

		this.createImageCaptionStack(images);
//		this.createImageCaptionCarousel(images);
		this.createImageCarousel(images, bundle);
//		this.$el.css("display", "");
		// Show views
		if (!skipAnimation) {
			_.each(this.children, function(child) {
				child.$el.css({opacity: 0})
//					.delay(Globals.TRANSITION_DELAY * 2)
					.transit({opacity: 1, delay: Globals.TRANSITION_DELAY * 2}, Globals.TRANSITION_DURATION);
			});
		}
	},

	/* -------------------------------
	 * Remove children
	 * ------------------------------- */

	removeChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

		this.stopListening(images);
		_.each(this.children, function(child) {
			controller.stopListening(child);
			if (skipAnimation) {
				child.remove();
			} else {
				child.$el.css({position: "absolute", top: child.el.offsetTop, left: child.el.offsetLeft})
					.transit({opacity: 0, delay: 1}, Globals.TRANSITION_DURATION) // delay 0.001s - helps tx sync on webkit
					.queue(function(next) {
						child.remove();
						next();
					});
			}
		});
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
//	_onPan: function(ev) {
//		switch (ev.type) {
//			case "panstart":
//				break;
//			case "panmove":
//				break;
//			case "panend":
//				break;
//			case "pancancel":
//				break;
//
//		}
//	},

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	createHammer: function(touchEl) {
		var hammer, hammerPan, hammerTap;
		hammer = new Hammer.Manager(touchEl);
		hammerPan = new Hammer.Pan({
			direction: Hammer.DIRECTION_HORIZONTAL,
			threshold: 15,
		});
		hammerTap = new Hammer.Tap({
			threshold: 10,
			interval: 50,
//			time: 200
		});
		hammerTap.requireFailure(hammerPan);
		hammer.add([hammerPan, hammerTap]);
		return hammer;
	},

	createContainer: function(){
		var container = document.createElement("div");
		container.id = "content-wrapper";
		this.$el.append(container);
		return container;
	},

	createImageCarousel: function(images, bundle) {
		// Create carousel
		view = new Carousel({
			className: "image-carousel " + bundle.get("handle"),
			collection: images,
			renderer: ImageRenderer,
			emptyRenderer: CarouselEmptyRenderer.extend({
				model: bundle,
				template: bundleDescTemplate,
			}),
			hammer: (this.hammer || void 0),
		});
		view.render().$el.appendTo(this.el);
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		return this.children[this.children.length] = view;
	},

	createImageCaptionCarousel: function(images) {
		// Create label-carousel
		view = new Carousel({
			className: "label-carousel",
			collection: images,
			gap: Globals.HORIZONTAL_STEP,
//			hammer: this.hammer,
		});
		view.render().$el.appendTo(this.el);
//		view.render().$el.prependTo(this.el);
//		controller.listenTo(view, {
//			"view:select:one": controller.selectImage,
//			"view:select:none": controller.deselectImage
//		});
		return this.children[this.children.length] = view;
	},

	createImageCaptionStack: function(images) {
		var view = new CollectionStack({
			collection: images,
			template: imageCaptionTemplate,
			className: "image-caption-stack"
		});
		view.render().$el.appendTo(this.el);
		return this.children[this.children.length] = view;
	},

	createBundleCarousel: function(images) {
		var view = new Carousel({
			className: "bundle-carousel",
			direction: Carousel.DIRECTION_VERTICAL,
			collection: bundles,
//			renderer: ImageRenderer,
//			emptyRenderer: CarouselEmptyRenderer.extend({
//				model: bundle,
//				template: bundleDescTemplate,
//			}),
		});
//		view.render().$el.appendTo(this.container);
		view.$el.appendTo(this.el);
		view.render();
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
		return this.children[this.children.length] = view;
	},

	createImagePager: function(images) {
		var view = new SelectableListView({
			collection: images,
			renderer: DotNavigationRenderer,
			className: "images-pager dots-fontello mutable-faded"
		});
		view.render().$el.appendTo(this.container);
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		return this.children[this.children.length] = view;
	},

});

module.exports = ContentView;
