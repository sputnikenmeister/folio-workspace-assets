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

var tx = Globals.transitions;

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
		this.sitename = this.assignSitenameButton();
		this.bundleList = this.createBundleList();
		this.keywordList = this.createKeywordList();
		this.hGroupings = this.keywordList.el.querySelectorAll(".list-group span");
		this.itemViews = [this.bundleList, this.keywordList];
		// this.bundleList.renderNow();
		// this.keywordList.renderNow();
		
		this.transforms.add(
			this.bundleList.el, this.keywordList.el,
			this.bundleList.wrapper, this.keywordList.wrapper,
			this.sitename.el, this.hGroupings
		);
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
	
	// renderLater: function(bundle, media) {
	// 	if (this._transformsChanged) {
	// 		this._transformsChanged = false;
	// 		this.transforms.validate();
	// 	}
	// },
	
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
	
	// _beforeChange: function(bundle, media) {
	// 	// var hasBundleChanged = (!!bundle) !== (!!bundles.selected);
	// 	this._bundleChanging = (bundle !== bundles.selected);
	// 	this._bundleChangeDelay = (bundle !== bundles.selected) && (bundle && bundles.selected) && !this.collapsed;
	// },
	// 
	// _afterChange: function(bundle, media) {
	// 	this._bundleChanging = false;
	// 	this._bundleChangeDelay = false;
	// 	
	// 	this.transforms.validate();
	// },
	
	/* --------------------------- *
	/* Deselect event handlers
	/* --------------------------- */
	
	_onDeselectOneBundle: function(bundle) {
		this.stopListening(bundle.get("media"), this.mediaListeners);
		
		// this.transforms.runTransition(
		// 	tx.BETWEEN, // tx.FIRST,
		// 	this.bundleList.el,
		// 	this.keywordList.el);
		// 
		// if (this._bundleChangeDelay) {
		// 	this.transforms.runTransition(
		// 		tx.AFTER,
		// 		this.sitename.el,
		// 		this.keywordList.wrapper,
		// 		this.bundleList.wrapper,
		// 		this.hGroupings);
		// } else {
		// 	this.transforms.runTransition(
		// 		this.collapsed? tx.BETWEEN : tx.LAST,
		// 		this.sitename.el);
		// 	this.transforms.runTransition(
		// 		this.collapsed? tx.FIRST : tx.LAST,
		// 		this.keywordList.wrapper,
		// 		this.bundleList.wrapper,
		// 		this.hGroupings);
		// }
		
		// this.transforms.validate();
	},
	
	_onDeselectNoBundle: function() {
		this.touch.on("panstart", this._onHPanStart);
		this.touch.on("vpanstart", this._onVPanStart);
		
		// this.transforms.runTransition(
		// 	tx.BETWEEN,
		// 	this.bundleList.el,
		// 	this.keywordList.el);
		// this.transforms.runTransition(
		// 	tx.BETWEEN,
		// 	this.sitename.el);
		// this.transforms.runTransition(
		// 	tx.LAST,
		// 	this.hGroupings);
		// this.transforms.runTransition(
		// 	tx.LAST,
		// 	this.bundleList.wrapper,
		// 	this.keywordList.wrapper);
		
		// this.transforms.validate();
	},
	
	_onDeselectAnyMedia: function(media) {
		if (this.collapsed) {
			this.transforms.clearOffset(this.keywordList.wrapper);
		// 	this.transforms.runTransition(
		// 		tx.NOW,
		// 		this.keywordList.wrapper);
		// } else {
		// 	this.transforms.runTransition(
		// 		tx.BETWEEN,
		// 		this.bundleList.el,
		// 		this.keywordList.el);
		// 	this.transforms.runTransition(
		// 		tx.LAST,
		// 		this.bundleList.wrapper,
		// 		this.keywordList.wrapper,
		// 		this.sitename.el,
		// 		this.hGroupings);
		}
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
			keywords.deselect();
			this.bundleList.refresh();
		}
		this.bundleList.collapsed = collapsed;
		this.keywordList.collapsed = collapsed;
	},
	
	/* -------------------------------
	/* renderTransforms
	/* ------------------------------- */
	
	_beforeChange: function(bundle, media) {
		this._lastCollapsed = this.collapsed;
	},
		
	_afterChange: function(bundle, media) {
		this.renderTransitions(bundle, media);
	},
		
	renderTransitions: function(bundle, media) {
		// var bundleChanged = bundle !== bundles.selected;
		var withBundleFrom = !!this._lastBundle;
		var withBundleTo = !!bundle;
		var withBundleChanged = withBundleFrom !== withBundleTo;
		// var withBundleChanged = (!!bundle) !== (!!bundles.selected);
		
		// var mediaChanged = media !== media.selected;
		var withMediaFrom = !!this._lastMedia;
		var withMediaTo = !!media;
		var withMediaChanged = withMediaFrom !== withMediaTo;
		// var withMediaChanged = (!!media) !== (!!media.selected);
		
		var collapseChanged = this._lastCollapsed !== this.collapsed;
			// || (!(withBundleChanged || withMediaChanged) && !this.collapsed);
		
		this._lastBundle = bundle;
		this._lastMedia = media;
		
		// These two are always between
		
		var kListTx, bListTx, siteTx, bWrapTx, kWrapTx, hGroupTx;
		// kListTx = bListTx = tx.BETWEEN;
		// siteTx = bWrapTx = kWrapTx = hGroupTx = tx.BETWEEN;
		
		if (withBundleChanged) {
			if (withBundleTo) {
				if (withMediaChanged) {
					if (withMediaTo) {
						// console.log("Controller: no bundle with no media -> bundle with media");
						console.log("Controller: bm* - BM*");
						kListTx =	tx.BETWEEN;
						bListTx =	tx.BETWEEN;
						siteTx =	tx.BETWEEN;
						kWrapTx =	tx.LAST;
						bWrapTx =	tx.LAST;
						hGroupTx =	tx.LAST;
					} else {
						// console.error("Controller: no bundle with media -> bundle with no media");
						console.error("Controller: bM* - Bm*");
					}
				} else {
					if (withMediaTo) {
						// console.error("Controller: no bundle with media -> bundle with media");
						console.error("Controller: bM* - BM*");
					} else {
						// console.log("Controller: no bundle with no media -> bundle with no media");
						console.log("Controller: bm* - Bm*");
						kListTx =	tx.BETWEEN;
						bListTx =	tx.BETWEEN;
						siteTx =	tx.BETWEEN;
						kWrapTx =	tx.FIRST;
						bWrapTx =	tx.FIRST;
						hGroupTx =	tx.LAST;
					}
				}
			} else {
				if (withMediaChanged) {
					if (withMediaTo) {
						// console.error("Controller: bundle with no media -> no bundle with media");
						console.error("Controller: Bm* - bM*");
					} else {
						// console.log("Controller: bundle with media -> no bundle with no media");
						console.log("Controller: BM* - bm*");
						kListTx =	tx.BETWEEN;
						bListTx =	tx.BETWEEN;
						siteTx =	tx.BETWEEN;
						bWrapTx =	tx.LAST;
						kWrapTx =	tx.FIRST;
						hGroupTx =	tx.FIRST;
					}
				} else {
					// console.log("Controller: bundle with no media -> no bundle with no media");
					console.log("Controller: B** - b**");
					kListTx =	tx.BETWEEN;
					bListTx =	tx.BETWEEN;
					siteTx =	tx.BETWEEN;
					bWrapTx =	tx.LAST;
					kWrapTx =	tx.LAST;
					hGroupTx =	tx.FIRST;
				}
			}
		} else if (withMediaChanged) {
			if (withMediaTo) {
				kWrapTx =	tx.NOW;
				// console.log("Controller: *m* - *M* with bundle, no media -> media");
				console.log("Controller: *m* - *M* ");
			} else {
				if (collapseChanged) {
					if (this.collapsed) {
						// console.log("Controller: *Mc - *mC with bundle, media expanded -> no media collapsed");
						console.log("Controller: *Mc - *mC");
						kListTx =	tx.BETWEEN;
						bListTx =	tx.BETWEEN;
						siteTx =	tx.LAST;
						bWrapTx =	tx.LAST;
						kWrapTx =	tx.LAST;
						hGroupTx =	tx.LAST;
					} else {
						// console.warn("Controller: *MC - *mc with bundle, media collapsed -> no media expanded");
						console.warn("Controller: *MC - *mc");
					}
				} else {
					kWrapTx =	tx.NOW;
					// console.log("Controller: *M* - *m* with bundle, media -> no media");
					console.log("Controller: *M* - *m*");
				}
			}
		} else if (collapseChanged) {
			if (this.collapsed) {
				// console.log("Controller: **c - **C with bundle with no media: expanded -> collapsed");
				console.log("Controller: **c - **C");
				kListTx =	tx.BETWEEN;
				bListTx =	tx.BETWEEN;
				siteTx =	tx.LAST;
				bWrapTx =	tx.LAST;
				kWrapTx =	tx.LAST; // will not change
				hGroupTx =	tx.LAST;
			} else {
				// console.error("Controller: **C - **c collapsed -> expanded");
				console.error("Controller: **C - **c");
			}
		}
		if (kListTx || bListTx || siteTx || bWrapTx || kWrapTx || hGroupTx) {
		// if (withBundleChanged || withMediaChanged || collapseChanged) {
			kListTx && this.transforms.runTransition(kListTx, this.keywordList.el);
			bListTx && this.transforms.runTransition(bListTx, this.bundleList.el);
			siteTx && this.transforms.runTransition(siteTx, this.sitename.el);
			kWrapTx && this.transforms.runTransition(kWrapTx, this.keywordList.wrapper);
			bWrapTx && this.transforms.runTransition(bWrapTx, this.bundleList.wrapper);
			hGroupTx && this.transforms.runTransition(hGroupTx, this.hGroupings);
			// this._transformsChanged = true;
			this.transforms.validate();
		} else {
			console.log("Controller: no layout change");
		}
		// console.log("Controller: \t-- ");
		// console.log("Controller: \t-- collapsed: %s -> %s", this._lastCollapsed, this.collapsed);
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
		} else {//if (media.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? HPAN_DRAG : 0.0;
		}
		this.transforms.offset(delta, void 0, this.keywordList.wrapper);
		this.transforms.validate();
	},
	
	_onHPanFinal: function(ev) {
		this.touch.off("panmove", this._onHPanMove);
		this.touch.off("panend pancancel", this._onHPanFinal);
		
		// NOTE: transition will be set twice if there is a new selection!
		this.transforms.runTransition(tx.NOW, this.keywordList.wrapper);
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
			this.transforms.runTransition(tx.BETWEEN,
				this.bundleList.el,
				this.keywordList.el);
			this.transforms.runTransition(
				this.collapsed? tx.FIRST : tx.LAST,
				this.bundleList.wrapper,
				this.keywordList.wrapper,
				this.sitename.el,
				this.hGroupings);
			this.collapsed = !this.collapsed;
		} else {
			this.transforms.runTransition(tx.NOW,
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
		// view.requestRender();
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
		// view.requestRender();
		this.listenTo(view, "view:select:one view:select:none", this._onKeywordListSelect);
		return view;
	},
});

module.exports = NavigationView;
