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
var View = require("app/view/base/View");
/** @type {module:app/view/base/ContainerView} */
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
/** @type {module:app/view/component/progress/ProgressMeter} */
var ProgressMeter = require("app/view/component/progress/ProgressMeter");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.hbs");
/** @type {Function} */
var mediaCaptionTemplate = require("./template/CollectionStack.Media.hbs");

// /** @type {module:app/view/base/FrameQueue} */
// var FrameQueue = require("app/view/base/FrameQueue2");

var transitionEnd = ContainerView.prefixedEvent("transitionend");
var transformProp = ContainerView.prefixedProperty("transform");
var transitionProp = ContainerView.prefixedProperty("transition");

var tx = Globals.transitions;

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = ContainerView.extend({
	
	/** @override */
	cidPrefix: "contentView",
	
	events: {
		"transitionend .adding-child": "_onAddedTransitionEnd",
		"transitionend .removing-child": "_onRemovedTransitionEnd",
		// "transitionend": "_onTransitionEnd",
	},
	
	initialize: function (options) {
		ContainerView.prototype.initialize.apply(this, arguments);
		
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		
		this.skipTransitions = true;
		this.itemViews = [];
		
		this.progressWrapper = this.createProgressWrapper(),
		// this.el.appendChild(this.progressWrapper.el);
		
		this.listenTo(this.model, "change", this._onModelChange);
		
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
		this.listenTo(controller, {
			"change:before": this._beforeChange,
			"change:after": this._afterChange
		});
		this.listenTo(this, "collapsed:change", this._onCollapsedChange);
		this.listenTo(bundles, this.bundleListeners);
	},
	
	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	renderFrame: function(tstamp) {
		
		this._transformsChanged = this._transformsChanged || this._collapsedChanged || this.skipTransitions || (this._renderFlags &= ~ContainerView.RENDER_INVALID);
		
		if (this._childrenChanged) {
			this.renderChildren();
		}
		
		if (this._collapsedChanged) {
			this.renderCollapsed();
		}
		
		if (this._renderFlags & ContainerView.RENDER_INVALID) {
			this.transforms.clearAllCaptures();
		}
		
		if (this._transformsChanged)
		{
			this._transformsChanged = false;
			this.el.classList.remove("container-changing");
			
			if (this.skipTransitions)
			{
				this.transforms.stopAllTransitions();
				this.el.classList.remove("container-changed");
				
				if (!this._childrenChanged)
				{
					this.transforms.clearAllOffsets();
					if (this._collapsedChanged)
					{
						this._setChildrenEnabled(this.collapsed);
					}
				}
			}
			else
			{
				if (!this._childrenChanged)
				{
					this.transforms.clearAllOffsets();
					if (this._collapsedChanged)
					{
						this.el.classList.add("container-changed");
						var afterTransitions;
						if (this.collapsed) {
							// container-collapsed, enable last
							afterTransitions = function() {
								this._setChildrenEnabled(true);
								this.el.classList.remove("container-changed");
							};
							this.transforms.runAllTransitions(tx.LAST);
						} else {
							// container-expanded, disable first
							afterTransitions = function() {
								this.el.classList.remove("container-changed");
							};
							this._setChildrenEnabled(false);
							this.transforms.runAllTransitions(tx.FIRST);
						}
						afterTransitions = afterTransitions.bind(this);
						this.transforms.whenAllTransitionsEnd().then(afterTransitions, afterTransitions);
					}
					else {
						// unchanged
						this.transforms.runAllTransitions(tx.NOW);
					}
				}
			}
			this.transforms.validate();
		}
		
		if (this._renderFlags & ContainerView.RENDER_INVALID) {
			this.itemViews.forEach(function(view) {
				view.invalidateSize();
				if (this.skipTransitions) {
					view.skipTransitions = this.skipTransitions;
					view.renderNow(true);
				}
			}, this);
		}
		
		this.skipTransitions = this._childrenChanged = this._transformsChanged = this._collapsedChanged = false;
		this._renderFlags &= ~ContainerView.RENDER_INVALID;
	},
	
	renderChildren: function() {
		if (bundles.lastSelected) {
			// this.purgeChildren();
			this.removeChildren(bundles.lastSelected);
		}
		if (bundles.selected) {
			this.createChildren(bundles.selected);
		}
	},
	
	invalidateChildren: function() {
		this._childrenChanged = true;
		this.requestRender();
		// this.renderNow();
	},
	
	invalidateTransforms: function() {
		this._transformsChanged = true;
		this.requestRender();
	},
	
	_setChildrenEnabled: function(enabled) {
		this.itemViews.forEach(function(view) {
			view.setEnabled(enabled);
		});
	},
	
	/* --------------------------- *
	/* model changed
	/* --------------------------- */
	
	_onModelChange: function() {
		console.log("%s::_onModelChange", this.cid, this.model.changed);
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
		
		// this.purgeChildren();
		// this.removeChildren(bundle);
		// this.invalidateChildren();
	},
	
	_onDeselectNone: function() {
		this.touch.on("vpanstart", this._onVPanStart);
	},
	
	_onSelectOne: function(bundle) {
		this.listenTo(bundle.get("media"), this.mediaListeners);
		// this.createChildren(bundle);
		this.invalidateChildren();
		// this.renderChildren();
		// this.collapsed = true;
	},
	
	_onSelectNone: function() {
		this.touch.off("vpanstart", this._onVPanStart);
		this.invalidateChildren();
		// this.renderChildren();
		// this.collapsed = false;
	},
	
	/* --------------------------- *
	/* media model handlers
	/* --------------------------- */
	
	_onDeselectMedia: function(media) {
		// if (!this.collapsed) {
		// 	this.transforms.clearAllOffsets();
		// 	this.transforms.runAllTransitions(tx.LAST);
		// 	this.invalidateTransforms();
		// }
	},
	
	_onSelectMedia: function(media) {
		// if (!this._bundleChanging) {
		// 	this.collapsed = true;
		// }
	},
	
	/* -------------------------------
	/* collapsed
	/* ------------------------------- */
	
	_onCollapsedChange: function(collapsed) {
		// NOTE: invalidateTransforms is called in ContainerView._setCollapsed
		console.log("%s::_onCollapsedChange %s", this.cid, collapsed);
		// if (!this._bundleChanging) {
		// 	this._setChildrenEnabled(collapsed);
		// }
	},
	
	/* -------------------------------
	/* Router -> before model change
	/* ------------------------------- */
	 
	_beforeChange: function(bundle, media) {
		// collapsed on every change, except when nothing is selected
		this.collapsed = !!(bundle || media);
		
		// console.log("%s::_beforeChange", this.cid, arguments);
		// this._bundleChanging = (bundle !== bundles.selected);
		// this.invalidateTransforms();
	},
	
	_afterChange: function(bundle, media) {
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
		// check if direction is aligned with collapsed/expand
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
		
		// if (this.willCollapsedChange(ev)) {
		// 	this.collapsed = !this.collapsed;
		// } else {
		// 	this.invalidateTransforms();
		// }
		// this.renderNow();
		this._onVPanMove(ev);
		
		if (this.willCollapsedChange(ev)) {
			this.collapsed = !this.collapsed;
		}
		this.invalidateTransforms();
	},
	
	willCollapsedChange: function(ev) {
		return ev.type == "vpanend"? this.collapsed?
			ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
			ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
			false;
	},
	
	/* -------------------------------
	/* create/remove children on bundle selection
	/* ------------------------------- */
	
	/** Create children on bundle select */
	createChildren: function (bundle) {
		// will be attached to dom in this order
		var stack = this.createMediaCaptionStack(bundle),
			carousel = this.createMediaCarousel(bundle),
			dotNav = this.createMediaDotNavigation(bundle);
		
		this.itemViews.push(stack, carousel, dotNav);
		this.transforms.add(carousel.el, stack.el);
		
		this.itemViews.forEach(function(view) {
			if (!this.skipTransitions) {
				view.el.classList.add("adding-child");
				view.el.style.opacity = 0;
				// this.listenToOnce(view, "view:attached", function(view) {
				// 	// console.log("%s::[view:added] id:%s", this.cid, view.cid);
				// 	if (!this.skipTransitions) {
				// 		view.el.style[transitionProp] = "opacity " + tx.LAST.cssText;
				// 	}
				// 	view.el.style.removeProperty("opacity");
				// });
			}
			this.el.appendChild(view.el);
			view.render();
		}, this);
		
		if (!this.skipTransitions) {
			this.requestAnimationFrame(function() {
				console.log("%s::createChildren::[callback:requestAnimationFrame]", this.cid);
				this.itemViews.forEach(function(view) {
					if (!this.skipTransitions) {
						view.el.style[transitionProp] = "opacity " + tx.LAST.cssText;
					}
					view.el.style.removeProperty("opacity");
				}, this);
			});
		}
	},
	
	removeChildren: function (bundle) {
		// this.transforms.remove(this.carousel.el, this.captionStack.el);
		this.itemViews.forEach(function(view, i, a) {
			this.transforms.remove(view.el);
			if (this.skipTransitions) {
				view.remove();
			} else {
				var s = window.getComputedStyle(view.el);
				if (s.opacity == "0" || s.visibility == "hidden") {
					console.log("%s::removeChildren [view:%s] removed immediately (invisible)", this.cid, view.cid);
					view.remove();
				} else {
					view.el.classList.add("removing-child");
					if (s[transformProp]) view.el.style[transformProp] = s[transformProp];
					view.el.style[transitionProp] = "opacity " + tx.FIRST.cssText;
					view.el.style.opacity = 0;
				}
			}
			a[i] = null;
		}, this);
		this.itemViews.length = 0;
	},
	
	_onAddedTransitionEnd: function(ev) {
		if (ev.target.cid && this.childViews.hasOwnProperty(ev.target.cid)) {
			console.log("%s::_onAddedTransitionEnd [view:%s] [prop:%s] [ev:%s]", this.cid, ev.target.cid, ev.propertyName, ev.type);
			var view = this.childViews[ev.target.cid];
			view.el.classList.remove("adding-child");
			view.el.style.removeProperty(transitionProp);
		}
	},
	
	_onRemovedTransitionEnd: function(ev) {
		if (ev.target.cid && this.childViews.hasOwnProperty(ev.target.cid)) {
			console.log("%s::_onRemovedTransitionEnd [view:%s] [prop:%s] [ev:%s]", this.cid, ev.target.cid, ev.propertyName, ev.type);
			var view = this.childViews[ev.target.cid];
			view.el.classList.remove("removing-child");
			view.remove();
		}
	},
	
	purgeChildren: function() {
		var i, el, els = this.el.querySelectorAll(".removing-child");
		for (i = 0; i < els.length; i++) {
			el = els.item(i);
			if (el.parentElement === this.el) {
				try {
					console.error("%s::purgeChildren", this.cid, el.getAttribute("data-cid"));
					ContainerView.findByElement(el).remove();
				} catch (err) {
					console.error("s::purgeChildren", this.cid, "orphaned element", err);
					this.el.removeChild(el);
				}
			}
		}
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
	
	createProgressWrapper: function() {
		// var view = new ProgressMeter({
		// 	id: "media-progress-wrapper",
		// 	// className: "color-bg color-fg05",
		// 	useOpaque: false,
		// 	labelFn: function() { return "0%"; }
		// });
		// this.el.appendChild(this.progressWrapper.el);
		// return view;
		return null;
	},
});

module.exports = ContentView;
