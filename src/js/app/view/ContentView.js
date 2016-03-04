/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/TransformHelper} */
var TransformHelper = require("utils/TransformHelper");
/** @type {module:app/view/base/TouchManager} */
var TouchManager = require("app/view/base/TouchManager");

/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
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
// /** @type {module:app/view/component/ProgressMeter} */
// var ProgressMeter = require("app/view/component/ProgressMeter");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.hbs");
/** @type {Function} */
var mediaCaptionTemplate = require("./template/CollectionStack.Media.hbs");

var transitionEnd = View.prefixedEvent("transitionend");
var transformProp = View.prefixedProperty("transform");
var transitionProp = View.prefixedProperty("transition");

var tx = Globals.transitions;

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = View.extend({
	
	/** @override */
	cidPrefix: "contentView",
	
	/** @override */
	className: "container-x container-expanded",
	
	/** @override */
	events: {
		"transitionend .adding-child": "_onAddedTransitionEnd",
		"transitionend .removing-child": "_onRemovedTransitionEnd",
		// "transitionend": "_onTransitionEnd",
	},
	
	/** @override */
	initialize: function (options) {
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		
		this.transforms = new TransformHelper();
		this.touch = TouchManager.getInstance();
		
		this.listenTo(this.model, "change", this._onModelChange);
		
		// disconnect children before last change
		// this.listenTo(bundles, "deselect:one", this._onDeselectOneBundle);
		
		this.skipTransitions = true;
		this.itemViews = [];
		
		// this.progressWrapper = this.createProgressWrapper(),
		// this.el.appendChild(this.progressWrapper.el);
	},
	
	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	renderFrame: function(tstamp, flags) {
		// values
		var collapsed = this.model.get("collapsed");
		var collapsedChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("collapsed");
		var childrenChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("bundle");
		
		// flags
		var sizeChanged = !!(flags & View.SIZE_INVALID);
		var transformsChanged = !!(flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID));
		transformsChanged = transformsChanged || this._transformsChanged || this.skipTransitions;
		
		// debug
		// if (flags & View.MODEL_INVALID) {
		// 	console.group(this.cid + "::renderFrame model changed:");
		// 	Object.keys(this.model.changed).forEach(function(key) {
		// 		console.log("\t%s: %s -> %s", key, this.model._previousAttributes[key], this.model.changed[key]);
		// 	}, this);
		// 	console.groupEnd();
		// }
		
		// model:children
		// - - - - - - - - - - - - - - - - -
		if (childrenChanged) {
			if (bundles.lastSelected) {
				this.removeChildren(bundles.lastSelected);
			}
			if (bundles.selected) {
				this.createChildren(bundles.selected);
			}
		}
		
		// model:collapsed
		// - - - - - - - - - - - - - - - - -
		if (collapsedChanged) {
			this.el.classList.toggle("container-collapsed", collapsed);
			this.el.classList.toggle("container-expanded", !collapsed);
		}
		
		// size
		// - - - - - - - - - - - - - - - - -
		if (sizeChanged) {
			this.transforms.clearAllCaptures();
		}
		
		// transforms
		// - - - - - - - - - - - - - - - - -
		if (transformsChanged) {
			this.el.classList.remove("container-changing");
			if (this.skipTransitions) {
				this.transforms.stopAllTransitions();
				this.el.classList.remove("container-changed");
				if (!childrenChanged) {
					// this.transforms.clearAllOffsets();
					if (collapsedChanged) {
						this._setChildrenEnabled(collapsed);
					}
				}
			} else {
				if (!childrenChanged) {
					if (collapsedChanged) {
						var afterTransitionsFn;
						this.el.classList.add("container-changed");
						// this.transforms.clearAllOffsets();
						if (collapsed) {
							// container-collapsed, enable last
							afterTransitionsFn = function() {
								this._setChildrenEnabled(true);
								this.el.classList.remove("container-changed");
							};
							this.transforms.runAllTransitions(tx.LAST);
						} else {
							// container-expanded, disable first
							afterTransitionsFn = function() {
								this.el.classList.remove("container-changed");
							};
							this._setChildrenEnabled(false);
							this.transforms.runAllTransitions(tx.FIRST);
						}
						afterTransitionsFn = afterTransitionsFn.bind(this);
						this.transforms.whenAllTransitionsEnd().then(afterTransitionsFn, afterTransitionsFn);
					} else {
						this.transforms.items.forEach(function(o) {
							if (o.hasOffset) {
								o.runTransition(tx.NOW);
								// o.clearOffset();
							}
						});
					}
				}
			}
			// console.group(this.cid + "::renderFrame transitions:");
			// if (!this.skipTransitions) {
			// 	console.log("[skipping]");
			// } else {
			// 	this.transforms.items.forEach(function(o) {
			// 		var args = [ "\t%s: %s", o.el.id || o.id, o.transition.name || o.transition ];
			// 		if (o.hasOffset) args.push("[hasOffset]", o.offsetX, o.offsetY);
			// 		console.log.apply(console, args);
			// 	}, this);
			// }
			// console.groupEnd();
			
			if (!childrenChanged) {
				this.transforms.clearAllOffsets();
			}
			this.transforms.validate();
		}
		if (sizeChanged) {
			this.itemViews.forEach(function(view) {
				view.skipTransitions = this.skipTransitions;
				// view.invalidateSize();
				// view.renderNow();
				view.requestRender(View.SIZE_INVALID).renderNow();
			}, this);
		}
		this.skipTransitions = this._transformsChanged = false;
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
		if (this.model.hasChanged("withBundle")) {
			if (this.model.get("withBundle")) {
				this.touch.on("vpanstart", this._onVPanStart);
			} else {
				this.touch.off("vpanstart", this._onVPanStart);
			}
		}
		this.requestRender(View.MODEL_INVALID);
	},
	
	/* -------------------------------
	/* Vertical touch/move (_onVPan*)
	/* ------------------------------- */
	
	_collapsedOffsetY: Globals.COLLAPSE_OFFSET,
	
	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.stopAllTransitions();
		// this.transforms.clearAllOffsets();
		// this.transforms.validate();
		this.transforms.clearAllCaptures();
		
		this.el.classList.add("container-changing");
		this._onVPanMove(ev);
	},
	
	_onVPanMove: function (ev) {
		var collapsed = this.model.get("collapsed");
		var delta = ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapsed/expand
		var isValidDir = collapsed? (delta > 0) : (delta < 0);
		var moveFactor = collapsed? Globals.VPAN_DRAG : 1 - Globals.VPAN_DRAG;
		
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
		delta *= collapsed? 1 : -1; // reapply sign
		
		this.transforms.offsetAll(0, delta);
		this.transforms.validate();
	},
	
	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);
		
		// FIXME: model.collapsed may have already changed, _onVPanMove would run with wrong values:
		// model.collapsed is changed in a setImmediate callback from NavigationView.
		
		this._onVPanMove(ev);
		this.setImmediate(function() {
			this._transformsChanged = true;
			this.requestRender();
		});
	},
	
	// willCollapsedChange: function(ev) {
	// 	var collapsed = this.model.get("collapsed");
	// 	return ev.type == "vpanend"? collapsed?
	// 		ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
	// 		ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
	// 		false;
	// },
	
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
			// view.listenToOnce(bundle, "deselect", function() {
			// 	this.stopListening(this.collection);
			// });
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
		// this.purgeChildren();
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
	
	// purgeChildren: function() {
	// 	var i, el, els = this.el.querySelectorAll(".removing-child");
	// 	for (i = 0; i < els.length; i++) {
	// 		el = els.item(i);
	// 		if (el.parentElement === this.el) {
	// 			try {
	// 				console.error("%s::purgeChildren", this.cid, el.getAttribute("data-cid"));
	// 				View.findByElement(el).remove();
	// 			} catch (err) {
	// 				console.error("s::purgeChildren", this.cid, "orphaned element", err);
	// 				this.el.removeChild(el);
	// 			}
	// 		}
	// 	}
	// },
	
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
			// "view:removed": controller.stopListening
		});
		view.listenTo(bundle, "deselected", function() {
			this.stopListening(this.collection);
			controller.stopListening(this);
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
		view.listenTo(bundle, "deselected", function() {
			this.stopListening(this.collection);
		});
		return view;
	},
	
	/**
	/* media-dotnav
	/*/
	createMediaDotNavigation: function(bundle) {
		var view = new SelectableListView({
			className: "media-dotnav dots-fontello color-fg05",
			collection: bundle.get("media"),
			renderer: DotNavigationRenderer
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectMedia,
			"view:select:none": controller.deselectMedia,
			// "view:removed": controller.stopListening
		});
		view.listenTo(bundle, "deselected", function() {
			this.stopListening(this.collection);
			controller.stopListening(this);
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
