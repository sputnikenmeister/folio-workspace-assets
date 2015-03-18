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
/** @type {module:app/control/TouchManager} */
var TouchManager = require("../control/TouchManager");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/helper/View} */
var View = require("../helper/View");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");

/** @type {module:app/view/component/SelectableListView} */
//var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/render/DotNavigationRenderer} */
//var DotNavigationRenderer = require("./render/DotNavigationRenderer");

/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");
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
		this.children = [];

		_.bindAll(this, "_onResize");
		Backbone.$(window).on("orientationchange resize", this._onResize);

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

	/** @override */
	remove: function () {
		if (bundles.selected) {
			this.removeChildren(bundles.selected, true);
		}
		Backbone.$(window).off("orientationchange resize", this._onResize);
		View.prototype.remove.apply(this, arguments);
	},

	/** @param {Object} ev */
	_onResize: function (ev) {
		_.each(this.children, function(child) {
			child.render();
		}, this);
	},

	/* -------------------------------
	 * create/remove children on bundle selection
	 * ------------------------------- */

	/** Create children on bundle select */
	createChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

//		this.children[this.children.length] = this.createImageCaptionCarousel(bundle, images);
		this.createImageCaptionStack(bundle, images);
		this.createImageCarousel(bundle, images);
		// Show views
		_.each(this.children, function(view) {
			view.render().$el.appendTo(this.el);
			if (!skipAnimation) {
				view.$el.css({
					opacity: 0
				})
//				.delay(Globals.TRANSITION_DELAY * 2)
				.transit({
//					delay: 1,
					delay: Globals.TRANSITION_DELAY * 2 + 1,
					opacity: 1
				}, Globals.TRANSITION_DURATION);
			}
		}, this);
	},

	removeChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

		this.stopListening(images);
		_.each(this.children, function(view) {
			controller.stopListening(view);
			if (skipAnimation) {
				view.remove();
			} else {
				view.$el.css({
					position: "absolute",
					top: view.el.offsetTop,
					left: view.el.offsetLeft
				})
				.transit({
					opacity: 0,
					delay: 1 // delay 0.001s - helps tx sync on webkit
				}, Globals.TRANSITION_DURATION)
				.queue(function(next) {
					view.remove();
					next();
				});
			}
		}, this);
		// clear child references
		this.children.length = 0;
	},

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	/**
	 * image-carousel
	 */
	createImageCarousel: function(bundle, images) {
		// Create carousel
		var attrs = bundle.get("attrs");
		var classname =  "image-carousel " + bundle.get("handle");
		if (attrs && attrs.hasOwnProperty("@classname")) {
			classname += " " + attrs["@classname"];
		}
		var emptyRenderer = CarouselEmptyRenderer.extend({
			model: bundle,
			template: bundleDescTemplate,
		});
		var view = new Carousel({
			className: classname,
			collection: images,
			renderer: ImageRenderer,
			emptyRenderer: emptyRenderer,
			direction: Carousel.DIRECTION_HORIZONTAL,
			hammer: TouchManager.getInstance(),
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});

//		this.getHammered().get("swipe").requireFailure(view.hammer.get("touch"));
//		this.getHammered().get("pan").requireFailure(view.hammer.get("pan"));
//		view.hammer.get("pan").requireFailure(this.getHammered().get("pan"));
//		this.listenToOnce(view, "view:remove", this.onCarouselViewRemove);

//		view.render().$el.appendTo(this.el);
		return this.children[this.children.length] = view;
//		return view;
	},

//	onCarouselViewRemove: function(view) {
//		this.getHammered().get("swipe").dropRequireFailure(view.hammer.get("touch"));
//		this.getHammered().get("pan").dropRequireFailure(view.hammer.get("pan"));
//		view.hammer.get("pan").dropRequireFailure(this.getHammered().get("pan"));
//	},

	/**
	 * image-caption-stack
	 */
	createImageCaptionStack: function(bundle, images) {
		var view = new CollectionStack({
			collection: images,
			template: imageCaptionTemplate,
			className: "image-caption-stack"
		});
//		view.render().$el.appendTo(this.el);
		return this.children[this.children.length] = view;
//		return view;
	},

//	/**
//	 * image-pager
//	 */
//	createImagePager: function(bundle, images) {
//		var view = new SelectableListView({
//			collection: images,
//			renderer: DotNavigationRenderer,
//			className: "image-pager dots-fontello mutable-faded"
//		});
//		controller.listenTo(view, {
//			"view:select:one": controller.selectImage,
//			"view:select:none": controller.deselectImage
//		});
////		view.render().$el.appendTo(this.el);
//		return this.children[this.children.length] = view;
////		return view;
//	},

//	/**
//	 * label-carousel
//	 */
//	createImageCaptionCarousel: function(bundle, images) {
//		// Create label-carousel
//		var view = new Carousel({
//			className: "label-carousel",
//			collection: images,
//			gap: Globals.HORIZONTAL_STEP,
//			hammer: this.getHammered(),
//		});
////		//view.render().$el.prependTo(this.el);
////		controller.listenTo(view, {
////			"view:select:one": controller.selectImage,
////			"view:select:none": controller.deselectImage
////		});
////		view.render().$el.appendTo(this.el);
////		return this.children[this.children.length] = view;
//		return view;
//	},
//
//	/**
//	 * bundle-carousel
//	 */
//	createBundleCarousel: function(bundles) {
//		var view = new BundleCarousel({
////			direction: Carousel.DIRECTION_HORIZONTAL,
//			direction: Carousel.DIRECTION_VERTICAL,
//			collection: bundles,
////			renderer: ImageRenderer,
////			emptyRenderer: CarouselEmptyRenderer.extend({
////				model: bundle,
////				template: bundleDescTemplate,
////			}),
//		});
////		view.$el.appendTo(this.el);
////		view.render();
//
////		controller.listenTo(view, {
////			"view:select:one": controller.selectBundle,
////			"view:select:none": controller.deselectBundle
////		});
//		view.render().$el.appendTo(this.el);
//		return view;
//	},

//	getHammered: function() {
//		if (!this._hammer) {
////			this._hammer = new Hammer.Manager(this.el);
//			this._hammer = new Hammer.Manager(this._container);
//
////			var pan = new Hammer.Pan({threshold: 15, direction: Hammer.DIRECTION_HORIZONTAL});
////			var swipe = new Hammer.Swipe({threshold: 10, direction: Hammer.DIRECTION_VERTICAL});
////			var tap = new Hammer.Tap({threshold: 9, interval: 50, time: 200});
////			tap.recognizeWith(pan);
////			swipe.requireFailure(pan);
////			this._hammer.add([pan, swipe, tap]);
////			this._hammer.add([swipe]);
//
//			var pan = new Hammer.Pan({
//				threshold: 15,
////				event: "panleft",
////				direction: Hammer.DIRECTION_LEFT,
////				direction: Hammer.DIRECTION_RIGHT,
//				direction: Hammer.DIRECTION_VERTICAL,
////				direction: Hammer.DIRECTION_HORIZONTAL,
////				direction: Hammer.DIRECTION_ALL,
////				direction: Hammer.DIRECTION_LEFT | Hammer.DIRECTION_VERTICAL,
////				direction: Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_VERTICAL,
//				enable: _.bind(function(rec, ev) {
//					if (_.isUndefined(ev)) {
//						return true;
//					}
////					if (ev.isFinal) {
////						console.log("ContentView ev.isFinal");
////						return true;
////					}
//					if (bundles.selectedIndex != -1) {
////					if (ev.offsetDirection & Hammer.DIRECTION_UP) {
////						return true;
////					}
//						var images = bundles.selected.get("images");
//						if (images.selectedIndex == -1){// && (ev.offsetDirection & Hammer.DIRECTION_LEFT)) {
//							return true;
//						}
//					}
//					return false;
//				}, this)
//			});
//			this._hammer.add([pan]);
////			this._hammer.set({enable: function (rec) {
////				console.log("ContentView.hammer", rec);
////				return true;
////			}});
//
//			this.on("view:remove", this._hammer.destroy, this._hammer);
//		}
//		return this._hammer;
//	},

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

});

module.exports = ContentView;
