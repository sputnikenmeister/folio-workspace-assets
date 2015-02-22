/**
 * @module app/view/component/Carousel
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:backbone.babysitter} */
var Container = require("backbone.babysitter");

/** @type {module:app/helper/View} */
var View = require("../../helper/View");
/** @type {module:app/helper/DeferredRenderView} */
var DeferredRenderView = require("../../helper/DeferredRenderView");
/** @type {module:app/view/render/CarouselDefaultRenderer} */
var CarouselDefaultRenderer = require("../render/CarouselDefaultRenderer");
/** @type {module:app/view/render/CarouselEmptyRenderer} */
var CarouselEmptyRenderer = require("../render/CarouselEmptyRenderer");

var ANIMATED = false;
var IMMEDIATE = true;

/**
 * @constructor
 * @type {module:app/view/component/Carousel}
 */
var Carousel = DeferredRenderView.extend({

	/** @override */
	tagName: "div",
	/** @override */
	className: "carousel skip-transitions",
	/** @type {int} In pixels */
	tapAreaGrow: 100,
	/** @type {int} In pixels */
	selectThreshold: 30,
	/** @type {int} In pixels */
	panThreshold: 15,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,
	/** @type {Function} */
	renderer: CarouselDefaultRenderer,
	/** @type {Function} */
	emptyRenderer: CarouselEmptyRenderer,

	/** @override */
	initialize: function (options) {
		_.isNumber(options.gap) && (this.gap = options.gap);
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);
		if (options.direction === Hammer.DIRECTION_VERTICAL) {
			this.direction = Hammer.DIRECTION_VERTICAL;
		}
		this.childSizes = {};
		this.children = new Container();
		this.skipTransitions = true;

		_.bindAll(this, "_onTouch", "_onResize");
		this.hammer = (options.hammer)? options.hammer : this.createHammer();
		this.hammer.on("panstart panmove panend pancancel tap", this._onTouch);
		Backbone.$(window).on("orientationchange resize", this._onResize);

		this.listenTo(this.collection, {
			"reset": this._onCollectionReset,
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			"deselect:one": this._onDeselectOne,
		});
	},

	remove: function () {
		Backbone.$(window).off("orientationchange resize", this._onResize);
		this.hammer.off("panstart panmove panend pancancel tap", this._onTouch);
		if (this._hammerIsLocal) this.hammer.destroy();
		this.removeChildren();
		DeferredRenderView.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * Hammer events
	 * --------------------------- */

	createHammer: function() {
		var hammer, hammerPan, hammerTap;

		hammer = new Hammer.Manager(this.el);
		hammerPan = new Hammer.Pan({
			direction: this.direction,
			threshold: this.panThreshold,
		});
		hammerTap = new Hammer.Tap({
			threshold: this.panThreshold / 2,
			interval: 250, time: 200
		});
		hammerTap.requireFailure(hammerPan);
		hammer.add([hammerPan, hammerTap]);

		this._hammerIsLocal = true;
		return hammer;
	},

	_onTouch: function (ev) {
//		ev.defaultPrevented ||
		ev.preventDefault();
		switch (ev.type) {
			case "panstart":	return this._onPanStart(ev);
			case "panmove":		return this._onPanMove(ev);
			case "panend":		return this._onPanEnd(ev);
			case "pancancel": 	return this._onPanCancel(ev);
			case "tap": 		return this._onTap(ev);
		}
	},

	_onTap: function (ev) {
		var pos = ev.center[this.dirProp("x", "y")];
		var item;
		if (pos < this.tapAreaBefore) {
			if (this.collection.selectedIndex == 0) {
				this.trigger("view:select:none");
			} else {
				item = this.collection.preceding();
			}
		} else
		if (pos > this.tapAreaAfter) {
			if (this.collection.selectedIndex == -1) {
				item = this.collection.first();
			} else {
				item = this.collection.following();
			}
		}
		if (item) {
			this.trigger("view:select:one", item);
		}
		// else if { /* out of bounds */ }
	},

	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.$el.addClass("panning");
		this.candidateChild = this.candidateModel = this.indexDelta = void 0;
		this.thresholdOffset = (this.getEventDelta(ev) < 0)? this.panThreshold : -this.panThreshold;
	},

	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var delta = this.getEventDelta(ev) + this.thresholdOffset;
		var indexDelta = (delta < 0)? 1 : -1;
		var dirChanged = (this.indexDelta != indexDelta);
		if (dirChanged) {
			this.indexDelta = indexDelta;
			if (this.candidateChild) {
				this.candidateChild.$el.removeClass("candidate");
				this.candidateChild = void 0;
			}
		}
		// when at first or last index, add feedback to gesture
		if (this.isOutOfBounds(delta)) {
			delta *= 0.4;
		} else if (dirChanged) {
			this.candidateModel = this.collection.at(this.collection.selectedIndex + indexDelta);
			this.candidateChild = this.candidateModel? this.children.findByModel(this.candidateModel): this.emptyChild;
			this.candidateChild.$el.addClass("candidate");
		}
		this.scrollByNow(delta, IMMEDIATE);
	},

	/** @param {Object} ev */
	_onPanEnd: function (ev) {
		var delta = this.getEventDelta(ev) + this.thresholdOffset;
		// If beyond select threshold, trigger selection
		if (Math.abs(delta) > this.selectThreshold && !this.isOutOfBounds(delta)) {
			var item = this.candidateModel;
//			var item = this.collection.at(this.collection.selectedIndex + (delta < 0? 1: -1));
			if (item) {
				this.trigger("view:select:one", item);
			} else {
				this.trigger("view:select:none");
			}
		} else {
			this.scrollByLater(0, ANIMATED);
		}
		this._afterPan();
	},

	/** @param {Object} ev */
	_onPanCancel: function (ev) {
		this.scrollByLater(0, ANIMATED);
		this._afterPan();
	},

	/* --------------------------- *
	 * event helper functions
	 * --------------------------- */

	_afterPan: function() {
		if (this.candidateChild) {
			this.candidateChild.$el.removeClass("candidate");
		}
		this.$el.removeClass("panning");
//		this.panning = false;
	},

	getEventDelta: function (ev) {
		var delta = (this.direction & Hammer.DIRECTION_HORIZONTAL)? ev.deltaX : ev.deltaY;
		return delta;
	},

	isOutOfBounds: function (delta) {
		return (this.collection.selectedIndex == -1 && delta > 0) ||
			(this.collection.selectedIndex == this.collection.length - 1 && delta < 0);
	},

	/* --------------------------- *
	 * Model listeners
	 * --------------------------- */

	/** @private */
	_onCollectionReset: function () {
		this._resetPending = true;
		this.render();
	},

	/** @private */
	_onDeselectOne: function (model) {
		var child = this.children.findByModel(model);
		if (child) {
			child.$el.removeClass("selected");
		} // else if children have not been created yet, selection will be applied then
	},

	/** @private */
	_onSelectOne: function (model) {
		var child = this.children.findByModel(model);
		if (child) {
			child.$el.addClass("selected");
			this.scrollByNow(0, ANIMATED);
		} // else idem
	},

	/** @private */
	_onSelectNone: function () {
		if (this.emptyChild) {
			this.selectEmptyChildView();
			this.scrollByNow(0, ANIMATED);
		} // else idem
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function () {
		if (this.el.parentElement) {
			this.createChildrenNow();
			this.scrollByNow(0, IMMEDIATE);
		} else {
			this.createChildrenLater();
			this.scrollByLater(0, IMMEDIATE);
		}
		return this;
	},

	/** @override */
	renderLater: function () {
		this.validateRender("createChildren");
		this.validateRender("scrollBy");
		this.skipTransitions = false;
	},

	/* --------------------------- *
	 * render selection
	 * --------------------------- */

	selectEmptyChildView: function () {
		this.emptyChild.$el.addClass("selected");
		this.listenToOnce(this.collection, "select:one", function(model) {
			this.emptyChild.$el.removeClass("selected");
		});
	},

	/* --------------------------- *
	 * Create children
	 * --------------------------- */

	createEmptyChildView: function () {
		var child = new this.emptyRenderer({});
		this.emptyChild = child;
		this.children.add(child);
		if (this.collection.selectedIndex == -1) {
			this.selectEmptyChildView();
		}
		return child;
	},

	createChildView: function (item) {
		var child = new this.renderer({
			model: item
		});
		this.children.add(child);
		if (item.selected) {
			child.$el.addClass("selected");
		}
		return child;
	},

	removeChildView: function (view) {
		this.children.remove(view);
		view.remove();
		return view;
	},

	_createChildren: function () {
		var buffer;
		if (this._resetPending) {
			this.removeChildren();
			this._resetPending = false;
		}
		if (this.collection.length) {
			buffer = document.createDocumentFragment();
			buffer.appendChild(this.createEmptyChildView().el);
			this.collection.each(function (item, index) {
				buffer.appendChild(this.createChildView(item, index).el);
			}, this);
			this.$el.prepend(buffer);
//			this.$el.append(buffer);
		}
		this.measure();
	},
	createChildrenNow: function () {
		this._createChildren();
	},
	createChildrenLater: function () {
		this.requestRender("createChildren", _.bind(this._createChildren, this));
	},

	removeChildren: function () {
		this.children.each(this.removeChildView, this);
	},

	/* --------------------------- *
	 * resize
	 * --------------------------- */

	/** @param {Object} ev */
	_onResize: function (ev) {
		this.measure();
		this.scrollByNow(0, IMMEDIATE);
	},

	measure: function() {
		var size, pos = 0, maxAcross = 0, maxSize = 0;
		var measure = function(child) {
			size = this.measureChild(child.render());
			size.pos = pos;
			pos += size.outer + 20;// + (this.gap || Math.min(size.before, size.after));
			if (child !== this.emptyChild) {
				maxAcross = Math.max(maxAcross, size.across);
				maxSize = Math.max(maxSize, size.outer);
			}
		};
		this.children.each(measure, this);

		//tap area
		this.tapAreaBefore = this.emptyChild.el[this.dirProp("offsetLeft", "offsetTop")];
		this.tapAreaAfter = this.tapAreaBefore + this.emptyChild.el[this.dirProp("offsetWidth", "offsetHeight")];
		this.tapAreaBefore += this.tapAreaGrow;
		this.tapAreaAfter -= this.tapAreaGrow;

		this.containerSize = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		this.selectThreshold = Math.min(this.selectThreshold, this.containerSize * 0.1);

//		this.$(this.hammer.element).css(this.dirProp({width: maxSize, height: maxAcross }, {width: maxAcross, height: maxSize}));
//		this.$el.css(this.dirProp("minHeight", "minWidth"), (maxAcross > 0)? maxAcross: "");
	},

	measureChild: function (child) {
		var sizes = {};
		var childEl = child.el;
		var contentEl = childEl.querySelector(".sizing");
//		var contentEl = childEl.firstChild;
//		var contentEl = child.$(".sizing")[0];

		sizes.outer = childEl[this.dirProp("offsetWidth", "offsetHeight")];
		sizes.across = childEl[this.dirProp("offsetHeight", "offsetWidth")];

		if (contentEl) {
			sizes.inner = contentEl[this.dirProp("offsetWidth", "offsetHeight")];
			sizes.before = contentEl[this.dirProp("offsetLeft", "offsetTop")];
			sizes.after = sizes.outer - (sizes.inner + sizes.before);
		} else {
			sizes.inner = sizes.outer;
			sizes.before = 0;
			sizes.after = 0;
		}
		return this.childSizes[child.cid] = sizes;
	},

	/* --------------------------- *
	 * Scroll/layout
	 * --------------------------- */

	scrollByLater: function (delta, skipTransitions) {
		_.isBoolean(skipTransitions) || (skipTransitions = this.skipTransitions);
		if (!skipTransitions) {
			this.$el.addClass("scrolling");
		}
		this.requestRender("scrollBy", _.bind(this._scrollBy, this, delta, skipTransitions));
	},

	scrollByNow: function (delta, skipTransitions) {
		_.isBoolean(skipTransitions) || (skipTransitions = this.skipTransitions);
		if (!skipTransitions) {
			this.$el.addClass("scrolling");
		}
		this._scrollBy(delta, skipTransitions);
	},

	_scrollBy: function (delta, skipTransitions) {
		var sChild, sSizes, child, sizes, pos, txVal;
		var applyScroll, scrollEndHandler, scrollEndAction;

		sChild = this.collection.selected? this.children.findByModel(this.collection.selected): this.emptyChild;
		sSizes = this.childSizes[sChild.cid];

		if (skipTransitions) {
			this.$el.addClass("skip-transitions");
		} else {
			this.$el.removeClass("skip-transitions");
			scrollEndHandler = function(ev) {
				if (ev.originalEvent.propertyName == "transform") {
					scrollEndAction();
				}
			};
			scrollEndAction = function() {
				sChild.$el.off("webkittransitionend transitionend", scrollEndHandler);
				this.$el.removeClass("scrolling");
			};
			scrollEndAction = _.once(_.bind(scrollEndAction, this));
			sChild.$el.on("webkittransitionend transitionend", scrollEndHandler);
			_.delay(scrollEndAction, 1000);
		}

		applyScroll = function (child) {
			sizes = this.childSizes[child.cid];
			pos = this._getScrollOffset(sizes, sSizes, delta);

			txVal = this._getTransformValue(pos);
			child.el.style.webkitTransform = txVal;
			child.el.style.mozTransform = txVal;
			child.el.style.transform = txVal;
		};
		this.children.each(applyScroll, this);
	},

	_getTransformValue: function(pos) {
		return this.dirProp("translate3d(" + pos + "px,0,0)", "translate3d(0," + pos + "px,0)");
	},

	_getScrollOffset: function (s, ss, delta) {
		var pos = s.pos - ss.pos + delta;
		var offset = 0;

		if (pos < 0) {
			if (Math.abs(pos) < s.outer) {
				offset += (-s.after) / s.outer * pos;
			} else {
				offset += s.after;
			}
		} else
		if (0 <= pos) {
			if (Math.abs(pos) < s.outer) {
				offset -= s.before / s.outer * pos;
			} else {
				offset -= s.before;
			}
		}
		return pos + offset;
	},

//	_scrollChildTo: function (view, pos, skipTransitions) {
//		var duration = 400;
//		var translate = this.dirProp("translate3d(" + pos + "px,0,0)", "translate3d(0," + pos + "px,0)");
//
//		view.$el.stop();
//		if (skipTransitions) {
//			view.$el.css({ transform: translate });
//		} else {
//			view.$el.transit({ transform: translate }, duration);
//		}
//	},

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

	dirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},
}, {
	DIRECTION_VERTICAL: Hammer.DIRECTION_VERTICAL,
	DIRECTION_HORIZONTAL: Hammer.DIRECTION_HORIZONTAL,
});

module.exports = Carousel;
