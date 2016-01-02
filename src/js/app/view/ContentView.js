/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");

/** @type {module:app/view/base/View} */
var ContainerView = require("app/view/base/ContainerView");

/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("app/view/component/CollectionStack");

/** @type {module:app/view/component/CollectionStack} */
var SelectableListView = require("app/view/component/SelectableListView");
/** @type {module:app/view/render/DotNavigationRenderer} */
var DotNavigationRenderer = require("app/view/render/DotNavigationRenderer");

/** @type {module:app/view/component/Carousel} */
var Carousel = require("app/view/component/Carousel");
/** @type {module:app/view/component/Carousel} */
var CarouselRenderer = require("app/view/render/CarouselRenderer");
/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("app/view/render/ImageRenderer");
/** @type {module:app/view/render/VideoRenderer} */
var VideoRenderer = require("app/view/render/VideoRenderer");
/** @type {module:app/view/render/SequenceRenderer} */
var SequenceRenderer = require("app/view/render/SequenceRenderer");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.hbs");
/** @type {Function} */
var mediaCaptionTemplate = require("./template/CollectionStack.Media.hbs");

/** @type {Function} */
var transitionEnd = require("utils/event/transitionEnd");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");

var tx = Globals.transitions;


/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = ContainerView.extend({
	
	/** @override */
	cidPrefix: "contentView",
	
	initialize: function (options) {
		ContainerView.prototype.initialize.apply(this, arguments);
		
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		
		this.itemViews = [];
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
	},
	
	/** @override */
	render: function () {
		this.transforms.stopAllTransitions();
		this.transforms.validate();
		this.itemViews.forEach(function(view) {
			view.skipTransitions = true;
			view.render();
		}, this);
		return ContainerView.prototype.render.apply(this, arguments);
	},
	
	// renderLater: function() {
	// 	if (this.skipTransitions) {
	// 		this.transforms.stopAllTransitions();
	// 		this._transformsChanged = true;
	// 	}
	// 	this.skipTransitions = false;
	// 	
	// 	if (this._childrenChanged) {
	// 		this._childrenChanged = false;
	// 		if (bundles.lastSelected) {
	// 			// this.purgeChildren();
	// 			this.removeChildren(bundles.lastSelected);
	// 		}
	// 		if (bundles.selected) {
	// 			this.createChildren(bundles.selected);
	// 		}
	// 	}
	// 	
	// 	ContainerView.prototype.renderLater.apply(this, arguments);
	// 	
	// 	if (this._transformsChanged) {
	// 		this._transformsChanged = false;
	// 		this.transforms.validate();
	// 	}
	// },
	// invalidateTransforms: function() {
	// 	this._transformsChanged = true;
	// 	this.requestRender();
	// },
	// invalidateChildren: function() {
	// 	this._childrenChanged = true;
	// 	this.requestRender();
	// },
	
	/* -------------------------------
	/* collapse
	/* ------------------------------- */
	
	_onCollapseChange: function(collapsed) {
		this.itemViews.forEach(function(view) {
			view.setEnabled(collapsed);
		});
	},
	
	/* -------------------------------
	/* Router -> before model change
	/* ------------------------------- */
	 
	_beforeChange: function(bundle, media) {
		this._bundleChanging = (bundle !== bundles.selected);
	},
	
	_afterChange: function(bundle, media) {
		this._bundleChanging = false;
		this.transforms.validate();
	},
	
	/* --------------------------- *
	/* bundle model handlers
	/* --------------------------- */
	
	_onDeselectOne: function(bundle) {
		this.stopListening(bundle.get("media"), this.mediaListeners);
		this.itemViews.forEach(function(view) {
			view.stopListening(view.collection);
			controller.stopListening(view);
		}, this);
		
		this.purgeChildren();
		this.removeChildren(bundle);
		// this.invalidateChildren();
	},
	
	_onDeselectNone: function() {
		this.touch.on("vpanstart", this._onVPanStart);
	},
	
	_onSelectOne: function(bundle) {
		this.listenTo(bundle.get("media"), this.mediaListeners);
		this.createChildren(bundle);
		// this.invalidateChildren();
		this.collapsed = true;
		
	},
	
	_onSelectNone: function() {
		this.touch.off("vpanstart", this._onVPanStart);
		this.collapsed = false;
	},
	
	/* --------------------------- *
	/* media model handlers
	/* --------------------------- */
	
	_onDeselectMedia: function(media) {
		if (!this.collapsed) {
			this.transforms.clearAllOffsets();
			this.transforms.runAllTransitions(tx.LAST);
		}
	},
	
	_onSelectMedia: function(media) {
		if (!this._bundleChanging) {
			this.collapsed = true;
		}
	},
	
	/* -------------------------------
	/* create/remove children on bundle selection
	/* ------------------------------- */
	
	/** Create children on bundle select */
	createChildren: function (bundle) {
		var transitionProp = prefixedProperty("transition");
		
		this.captionStack = this.createMediaCaptionStack(bundle);
		this.carousel = this.createMediaCarousel(bundle);
		this.dotNavigation = this.createMediaDotNavigation(bundle);
		
		this.itemViews.push(
			this.captionStack,
			this.carousel,
			this.dotNavigation
		);
		this.transforms.add(this.carousel.el, this.captionStack.el);
		this.itemViews.forEach(function(view, index, contentViews) {
			if (!this.skipTransitions) {
				var rafHandler = function() {
					var transitionHandler = function(ev) {
						if (ev.target === view.el) {
							view.el.removeEventListener(transitionEnd, transitionHandler, false);
							view.el.style.removeProperty(transitionProp);
						}
					};
					view.el.addEventListener(transitionEnd, transitionHandler, false);
					view.el.style[transitionProp] = "opacity " + tx.LAST.cssText;
					view.el.style.removeProperty("opacity");
				};
				this.requestAnimationFrame(rafHandler);
				view.el.style.opacity = 0;
			}
			this.el.appendChild(view.el);
			view.render();
		}, this);
	},
	
	removeChildren: function (bundle) {
		var transformProp = prefixedProperty("transform");
		var transitionProp = prefixedProperty("transition");
		
		this.transforms.remove(this.carousel.el, this.captionStack.el);
		this.itemViews.forEach(function(view, index, contentViews) {
			// view.stopListening(view.collection);
			// controller.stopListening(view);
			if (this.skipTransitions) {
				view.remove();
			} else {
				var computedStyle = getComputedStyle(view.el);
				if (computedStyle.opacity == "0" || computedStyle.visibility == "hidden") {
					console.log("%s::removeChildren", this.cid, "item invisible (removed)", view.cid);
					view.remove();
				} else {
					var transitionHandler = function(ev) {
						if (ev.target === view.el) {
							console.log("%s::removeChildren", this.cid, "transitionEnd", view.cid);
							view.el.removeEventListener(transitionEnd, transitionHandler, false);
							view.remove();
						} else {
							console.log("%s::removeChildren", this.cid, "transitionEnd (ignored)", view.cid);
						}
					}.bind(this);
					view.el.addEventListener(transitionEnd, transitionHandler, false);
					view.el.classList.add("removing-child");
					view.el.style[transformProp] = computedStyle[transformProp];
					view.el.style[transitionProp] = "opacity " + tx.FIRST.cssText;
					view.el.style.opacity = 0;
				}
			}
		}, this);
		this.itemViews.length = 0;
	},
	
	purgeChildren: function() {
		var i, el, els = this.el.querySelectorAll(".removing-child");
		for (i = 0; i < els.length; i++) {
			el = els.item(i);
			if (el.parentElement === this.el) {
				try {
					console.warn("%s::purgeChildren", this.cid, el.getAttribute("data-cid"));
					ContainerView.findByElement(el).remove();
				} catch (err) {
					console.error("s::purgeChildren", this.cid, "orphaned element", err);
					this.el.removeChild(el);
				}
			}
		}
	},
	
	/* -------------------------------
	/* Vertical touch/move (_onVPan*)
	/* ------------------------------- */
	
	_collapsedOffsetY: Globals.COLLAPSE_OFFSET,
	
	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
		this.transforms.stopAllTransitions();
		this.transforms.clearAllCaptures();
		this.el.classList.add("container-changing");
		this._onVPanMove(ev);
	},
	
	_onVPanMove: function (ev) {
		var delta = ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapse/expand
		var isValidDir = this.collapsed? (delta > 0) : (delta < 0);
		var moveFactor = this.collapsed? Globals.VPAN_DRAG : 1 - Globals.VPAN_DRAG;
		
		delta = Math.abs(delta); // remove sign
		delta *= moveFactor;
		maxDelta *= moveFactor;
		
		if (isValidDir) {
			if (delta > maxDelta) { // overshooting
				delta = ((delta - maxDelta) * Globals.VPAN_OUT_DRAG) + maxDelta;
			} else { // no overshooting
				delta = delta;
			}
		} else {
			delta = (-delta) * Globals.VPAN_OUT_DRAG; // delta is opposite
		}
		delta *= this.collapsed? 1 : -1; // reapply sign
		
		this.transforms.offsetAll(0, delta);
		this.transforms.validate();
	},
	
	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.clearAllOffsets();
		if (this.willCollapseChange(ev)) {
			this.transforms.runAllTransitions(this.collapsed?
					tx.FIRST : tx.LAST);
			this.transforms.validate();
			this.collapsed = !this.collapsed;
		} else {
			this.transforms.runAllTransitions(tx.NOW);
			this.transforms.validate();
		}
		this.el.classList.remove("container-changing");
	},
	
	willCollapseChange: function(ev) {
		return ev.type == "vpanend"? this.collapsed?
			ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
			ev.thresholdDeltaY < (-Globals.COLLAPSE_THRESHOLD) :
			false;
	},
	
	/* -------------------------------
	/* Components
	/* ------------------------------- */
	
	/**
	/* media-carousel
	/*/
	createMediaCarousel: function(bundle) {
		// Create carousel
		var classname = "media-carousel " + bundle.get("domid"); 
		var EmptyRenderer = CarouselRenderer.extend({
			className: "carousel-item empty-item",
			model: bundle,
			template: bundleDescTemplate,
		});
		var rendererFunction = function(item, index, arr) {
			if (index === -1) {
				return EmptyRenderer;
			}
			switch (item.attr("@renderer")) {
				case "video": return VideoRenderer;
				case "sequence": return SequenceRenderer;
				// case "image": return ImageRenderer;
				default: return ImageRenderer;
			}
		};
		var view = new Carousel({
			className: classname,
			collection: bundle.get("media"),
			rendererFunction: rendererFunction,
			requireSelection: false, 
			direction: Carousel.DIRECTION_HORIZONTAL,
			touch: this.touch,
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectMedia,
			"view:select:none": controller.deselectMedia,
			"view:removed": controller.stopListening
		});
		return view;
	},
	
	/**
	/* media-caption-stack
	/*/
	createMediaCaptionStack: function(bundle) {
		var view = new CollectionStack({
			className: "media-caption-stack",
			collection: bundle.get("media"),
			template: mediaCaptionTemplate
		});
		return view;
	},
	
	/**
	/* media-dotnav
	/*/
	createMediaDotNavigation: function(bundle, media) {
		var view = new SelectableListView({
			className: "media-dotnav dots-fontello color-fg05",
			collection: bundle.get("media"),
			renderer: DotNavigationRenderer
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectMedia,
			"view:select:none": controller.deselectMedia,
			"view:removed": controller.stopListening
		});
		return view;
	},
});

module.exports = ContentView;
