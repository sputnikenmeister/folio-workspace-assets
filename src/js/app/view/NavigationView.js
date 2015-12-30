/* global MutationObserver */
/**
/* @module app/view/NavigationView
/*/

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
/* @constructor
/* @type {module:app/view/NavigationView}
/*/
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
		
		// this.skipTransitions = true;
	},
	
	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	/** @override */
	render: function () {
		this.transforms.stopAllTransitions();
		this.transforms.validate();
		this.itemViews.forEach(function(view) {
			view.skipTransitions = true;
			view.render();
		}, this);
		return ContainerView.prototype.render.apply(this, arguments);
	},
	
	// renderLater: function() {
	// 	ContainerView.prototype.renderLater.apply(this, arguments);
	// 	
	// 	if (this.skipTransitions) {
	// 		this.transforms.stopAllTransitions();
	// 		this._transformsChanged = true;
	// 	}
	// 	if (this._transformsChanged) {
	// 		this._transformsChanged = false;
	// 		this.transforms.validate();
	// 	}
	// 	this.skipTransitions = false;
	// },
	// invalidateTransforms: function() {
	// 	this._transformsChanged = true;
	// 	this.requestRender();
	// },
	
	/* -------------------------------
	/* Router -> before model change
	/* ------------------------------- */
	
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
		
		// this.invalidateTransforms();
	},
	
	_afterChange: function(bundle, media) {
		this._bundleChanging = false;
		this._bundleChangeDelay = false;
		
		// this.bundleList.renderNow();
		// this.keywordList.renderNow();
		// this.requestAnimationFrame(function() {
		//	this.transforms.validate();
		//	this.renderNow();
		// });
		
		
		// this.bundleList.requestRender();
		// this.keywordList.requestRender();
		
		this.transforms.validate();
	},
	
	/* --------------------------- *
	/* Deselect event handlers
	/* --------------------------- */
	 
	_onDeselectOneBundle: function(bundle) {
		this.stopListening(bundle.get("media"), this.mediaListeners);
		
		// console.log("NavigationView._onDeselectOneBundle(" + bundle.cid + ")");
		// this.transforms.captureAll();
		// this.transforms.clearAllCaptures();
		this.transforms.runTransition(
			Globals.TRANSIT_CHANGING, // Globals.TRANSIT_EXITING,
			this.bundleList.el,
			this.keywordList.el);
		
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
		
		// this.transforms.validate();
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
		
		// this.transforms.validate();
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
		// if (!this._bundleChanging) {
		// 	this.transforms.validate();
		// }
	},
	
	/* --------------------------- *
	/* Select event handlers
	/* --------------------------- */
	
	_onSelectOneBundle: function(bundle) {
		this.listenTo(bundle.get("media"), this.mediaListeners);
		this.keywordList.refresh();
		this.collapsed = true;
	},
	
	_onSelectNoBundle: function() {
		this.touch.off("panstart", this._onHPanStart);
		this.touch.off("vpanstart", this._onVPanStart);
		this.keywordList.refresh();
		this.collapsed = false;
	},
	
	_onSelectAnyMedia: function(media) {
		this.collapsed = true;
	},
	
	_onKeywordListSelect: function(keyword) {
		if (!this.collapsed) {
			keywords.select(keyword);
			this.bundleList.refresh();
		}
	},
	
	/* -------------------------------
	/* collapse
	/* ------------------------------- */

	_onCollapseChange: function(collapsed) {
		if (collapsed) {
			// this.bundleList.clearFilter();
			keywords.deselect();
			this.bundleList.refresh();
		}
		this.bundleList.collapsed = collapsed;
		this.keywordList.collapsed = collapsed;
	},
	
	/* -------------------------------
	/* Horizontal touch/move (_onHPan*)
	/* ------------------------------- */
	
	_onHPanStart: function(ev) {
		if (this.collapsed &&
			bundles.selected.get("media").selectedIndex <= 0 &&
			document.body.matches(".desktop-small .default-layout")
		) {
			this.transforms.stopTransition(this.keywordList.wrapper);
			this.transforms.clearOffset(this.keywordList.wrapper);
			this.transforms.validate();
			this.transforms.clearCapture(this.keywordList.wrapper);
			
			this._onHPanMove(ev);
			
			this.touch.on("panend pancancel", this._onHPanFinal);
			this.touch.on("panmove", this._onHPanMove);
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
	},
	
	_onHPanFinal: function(ev) {
		this.touch.off("panmove", this._onHPanMove);
		this.touch.off("panend pancancel", this._onHPanFinal);
		
		// NOTE: transition will be set twice if there is a new selection!
		this.transforms.runTransition(Globals.TRANSIT_IMMEDIATE, this.keywordList.wrapper);
		this.transforms.clearOffset(this.keywordList.wrapper);
		this.transforms.validate();
	},
	
	/* -------------------------------
	/* Vertical touch/move (_onVPan*)
	/* ------------------------------- */
	
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
	},
	
	willCollapseChange: function(ev) {
		return ev.type == "vpanend"? this.collapsed?
			ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
			ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
			false;
	},
	
	/* -------------------------------
	/* Components
	/* ------------------------------- */
	
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
	/* bundle-list
	/*/
	createBundleList: function() {
		var view = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			collapsed: false,
			filterFn: function(bundle, index, arr) {
				return keywords.selected? bundle.get("kIds").indexOf(keywords.selected.id) !== -1 : false;
			},
			// filterKey: "bIds", filterBy: keywords.selected,
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle,
			"view:removed": controller.stopListening
		});
		view.wrapper = view.el.parentElement;
		view.requestRender();
		return view;
	},

	/**
	/* keyword-list
	/*/
	createKeywordList: function() {
		var view = new GroupingListView({
			el: "#keyword-list",
			collection: keywords,
			collapsed: false,
			filterFn: function(item, idx, arr) {
				return bundles.selected? (bundles.selected.get("kIds").indexOf(item.id) !== -1) : false;
			},
			groupingFn: function(item, idx, arr) {
				return types.get(item.get("tId"));
			},
			// filterKey: "kIds", filterBy: bundles.selected,
			// groupings: { collection: types,	key: "tIds", },
		});
		view.wrapper = view.el.parentElement;
		view.requestRender();
		this.listenTo(view, "view:select:one view:select:none", this._onKeywordListSelect);
		return view;
	},
	
	/**
	/* bundle-pager
	/*/
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
