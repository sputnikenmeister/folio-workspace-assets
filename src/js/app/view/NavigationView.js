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

/** @type {module:app/utils/event/addTransitionEndCommand} */
var addTransitionEndCommand = require("../utils/event/addTransitionEndCommand");

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
	events: {
		"click #site-name a": "_onSitenameClick"
	},

	/** @override */
	initialize: function (options) {
		this.$sitename = this.$("#site-name");
		//this.$sitename.on("click", _.bind(this._onSitenameClick, this));
		this.$sitename.wrap("<div id=\"site-name-wrapper\" class=\"transform-wrapper\"></div>");

		this.bundlePager = this.createBundlePager();
		this.bundlesView = this.createBundleList();
		this.keywordsView = this.createKeywordList();

		this.bundlesView.$el.wrap("<div id=\"bundle-list-wrapper\" class=\"transform-wrapper\"></div>");
		this.keywordsView.$el.wrap("<div id=\"keyword-list-wrapper\" class=\"transform-wrapper\"></div>");

		this.metrics = {};
		this._metrics = [];
		this._wrappers = [];

		this._kWrap = this.keywordsView.el.parentElement;
		this._initTransform(this._kWrap);
//		this._$kWrap = this.keywordsView.$el.parent();

		_.bindAll(this, "_onPanStart", "_onPanMove", "_onPanFinal", "_onVerticalPan");
		this.touch = TouchManager.getInstance();
		this.touch.on("vpanend", this._onVerticalPan);
		this.touch.on("panstart", this._onPanStart);

		this.listenTo(bundles, {
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone
		});
	},

	/** @override */
	remove: function () {
		//this.$sitename.off("click");
		this.touch.off("vpanend", this._onVerticalPan);
		this.touch.off("panstart", this._onPanStart);
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
		return view;
	},

	/**
	 * keyword-list
	 */
	createKeywordList: function() {
		var view = new GroupingListView({
			el: "#keyword-list",
			collection: keywords,
			collapsed: true,
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
//		this.keywordsView.renderNow();
//		this.bundlesView.renderNow();

		this._releaseTransformValues(this._kWrap);
		return View.prototype.render.apply(this, arguments);
	},

	/* --------------------------- *
	 * Event handlers
	 * --------------------------- */

	_onSelectOne: function(bundle) {
		this.bundlesView.setCollapsed(true);
		this.keywordsView.filterBy(bundle);
	},

	_onSelectNone: function() {
		this.bundlesView.setCollapsed(false);
		this.keywordsView.filterBy(null);
	},

	_onSitenameClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		controller.deselectBundle();
	},

	_onVerticalPan: function (ev) {
		if (bundles.selected && ev.type === "vpanend" && (Math.abs(ev.deltaY) > 100)) {
			if (bundles.selected.get("images").selected) {
				controller.deselectImage();
			} else if (ev.direction & Hammer.DIRECTION_DOWN && bundles.hasPreceding()) {
				controller.selectBundle(bundles.preceding());
			} else if (ev.direction & Hammer.DIRECTION_UP && bundles.hasFollowing()) {
				controller.selectBundle(bundles.following());
			} else {
//				controller.deselectBundle();
			}
		}
	},

	/* -------------------------------
	 * Touch/Move
	 * ------------------------------- */

	_onPanStart: function(ev) {
		if ((bundles.selectedIndex >= 0) && (bundles.selected.get("images").selectedIndex <= 0) &&
					(this._hasCSSTransition(this._kWrap))) {
//					true) {
			this.touch.on("panend pancancel", this._onPanFinal);
			this.touch.on("panmove", this._onPanMove);

			this._disableCSSTransition(this._kWrap);
			this._captureTransformValues(this._kWrap);

			this._onPanMove(ev);
		}
	},

	_onPanMove: function(ev) {
		var delta = ev.deltaX + ev.thresholdOffsetX;
		if (bundles.selected.get("images").selectedIndex == -1) {
			delta *= (delta > 0)? 0.40: 0.75;//(ev.offsetDirection & Hammer.DIRECTION_LEFT)? 0.4 : 0.75;
		} else {//if (images.selectedIndex == 0) {
			delta *= (delta > 0)? 0.75: 0.00;//(ev.offsetDirection & Hammer.DIRECTION_LEFT)? 0.75 : 0.0;
		}
		this._setCSSTransform(this._kWrap, delta);
	},

	_onPanFinal: function(ev) {
		this._enableCSSTransition(this._kWrap);
		this._clearCSSTransform(this._kWrap);

		this.touch.off("panmove", this._onPanMove);
		this.touch.off("panend pancancel", this._onPanFinal);
	},

	/* -------------------------------
	 * transitions/transforms
	 * ------------------------------- */

	_initTransform: function(el) {
		var idx = this._wrappers.indexOf(el);
		if (idx == -1) {
			idx = this._wrappers.length;
			this._wrappers[idx] = el;
			this._metrics[idx] = {
				el: el,
				$el: Backbone.$(el)
			};
		}
		return idx;
	},

	_destroyTransform: function(el) {
		var idx = this._wrappers.indexOf(el);
		this._wrappers.splice(idx, 1);
		this._metrics.splice(idx, 1);
	},

	_getTransform: function(el) {
		var idx = this._wrappers.indexOf(el);
		if (idx == -1) {
			idx = this._initTransform(el);
		}
		return this._metrics[idx];
	},

	/* -------------------------------
	 * css property --> object
	 * ------------------------------- */

	_parseTransformValues: function(cssval) {
		var m, mm, mv, o = { css: cssval };
		mm = cssval.match(/(matrix|matrix3d)\(([^\)]+)\)/);
		if (mm) {
			m = mm[2].split(",");
			if (mm[1] === "matrix") {
				o.x = parseFloat(m[4]);
				o.y = parseFloat(m[5]);
			} else {
				o.x = parseFloat(m[12]);
				o.y = parseFloat(m[13]);
			}
		} else {
			o.x = 0;
			o.y = 0;
		}
		console.log("NavigationView._parseTransformValues", o.x, o.y, cssval);
		return o;
	},

	_parseTransformValues_2: function(cssval) {
		var o = { css: cssval };
		var m = cssval.match(/(-?[\d\.]+)(?=[\)\,])/g);
		if (m && m.length == 6) {
			o.x = parseFloat(m[4]);
			o.y = parseFloat(m[5]);
		} else if (m && m.length == 16) {
			o.x = parseFloat(m[12]);
			o.y = parseFloat(m[13]);
		} else {
			o.x = 0;
			o.y = 0;
		}
		console.log("NavigationView._parseTransformValues_2", o.x, o.y, cssval);
		return o;
	},

	_captureTransformValues: function(el) {
		var o = this._getTransform(el);
		if (o.offset) {
			console.warn("ContentView._captureTransformValues", "offser values still set: clearing before capture");
			o.$el.css({transform: ""});
		}
		o.captured = this._parseTransformValues(o.$el.css("transform"));
		if (o.offset) {
			o.$el.css({transform: "translate3d(" +
					   (o.offset.x + o.captured.x) + "px, " +
					   (o.offset.y + o.captured.y) + "px, 0px)"
			});
		}
	},

	_releaseTransformValues: function(el) {
		var o = this._getTransform(el);
		o.offset = o.captured = void 0;
		//o.$el.css({transform: ""});
		console.log("NavigationView._resetCSSTransform");
	},

	/* -------------------------------
	 * object --> css property
	 * ------------------------------- */

	_clearCSSTransform: function(el) {
		var o = this._getTransform(el);
		if (o.offset) {
			o.$el.css({"transform": ""});
			o.offset = void 0;
			console.log("NavigationView._clearCSSTransform");
		} else {
			console.warn("NavigationView._clearCSSTransform", "nothing to clear");
		}
		o.captured = void 0;
	},

	_setCSSTransform: function(el, x, y) {
		var o = this._getTransform(el);
		o.offset = { x: x || 0, y: y || 0};
		if (!o.captured) {
			console.warn("ContentView._setCSSTransform", "captured values not set: capturing now");
			o.captured = this._parseTransformValues(o.$el.css("transform"));
		}
		o.$el.css({transform: "translate3d(" +
				   (o.offset.x + o.captured.x) + "px, " +
				   (o.offset.y + o.captured.y) + "px, 0px)"
		});
	},

	_updateCSSTransform: function(el) {
		var o = this._getTransform(el);
		if (o.offset) {
			if (!o.captured) {
				console.info("ContentView._updateCSSTransform", "captured values not set: capturing now");
				o.captured = this._parseTransformValues(o.$el.css("transform"));
			}
			o.$el.css({transform: "translate3d(" +
					   (o.offset.x + o.captured.x) + "px, " +
					   (o.offset.y + o.captured.y) + "px, 0px)"
			});
		} else {
			o.$el.css({"transform": ""});
		}
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	_enableCSSTransition: function(el) {
		this.$el.removeClass("skip-transitions");
//		this._getTransform(el).$el.css({transition: ""});
//		this._getTransform(el).$el.removeClass("skip-own-transitions");
		//el.classList.remove("skip-own-transitions");
	},

	_disableCSSTransition: function(el) {
		this.$el.addClass("skip-transitions");
//		this._getTransform(el).$el.css({transition: "none 0s 0s !important"});
//		this._getTransform(el).$el.addClass("skip-own-transitions");
		//el.classList.add("skip-own-transitions");
	},

  	_hasCSSTransition: function(el) {
		var s = window.getComputedStyle(el);
		var v = s.webkitTransition || s.MozTransitionProperty || s.webkitTransitionProperty || s.MozTransition || s.transition;
		var r = v && v.indexOf("transform") != -1;
		console.log("NavigationView._hasCSSTransition", r);
		return r;
	},

});
