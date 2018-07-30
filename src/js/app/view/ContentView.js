/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/TransformHelper} */
var TransformHelper = require("utils/TransformHelper");
// /** @type {module:app/view/base/TouchManager} */
// var TouchManager = require("app/view/base/TouchManager");

/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */
var articles = require("app/model/collection/ArticleCollection");

// /** @type {module:app/model/collection/BundleItem} */
// var BundleItem = require("app/model/item/BundleItem");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/component/ArticleView} */
var ArticleView = require("app/view/component/ArticleView");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("app/view/component/CollectionStack");
/** @type {module:app/view/component/CollectionStack} */
var SelectableListView = require("app/view/component/SelectableListView");
/** @type {module:app/view/render/DotNavigationRenderer} */
var DotNavigationRenderer = require("app/view/render/DotNavigationRenderer");
/** @type {module:app/view/component/Carousel} */
var Carousel = require("app/view/component/Carousel");

/** @type {module:app/view/render/CarouselRenderer} */
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
var carouselEmptyTemplate = require("./template/Carousel.EmptyRenderer.Bundle.hbs");
/** @type {Function} */
var mediaStackTemplate = require("./template/CollectionStack.Media.hbs");

// var transitionEnd = View.prefixedEvent("transitionend");
var transformProp = View.prefixedProperty("transform");
var transitionProp = View.prefixedProperty("transition");

var tx = Globals.transitions;


// var clickEvent = window.hasOwnProperty("onpointerup") ? "pointerup" : "mouseup",

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = View.extend({

	/** @override */
	cidPrefix: "contentView",

	/** @override */
	className: "container-expanded",

	/** @override */
	events: {
		"transitionend .adding-child": "_onAddedTransitionEnd",
		"transitionend .removing-child": "_onRemovedTransitionEnd",
		// "transitionend": "_onTransitionEnd",
	},

	/** @override */
	initialize: function(options) {
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal", "_onCollapsedEvent");

		this.transforms = new TransformHelper();
		// this.touch = options.touch || new Error("no touch"); //TouchManager.getInstance();
		this.vpan = options.vpan || new Error("no vpan");
		this.hpan = options.hpan || new Error("no hpan");

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
		var collapsedChanged = (flags & View.MODEL_INVALID)
			&& this.model.hasChanged("collapsed");
		var childrenChanged = (flags & View.MODEL_INVALID)
			&& (this.model.hasChanged("bundle") || this.model.hasChanged("article"));

		// flags
		var sizeChanged = !!(flags & View.SIZE_INVALID);
		var transformsChanged = !!(flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID));
		transformsChanged = transformsChanged || this._transformsChanged || this.skipTransitions;

		// debug
		// - - - - - - - - - - - - - - - - -
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
			this.removeChildren();
			if (bundles.selected) {
				this.createChildren(bundles.selected);
			} else
			if (articles.selected) {
				this.createChildren(articles.selected);
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
			if (!childrenChanged) {
				this.transforms.clearAllOffsets();
			}
			this.transforms.validate();
		}
		if (sizeChanged) {
			this.itemViews.forEach(function(view) {
				view.skipTransitions = this.skipTransitions;
				view.requestRender(View.SIZE_INVALID).renderNow();
			}, this);
			/*Promise.all(this.itemViews.map(function(view) {
					view.skipTransitions = this.skipTransitions;
					return view.requestRender(View.SIZE_INVALID).whenRendered();
				}, this))
				.then(
					function(views) {
						var nh = this.el.offsetParent.offsetHeight - this.el.offsetTop;
						// var oh = views.reduce(function(h, view) {
						// 	return Math.max(h, view.el.offsetHeight);
						// }, nh);
						// oh++;
						// console.log("%s:[whenRendered] [result: %s %s] %o", this.cid,
						// 	nh, oh, this.el.parent, views);
						this.el.style.minHeight = nh + "px";
						return views;
					}.bind(this),
					function(reason) {
						console.warn("%s:[whenRendered] [rejected] %o", this.cid, reason);
						return reason;
					}.bind(this)
				);*/
		}
		this.skipTransitions = this._transformsChanged = false;
	},

	_setChildrenEnabled: function(enabled) {
		// if (enabled) {
		// 	this.el.removeEventListener("click", this._onCollapsedClick, false);
		// } else {
		// 	this.el.addEventListener("click", this._onCollapsedClick, false);
		// }
		this.itemViews.forEach(function(view) {
			view.setEnabled(enabled);
		});
	},

	/* -------------------------------
	/* Collapse UI gestures/events
	/* ------------------------------- */

	_onCollapsedEvent: function(ev) {
		console.log("%s:[%s -> _onCollapsedEvent] target: %s", this.cid, ev.type, ev.target);
		if (!ev.defaultPrevented &&
			this.model.has("bundle") &&
			!this.model.get("collapsed") &&
			!this.enabled) {
			// this.setImmediate(function() {
			// if (ev.type == "click") ev.stopPropagation();
			ev.preventDefault();
			this.setImmediate(function() {
				// if (ev.type == "click") ev.stopPropagation();
				this.model.set("collapsed", true);
			});
			// });
		}
	},

	/* --------------------------- *
	/* model changed
	/* --------------------------- */

	_onModelChange: function() {
		if (this.model.hasChanged("withBundle")) {
			if (this.model.has("bundle")) {
				this.vpan.on("vpanstart", this._onVPanStart);
			} else {
				this.vpan.off("vpanstart", this._onVPanStart);
			}
		}
		/*
		if (this.model.hasChanged("withBundle") ||
			this.model.hasChanged("collapsed")) {
			if (this.model.get("withBundle") &&
				!this.model.get("collapsed")) {
				this.hpan.on("hpanleft hpanright", this._onCollapsedEvent);
				this.el.addEventListener(Globals.CLICK_EVENT, this._onCollapsedEvent, false);
			} else {
				this.hpan.off("hpanleft hpanright", this._onCollapsedEvent);
				this.el.removeEventListener(Globals.CLICK_EVENT, this._onCollapsedEvent, false);
			}
		}
		*/
		this.requestRender(View.MODEL_INVALID);
	},

	/* -------------------------------
	/* Vertical touch/move (_onVPan*)
	/* ------------------------------- */

	_collapsedOffsetY: Globals.COLLAPSE_OFFSET,

	_onVPanStart: function(ev) {
		this.vpan.on("vpanmove", this._onVPanMove);
		this.vpan.on("vpanend vpancancel", this._onVPanFinal);

		this.transforms.stopAllTransitions();
		// this.transforms.clearAllOffsets();
		// this.transforms.validate();
		this.transforms.clearAllCaptures();

		this.el.classList.add("container-changing");
		this._onVPanMove(ev);
	},

	_onVPanMove: function(ev) {
		var collapsed = this.model.get("collapsed");
		var delta = ev.deltaY; //ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY; // + Math.abs(ev.thresholdOffsetY);

		// check if direction is aligned with collapsed/expand
		var isValidDir = collapsed ? (delta > 0) : (delta < 0);
		var moveFactor = collapsed ? Globals.VPAN_DRAG : 1 - Globals.VPAN_DRAG;

		delta = Math.abs(delta); // remove sign
		delta *= moveFactor;
		maxDelta *= moveFactor;

		if (isValidDir) {
			if (delta > maxDelta) { // overshooting
				delta = ((delta - maxDelta) * Globals.VPAN_OUT_DRAG) + maxDelta;
			} else { // no overshooting
				// delta = delta;
			}
		} else {
			delta = (-delta) * Globals.VPAN_OUT_DRAG; // delta is opposite
		}
		delta *= collapsed ? 1 : -1; // reapply sign

		this.transforms.offsetAll(0, delta);
		this.transforms.validate();
	},

	_onVPanFinal: function(ev) {
		this.vpan.off("vpanmove", this._onVPanMove);
		this.vpan.off("vpanend vpancancel", this._onVPanFinal);

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
	createChildren: function(model) {
		var view;
		if (model.__proto__.constructor === bundles.model) {
			// will be attached to dom in this order
			view = this.createMediaCaptionStack(model);
			this.itemViews.push(view);
			this.transforms.add(view.el);
			view = this.createMediaCarousel(model);
			this.itemViews.push(view);
			this.transforms.add(view.el);
			view = this.createMediaDotNavigation(model);
			this.itemViews.push(view);
		} else
		if (model.__proto__.constructor === articles.model) {
			view = this.createArticleView(model);
			this.itemViews.push(view);
		}

		this.itemViews.forEach(function(view) {
			if (!this.skipTransitions) {
				view.el.classList.add("adding-child");
				view.el.style.opacity = 0;
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

	removeChildren: function() {
		this.itemViews.forEach(function(view, i, arr) {
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
			arr[i] = null;
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
	 * media-carousel
	 */
	createMediaCarousel: function(bundle) {
		// Create carousel
		var EmptyRenderer = CarouselRenderer.extend({
			className: "carousel-item empty-item",
			model: bundle,
			template: carouselEmptyTemplate,
		});
		var rendererFunction = function(item, index, arr) {
			if (index === -1) {
				return EmptyRenderer;
			}
			switch (item.attr("@renderer")) {
				case "video":
					return VideoRenderer;
				case "sequence":
					return SequenceRenderer;
				case "image":
					return ImageRenderer;
				default:
					return ImageRenderer;
			}
		};
		var view = new Carousel({
			className: "media-carousel " + bundle.get("domid"),
			collection: bundle.get("media"),
			rendererFunction: rendererFunction,
			requireSelection: false,
			direction: Carousel.DIRECTION_HORIZONTAL,
			touch: this.hpan,
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
	 * media-caption-stack
	 */
	createMediaCaptionStack: function(bundle) {
		var view = new CollectionStack({
			className: "media-caption-stack",
			collection: bundle.get("media"),
			template: mediaStackTemplate
		});
		view.listenTo(bundle, "deselected", function() {
			this.stopListening(this.collection);
		});
		return view;
	},

	/**
	 * media-dotnav
	 */
	createMediaDotNavigation: function(bundle) {
		var view = new SelectableListView({
			className: "media-dotnav dots-fontface color-fg05",
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

	/**
	 * @param el {module:app/model/item/ArticleView}
	 * @return {module:app/view/base/View}
	 */
	createArticleView: function(article) {
		var view = new ArticleView({
			model: article,
		});
		return view;
	},

	// createProgressWrapper: function() {
	// 	// var view = new ProgressMeter({
	// 	// 	id: "media-progress-wrapper",
	// 	// 	// className: "color-bg color-fg05",
	// 	// 	useOpaque: false,
	// 	// 	labelFn: function() { return "0%"; }
	// 	// });
	// 	// this.el.appendChild(this.progressWrapper.el);
	// 	// return view;
	// 	return null;
	// },
});

module.exports = ContentView;