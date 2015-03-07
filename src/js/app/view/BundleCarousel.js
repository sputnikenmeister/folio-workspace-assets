/**
 * @module app/view//BundleCarousel
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/helper/View} */
var View = require("../helper/View");
/** @type {module:app/view/component/Carousel} */
var Carousel = require("./component/Carousel");

/** @type {Function} */
var EmptyLeafCarouselRenderer = View.extend({
	/** @override */
	className: "carousel-item empty-item leaf-empty-item",
	/** @override */
	template: _.template("<div class=\"content sizing\"><%= desc %></div>"),
	/** @override */
	render: function() {
//		this.$el.html(this.template(this.model.attributes));
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

/**
 * @type {LeafCarouselRenderer}
 */
var LeafCarouselRenderer = View.extend({
	/** @override */
	className: "carousel-item leaf-carousel-item",
	/** @override */
	template: _.template("<div class=\"content sizing\"><%= desc %></div>"),
	/** @override */
	initialize: function (options) {
//		this.$el.html(this.template(this.model.attributes));
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
});

/**
 * @type {NestedCarouselRenderer}
 */
var NestedCarouselRenderer = Carousel.extend({
	/** @override */
	className: "carousel carousel-item nested-carousel-item",
	/** @override */
	renderer: LeafCarouselRenderer,
	/** @override */
	emptyRenderer: EmptyLeafCarouselRenderer,

	/** @override */
	initialize: function (options) {
//		this.collection = options.model.get("images");
		Carousel.prototype.initialize.apply(this, arguments);
//		controller.listenTo(this, {
//			"view:select:one": controller.selectImage,
//			"view:select:none": controller.deselectImage
//		});
		this.hammer.set({enable: false});
		// remove listener added in Carousel.prototype.initialize
		Backbone.$(window).off("orientationchange resize", this._onResize);
	},

	_getCSSTransformValue: function(pos) {
		return this.dirProp("translate(" + pos + "px,0)", "translate(0," + pos + "px)");
	},

	remove: function () {
//		controller.stopListening(this);
		Carousel.prototype.remove.apply(this);
	},
});

/**
 * @constructor
 * @type {module:app/view/BundleCarousel}
 */
var BundleCarousel = Carousel.extend({
	/** @override */
	className: "carousel bundle-carousel",
	/** @override */
//	renderer: LeafCarouselRenderer,
	renderer: NestedCarouselRenderer,

	/** @override */
	initialize: function (options) {
		options.direction = Carousel.DIRECTION_VERTICAL;
		Carousel.prototype.initialize.apply(this, arguments);
		controller.listenTo(this, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
	},

	remove: function () {
		controller.stopListening(this);
		Carousel.prototype.remove.apply(this);
	},

	/* --------------------------- *
	 * Create children
	 * --------------------------- */

	createChildView: function (model) {
		var view = new this.renderer({
			collection: model.get("images"),
			model: model,
//			hammer: this.createChildHammer(),
		});
		this.children.add(view);
		if (model.selected) {
			this.selectView(view);
		}
		return view;
	},

	removeChildView: function (view) {
		if (view.model.selected) {
			this.deselectView(view);
		}
		this.children.remove(view);
//		view.hammer.destroy();
		view.remove();
		return view;
	},

//	_getCSSTransformValue: function(pos) {
//		return this.dirProp("translate(" + pos + "px,0)", "translate(0," + pos + "px)");
//	},

	/* --------------------------- *
	 * selection handlers
	 * --------------------------- */

	/** @private */
	_onSelectOne: function (model) {
		var view = this.children.findByModel(model);
		if (view) {
			this.selectView(view);
			this.scrollByNow(0, Carousel.ANIMATED);
		} // else idem
		//Carousel.prototype._onSelectOne.apply(this, arguments);
	},

	/** @private */
	_onDeselectOne: function (model) {
		var view = this.children.findByModel(model);
		if (view) {
			this.deselectView(view);
		} // else if children have not been created yet, selection will be applied then
		//Carousel.prototype._onDeselectOne.apply(this, arguments);
	},

	selectView: function(view) {
		controller.listenTo(view, {
			"view:select:one": controller.selectImage,
			"view:select:none": controller.deselectImage
		});
		view.hammer.set({enable: true});
		this.hammer.get("pan").requireFailure(view.hammer.get("pan"));
		this.hammer.get("tap").requireFailure(view.hammer.get("tap"));
		view.$el.addClass("selected");
	},

	deselectView: function(view) {
		controller.stopListening(view);
		view.hammer.set({enable: false});
		this.hammer.get("pan").dropRequireFailure(view.hammer.get("pan"));
		this.hammer.get("tap").dropRequireFailure(view.hammer.get("tap"));
		view.$el.removeClass("selected");
	},

	/* --------------------------- *
	 * touch
	 * --------------------------- */

//	createChildHammer: function() {
//		var childHammer = new Hammer.Manager(this.el);
//		var childHammerPan = new Hammer.Pan({
//			direction: this.dirProp(Carousel.DIRECTION_VERTICAL, Carousel.DIRECTION_HORIZONTAL),
//			threshold: this.panThreshold,
//		});
////		this.hammerPan.requireFailure(childHammerPan);
//		childHammer.add([childHammerPan, this.hammer.get("tap")]);
//		childHammer.set({enable: false});
//		return childHammer;
//	},
//
//	createHammer: function() {
//		var hammer, hammerPan, hammerTap;
//
//		hammer = new Hammer.Manager(this.el);
//		hammerTap = new Hammer.Tap({
//			threshold: this.panThreshold / 2,
//			interval: 250, time: 200
//		});
//		hammerPan = new Hammer.Pan({
//			direction: this.direction,
//			threshold: this.panThreshold,
//		});
//		hammerTap.requireFailure(hammerPan);
//		hammer.add([hammerPan, hammerTap]);
//
//		this._hammerIsLocal = true;
//		return hammer;
//	},
});

module.exports = BundleCarousel;
