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
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("../model/collection/BundleCollection");

/** @type {module:app/view/base/View} */
var ContainerView = require("./base/ContainerView");
/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");
/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/CarouselEmptyRenderer} */
var CarouselEmptyRenderer = require("./render/CarouselEmptyRenderer");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");
/** @type {module:app/view/render/DotNavigationRenderer} */
//var DotNavigationRenderer = require("./render/DotNavigationRenderer");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageCaptionTemplate = require("./template/CollectionStack.Image.tpl");

var COLLAPSE_THRESHOLD = 100;

// var PAN_MOVE_FACTOR = 1;
// var PAN_OVERSHOOT_FACTOR = Globals.VMOVE_OUT_OF_BOUNDS_DRAG;
// // var PAN_OVERSHOOT_FACTOR = 0.2;
// /* move factor is applied on top, so demultiply */
// PAN_OVERSHOOT_FACTOR *= PAN_MOVE_FACTOR;

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = ContainerView.extend({

	/** @override */
	className: "expanded",

	initialize: function (options) {
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		this.children = [];
		this.transitionables = [];
		this.touch = TouchManager.getInstance();
		// this.transforms = new TransformHelper();

		// this._collapsedOffsetY = 300;

		// Model listeners
		// this.listenTo(bundles, {
		// 	"select:one": function (bundle) {
		// 		this.createChildren(bundle, false);
		// 	},
		// 	"deselect:one": function (bundle) {
		// 		this.removeChildren(bundle, false);
		// 	}
		// });
		this.listenTo(bundles, {
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			"deselect:one": this._onDeselectOne,
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
		this.transforms.releaseAll();
		return ContainerView.prototype.render.apply(this, arguments);
	},

	/* --------------------------- *
	 * Model event handlers
	 * --------------------------- */

	_onSelectOne: function(bundle) {
		this.setCollapsed(true);
		this.createChildren(bundle, false);
	},

	_onSelectNone: function() {
		this.touch.off("vpanstart", this._onVPanStart);
		// this.touch.off("vpanend", this._onVPanFinal);
		// this.touch.off("panstart", this._onPanStart);
	},

	_onDeselectOne: function(bundle) {
		this.removeChildren(bundle, false);
		this.setCollapsed(false);
	},

	_onDeselectNone: function() {
		this.setCollapsed(true);
		this.touch.on("vpanstart", this._onVPanStart);
		// this.touch.on("vpanend", this._onVPanFinal);
		// this.touch.on("panstart", this._onPanStart);
	},

	/* -------------------------------
	 * create/remove children on bundle selection
	 * ------------------------------- */

	/** Create children on bundle select */
	createChildren: function (bundle, skipAnimation) {
		//this.children.push(this.createImageCaptionCarousel(bundle, images));
		this.children.push(this.createImageCaptionStack(bundle));
		this.children.push(this.createImageCarousel(bundle));

		var startProps = {opacity: 0};
		var endProps = {delay: Globals.ENTERING_DELAY, opacity: 1};
		// Show views
		_.each(this.children, function(view) {
			this.transforms.add(view.el);
			this.transitionables.push(view.el);
			this.listenToOnce(view, "view:remove", this.onChildRemove);
			this.$el.append(view.el);
			view.render();
			// view.render().$el.appendTo(this.el);
			if (!skipAnimation) {
				view.$el.css(startProps).transit(endProps);
			}
		}, this);
	},

	removeChildren: function (bundle, skipAnimation) {
		var startProps = {position: "absolute"};
		var endProps = {delay: Globals.EXITING_DELAY, opacity: 0};
		// var txStyleName = this.getPrefixedStyle("transform");
		var txPropName = this.getPrefixedProperty("transform");

		_.each(this.children, function(view) {
			if (skipAnimation) {
				view.remove();
			} else {
				view.el.style[txPropName] = window.getComputedStyle(view.el)[txPropName];
				// startProps[txStyleName] = view.$el.css(txStyleName);
				// startProps["top"] = view.el.offsetTop;
				// startProps["left"] = view.el.offsetLeft;
				view.$el
					// .css(startProps)
					.addClass("removing")
					.transit(endProps)
					.queue(function(next) {
						view.remove(); next();
					});
			}
		}, this);
		// clear child references immediately
		this.children.length = 0;
	},

	onChildRemove: function(view) {
		this.transitionables.splice(this.transitionables.indexOf(view.el), 1);
		this.transforms.destroy(view.el);
	},

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
				this.$el.addClass("collapsed").removeClass("expanded");
			} else {
				this.$el.addClass("expanded").removeClass("collapsed");
			}
		}
	},

	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */

	// _onVPanMove1: function (ev) {
	// 	var delta = ev.thresholdDeltaY;
	// 	var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
	// 	// check if direction is aligned with collapse/expand
	// 	var isDirAllowed = this.isCollapsed()? (delta > 0) : (delta < 0);
	//
	// 	delta = Math.abs(delta); // remove sign
	//
	// 	if (isDirAllowed && delta > COLLAPSE_THRESHOLD) {
	// 		this.touch.off("vpanmove", this._onVPanMove);
	// 		this.touch.off("vpanend vpancancel", this._onVPanFinal);
	// 		this.setCollapsed(!this.isCollapsed());
	// 		_.each(this.children, function(view) {
	// 			this.enableTransitions(view.el);
	// 			this.transforms.clear(view.el);
	// 			// this.transforms.capture(view.el);
	// 		}, this);
	// 	} else {
	// 		if (!isDirAllowed) delta *= -PAN_OVERSHOOT_FACTOR; // delta is opposite
	// 		delta *= this.isCollapsed()? 1 : -1; // reapply sign
	// 		_.each(this.children, function(view) {
	// 			this.transforms.move(view.el, void 0, delta);
	// 		}, this);
	// 	}
	// },

	_onVPanStart: function (ev) {
		_.each(this.children, function(view) {
			this.disableTransitions(view.el);
			this.transforms.capture(view.el);
		}, this);
		this._onVPanMove(ev);

		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
	},

	PAN_MOVE_FACTOR: 0.05,
	PAN_OVERSHOOT_FACTOR: Globals.VMOVE_OUT_OF_BOUNDS_DRAG,
	_collapsedOffsetY: 300,

	_onVPanMove: function (ev) {
		var delta = ev.thresholdDeltaY;
		// check if direction is aligned with collapse/expand
		var isDirAllowed = this.isCollapsed()? (delta > 0) : (delta < 0);
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		var moveFactor = this.isCollapsed()? 1 - this.PAN_MOVE_FACTOR : this.PAN_MOVE_FACTOR;
		/* move factor is applied on top, so demultiply */
		var overshootFactor = this.PAN_OVERSHOOT_FACTOR;// * this.PAN_MOVE_FACTOR;

		delta = Math.abs(delta); // remove sign
		delta *= moveFactor;
		maxDelta *= moveFactor;

		if (isDirAllowed) {
			if (delta > maxDelta) { // overshooting
				delta = (delta - maxDelta) * overshootFactor + maxDelta;
			} else { // no overshooting
				delta = delta;
			}
		} else {
			delta = delta * -overshootFactor; // delta is opposite
		}
		delta *= this.isCollapsed()? 1 : -1; // reapply sign

		// this.transforms.moveAll(void 0, delta);
		_.each(this.children, function(view) {
			this.transforms.move(view.el, void 0, delta);
		}, this);
	},

	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);

		if (this.willCollapseChange(ev)) {
			// this.$transitionables.transit(this.transitions[this.isCollapsed()
			// 	Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING]);
			this.runTransformTransition(this.transitionables,
				this.isCollapsed()? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING);
			this.setCollapsed(!this.isCollapsed());
		} else {
			// this.$transitionables.transit(this.transitions[Globals.TRANSIT_IMMEDIATE]);
			this.runTransformTransition(this.transitionables, Globals.TRANSIT_IMMEDIATE);
		}
		// this.transforms.clearAll();
		_.each(this.children, function(view) {
			// this.enableTransitions(view);
			this.transforms.clear(view.el);
		}, this);
	},

	willCollapseChange: function(ev) {
		return ev.type == "vpanend"? this.isCollapsed()?
			ev.thresholdDeltaY > COLLAPSE_THRESHOLD : ev.thresholdDeltaY < -COLLAPSE_THRESHOLD : false;
	},

	// /* -------------------------------
	//  * transitions
	//  * ------------------------------- */
	//
	// enableTransitions: function(view) {
	// 	//this.$el.removeClass("skip-transitions");
	// 	view.$el.css(this.getPrefixedStyle("transition"), "");
	// },
	//
	// disableTransitions: function(view) {
	// 	//this.$el.addClass("skip-transitions");
	// 	view.$el.css(this.getPrefixedStyle("transition"), "none 0s 0s");
	// },

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	/**
	 * image-carousel
	 */
	createImageCarousel: function(bundle) {
		// Create carousel
		var images = bundle.get("images");
		var attrs = bundle.get("attrs");
		var classname = "image-carousel " + bundle.get("handle");
		if (attrs && ("@classname" in attrs)) {
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
		return view;
	},

	/**
	 * image-caption-stack
	 */
	createImageCaptionStack: function(bundle) {
		var images = bundle.get("images");
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
//		var view = new SelectableCollectionView({
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
