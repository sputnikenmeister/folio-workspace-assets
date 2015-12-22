/**
 * @module app/view/component/Carousel
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/base/DeferredView} */
var DeferredView = require("app/view/base/DeferredView");

/** @type {module:app/view/render/CarouselRenderer} */
var CarouselRenderer = require("app/view/render/CarouselRenderer");

/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {module:utils/prefixedStyleName} */
var prefixedStyleName = require("utils/prefixedStyleName");

var transformStyleName = prefixedStyleName("transform");
var transformProperty = prefixedProperty("transform");

var cssToPx = function (cssVal, el) {
	return parseInt(cssVal);
};

var defaultRendererFunction = (function() {
	var defaultRenderer = CarouselRenderer.extend({ className: "carousel-item default-renderer"}),
		emptyRenderer = CarouselRenderer.extend({ className: "carousel-item empty-renderer"});
	return function(item, index, arr) {
		return (index === -1)? emptyRenderer: defaultRenderer;
	};
})();
var Carousel = {
	/** const */
	MAX_SELECT_THRESHOLD: 50,
	/** const arg in scrollByNow, scrollByLater */
	ANIMATED: false,
	/** const arg in scrollByNow, scrollByLater */
	IMMEDIATE: true,
	/** copy of Hammer.DIRECTION_VERTICAL */
	DIRECTION_VERTICAL: Hammer.DIRECTION_VERTICAL,
	/** copy of Hammer.DIRECTION_HORIZONTAL */
	DIRECTION_HORIZONTAL: Hammer.DIRECTION_HORIZONTAL,
};

/**
 * @constructor
 * @type {module:app/view/component/Carousel}
 */
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
	},
	
	requireSelection: false,
	/** @type {int} In pixels */
	selectThreshold: 20,
	/** @type {int} In pixels */
	panThreshold: 15,
	/** @type {int} */
	direction: Carousel.DIRECTION_HORIZONTAL,
	/** @type {Function} */
	rendererFunction: defaultRendererFunction,
	
	// renderer: CarouselRenderer.extend({ className: "carousel-item default-renderer"}),
	// /** @type {Function} */
	// emptyRenderer: CarouselRenderer.extend({ className: "carousel-item empty-item"}),
	// 
	// defaults: {
	// 	/** @type {int} In pixels */
	// 	selectThreshold: 20,
	// 	/** @type {int} In pixels */
	// 	panThreshold: 15,
	// 	/** @type {int} */
	// 	direction: Carousel.DIRECTION_HORIZONTAL,
	// 	/** @type {Function} */
	// 	rendererFunction: (function() {
	// 		var renderer = CarouselRenderer.extend({ className: "carousel-item default-renderer"}),
	// 			emptyRenderer = CarouselRenderer.extend({ className: "carousel-item default-renderer"})
	// 		return function(item, index, arr) {
	// 			return (index === -1)? emptyRenderer: renderer;
	// 		};
	// 	})(),
	// },
	
	/** @override */
	initialize: function (options) {
		_.bindAll(this, "_createChildren", "_measure", "_onPan", "_onTap");
		
		this.initializeHammer(options);
		
		// options.template && (this.template = options.template);
		// options.renderer && (this.renderer = options.renderer);
		// options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);
		_.isBoolean(options.requireSelection) && (this.requireSelection = options.requireSelection);
		_.isFunction(options.rendererFunction) && (this.rendererFunction = options.rendererFunction);
		
		// _.isNumber(options.gap) && (this.gap = options.gap);
		this.itemViews = new Container();
		this.metrics = {};
		this.childGap = this.dirProp(20, 18);
		this._precedingDir = (Hammer.DIRECTION_LEFT | Hammer.DIRECTION_UP) & this.direction;
		this._followingDir = (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_DOWN) & this.direction;
		
		this.createChildrenNow();
		// this._enabled = true;
		// this.hammer.on("panstart panmove panend pancancel", this._onPan);
		this.setEnabledNow(true);
		
		this.listenTo(this.collection, {
			"reset": this._onReset,
			"select:one": this._onSelectAny,
			"select:none": this._onSelectAny,
			"deselect:one": this._onDeselectAny,
			"deselect:none": this._onDeselectAny,
		});
	},
	
	initializeHammer: function(options) {
		var hammer, pan, tap;
		// direction from opts/defaults
		if (options.direction === Hammer.DIRECTION_VERTICAL) {
			this.direction = Hammer.DIRECTION_VERTICAL;
		} // do nothing: the default is horizontal

		// validate external hammer or create one if neccesary
		// if ((hammer = options.hammer) && (pan = hammer.get("pan")) && hammer.get("tap")) {
		if ((hammer = options.hammer) && (pan = hammer.get("pan"))) {
			// Override direction only if specific
			if (pan.options.direction !== Hammer.DIRECTION_ALL) {
				this.direction = pan.options.direction;
			}
			this.panThreshold = pan.options.threshold;
		} else {
			console.log("Carousel created own Hammer");
			hammer = new Hammer.Manager(this.el);
			pan = new Hammer.Pan({
				threshold: this.panThreshold,
				direction: this.direction,
				//enable: this._canEnablePan.bind(this),
			});
			tap = new Hammer.Tap({
				threshold: this.panThreshold - 1,
				interval: 50, time: 200,
				//enable: this._canEnableTan.bind(this),
			});
			tap.recognizeWith(pan);
			hammer.add([pan, tap]);
			this.on("view:removed", hammer.destroy, hammer);
		}
		this.hammer = hammer;
	},
	
	remove: function () {
		this._scrollPendingAction && this._scrollPendingAction(true);
		if (this._enabled) {
			this.hammer.off("tap", this._onTap);
			this.hammer.off("panstart panmove panend pancancel", this._onPan);
		}
		this.removeChildren();
		DeferredView.prototype.remove.apply(this, arguments);
		return this;
	},
	
	
	/* --------------------------- *
	/* helper functions
	/* --------------------------- */
	
	dirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},
	
	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	
	/** @override */
	render: function () {
		if (this.domPhase === "created") {
			if (!this._renderPending) {
				this._renderPending = true;
				this.listenTo(this, "view:added", this.render);
			}
		} else {
			if (this._renderPending) {
				this._renderPending = false;
				this.stopListening(this, "view:added", this.render);
			}
			if (this.domPhase === "added") {
				this.measureLater();
				this.scrollByLater(0, Carousel.IMMEDIATE);
				this.renderNow();
			}
		}
		return this;
	},
	
	// render: function () {
	// 	this.measureLater();
	// 	this.scrollByLater(0, Carousel.IMMEDIATE);
	// 	
	// 	if (this.el.parentElement) {
	// 		this.renderNow();
	// 	}
	// 	return this;
	// },
	
	/** @override */
	renderLater: function () {
		this.validateRender("createChildren");
		this.validateRender("measure");
		this.validateRender("scrollBy");
		this.validateRender("enabled");
	},
	
	/* Render: now   ------------- */
	
	createChildrenNow: function () {
		this._createChildren();
	},
	measureNow: function () {
		this._measure();
	},
	scrollByNow: function (delta, skipTransitions) {
		this._scrollBy(delta, skipTransitions);
	},
	setEnabledNow: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			this._setEnabled(enabled);
		}
	},
	
	/* Render: later ------------- */
	createChildrenLater: function () {
		this.requestRender("createChildren", this._createChildren);
	},
	measureLater: function () {
		this.requestRender("measure", this._measure);
	},
	scrollByLater: function (delta, skipTransitions) {
		this.requestRender("scrollBy", this._scrollBy.bind(this, delta, skipTransitions));
	},
	setEnabledLater: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			this.requestRender("enabled", this._setEnabled.bind(this, enabled));
		}
	},
	
	/* --------------------------- *
	/* Create children
	/* --------------------------- */
	
	_createChildren: function () {
		var buffer;
		var sIndex;
		this.removeChildren();
		if (this.collection.length) {
			buffer = document.createDocumentFragment();
			sIndex = this.collection.selectedIndex;
			if (!this.requireSelection) {
				buffer.appendChild(this.createEmptyView().el);
			} else if (sIndex == -1) {
				sIndex = 0;
			}
			this.collection.each(function (item, index, arr) {
				buffer.appendChild(this.createItemView(this.rendererFunction(item, index, arr), { model: item }, index, sIndex).el);
			}, this);
			this.el.appendChild(buffer);
		}
	},
	
	createEmptyView: function () {
		return this.emptyView = this.createItemView(this.rendererFunction(null, -1, this.collection), _.pick(this, ["model", "collection", "template"]), -1, this.collection.selectedIndex);
	},
	
	createItemView: function (renderer, opts, index, sIndex) {
		var view;
		opts.parentView = this;
		view = new renderer(opts);
		this.itemViews.add(view);
		switch (index - sIndex) {
			case  0:
				view.el.classList.add("selected");
				return this._selectedView = view;
			case -1:
				return this._precedingView = view;
			case  1:
				return this._followingView = view;
			default:
				return view;
		}
	},
	
	removeChildren: function () {
		this.itemViews.each(this.removeItemView, this);
		this.emptyView = void 0;
	},
	
	removeItemView: function (view) {
		this.itemViews.remove(view);
		view.remove();
		return view;
	},
	
	/* --------------------------- *
	/* measure
	/* --------------------------- */
	
	// var ORIENTED_PROPS = {
	// 	x: ["x", "y"],
	// 	y: ["y", "x"],
	// 	offsetLeft: ["offsetLeft", "offsetTop"],
	// 	offsetTop: ["offsetTop", "offsetLeft"],
	// 	offsetWidth: ["offsetWidth", "offsetHeight"],
	// 	offsetHeight: ["offsetHeight", "offsetWidth"],
	// };
	
	_measure: function() {
		var m, mm;
		var pos = 0, posInner = 0;
		var maxAcross = 0, maxOuter = 0;
		var maxOuterView, maxAcrossView;
		
		maxOuterView = maxAcrossView = this.emptyView || this.itemViews.first();
		
		// chidren metrics
		this.itemViews.each(function(view) {
			view.render();
		});
		
		this.itemViews.each(function(view) {
			m = this.measureItemView(view);
			m.pos = pos;
			pos += m.outer + this.childGap;
			m.posInner = posInner;
			posInner += m.inner + this.childGap;
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
		
		// get max child metrics
		m = this.metrics[maxOuterView.cid];
		// measure self
		mm = this.metrics[this.cid] || (this.metrics[this.cid] = {});
		mm.across = maxAcross;
		mm.outer = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		mm.before = maxOuterView.el[this.dirProp("offsetLeft", "offsetTop")];
		mm.inner = maxOuterView.el[this.dirProp("offsetWidth", "offsetHeight")];
		// mm.inner = m.inner;
		mm.after = mm.outer - (mm.inner + mm.before);
		
		// tap area
		this._tapAcrossBefore = maxAcrossView.el[this.dirProp("offsetTop", "offsetLeft")];
		this._tapAcrossAfter = this._tapAcrossBefore + maxAcross;
		this._tapBefore = mm.before + this._tapGrow;
		this._tapAfter = mm.before + mm.inner - this._tapGrow;
		
		this.selectThreshold = Math.min(Carousel.MAX_SELECT_THRESHOLD, mm.outer * 0.1);
	},
	
	measureItemView: function (view) {
		var m, s, viewEl, sizeEl;
		
		viewEl = view.el;
		m = this.metrics[view.cid] || (this.metrics[view.cid] = {});
		
		if (view.metrics) {
			m.before = view.metrics[this.dirProp("marginLeft","marginTop")];
			m.outer = viewEl[this.dirProp("offsetWidth", "offsetHeight")];
			m.outer += m.before;
			m.outer += view.metrics[this.dirProp("marginRight","marginBottom")];
			m.inner = view.metrics.content[this.dirProp("width","height")];
			m.before += view.metrics.content[this.dirProp("x","y")];
		} else {
			// throw new Error("renderer has no metrics");
			console.warn("%s::measureItemView view '%s' has no metrics", this.cid, view.cid);
		}
		m.after = m.outer - (m.inner + m.before);
		m.across = viewEl[this.dirProp("offsetHeight", "offsetWidth")];
		
		return m;
	},
	
	/* --------------------------- *
	/* enabled
	/* --------------------------- */
	
	/** @private */
	_enabled: undefined,
	
	/**
	/* @return {?Boolean}
	/*/
	isEnabled: function () {
		return this._enabled;
	},
	
	/**
	/* @param {Boolean}
	/* @return {?Boolean}
	/*/
	setEnabled: function(enabled) {
		this.setEnabledLater(enabled);
	},

	/** @private */
	_setEnabled: function (enabled) {
		if (enabled) {
			this.hammer.on("tap", this._onTap);
			this.hammer.on("panstart panmove panend pancancel", this._onPan);
		} else {
			this.hammer.off("tap", this._onTap);
			this.hammer.off("panstart panmove panend pancancel", this._onPan);
		}
		this.itemViews.each(function (view) {
			view.setEnabled(enabled);
		});
		this.el.classList.toggle("disabled", !enabled);
	},
	
	/* --------------------------- *
	/* scrolling property
	/* --------------------------- */
	
	_scrolling: false,
	
	_setScrolling: function(scrolling) {
		// console.warn("_setScrolling current/requested", this._scrolling, scrolling);
		if (this._scrolling != scrolling) {
			this._scrolling = scrolling;
			this.el.classList.toggle("scrolling", scrolling);
			this.trigger(scrolling? "view:scrollstart":"view:scrollend");
		}
	},
	
	/* --------------------------- *
	/* Scroll/layout
	/* --------------------------- */
	
	_scrollBy: function (delta, skipTransitions) {
		var metrics, sView, sMetrics, cView, cMetrics, pos, txProp;
		
		sView = this._scrollCandidateView || this._selectedView;
		cView = this._panCandidateView || this._selectedView;
		sMetrics = this.metrics[sView.cid];
		cMetrics = this.metrics[cView.cid];
		
		this.itemViews.each(function (view) {
			metrics = this.metrics[view.cid];
			pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics, cMetrics));
			view.el.style[transformProperty] = (this.direction & Hammer.DIRECTION_HORIZONTAL)?
					"translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";
					// "translate(" + pos + "px,0)" : "translate(0," + pos + "px)";
					// "translateX(" + pos + "px)" : "translateY(" + pos + "px)";
		}, this);
		
		// this.el.classList.toggle("skip-transitions", skipTransitions);
		
		// cancel callback
		// this._scrollEndCancellable && this._scrollEndCancellable(false);
		
		if (skipTransitions) {
			this.el.classList.add("skip-transitions");
			// this._setScrolling(false);
		} else {
			this.el.classList.remove("skip-transitions");
			// if (this.el.classList.contains("disabled") !== this._enabled) {
			// 	this.el.classList.add("disabled-changing");
			// }
			// this._scrollEndCancellable = this.onTransitionEnd(this._selectedView.el,
			// 		transformStyleName, this._onScrollEnd, Globals.TRANSITION_DURATION * 2);
		}
		
		
		this.commitScrollSelection();
	},
	
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
	// 		if (this.direction & Hammer.DIRECTION_HORIZONTAL) {
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
	// 	this._scrollEndCancellable = void 0;
	// 	// this.el.classList.remove("disabled-changing");
	// 	if (exec) {
	// 		this._setScrolling(false);
	// 		// this.el.classList.remove("scrolling");
	// 		// this.trigger("view:scrollend");
	// 		console.log("%s::_onScrollEnd", this.cid);
	// 	}
	// },
	
	events: {
		"transitionend .carousel-item.selected": function(ev) {
			if (ev.propertyName === transformStyleName) {
				this._setScrolling(false);
				console.log("%s:::events[transitionend .carousel-item.selected] scroll end", this.cid);
			}
		},
		// "mousedown": function(ev) {
		// 	if (this._scrolling) {
		// 		this._panCapturedOffset = this.captureSelectedOffset();
		// 		console.log("%s::events[mousedown] scrolling interrupted (pos %f)", this.cid, this._panCapturedOffset);
		// 	}
		// },
		// "mouseup": function(ev) {
		// 	this._panCapturedOffset = 0;
		// },
	},
	
	_getScrollOffset: function (delta, mCurr, mSel, mCan) {
		var pos = mCurr.pos - mSel.pos + delta;
		var offset = 0;
		
		if (pos < 0) {
			if (Math.abs(pos) < mCurr.outer) {
				offset += (-mCurr.after) / mCurr.outer * pos;
			} else {
				offset += mCurr.after;
			}
		} else
		if (0 <= pos) {
			if (Math.abs(pos) < mCurr.outer) {
				offset -= mCurr.before / mCurr.outer * pos;
			} else {
				offset -= mCurr.before;
			}
		}
		return pos + offset;
	},
	
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
	
	commitScrollSelection: function () {
		if (this._scrollCandidateView !== void 0) {
			var view = this._scrollCandidateView;
			this._scrollCandidateView = void 0;
			view.el.classList.remove("candidate");
			
			this._internalSelection = true;
			if (view === this.emptyView) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:one", view.model);
			}
			this._internalSelection = false;
		}
	},
	
	/* --------------------------- *
	/* touch event: tap
	/* --------------------------- */
	
	/** @type {int} In pixels */
	_tapGrow: 10,
	
	_onTap: function (ev) {
		this.commitScrollSelection();
		
		var bounds = this.el.getBoundingClientRect();
		var tapX = ev.center.x - bounds.left;
		var tapY = ev.center.y - bounds.top;
		
		this._scrollCandidateView = this.getCandidateAtTapPos(
			this.dirProp(tapX, tapY),
			this.dirProp(tapY, tapX)
		);
		
		if (this._scrollCandidateView) {
			ev.preventDefault();
			this._scrollCandidateView.el.classList.add("candidate");
			this._setScrolling(true);
			this.scrollByNow(0, Carousel.ANIMATED);
		}
	},
	
	getCandidateAtTapPos: function(pos, posAcross) {
		if (this._tapAcrossBefore < posAcross && posAcross < this._tapAcrossAfter) {
			if (pos < this._tapBefore) {
				return this._precedingView;
			} else if (pos > this._tapAfter) {
				return this._followingView;
			}
		}
		return void 0;
	},
	
	/* --------------------------- *
	/* touch event: pan
	/* --------------------------- */
	
	_onPan: function (ev) {
		switch (ev.type) {
			case "panstart": return this._onPanStart(ev);
			case "panmove": return this._onPanMove(ev);
			case "panend": return this._onPanFinish(ev);
			case "pancancel": return this._onPanFinish(ev);
		}
	},
	
	// _panCapturedOffset: 0,
	
	/** @param {Object} ev */
	_onPanStart: function (ev) {
		// if (this._scrolling) {
		// 	this._panCapturedOffset = this.captureSelectedOffset();
		// 	console.log("%s::event[$s] captureSelectedOffset", this.cid, ev.type, this._panCapturedOffset);
		// }
		this.commitScrollSelection();
		
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.thresholdDeltaX : ev.thresholdDeltaY;
		// delta += this._panCapturedOffset;
		
		this.el.classList.add("panning");
		this._setScrolling(true);
		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},
	
	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var view = (ev.offsetDirection & this._precedingDir)? this._precedingView : this._followingView;
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.thresholdDeltaX : ev.thresholdDeltaY;
		// delta += this._panCapturedOffset;
		
		if (this._panCandidateView !== view) {
			this._panCandidateView && this._panCandidateView.el.classList.remove("candidate");
			this._panCandidateView = view;
			this._panCandidateView && this._panCandidateView.el.classList.add("candidate");
		}
		if (this._panCandidateView === void 0) {
			delta *= Globals.HPAN_OUT_DRAG;
		}
		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},
	
	/** @param {Object} ev */
	_onPanFinish: function (ev) {
		var view = (ev.offsetDirection & this._precedingDir)? this._precedingView : this._followingView;
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.deltaX : ev.deltaY;
		// delta += this._panCapturedOffset;
		
		if ((ev.type == "panend") &&
				// pan direction (last event) and offsetDirection (whole gesture) must match
				((ev.direction ^ ev.offsetDirection) & this.direction) &&
				// gesture must overshoot selectThreshold
				(Math.abs(delta) > this.selectThreshold)) {	
			// choose next scroll target
			this._scrollCandidateView = view;
		}
		if (this._panCandidateView && (this._panCandidateView !== this._scrollCandidateView)) {
			this._panCandidateView.el.classList.remove("candidate");
		}
		this.el.classList.remove("panning");
		// this._panCapturedOffset = 0;
		this._panCandidateView = void 0;
		
		this.scrollByNow(0, Carousel.ANIMATED);
	},

	/* --------------------------- *
	/* Model listeners
	/* --------------------------- */

	/** @private */
	_onReset: function () {
		this.createChildrenLater();
		this.render();
	},

	/** @private */
	_onSelectAny: function (model) {
		if (DEBUG) {
			if (this._selectedView === (model? this.itemViews.findByModel(model) : (this.emptyView || this.itemViews.first()))) {
				console.error("Carousel._onSelectAny: Select event triggered for model already selected");
			}
		}
		this._selectedView.el.classList.remove("selected");
		this.updateSelection();
		this._selectedView.el.classList.add("selected");
		if (this._internalSelection) {
			// console.log("Internal selection");
			return;
		}
		
		this._setScrolling(true);
		this.scrollByNow(0, Carousel.ANIMATED);
	},

	_onDeselectAny: function (model) {
		// this._selectedView.el.classList.remove("selected");
	},

	/* --------------------------- *
	/* Private
	/* --------------------------- */
	
	updateSelection: function () {
		var m, i = this.collection.selectedIndex;
		// assume -1 < index < this.collection.length
		if (this.emptyView) {
			this._selectedView = (m = this.collection.at(i)) ? this.itemViews.findByModel(m) : this.emptyView;
			this._precedingView = m && ((m = this.collection.at(i - 1)) ? this.itemViews.findByModel(m) : this.emptyView);
			this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
		} else {
			(i == -1) && i++;
			this._selectedView = (m = this.collection.at(i)) && this.itemViews.findByModel(m);
			this._precedingView = (m = this.collection.at(i - 1)) && this.itemViews.findByModel(m);
			this._followingView = (m = this.collection.at(i + 1)) && this.itemViews.findByModel(m);
		}
	},
};

module.exports = DeferredView.extend(CarouselProto, Carousel);
