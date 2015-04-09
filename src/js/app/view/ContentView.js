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

/** @type {module:app/view/base/View} */
var View = require("./base/View");
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

/** @type {module:app/helper/TransformHelper} */
var TransformHelper = require("../helper/TransformHelper");
/** @type {module:app/utils/event/addTransitionEndCommand} */
var addTransitionCallback = require("../utils/event/addTransitionCallback");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageCaptionTemplate = require("./template/CollectionStack.Image.tpl");

var COLLAPSE_THRESHOLD = 100;
var PAN_OVERSHOOT_FACTOR = 0.05;
//var PAN_MOVE_FACTOR = 0.75;
//// move factor is applied on top, so demultiply
//PAN_OVERSHOOT_FACTOR /= PAN_MOVE_FACTOR;

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = View.extend({

	initialize: function (options) {
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		this.children = [];
		this.touch = TouchManager.getInstance();
		this.transforms = new TransformHelper();

		this._collapsedOffsetY = 300;

		// Model listeners
//		this.listenTo(bundles, {
//			"select:one": function (bundle) {
//				this.createChildren(bundle, false);
//			},
//			"deselect:one": function (bundle) {
//				this.removeChildren(bundle, false);
//			}
//		});
		this.listenTo(bundles, {
			"select:one": this._onSelectOne,
			"deselect:one": this._onDeselectOne,
			"select:none": this._onSelectNone,
			"deselect:none": this._onDeselectNone,
		});

		if (bundles.selected) {
			this.touch.on("vpanstart", this._onVPanStart);
			this.createChildren(bundles.selected, true);
			this.setCollapsed(true);
		} else {
			this.setCollapsed(false);
		}
	},

	// this view is, as of now, never removed, so this method is never called
	/** @override */
	/*remove: function () {
		if (bundles.selected) {
			this.removeChildren(bundles.selected, true);
		}
		return View.prototype.remove.apply(this, arguments);
	},*/

	/** @override */
	render: function (ev) {
		_.each(this.children, function(child) {
			child.render();
		}, this);
		return View.prototype.render.apply(this, arguments);
	},

	/* -------------------------------
	 * model events
	 * ------------------------------- */

	_onSelectOne: function(bundle) {
		this.setCollapsed(true);
		this.createChildren(bundle, false);
	},

	_onSelectNone: function() {
		this.setCollapsed(false);
		this.touch.off("vpanstart", this._onVPanStart);
//		this.touch.off("vpanend", this._onVPanFinal);
//		this.touch.off("panstart", this._onPanStart);
	},

	_onDeselectOne: function(bundle) {
		this.removeChildren(bundle, false);
	},

	_onDeselectNone: function() {
//		this.setCollapsed(true);
		this.touch.on("vpanstart", this._onVPanStart);
//		this.touch.on("vpanend", this._onVPanFinal);
//		this.touch.on("panstart", this._onPanStart);
	},

	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */

	_onVPanStart: function (ev) {
		//this.disableTransitions(this);
		//this.transforms.capture(this.el);
		_.each(this.children, function(view) {
			this.disableTransitions(view);
			this.transforms.capture(view.el);
		}, this);
		this._onVPanMove(ev);

		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
	},

	_onVPanMove: function (ev) {
		var delta = ev.deltaY;
		var maxDelta = this._collapsedOffsetY;

		delta += ev.thresholdOffsetY;
		maxDelta += Math.abs(ev.thresholdOffsetY);

		// check if direction is aligned with collapse/expand
		var isDirAllowed = this.isCollapsed()? (delta > 0) : (delta < 0);

		delta = Math.abs(delta); // remove sign

		if (isDirAllowed && delta > COLLAPSE_THRESHOLD) {
			this.touch.off("vpanmove", this._onVPanMove);
			this.touch.off("vpanend vpancancel", this._onVPanFinal);

			_.each(this.children, function(view) {
				this.enableTransitions(view);
				this.transforms.clear(view.el);
			}, this);
			this.setCollapsed(!this.isCollapsed());
			return;
		}

		if (isDirAllowed) {
			if (delta > maxDelta) {				// overshooting
				delta = (delta - maxDelta) * PAN_OVERSHOOT_FACTOR + maxDelta;
			} else { 							// no overshooting
				delta = delta;
			}
		} else {
			delta = delta * -PAN_OVERSHOOT_FACTOR; // delta is opposite
		}
		delta *= this.isCollapsed()? 1 : -1; // reapply sign

		_.each(this.children, function(view) {
			this.transforms.move(view.el, void 0, delta);
		}, this);
	},

	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);

		_.each(this.children, function(view) {
			this.enableTransitions(view);
			this.transforms.clear(view.el);
		}, this);
		(ev.type === "vpanend") && this._onVPanEnd(ev);
	},

	_onVPanEnd: function (ev) {
		var delta = ev.deltaY + ev.thresholdOffsetY;
		if (this.isCollapsed()) {
			if (delta > COLLAPSE_THRESHOLD) {
				this.setCollapsed(false);
			}
		} else {
			if (delta < -COLLAPSE_THRESHOLD) {
				this.setCollapsed(true);
			}
		}
	},

//	_onVPanEnd: function (ev) {
//		//if (ev.distance > this._collapseThreshold &&
//		//	(ev.offsetDirection & (this._collapsed? Hammer.DIRECTION_UP: Hammer.DIRECTION_DOWN)))
//		if (this._collapsed) {
//			if (ev.deltaY < -this._collapseThreshold) {
//				this._collapsed = false;
//				this.$el.removeClass("collapsed");
//			}
//		} else {
//			if (ev.deltaY > this._collapseThreshold) {
//				this._collapsed = true;
//				this.$el.addClass("collapsed");
//			}
//		}
//	},

	/* -------------------------------
	 * collapse
	 * ------------------------------- */

	_collapsed: false,

	isCollapsed: function() {
		return this._collapsed;
	},

	setCollapsed: function(collapsed) {
		if (this._collapsed !== collapsed) {
			this._collapsed = collapsed;
			if (collapsed) {
				this.$el.removeClass("not-collapsed");
			} else {
				this.$el.addClass("not-collapsed");
			}
		}
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	enableTransitions: function(view) {
		view.$el.css({"transition": "", "-webkit-transition": ""});
//		view.$el.clearQueue().transit({transform: ""});

//		view.$el.css({"transition": "transform 0.5s", "-webkit-transition": "-webkit-transform 0.5s"});
//		addTransitionCallback("transform", function() {
//			view.$el.css({"transition": "", "-webkit-transition": ""});
//		}, el, this);

//		this.$el.removeClass("skip-transitions");
	},

	disableTransitions: function(view) {
		view.$el.css({"transition": "none 0s 0s", "-webkit-transition": "none 0s 0s"});
//		view.$el.clearQueue().css({"transition": "none 0s 0s"});
//		view.$el.clearQueue().css({"transition": "", "-webkit-transition": "", "transform": "", "-webkit-transform": ""});

//		this.transforms._getTransform(el).$el.css({transition: "none 0s 0s"});
//		this.$el.addClass("skip-transitions");
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
				view.$el.css({opacity: 0})
//				.delay(Globals.TRANSITION_DELAY * 2).transit({delay: 1, opacity: 1})
				.transit({delay: Globals.TRANSITION_DELAY * 2 + 1, opacity: 1});
			}
		}, this);
	},

	removeChildren: function (bundle, skipAnimation) {
		_.each(this.children, function(view) {
			if (skipAnimation) {
				view.remove();
			} else {
				view.$el
//				.css({ position: "absolute", top: view.el.offsetTop, left: view.el.offsetLeft })
				.transit({transform: view.$el.css(this.getPrefixedCSS("transform")), opacity: 0, delay: 1})
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
			hammer: this.touch,
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage,
			"view:remove": controller.stopListening
		});
		this.listenToOnce(view, "view:remove", this.onViewRemove);
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
		this.listenToOnce(view, "view:remove", this.onViewRemove);
		return view;
	},

	onViewRemove: function(view) {
		this.transforms.destroy(view.el);
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
//		var view = new Carousel({
//			className: "label-carousel",
//			collection: images,
//			hammer: this.touch,
//		});
////		controller.listenTo(view, {
////			"view:select:one": controller.selectImage,
////			"view:select:none": controller.deselectImage
////		});
//		return view;
//	},

});

module.exports = ContentView;
