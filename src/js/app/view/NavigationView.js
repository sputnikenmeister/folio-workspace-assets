/**
 * @module app/view/NavigationView
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;
/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");

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

/** @type {module:app/view/base/View} */
// var View = require("./base/View");
/** @type {module:app/view/base/ContainerView} */
var ContainerView = require("./base/ContainerView");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("./component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("./component/GroupingListView");
/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("./component/CollectionPager");

var COLLAPSE_THRESHOLD = 100;
var PAN_OVERSHOOT_FACTOR = 0.05;
var PAN_MOVE_FACTOR = 0.15;

/**
 * @constructor
 * @type {module:app/view/NavigationView}
 */
module.exports = ContainerView.extend({

	/** @override */
	className: "navigation expanded",

	/** @override */
	initialize: function (options) {
		_.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal", "_onVPanEnd");
		//_.bindAll(this, "_onVPanFinal", "_onVPan");
		this.touch = TouchManager.getInstance();

		_.bindAll(this, "_onSitenameClick");

		this.$sitename = this.$("#site-name");
		this.$sitename.on("click", this._onSitenameClick);
		this.$sitename.wrap("<div id=\"site-name-wrapper\" class=\"transform-wrapper\"></div>");

		// this.bundlePager = this.createBundlePager();
		this.bundleList = this.createBundleList();
		this.keywordList = this.createKeywordList();
		// this.bundleList.renderNow();
		// this.keywordList.renderNow();

		this.children = [this.bundleList, this.keywordList];

		// this.$hTransitionables = this.$(".transform-wrapper, .grouped .list-group span");
		// this.$vTransitionables = this.$(".filterable");
		this.vTransitionables = this.el.querySelectorAll("#site-name, .filterable");
		this.hTransitionables = this.el.querySelectorAll(
			"#bundle-list-wrapper, #keyword-list-wrapper, .grouped .list-group span");

		this._collapsedOffsetY = 300;
		this.addTransitionHandlers();
		// this.initializeResizeHandlers();

		this.listenTo(bundles, {
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			// "deselect:one": this._onDeselectOne,
			"deselect:none": this._onDeselectNone,
		});
		//(bundles.selected)? this._onDeselectNone(): this._onSelectNone();
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	/** @override */
	render: function () {
		_.each(this.children, function(view) {
			this.transforms.release(view.el);
			this.transforms.release(view.wrapper);
		}, this);

		return ContainerView.prototype.render.apply(this, arguments);
	},

	/* --------------------------- *
	 * Model event handlers
	 * --------------------------- */

	_onSelectOne: function(bundle) {
		this.setCollapsed(true);
		this.keywordList.filterBy(bundle);
	},

	_onSelectNone: function() {
		this.setCollapsed(false);
		this.keywordList.filterBy(null);
		this.touch.off("panstart", this._onHPanStart);
		this.touch.off("vpanstart", this._onVPanStart);
	},

	_onDeselectOne: function(bundle) {
	},

	_onDeselectNone: function() {
		this.setCollapsed(true);
		this.touch.on("panstart", this._onHPanStart);
		this.touch.on("vpanstart", this._onVPanStart);
	},

	/* --------------------------- *
	 * jQuery/DOM event handlers
	 * --------------------------- */

	/** @override */
	_onSitenameClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		controller.deselectBundle();
	},

	/* -------------------------------
	 * Horizontal touch/move (_onHPan*)
	 * ------------------------------- */

	needsHPan: function() {
		return this.isCollapsed() && bundles.selected.get("images").selectedIndex <= 0 &&
			this.keywordList.$wrapper.css("transform-style") == "preserve-3d";
			//this.transforms.hasTransition(this.keywordList.wrapper);
	},

	_onHPanStart: function(ev) {
		if (this.needsHPan()) {
			this.touch.on("panend pancancel", this._onHPanFinal);
			this.touch.on("panmove", this._onHPanMove);
			this.disableTransitions(this.keywordList.wrapper);

			// this.keywordList.wrapper.style[this.getPrefixedStyle("transition")] = "none 0s 0s";
			// this.keywordList.wrapper.style[this.getPrefixedStyle("transform")] = "";
			// this.transforms.clear(this.keywordList.wrapper);
			this.transforms.release(this.keywordList.wrapper);
			this.transforms.capture(this.keywordList.wrapper);
			this._onHPanMove(ev);
		}
	},

	_onHPanMove: function(ev) {
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

	_onHPanFinal: function(ev) {
		this.enableTransitions(this.keywordList.wrapper);

		this.runTransformTransition([this.keywordList.wrapper], "immediate", true);
		this.transforms.clear(this.keywordList.wrapper);

		this.touch.off("panmove", this._onHPanMove);
		this.touch.off("panend pancancel", this._onHPanFinal);
	},

	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */

	_onVPanStart: function (ev) {
		_.each(this.children, function(view) {
			this.disableTransitions(view.el);
			this.transforms.capture(view.el);
		}, this);
		this._onVPanMove(ev);
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
	},

	_onVPanMove1: function (ev) {
		var delta = ev.deltaY + ev.thresholdOffsetY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapse/expand
		var isDirAllowed = this.isCollapsed()? (delta > 0) : (delta < 0);

		delta = Math.abs(delta); // remove sign

		if (isDirAllowed && delta > COLLAPSE_THRESHOLD) {
			this.touch.off("vpanmove", this._onVPanMove);
			this.touch.off("vpanend vpancancel", this._onVPanFinal);
			this.setCollapsed(!this.isCollapsed());
			_.each(this.children, function(view) {
				this.enableTransitions(view.el);
				this.transforms.clear(view.el);
			}, this);
		} else {
			delta *= PAN_OVERSHOOT_FACTOR;
			delta *= this.isCollapsed()? 1 : -1;
			_.each(this.children, function(view) {
				this.transforms.move(view.el, void 0, delta);
			}, this);
		}
	},

	_onVPanMove: function (ev) {
		var delta = ev.deltaY + ev.thresholdOffsetY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapse/expand
		var isDirAllowed = this.isCollapsed()? (delta > 0) : (delta < 0);
		var moveFactor = this.isCollapsed()? PAN_MOVE_FACTOR : 1 - PAN_MOVE_FACTOR;

		delta = Math.abs(delta); // remove sign
		delta *= moveFactor;
		maxDelta *= moveFactor;

		if (isDirAllowed) {
			if (delta > maxDelta) {				// overshooting
				delta = (delta - maxDelta) * PAN_OVERSHOOT_FACTOR + maxDelta;
			} else { 							// no overshooting
				delta = delta;
			}
		} else {
			delta = delta * -PAN_OVERSHOOT_FACTOR; // delta is opposite
		}
		delta *= this.isCollapsed()? 1 : -1; // reapply sign

		//this.transforms.move(this.el, void 0, delta);
		_.each(this.children, function(view) {
			this.transforms.move(view.el, void 0, delta);
		}, this);
	},

	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);

		this._onVPanEnd(ev);
		_.each(this.children, function(view) {
		//	this.enableTransitions(view);
			this.transforms.clear(view.el);
		}, this);
		//(ev.type === "vpanend") && this._onVPanEnd(ev);
	},

	_onVPanEnd: function (ev) {
		if (this.willCollapseChange(ev)) {
		//	this.$vTransitionables.transit(this.transitions["changing"]);
		//	this.$hTransitionables.transit(this.transitions[this.isCollapsed()? "exiting":"entering"]);
			this.runTransformTransition(this.vTransitionables, "changing");
			this.runTransformTransition(this.hTransitionables, this.isCollapsed()? "exiting":"entering");
			this.setCollapsed(!this.isCollapsed());
		} else {
		//	this.$vTransitionables.transit(this.transitions["changing"]);
		//	this.$hTransitionables.transit(this.transitions["immediate"]);
			this.runTransformTransition(this.vTransitionables, "immediate");
			this.runTransformTransition(this.hTransitionables, "immediate");
		}
		//var changing = this.willCollapseChange(ev);
		//this.transition.delay = changing? Globals.TRANSITION_DELAY: 1;
		//this.$transitionables.transit(this.transition);
		//changing && this.setCollapsed(!this.isCollapsed());
	},

	willCollapseChange: function(ev) {
		var delta = ev.deltaY + ev.thresholdOffsetY;
		return ev.type == "vpanend"? this.isCollapsed()? delta > COLLAPSE_THRESHOLD : delta < -COLLAPSE_THRESHOLD : false;
	},

	addTransitionHandlers: function() {
		this.listenTo(bundles, "deselect:one deselect:none", function() {
		//	this.$vTransitionables.transit(this.transitions["changing"]);
			this.runTransformTransition(this.vTransitionables, "changing");
		});
		this.listenTo(bundles, "deselect:none", function() {
		//	this.$sitename.transit(this.transitions["changing"]);
		//	this.$hTransitionables.transit(this.transitions["entering"]);
			this.runTransformTransition(this.hTransitionables, "entering");
		});
		this.listenTo(bundles, "deselect:one", function() {
		//	this.$sitename.transit(this.transitions["changing"]);
		//	this.$hTransitionables.transit(this.transitions["exiting"]);
			this.runTransformTransition(this.hTransitionables, "exiting");
		});
	},

	/* -------------------------------
	 * collapse
	 * ------------------------------- */

	_collapsed: false,

	isCollapsed: function() {
		return this._collapsed;
	},

	setCollapsed: function(collapsed) {
		if (this._collapsed !== collapsed) {
			this._collapsed = collapsed;
			this.bundleList.setCollapsed(collapsed);
			this.keywordList.setCollapsed(collapsed);
			if (collapsed) {
				this.$el.removeClass("expanded").addClass("collapsed");
			} else {
				this.$el.removeClass("collapsed").addClass("expanded");
			}
		}
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
			// filterFn: function () {
			// 	return keywords.selected? keywords.selected.get("bIds"): null;
			// },
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
		// view.wrapper = this.el.querySelector("#bundle-list-wrapper") || view.$el.wrap(
		// 	"<div id=\"bundle-list-wrapper\" class=\"transform-wrapper\"></div>")[0].parentElement;
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
			// filterFn: function () {
			// 	return bundles.selected? bundles.selected.get("kIds"): null;
			// },
			// groupingFn: function (item) {
			// 	return item.get("tIds");
			// },
		});

		// view.wrapper = this.el.querySelector("#keyword-list-wrapper") || view.$el.wrap(
		// 	"<div id=\"keyword-list-wrapper\" class=\"transform-wrapper\"></div>")[0].parentElement;
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


	/*initializeTransitionHandlers: function() {
		var els = this.$(".transform-wrapper, .filterable, .grouped .list-group span");
		var txObj = {};
		txObj.delay = Globals.TRANSITION_DELAY;
		txObj[this.getPrefixedStyle("transform")] = "";

		this.listenTo(bundles, "deselect:one deselect:none", function() {
			els.transit(txObj);
		});
	},

	initializeTransitionHandlers: function() {
		var transitionStyle = this.getPrefixedStyle("transition");
		var transformStyle = this.getPrefixedStyle("transform");
		var $els = this.$(".transform-wrapper, .filterable, .grouped .list-group span");
		var transitionObj = {delay: Globals.TRANSITION_DELAY};
		var handler = function() {
			$els.each(function() {
				transitionObj[transformStyle] = $(this).css(transformStyle);
				$(this).transit(transitionObj);
			});
			this.bundleList.renderNow();
			this.keywordList.renderNow();
		};
		this.listenTo(bundles, "deselect:one deselect:none", handler);
	},

	initializeTransitionHandlers3: function() {
		var prop = this.getPrefixedStyle("transition");
		var val = [
			this.getPrefixedStyle("transform"),
			Globals.TRANSITION_DURATION/1000 + "s",
			Globals.TRANSITION_DELAY/1000 + "s"
		].join(" ");
		var $els = this.$(".transform-wrapper, .filterable, .grouped .list-group span");
		var handler = function() {
			$els.css(prop, val);
		};
		this.listenTo(bundles, "deselect:one deselect:none", handler);
	},

	initializeTransitionHandlers2: function() {
		var cancellable;
		var $body = $("body");
		var eventProp = this.getPrefixedStyle("transform");
		//var css = {}, styleName = this.getPrefixedStyle("transition-delay");
		var $els = this.$(".transform-wrapper, .filterable, .grouped .list-group span");

		var callback = function(exec) {
			cancellable = void 0;
			//css[styleName] = "";
			//$els.css(css);
			$body.removeClass("entering-bundle");
			console.log("entering-bundle out", Date.now());
		};
		var handler = function() {
			cancellable && cancellable(true);
			if (this.transforms.hasTransition(this.keywordList.wrapper)) {
				//css[styleName] = Globals.TRANSITION_DELAY + "ms";
				//$els.css(css);
				$body.addClass("entering-bundle");
				console.log("entering-bundle in", Date.now());
				cancellable = this.onTransitionEnd(this.el, eventProp, callback, Globals.TRANSITION_END_TIMEOUT);
			}
		};
		this.listenTo(bundles, "deselect:one deselect:none", handler);
	},*/

	/*initializeResizeHandlers: function() {
		var context = this, timeout = 100, timeoutId = 0;
		var callback = function() {
			timeoutId = 0;
			_.each(context.children, function(view) {
				view.render();
				context.transforms.clear(view.el);
				context.enableTransitions(view);
			});
			context.$el.removeClass("skip-transitions");
		};
		var handler = function() {
			context.$el.addClass("skip-transitions");
			_.each(context.children, function(view) {
				context.disableTransitions(view);
				context.transforms.release(view.el);
				context.transforms.release(view.wrapper);
			});
			timeoutId != 0 && window.clearTimeout(timeoutId);
			timeoutId = window.setTimeout(callback, timeout);
		};
		$(window).on("orientationchange resize", handler);
		this.on("view:remove", function() {
			timeoutId != 0 && window.clearTimeout(timeoutId);
			$(window).off("orientationchange resize", handler);
		});
	},

	_onResize: function(ev) {
		var context = this, timeout = 100;
		context.$el.addClass("skip-transitions");
		_.each(context.children, function(view) {
			context.disableTransitions(view);
			context.transforms.release(view.el);
			context.transforms.release(view.wrapper);
		});
		context._resizeTimeoutId != 0 && window.clearTimeout(context._resizeTimeoutId);
		context._resizeTimeoutId = window.setTimeout(function() {
			context._resizeTimeoutId = 0;
			_.each(context.children, function(view) {
				view.render();
				context.enableTransitions(view);
			});
			context.$el.removeClass("skip-transitions");
		}, timeout);
	},*/

	/** @override */
	/** this view is, as of now, never removed, so this method is never called */
	/*remove: function () {
		this.$sitename.off("click");
		//this.touch.off("vpanstart", this._onVPanFinal);
		//this.touch.off("panstart", this._onHPanStart);
		View.prototype.remove.apply(this, arguments);
	},*/

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

//	_onVPan: function (ev) {
		//if (bundles.selectedIndex >= 0) {
		//	if (ev.type === "vpanmove" || ev.type === "vpanstart") {
		//		if (ev.type === "vpanstart") {
		//			this.touch.on("vpanmove vpanend vpancancel", this._onVPan);
		//			this.disableTransitions(this.bundleList);
		//			this.disableTransitions(this.keywordList);
		//			this.transforms.capture(this.bundleList.el);
		//			this.transforms.capture(this.keywordList.el);
		//		}
		//		var delta = (ev.deltaY + ev.thresholdOffsetY) * 0.25;
		//		this.transforms.move(this.bundleList.el, void 0, delta);
		//		this.transforms.move(this.keywordList.el, void 0, delta);
		//	} else if (ev.type === "vpanend" || ev.type === "vpancancel") {
		//		this.enableTransitions(this.bundleList);
		//		this.enableTransitions(this.keywordList);
		//		this.transforms.clear(this.bundleList.el);
		//		this.transforms.clear(this.keywordList.el);
		//		this.touch.off("vpanmove vpanend vpancancel", this._onVPan);
		//	}
		//}
//	},

//	_onVPan_select: function (ev) {
		//if (Math.abs(ev.deltaY) > 100) {
		//	if (bundles.selected.get("images").selected) {
		//		controller.deselectImage();
		//	} else if (ev.direction & Hammer.DIRECTION_DOWN && bundles.hasPreceding()) {
		//		controller.selectBundle(bundles.preceding());
		//	} else if (ev.direction & Hammer.DIRECTION_UP && bundles.hasFollowing()) {
		//		controller.selectBundle(bundles.following());
		//	} else {
		//		//controller.deselectBundle();
		//	}
		//}
//	},
});
