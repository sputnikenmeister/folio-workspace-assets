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
/** @type {module:utils/TransformHelper} */
var TransformHelper = require("utils/TransformHelper");
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
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("app/view/component/GroupingListView");
/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("app/view/component/CollectionPager");
/** @type {module:app/view/component/CollectionPager} */
var GraphView = require("app/view/component/GraphView");

/** @type {module:utils/css/parseTransformMatrix} */
var parseMatrix = require("utils/css/parseTransformMatrix");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("utils/prefixedProperty");

var tx = Globals.transitions;

/**
/* @constructor
/* @type {module:app/view/NavigationView}
/*/
var NavigationView = View.extend({
	
	/** @override */
	cidPrefix: "navigationView",
	
	/** @override */
	className: "container-x container-expanded",
	
	/** @override */
	initialize: function (options) {
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		_.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");
		
		this.itemViews = [];
		this.transforms = new TransformHelper();
		this.touch = TouchManager.getInstance();
		
		this.listenTo(this.model, "change", this._onModelChange);
		
		this.sitename = this.createSitenameButton();
		this.transforms.add(this.sitename.el);
		
		this.bundleList = this.createBundleList();
		this.transforms.add(this.bundleList.el);
		this.itemViews.push(this.bundleList);
		
		this.keywordList = this.createKeywordList();
		this.hGroupings = this.keywordList.el.querySelectorAll(".list-group span");
		this.transforms.add(this.hGroupings, this.keywordList.el);
		this.itemViews.push(this.keywordList);
		
		// this.graph = this.createGraphView();
		// this.itemViews.push(this.graph);
		// this.transforms.add(this.graph.el);
		
		// add wrappers last
		this.transforms.add(this.bundleList.wrapper, this.keywordList.wrapper);
	},
	
	/* --------------------------- *
	/* Render
	/* --------------------------- */
	
	renderFrame: function(tstamp, flags) {
		// values
		var collapsed = this.model.get("collapsed");
		var collapsedChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("collapsed");
		
		// flags
		var sizeChanged = !!(flags & View.SIZE_INVALID);
		var transformsChanged = !!(flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID));
		transformsChanged = transformsChanged || this._transformsChanged || this.skipTransitions;
		
		// classes
		// - - - - - - - - - - - - - - - - -
		if (collapsedChanged) {
			this.el.classList.toggle("container-collapsed", collapsed);
			this.el.classList.toggle("container-expanded", !collapsed);
		}
		
		// transforms
		// - - - - - - - - - - - - - - - - -
		if (transformsChanged) {
			if (this.skipTransitions) {
				this.transforms.stopAllTransitions();
				this.transforms.validate();
				this.transforms.clearAllOffsets();
			} else {
				this.renderTransitions(flags);
			}
			console.group(this.cid + "::renderFrame transitions:");
			if (this.skipTransitions) {
				console.log("[skipping]");
			} else {
				this.transforms.items.forEach(function(o) {
					console.log("\t%s: %s", o.el.id || o.id, o.transition.name || o.transition);
				}, this);
			}
			console.groupEnd();
			
			this.transforms.validate();
		}
		
		// children A
		// - - - - - - - - - - - - - - - - -
		// if (collapsedChanged) {
		// 	this.bundleList.collapsed = collapsed;
		// 	this.keywordList.collapsed = collapsed;
		// 	this.graph && this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
		// }
		// 
		// if (sizeChanged)
		// 	this.itemViews.forEach(function(view) {
		// 		// view.skipTransitions = this.skipTransitions;
		// 		// view.invalidateSize();
		// 		// view.renderNow();
		// 		view.skipTransitions = true;
		// 		view.requestRender(View.SIZE_INVALID).renderNow();
		// }, this);
		
		// children B
		// - - - - - - - - - - - - - - - - -
		// var value;
		if (flags & View.MODEL_INVALID) {
			if (this.model.hasChanged("collapsed")) {
				// value = this.model.get("collapsed");
				// this.bundleList.collapsed = value;
				// this.keywordList.collapsed = value;
				this.graph && this.graph.requestRender(View.SIZE_INVALID);
			}
			if (this.model.hasChanged("bundle")) {
				this.bundleList.requestRender(View.SIZE_INVALID);
				this.keywordList.requestRender(View.SIZE_INVALID);
			}
		}
		this.itemViews.forEach(function(view) {
			view.skipTransitions = view.skipTransitions || this.skipTransitions;
			if (flags & View.SIZE_INVALID) {
				view.requestRender(View.SIZE_INVALID);
			}
			// if (transformsChanged) {
			// 	view.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
			// }
			if (!view.skipTransitions) {
				view.renderNow();
			}
		}, this);
		
		this.skipTransitions = this._transformsChanged = false;
	},
	
	/* -------------------------------
	/* renderTransitions
	/* ------------------------------- */
		
	renderTransitions: function(flags) {
		var modelChanged = (flags & View.MODEL_INVALID);
		// bundle
		var withBundle = this.model.get("withBundle");
		var bundleChanged = modelChanged && this.model.hasChanged("bundle");
		var withBundleChanged = modelChanged && this.model.hasChanged("withBundle");
		// media
		var withMedia = this.model.get("withMedia");
		var mediaChanged = modelChanged && this.model.hasChanged("media");
		var withMediaChanged = modelChanged && this.model.hasChanged("withMedia");
		// collapsed
		var collapsed = this.model.get("collapsed");
		var collapsedChanged = modelChanged && this.model.hasChanged("collapsed");
		
		
		// Vertical translation:
		// bundleList, keywordList
		// - - - - - - - - - - - - - - - - -
		/* this.sitename.el */
		if (withBundleChanged) {
			// this.transforms.runTransition(tx.BETWEEN, this.sitename.el);
			this.transforms.runTransition(collapsed? tx.FIRST_LATE : tx.LAST_EARLY, this.sitename.el);
		} else if (collapsedChanged && Globals.BREAKPOINTS["desktop-small"].matches) {
			this.transforms.runTransition(collapsed? tx.LAST : tx.FIRST, this.sitename.el);
		}
		
		/* this.bundleList */
		var bListTf = this.transforms.get(this.bundleList.el);
		// if (withBundleChanged || (collapsedChanged && bListTf.hasOffset)) {
		// 	bListTf.runTransition(tx.BETWEEN);
		// } else
		if (bListTf.hasOffset) {
			bListTf.runTransition(collapsedChanged? tx.BETWEEN : tx.NOW);
		}
		if (bListTf.hasOffset) {
			bListTf.clearOffset();
		}
		
		/* this.keywordList */
		// var isDesktopLayout = Globals.BREAKPOINTS["desktop-small"].matches;
		var kListTf = this.transforms.get(this.keywordList.el);
		// if (collapsedChanged || (collapsedChanged && (kListTf.hasOffset || Globals.BREAKPOINTS["desktop-small"].matches))) {
		// 	kListTf.runTransition(tx.BETWEEN);
		// } else
		if (kListTf.hasOffset) {
			kListTf.runTransition(collapsedChanged? tx.BETWEEN : tx.NOW);
			// kListTf.runTransition(tx.NOW);
		}
		if (kListTf.hasOffset) {
			kListTf.clearOffset();
		}
		// /* this.graph */
		// var graphTf = this.transforms.get(this.graph.el);
		// if (withBundleChanged || (collapsedChanged && graphTf.hasOffset)) {
		// 	graphTf.runTransition(tx.BETWEEN);
		// } else if (graphTf.hasOffset) {
		// 	graphTf.runTransition(tx.NOW);
		// }
		// if (graphTf.hasOffset) {
		// 	graphTf.clearOffset();
		// }
		
		// Horizontal translation:
		// sitename, wrappers (bundleList, keywordList), groups (keywordList)
		// - - - - - - - - - - - - - - - - -
		if (Globals.BREAKPOINTS["desktop-small"].matches) {
			/* this.keywordList.wrapper */
			var kWrapTf = this.transforms.get(this.keywordList.wrapper);
			if (collapsedChanged) {
				if (withBundleChanged) {
					if (withMediaChanged)
						kWrapTf.runTransition(withBundle? tx.LAST : tx.FIRST);
				} else {
					if (withMedia)
						kWrapTf.runTransition(collapsed? tx.LAST : tx.FIRST);
				}
			} else {
				if (!withBundleChanged && withMediaChanged)
					kWrapTf.runTransition(bundleChanged? tx.BETWEEN : tx.NOW);
			}
			if (kWrapTf.hasOffset) {
				kWrapTf.clearOffset();
			}
			/* this.hGroupings */
			if (collapsedChanged) {
				this.transforms.runTransition(collapsed? tx.LAST : tx.FIRST, this.hGroupings);
			}
			
			/* this.bundleList.wrapper */
			if (collapsedChanged ^ withBundleChanged) { // either but not both
				// invert condition if collapsedChanged
				this.transforms.runTransition(collapsed ^ collapsedChanged? tx.FIRST : tx.LAST, this.bundleList.wrapper);
			}
			// /* this.sitename.el */
			// if (withBundleChanged) {
			// 	// this.transforms.runTransition(collapsed? tx.FIRST : tx.LAST, this.sitename.el);
			// 	this.transforms.runTransition(tx.BETWEEN, this.sitename.el);
			// } else if (collapsedChanged) {
			// 	this.transforms.runTransition(collapsed? tx.LAST : tx.FIRST, this.sitename.el);
			// 	// this.transforms.runTransition(collapsed? tx.FIRST : tx.LAST, this.sitename.el);
			// }
			// // if (collapsedChanged || withBundleChanged) { // either but not both
			// // 	// invert condition if withBundleChanged
			// // 	this.transforms.runTransition(collapsed ^ withBundleChanged? tx.LAST : tx.FIRST, this.sitename.el);
			// // }
		} else {
			// /* this.sitename.el */
			// if (withBundleChanged) {
			// 	// this.transforms.runTransition(collapsed? tx.FIRST : tx.LAST, this.sitename.el);
			// 	this.transforms.runTransition(tx.BETWEEN, this.sitename.el);
			// }
		}
	},
	
	/* --------------------------- *
	/* model changed
	/* --------------------------- */
	
	_onModelChange: function() {
		if (this.model.hasChanged("collapsed")) {
			if (this.model.get("collapsed")) {
				// clear keyword selection
				keywords.deselect(); 
			}
			this.keywordList.collapsed = this.bundleList.collapsed = this.model.get("collapsed");
		}
		if (this.model.hasChanged("bundle")) {
			this.keywordList.refresh();
		}
		if (this.model.hasChanged("withBundle")) {
			if (this.model.get("withBundle")) {
				this.touch.on("vpanstart", this._onVPanStart);
				this.touch.on("panstart", this._onHPanStart);
			} else {
				this.touch.off("vpanstart", this._onVPanStart);
				this.touch.off("panstart", this._onHPanStart);
			}
		}
		this.requestRender(View.MODEL_INVALID);
	},
	
	/* --------------------------- *
	/* keywordList event
	/* --------------------------- */
	
	_onKeywordListChange: function(keyword) {
		if (!this.model.get("collapsed")) {
			keywords.select(keyword);
		}
	},
	
	_onKeywordSelect: function(keyword) {
		// use collection listener to avoid redundant refresh calls
		this.bundleList.refresh();
	},
	
	/* -------------------------------
	/* Horizontal touch/move (HammerJS)
	/* ------------------------------- */
		
	_onHPanStart: function(ev) {
		if (Globals.BREAKPOINTS["desktop-small"].matches && this.model.get("bundle").get("media").selectedIndex <= 0 && this.model.get("collapsed")) {
			this.touch.on("panmove", this._onHPanMove);
			this.touch.on("panend pancancel", this._onHPanFinal);
			
			this.transforms.get(this.keywordList.wrapper)
				.stopTransition()
				.clearOffset()
				.validate()
				.clearCapture();
			// this.transforms.stopTransition(this.keywordList.wrapper);
			// this.transforms.clearOffset(this.keywordList.wrapper);
			// this.transforms.validate();
			// this.transforms.clearCapture(this.keywordList.wrapper);
			this._onHPanMove(ev);
		}
	},
	
	_onHPanMove: function(ev) {
		// var HPAN_DRAG = 1;
		// var HPAN_DRAG = 0.75;
		var HPAN_DRAG = 720/920;
		var delta = ev.thresholdDeltaX;
		// var mediaItems = this.model.get("bundle").get("media");
		
		if (this.model.get("withMedia")) {
		// if (this.model.get("withMedia") ^ (this._renderFlags & View.MODEL_INVALID)) {
		// if (mediaItems.selected !== null) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? HPAN_DRAG : 0.0;
		// if (bundles.selected.get("media").selectedIndex == -1) {
		} else {//if (media.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT)? Globals.HPAN_OUT_DRAG : HPAN_DRAG;
		}
		this.transforms.offset(delta, void 0, this.keywordList.wrapper);
		this.transforms.validate();
	},
	
	_onHPanFinal: function(ev) {
		this.touch.off("panmove", this._onHPanMove);
		this.touch.off("panend pancancel", this._onHPanFinal);
		
		/* NOTE: if there is no model change, set tx here. Otherwise just wait for render */ 
		var kTf = this.transforms.get(this.keywordList.wrapper);
		if (!(this._renderFlags & View.MODEL_INVALID) && kTf.hasOffset) {
			if (kTf.offsetX != 0) {
				kTf.runTransition(tx.NOW);
			}
			kTf.clearOffset().validate();
			// kTf.clearOffset().runTransition(tx.NOW).validate();
			// this.transforms.clearOffset(this.keywordList.wrapper);
			// this.transforms.runTransition(tx.NOW, this.keywordList.wrapper);
			// this.transforms.validate();
		}
	},
	
	/* -------------------------------
	/* Vertical touch/move (_onVPan*)
	/* ------------------------------- */
	
	_collapsedOffsetY: Globals.COLLAPSE_OFFSET,
	
	_onVPanStart: function (ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);
		
		this.transforms.stopTransition(this.bundleList.el, this.keywordList.el);
		// this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
		// this.transforms.validate();
		this.transforms.clearCapture(this.bundleList.el, this.keywordList.el);
		
		// this.el.classList.add("container-changing");
		this._onVPanMove(ev);
	},
	
	_onVPanMove: function (ev) {
		var collapsed = this.model.get("collapsed");
		var delta = ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapsed/expand
		var isValidDir = collapsed? (delta > 0) : (delta < 0);
		var moveFactor = collapsed? 1 - Globals.VPAN_DRAG : Globals.VPAN_DRAG;
		
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
		delta *= collapsed? 0.5 : -1; // reapply sign
		
		this.transforms.offset(0, delta, this.bundleList.el, this.keywordList.el);
		this.transforms.validate();
	},
	
	_onVPanFinal: function(ev) {
		this.touch.off("vpanmove", this._onVPanMove);
		this.touch.off("vpanend vpancancel", this._onVPanFinal);
		
		this._onVPanMove(ev);
		this.setImmediate(function() {
			if (this.willCollapsedChange(ev)) {
				this.model.set("collapsed", !this.model.get("collapsed"));
			} else {
				this._transformsChanged = true;
				this.requestRender();
			}
		});
	},
	
	willCollapsedChange: function(ev) {
		return ev.type == "vpanend"? this.model.get("collapsed")?
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
			filterFn: function(bundle, index, arr) {
				return keywords.selected? bundle.get("kIds").indexOf(keywords.selected.id) !== -1 : false;
			},
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle,
		});
		this.listenTo(keywords, "select:one select:none", this._onKeywordSelect);
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
			filterFn: function(item, idx, arr) {
				return bundles.selected? (bundles.selected.get("kIds").indexOf(item.id) !== -1) : false;
			},
			groupingFn: function(item, idx, arr) {
				return types.get(item.get("tId"));
			},
		});
		this.listenTo(view, "view:select:one view:select:none", this._onKeywordListChange);
		view.wrapper = view.el.parentElement;
		return view;
	},
	
	createGraphView: function() {
		var view = new GraphView({
			id: "nav-graph",
			model: new Backbone.Model({ a: bundles, b: keywords })
		});
		this.el.appendChild(view.el);
		return view;
	},
	
	/* -------------------------------
	/* Horizontal touch/move (MutationObserver)
	/* ------------------------------- */
	
	/*
	_beginTransformObserve: function() {
		if (!(Globals.BREAKPOINTS["desktop-small"].matches && this.model.get("bundle").get("media").selectedIndex <= 0 && this.model.get("collapsed"))) {
			return;
		}
		var target = document.querySelector(".carousel > .empty-item");
		if (target === null) {
			return;
		}
		if (!this._transformObserver) {
			this._transformObserver = new MutationObserver(this._onTransformMutation);
		}
		this._transformObserver.observe(target, { attributes: true, attributeFilter: ["style"] });
		this.touch.on("panend pancancel", this._endTransformObserve);
		this.transforms.get(this.keywordList.wrapper)
			.stopTransition()
			.clearOffset()
			.clearCapture()
			.validate();
	},
		
	_endTransformObserve: function() {
		this._transformObserver.disconnect();
		this.touch.off("panend pancancel", this._endTransformObserve);
		this.transforms.get(this.keywordList.wrapper)
			.clearOffset()
			.runTransition(tx.NOW)
			.validate();
	},
	
	_onTransformMutation: function(mutations) {
		var tView, tMetrics, tCss, dTxObj, pos;
		
		// this.keywordList.wrapper.style[prefixedProperty("transform")];
		// transform = mutations[0].target.style.getPropertyValue(prefixedProperty("transform"));
		
		tView = View.findByElement(mutations[0].target);
		if (tView) {
			tMetrics = tView.metrics;
			dTxObj = this.transforms.get(this.keywordList.wrapper);
			console.log("%s::_onTransformMutation [withMedia: %s] target: (%f\+%f) %f wrapper: (%f) %f", this.cid,
				this.model.has("media"),
				tMetrics.translateX, tMetrics.width, tMetrics.translateX + tMetrics.width,
				dTxObj.capturedX, tMetrics.translateX - dTxObj.capturedX,
				tMetrics
			);
			
			this.transforms.offset(tMetrics.translateX - dTxObj.capturedX, void 0, this.keywordList.wrapper);
			this.transforms.validate();
		}
	}, */
	
	/* -------------------------------
	/* getKeywordWrapperTx
	/* ------------------------------- */
	// getKeywordWrapperTx: function() {
	// 	// bundle
	// 	var bundleChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("bundle");
	// 	var withBundleChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("withBundle");
	// 	var withBundle = this.model.get("withBundle");
	// 	// media
	// 	var mediaChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("media");
	// 	var withMediaChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("withMedia");
	// 	var withMedia = this.model.get("withMedia");
	// 	// collapsed
	// 	var collapsedChanged = (flags & View.MODEL_INVALID) && this.model.hasChanged("collapsed");
	// 	var collapsed = this.model.get("collapsed");
	// 	
	// 	// Horizontal translation: sitename, wrappers (bundleList, keywordList), groups (keywordList)
	// 	// - - - - - - - - - - - - - - - - -
	// 	var kWrapTx;
	// 	
	// 	if (Globals.BREAKPOINTS["desktop-small"].matches) {
	// 		/* kWrapTx 1 */ /*
	// 		if (withMediaChanged) {
	// 			if (withBundleChanged) {
	// 				if (withBundle) {
	// 					kWrapTx = tx.LAST;
	// 				} else {
	// 					if (collapsedChanged) {
	// 						kWrapTx = tx.FIRST;
	// 					}
	// 				}
	// 			} else if (collapsedChanged) {
	// 				if (collapsed) {
	// 					if (withMedia) {
	// 						kWrapTx = tx.LAST;
	// 					}
	// 				}
	// 			} else {
	// 				kWrapTx = bundleChanged? tx.BETWEEN : tx.NOW;
	// 			}
	// 		} else if (collapsedChanged) {
	// 			if (withMedia) {
	// 				kWrapTx = collapsed? tx.LAST : tx.FIRST;
	// 			}
	// 		}*/
	// 		
	// 		/* kWrapTx 2 */ /*
	// 		if ( withMediaChanged &&  withBundleChanged &&  withBundle) kWrapTx = tx.LAST;//A
	// 		if ( collapsedChanged &&  withBundleChanged &&  withMediaChanged && !withBundle) kWrapTx = tx.FIRST;//B
	// 		if (!collapsedChanged && !withBundleChanged &&  withMediaChanged &&  bundleChanged) kWrapTx = tx.BETWEEN;//D
	// 		if (!collapsedChanged && !withBundleChanged &&  withMediaChanged && !bundleChanged) kWrapTx = tx.NOW;//E
	// 		if ( collapsedChanged && !withBundleChanged &&  withMediaChanged &&  collapsed && withMedia) kWrapTx = tx.LAST;//C
	// 		if ( collapsedChanged && !withBundleChanged && !withMediaChanged &&  collapsed && withMedia) kWrapTx = tx.LAST;//F
	// 		if ( collapsedChanged && !withBundleChanged && !withMediaChanged && !collapsed && withMedia) kWrapTx = tx.FIRST;//G
	// 		if (withBundleChanged) {
	// 			if (withMediaChanged) {
	// 				if (withBundle) {
	// 					kWrapTx = tx.LAST; //A
	// 				} else {
	// 					if (collapsedChanged) {
	// 						kWrapTx = tx.FIRST;//B
	// 					}
	// 				}
	// 			}
	// 		} else if (withMediaChanged) {
	// 			if (collapsedChanged) {
	// 				if (collapsed) {
	// 					if (withMedia) {
	// 						kWrapTx = tx.LAST;//C
	// 					}
	// 				}
	// 			} else {
	// 				kWrapTx = bundleChanged?
	// 					tx.BETWEEN://D
	// 					tx.NOW;//E
	// 				// kWrapTx = bundleChanged? tx.BETWEEN : null;
	// 			}
	// 		} else if (collapsedChanged) {
	// 			if (withMedia) {
	// 				kWrapTx = collapsed?
	// 					tx.LAST://F
	// 					tx.FIRST;//G
	// 			}
	// 		}*/
	// 		
	// 		/* kWrapTx 3 */
	// 		// if (kWrapTx) {
	// 		// 	var flags = {
	// 		// 		withBundle: withBundle,
	// 		// 		withMedia: withMedia,
	// 		// 		collapsed: collapsed,
	// 		// 		withBundleChanged: withBundleChanged,
	// 		// 		withMediaChanged: withMediaChanged,
	// 		// 		collapsedChanged: collapsedChanged,
	// 		// 	};
	// 		// 	console.log("%s::renderFrame kWrap -- %s", this.cid, JSON.stringify(flags));
	// 		// }
	// 		// var l = function(msg, txName) {
	// 		// 	txName = (kWrapTx && kWrapTx.name) || txName || "none";
	// 		// 	console.log("%s::renderFrame kWrap %s, %s", this.cid, txName, msg);
	// 		// }.bind(this);
	// 		
	// 		if ( collapsedChanged	&&  withMediaChanged	&&  withBundleChanged) { kWrapTx = withBundle? tx.LAST:tx.FIRST; l("A/B", (withBundle?"to":"from") + " withBundle"); }//A/B
	// 		// if (						withMediaChanged	&&  withBundleChanged	&&  withBundle)						{ /*kWrapTx = tx.LAST;*/		l("A", "NONE"); }//A
	// 		// if ( collapsedChanged	&&  withMediaChanged	&&  withBundleChanged	&& !withBundle)					{ /*kWrapTx = tx.FIRST;*/		l("B", "NONE"); }//B
	// 		
	// 		if ( collapsedChanged	&& !withBundleChanged	&& withMedia) { kWrapTx = collapsed? tx.LAST:tx.FIRST; l((collapsed? "C/F":"G"), (collapsed?"to":"from") + " collapsed"); }//C/F/G
	// 		// if ( collapsedChanged	&& !withMediaChanged	&& !withBundleChanged	&&  withMedia	&& !collapsed)		{ /*kWrapTx = tx.FIRST;*/		l("G", "NONE"); }//G
	// 		// if ( collapsedChanged							&& !withBundleChanged	&&  withMedia	&&  collapsed)		{ /*kWrapTx = tx.LAST;*/		l("C/F", "NONE"); }//C/F
	// 		// if ( collapsedChanged	&&  withMediaChanged	&& !withBundleChanged	&&  withMedia	&&  collapsed)	{ /*kWrapTx = tx.LAST;*/		l("C", "NONE"); }//C
	// 		// if ( collapsedChanged	&& !withMediaChanged	&& !withBundleChanged	&&  withMedia	&&  collapsed)	{ /*kWrapTx = tx.LAST;*/		l("F", "NONE"); }//F
	// 		
	// 		if (!collapsedChanged	&&  withMediaChanged	&& !withBundleChanged) { kWrapTx = bundleChanged? tx.BETWEEN:tx.NOW; l("D/E"); }	//D/E
	// 		// if (!collapsedChanged	&&  withMediaChanged	&& !withBundleChanged	&&  bundleChanged)					{ kWrapTx = tx.BETWEEN; l("D"); }	//D
	// 		// if (!collapsedChanged	&&  withMediaChanged	&& !withBundleChanged	&& !bundleChanged)					{ kWrapTx = tx.NOW; l("E"); }		//E
	// 	}
	// 	return kWrapTx;
	// }
});

module.exports = NavigationView;
