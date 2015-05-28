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

/** @type {module:app/model/collection/TypeCollection} */
var types = require("../model/collection/TypeCollection");
/** @type {module:app/model/collection/KeywordCollection} */
var keywords = require("../model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("../model/collection/BundleCollection");

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
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		//_.bindAll(this, "_onVPanFinal", "_onVPan");
		this.touch = TouchManager.getInstance();

		this._useHPan = this.el.matches(".default-layout " + this.el.tagName);

		this.sitename = this.assignSitenameButton();
		this.bundleList = this.createBundleList();
		this.keywordList = this.createKeywordList();
		// this.bundlePager = this.createBundlePager();
		this.children = [this.bundleList, this.keywordList];
		// this.bundleList.renderNow();
		// this.keywordList.renderNow();

		this.hGroupings = [];
		var nodes = this.keywordList.el.querySelectorAll(".list-group span");
		for (var i = 0, num = nodes.length; i != num; i++) {
			this.hGroupings[i] = nodes[i];
		}
		this.hWrappers = [this.bundleList.wrapper, this.keywordList.wrapper];
		this.hTransitionables = this.hGroupings.concat(this.hWrappers);
		this.vTransitionables = [this.bundleList.el, this.keywordList.el, this.sitename.el];
		this.childrenEls = this.vTransitionables.concat(this.hWrappers);

		// this.vTransitionables = this.el.querySelectorAll("#site-name, #bundle-list, #keyword-list");
		// this.hTransitionables = this.el.querySelectorAll(
		// 	"#bundle-list-wrapper, #keyword-list-wrapper, #keyword-list .list-group span");

		// this._collapsedOffsetY = 300;

		// this.initializeResizeHandlers();
		// this.addTransitionHandlers();
		this.listenTo(bundles, {
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			"deselect:one": this._onDeselectOne,
			"deselect:none": this._onDeselectNone,
		});
		//(bundles.selected)? this._onDeselectNone(): this._onSelectNone();

		var vendors = ["ms", "moz", "webkit", "o"], x;
		for (x = 0; x < vendors.length && !this.el.matches; ++x) {
			this.el.matches = this.el[vendors[x] + "MatchesSelector"];
		}
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	/** @override */
	render: function () {
		// this.transforms.clearAll();
		// this.transforms.releaseAll();
		this.transforms.release(this.sitename.el);
		this.transforms.clearTransitions(this.sitename.el);
		_.each(this.children, function(view) {
			view.renderNow();
			this.transforms.release(view.el);
			this.transforms.release(view.wrapper);
			this.transforms.clearTransitions(view.el);
			this.transforms.clearTransitions(view.wrapper);
		}, this);
		return ContainerView.prototype.render.apply(this, arguments);
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

			this.el.classList.toggle("collapsed", collapsed);
			this.el.classList.toggle("expanded", !collapsed);
		}
	},

	/* --------------------------- *
	 * bundles event handlers
	 * --------------------------- */

	_onDeselectOne: function(bundle) {
		console.log("NavigationView._onDeselectOne()");

		// this.transforms.releaseAll();
		this.transforms.runTransition(Globals.TRANSIT_EXITING,
			this.keywordList.wrapper);
		this.transforms.runTransition(Globals.TRANSIT_CHANGING,
			this.bundleList.el, this.keywordList.el);
		this.transforms.runTransition(Globals.TRANSIT_ENTERING,
			this.bundleList.wrapper, this.sitename.el);//, this.hGroupings);

		this.transforms.runTransition(
			this.isCollapsed()? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
			this.hGroupings);
		// this.transforms.runTransition(Globals.TRANSIT_ENTERING, this.hGroupings);

		this.stopListening(bundle.get("images"), "deselect:one deselect:none", this._onDeselectImage);
		this.stopListening(bundle.get("images"), "select:one select:none", this._onSelectImage);
	},

	_onDeselectNone: function() {
		console.log("NavigationView._onDeselectNone()");

		// this.transforms.releaseAll();
		this.transforms.runTransition(Globals.TRANSIT_ENTERING,
			this.bundleList.wrapper, this.keywordList.wrapper);//, this.hGroupings);
		this.transforms.runTransition(Globals.TRANSIT_CHANGING,
			this.bundleList.el, this.keywordList.el, this.sitename.el);

		// this.transforms.runTransition(
		// 	this.isCollapsed()? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
		// 	this.hGroupings);
		this.transforms.runTransition(Globals.TRANSIT_ENTERING, this.hGroupings);

		this._useHPan && this.touch.on("panstart", this._onHPanStart);
		this.touch.on("vpanstart", this._onVPanStart);
	},

	_onSelectOne: function(bundle) {
		// this.transforms.runTransition(Globals.TRANSIT_ENTERING, this.hGroupings);
		this.setCollapsed(true);
		this.keywordList.filterBy(bundle);

		this.listenTo(bundle.get("images"), "deselect:one deselect:none", this._onDeselectImage);
		this.listenTo(bundle.get("images"), "select:one select:none", this._onSelectImage);

		console.log("NavigationView._onSelectOne(" + bundle.cid + ")");
	},

	_onSelectNone: function() {
		// this.transforms.runTransition(Globals.TRANSIT_EXITING, this.hGroupings);
		this.setCollapsed(false);
		this.keywordList.filterBy(null);

		this._useHPan && this.touch.off("panstart", this._onHPanStart);
		this.touch.off("vpanstart", this._onVPanStart);

		console.log("NavigationView._onSelectNone(none)");
	},

	/* --------------------------- *
	 * bundle.images event handlers
	 * --------------------------- */

	_onDeselectImage: function(image) {
		console.log("NavigationView._onDeselectImage()");

		if (this.isCollapsed()) {
			this.transforms.clear(this.keywordList.wrapper);
			this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE,
				this.keywordList.wrapper);
		} else {
			this.transforms.runTransition(Globals.TRANSIT_CHANGING,
				this.bundleList.el, this.keywordList.el);
			this.transforms.runTransition(Globals.TRANSIT_ENTERING,
				this.bundleList.wrapper, this.keywordList.wrapper, this.sitename.el,
				this.hGroupings);
			// this.transforms.runTransition(
			// 	image? Globals.TRANSIT_ENTERING : Globals.TRANSIT_EXITING,
			// 	this.hGroupings);
		}
	},

	_onSelectImage: function(image) {
		this.setCollapsed(true);
		console.log("NavigationView._onSelectImage(" + (image? image.cid : "none") + ")");
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
			// this.keywordList.wrapper.style[this.getPrefixedStyle("transform-style")] == "preserve-3d";
			//this.transforms.hasTransition(this.keywordList.wrapper);
	},

	_onHPanStart: function(ev) {
		if (this.needsHPan()) {
			this.touch.on("panend pancancel", this._onHPanFinal);
			this.touch.on("panmove", this._onHPanMove);

			this.transforms.disableTransitions(this.keywordList.wrapper);
			// this.keywordList.wrapper.style[this.getPrefixedStyle("transition")] = "none 0s 0s";

			// this.keywordList.wrapper.style[this.getPrefixedStyle("transition")] = "";
			// this.transforms.clear(this.keywordList.wrapper);
			// this.transforms.release(this.keywordList.wrapper);
			this.transforms.capture(this.keywordList.wrapper);
			this._onHPanMove(ev);
		}
	},

	_onHPanMove: function(ev) {
		var delta = ev.thresholdDeltaX;
		if (bundles.selected.get("images").selectedIndex == -1) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)?
				Globals.H_PANOUT_DRAG : 0.75;
			//delta *= (delta > 0)? 0.40: 0.75;
		} else {//if (images.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? 0.75 : 0.0;
			//delta *= (delta > 0)? 0.75: 0.00;
		}
		this.transforms.move(delta, void 0, this.keywordList.wrapper);
	},

	_onHPanFinal: function(ev) {
		this.transforms.enableTransitions(this.keywordList.wrapper);

		// WARNING: transition will be set twice if there is a new selection!
		this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE, this.keywordList.wrapper);
		this.transforms.clear(this.keywordList.wrapper);

		this.touch.off("panmove", this._onHPanMove);
		this.touch.off("panend pancancel", this._onHPanFinal);
	},

	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */

	_onVPanStart: function (ev) {
		_.each(this.children, function(view) {
			// view.el.style[this.getPrefixedStyle("transition")] = "none 0s 0s";
			this.transforms.disableTransitions(view.el);
			this.transforms.capture(view.el);
		}, this);
		this._onVPanMove(ev);

		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
	},

	PAN_MOVE_FACTOR: 0.05,
	_collapsedOffsetY: 300,

	_onVPanMove: function (ev) {
		var delta = ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapse/expand
		var isValidDir = this.isCollapsed()? (delta > 0) : (delta < 0);
		var moveFactor = this.isCollapsed()? this.PAN_MOVE_FACTOR : 1 - this.PAN_MOVE_FACTOR;

		delta = Math.abs(delta); // remove sign
		delta *= moveFactor;
		maxDelta *= moveFactor;

		if (isValidDir) {
			if (delta > maxDelta) { // overshooting
				delta = ((delta - maxDelta) * Globals.V_PANOUT_DRAG) + maxDelta;
			} else { // no overshooting
				delta = delta;
			}
		} else {
			delta = delta * -Globals.V_PANOUT_DRAG; // delta is opposite
		}
		delta *= this.isCollapsed()? 0.5 : -1; // reapply sign

		// this.transforms.moveAll(void 0, delta);
		_.each(this.children, function(view) {
			this.transforms.move(void 0, delta, view.el);
		}, this);
	},

	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);

		_.each(this.children, function(view) {
			this.transforms.enableTransitions(view.el);
		}, this);

		if (this.willCollapseChange(ev)) {
			this.transforms.runTransition(Globals.TRANSIT_CHANGING,
				this.bundleList.el, this.keywordList.el);
			this.transforms.runTransition(this.isCollapsed()?
				Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
				this.bundleList.wrapper, this.keywordList.wrapper, this.sitename.el, this.hGroupings);
				// this.isCollapsed()? Globals.TRANSIT_IMMEDIATE : Globals.TRANSIT_ENTERING);
			this.setCollapsed(!this.isCollapsed());
		} else {
			this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE,
				this.bundleList.el, this.keywordList.el);
			// this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE,
			// 	this.vTransitionables, this.hWrappers, this.hGroupings);
		}

		_.each(this.children, function(view) {
			this.transforms.clear(view.el);
		}, this);
	},

	willCollapseChange: function(ev) {
		return ev.type == "vpanend"? this.isCollapsed()?
			ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
			ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
			false;
	},

	/* -------------------------------
	 * Components
	 * ------------------------------- */

	assignSitenameButton: function() {
		_.bindAll(this, "_onSitenameClick");
		var pseudo = {};
		pseudo.$el = this.$("#site-name");
		pseudo.$el.on("click", this._onSitenameClick);
		pseudo.$el.wrap("<div id=\"site-name-wrapper\" class=\"transform-wrapper\"></div>");
		pseudo.el = pseudo.$el[0];
		pseudo.wrapper = pseudo.el.parentElement;
		pseudo.$wrapper = pseudo.$el.parent();
		return pseudo;
	},

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
});
