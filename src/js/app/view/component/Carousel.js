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

var cssToPx = function (cssVal, el) {
	return parseInt(cssVal);
};

/**
 * @constructor
 * @type {module:app/view/component/Carousel}
 */
var Carousel = DeferredView.extend({
	
	cidPrefix: "carousel",
	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel skip-transitions",
	/** @type {int} In pixels */
	selectThreshold: 20,
	/** @type {int} In pixels */
	panThreshold: 15,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,
	/** @type {Function} */
	renderer: CarouselRenderer.extend({ className: "carousel-item default-renderer"}),
	/** @type {Function} */
	emptyRenderer: CarouselRenderer.extend({ className: "carousel-item empty-item"}),
	
	/** @override */
	initialize: function (options) {
		_.bindAll(this, "_createChildren", "_measure", "_onPan", "_onTap");
		
		this.initializeHammer(options);
		
		options.template && (this.template = options.template);
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);
		_.isFunction(options.rendererFunction) && (this.rendererFunction = options.rendererFunction);
		
		// _.isNumber(options.gap) && (this.gap = options.gap);
		this.itemViews = new Container();
		this.childGap = this.dirProp(20, 18);
		this.metrics = {};
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
	
	/* --------------------------- *
	 * helper functions
	 * --------------------------- */
	
	dirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},
	
	/* --------------------------- *
	 * Render
	 * --------------------------- */
	
	render: function () {
		this.measureLater();
		this.scrollByLater(0, Carousel.IMMEDIATE);
		
		if (this.el.parentElement) {
			this.renderNow();
		}
		return this;
	},
	
	/** @override */
	renderLater: function () {
		this.validateRender("createChildren");
		this.validateRender("measure");
		this.validateRender("scrollBy");
		this.validateRender("enabled");
	},
	
	/* --------------------------- *
	/* Create children
	/* --------------------------- */
	
	createChildrenNow: function () {
		this._createChildren();
	},

	createChildrenLater: function () {
		this.requestRender("createChildren", this._createChildren);
	},
	
	_createChildren: function () {
		var buffer;
		var sIndex;
		this.removeChildren();
		if (this.collection.length) {
			buffer = document.createDocumentFragment();
			sIndex = this.collection.selectedIndex;
			if (this.emptyRenderer) {
				buffer.appendChild(this.createEmptyView().el);
			} else if (sIndex == -1) {
				sIndex = 0;
			}
			this.collection.each(function (item, index, arr) {
				buffer.appendChild(this.createItemView(
					this._getRenderer(item, index, arr), {model: item}, index, sIndex).el);
			}, this);
			this.el.appendChild(buffer);
		}
	},
	
	_getRenderer: function(item, index, arr) {
		return this.rendererFunction? this.rendererFunction(item, index, arr) : this.renderer;
	},
	
	createEmptyView: function () {
		return this.emptyView = this.createItemView(this.emptyRenderer,
				_.pick(this, Carousel.EMPTY_VIEW_OPTS), -1, this.collection.selectedIndex);
	},
	
	createItemView: function (renderer, opts, index, sIndex) {
		var view = new renderer(opts);
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
	 * measure
	 * --------------------------- */
	
	// var ORIENTED_PROPS = {
	// 	x: ["x", "y"],
	// 	y: ["y", "x"],
	// 	offsetLeft: ["offsetLeft", "offsetTop"],
	// 	offsetTop: ["offsetTop", "offsetLeft"],
	// 	offsetWidth: ["offsetWidth", "offsetHeight"],
	// 	offsetHeight: ["offsetHeight", "offsetWidth"],
	// };
	
	measureNow: function () {
		this._measure();
	},
	
	measureLater: function () {
		this.requestRender("measure", this._measure);
	},
	
	_measure: function() {
		var m, mm, pos = 0, posInner = 0;
		var maxAcross = 0, maxOuter = 0,
			maxOuterView, maxAcrossView;
			
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
			// m.outer = view.metrics[this.dirProp("maxWidth","maxHeight")] ||
			// 	view.metrics[this.dirProp("width","height")] ||
			// 	viewEl[this.dirProp("offsetWidth", "offsetHeight")];
			m.outer = viewEl[this.dirProp("offsetWidth", "offsetHeight")];
			m.outer += m.before;
			m.outer += view.metrics[this.dirProp("marginRight","marginBottom")];
			m.inner = view.metrics.content[this.dirProp("width","height")];
			m.before += view.metrics.content[this.dirProp("x","y")];
		} else {
			
			s = getComputedStyle(viewEl);
			m.before = cssToPx(s[this.dirProp("marginLeft","marginTop")]);
			m.outer = cssToPx(s[this.dirProp("maxWidth","maxHeight")]) ||
				cssToPx(s[this.dirProp("width","height")]) ||
				viewEl[this.dirProp("offsetWidth", "offsetHeight")];
			m.outer += m.before;
			m.outer += cssToPx(s[this.dirProp("marginRight","marginBottom")]);
			
			sizeEl = viewEl.querySelector(".sizing") || viewEl.firstChild;
			if (sizeEl) {
				m.inner = sizeEl[this.dirProp("offsetWidth", "offsetHeight")];
				m.before += sizeEl[this.dirProp("offsetLeft", "offsetTop")];
			} else {
				m.inner = m.outer;
				m.before = 0;
			}
		}
		m.after = m.outer - (m.inner + m.before);
		m.across = viewEl[this.dirProp("offsetHeight", "offsetWidth")];
		
		// m.before = cssToPx(s[this.dirProp("marginLeft","marginTop")]);
		// m.after = cssToPx(s[this.dirProp("marginRight","marginBottom")]);
		// m.inner =
		// 	cssToPx(s[this.dirProp("maxWidth","maxHeight")]) ||
		// 	cssToPx(s[this.dirProp("width","height")]) ||
		// 	viewEl[this.dirProp("offsetWidth", "offsetHeight")];
		// m.outer = m.before + m.inner + m.after;
		
		return m;
	},
	
	/* --------------------------- *
	 * enable/disable
	 * --------------------------- */
	
	/** @private */
	_enabled: undefined,
	
	/**
	 * @return {?Boolean}
	 */
	isEnabled: function () {
		return this._enabled;
	},
	
	/**
	 * @param {Boolean}
	 * @return {?Boolean}
	 */
	setEnabled: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			this.requestRender("enabled", this.renderEnabled.bind(this, enabled));
		}
	},
	setEnabledNow: function(enabled) {
		if (this._enabled !== enabled) {
			this._enabled = enabled;
			this.renderEnabled(enabled);
		}
	},

	/** @private */
	renderEnabled: function (enabled) {
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
	 * Scroll/layout
	 * --------------------------- */
	
	scrollByLater: function (delta, skipTransitions) {
		this.requestRender("scrollBy", this._scrollBy.bind(this, delta, skipTransitions));
	},
	
	scrollByNow: function (delta, skipTransitions) {
		this._scrollBy(delta, skipTransitions);
	},
	
	_scrollBy: function (delta, skipTransitions) {
		var metrics, sView, sMetrics, cView, cMetrics, pos, txProp;
		
		txProp = prefixedProperty("transform");
		sView = this._scrollCandidateView || this._selectedView;
		cView = this._panCandidateView || this._selectedView;
		sMetrics = this.metrics[sView.cid];
		cMetrics = this.metrics[cView.cid];
		
		this.itemViews.each(function (view) {
			metrics = this.metrics[view.cid];
			pos = Math.floor(this._getScrollOffset(delta, metrics, sMetrics, cMetrics));
			view.el.style[txProp] = (this.direction & Hammer.DIRECTION_HORIZONTAL)?
					// "translate3d(" + pos + "px,0,0)" : "translate3d(0," + pos + "px,0)";
					// "translate(" + pos + "px,0)" : "translate(0," + pos + "px)";
					"translateX(" + pos + "px)" : "translateY(" + pos + "px)";
		}, this);
		
		this.el.classList.toggle("skip-transitions", skipTransitions);
		
		// // cancel callback
		// this._scrollEndCancellable && this._scrollEndCancellable(false);
		// if (skipTransitions) {
		// 	this.el.classList.add("skip-transitions");
		// } else {
		// 	// if (this.el.classList.contains("disabled") !== this._enabled) {
		// 	// 	this.el.classList.add("disabled-changing");
		// 	// }
		// 	this.el.classList.remove("skip-transitions");
		// 	this._scrollEndCancellable = this.onTransitionEnd(this._selectedView.el,
		// 			prefixedStyleName("transform", this._selectedView.el), this._onScrollEnd, Globals.TRANSITION_DURATION * 2);
		// }
		
		this.commitScrollSelection();
	},
	
	// _onScrollEnd: function(exec) {
	// 	this._scrollEndCancellable = void 0;
	// 	// this.el.classList.remove("disabled-changing");
	// 	if (exec) {
	// 		// this.el.classList.remove("scrolling");
	// 		console.log("%s::_onScrollEnd", this.cid);
	// 	}
	// },
	
	events: {
		"transitionend .carousel-item.selected": function(ev) {
			if (ev.propertyName === prefixedStyleName("transform")) {
				this.el.classList.remove("scrolling");
				// console.log("%s::events ['%s']: .carousel-item.selected '%s'", this.cid, ev.type, ev.propertyName);
			}
		}
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
	 * touch event: tap
	 * --------------------------- */
	 
 	/** @type {int} In pixels */
 	_tapGrow: 10,
	
	_onTap: function (ev) {
		this.commitScrollSelection();
		
		var bounds = this.el.getBoundingClientRect();
		var tapX = ev.center.x - bounds.left;
		var tapY = ev.center.y - bounds.top;
		
		// console.log("Carousel.getTapCandidateAt [main] pos(%d) bounds(%d) range(%d - %d)",
		// 	pos, bounds[this.dirProp("left", "top")], this._tapBefore, this._tapAfter
		// );
		// var pp = posAcross - bounds[this.dirProp("top", "left")];
		// console.log("Carousel.getTapCandidateAt [across] ev+bounds(%d + %d = %d) range(%d - %d) pass?",
		// 	posAcross, bounds[this.dirProp("top", "left")], pp, 
		// 	this._tapAcrossBefore, this._tapAcrossAfter,
		// 	(this._tapAcrossBefore < pp && pp < this._tapAcrossAfter)
		// );
		
		this._scrollCandidateView = this.getTapCandidateAt(
			this.dirProp(tapX, tapY),
			this.dirProp(tapY, tapX)
		);
		
		if (this._scrollCandidateView) {
			ev.preventDefault();
			this._scrollCandidateView.el.classList.add("candidate");
			this.el.classList.add("scrolling");
			this.scrollByNow(0, Carousel.ANIMATED);
		}
	},
	
	getTapCandidateAt: function(pos, posAcross) {
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
	 * touch event: pan
	 * --------------------------- */
	
	_onPan: function (ev) {
		switch (ev.type) {
			case "panstart": return this._onPanStart(ev);
			case "panmove": return this._onPanMove(ev);
			case "panend": return this._onPanFinish(ev);
			case "pancancel": return this._onPanFinish(ev);
		}
	},
	
	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.commitScrollSelection();
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.thresholdDeltaX : ev.thresholdDeltaY;
		this.el.classList.add("panning");
		this.el.classList.add("scrolling");
		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},
	
	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.thresholdDeltaX : ev.thresholdDeltaY;
		var view = (ev.offsetDirection & this._precedingDir)? this._precedingView : this._followingView;
		
		if (this._panCandidateView !== view) {
			this._panCandidateView && this._panCandidateView.el.classList.remove("candidate");
			this._panCandidateView = view;
			this._panCandidateView && this._panCandidateView.el.classList.add("candidate");
		}
		if (this._panCandidateView === void 0) {
			delta *= Globals.H_PANOUT_DRAG;
		}
		this.scrollByNow(delta, Carousel.IMMEDIATE);
	},
	
	/** @param {Object} ev */
	_onPanFinish: function (ev) {
		var delta = this.direction & Hammer.DIRECTION_HORIZONTAL? ev.deltaX : ev.deltaY;
		var view = (ev.offsetDirection & this._precedingDir)? this._precedingView : this._followingView;
		if ((ev.type == "panend") &&
				// pan direction (last event) and offsetDirection (whole gesture) must match
				((ev.direction ^ ev.offsetDirection) & this.direction) &&
				// gesture must overshoot selectThreshold
				(Math.abs(delta) > this.selectThreshold)) {	
			// choose next scroll target
			this._scrollCandidateView = view;
		}
		// if (this._precedingView && (this._precedingView !== this._scrollCandidateView)) {
		// 	this._precedingView.el.classList.remove("candidate");
		// }
		// if (this._followingView && (this._followingView !== this._scrollCandidateView)) {
		// 	this._followingView.el.classList.remove("candidate");
		// }
		if (this._panCandidateView && (this._panCandidateView !== this._scrollCandidateView)) {
			this._panCandidateView.el.classList.remove("candidate");
		}
		this.el.classList.remove("panning");
		this._panCandidateView = void 0;
		
		this.scrollByNow(0, Carousel.ANIMATED);
	},

	/* --------------------------- *
	 * Model listeners
	 * --------------------------- */

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
		this.el.classList.add("scrolling");
		// this.scrollByLater(0, Carousel.ANIMATED);
		this.scrollByNow(0, Carousel.ANIMATED);
	},

	_onDeselectAny: function (model) {
		// this._selectedView.el.classList.remove("selected");
	},

	/* --------------------------- *
	 * Private
	 * --------------------------- */

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

	/*

	__updateSelection2: function () {
		if (this.collection.selectedIndex == -1) {
			this._selectedView = this.emptyView;
		} else {
			this._selectedView = this.itemViews.findByModel(this.collection.selected);
		}
		if (this.collection.selectedIndex == 0) {
			this._precedingView = this.emptyView;
		} else if (this.collection.hasPreceding()) {
			this._precedingView = this.itemViews.findByModel(this.collection.preceding());
		} else {
			this._precedingView = void 0;
		}
		if (this.collection.selectedIndex == -1) {
			this._followingView = this.itemViews.findByModel(this.collection.first());
		} else if (this.collection.hasFollowing()) {
			this._followingView = this.itemViews.findByModel(this.collection.following());
		} else {
			this._followingView = void 0;
		}
	},

	__updateSelection3: function (index) {
		if (index == -1) {
			this._selectedView = this.emptyView;
		} else {
			this._selectedView = this.itemViews.findByModel(this.collection.at(index));
		}
		if (index == 0) {
			this._precedingView = this.emptyView;
		} else if (index > 0) {
			this._precedingView = this.itemViews.findByModel(this.collection.at(index - 1));
		} else {
			this._precedingView = void 0;
		}
		if (index == -1) {
			this._followingView = this.itemViews.findByModel(this.collection.first());
		} else if (index < this.collection.length - 1) {
			this._followingView = this.itemViews.findByModel(this.collection.at(index + 1));
		} else {
			this._followingView = void 0;
		}
	},

	__dispatchSelectionEvent: function (view) {
		if (view) {
			if (view === this.emptyView) {
				this.trigger("view:select:none");
			} else {
				this.trigger("view:select:one", view.model);
			}
		}
	},

	__dispatchSelectionEvent: function(direction) {
		var item;
		direction &= this.direction;
		if (direction & Carousel.DIRECTION_BEFORE) {
			if (this.collection.selectedIndex == 0) {
				this.trigger("view:select:none");
			} else {
				item = this.collection.preceding();
			}
		} else if (direction & Carousel.DIRECTION_AFTER) {
			if (this.collection.selectedIndex == -1) {
				item = this.collection.first();
			} else {
				item = this.collection.following();
			}
		}
		if (item) {
			this.trigger("view:select:one", item);
		}
	},
	*/

},{
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
	/** used in crateEmptyItemView */
	EMPTY_VIEW_OPTS: ["model", "collection", "template"],
	
	defaultRenderer: CarouselRenderer

});

module.exports = Carousel;
