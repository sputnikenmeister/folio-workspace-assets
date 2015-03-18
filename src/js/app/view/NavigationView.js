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
		_.bindAll(this, "_onPan", "_onVerticalPan", "_onResize");

		this.$sitename = this.$("#site-name");
		//this.$sitename.on("click", _.bind(this._onSitenameClick, this));
		this.$sitename.wrap("<div id=\"site-name-wrapper\" class=\"transform-wrapper\"></div>");

		// bundle-pager
		this.bundlePager = this.createBundlePager();

		// bundle-list
		this.bundlesView = new FilterableListView({
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
		controller.listenTo(this.bundlesView, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
		this.bundlesView.$el.wrap("<div id=\"bundle-list-wrapper\" class=\"transform-wrapper\"></div>");

		// keyword-list
		this.keywordsView = new GroupingListView({
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
		this.keywordsView.$el.wrap("<div id=\"keyword-list-wrapper\" class=\"transform-wrapper\"></div>");

		this._tx = {};
		this._keywordWrapper = document.querySelector("#keyword-list-wrapper");
		this._hammer = TouchManager.getInstance();
		this._hammer.on("vpanend", this._onVerticalPan);
		this._hammer.on("panstart panmove panend pancancel", this._onPan);

		this.listenTo(bundles, {
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone
		});
	},

	/** @override */
	remove: function () {
		//this.$sitename.off("click");
		this._hammer.off("vpanend", this._onVerticalPan);
		this._hammer.off("panstart panmove panend pancancel", this._onPan);
		View.prototype.remove.apply(this, arguments);
	},

	/** @param {Object} ev */
	_onResize: function (ev) {
		_.each(this.children, function(child) {
			child.render();
		}, this);
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	render: function () {
		if (bundles.selected) {
			this._onSelectOne();
		} else {
			this._onSelectNone();
		}
//		this.keywordsView.renderNow();
//		this.bundlesView.renderNow();
		return this;
	},

	/* --------------------------- *
	 * Event handlers
	 * --------------------------- */

	_onSelectOne: function() {
		this.bundlesView.setCollapsed(true);
		this.keywordsView.filterBy(bundles.selected);
	},

	_onSelectNone: function() {
		this.bundlesView.setCollapsed(false);
		this.keywordsView.filterBy(null);
	},

	_onSitenameClick: function (ev) {
		ev.isDefaultPrevented() || ev.preventDefault();
		controller.deselectBundle();
	},

	/* -------------------------------
	 * Touch
	 * ------------------------------- */

	_onVerticalPan: function (ev) {
//		if (ev.isFinal || ev.isFirst) {
//			console.log("ContentView _onVerticalPan", ev.type, ev.timeStamp, ev);
//		} else {
//			console.log("ContentView _onVerticalPan", ev.type, ev.timeStamp, Boolean(ev.direction & Hammer.DIRECTION_VERTICAL));
//		}
		if (ev.type === "vpanend") {
			if ((ev.direction & Hammer.DIRECTION_VERTICAL) && (Math.abs(ev.deltaY) > 100)) {
				if (bundles.selected.get("images").selected) {
//					controller.deselectImage();
				} else if (ev.direction & Hammer.DIRECTION_DOWN && bundles.hasPreceding()) {
					controller.selectBundle(bundles.preceding());
				} else if (ev.direction & Hammer.DIRECTION_UP && bundles.hasFollowing()) {
					controller.selectBundle(bundles.following());
				} else {
//					controller.deselectBundle();
				}
			} else if (ev.deltaX > 100) {
//				controller.deselectBundle();
			}
		}
	},

	_onPan: function(ev) {
//		if (ev.isFinal || ev.isFirst) {
//			console.log("ContentView _onPan", ev.type, ev.timeStamp, ev);
//		} else {
//			console.log("ContentView _onPan", ev.type, ev.timeStamp, Boolean(ev.direction & Hammer.DIRECTION_HORIZONTAL));
//		}
		if (ev.type === "panmove") {
			if (bundles.selectedIndex != -1) {
				var images = bundles.selected.get("images");
				var delta = null;
				if (images.selectedIndex == -1) {
					if (ev.offsetDirection & Hammer.DIRECTION_LEFT) {
						delta = ev.deltaX * 0.4;
					} else {
						delta = ev.deltaX * 0.75;
					}
				} else if (images.selectedIndex == 0) {
					if (ev.offsetDirection & Hammer.DIRECTION_LEFT) {
						delta = ev.deltaX * 0.75;
					}
				}
				if (delta !== null) {
					this._setCSSTransform("keyword-wrapper", delta, void 0);
				}
			}
		} else if (ev.type === "panstart") {
			//Backbone.$(this._keywordList).addClass("skip-own-transitions");
			this._initCSSTransform("keyword-wrapper", this._keywordWrapper);
		} else if (ev.isFinal) {
			//Backbone.$(this._keywordList).removeClass("skip-own-transitions");
			this._clearCSSTransform("keyword-wrapper");
//			_.defer(_.bind(this._clearCSSTransform, this, "keyword-wrapper"));
		}

	},

	_hasCSSTransition: function(el, s) {
		s || (s = window.getComputedStyle(el));
		var v = s.WebkitTransitionProperty || s.MozTransitionProperty || s.transitionProperty;
		v = v && v.indexOf("transform") != -1? true: false;
		return v;
	},

	_initCSSTransform: function(id, el) {
		var s, o, t, m;

		this._clearCSSTransform(id);
		s = window.getComputedStyle(el);
		if (!this._hasCSSTransition(el, s)) {
			return;
		}

		o = {el: el};
		o.keepAttr = el.hasAttribute("style");
		t = s.webkitTransform || s.mozTransform || s.transform;
		m = t.match(/(\d+)(?=[\)\,])/g);
		if (m && m.length == 6) {
			o.x = parseFloat(m[4]);
			o.y = parseFloat(m[5]);
		} else if (m && m.length == 16) {
			o.x = parseFloat(m[3]);
			o.y = parseFloat(m[7]);
		} else {
			o.x = 0;
			o.y = 0;
		}
		o.el.style.WebkitTransition = "none 0s 0s";
		o.el.style.MozTransition = "none 0s 0s";
		o.el.style.transition = "none 0s 0s";

		this._tx[id] = o;
	},

	_clearCSSTransform: function(id) {
		var o = this._tx[id];
		if (this._tx[id] == void 0) return;
		if (o.keepAttr) {
			o.el.style.WebkitTransition = "";
			o.el.style.MozTransition = "";
			o.el.style.transition = "";
			o.el.style.WebkitTransform = "";
			o.el.style.MozTransform = "";
			o.el.style.transform = "";
		} else {
			o.el.removeAttribute("style");
		}
		this._tx[id] = void 0;
	},

	_setCSSTransform: function(id, x, y) {
		var o = this._tx[id];
		if (this._tx[id] == void 0) return;
		x = (x||0) + o.x;
		y = (y||0) + o.y;
		x = Math.round(x);
		y = Math.round(y);
		var t = "translate3d(" + x + "px," + y + "px,0)";
		o.el.style.WebkitTransform = t;
		o.el.style.MozTransform = t;
		o.el.style.transform = t;
	},

	/* -------------------------------
	 * Components
	 * ------------------------------- */

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

});
