/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("../control/TouchManager");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");

/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/model/collection/KeywordList} */
var keywords = require("../model/collection/KeywordList");
/** @type {module:app/model/collection/TypeList} */
var types = require("../model/collection/TypeList");

/** @type {module:app/helper/View} */
var View = require("../helper/View");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("./component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("./component/GroupingListView");
/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("./component/CollectionPager");

/** @type {module:app/helper/TransformHelper} */
var TransformHelper = require("../helper/TransformHelper");
/** @type {module:app/utils/event/addTransitionEndCommand} */
var addTransitionCallback = require("../utils/event/addTransitionCallback");

var getTransformProps = function(el) {
	var o = {};
	var s = window.getComputedStyle(el);
	var re = /trans(ition|form)/gi;
	for (var prop in s) {
		if (re.test(prop)) {
			o[prop] = s[prop];
		}
	}
	o["HAS_ATTRIBUTE"] = el.hasAttribute("style");
	return o;
};


/**
 * @constructor
 * @type {module:app/view/NavigationView}
 */
module.exports = View.extend({

	/** @override */
	className: "navigation",

	/** @override */
	initialize: function (options) {
		this.$sitename = this.$("#site-name");
		//this.$sitename.on("click", _.bind(this._onSitenameClick, this));
		this.$sitename.wrap("<div id=\"site-name-wrapper\" class=\"transform-wrapper\"></div>");

		this.bundlePager = this.createBundlePager();
		this.bundleList = this.createBundleList();
		this.keywordList = this.createKeywordList();

		this.transforms = new TransformHelper();

		var cancellable, $body = Backbone.$("body");
		this.listenTo(bundles, "deselect:one deselect:none", function() {
			if (cancellable) {
				cancellable();
				cancellable = void 0;
				$body.removeClass("entering-bundle");
			}
			if (this.transforms.hasTransition(this.keywordList.wrapper)) {
//				this.keywordList.$wrapper.css({"transition-delay": "2s"});
				$body.addClass("entering-bundle");
				cancellable = addTransitionCallback("transform", function() {
					cancellable = void 0;
//					this.keywordList.$wrapper.css({"transition-delay": ""});
					$body.removeClass("entering-bundle");
				}, this.keywordList.wrapper, this);
			} else {
			}
		});

		_.bindAll(this, "_onPanStart", "_onPanMove", "_onPanFinal", "_onVPanEnd");
		this.touch = TouchManager.getInstance();

		this.listenTo(bundles, {
			"deselect:none": this._onDeselectNone,
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone
		});
	},

	/** @override */
	remove: function () {
		/** this view is, as of now, never removed, so this method is never called */
		//this.$sitename.off("click");
		//this.touch.off("vpanstart", this._onVPanEnd);
		//this.touch.off("panstart", this._onPanStart);
		View.prototype.remove.apply(this, arguments);
	},

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	/**
	 * bundle-list
	 */
	createBundleList: function() {
		var view = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			// collapsed is set later by showBundleItem/showBundleList
			//collapsed: bundles.selected,
			collapsed: false,
			filterBy: keywords.selected,
			filterKey: "bIds",
//			filterFn: function () {
//				return keywords.selected? keywords.selected.get("bIds"): null;
//			},
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
//		view.wrapper = this.el.querySelector("#bundle-list-wrapper") ||
//				view.$el.wrap("<div id=\"bundle-list-wrapper\" class=\"transform-wrapper\"></div>")[0].parentElement;
		view.wrapper = view.el.parentElement;
		view.$wrapper = view.$el.parent();
		return view;
	},

	/**
	 * keyword-list
	 */
	createKeywordList: function() {
		var view = new GroupingListView({
			el: "#keyword-list",
			collection: keywords,
			collapsed: false,
			filterBy: bundles.selected,
			filterKey: "kIds",
			groupings: {
				collection: types,
				key: "tIds"
			},
//			filterFn: function () {
//				return bundles.selected? bundles.selected.get("kIds"): null;
//			},
//			groupingFn: function (item) {
//				return item.get("tIds");
//			},
		});

//		view.wrapper = this.el.querySelector("#keyword-list-wrapper") ||
//				view.$el.wrap("<div id=\"keyword-list-wrapper\" class=\"transform-wrapper\"></div>")[0].parentElement;
		view.wrapper = view.el.parentElement;
		view.$wrapper = view.$el.parent();
		return view;
	},

	/**
	 * bundle-pager
	 */
	createBundlePager: function() {
		// Component: bundle pager
		var view = new CollectionPager({
			id: "bundle-pager",
			className: "folio mutable-faded",
			collection: bundles,
			labelAttribute: "name",
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
		view.render().$el.appendTo(this.el);
		return view;
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	/** @override */
	render: function () {
//		(bundles.selected)? this._onSelectOne(): this._onSelectNone();

		this.transforms.release(this.keywordList.el);
		this.transforms.release(this.bundleList.el);
		this.transforms.release(this.keywordList.wrapper);

//		this.keywordList.renderNow();
//		this.bundleList.renderNow();
		return View.prototype.render.apply(this, arguments);
	},

	/* --------------------------- *
	 * Event handlers
	 * --------------------------- */

	/** @override */
	events: {
		"click #site-name a": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			controller.deselectBundle();
		}
	},

	_onSelectOne: function(bundle) {
		this.keywordList.filterBy(bundle);
	},

	_onSelectNone: function() {
		this.bundleList.setCollapsed(false);
		this.keywordList.setCollapsed(false);
		this.keywordList.filterBy(null);
		this.touch.off("vpanend", this._onVPanEnd);
		this.touch.off("panstart", this._onPanStart);
	},

	_onDeselectNone: function() {
		this.bundleList.setCollapsed(true);
		this.keywordList.setCollapsed(true);
		this.touch.on("vpanend", this._onVPanEnd);
		this.touch.on("panstart", this._onPanStart);
	},

	_onVPanEnd: function (ev) {
		if (ev.deltaY > 200 && this.bundleList.getCollapsed()) {
			this.bundleList.setCollapsed(false);
			this.keywordList.setCollapsed(false);
		}
		else if (ev.deltaY < 200 && !this.bundleList.getCollapsed()) {
			this.bundleList.setCollapsed(true);
			this.keywordList.setCollapsed(true);
		}
	},

	_onVPan: function (ev) {
		if (bundles.selectedIndex >= 0) {
			if (ev.type === "vpanmove" || ev.type === "vpanstart") {
				if (ev.type === "vpanstart") {
					this.touch.on("vpanmove vpanend vpancancel", this._onVPan);
					this.disableTransitions(this.bundleList.el);
					this.disableTransitions(this.keywordList.el);
					this.transforms.capture(this.bundleList.el);
					this.transforms.capture(this.keywordList.el);
				}
				var delta = (ev.deltaY + ev.thresholdOffsetY) * 0.25;
				this.transforms.move(this.bundleList.el, void 0, delta);
				this.transforms.move(this.keywordList.el, void 0, delta);
			} else if (ev.type === "vpanend" || ev.type === "vpancancel") {
				this.enableTransitions(this.bundleList.el);
				this.enableTransitions(this.keywordList.el);
				this.transforms.clear(this.bundleList.el);
				this.transforms.clear(this.keywordList.el);
				this.touch.off("vpanmove vpanend vpancancel", this._onVPan);
			}
		}
	},

	_onVPan_select: function (ev) {
		if (Math.abs(ev.deltaY) > 100) {
			if (bundles.selected.get("images").selected) {
				controller.deselectImage();
			} else if (ev.direction & Hammer.DIRECTION_DOWN && bundles.hasPreceding()) {
				controller.selectBundle(bundles.preceding());
			} else if (ev.direction & Hammer.DIRECTION_UP && bundles.hasFollowing()) {
				controller.selectBundle(bundles.following());
			} else {
				//controller.deselectBundle();
			}
		}
	},

	/* -------------------------------
	 * Touch/Move
	 * ------------------------------- */

	_onPanStart: function(ev) {
		if (bundles.selected.get("images").selectedIndex <= 0 && this.transforms.hasTransition(this.keywordList.wrapper)) {
			this.touch.on("panend pancancel", this._onPanFinal);
			this.touch.on("panmove", this._onPanMove);
			this.disableTransitions(this.keywordList.wrapper);
			this.transforms.capture(this.keywordList.wrapper);
			this._onPanMove(ev);
		}
	},

	_onPanMove: function(ev) {
		var delta = ev.deltaX + ev.thresholdOffsetX;
		if (bundles.selected.get("images").selectedIndex == -1) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? 0.4 : 0.75;
			//delta *= (delta > 0)? 0.40: 0.75;
		} else {//if (images.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? 0.75 : 0.0;
			//delta *= (delta > 0)? 0.75: 0.00;
		}
		this.transforms.move(this.keywordList.wrapper, delta);
	},

	_onPanFinal: function(ev) {
		this.enableTransitions(this.keywordList.wrapper);
		this.transforms.clear(this.keywordList.wrapper);
		this.touch.off("panmove", this._onPanMove);
		this.touch.off("panend pancancel", this._onPanFinal);
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	enableTransitions: function(el) {
		this.$el.removeClass("skip-transitions");
		//this.transforms._getTransform(el).$el.css({"transition": "", "-webkit-transition": ""});
	},

	disableTransitions: function(el) {
		this.$el.addClass("skip-transitions");
		//this.transforms._getTransform(el).$el.css({"transition": "none 0s 0s", "-webkit-transition": "none 0s 0s"});
	},

});
