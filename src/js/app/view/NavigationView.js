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
	className: "navigation",

	/** @override */
	initialize: function (options) {
		ContainerView.prototype.initialize.apply(this, arguments);

		_.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		
		this.bundleListeners = {
			"select:one": this._onSelectOne,
			"select:none": this._onSelectNone,
			"deselect:one": this._onDeselectOne,
			"deselect:none": this._onDeselectNone,
		};
		this.mediaListeners = {
			"select:one": this._onSelectMedia,
			"select:none": this._onSelectMedia,
			"deselect:one": this._onDeselectMedia,
			"deselect:none": this._onDeselectMedia,
		};
		this.listenTo(bundles, this.bundleListeners);

		this.sitename = this.assignSitenameButton();
		this.bundleList = this.createBundleList();
		this.keywordList = this.createKeywordList();
		this.hGroupings = this.keywordList.el.querySelectorAll(".list-group span");
		// this.bundlePager = this.createBundlePager();
		this.children = [this.bundleList, this.keywordList];
		// this.bundleList.renderNow();
		// this.keywordList.renderNow();
		
		
		// var nodes = this.keywordList.el.querySelectorAll(".list-group span");
		// this.hGroupings = [];
		// for (var i = 0, num = nodes.length; i != num; i++) {
		// 	this.hGroupings[i] = nodes[i];
		// }
		
		// XXX
		this.transforms.add(
			this.bundleList.el, this.keywordList.el,
			this.bundleList.wrapper, this.keywordList.wrapper,
			this.sitename.el, this.hGroupings
		);
		// XXX
		// this.transforms.clearAllCaptures();
		// this.transforms.validate();

		// if (bundles.selected) {
		// 	this.touch.on("panstart", this._onHPanStart);
		// 	this.touch.on("vpanstart", this._onVPanStart);
		// 	this.setCollapsed(true);
		// } else {
		// 	this.setCollapsed(false);
		// }
	},

	/* --------------------------- *
	 * Render
	 * --------------------------- */

	/** @override */
	render: function () {
		console.log(".... NavigationView.render()");
		// this.transforms.clearAllCaptures();
		this.transforms.stopAllTransitions();
		// this.transforms.clearAllTransitions();
		this.transforms.validate();
		
		_.each(this.children, function(view) {
			view.skipTransitions = true;
			view.render();
		}, this);
		return ContainerView.prototype.render.apply(this, arguments);
	},

	// /* -------------------------------
	//  * Router -> before model change
	//  * ------------------------------- */
	// 
	// _beforeChange: function(bundle,media) {
	// 	console.log(">>>> NavigationView._beforeChange");
	// },
	// 
	// _afterChange: function(bundle,media) {
	// 	console.log("<<<< NavigationView._afterChange");
	// },

	/* --------------------------- *
	 * Deselect event handlers
	 * --------------------------- */

	_onDeselectOne: function(bundle) {
		
		this.stopListening(bundle.get("media"), this.mediaListeners);
		
		// console.log("NavigationView._onDeselectOne(" + bundle.cid + ")");
		// this.transforms.captureAll();
		// this.transforms.clearAllCaptures();
		this.transforms.runTransition(Globals.TRANSIT_ENTERING,
			this.bundleList.wrapper);
		this.transforms.runTransition(Globals.TRANSIT_EXITING,
			this.keywordList.wrapper);
		this.transforms.runTransition(Globals.TRANSIT_CHANGING,
			this.bundleList.el, this.keywordList.el);
		this.transforms.runTransition(Globals.TRANSIT_CHANGING,
			this.sitename.el);
		this.transforms.runTransition(
			this.isCollapsed()? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
			this.hGroupings);
		this.transforms.validate();
	},

	_onDeselectNone: function() {
		this.touch.on("panstart", this._onHPanStart);
		this.touch.on("vpanstart", this._onVPanStart);
		
		// console.log("NavigationView._onDeselectNone()");
		// this.transforms.captureAll();
		// this.transforms.clearAllCaptures();
		this.transforms.runTransition(Globals.TRANSIT_ENTERING,
			this.bundleList.wrapper, this.keywordList.wrapper);
		this.transforms.runTransition(Globals.TRANSIT_CHANGING,
			this.bundleList.el, this.keywordList.el);
		this.transforms.runTransition(Globals.TRANSIT_CHANGING,
			this.sitename.el);
		this.transforms.runTransition(Globals.TRANSIT_ENTERING, this.hGroupings);
		this.transforms.validate();
	},

	_onDeselectMedia: function(media) {
		// console.log("NavigationView._onDeselectMedia()");
		// this.transforms.captureAll();
		// this.transforms.clearAllCaptures();
		if (this.isCollapsed()) {
			this.transforms.clearOffset(this.keywordList.wrapper);
			this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE,
				this.keywordList.wrapper);
		} else {
			this.transforms.runTransition(Globals.TRANSIT_CHANGING,
				this.bundleList.el, this.keywordList.el);
			this.transforms.runTransition(Globals.TRANSIT_ENTERING,
				this.bundleList.wrapper, this.keywordList.wrapper, this.sitename.el,
				this.hGroupings);
			
			// this.transforms.runTransition(
			// 	media? Globals.TRANSIT_ENTERING : Globals.TRANSIT_EXITING,
			// 	this.hGroupings);
		}
		this.transforms.validate();
	},

	/* --------------------------- *
	 * Select event handlers
	 * --------------------------- */

	_onSelectOne: function(bundle) {
		// console.log("NavigationView._onSelectOne(" + bundle.cid + ")");
		this.listenTo(bundle.get("media"), this.mediaListeners);
		this.keywordList.filterBy(bundle);
		this.setCollapsed(true);
	},
	
	_onSelectNone: function() {
		// console.log("NavigationView._onSelectNone()");
		this.touch.off("panstart", this._onHPanStart);
		this.touch.off("vpanstart", this._onVPanStart);
		this.keywordList.clearFilter();
		this.setCollapsed(false);
	},
	
	_onSelectMedia: function(media) {
		// console.log("NavigationView._onSelectMedia(" + (media? media.cid : "") + ")");
		this.setCollapsed(true);
	},

	/* -------------------------------
	 * collapse
	 * ------------------------------- */

	_onCollapseChange: function(collapsed) {
		// console.log("NavigationView._onCollapseChange(" + (collapsed?"true":"false") + ")");
		this.bundleList.setCollapsed(collapsed);
		this.keywordList.setCollapsed(collapsed);
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

	_onHPanStart: function(ev) {
		if (this.isCollapsed() &&
			bundles.selected.get("media").selectedIndex <= 0 &&
			document.body.matches(".desktop-small .default-layout")
			// this.el.matches(".desktop-small.default-layout " + this.el.tagName)
			// window.matchMedia(Globals.BREAKPOINTS["desktop-small"]).matches)
		) {
			this.touch.on("panend pancancel", this._onHPanFinal);
			this.touch.on("panmove", this._onHPanMove);
			
			this.transforms.stopTransitions(this.keywordList.wrapper);
			this.transforms.clearCapture(this.keywordList.wrapper);
			this._onHPanMove(ev);
		}
	},
	
	_onHPanMove: function(ev) {
		var delta = ev.thresholdDeltaX;
		if (bundles.selected.get("media").selectedIndex == -1) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)?
				Globals.H_PANOUT_DRAG : 0.75;
			//delta *= (delta > 0)? 0.40: 0.75;
		} else {//if (media.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? 0.75 : 0.0;
			//delta *= (delta > 0)? 0.75: 0.00;
		}
		// this.transforms.get(this.keywordList.wrapper).offset(delta, void 0).validate();
		this.transforms.offset(delta, void 0, this.keywordList.wrapper);
		this.transforms.validate();
	},
	
	_onHPanFinal: function(ev) {
		this.touch.off("panmove", this._onHPanMove);
		this.touch.off("panend pancancel", this._onHPanFinal);
		
		// NOTE: transition will be set twice if there is a new selection!
		// this.transforms.get(this.keywordList.wrapper)
		// 		.runTransition(Globals.TRANSIT_IMMEDIATE).clearOffset().validate();
		this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE, this.keywordList.wrapper);
		this.transforms.clearOffset(this.keywordList.wrapper);
		this.transforms.validate();
	},
	
	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */
	
	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);

		this.transforms.stopTransitions(this.bundleList.el, this.keywordList.el);
		this.transforms.clearCapture(this.bundleList.el, this.keywordList.el);
		this._onVPanMove(ev);
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

		this.transforms.offset(0, delta, this.bundleList.el, this.keywordList.el);
		this.transforms.validate();
	},
	
	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
		
		if (this.willCollapseChange(ev)) {
			this.transforms.runTransition(Globals.TRANSIT_CHANGING,
				this.bundleList.el, this.keywordList.el);
			this.transforms.runTransition(
				this.isCollapsed()? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
				this.bundleList.wrapper, this.keywordList.wrapper, this.sitename.el, this.hGroupings);
			this.setCollapsed(!this.isCollapsed());
			this.transforms.validate();
		} else {
			this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE,
				this.bundleList.el, this.keywordList.el);
			this.transforms.validate();
		}
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
