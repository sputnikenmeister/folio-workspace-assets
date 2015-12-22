/* global MutationObserver */
/**
 * @module app/view/NavigationView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("app/control/TouchManager");
/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");

/** @type {module:app/model/collection/TypeCollection} */
var types = require("app/model/collection/TypeCollection");
/** @type {module:app/model/collection/KeywordCollection} */
var keywords = require("app/model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/base/ContainerView} */
var ContainerView = require("app/view/base/ContainerView");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("app/view/component/GroupingListView");
/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("app/view/component/CollectionPager");

/** @type {module:utils/css/parseTransformMatrix} */
var parseMatrix = require("utils/css/parseTransformMatrix");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");


/**
 * @constructor
 * @type {module:app/view/NavigationView}
 */
var NavigationView = ContainerView.extend({
	
	/** @override */
	cidPrefix: "navigationView",
	
	// /** @override */
	// className: ContainerView.prototype.className + " navigation",
	
	// events: {
	// 	"transitionend #bundle-list-wrapper": function(ev) {
	// 		if (ev.target !== this.bundleList.wrapper) return;
	// 		console.log("%s::[%s] id:%s (%s) %s", this.cid, ev.type, ev.target.id, ev.target.className, ev.propertyName);
	// 	}
	// },
	
	/** @override */
	initialize: function (options) {
		ContainerView.prototype.initialize.apply(this, arguments);
		
		_.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		
		this.bundleListeners = {
			"select:one": this._onSelectOneBundle,
			"select:none": this._onSelectNoBundle,
			"deselect:one": this._onDeselectOneBundle,
			"deselect:none": this._onDeselectNoBundle,
		};
		this.mediaListeners = {
			"select:one": this._onSelectAnyMedia,
			"select:none": this._onSelectAnyMedia,
			"deselect:one": this._onDeselectAnyMedia,
			"deselect:none": this._onDeselectAnyMedia,
		};
		this.listenTo(bundles, this.bundleListeners);

		this.sitename = this.assignSitenameButton();
		this.bundleList = this.createBundleList();
		this.keywordList = this.createKeywordList();
		this.hGroupings = this.keywordList.el.querySelectorAll(".list-group span");
		// this.bundlePager = this.createBundlePager();
		this.itemViews = [this.bundleList, this.keywordList];
		// this.bundleList.renderNow();
		// this.keywordList.renderNow();
		
		this.transforms.add(
			this.bundleList.el, this.keywordList.el,
			this.bundleList.wrapper, this.keywordList.wrapper,
			this.sitename.el, this.hGroupings
		);
		this._validateTransforms = this.transforms.validate.bind(this.transforms);
	},
	
	/* --------------------------- *
	 * Render
	 * --------------------------- */
	 
	/** @override */
	render: function () {
		// console.log(".... NavigationView.render()");
		// this.transforms.clearAllCaptures();
		// this.transforms.clearAllTransitions();
		this.transforms.stopAllTransitions();
		this.transforms.validate();
		// _.each(this.itemViews, function(view) {
		this.itemViews.forEach(function(view) {
			view.skipTransitions = true;
			view.render();
			// view.requestRender();
			// view.renderNow(true);
		}, this);
		return ContainerView.prototype.render.apply(this, arguments);
	},
	
	/* -------------------------------
	 * Router -> before model change
	 * ------------------------------- */
	
	_beforeChange: function(bundle, media) {
		// this._changeType = "c2b";
		// if (bundle !== bundles.selected) {
		// 	if (bundle && bundles.selected) {
		// 		if (this.collapsed) {
		// 			this._changeType = "b2b";
		// 		} else {
		// 			this._changeType = "c2b";
		// 		}
		// 	}
		// }
		this._bundleChanging = (bundle !== bundles.selected);
		this._bundleChangeDelay = (bundle !== bundles.selected) && (bundle && bundles.selected) && !this.collapsed;
		// this._bundleChangeDelay = (bundle !== bundles.selected) && bundle && !this.collapsed;
	},
	
	_afterChange: function(bundle, media) {
		this._bundleChanging = false;
		this._bundleChangeDelay = false;
		
		// this.bundleList.renderNow();
		// this.keywordList.renderNow();
		// this.transforms.validate();
		// this.requestAnimationFrame(this._validateTransforms);
	},
	
	/* --------------------------- *
	 * Deselect event handlers
	 * --------------------------- */
	 
	_onDeselectOneBundle: function(bundle) {
		this.stopListening(bundle.get("media"), this.mediaListeners);
		
		// console.log("NavigationView._onDeselectOneBundle(" + bundle.cid + ")");
		// this.transforms.captureAll();
		// this.transforms.clearAllCaptures();
		this.transforms.runTransition(
			Globals.TRANSIT_CHANGING, // Globals.TRANSIT_EXITING,
			this.bundleList.el,
			this.keywordList.el);
		
		// this.transforms.runTransition(
		// 	this.collapsed? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
		// 	this.hGroupings,
		// 	this.keywordList.wrapper);
		
		if (this._bundleChangeDelay) {
			console.log("this._bundleChangeDelay", this._bundleChangeDelay, Globals.TRANSIT_XXX.cssText);
			this.transforms.runTransition(
				Globals.TRANSIT_XXX,
				this.sitename.el,
				this.keywordList.wrapper,
				this.bundleList.wrapper,
				this.hGroupings);
		} else {
			this.transforms.runTransition(
				this.collapsed? Globals.TRANSIT_CHANGING : Globals.TRANSIT_ENTERING,
				this.sitename.el);
			this.transforms.runTransition(
				this.collapsed? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
				this.keywordList.wrapper,
				this.bundleList.wrapper,
				this.hGroupings);
		}
		this.transforms.validate();
	},

	_onDeselectNoBundle: function() {
		this.touch.on("panstart", this._onHPanStart);
		this.touch.on("vpanstart", this._onVPanStart);
		
		this.transforms.runTransition(
			Globals.TRANSIT_CHANGING,
			this.bundleList.el,
			this.keywordList.el);
		
		this.transforms.runTransition(
			Globals.TRANSIT_CHANGING,
			this.sitename.el);
		
		this.transforms.runTransition(
			Globals.TRANSIT_ENTERING,
			this.hGroupings);
		
		this.transforms.runTransition(
			Globals.TRANSIT_ENTERING,
			this.bundleList.wrapper,
			this.keywordList.wrapper);
		
		this.transforms.validate();
	},

	_onDeselectAnyMedia: function(media) {
		if (this.collapsed) {
			this.transforms.clearOffset(this.keywordList.wrapper);
			this.transforms.runTransition(
				Globals.TRANSIT_IMMEDIATE,
				this.keywordList.wrapper);
		} else {
			this.transforms.runTransition(
				Globals.TRANSIT_CHANGING,
				this.bundleList.el,
				this.keywordList.el);
				
			this.transforms.runTransition(
				Globals.TRANSIT_ENTERING,
				this.bundleList.wrapper,
				this.keywordList.wrapper,
				this.sitename.el,
				this.hGroupings);
		}
		if (!this._bundleChanging) {
			this.transforms.validate();
		}
	},

	/* --------------------------- *
	 * Select event handlers
	 * --------------------------- */

	_onSelectOneBundle: function(bundle) {
		this.listenTo(bundle.get("media"), this.mediaListeners);
		this.keywordList.filterBy(bundle);
		this.collapsed = true;
	},
	
	_onSelectNoBundle: function() {
		this.touch.off("panstart", this._onHPanStart);
		this.touch.off("vpanstart", this._onVPanStart);
		this.keywordList.clearFilter();
		this.collapsed = false;
	},
	
	_onSelectAnyMedia: function(media) {
		this.collapsed = true;
	},
	
	_onKeywordListSelect: function(keyword) {
		if (!this.collapsed) {
			this.bundleList.filterBy(keyword);
			keywords.select(keyword);
			// this.collapsed = false;
		}
	},
	
	// _onKeywordListSelect_notCollapsed: function(keyword) {
	// 	keywords.select(keyword);
	// 	this.bundleList.filterBy(keyword);
	// },
	
	/* -------------------------------
	 * collapse
	 * ------------------------------- */

	_onCollapseChange: function(collapsed) {
		if (collapsed) {
			this.bundleList.clearFilter();
			keywords.deselect();
		// 	this.stopListening(this.keywordList, "view:select:one view:select:none", this._onKeywordListSelect_notCollapsed);
		// } else {
		// 	this.listenTo(this.keywordList, "view:select:one view:select:none", this._onKeywordListSelect_notCollapsed);
		}
		this.bundleList.setCollapsed(collapsed);
		this.keywordList.setCollapsed(collapsed);
	},
	
	/* --------------------------- *
	 * DOM event handlers
	 * --------------------------- */

	/* -------------------------------
	 * Horizontal touch/move (_onHPan*)
	 * ------------------------------- */

	// _onHPanStart2: function(ev) {
	// 	if (this.collapsed &&
	// 		bundles.selected.get("media").selectedIndex <= 0 &&
	// 		document.body.matches(".desktop-small .default-layout")
	// 		// this.el.matches(".desktop-small.default-layout " + this.el.tagName)
	// 		// window.matchMedia(Globals.BREAKPOINTS["desktop-small"]).matches)
	// 	) {
	// 		var mDest = this.keywordList.wrapper;
	// 		var mTarget = document.querySelector(".carousel .empty-item");
	// 		
	// 		var mObs = new MutationObserver(function(mutations) {
	// 			mDest.style.transform = mTarget.style.transform;
	// 			// var m = /^translate(?:3d)?\(\s*([-\.\d]+)/.exec(mTarget.style.transform);
	// 			// m = m.length? parseFloat(m[1]) : 0;
	// 			// console.log(mTarget.style.transform, m);
	// 		});
	// 		
	// 		var handleMutation = function() {
	// 		};
	// 		
	// 		var handlePanFinal = function() {
	// 			mObs.disconnect();
	// 			mDest.style.transform = "";
	// 			this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE, mDest);
	// 			this.transforms.validate();
	// 			this.touch.off("panend pancancel", handlePanFinal);
	// 		}.bind(this);
	// 		
	// 		mDest.style.transform = mTarget.style.transform;
	// 		mObs.observe(mTarget, {attributes: true, attributeFilter: ["style"]});
	// 		
	// 		this.transforms.clearCapture(mDest);
	// 		this.transforms.stopTransition(mDest);
	// 		this.transforms.validate();
	// 		this.touch.on("panend pancancel", handlePanFinal);
	// 	}
	// },
	
	_onHPanStart: function(ev) {
		if (this.collapsed &&
			bundles.selected.get("media").selectedIndex <= 0 &&
			document.body.matches(".desktop-small .default-layout")
		) {
			this.transforms.stopTransition(this.keywordList.wrapper);
			this.transforms.clearOffset(this.keywordList.wrapper);
			this.transforms.validate();
			
			// this.requestAnimationFrame(function() {
				this.transforms.clearCapture(this.keywordList.wrapper);
				this._onHPanMove(ev);
				
				this.touch.on("panend pancancel", this._onHPanFinal);
				this.touch.on("panmove", this._onHPanMove);
			// });
		}
	},
	
	_onHPanMove: function(ev) {
		// var HPAN_DRAG = 1;
		// var HPAN_DRAG = 0.75;
		var HPAN_DRAG = 720/940;
		var delta = ev.thresholdDeltaX;
		if (bundles.selected.get("media").selectedIndex == -1) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? Globals.HPAN_OUT_DRAG : HPAN_DRAG;
			//delta *= (delta > 0)? 0.40: 0.75;
		} else {//if (media.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? HPAN_DRAG : 0.0;
			//delta *= (delta > 0)? 0.75: 0.00;
		}
		this.transforms.offset(delta, void 0, this.keywordList.wrapper);
		this.transforms.validate();
		// this.requestAnimationFrame(this._validateTransforms);
	},
	
	_onHPanFinal: function(ev) {
		this.touch.off("panmove", this._onHPanMove);
		this.touch.off("panend pancancel", this._onHPanFinal);
		
		// NOTE: transition will be set twice if there is a new selection!
		this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE, this.keywordList.wrapper);
		this.transforms.clearOffset(this.keywordList.wrapper);
		// this.transforms.clearCapture(this.keywordList.wrapper);
		this.transforms.validate();
		// this.requestAnimationFrame(this._validateTransforms);
	},
	
	/* -------------------------------
	 * Vertical touch/move (_onVPan*)
	 * ------------------------------- */
	
	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);

		this.transforms.stopTransition(this.bundleList.el, this.keywordList.el);
		this.transforms.clearCapture(this.bundleList.el, this.keywordList.el);
		this._onVPanMove(ev);
	},
	
	_collapsedOffsetY: Globals.COLLAPSE_OFFSET,
	
	_onVPanMove: function (ev) {
		var delta = ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapse/expand
		var isValidDir = this.collapsed? (delta > 0) : (delta < 0);
		var moveFactor = this.collapsed? 1 - Globals.VPAN_DRAG : Globals.VPAN_DRAG;
		
		delta = Math.abs(delta); // remove sign
		delta *= moveFactor;
		maxDelta *= moveFactor;
		
		if (isValidDir) {
			if (delta > maxDelta) { // overshooting
				delta = ((delta - maxDelta) * Globals.VPAN_OUT_DRAG) + maxDelta;
			} else { // no overshooting
				delta = delta;
			}
		} else {
			delta = (-delta) * Globals.VPAN_OUT_DRAG; // delta is opposite
		}
		delta *= this.collapsed? 0.5 : -1; // reapply sign

		this.transforms.offset(0, delta, this.bundleList.el, this.keywordList.el);
		this.transforms.validate();
		// this.requestAnimationFrame(this._validateTransforms);
	},
	
	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
		
		if (this.willCollapseChange(ev)) {
			this.transforms.runTransition(Globals.TRANSIT_CHANGING,
				this.bundleList.el,
				this.keywordList.el);
			this.transforms.runTransition(
				this.collapsed? Globals.TRANSIT_EXITING : Globals.TRANSIT_ENTERING,
				this.bundleList.wrapper,
				this.keywordList.wrapper,
				this.sitename.el,
				this.hGroupings);
			this.collapsed = !this.collapsed;
		} else {
			this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE,
				this.bundleList.el,
				this.keywordList.el);
		}
		this.transforms.validate();
		// this.requestAnimationFrame(this._validateTransforms);
	},
	
	willCollapseChange: function(ev) {
		return ev.type == "vpanend"? this.collapsed?
			ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
			ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
			false;
	},
	
	/* -------------------------------
	 * Components
	 * ------------------------------- */
	
	assignSitenameButton: function() {
		var view = new View({
			el: "#site-name",
			events: {
				"click a": function (domev) {
					domev.defaultPrevented || domev.preventDefault();
					controller.deselectBundle();
				}
			}
		});
		view.wrapper = view.el.parentElement;
		return view;
	},
	
	/**
	 * bundle-list
	 */
	createBundleList: function() {
		var view = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			collapsed: false,
			filterKey: "bIds",
			filterBy: keywords.selected,
			filterFn: function (bundle, newVal, oldVal) {
				return newVal? newVal.get("bIds").indexOf(bundle.id) !== -1 : true;
			},
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle,
			"view:removed": controller.stopListening
		});
		view.wrapper = view.el.parentElement;
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
			filterKey: "kIds",
			filterBy: bundles.selected,
			filterFn: function (keyword, newVal, oldVal) {
				return newVal? newVal.get("kIds").indexOf(keyword.id) !== -1 : true;
			},
			groupings: {
				collection: types,
				key: "tIds",
				// groupingFn: function (keyword) {
				// 	return keyword.get("tIds");
				// },
			},
		});
		view.wrapper = view.el.parentElement;
		this.listenTo(view, "view:select:one view:select:none", this._onKeywordListSelect);
		return view;
	},
	
	/**
	 * bundle-pager
	 */
	/*createBundlePager: function() {
		// Component: bundle pager
		var view = new CollectionPager({
			id: "bundle-pager",
			className: "folio mutable-faded",
			collection: bundles,
			labelAttribute: "name",
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle,
			"view:removed": controller.stopListening
		});
		return view;
	},*/
});

module.exports = NavigationView;
