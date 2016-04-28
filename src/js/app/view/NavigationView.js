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
	initialize: function(options) {
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		_.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");
		_.bindAll(this, "_whenTransitionsEnd", "_whenTransitionsAbort");

		this.itemViews = [];
		this.transforms = new TransformHelper();
		this.touch = TouchManager.getInstance();

		this.listenTo(this.model, "change", this._onModelChange);

		this.keywordList = this.createKeywordList();
		this.hGroupings = this.keywordList.el.querySelectorAll(".list-group .label");
		this.transforms.add(this.hGroupings, this.keywordList.el, this.keywordList.wrapper);
		this.itemViews.push(this.keywordList);

		this.bundleList = this.createBundleList();
		this.transforms.add(this.bundleList.el, this.bundleList.wrapper);
		this.itemViews.push(this.bundleList);

		this.sitename = this.createSitenameButton();
		this.transforms.add(this.sitename.wrapper, this.sitename.el);
		// this.transforms.add(this.sitename.el.firstElementChild, this.sitename.el);

		this.graph = this.createGraphView(this.bundleList, this.keywordList);
		// this.transforms.add(this.graph.el);
		// this.itemViews.push(this.graph);
		// this.listenTo(this.graph, {
		// 	"canvas:update": this._onGraphUpdate,
		// 	"canvas:redraw": this._onGraphRedraw,
		// });

		this.listenTo(this.graph, "view:render:before", function(view, flags) {
			// console.info("%s:[%s view:render:before]", this.cid, view.cid);
			if (flags & View.SIZE_INVALID) {
				// console.info("%s:[%s view:render:before] bundleList height", this.cid, view.cid, this.bundleList.el.style.height);
				this.graph.el.style.height = this.bundleList.el.style.height;
				// this.graph.el.style.opacity = this.bundleList.collapsed? "0": "1";
				// view.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
			}
		});
		// this.listenTo(this.bundleList, "view:render:after", function(view, flags) {
		// 	console.info("%s:[%s view:render:after]", this.cid, view.cid, flags & View.SIZE_INVALID);
		// 	if (flags & View.SIZE_INVALID) {
		// 		// console.info("%s:[%s view:render:after] bundleList height", this.cid, view.cid, this.bundleList.el.style.height);
		// 		// this.graph.el.style.height = this.bundleList.el.style.height;
		// 		this.graph.el.style.opacity = this.bundleList.collapsed? 0 : 1;
		// 		this.graph.requestRender(View.SIZE_INVALID).renderNow();
		// 	}
		// });
		// this.listenTo(this.bundleList, "view:render:after", this._onListResize);
		// this.listenTo(this.keywordList, "view:render:after", this._onListResize);
	},

	/* --------------------------- *
	/* Render
	/* --------------------------- */

	renderFrame: function(tstamp, flags) {
		if (flags & View.MODEL_INVALID) {
			if (this.model.hasChanged("collapsed")) {
				this.el.classList.toggle("container-collapsed", this.model.get("collapsed"));
				this.el.classList.toggle("container-expanded", !this.model.get("collapsed"));
			}
			if (this.model.hasChanged("collapsed") || this.model.hasChanged("withBundle")) {
				this.el.classList.add("container-changing");
				// this.transforms.promise().then(this._whenTransitionsEnd, this._whenTransitionsAbort);
			}
			if (this.model.hasChanged("bundle")) {
				this.bundleList.requestRender(View.SIZE_INVALID);
				this.keywordList.requestRender(View.SIZE_INVALID);
			}
		}

		// transforms
		// - - - - - - - - - - - - - - - - -
		if (this.skipTransitions || (flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID))) {
			// if (transformsChanged) {
			if (this.skipTransitions) {
				this.transforms.stopAllTransitions();
				this.transforms.validate();
				this.transforms.clearAllOffsets();
			} else {
				this.renderTransitions(flags);
			}
			// console.group(this.cid + "::renderFrame transitions:");
			// if (this.skipTransitions) {
			// 	console.log("[skipping]");
			// } else {
			// 	this.transforms.items.forEach(function(o) {
			// 		console.log("\t%s: %s", o.el.id || o.id, o.transition.name || o.transition);
			// 	}, this);
			// }
			// console.groupEnd();
			// this.transforms.clearAllOffsets();

			// if (this.model.hasChanged("collapsed") || this.model.hasChanged("withBundle")) {
			// 	this.transforms.promise().then(this._whenTransitionsEnd, this._whenTransitionsAbort);
			// }
			this.transforms.validate();
		}

		if (flags & View.MODEL_INVALID) {
			if ((this.model.hasChanged("collapsed") && !this.model.get("collapsed")) || (this.model.hasChanged("withBundle") && !this.model.get("withBundle"))) {
				// this.el.classList.add("container-changing");
				this.transforms.promise().then(this._whenTransitionsEnd, this._whenTransitionsAbort);
			}
		}

		// children loop
		// - - - - - - - - - - - - - - - - -
		this.itemViews.forEach(function(view) {
			view.skipTransitions = view.skipTransitions || this.skipTransitions;
			if (flags & View.SIZE_INVALID) {
				view.requestRender(View.SIZE_INVALID);
			}
			if (!view.skipTransitions) {
				view.renderNow();
			}
		}, this);

		if (flags & (View.SIZE_INVALID | ~View.MODEL_INVALID)) {
			this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
			if (!this.skipTransitions) {
				this.graph.renderNow();
			}
		}

		this.skipTransitions = false;
	},

	_whenTransitionsEnd: function(result) {
		console.info("%s::_whenTransitionsEnd", this.cid, result);

		this.el.classList.remove("container-changing");
		this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID).renderNow();
	},

	_whenTransitionsAbort: function(reason) {
		console.warn("%s::_whenTransitionsAbort", this.cid, reason);
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
		// layoutName
		var layoutName = Globals.BREAKPOINTS["desktop-small"].matches ? this.model.get("layoutName") : "";

		var tf;
		/* this.bundleList.el */
		tf = this.transforms.get(this.bundleList.el);
		if (tf.hasOffset) {
			tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW); //.clearOffset();
		}

		/* this.keywordList.el */
		tf = this.transforms.get(this.keywordList.el);
		if (tf.hasOffset) {
			tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW); //.clearOffset();
		}

		// /* this.graph.el */
		// var graphTf = this.transforms.get(this.graph.el);
		// if (withBundleChanged || (collapsedChanged && graphTf.hasOffset)) {
		// 	graphTf.runTransition(tx.BETWEEN);
		// } else if (graphTf.hasOffset) {
		// 	graphTf.runTransition(tx.NOW);
		// }
		// if (graphTf.hasOffset) {
		// 	graphTf.clearOffset();
		// }

		// if (layout == "default-layout" || layout == "left-layout") {}
		switch (layoutName) {
			case "left-layout":
			case "default-layout":
				/* this.keywordList.wrapper */
				tf = this.transforms.get(this.keywordList.wrapper);
				if (collapsedChanged) {
					if (withBundleChanged) {
						if (withMediaChanged)
							tf.runTransition(withBundle ? tx.LAST : tx.FIRST);
					} else {
						if (withMedia)
							tf.runTransition(collapsed ? tx.LAST : tx.FIRST);
					}
				} else {
					if (!withBundleChanged && withMediaChanged)
						tf.runTransition(bundleChanged ? tx.BETWEEN : tx.NOW);
				}
				// if (tf.hasOffset) {
				// 	tf.clearOffset();
				// }
				// continue
			case "right-layout":
				if (collapsedChanged) { /* this.hGroupings */
					this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.hGroupings);
				}
				break;
		}

		// if (layout == "left-layout") {} else if (layout == "default-layout" || layout == "right-layout") {} else {}
		switch (layoutName) {
			case "left-layout":
				if (collapsedChanged) { /* this.bundleList.wrapper */
					this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.bundleList.wrapper);
				}
				if (collapsedChanged) { /* this.sitename.el */
					this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.sitename.el);
				}
				if (withBundleChanged) { /* this.sitename.wrapper */
					this.transforms.runTransition(tx.BETWEEN, this.sitename.wrapper);
					// NOTE: when changing to collapsed, tx tends to fire early, so use BETWEEN_LATE
					// this.transforms.runTransition(collapsed? tx.BETWEEN_LATE : tx.BETWEEN, this.sitename.el);
				}
				break;
			case "default-layout":
				if (collapsedChanged ^ withBundleChanged) { /* this.bundleList.wrapper */
					// if either but not both, then invert condition if collapsedChanged
					this.transforms.runTransition(collapsed ^ collapsedChanged ? tx.FIRST : tx.LAST, this.bundleList.wrapper);
				}
				// continue
			case "right-layout":
				// if (collapsedChanged) { 
				// if (withBundleChanged) { /* this.sitename.el */
				// 	this.transforms.runTransition(collapsed? tx.LAST : tx.FIRST, this.sitename.el);
				// } else if (collapsedChanged) {
				// 	this.transforms.runTransition(tx.BETWEEN, this.sitename.el);
				// }
				// }
				if (withBundleChanged && collapsedChanged) { /* this.sitename.el */
					this.transforms.runTransition(tx.BETWEEN, this.sitename.el);
				} else if (collapsedChanged) {
					this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.sitename.el);
				}
				break;
			default:
				if (withBundleChanged) { /* this.sitename.el */
					this.transforms.runTransition(tx.BETWEEN, this.sitename.el);
				}
				break;
		}
		this.transforms.clearOffset(this.bundleList.el, this.keywordList.el, this.keywordList.wrapper);
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
			this.graph && this.graph.requestRender(View.SIZE_INVALID);
		}
		if (this.model.hasChanged("withBundle")) {
			if (this.model.get("withBundle")) {
				this.touch.on("vpanstart", this._onVPanStart);
				this.touch.on("panstart", this._onHPanStart);
			} else {
				this.touch.off("vpanstart", this._onVPanStart);
				this.touch.off("panstart", this._onHPanStart);
			}
			// this.graph.valueTo()
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
		if (!this.model.get("collapsed") && this.graph) {
			// this.graph.requestRender(View.SIZE_INVALID & View.LAYOUT_INVALID);
			this.graph.requestRender(View.LAYOUT_INVALID);
		}
	},

	/* -------------------------------
	/* Horizontal touch/move (HammerJS)
	/* ------------------------------- */

	_onHPanStart: function(ev) {
		this.transforms.get(this.keywordList.wrapper)
			.stopTransition()
			.clearOffset()
			.validate();
		if (this.model.get("layoutName") != "left-layout" &&
			this.model.get("layoutName") != "default-layout") {
			return;
		}
		if (Globals.BREAKPOINTS["desktop-small"].matches &&
			this.model.get("bundle").get("media").selectedIndex <= 0 &&
			this.model.get("collapsed")
		) {
			this.transforms.get(this.keywordList.wrapper).clearCapture();
			this._onHPanMove(ev);

			this.touch.on("panmove", this._onHPanMove);
			this.touch.on("panend pancancel", this._onHPanFinal);
		}
	},

	_onHPanMove: function(ev) {
		// var HPAN_DRAG = 1;
		// var HPAN_DRAG = 0.75;
		var HPAN_DRAG = 720 / 920;
		var delta = ev.thresholdDeltaX;
		// var mediaItems = this.model.get("bundle").get("media");

		if (this.model.get("withMedia")) {
			// if (this.model.get("withMedia") ^ (this._renderFlags & View.MODEL_INVALID)) {
			// if (mediaItems.selected !== null) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT) ? HPAN_DRAG : 0.0;
			// if (bundles.selected.get("media").selectedIndex == -1) {
		} else { //if (media.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT) ? Globals.HPAN_OUT_DRAG : HPAN_DRAG;
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

	_onVPanStart: function(ev) {
		this.touch.on("vpanmove", this._onVPanMove);
		this.touch.on("vpanend vpancancel", this._onVPanFinal);

		this.transforms.stopTransition(this.bundleList.el, this.keywordList.el);
		// this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
		// this.transforms.validate();
		this.transforms.clearCapture(this.bundleList.el, this.keywordList.el);

		// this.el.classList.add("container-changing");
		this._onVPanMove(ev);
	},

	_onVPanMove: function(ev) {
		var collapsed = this.model.get("collapsed");
		var delta = ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY + Math.abs(ev.thresholdOffsetY);
		// check if direction is aligned with collapsed/expand
		var isValidDir = collapsed ? (delta > 0) : (delta < 0);
		var moveFactor = collapsed ? 1 - Globals.VPAN_DRAG : Globals.VPAN_DRAG;

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
		delta *= collapsed ? 0.5 : -1; // reapply sign

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
				this.requestRender(View.LAYOUT_INVALID);
			}
		});
	},

	willCollapsedChange: function(ev) {
		return ev.type == "vpanend" ? this.model.get("collapsed") ?
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
				"click a": function(domev) {
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
				return keywords.selected ? bundle.get("kIds").indexOf(keywords.selected.id) !== -1 : false;
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
				// return !!(item.get("bundle").selected);
				return bundles.selected ? (bundles.selected.get("kIds").indexOf(item.id) !== -1) : false;
			},
			groupingFn: function(item, idx, arr) {
				// return item.get("type");
				return types.get(item.get("tId"));
			},
		});
		this.listenTo(view, "view:select:one view:select:none", this._onKeywordListChange);
		view.wrapper = view.el.parentElement;
		return view;
	},

	createGraphView: function(listA, listB) {
		var view = new GraphView({
			id: "nav-graph",
			listA: listA,
			listB: listB,
			model: this.model
		});
		// view.styleData = {};
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
	},
	*/
});

module.exports = NavigationView;
