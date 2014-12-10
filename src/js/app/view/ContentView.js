/*jslint nomen: true, vars: true, undef: true, eqeq: true, bitwise: true, sloppy: true, white: true */
/*global require, module*/

/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {jQuery.Deferred} */
var Deferred = Backbone.$.Deferred;

/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/view/Carousel} */
var Carousel = require("./Carousel");
/** @type {module:app/view/component/SelectableListView} */
var SelectableListView = require("./component/SelectableListView");
/** @type {module:app/view/component/CollectionStack} */
var CollectionStack = require("./component/CollectionStack");

/** @type {module:app/view/render/ImageRenderer} */
var ImageRenderer = require("./render/ImageRenderer");
/** @type {module:app/view/render/DotNavigationRenderer} */
var DotNavigationRenderer = require("./render/DotNavigationRenderer");

/** @type {Function} */
var bundleDescTemplate = require("./template/CollectionStack.Bundle.tpl");
/** @type {Function} */
var imageDescTemplate = require("./template/CollectionStack.Image.tpl");

/**
 * @constructor
 * @type {module:app/view/ContentView}
 */
var ContentView = Backbone.View.extend({

	/** Setup listening to model changes */
	initialize: function (options) {
		//		this.listenTo(Backbone, {
		//			"app:bundle:item": this.createChildren,
		//			"app:bundle:list": this.removeChildren
		//		});

		// content-detail (layout container)
		this.container = document.createElement("div");
		this.container.id = "content-detail";
		this.$el.append(this.container);

		// selected bundle description
		this.bundleDetail = new CollectionStack({
			id: "bundle-detail",
			collection: bundles,
//			model: bundles.selected,
			template: bundleDescTemplate,
		});
		this.bundleDetail.render().$el.appendTo(this.container);

		this.listenTo(bundles, "select:one", this.onSelectOne);
		this.listenTo(bundles, "deselect:one", this.onDeselectOne);

		if (bundles.selected) {
			this.createChildren(true);
		}

//		if (bundles.selected) {
//			this.onSelectFirst();
//		} else {
//			this.listenToOnce(bundles, "select:one", this.onSelectFirst);
//		}
	},

	/** @override */
	remove: function () {
		Backbone.View.prototype.remove.apply(this, arguments);
		if (bundles.selected) {
			this.removeChildren();
		}
		this.bundleDetail.remove();
		this.$el.remove(this.container);
	},

	/* -------------------------------
	 * Selection listeners
	 * ------------------------------- */

	onSelectOne: function () {
		this.createChildren();
	},

	onDeselectOne: function () {
		this.removeChildren();
	},

	/* -------------------------------
	 * Selection listeners
	 * ------------------------------- */

//	onSelectNone: function () {
//		this.removeChildren();
//		this.stopListening(bundles, "select:one", this.onSelectAnother);
//		this.listenToOnce(bundles, "select:one", this.onSelectFirst);
//	},
//
//	onSelectFirst: function () {
//		this.listenTo(bundles, "select:one", this.onSelectAnother);
//		this.listenToOnce(bundles, "select:none", this.onSelectNone);
//		this.createChildren();
//	},
//
//	onSelectAnother: function () {
//		this.removeChildren().done(this.createChildren);
//	},

	/* -------------------------------
	 * bundle/images Components
	 * ------------------------------- */

	removeChildren: function (skipAnimation) {
		this.stopListening(this.pager, "view:select:one");
		this.stopListening(this.carousel, "view:select:one");

//		var deferred = new Deferred();
		if (skipAnimation) {
			this.carousel.remove();
			this.pager.remove();
//			deferred.resolveWith(this);
		} else {
			this.pager.stopListening();
			this.carousel.stopListening();
			this.$([this.pager.el, this.carousel.el])
				.css({
					position: "absolute"
				})
				.transit({
					opacity: 0
				}, 300, "ease", _.bind(function (carousel, pager) {
					carousel.remove();
					pager.remove();
//					deferred.resolveWith(this);
				}, this, this.carousel, this.pager));
		}
		this.pager = void 0;
		this.carousel = void 0;
//		return deferred.promise();
	},

	createChildren: function (skipAnimation) {
		var images = bundles.selected.get("images");
		// dot nav
		this.pager = new SelectableListView({
			collection: images,
			renderer: DotNavigationRenderer,
		});
		this.listenTo(this.pager, "view:select:one", this._onChildSelect);
		// carousel
		this.carousel = new Carousel({
			collection: images,
			renderer: ImageRenderer,
		});
		this.listenTo(this.carousel, "view:select:one", this._onChildSelect);
		this.pager.$el.addClass("images-pager mutable-faded");

		this.pager.render().$el.appendTo(this.container);
		this.carousel.render().$el.appendTo(this.el);

//		var deferred = new Deferred();
		if (skipAnimation) {
//			deferred.resolveWith(this);
		} else {
			this.$([this.pager.el, this.carousel.el])
				.css({
					opacity: 0
				}).delay(700)
				.transit({
					opacity: 1
				}, 300);//, "ease", _.bind(deferred.resolveWith, deferred, this));
		}
//		return deferred.promise();
	},

	_onChildSelect: function (image) {
		controller.selectImage(image);
	},


});

module.exports = ContentView;
