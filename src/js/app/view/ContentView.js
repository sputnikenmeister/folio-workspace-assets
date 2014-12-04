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

/** @type {module:app/view/Carousel} */
var Carousel = require("./Carousel");
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
var ContentView = Backbone.View.extend({

	/** Setup listening to model changes */
	initialize: function (options) {
//		this.hammer = new Hammer.Manager(this.el);
//		this.hammer.add(new Hammer.Swipe({
//			direction: Hammer.DIRECTION_VERTICAL,
//			threshold: 10,
//		}));
//		this.hammer.on("swipeup", function() {
//			bundles.selected && controller.selectBundle(bundles.followingOrFirst());
//		});
//		this.hammer.on("swipedown", function() {
//			bundles.selected && controller.selectBundle(bundles.precedingOrLast());
//		});

		this.listenTo(Backbone, {
			"app:bundle:item": this.createChildren,
			"app:bundle:list": this.removeChildren
		});
	},

	render: function () {
		return this;
	},

	/* -------------------------------
	 * Bundle Components
	 * ------------------------------- */

	createChildren: function () {
		// content-detail (layout container)
		this.container = document.createElement("div");
		this.container.id = "content-detail";

		// selected bundle description
		this.bundleDetail = new CollectionStack({
			id: "bundle-detail",
			collection: bundles,
			model: bundles.selected,
			template: bundleDescTemplate,
		});
		this.container.appendChild(this.bundleDetail.render().el);
		this.el.appendChild(this.container);
		this.createImageChildren(bundles.selected);
		this.listenTo(bundles, "select:one", this.updateChildren);
	},

	updateChildren: function () {
		this.removeImageChildren();
		this.createImageChildren();
	},

	removeChildren: function () {
		this.stopListening(bundles);
		this.removeImageChildren();
		this.bundleDetail.remove();
		this.$el.empty(); // removes div#content-detail
	},

	/** @override */
	remove: function () {
		this.removeChildren();
		Backbone.View.prototype.remove.apply(this, arguments);
	},

	/* -------------------------------
	 * bundle/images Components
	 * ------------------------------- */

	createImageChildren: function () {
		var bundle = bundles.selected;
		// dot nav
		this.imagePager = new SelectableListView({
//			id: "images-pager-" + bundle.get("handle"),
			collection: bundle.get("images"),
			renderer: DotNavigationRenderer
		});
		this.imagePager.$el.addClass("images-pager mutable-faded");
		controller.listenTo(this.imagePager, "view:select:one", controller.selectImage);
		this.container.appendChild(this.imagePager.render().el);

		// carousel
		this.imageCarousel = new Carousel({
//			id: "carousel-" + bundle.get("handle"),
			collection: bundle.get("images"),
			renderer: ImageRenderer
		});
//		this.hammer.get("swipe").requireFailure(this.imageCarousel.hammer.get("pan"));
//		this.imageCarousel.hammer.get("pan").requireFailure(this.hammer.get("swipe"));
		controller.listenTo(this.imageCarousel, "view:select:one", controller.selectImage);
		this.el.appendChild(this.imageCarousel.render().el);

//		this.imageCarousel.render().$el
//					.css({opacity:0})
////					.css({transform: "translateY(100%)"})
//					.delay(550)
//					.appendTo(this.$el)
//					.transit({opacity:1}, 300);
////					.transit({transform: "translateY(0)"}, 300);
	},

	removeImageChildren: function () {
		controller.stopListening(this.imagePager);
		this.imagePager.remove();
		this.imagePager = void 0;

//		this.hammer.get("swipe").dropRequireFailure(this.imageCarousel.hammer.get("pan"));
//		this.imageCarousel.hammer.get("pan").dropRequireFailure(this.hammer.get("swipe"));
		controller.stopListening(this.imageCarousel);
		this.imageCarousel.remove();
		this.imageCarousel = void 0;

//		carousel.$el
//			.delay(300)
//			.css({opacity: 1})
//			.transit({opacity: 0}, 150)
//			.promise()
//			.done(function() {
//				carousel.remove();
//			});
	},

});

module.exports = ContentView;
