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
/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");
/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/CarouselEmptyRenderer} */
var CarouselEmptyRenderer = require("./render/CarouselEmptyRenderer");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");
/** @type {module:app/view/component/SelectableListView} */
//var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/render/DotNavigationRenderer} */
//var DotNavigationRenderer = require("./render/DotNavigationRenderer");

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
		return View.prototype.remove.apply(this, arguments);
	},

	/** @override */
	render: function (ev) {
		_.each(this.children, function(child) {
			child.render();
		}, this);
		return View.prototype.render.apply(this, arguments);
	},

	/* -------------------------------
	 * create/remove children on bundle selection
	 * ------------------------------- */

	/** Create children on bundle select */
	createChildren: function (bundle, skipAnimation) {
		var images = bundle.get("images");

//		this.children[this.children.length] = this.createImageCaptionCarousel(bundle, images);
		this.children[this.children.length] = this.createImageCaptionStack(bundle, images);
		this.children[this.children.length] = this.createImageCarousel(bundle, images);
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

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	/**
	 * image-carousel
	 */
	createImageCarousel: function(bundle, images) {
		// Create carousel
		var attrs = bundle.get("attrs");
		var classname = "image-carousel " + bundle.get("handle");
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
		return view;
	},

	/**
	 * image-caption-stack
	 */
	createImageCaptionStack: function(bundle, images) {
		var view = new CollectionStack({
			collection: images,
			template: imageCaptionTemplate,
			className: "image-caption-stack"
		});
		return view;
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
//		return view;
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

});

module.exports = ContentView;
