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
/** @type {module:app/view/base/TouchManager} */
var TouchManager = require("app/view/base/TouchManager");
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
		
		this.listenTo(this.model, "change", this._onModelChange);
		
		this.bundleListeners = {
			"select:one": this._onSelectOneBundle,
			"select:none": this._onSelectNoBundle,
			"deselect:one": this._onDeselectOneBundle,
			"deselect:none": this._onDeselectNoBundle,
		};
		// this.mediaListeners = {
		// 	"select:one": this._onSelectAnyMedia,
		// 	"select:none": this._onSelectAnyMedia,
		// 	"deselect:one": this._onDeselectAnyMedia,
		// 	"deselect:none": this._onDeselectAnyMedia,
		// };
		
		this.listenTo(controller, {
			"change:before": this._beforeChange,
			"change:after": this._afterChange
		});
		this.listenTo(this, "collapsed:change", this._onCollapsedChange);
		
		this.listenTo(bundles, this.bundleListeners);
		
		// this.skipTransitions = true;
		
		this.sitename = this.createSitenameButton();
		this.bundleList = this.createBundleList();
		this.keywordList = this.createKeywordList();
		this.hGroupings = this.keywordList.el.querySelectorAll(".list-group span");
		this.itemViews = [this.bundleList, this.keywordList];
		
		this.transforms.add(
			this.bundleList.el, this.keywordList.el,
			this.bundleList.wrapper, this.keywordList.wrapper,
			this.sitename.el, this.hGroupings
		);
		
		this._debugViews = [
			this.bundleList.el, this.keywordList.el,
			this.bundleList.wrapper, this.keywordList.wrapper,
			this.sitename.el, this.hGroupings.item(0)];
		// this.clearAllCaptures();
	},
	
	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	renderFrame: function(tstamp) {
		var sizeChanged = this._renderFlags & ContainerView.RENDER_INVALID;
		this._transformsChanged = this._transformsChanged || this._collapsedChanged || this.skipTransitions || sizeChanged;
		
		if (this._collapsedChanged) {
			this.renderCollapsed();
			// if (this.collapsed) {
			// 	keywords.deselect();
			// 	this.bundleList.refresh();
			// }
			// this.bundleList.collapsed = this.collapsed;
			// this.keywordList.collapsed = this.collapsed;
			// this.bundleList.renderNow();
			// this.keywordList.renderNow();
		}
		
		// this.itemViews.forEach(function(view) {
		// 	if (sizeChanged) {
		// 		view.invalidateSize();
		// 	}
		// 	if (view.invalidated) {
		// 		if (this.skipTransitions) {
		// 			view.skipTransitions = this.skipTransitions;
		// 		}
		// 		view.renderNow();
		// 	}
		// }, this);
		
		if (this._transformsChanged) {
			if (this.skipTransitions) {
				this.transforms.stopAllTransitions();
				this.transforms.validate();
			} else {
				// this.transforms.clearAllTransitions();
				this.renderTransitions(bundles.selected,
					bundles.selected? bundles.selected.get("media").selected: null);
			}
			this.transforms.clearOffset(this.bundleList.el, this.keywordList.el, this.keywordList.wrapper);
			// this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
			// this.transforms.clearOffset(this.bundleList.el, this.keywordList.el ,this.bundleList.wrapper, this.keywordList.wrapper);
			if (sizeChanged) {
				this.transforms.clearCapture(this.bundleList.el, this.keywordList.el);
				// this.transforms.clearCapture(this.bundleList.el, this.keywordList.el, this.bundleList.wrapper, this.keywordList.wrapper);
			}
			
			// console.group(this.cid + "::renderFrame transforms.validate");
			// this._debugViews.forEach(function(el) {
			// 	var tx = this.transforms.get(el);
			// 	if (tx) {
			// 		console.log("%s::tx[%s]", this.cid, tx.el.id || tx.id, tx.transition.name || tx.transition);
			// 	}
			// }, this);
			// console.groupEnd();
			
			this.transforms.validate();
		}
		
		if (sizeChanged) {
			this.itemViews.forEach(function(view) {
				view.invalidateSize();
				if (this.skipTransitions) {
					view.skipTransitions = this.skipTransitions;
					view.renderNow();
				}
			}, this);
		}
		
		this.skipTransitions = this._transformsChanged = this._collapsedChanged = false;
		this._renderFlags &= ~ContainerView.RENDER_INVALID;
		
		this._lastBundle = this.model.get("bundle");
		this._lastMedia = this.model.get("media");
	},
	
	invalidateTransforms: function() {
		this._transformsChanged = true;
		this.requestRender();
	},
	
	/* --------------------------- *
	/* model changed
	/* --------------------------- */
	
	_onModelChange: function() {
		console.log("%s::_onModelChange", this.cid, this.model.changed);
		// if (this.model.changed.hasOwnProperty("bundle")) {
		// 	if (this.model.changed.bundle === null) {
		// 		
		// 	} else {
		// 		
		// 	}
		// }
	},
	
	/* --------------------------- *
	/* collection.selected changed
	/* --------------------------- */
	
	_onDeselectOneBundle: function(bundle) {
		// this.stopListening(bundle.get("media"), this.mediaListeners);
	},
	
	_onSelectOneBundle: function(bundle) {
		// this.listenTo(bundle.get("media"), this.mediaListeners);
		this.keywordList.refresh();
		// this.collapsed = true;
	},
	
	/* --------------------------- *
	/* collection.selected changed: null <-> non-null
	/* --------------------------- */
	
	_onDeselectNoBundle: function() {
		this.touch.on("panstart", this._onHPanStart);
		this.touch.on("vpanstart", this._onVPanStart);
	},
	
	_onSelectNoBundle: function() {
		this.touch.off("panstart", this._onHPanStart);
		this.touch.off("vpanstart", this._onVPanStart);
		this.keywordList.refresh();
		// this.collapsed = false;
	},
	
	/* --------------------------- *
	/* keywordList event
	/* --------------------------- */
	
	_onSelectAnyKeyword: function(keyword) {
		keywords.select(keyword);
		this.bundleList.refresh();
	},
	
	/* -------------------------------
	/* collapsed change event
	/* ------------------------------- */
	
	_onCollapsedChange: function(collapsed) {
		console.log("%s::_onCollapsedChange %s", this.cid, collapsed);
		
		if (collapsed) {
			this.stopListening(this.keywordList, "view:select:one view:select:none", this._onSelectAnyKeyword);
			// clear keyword selection when collapsing
			this._onSelectAnyKeyword(null);
		} else {
			this.listenTo(this.keywordList, "view:select:one view:select:none", this._onSelectAnyKeyword);
		}
		
		this.bundleList.collapsed = collapsed;
		this.keywordList.collapsed = collapsed;
	},
	
	/* -------------------------------
	/* Router -> before model change
	/* ------------------------------- */
	
	_beforeChange: function(bundle, media) {
		// console.log("%s::_beforeChange", this.cid, arguments);
		// this._lastBundle = bundles.selected;
		// this._lastMedia = bundles.selected? bundles.selected.get("media").selected: null;
		
		this.collapsed = !!(bundle || media);
		this.invalidateTransforms();
	},
		
	_afterChange: function(bundle, media) {
	},
	
	/* -------------------------------
	/* renderTransitions
	/* ------------------------------- */
	
	// _lastBundle: null,
	
	// _lastMedia: null,
		
	renderTransitions: function(bundle, media) {
		var txMsgTpl = "%s::renderTransitions [%s => %s]";
		var kListTx, bListTx, siteTx, bWrapTx, kWrapTx, hGroupTx;
		
		
		// var bundleChanged = this.model.changed.hasOwnProperty("bundle");
		// var withBundleTo = !!this.model.get("bundle");
		// var withBundleFrom = bundleChanged? !withBundleTo: withBundleTo;
		// var withBundleChanged = withBundleFrom !== withBundleTo;
		// 
		// var mediaChanged = this.model.changed.hasOwnProperty("media");
		// var withMediaTo = !!this.model.get("media");
		// var withMediaFrom = mediaChanged? !withMediaTo: withMediaTo;
		// var withMediaChanged = withMediaFrom !== withMediaTo;
		
		var bundleChanged = this._lastBundle !== bundle;
		var withBundleFrom = !!this._lastBundle;
		var withBundleTo = !!bundle;
		var withBundleChanged = withBundleFrom !== withBundleTo;
		// this._lastBundle = bundle;
		
		var mediaChanged = this._lastMedia !== media;
		var withMediaFrom = !!this._lastMedia;
		var withMediaTo = !!media;
		var withMediaChanged = withMediaFrom !== withMediaTo;
		// this._lastMedia = media;
		
		var collapsedChanged = this._collapsedChanged;
		
		if (collapsedChanged || withBundleChanged) {
			kListTx =	tx.BETWEEN;
			bListTx =	tx.BETWEEN;
		// } else if (withMediaChanged) {
		// 	kListTx =	tx.NOW;
		// 	bListTx =	tx.NOW;
		// } else if (withBundleTo && !this.collapsed) {
		} else {
			kListTx =	tx.NOW;
			bListTx =	tx.NOW;
		}
		
		if (Globals.BREAKPOINTS["desktop-small"].matches) {
			if (withBundleChanged) {
				if (withBundleTo) {
					if (withMediaChanged) {
						if (withMediaTo) {
							// no bundle with no media -> bundle with media
							console.log(txMsgTpl, this.cid, "bm*", "BM*");
							// kListTx =	tx.BETWEEN;
							// bListTx =	tx.BETWEEN;
							siteTx =	tx.BETWEEN;
							kWrapTx =	tx.LAST;
							bWrapTx =	tx.LAST;
							hGroupTx =	tx.LAST;
						} else {
							// no bundle with media -> bundle with no media
							console.error(txMsgTpl, this.cid, "bM*", "Bm*");
						}
					} else {
						if (withMediaTo) {
							// no bundle with media -> bundle with media
							console.error(txMsgTpl, this.cid, "bM*", "BM*");
						} else {
							// no bundle with no media -> bundle with no media
							console.log(txMsgTpl, this.cid, "bm*", "Bm*");
							// kListTx =	tx.BETWEEN;
							// bListTx =	tx.BETWEEN;
							siteTx =	tx.BETWEEN;
							kWrapTx =	tx.FIRST;
							bWrapTx =	tx.FIRST;
							hGroupTx =	tx.LAST;
						}
					}
				} else {
					if (withMediaChanged) {
						if (withMediaTo) {
							// bundle with no media -> no bundle with media
							console.error(txMsgTpl, this.cid, "Bm*", "bM*");
						} else {
							// bundle with media -> no bundle with no media
							console.log(txMsgTpl, this.cid, "BM*", "bm*");
							// kListTx =	tx.BETWEEN;
							// bListTx =	tx.BETWEEN;
							siteTx =	tx.BETWEEN;
							bWrapTx =	tx.LAST;
							kWrapTx =	tx.FIRST;
							hGroupTx =	tx.FIRST;
						}
					} else {
						// bundle with no media -> no bundle with no media
						console.log(txMsgTpl, this.cid, "B**", "b**");
						// kListTx =	tx.BETWEEN;
						// bListTx =	tx.BETWEEN;
						siteTx =	tx.BETWEEN;
						bWrapTx =	tx.LAST;
						kWrapTx =	tx.LAST;
						hGroupTx =	tx.FIRST;
					}
				}
			} else if (withMediaChanged) {
				if (withMediaTo) {
					if (collapsedChanged) {
						if (this.collapsed) {
							// *Mc - *mC with bundle, media expanded -> no media collapsed
							console.log(txMsgTpl, this.cid, "*mc", "*MC");
							// kListTx =	tx.BETWEEN;
							// bListTx =	tx.BETWEEN;
							siteTx =	tx.LAST;
							bWrapTx =	tx.LAST;
							kWrapTx =	tx.LAST;
							hGroupTx =	tx.LAST;
						}
					} else {
						// *m* - *M* with bundle, no media -> media
						console.log(txMsgTpl, this.cid, "*m*", "*M*");
						kWrapTx =	bundleChanged? tx.BETWEEN : tx.NOW;
					}
				} else {
					if (collapsedChanged) {
						if (this.collapsed) {
							// *Mc - *mC with bundle, media expanded -> no media collapsed
							console.log(txMsgTpl, this.cid, "*Mc", "*mC");
							// kListTx =	tx.BETWEEN;
							// bListTx =	tx.BETWEEN;
							siteTx =	tx.LAST;
							bWrapTx =	tx.LAST;
							kWrapTx =	tx.LAST;
							hGroupTx =	tx.LAST;
						} else {
							// *MC - *mc with bundle, media collapsed -> no media expanded
							console.warn(txMsgTpl, this.cid, "*MC", "*mc");
						}
					} else {
						kWrapTx =	bundleChanged? tx.BETWEEN : tx.NOW;
						// *M* - *m* with bundle, media -> no media");
						console.log(txMsgTpl, this.cid, "*M*", "*m*");
					}
				}
			} else if (collapsedChanged) {
				if (this.collapsed) {
					// **c - **C with bundle with no media: expanded -> collapsed
					console.log(txMsgTpl, this.cid, "**c", "**C");
					// kListTx =	tx.BETWEEN;
					// bListTx =	tx.BETWEEN;
					siteTx =	tx.LAST;
					bWrapTx =	tx.LAST;
					hGroupTx =	tx.LAST;
					if (withMediaTo) {
						kWrapTx =	tx.LAST;
					}
				} else {
					// **C - **c collapsed -> expanded
					console.log(txMsgTpl, this.cid, "**C", "**c");
					// kListTx =	tx.BETWEEN;
					// bListTx =	tx.BETWEEN;
					siteTx =	tx.FIRST;
					bWrapTx =	tx.FIRST;
					hGroupTx =	tx.FIRST;
					if (withMediaTo) {
						kWrapTx =	tx.FIRST;
					}
				}
			}
		} else {
			if (withBundleChanged) {
				console.log(txMsgTpl, this.cid, "s:B**", "s:B**");
				siteTx =	tx.BETWEEN;
				// kListTx =	tx.BETWEEN;
				// bListTx =	tx.BETWEEN;
			} else {
				console.log(txMsgTpl, this.cid, "s:***", "s:***");
				// kListTx =	tx.BETWEEN;
				// bListTx =	tx.BETWEEN;
			}
		}
		if (!(kListTx || bListTx || siteTx || bWrapTx || kWrapTx || hGroupTx)) {
			console.log("%s::renderTransitions [unchanged]", this.cid);
		}
		
		this.transforms.runTransition(kListTx, this.keywordList.el);
		this.transforms.runTransition(bListTx, this.bundleList.el);
		this.transforms.runTransition(siteTx, this.sitename.el);
		this.transforms.runTransition(kWrapTx, this.keywordList.wrapper);
		this.transforms.runTransition(bWrapTx, this.bundleList.wrapper);
		this.transforms.runTransition(hGroupTx, this.hGroupings);
		
		// kListTx && this.transforms.runTransition(kListTx, this.keywordList.el);
		// bListTx && this.transforms.runTransition(bListTx, this.bundleList.el);
		// siteTx && this.transforms.runTransition(siteTx, this.sitename.el);
		// kWrapTx && this.transforms.runTransition(kWrapTx, this.keywordList.wrapper);
		// bWrapTx && this.transforms.runTransition(bWrapTx, this.bundleList.wrapper);
		// hGroupTx && this.transforms.runTransition(hGroupTx, this.hGroupings);
		
	},
	
	/* -------------------------------
	/* Horizontal touch/move (_onHPan*)
	/* ------------------------------- */
	
	_onHPanStart: function(ev) {
		if (this.collapsed &&
			bundles.selected.get("media").selectedIndex <= 0 &&
			Globals.BREAKPOINTS["desktop-small"].matches
			// document.body.matches(".desktop-small .default-layout")
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
		
		// // NOTE: transition will be set twice if there is a new selection!
		this.transforms.clearOffset(this.keywordList.wrapper);
		this.transforms.runTransition(tx.NOW, this.keywordList.wrapper);
		this.transforms.validate();
		
		// this._onHPanMove(ev);
		// this.invalidateTransforms();
		// this.renderNow();
		
	},
	
	/* -------------------------------
	/* Vertical touch/move (_onVPan*)
	/* ------------------------------- */
	
	_collapsedOffsetY: Globals.COLLAPSE_OFFSET,
	
	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.stopTransition(this.bundleList.el, this.keywordList.el);
		this.transforms.clearCapture(this.bundleList.el, this.keywordList.el);
		// this.el.classList.add("container-changing");
		this._onVPanMove(ev);
	},
	
	_onVPanMove: function (ev) {
		var delta = ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapsed/expand
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
		
		this._onVPanMove(ev);
		
		if (this.willCollapsedChange(ev)) {
			this.model.set("collapsed", !this.model.get("collapsed"));
			this.collapsed = !this.collapsed;
		}
		this.invalidateTransforms();
	},
	
	willCollapsedChange: function(ev) {
		return ev.type == "vpanend"? this.collapsed?
			ev.thresholdDeltaY > Globals.COLLAPSE_THRESHOLD :
			ev.thresholdDeltaY < -Globals.COLLAPSE_THRESHOLD :
			false;
	},
	
	/* -------------------------------
	/* Components
	/* ------------------------------- */
	
	createSitenameButton: function() {
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
			// filterKey: "bIds", filterBy: keywords.selected,
			filterFn: function(bundle, index, arr) {
				return keywords.selected? bundle.get("kIds").indexOf(keywords.selected.id) !== -1 : false;
			},
		});
		controller.listenTo(view, {
			// "view:removed": controller.stopListening
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle,
		});
		// this.listenTo(view, {
		// 	// "view:removed": this.stopListening,
		// 	"view:select:none": function() {
		// 		if (bundles.selected && !this.collapsed) {
		// 			this.collapsed = true;
		// 			// this.invalidateTransforms();
		// 		}
		// 	},
		// });
		this.listenTo(view, "all", function(evName, model) {
			console.log("%s::[%s] model: %s", view.cid, evName, model? model.cid: model);
		});
		view.wrapper = view.el.parentElement;
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
			// filterKey: "kIds", filterBy: bundles.selected,
			filterFn: function(item, idx, arr) {
				return bundles.selected? (bundles.selected.get("kIds").indexOf(item.id) !== -1) : false;
			},
			// groupings: {collection: types, key: "tIds"},
			groupingFn: function(item, idx, arr) {
				return types.get(item.get("tId"));
			},
		});
		this.listenTo(view, "all", function(evName, model) {
			console.log("%s::[%s] model: %s", view.cid, evName, model? model.cid: model);
		});
		this.listenTo(view, "view:select:one view:select:none", this._onSelectAnyKeyword);
		view.wrapper = view.el.parentElement;
		return view;
	},
});

module.exports = NavigationView;
