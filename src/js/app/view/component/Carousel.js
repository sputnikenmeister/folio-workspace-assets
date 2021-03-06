/**
 * @module app/view/component/Carousel
 */

/** @type {module:backbone.babysitter} */
const Container = require("backbone.babysitter");

/** @type {module:hammerjs} */
const Hammer = require("hammerjs");
/** @type {module:utils/touch/SmoothPanRecognizer} */
const Pan = require("utils/touch/SmoothPanRecognizer");
/** @type {module:hammerjs.Tap} */
var Tap = Hammer.Tap;

/** @type {module:app/control/Globals} */
const Globals = require("app/control/Globals");
/** @type {module:app/view/base/View} */
const View = require("app/view/base/View");
// /** @type {module:app/view/base/DeferredView} */
// var View = require("app/view/base/DeferredView");

/** @type {module:app/view/render/CarouselRenderer} */
const CarouselRenderer = require("app/view/render/CarouselRenderer");

/** @type {module:utils/prefixedProperty} */
const prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedStyleName} */
const prefixedStyleName = require("utils/prefixedStyleName");

var transformStyleName = prefixedStyleName("transform");
var transformProperty = prefixedProperty("transform");
var translateTemplate = Globals.TRANSLATE_TEMPLATE;

// var cssToPx = function(cssVal, el) {
// 	return parseInt(cssVal);
// };

// var defaultRendererFunction = (function() {
// 	var defaultRenderer = CarouselRenderer.extend({ className: "carousel-item default-renderer"}),
// 		emptyRenderer = CarouselRenderer.extend({ className: "carousel-item empty-renderer"});
// 	return function(item, index, arr) {
// 		return (index === -1)? emptyRenderer: defaultRenderer;
// 	};
// })();

/** @const */
var MAX_SELECT_THRESHOLD = 20;

// /** @const */
// var CHILDREN_INVALID = View.CHILDREN_INVALID,
// 	STYLES_INVALID = View.STYLES_INVALID,
// 	MODEL_INVALID = View.MODEL_INVALID,
// 	SIZE_INVALID = View.SIZE_INVALID,
// 	LAYOUT_INVALID = View.LAYOUT_INVALID;

var VERTICAL = Hammer.DIRECTION_VERTICAL,
	HORIZONTAL = Hammer.DIRECTION_HORIZONTAL;

// x: ["x", "y"],
// y: ["y", "x"],
// offsetLeft: ["offsetLeft", "offsetTop"],
// offsetTop: ["offsetTop", "offsetLeft"],
// offsetWidth: ["offsetWidth", "offsetHeight"],
// offsetHeight: ["offsetHeight", "offsetWidth"],
// width: ["width","height"],
// height: ["height","width"],
// marginLeft: ["marginLeft","marginTop"],
// marginRight: ["marginRight","marginBottom"],

/*
var HORIZONTAL_PROPS = {
	pos: "x",
	size: "width",
	offsetPos: "offsetLeft",
	offsetSize: "offsetWidth",
	marginBefore: "marginLeft",
	marginAfter: "marginRight",
};
var VERTICAL_PROPS = {
	pos: "y",
	size: "height",
	offsetPos: "offsetTop",
	offsetSize: "offsetHeight",
	marginBefore: "marginTop",
	marginAfter: "marginBottom",
};
*/

// var DIRECTION_NONE = 1;
// var DIRECTION_LEFT = 2;
// var DIRECTION_RIGHT = 4;
// var DIRECTION_UP = 8;
// var DIRECTION_DOWN = 16;

var dirToStr = function(dir) {
	if (dir === Hammer.DIRECTION_NONE) return 'NONE';
	if (dir === Hammer.DIRECTION_LEFT) return 'LEFT';
	if (dir === Hammer.DIRECTION_RIGHT) return 'RIGHT';
	if (dir === Hammer.DIRECTION_UP) return 'UP';
	if (dir === Hammer.DIRECTION_DOWN) return 'DOWN';
	if (dir === Hammer.DIRECTION_HORIZONTAL) return 'HOR'; //IZONTAL';
	if (dir === Hammer.DIRECTION_VERTICAL) return 'VER'; //TICAL';
	if (dir === Hammer.DIRECTION_ALL) return 'ALL';
	return 'UNREC'; //OGNIZED';
}

var isValidTouchManager = function(touch, direction) {
	// var retval;
	try {
		return touch.get("hpan").options.direction == direction;
	} catch (err) {
		return false;
	}
	// return retval;
};

// /** @type {int} In pixels */
// var panThreshold: 15;

var createTouchManager = function(el, dir, thres) {
	var touch = new Hammer.Manager(el);
	var pan = new Pan({
		event: "hpan",
		threshold: Globals.THRESHOLD,
		direction: Hammer.DIRECTION_HORIZONTAL,
	});
	var tap = new Tap({
		threshold: Globals.THRESHOLD - 1,
		interval: 50,
		time: 200,
	});
	tap.recognizeWith(pan);
	touch.add([pan, tap]);
	return touch;
};


var Carousel = {
	/** const */
	ANIMATED: false,
	/** const */
	IMMEDIATE: true,

	/** copy of Hammer.DIRECTION_VERTICAL */
	DIRECTION_VERTICAL: VERTICAL,
	/** copy of Hammer.DIRECTION_HORIZONTAL */
	DIRECTION_HORIZONTAL: HORIZONTAL,
	/** @type {Object} */
	defaults: {
		/** @type {boolean} */
		selectOnScrollEnd: false,
		/** @type {boolean} */
		requireSelection: false,
		/** @type {int} */
		direction: HORIZONTAL,
		/** @type {int} In pixels */
		selectThreshold: 20,
		/** @type {Function} */
		rendererFunction: (function() {
			var defaultRenderer = CarouselRenderer.extend({
					className: "carousel-item default-renderer"
				}),
				emptyRenderer = CarouselRenderer.extend({
					className: "carousel-item empty-renderer"
				});
			return function(item, index, arr) {
				return (index === -1) ? emptyRenderer : defaultRenderer;
			};
		})(),
	},
};
Carousel.validOptions = _.keys(Carousel.defaults);

/**
/* @constructor
/* @type {module:app/view/component/Carousel}
/*/
var CarouselProto = {

	/** @override */
	cidPrefix: "carousel",
	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel skip-transitions",

	/* --------------------------- *
	/* properties
	/* --------------------------- */

	properties: {
		scrolling: {
			get: function() {
				return this._scrolling;
			}
		},
		selectedItem: {
			get: function() {
				return this._selectedView.model;
			},
			set: function(value) {
				if (value)
					this._onSelectOne(value)
				else
					this._onSelectNone();
			}
		},
	},

	events: {
		// "mousedown": "_onMouseDown", "mouseup": "_onMouseUp",
		"transitionend .carousel-item.selected": "_onScrollTransitionEnd",
		"click .carousel-item:not(.selected)": "_onClick",
	},

	/** @override */
	initialize: function(options) {
		_.bindAll(this, "_onPointerEvent", "_onClick");

		this.itemViews = new Container();
		this.metrics = {};

		_.extend(this, _.defaults(_.pick(options, Carousel.validOptions), Carousel.defaults));

		// this.childGap = 0; //this.dirProp(20, 18);
		this._precedingDir = (Hammer.DIRECTION_LEFT | Hammer.DIRECTION_UP) & this.direction;
		this._followingDir = (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_DOWN) & this.direction;

		// use supplied touch mgr or create private
		if (isValidTouchManager(options.touch, this.direction)) {
			this.touch = options.touch;
		} else {
			console.warn("%s::initialize creating Hammer instance", this.cid);
			this.touch = createTouchManager(this.el, this.direction);
			// this.on("view:removed", this.touch.destroy, this.touch);
			this.listenTo(this, "view:removed", function() {
				this.touch.destroy();
			});
		}

		/* create children and props */
		this.setEnabled(true);
		this.skipTransitions = true;
		this._renderFlags = View.CHILDREN_INVALID;
		// this.invalidateChildren();

		this.listenTo(this, "view:attached", function() {
			this.skipTransitions = true;
			// this.invalidateSize();
			// this.renderNow();
			// this.requestRender();
			this.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
		});

		/* collection listeners */
		this.listenTo(this.collection, {
			"reset": this._onReset,
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			"deselect:one": this._onDeselectAny,
			"deselect:none": this._onDeselectAny,
		});
	},
	/* --------------------------- *
	/* Hammer init
	/* --------------------------- */

	// validateTouchManager: function(touch, direction) {
	// 	try {
	// 		return touch.get("pan").options.direction === direction);
	// 	} catch (err) {
	// 		return false;
	// 	}
	// },

	// initializeHammer: function(options) {
	// 	// direction from opts/defaults
	// 	if (options.direction === VERTICAL) {
	// 		this.direction = VERTICAL;
	// 	} // do nothing: the default is horizontal
	//
	// 	// validate hammer instance or create local
	// 	if ((touch = options.touch) && (pan = touch.get("pan"))) {
	// 		// Override direction only if specific
	// 		if (pan.options.direction !== Hammer.DIRECTION_ALL) {
	// 			this.direction = pan.options.direction;
	// 		}
	// 		this.panThreshold = pan.options.threshold;
	// 	} else {
	// 		console.warn("%s::initializeHammer using private Hammer instance", this.cid);
	// 		touch = createHammerInstance(this.el, this.panThreshold, this.direction);
	// 		this.on("view:removed", touch.destroy, touch);
	// 	}
	// 	this.touch = touch;
	// },

	remove: function() {
		// this._scrollPendingAction && this._scrollPendingAction(true);
		// if (this._enabled) {
		// 	this.touch.off("tap", this._onTap);
		// 	this.touch.off("hpanstart hpanmove hpanend hpancancel", this._onPan);
		// }
		this._togglePointerEvents(false);
		this.removeChildren();
		View.prototype.remove.apply(this, arguments);
		return this;
	},


	/* --------------------------- *
	/* helper functions
	/* --------------------------- */

	dirProp: function(hProp, vProp) {
		return (this.direction & HORIZONTAL) ? hProp : vProp;
	},

	/* --------------------------- *
	/* Render
	/* --------------------------- */

	// render: function() {
	// 	if (this.attached) {
	// 		this.skipTransitions = true;
	// 		// this.invalidateSize();
	// 		this.renderNow(true);
	// 	}
	// },

	// /** @override */
	// render: function () {
	// 	if (!this.attached) {
	// 		if (!this._renderPending) {
	// 			this._renderPending = true;
	// 			this.listenTo(this, "view:attached", this.render);
	// 		}
	// 	} else {
	// 		if (this._renderPending) {
	// 			this._renderPending = false;
	// 			this.stopListening(this, "view:attached", this.render);
	// 		}
	// 		this._delta = 0;
	// 		this.skipTransitions = true;
	// 		this.invalidateSize();
	// 		// this.invalidateLayout();
	// 		this.renderNow();
	// 	}
	// 	return this;
	// },

	// render: function () {
	// 	this.measureLater();
	// 	this.scrollBy(0, Carousel.IMMEDIATE);
	//
	// 	if (this.el.parentElement) {
	// 		this.renderNow();
	// 	}
	// 	return this;
	// },

	/** @override */
	renderFrame: function(tstamp, flags) {
		if (flags & View.CHILDREN_INVALID) {
			this._createChildren();
			// clear this flag now: render may be deferred until attached
			flags &= ~View.CHILDREN_INVALID;
		}
		if (this.attached) {
			if (flags & View.SIZE_INVALID) {
				this._measure();
			}
			if (flags & (View.LAYOUT_INVALID | View.SIZE_INVALID)) {
				this._scrollBy(this._delta, this.skipTransitions);
			}
		} else if (flags) {
			this.listenToOnce(this, "view:attached", function() {
				this.requestRender(flags);
			});
		}
	},

	/* --------------------------- *
	/* enabled
	/* --------------------------- */

	// /** @override */
	// _enabled: undefined,

	/** @override */
	setEnabled: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			// toggle events immediately
			this._togglePointerEvents(enabled);
			// dom manipulation on render (_renderEnabled)
			// this._renderFlags |= View.STYLES_INVALID;
			// this.requestRender();
			this.setImmediate(this._renderEnabled);
			// this._renderEnabled();
		}
	},

	_renderEnabled: function() {
		this.el.classList.toggle("disabled", !this.enabled);
		this.itemViews.each(function(view) {
			view.setEnabled(this.enabled);
		}, this);
	},

	/* --------------------------- *
	/* Create children
	/* --------------------------- */

	_createChildren: function() {
		// var sIndex;
		var buffer, renderer, view, viewOpts;

		this.removeChildren();

		if (this.collection.length) {
			viewOpts = {
				// viewDepth: this.viewDepth + 1,
				// parentView: this,
				enabled: this.enabled
			};
			buffer = document.createDocumentFragment();
			// buffer = this.el;

			if (!this.requireSelection) {
				renderer = this.rendererFunction(null, -1, this.collection);
				view = new renderer(viewOpts);
				this.itemViews.add(view);
				buffer.appendChild(view.el);
				this.emptyView = view;
			}

			this.collection.each(function(item, index, arr) {
				viewOpts.model = item;
				renderer = this.rendererFunction(item, index, arr);
				view = new renderer(viewOpts);
				this.itemViews.add(view);
				buffer.appendChild(view.el);
			}, this);

			// if (!this.requireSelection) {
			// 	buffer = this.appendItemView(buffer, this.model, -1, this.collection);
			// 	this.emptyView = this.itemViews.first();
			// }
			// buffer = this.collection.reduce(this.appendItemView, buffer, this);

			this.adjustToSelection();
			this._selectedView.el.classList.add("selected");

			this.el.appendChild(buffer);
		}
	},

	// appendItemView: function (parentEl, model, index, arr) {
	// 	var renderer = this.rendererFunction(model, index, arr);
	// 	var view = new renderer({
	// 		model: model,
	// 		parentView: this,
	// 		enabled: this.enabled
	// 	});
	// 	this.itemViews.add(view);
	// 	parentEl.appendChild(view.el);
	// 	return parentEl;
	// },

	// createItemView: function (renderer, opts) {
	// 	var view = new renderer(opts);
	// 	this.itemViews.add(view);
	// 	return view;
	// },

	removeChildren: function() {
		this.itemViews.each(this.removeItemView, this);
		this.emptyView = (void 0);
	},

	removeItemView: function(view) {
		this.itemViews.remove(view);
		view.remove();
		return view;
	},

	/* --------------------------- *
	/* measure
	/* --------------------------- */

	_measure: function() {
		var m, mm;
		var pos = 0,
			posInner = 0;
		var maxAcross = 0,
			maxOuter = 0;
		var maxOuterView, maxAcrossView;

		maxOuterView = maxAcrossView = this.emptyView || this.itemViews.first();

		// chidren metrics
		this.itemViews.each(function(view) {
			view.render();
		});

		this.itemViews.each(function(view) {
			m = this.measureItemView(view);
			m.pos = pos;
			pos += m.outer; // + this.childGap;
			m.posInner = posInner;
			posInner += m.inner; //+ this.childGap;
			if (view !== this.emptyView) {
				if (m.across > maxAcross) {
					maxAcross = m.across;
					maxAcrossView = view;
				}
				if (m.outer > maxOuter) {
					maxOuter = m.outer;
					maxOuterView = view;
				}
			}
		}, this);

		// measure self + max child metrics
		mm = this.metrics[this.cid] || (this.metrics[this.cid] = {});
		mm.outer = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		mm.before = maxOuterView.el[this.dirProp("offsetLeft", "offsetTop")];
		mm.inner = maxOuterView.el[this.dirProp("offsetWidth", "offsetHeight")];
		mm.after = mm.outer - (mm.inner + mm.before);
		mm.across = maxAcross;

		// m = this.metrics[maxOuterView.cid];
		// mm.inner = m.inner;

		// tap area
		this._tapAcrossBefore = maxAcrossView.el[this.dirProp("offsetTop", "offsetLeft")];
		this._tapAcrossAfter = this._tapAcrossBefore + maxAcross;
		this._tapBefore = mm.before + this._tapGrow;
		this._tapAfter = mm.before + mm.inner - this._tapGrow;

		this.selectThreshold = Math.min(MAX_SELECT_THRESHOLD, mm.outer * 0.1);
	},

	measureItemView: function(view) {
		var m, viewEl;
		// var s, sizeEl;

		viewEl = view.el;
		m = this.metrics[view.cid] || (this.metrics[view.cid] = {});

		m.outer = viewEl[this.dirProp("offsetWidth", "offsetHeight")];
		m.across = viewEl[this.dirProp("offsetHeight", "offsetWidth")];

		if (view.metrics) {
			m.before = view.metrics[this.dirProp("marginLeft", "marginTop")];
			m.outer += m.before;
			m.outer += view.metrics[this.dirProp("marginRight", "marginBottom")];
			m.inner = view.metrics.content[this.dirProp("width", "height")];
			m.before += view.metrics.content[this.dirProp("x", "y")];
			m.after = m.outer - (m.inner + m.before);

			// var marginBefore = view.metrics[this.dirProp("marginLeft","marginTop")];
			// var marginAfter = view.metrics[this.dirProp("marginRight","marginBottom")];
			// var pos = view.metrics.content[this.dirProp("x","y")];
			//
			// m.inner = view.metrics.content[this.dirProp("width","height")];
			// m.before = marginBefore + pos;
			// m.outer += marginBefore + marginAfter;
			// m.after = m.outer - (m.inner + m.before);
		} else {
			// throw new Error("renderer has no metrics");
			console.warn("%s::measureItemView view '%s' has no metrics", this.cid, view.cid);
			m.inner = m.outer;
			m.after = m.before = 0;
		}

		return m;
	},

	/* --------------------------- *
	/* scrolling property
	/* --------------------------- */

	_delta: 0,

	_scrolling: false,

	_setScrolling: function(scrolling) {
		// console.warn("_setScrolling current/requested", this._scrolling, scrolling);
		if (this._scrolling != scrolling) {
			this._scrolling = scrolling;
			this.el.classList.toggle("scrolling", scrolling);
			this.trigger(scrolling ? "view:scrollstart" : "view:scrollend");
		}
	},

	/* --------------------------- *
	/* Scroll/layout
	/* --------------------------- */

	scrollBy: function(delta, skipTransitions) {
		this._delta = delta || 0;
		this.skipTransitions = !!skipTransitions;
		// this.invalidateLayout();
		this.requestRender(View.LAYOUT_INVALID);
	},

	_scrollBy: function(delta, skipTransitions) {
		var sMetrics, metrics, pos;

		sMetrics = this.metrics[(this._scrollCandidateView || this._selectedView).cid];
		this.itemViews.each(function(view) {
			metrics = this.metrics[view.cid];
			pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics));
			view.metrics.translateX = (this.direction & HORIZONTAL) ? pos : 0;
			view.metrics.translateY = (this.direction & HORIZONTAL) ? 0 : pos;
			view.metrics._transform = translateTemplate(view.metrics.translateX, view.metrics.translateY);
			view.el.style[transformProperty] = view.metrics._transform;
			// view.el.style[transformProperty] = (this.direction & HORIZONTAL)?
			// 	"translate3d(" + pos + "px,0,0)":
			// 	"translate3d(0," + pos + "px,0)";
		}, this);

		this.el.classList.toggle("skip-transitions", skipTransitions);
		this.selectFromView();
	},

	_getScrollOffset: function(delta, mCurr, mSel) {
		var pos, offset = 0;

		pos = mCurr.pos - mSel.pos + delta;
		if (pos < 0) {
			if (Math.abs(pos) < mSel.outer) {
				offset += (-mCurr.after) / mSel.outer * pos;
			} else {
				offset += mCurr.after;
			}
		} else
		if (0 <= pos) {
			if (Math.abs(pos) < mSel.outer) {
				offset -= mCurr.before / mSel.outer * pos;
			} else {
				offset -= mCurr.before;
			}
		}
		return pos + offset;
	},

	_onScrollTransitionEnd: function(ev) {
		if (ev.propertyName === transformStyleName && this.scrolling) {
			console.log("%s::_onScrollTransitionEnd selected: %s", this.cid, ev.target.cid);
			this._setScrolling(false);
		}
	},

	/* --------------------------- *
	/* toggle touch events
	/* --------------------------- */

	_togglePointerEvents: function(enable) {
		// console.log("%s::_togglePointerEvents", this.cid, enable);
		if (this._pointerEventsEnabled == enable) return;

		this._pointerEventsEnabled = enable;
		if (enable) {
			this.touch.on("hpanstart hpanmove hpanend hpancancel", this._onPointerEvent);
			this.el.addEventListener(View.CLICK_EVENT, this._onClick, true);
		} else {
			this.touch.off("hpanstart hpanmove hpanend hpancancel", this._onPointerEvent);
			this.el.removeEventListener(View.CLICK_EVENT, this._onClick, true);
		}
	},

	_onPointerEvent: function(ev) {
		// NOTE: https://github.com/hammerjs/hammer.js/pull/1118
		if (ev.srcEvent.type === 'pointercancel')
			return;

		console.log("%s:[%s (%s)]:_onPointerEvent offs:%s [%s|%s==%s] [%s]", this.cid, ev.type, ev.srcEvent.type,
			dirToStr(ev.offsetDirection),
			dirToStr(ev.direction),
			dirToStr(this.direction),
			dirToStr(ev.direction | this.direction),
			(ev.srcEvent.defaultPrevented ? "prevented" : "-"));

		// if (ev.direction & this.direction) {
		switch (ev.type) {
			// case View.CLICK_EVENT:
			// 	return this._onClick(ev);
			// case "tap":
			// 	return this._onTap(ev);
			case "hpanstart":
				return this._onPanStart(ev);
			case "hpanmove":
				return this._onPanMove(ev);
			case "hpanend":
				return this._onPanFinal(ev);
			case "hpancancel":
				return this._onPanFinal(ev);
		}
		// }
	},

	/* --------------------------- *
	/* touch event: pan
	/* --------------------------- */

	getViewAtPanDir: function(dir) {
		// return (dir & this._precedingDir) ? this._precedingView : this._followingView;
		return (dir & this._followingDir) ? this._precedingView : this._followingView;
	},

	// _panCapturedOffset: 0,

	/** @param {Object} ev */
	_onPanStart: function(ev) {
		this.selectFromView();
		this.el.classList.add("panning");
		this._setScrolling(true);
	},

	/** @param {Object} ev */
	_onPanMove: function(ev) {
		// var delta = (this.direction & HORIZONTAL) ? ev.thresholdDeltaX : ev.thresholdDeltaY;
		var delta = (this.direction & HORIZONTAL) ? ev.deltaX : ev.deltaY;
		var view = this.getViewAtPanDir(ev.offsetDirection);
		var cView = this._panCandidateView;

		if (cView !== view) {
			cView && cView.el.classList.remove("candidate");
			view && view.el.classList.add("candidate");
			this._panCandidateView = view;
		}
		if (cView === (void 0)) {
			delta *= Globals.HPAN_OUT_DRAG;
		}

		if (this._renderRafId !== -1) {
			this.scrollBy(delta, Carousel.IMMEDIATE);
			this.renderNow();
		} else {
			this._scrollBy(delta, Carousel.IMMEDIATE);
		}
	},

	/** @param {Object} ev */
	_onPanFinal: function(ev) {
		var scrollCandidate;
		// NOTE: this delta is used for determining selection, NOT for layout
		// var delta = (this.direction & HORIZONTAL) ? ev.thresholdDeltaX : ev.thresholdDeltaY;
		var delta = (this.direction & HORIZONTAL) ? ev.deltaX : ev.deltaY;

		if ((ev.type == "hpanend")
			/* pan direction (current event) and offsetDirection (whole gesture) must match */
			&& (ev.direction ^ ev.offsetDirection ^ this.direction)
			// && (ev.direction & ev.offsetDirection & this.direction)
			/* gesture must overshoot selectThreshold */
			&& (Math.abs(delta) > this.selectThreshold)) {
			/* choose next scroll target */
			scrollCandidate = this.getViewAtPanDir(ev.offsetDirection);
		}
		this._scrollCandidateView = scrollCandidate || (void 0);

		if (this._panCandidateView && (this._panCandidateView !== scrollCandidate)) {
			this._panCandidateView.el.classList.remove("candidate");
		}
		this._panCandidateView = (void 0);
		this.el.classList.remove("panning");

		console.log("%s:[%s]:_onPanFinal thres:(%s>%s) dir:(e:%s o:%s c:%s)=%s\n", this.cid, ev.type,
			Math.abs(delta), this.selectThreshold,
			dirToStr(ev.direction),
			dirToStr(ev.offsetDirection),
			dirToStr(this.direction),
			dirToStr(ev.direction ^ ev.offsetDirection ^ this.direction),
			scrollCandidate ? (scrollCandidate.cid + ":" + scrollCandidate.model.cid) : "none");
		// console.log("%s::_onPanFinal", this.cid, ev);

		this.scrollBy(0, Carousel.ANIMATED);
		this.selectFromView();

		// if (this._renderRafId !== -1) {
		// 	this.scrollBy(0, Carousel.ANIMATED);
		// 	this.renderNow();
		// } else {
		// 	this._scrollBy(0, Carousel.ANIMATED);
		// }
	},

	/* --------------------------- *
	/* touch event: tap
	/* --------------------------- */

	/** @type {int} In pixels */
	_tapGrow: 10,

	getViewAtTapPos: function(posAlong, posAcross) {
		if ((this._tapAcrossBefore < posAcross) && (posAcross < this._tapAcrossAfter)) {
			if (posAlong < this._tapBefore) {
				return this._precedingView;
			} else
			if (posAlong > this._tapAfter) {
				return this._followingView;
			}
		}
		return (void 0);
	},

	_onClick: function(ev) {
		console.log("%s::_onClick [%s]", this.cid, ev.type, ev.defaultPrevented ? "prevented" : "not-prevented");
		this._onTap(ev);
	},

	_onTap: function(ev) {
		if (ev.defaultPrevented) return;

		var tapCandidate;
		var targetView = View.findByDescendant(ev.target);
		// console.log("%s::_onTap %o", this.cid, targetView.cid, ev.target);
		// if (!this.itemViews.contains(targetView)) {
		// 	return;
		// }
		do {
			if (this._selectedView === targetView) {
				tapCandidate = null;
				break;
			} else if (this === targetView.parentView) {
				tapCandidate = targetView;
				break;
			} else if (this === targetView) {
				var bounds, tapX, tapY;
				bounds = this.el.getBoundingClientRect();
				tapX = (ev.type === "tap" ? ev.center.x : ev.clientX) - bounds.left;
				tapY = (ev.type === "tap" ? ev.center.y : ev.clientY) - bounds.top;
				tapCandidate = this.getViewAtTapPos(
					this.dirProp(tapX, tapY),
					this.dirProp(tapY, tapX)
				);
				break;
			}
		} while ((targetView = targetView.parentView))

		if (tapCandidate) {
			ev.preventDefault();
			// ev.stopPropagation();

			// this._scrollCandidateView = tapCandidate;
			// this._setScrolling(true);
			// this.scrollBy(0, Carousel.ANIMATED);
			// this._scrollCandidateView.el.classList.add("candidate");
			// this.selectFromView();

			//// NOT using internalSelection
			// this.triggerSelectionEvents(tapCandidate, false);

			// using internalSelection
			this._scrollCandidateView = tapCandidate;
			this._setScrolling(true);
			this.scrollBy(0, Carousel.ANIMATED);

			this.triggerSelectionEvents(tapCandidate, true);
			// this.renderNow();
		}
	},

	/* --------------------------- *
	/* Private
	/* --------------------------- */

	triggerSelectionEvents: function(view, internal) {
		if (view === (void 0) || this._internalSelection) {
			return;
		}

		this._internalSelection = !!internal;
		if (view === this.emptyView) {
			this.trigger("view:select:none");
		} else {
			this.trigger("view:select:one", view.model);
		}
		this._internalSelection = false;
	},

	selectFromView: function() {
		if (this._scrollCandidateView) {
			this.triggerSelectionEvents(this._scrollCandidateView, true);
		}
		// if (this._scrollCandidateView === (void 0)) {
		// 	return;
		// }
		// var view = this._scrollCandidateView;
		// this.triggerSelectionEvents(view, true);
	},

	adjustToSelection: function() {
		var m, i = this.collection.selectedIndex;
		// assume -1 < index < this.collection.length
		if (this.requireSelection) {
			(i == -1) && i++; // if selection is null (index -1), set _selectedView to first item (index 0)
			this._selectedView = (m = this.collection.at(i)) && this.itemViews.findByModel(m);
			this._precedingView = (m = this.collection.at(i - 1)) && this.itemViews.findByModel(m);
			this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
		} else {
			this._selectedView = (m = this.collection.at(i)) ? this.itemViews.findByModel(m) : this.emptyView;
			this._precedingView = m && ((m = this.collection.at(i - 1)) ? this.itemViews.findByModel(m) : this.emptyView);
			this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
		}
	},

	/* --------------------------- *
	/* Model listeners
	/* --------------------------- */

	/** @private */
	_onSelectOne: function(model) {
		if (model === this._selectedView.model) {
			// console.info("INTERNAL");
			return;
		}
		this._onSelectAny(model);
	},

	/** @private */
	_onSelectNone: function() {
		if ((this.requireSelection ? this.itemViews.first() : this.emptyView) === this._selectedView) {
			// console.info("INTERNAL");
			return;
		}
		this._onSelectAny();
	},

	/** @private */
	_onSelectAny: function(model) {
		this._selectedView.el.classList.remove("selected");
		this.adjustToSelection();
		this._selectedView.el.classList.add("selected");
		if (this._scrollCandidateView) {
			this._scrollCandidateView.el.classList.remove("candidate");
			this._scrollCandidateView = (void 0);
		}

		if (!this._internalSelection) {
			this._setScrolling(true);
			this.scrollBy(0, Carousel.ANIMATED);
		}
	},

	// _onDeselectAny: function (model) {},

	/** @private */
	_onReset: function() {
		// this._createChildren();
		// this.invalidateChildren();
		this.requestRender(View.CHILDREN_INVALID | View.MODEL_INVALID);
	},


	/* --------------------------- *
	/* TEMP
	/* --------------------------- */

	// _scrollBy2: function (delta, skipTransitions) {
	// 	var metrics, pos;
	// 	var sMetrics = this.metrics[(this._scrollCandidateView || this._selectedView).cid];
	// 	var cMetrics = this.metrics[(this._panCandidateView || this._selectedView).cid];
	//
	// 	this.itemViews.each(function (view) {
	// 		metrics = this.metrics[view.cid];
	// 		pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics, cMetrics));
	// 		view.el.style[transformProperty] = (this.direction & HORIZONTAL)?
	// 				"translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";
	// 				// "translate(" + pos + "px,0)" : "translate(0," + pos + "px)";
	// 				// "translateX(" + pos + "px)" : "translateY(" + pos + "px)";
	// 	}, this);
	// 	this.el.classList.toggle("skip-transitions", skipTransitions);
	// 	this.selectFromView();
	// },

	// _getScrollOffset2: function (delta, mCurr, mSel, mCan) {
	// 	var offset = 0;
	// 	var posInner = mCurr.posInner - mSel.posInner + delta;
	//
	// 	if (posInner < -mSel.inner) {
	// 		offset = -(mCurr.before);
	// 	} else if (posInner > mSel.inner) {
	// 		offset = (mSel.after);
	// 	} else {
	// 		if (posInner < 0) {
	// 			offset = (mCurr.before) / (mCurr.inner) * posInner;
	// 		} else {
	// 			offset = (mSel.after) / (mCan.inner) * posInner;
	// 		}
	// 	}
	// 	return posInner + offset;
	// },

	// captureSelectedOffset: function() {
	// 	var val, view, cssval, m, mm;
	//
	// 	val = 0;
	// 	view = this._scrollCandidateView || this._selectedView;
	// 	cssval = getComputedStyle(view.el)[transformProperty];
	//
	// 	mm = cssval.match(/(matrix|matrix3d)\(([^\)]+)\)/);
	// 	if (mm) {
	// 		m = mm[2].split(",");
	// 		if (this.direction & HORIZONTAL) {
	// 			val = m[mm[1]=="matrix"? 4 : 12];
	// 		} else {
	// 			val = m[mm[1]=="matrix"? 5 : 13];
	// 		}
	// 		val = parseFloat(val);
	// 	}
	//
	// 	console.log("%s::captureSelectedOffset", this.cid, cssval, val, cssval.match(/matrix\((?:\d\,){3}(\d)\,(\d)|matrix3d\((?:\d\,){11}(\d)\,(\d)/));
	//
	// 	return val;
	// },

	// _onScrollEnd: function(exec) {
	// 	this._scrollEndCancellable = (void 0);
	// 	// this.el.classList.remove("disabled-changing");
	// 	if (exec) {
	// 		this._setScrolling(false);
	// 		// this.el.classList.remove("scrolling");
	// 		// this.trigger("view:scrollend");
	// 		console.log("%s::_onScrollEnd", this.cid);
	// 	}
	// },
	// _onMouseDown: function(ev) {
	// 	if (this._scrolling) {
	// 		this._panCapturedOffset = this.captureSelectedOffset();
	// 		console.log("%s::events[mousedown] scrolling interrupted (pos %f)", this.cid, this._panCapturedOffset);
	// 	}
	// },
	// _onMouseUp:function(ev) {
	// 	this._panCapturedOffset = 0;
	// },

};

if (DEBUG) {
	CarouselProto._logFlags = "";
}

module.exports = Carousel = View.extend(CarouselProto, Carousel);
