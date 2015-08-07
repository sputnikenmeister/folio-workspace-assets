/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");

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
var bundleDescTemplate = require("./template/CollectionStack.Bundle.hbs");
/** @type {Function} */
var mediaCaptionTemplate = require("./template/CollectionStack.Media.hbs");

/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");
/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/SequenceRenderer} */
var SequenceRenderer = require("./render/SequenceRenderer");
/** @type {module:app/view/render/VideoRenderer} */
var VideoRenderer = require("./render/VideoRenderer");

/** @type {Function} */
var transitionEnd = require("../../utils/event/transitionEnd");


/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = ContainerView.extend({

	// /** @override */
	// className: ContainerView.prototype.className + " content",
	
	// events: {
	// 	"transitionend .carousel": function(ev) {
	// 		console.log("ContentView.events.transitionend:carousel", ev.target.className, ev.propertyName);
	// 	},
	// 	"transitionend": function(ev) {
	// 		console.log("ContentView.events.transitionend", ev.target.className, ev.propertyName);
	// 	},
	// },
	
	initialize: function (options) {
		ContainerView.prototype.initialize.apply(this, arguments);
		
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		this._currentChildren = [];
		this._previousChildren = [];
		
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
		
		// _.bindAll(this, "_onTransitionEnd");
		// this.el.addEventListener(transitionEnd, this._onTransitionEnd, false);
		// this.listenTo(this, "view:remove", function() {
		// 	this.el.removeEventListener(transitionEnd, this._onTransitionEnd, false);
		// });
		
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
		// this.transforms.clearAllTransitions();
		this.transforms.stopAllTransitions();
		this.transforms.validate();
		this._currentChildren.forEach(function(view) {
			view.skipTransitions = true;
			view.render();
		}, this);
		return ContainerView.prototype.render.apply(this, arguments);
	},
	
	/* -------------------------------
	 * collapse
	 * ------------------------------- */
	
	_onCollapseChange: function(collapsed) {
		this._currentChildren.forEach(function(view) {
			view.setEnabled(collapsed);
		});
	},
	
	/* --------------------------- *
	 * bundle model handlers
	 * --------------------------- */
	
	_onDeselectOne: function(bundle) {
		this.stopListening(bundle.get("media"), this.mediaListeners);
		this.purgeChildren();
		this.removeChildren(bundle);
	},
	
	_onDeselectNone: function() {
		this.touch.on("vpanstart", this._onVPanStart);
	},
	
	_onSelectOne: function(bundle) {
		this.listenTo(bundle.get("media"), this.mediaListeners);
		this.createChildren(bundle);
		this.setCollapsed(true);
		
	},
	
	_onSelectNone: function() {
		this.touch.off("vpanstart", this._onVPanStart);
		this.setCollapsed(false);
	},
	
	/* --------------------------- *
	 * media model handlers
	 * --------------------------- */
	
	_onDeselectMedia: function(media) {
		if (!this.isCollapsed()) {
			this.transforms.clearAllOffsets();
			this.transforms.runAllTransitions(Globals.TRANSIT_ENTERING);
			this.transforms.validate();
		}
	},
	
	_onSelectMedia: function(media) {
		this.setCollapsed(true);
	},
	
	/* -------------------------------
	 * create/remove children on bundle selection
	 * ------------------------------- */
	
	/** Create children on bundle select */
	createChildren: function (bundle) {
		//this._currentChildren.push(this.createMediaCaptionCarousel(bundle, media));
		var transitionProp = this.getPrefixedProperty("transition");
		
		this._currentChildren.push(this.createMediaCaptionStack(bundle));
		this._currentChildren.push(this.createMediaCarousel(bundle));
		// Show views
		this._currentChildren.forEach(function(view, index, childViews) {
			this.transforms.add(view.el);
			if (!this.skipTransitions) {
				var rafHandler = function() {
					var transitionHandler = function(ev) {
						if (ev.target === view.el) {
							view.el.removeEventListener(transitionEnd, transitionHandler, false);
							view.el.style.removeProperty(transitionProp);
							console.log("ContentView", "TX IN", view.cid);
						}
					};
					view.el.addEventListener(transitionEnd, transitionHandler, false);
					view.el.style.removeProperty("opacity");
				};
				this.requestAnimationFrame(rafHandler);
				view.el.style[transitionProp] = "opacity " + Globals.TRANSIT_ENTERING.cssText;
				// view.el.style[transitionProp] = "opacity 0.4s ease 0.81s"; 
				view.el.style.opacity = 0;
			}
			this.el.appendChild(view.el);
			view.render();
		}, this);
	},
	
	removeChildren: function (bundle) {
		var transformProp = this.getPrefixedProperty("transform");
		var transitionProp = this.getPrefixedProperty("transition");
		
		this._currentChildren.forEach(function(view, index, childViews) {
			this.transforms.remove(view.el);
			view.stopListening(view.collection);
			controller.stopListening(view);
			if (this.skipTransitions) {
				view.remove();
			} else {
				var transitionHandler = function(ev) {
					if (ev.target === view.el) {
						view.el.removeEventListener(transitionEnd, transitionHandler, false);
						view.remove();
						console.log("ContentView", "TX OUT", view.cid);
					}
				};
				view.el.addEventListener(transitionEnd, transitionHandler, false);
				
				view.el.classList.add("removing-child");
				view.el.style[transformProp] = getComputedStyle(view.el)[transformProp];
				// view.el.style[transitionProp] = "opacity 0.4s ease 0.01s";
				view.el.style[transitionProp] = "opacity " + Globals.TRANSIT_EXITING.cssText;
				view.el.style.opacity = 0;
			}
		}, this);
		this._currentChildren.length = 0;
	},
	
	// _purgeChildren: function () {
	// 	if (this._exitingChildren !== null) {
	// 		this._exitingChildren.forEach(function(view, index, childViews) {
	// 			view.remove();
	// 			childViews.splice(index, 1);
	// 			// childViews[index] = null;
	// 		});
	// 		// this._exitingChildren = null;
	// 	}
	// },
	
	purgeChildren: function () {
		var view, i, ii, el, els = [];
		for (i = 0, ii = this.el.children.length; i < ii; i++) {
			el = this.el.children.item(i);
			console.log("yay removing-child:", el.classList.contains("removing-child"));
			if (el.classList.contains("removing-child")) {
				els.push(el);
			}
		}
		for (i = 0, ii = els.length; i < ii; i++) {
			el = els[i];
			try {
				view = ContainerView.findByElement(el).remove();
				console.log("ContentView", "PURGE", view.cid);
			} catch (err) {
				console.warn("ContentView", err);
				this.el.removeChild(el);
			}
		}
		console.log("ContentView", this.el.children.length, this._currentChildren.length);
	},
	
	// _onTransitionEnd: function(ev) {
	// 	console.log("ContentView._onTransitionEnd",
	// 		(ev.target.parentElement === this.el && ev.propertyName === "opacity"),
	// 		ev.target.getAttribute("data-cid"), ev.target.tagName, ev.target.className);
	// 		
	// 	var el = ev.target;
	// 	if (el.parentElement === this.el && ev.propertyName === "opacity") {
	// 		// for (var i = 0, ii = this.el.children.length; i < ii; i++) {
	// 			if (el.classList.contains("removing-child")) {
	// 				ContainerView.findByElement(el).remove();
	// 			} else {
	// 				// el.style.removeProperty(this.getPrefixedProperty("transition"));
	// 			}
	// 		// }
	// 	}
	// },

	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */

	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
		this.transforms.stopAllTransitions();
		this.transforms.clearAllCaptures();
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

		this.transforms.offsetAll(0, delta);
		this.transforms.validate();
	},

	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.clearAllOffsets();
		if (this.willCollapseChange(ev)) {
			this.transforms.runAllTransitions(this.isCollapsed()?
					Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING);
			this.transforms.validate();
			this.setCollapsed(!this.isCollapsed());
		} else {
			this.transforms.runAllTransitions(Globals.TRANSIT_IMMEDIATE);
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
		var classname = "media-carousel " + bundle.get("domid"); 
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
		});
		// controller.listenToOnce(view, "view:remove", controller.stopListening);
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
