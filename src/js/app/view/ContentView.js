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
/** @type {module:app/view/render/CarouselEmptyRenderer} */
var CarouselEmptyRenderer = require("./render/CarouselEmptyRenderer");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageDescTemplate = require("./template/CollectionStack.Image.tpl");

/** @type {module:app/control/Controller} */
var HORIZONTAL_STEP = require("../control/Globals").HORIZONTAL_STEP;

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = View.extend({

	initialize: function (options) {
		this.children = [];

		// Element: content-detail (layout container)
		this.container = document.createElement("div");
		this.container.id = "content-detail";
		this.$el.append(this.container);

//		this.hammer = new Hammer.Manager(this.container);
//		this.hammer.add(new Hammer.Pan({
//			direction: { direction: Hammer.DIRECTION_HORIZONTAL },
//			threshold: 30,
//		}));
//		this.hammer.on("panstart panmove panend pancancel", function(ev) {
//			console.log(ev.type, ev);
//		});

//		// Create carousel2
//		var view = new Carousel({
//			className: "bundle-carousel",
//			direction: Carousel.DIRECTION_VERTICAL,
//			collection: bundles,
////			renderer: ImageRenderer,
////			emptyRenderer: CarouselEmptyRenderer.extend({
////				model: bundle,
////				template: bundleDescTemplate,
////			}),
//		});
//		view.$el.appendTo(this.el);
//		view.render();
//		controller.listenTo(view, {
//			"view:select:one": controller.selectBundle,
//			"view:select:none": controller.deselectBundle
//		});
//		this.bundleCarousel = view;

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
		this.$el.remove(this.container);
		View.prototype.remove.apply(this, arguments);
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
				child.$el.css({position: "absolute"})
					.transit({opacity: 0}, Globals.TRANSITION_DURATION)
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
//
//		this.stopListening(images);
//		_.each(this.children, function(child) {
//			controller.stopListening(child);
//			childEls.push(child.el);
//		});
//
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

	/* -------------------------------
	 * Create children on bundle select
	 * ------------------------------- */

	createChildren: function (bundle, skipAnimation) {
		var view, images = bundle.get("images");

		// Create carousel2
		view = new Carousel({
			className: "label-carousel",
			collection: images,
			gap: Globals.HORIZONTAL_STEP,
//			renderer: ImageRenderer,
//			emptyRenderer: CarouselEmptyRenderer.extend({
//				model: bundle,
//				template: bundleDescTemplate,
//			}),
//			hammer: this.hammer,
		});
		view.render().$el.appendTo(this.el);
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		this.children[this.children.length] = view;

		// Create carousel
		view = new Carousel({
			className: bundle.get("handle") + " image-carousel",
			collection: images,
			renderer: ImageRenderer,
			emptyRenderer: CarouselEmptyRenderer.extend({
				model: bundle,
				template: bundleDescTemplate,
			}),
//			hammer: this.hammer,
		});
		view.render().$el.appendTo(this.el);
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		this.children[this.children.length] = view;

//		this.$el.css("display", "");
		// Show views
		if (!skipAnimation) {
			_.each(this.children, function(child) {
				child.$el.css({opacity: 0})
					.delay(Globals.TRANSITION_DELAY * 2.5)
					.transit({opacity: 1}, Globals.TRANSITION_DURATION);
			});
		}
	},

//	createImagePager: function() {
//		var view = new SelectableListView({
//			collection: images,
//			renderer: DotNavigationRenderer,
//			className: "images-pager dots-fontello mutable-faded"
//		});
//		view.render().$el.appendTo(this.container);
//		controller.listenTo(view, {
//			"view:select:one": controller.selectImage,
//			"view:select:none": controller.deselectImage
//		});
//		return this.children[this.children.length] = view;
//	},

//	createImageDetail: function() {
//		var view = new CollectionStack({
//			collection: images,
//			template: imageDescTemplate,
//			className: "image-detail aside"
//		});
//		view.render().$el.appendTo(this.container);
//		return this.children[this.children.length] = view;
//	},

});

module.exports = ContentView;
