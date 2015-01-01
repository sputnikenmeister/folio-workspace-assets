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
/** @type {module:app/view/render/DefaultCarouselRenderer} */
var DefaultCarouselRenderer = require("../render/DefaultCarouselRenderer");
/** @type {module:app/view/render/EmptyCarouselRenderer} */
var EmptyCarouselRenderer = require("../render/EmptyCarouselRenderer");

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
	className: "carousel",
	/** @type {int} In pixels */
	selectThreshold: 65,
	/** @type {int} In pixels */
	panThreshold: 15,
	/** @type {int} */
	direction: Hammer.DIRECTION_HORIZONTAL,
	/** @type {Function} */
	renderer: DefaultCarouselRenderer,
	/** @type {Function} */
	emptyRenderer: EmptyCarouselRenderer,

	/** @override */
	initialize: function (options) {
		if (options.direction === Hammer.DIRECTION_VERTICAL) this.direction = Hammer.DIRECTION_VERTICAL;
		options.renderer && (this.renderer = options.renderer);
		options.emptyRenderer && (this.emptyRenderer = options.emptyRenderer);

		this.children = new Container();

		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Pan({
			direction: this.direction,
			threshold: this.panThreshold,
		}));

		_.bindAll(this, "_onPanStart", "_onPanMove", "_onPanEnd", "_onPanCancel");
		this.hammer.on("panstart", this._onPanStart);
		this.hammer.on("panmove", this._onPanMove);
		this.hammer.on("panend", this._onPanEnd);
		this.hammer.on("pancancel", this._onPanCancel);

		_.bindAll(this, "_onResize");
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
		this.hammer.off("panstart panmove panend pancancel");
		this.hammer.destroy();
		this.removeChildren();
		DeferredRenderView.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * Hammer events
	 * --------------------------- */

	/** @param {Object} ev */
	_onPanStart: function (ev) {
		this.children.each(function(view) {
			view.$el.clearQueue();
		});
		this.thresholdOffset = (this.getEventDelta(ev) < 0)? this.panThreshold : -this.panThreshold;
		this._onPanMove(ev);
	},

	/** @param {Object} ev */
	_onPanMove: function (ev) {
		var indexDelta, dirChanged;
		var delta = this.getEventDelta(ev) + this.thresholdOffset;
		indexDelta = (delta < 0)? 1:-1;

		if (dirChanged = (this.indexDelta != indexDelta)) {
			this.indexDelta = indexDelta;
		}
		// when at first or last index, add feedback to gesture
		if (this.isOutOfBounds(delta)) {
			delta *= 0.2;
			if (dirChanged && this.candidateChild) {
				this.candidateChild.$el.removeClass("candidate");
				delete this.candidateChild;
			}
		} else if (dirChanged) {
			var child;
			if (delta < 0) {
				if (this.collection.selectedIndex == -1) {
					child = this.children.findByIndex(0);
				} else {
					child = this.children.findByIndex(this.collection.selectedIndex + 1);
				}
			} else {
				if (this.collection.selectedIndex == 0) {
					child = this.emptyChild;
				} else {
					child = this.children.findByIndex(this.collection.selectedIndex - 1);
				}
			}
			if (this.candidateChild) {
				this.candidateChild.$el.removeClass("candidate");
			}
			this.candidateChild = child;
			this.candidateChild.$el.addClass("candidate");
		}
		this.scrollByNow(delta, IMMEDIATE);

	},

	/** @param {Object} ev */
	_onPanCancel: function (ev) {
		this.scrollByLater(0, ANIMATED);
		this.cleanupAfterPan();
	},

	/** @param {Object} ev */
	_onPanEnd: function (ev) {
		var delta = this.getEventDelta(ev) + this.thresholdOffset;

		// If beyond select threshold, trigger selection
		if (Math.abs(delta) > this.selectThreshold && !this.isOutOfBounds(delta)) {
			var item;
			if (delta < 0) {
				if (this.collection.selectedIndex == -1) {
					item = this.collection.first();
				} else {
					item = this.collection.following();
				}
			} else {
				item = this.collection.preceding();
			}
			if (item) {
				this.trigger("view:select:one", item);
			} else {
				this.trigger("view:select:none");
			}
		} else {
			this.scrollByLater(0, ANIMATED);
		}
		this.cleanupAfterPan();
	},

	/* --------------------------- *
	 * event helper functions
	 * --------------------------- */

	getEventDelta: function (ev) {
		var delta = 0;
		delta += (this.direction & Hammer.DIRECTION_HORIZONTAL)? ev.deltaX : ev.deltaY;
		return delta;
	},

	cleanupAfterPan: function() {
		if (this.candidateChild) {
			this.candidateChild.$el.removeClass("candidate");
			delete this.candidateChild;
		}
		delete this.indexDelta;
		delete this.thresholdOffset;
	},

	isOutOfBounds: function (delta) {
		return (this.collection.selectedIndex == -1 && delta > 0) ||
			(this.collection.selectedIndex == this.collection.length - 1 && delta < 0);
	},

	/* --------------------------- *
	 * Model listeners
	 * --------------------------- */

	/* Model event handlers */
	_onCollectionReset: function () {
		this._resetPending = true;
		this.render();
	},

	_onDeselectOne: function (model) {
		this.children.findByModel(model).$el.removeClass("selected");
	},

	/** @private */
	_onSelectOne: function (model) {
		this.children.findByModel(model).$el.addClass("selected");
		this.scrollByLater(0, ANIMATED);
	},

	/** @private */
	_onSelectNone: function () {
		this.selectEmptyView();
		this.scrollByLater(0, ANIMATED);
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
		this.skipAnimation = false;
	},

	/* --------------------------- *
	 * Create children
	 * --------------------------- */

	selectEmptyView: function () {
		this.emptyChild.$el.addClass("selected");
		this.listenToOnce(this.collection, "select:one", function(model) {
			this.emptyChild.$el.removeClass("selected");
		});
	},

	createEmptyChildView: function () {
		this.emptyChild = new this.emptyRenderer({
			collection: this.collection
		});
		if (!this.collection.selected) {
			this.selectEmptyView();
		}
		return this.emptyChild;
	},

	removeEmptyChildView: function () {
		if (this.emptyChild) {
			this.emptyChild.remove();
			delete this.emptyChild;
		} else {
			console.warn("Carousel.removeEmptyChildView called while emptyChild is undefined");
		}
	},

	createChildView: function (item) {
		var child = new this.renderer({
			model: item
		});
		this.children.add(child);
		if (item.selected) {
			this.children.findByModel(item).$el.addClass("selected");
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
			this.$el.append(buffer);
		}
		this.updateSize();
	},
	createChildrenNow: function () {
		this._createChildren();
	},
	createChildrenLater: function () {
		this.requestRender("createChildren", _.bind(this._createChildren, this));
	},

	removeChildren: function () {
		this.removeEmptyChildView();
		this.children.each(this.removeChildView, this);
	},

	/* --------------------------- *
	 * resize
	 * --------------------------- */

	_childSizes: {},

	/** @param {Object} ev */
	_onResize: function (ev) {
		this.updateSize();
		this.scrollByNow(0, IMMEDIATE);
	},

	updateSize: function() {
		var size, pos = 0, maxAcross = 0;
		var measure = function(child) {
			size = this.measureChild(child.render());
			size.pos = pos;
			pos += size.outer;
			maxAcross = Math.max(maxAcross, size.across);
		};

		measure.call(this, this.emptyChild);
		maxAcross = 0; // Reset maxAcross to ignore emptyChild's across size
		this.children.each(measure, this);

		this.containerSize = this.el[this.dirProp("offsetWidth", "offsetHeight")];
		this.$el.css(this.dirProp("minHeight", "minWidth"), (maxAcross > 0)? maxAcross: "");
	},

	measureChild: function(child) {
		var sizes = {};
		var childEl = child.el;
		var contentEl = childEl.firstChild;

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
		return this._childSizes[child.cid] = sizes;
	},

	/* --------------------------- *
	 * Scroll/layout
	 * --------------------------- */

	scrollByLater: function (delta, skipAnimation) {
		_.isBoolean(skipAnimation) && (this.skipAnimation = this.skipAnimation || skipAnimation);
		this.requestRender("scrollBy", _.bind(this._scrollBy, this, delta));
	},

	scrollByNow: function (delta, skipAnimation) {
		this._scrollBy(delta, _.isBoolean(skipAnimation)? skipAnimation : this.skipAnimation);
	},

	_scrollBy: function (delta, skipAnimation) {
		var sChild, sSizes, child, sizes, pos;
		sChild = this.collection.selected? this.children.findByModel(this.collection.selected): this.emptyChild;
		sSizes = this._childSizes[sChild.cid];

		var scroll = _.bind(function (child) {
			sizes = this._childSizes[child.cid];
			pos = this._getScrollOffset(sizes, sSizes, delta);
			this._scrollChildTo(child, pos, skipAnimation);
		}, this);

		scroll(this.emptyChild);
		this.collection.each(function (model, index) {
			scroll(this.children.findByModel(model));
		}, this);
	},

	_getScrollOffset: function (s, ss, delta) {
		var pos = s.pos - ss.pos + delta;
		var offset = 0;

		if (0 > pos) {
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

	_scrollChildTo: function (view, pos, skipAnimation) {
		var duration = 400;
		var translate = this.dirProp("translate3d(" + pos + "px,0,0)", "translate3d(0," + pos + "px,0)");
		if (skipAnimation) {
			view.$el.css({ transform: translate });
		} else {
			view.$el.transit({ transform: translate }, duration);
		}
	},

	/* --------------------------- *
	 * helper functions
	 * --------------------------- */

	dirProp: function (hProp, vProp) {
		return (this.direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp;
	},
});

module.exports = Carousel;
