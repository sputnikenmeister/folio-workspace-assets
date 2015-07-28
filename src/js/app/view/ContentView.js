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
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("../model/collection/BundleCollection");

/** @type {module:app/view/base/View} */
var ContainerView = require("./base/ContainerView");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");
/** @type {module:app/view/render/DotNavigationRenderer} */
//var DotNavigationRenderer = require("./render/DotNavigationRenderer");
/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var mediaCaptionTemplate = require("./template/CollectionStack.Media.tpl");

/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");
/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/SequenceRenderer} */
var SequenceRenderer = require("./render/SequenceRenderer");
/** @type {module:app/view/render/VideoRenderer} */
var VideoRenderer = require("./render/VideoRenderer");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = ContainerView.extend({

	/** @override */
	className: "content",

	initialize: function (options) {
		ContainerView.prototype.initialize.apply(this, arguments);

		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		this.children = [];
		this.childrenEls = [];

		this.bundleListeners = {
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			"deselect:one": this._onDeselectOne,
			"deselect:none": this._onDeselectNone,
		};
		this.mediaListeners = {
			"select:one": this._onSelectMedia,
			"select:none": this._onSelectMedia,
			"deselect:one": this._onDeselectMedia,
			"deselect:none": this._onDeselectMedia,
		};
		this.listenTo(bundles, this.bundleListeners);

		// if (bundles.selected) {
		// 	this.touch.on("vpanstart", this._onVPanStart);
		// 	this.createChildren(bundles.selected, true);
		// 	this.setCollapsed(true);
		// } else {
		// 	this.setCollapsed(false);
		// }
	},

	/** @override */
	render: function () {
		// this.transforms.clearAllCaptures();
		this.transforms.stopAllTransitions();
		// this.transforms.clearAllTransitions();
		this.transforms.validate();

		_.each(this.children, function(view) {
			// this.transforms.clearCapture(view.el);
			// this.transforms.clearTransitions(view.el);
			view.skipTransitions = true;
			view.render();
		}, this);
		return ContainerView.prototype.render.apply(this, arguments);
	},
	
	/* -------------------------------
	 * collapse
	 * ------------------------------- */
	
	_onCollapseChange: function(collapsed) {
		_.each(this.children, function(view) {
			view.setEnabled(collapsed);
		});
	},
	
	/* --------------------------- *
	 * Deselect event handlers
	 * --------------------------- */
	
	_onDeselectOne: function(bundle) {
		this.removeChildren(bundle, false);
		this.stopListening(bundle.get("media"), this.mediaListeners);
	},
	
	_onDeselectNone: function() {
		this.touch.on("vpanstart", this._onVPanStart);
		// this.touch.on("vpanend", this._onVPanFinal);
		// this.touch.on("panstart", this._onPanStart);
	},
	
	_onDeselectMedia: function(media) {
		if (!this.isCollapsed()) {
			this.transforms.clearAllOffsets();
			this.transforms.runTransition(Globals.TRANSIT_ENTERING, this.childrenEls);
			this.transforms.validate();
		}
	},
	
	/* --------------------------- *
	 * Select event handlers
	 * --------------------------- */
	
	_onSelectOne: function(bundle) {
		this.createChildren(bundle, false);
		this.listenTo(bundle.get("media"), this.mediaListeners);
		this.setCollapsed(true);
	},
	
	_onSelectNone: function() {
		this.touch.off("vpanstart", this._onVPanStart);
		this.setCollapsed(false);
	},
	
	_onSelectMedia: function(media) {
		this.setCollapsed(true);
	},
	
	/* -------------------------------
	 * create/remove children on bundle selection
	 * ------------------------------- */

	/** Create children on bundle select */
	createChildren: function (bundle, skipAnimation) {
		//this.children.push(this.createMediaCaptionCarousel(bundle, media));
		this.children.push(this.createMediaCaptionStack(bundle));
		this.children.push(this.createMediaCarousel(bundle));

		var startProps = {opacity: 0};
		var endProps = {delay: Globals.ENTERING_DELAY, opacity: 1};
		// Show views
		_.each(this.children, function(view) {
			// this.transforms.add(view.el);
			this.childrenEls.push(view.el);
			this.listenToOnce(view, "view:remove", this.onChildRemove);
			this.$el.append(view.el);
			view.render();
			// view.render().$el.appendTo(this.el);
			if (!skipAnimation) {
				view.$el.css(startProps).transit(endProps);
			}
		}, this);
		this.transforms.add(this.childrenEls);
	},

	removeChildren: function (bundle, skipAnimation) {
		// var startProps = {position: "absolute"};
		var endProps = {delay: Globals.EXITING_DELAY, opacity: 0};
		var txPropName = this.getPrefixedProperty("transform");
		
		this.transforms.remove(this.childrenEls);
		_.each(this.children, function(view, index, children) {
			if (skipAnimation) {
				view.remove();
			} else {
				// startProps[txStyleName] = view.$el.css(txStyleName);
				// startProps["top"] = view.el.offsetTop;
				// startProps["left"] = view.el.offsetLeft;
				view.el.style[txPropName] = window.getComputedStyle(view.el)[txPropName];
				view.$el
					// .css(startProps)
					.addClass("removing")
					.transit(endProps)
					.queue(function(next) {
						view.remove(); next();
					});
			}
			// this.childrenEls.splice(this.childrenEls.indexOf(view.el), 1);
			// this.transforms.remove(view.el);
			// children[index] = void 0;
		}, this);
		// clear child references immediately
		this.childrenEls.length = 0;
		this.children.length = 0;
	},

	onChildRemove: function(view) {
		// this.childrenEls.splice(this.childrenEls.indexOf(view.el), 1);
		// this.transforms.remove(view.el);
	},

	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */

	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
		// _.each(this.children, function(view) {
		// 	this.transforms.disableTransitions(view.el);
		// 	this.transforms.clearCapture(view.el);
		// 	// this.transforms.capture(view.el);
		// }, this);
		this.transforms.stopTransitions(this.childrenEls);
		this.transforms.clearCapture(this.childrenEls);
		this._onVPanMove(ev);
	},

	PAN_MOVE_FACTOR: 0.05,
	_collapsedOffsetY: 300,

	_onVPanMove: function (ev) {
		var delta = ev.thresholdDeltaY;
		var isDirAllowed = this.isCollapsed()? (delta > 0) : (delta < 0);
		// check if direction is aligned with collapse/expand
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		var moveFactor = this.isCollapsed()? 1 - this.PAN_MOVE_FACTOR : this.PAN_MOVE_FACTOR;

		delta = Math.abs(delta); // remove sign
		delta *= moveFactor;
		maxDelta *= moveFactor;

		if (isDirAllowed) {
			if (delta > maxDelta) { // overshooting
				delta = ((delta - maxDelta) * Globals.V_PANOUT_DRAG) + maxDelta;
			} else { // no overshooting
				delta = delta;
			}
		} else {
			delta = delta * -Globals.V_PANOUT_DRAG; // delta is opposite
		}
		delta *= this.isCollapsed()? 1 : -1; // reapply sign

		// this.transforms.offsetAll(void 0, delta);
		// _.each(this.children, function(view) {
		// 	this.transforms.offset(0, delta, view.el);
		// }, this);
		this.transforms.offset(0, delta, this.childrenEls);
		this.transforms.validate();
	},

	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.clearAllOffsets();
		if (this.willCollapseChange(ev)) {
			this.transforms.runTransition(
				this.isCollapsed()? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
				this.childrenEls);
			this.transforms.validate();
			this.setCollapsed(!this.isCollapsed());
		} else {
			this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE, this.childrenEls);
			this.transforms.validate();
		}
	},

	willCollapseChange: function(ev) {
		return ev.type == "vpanend"? this.isCollapsed()?
			ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
			ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
			false;
	},

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	/**
	 * media-carousel
	 */
	createMediaCarousel: function(bundle) {
		// Create carousel
		var media = bundle.get("media");
		// TODO: must match className set in Controller.js ('bundle-%bundle.id%')
		var classname = "media-carousel bundle-" + bundle.id; 
		if (bundle.attrs().hasOwnProperty("@classname")) {
			classname += " " + bundle.attrs()["@classname"];
		}
		var emptyRenderer = Carousel.defaultRenderer.extend({
			className: "carousel-item empty-item",
			model: bundle,
			template: bundleDescTemplate,
		});
		var rendererFunction = function(item, index, arr) {
			if (index == -1) {
				return emptyRenderer;
			}
			// var rendererKey = item.has("attrs") && item.get("attrs")["@renderer"];
			switch (item.attrs()["@renderer"]) {
				case "video": return VideoRenderer;
				case "sequence": return SequenceRenderer;
				case "image": return ImageRenderer;
				default: return ImageRenderer;
			}
		};
		var view = new Carousel({
			className: classname,
			collection: media,
			rendererFunction: rendererFunction,
			// renderer: ImageRenderer,
			emptyRenderer: emptyRenderer,
			direction: Carousel.DIRECTION_HORIZONTAL,
			hammer: this.touch,
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectMedia,
			"view:select:none": controller.deselectMedia,
			"view:remove": controller.stopListening
		});
		// controller.listenToOnce("view:remove", controller.stopListening);
		return view;
	},

	/**
	 * media-caption-stack
	 */
	createMediaCaptionStack: function(bundle) {
		var media = bundle.get("media");
		var view = new CollectionStack({
			collection: media,
			template: mediaCaptionTemplate,
			className: "media-caption-stack"
		});
		return view;
	},

//	/**
//	 * media-pager
//	 */
//	createMediaPager: function(bundle, media) {
//		var view = new SelectableCollectionView({
//			collection: media,
//			renderer: DotNavigationRenderer,
//			className: "media-pager dots-fontello mutable-faded"
//		});
//		controller.listenTo(view, {
//			"view:select:one": controller.selectMedia,
//			"view:select:none": controller.deselectMedia,
//			"view:remove": controller.stopListening
//		});
//		return view;
//	},

//	/**
//	 * label-carousel
//	 */
//	createMediaCaptionCarousel: function(bundle, media) {
//		var view = new Carousel({
//			className: "label-carousel",
//			collection: media,
//			hammer: this.touch,
//		});
////		controller.listenTo(view, {
////			"view:select:one": controller.selectMedia,
////			"view:select:none": controller.deselectMedia
////		});
//		return view;
//	},

});

module.exports = ContentView;
