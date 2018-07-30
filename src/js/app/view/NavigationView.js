/* global MutationObserver */
/**
/* @module app/view/NavigationView
/*/

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:backbone} */
// var Backbone = require("backbone");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/TransformHelper} */
var TransformHelper = require("utils/TransformHelper");
// /** @type {module:app/view/base/TouchManager} */
// var TouchManager = require("app/view/base/TouchManager");

/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");
/** @type {module:app/model/collection/TypeCollection} */
var types = require("app/model/collection/TypeCollection");
/** @type {module:app/model/collection/KeywordCollection} */
var keywords = require("app/model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */
var articles = require("app/model/collection/ArticleCollection");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/component/FilterableListView} */
var FilterableListView = require("app/view/component/FilterableListView");
/** @type {module:app/view/component/GroupingListView} */
var GroupingListView = require("app/view/component/GroupingListView");
// /** @type {module:app/view/component/CollectionPager} */
// var CollectionPager = require("app/view/component/CollectionPager");
/** @type {module:app/view/component/GraphView} */
var GraphView = require("app/view/component/GraphView");
/** @type {module:app/view/component/ArticleButton} */
var ArticleButton = require("app/view/component/ArticleButton");

// /** @type {module:utils/prefixedProperty} */
// var prefixedProperty = require("utils/prefixedProperty");

var tx = Globals.transitions;

/**
/* @constructor
/* @type {module:app/view/NavigationView}
/*/
var NavigationView = View.extend({

	// /** @override */
	// tagName: "div",
	/** @override */
	cidPrefix: "navigationView",
	/** @override */
	className: "navigation container-expanded",

	/** @override */
	initialize: function(options) {
		_.bindAll(this, "_onVPanStart", "_onVPanMove", "_onVPanFinal");
		_.bindAll(this, "_onHPanStart", "_onHPanMove", "_onHPanFinal");
		_.bindAll(this, "_whenTransitionsEnd", "_whenTransitionsAbort");
		_.bindAll(this, "_whenListsRendered");
		_.bindAll(this, "_onNavigationClick");

		// this._metrics = {
		// 	minHeight: 0
		// };
		this.itemViews = [];
		this.transforms = new TransformHelper();
		// this.touch = options.touch || new Error("no touch"); //TouchManager.getInstance();
		this.vpan = options.vpan || new Error("no vpan");
		this.hpan = options.hpan || new Error("no hpan");

		this.listenTo(this.model, "change", this._onModelChange);
		// this.listenTo(this.model, "withBundle:change", this._onwithBundleChange);

		this.vpanGroup = this.el.querySelector("#vpan-group");
		this.transforms.add(this.vpanGroup);

		this.keywordList = this.createKeywordList();
		/* NOTE: .list-group .label moves horizontally (cf. sass/layouts/*.scss) */
		this.hGroupings = this.keywordList.el.querySelectorAll(".list-group .label");
		this.transforms.add(this.hGroupings, this.keywordList.el, this.keywordList.wrapper);
		this.itemViews.push(this.keywordList);

		this.bundleList = this.createBundleList();
		this.transforms.add(this.bundleList.el, this.bundleList.wrapper);
		this.itemViews.push(this.bundleList);

		this.sitename = this.createSitenameButton();
		this.transforms.add(this.sitename.wrapper, this.sitename.el);

		this.about = this.createArticleButton(articles.findWhere({ handle: "about" }));
		this.transforms.add(this.about.wrapper, this.about.el);

		this.graph = this.createGraphView(this.bundleList, this.keywordList, this.vpanGroup);
		// this.transforms.add(this.graph.el);
		// this.itemViews.push(this.graph);
		// this.listenTo(this.graph, {
		// 	"canvas:update": this._onGraphUpdate,
		// 	"canvas:redraw": this._onGraphRedraw,
		// });

		/*this.listenTo(this.graph, "view:render:before", function(view, flags) {
			var vmax;
			if (!view.el.style.height) {
				// if (flags & (View.SIZE_INVALID | View.MODEL_INVALID)) {
				// if ((this.bundleList.renderFlags | View.SIZE_INVALID) ||
				// 	(this.keywordList.renderFlags | View.SIZE_INVALID)) {
				// }
				vmax = Math.max(
					this.bundleList._metrics.height,
					this.keywordList._metrics.height
				);
				if (_.isNumber(vmax)) {
					view.el.style.height = vmax + "px";
					console.log("%s:[view:render:before][once]:%s [%s] heights:[%i, %i] (max %i)",
						this.cid, view.cid, View.flagsToString(flags),
						this.bundleList._metrics.height,
						this.keywordList._metrics.height,
						vmax);
				}
			}
		});*/
		// this.listenTo(this.bundleList, "view:render:after", function(view, flags) {
		// 	console.info("%s:[view:render:after %s]", this.cid, view.cid, View.flagsToString(flags & View.SIZE_INVALID));
		// 		if (flags & View.SIZE_INVALID) {
		// 			// console.info("%s:[%s view:render:after] bundleList height", this.cid, view.cid, this.bundleList.el.style.height);
		// 			// this.graph.el.style.height = this.bundleList.el.style.height;
		// 			this.graph.el.style.opacity = this.bundleList.collapsed? 0 : 1;
		// 			this.graph.requestRender(View.SIZE_INVALID).renderNow();
		// 	// 	}
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
			if (this.model.hasChanged("collapsed")
				|| this.model.hasChanged("withBundle")) {
				this.el.classList.add("container-changing");
			}
			// if (this.bundleList.invalidated) {
			// 	this.bundleList.invalidate(View.SIZE_INVALID);
			// }
			// if (this.model.hasChanged("bundle")) {
			if (this.model.hasChanged("routeName")) {
				this.bundleList.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
				this.keywordList.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
			}
		}

		// transforms
		// - - - - - - - - - - - - - - - - -
		if (this.skipTransitions ||
			(flags & (View.MODEL_INVALID | View.SIZE_INVALID | View.LAYOUT_INVALID))) {
			// if (transformsChanged) {
			if (this.skipTransitions) {
				this.transforms.stopAllTransitions();
				this.transforms.validate();
				this.transforms.clearAllOffsets();
			} else {
				this.renderTransitions(flags);
			}
			this.transforms.validate();
			// console.log("%s::renderFrame %o", this.cid,
			// 	this.transforms.items.map(function(o) {
			// 		return [o.hasTransition, o.el.localName, o.el.id || o.el.className].join(" : ");
			// 	})
			// );
		}

		// if (flags & View.MODEL_INVALID) {
		// 	// if (this.model.hasChanged("collapsed")) {
		// 	//if ((this.model.hasChanged("collapsed") && !this.model.get("collapsed")) || (this.model.hasChanged("withBundle") && !this.model.get("withBundle"))) {
		// 	if (this.model.hasChanged("collapsed")
		// 		|| this.model.hasChanged("withBundle")
		// 		|| this.model.hasChanged("withArticle")) {
		// 		this.transforms.promise().then(this._whenTransitionsEnd, this._whenTransitionsAbort);
		// 	}
		// }

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

		var whenListsRendered = Promise.all([
			this.bundleList.whenRendered(),
			this.keywordList.whenRendered()
		])
			.then(
				function(result) {
					var hval = result.reduce(function(a, o) {
						return Math.max(a, o._metrics.height);
					}, 0);
					if (this.model.get("collapsed")) {
						this.el.style.minHeight = "";
						this.graph.el.style.height = "100%";
					} else {
						this.el.style.minHeight = hval + "px";
						this.graph.el.style.height = hval + "px";
					}
					console.log("%s:[whenRendered][flags: %s] height: %o", this.cid, View.flagsToString(flags), hval);
					return result;
				}.bind(this),
				function(reason) {
					console.warn("%s:[whenRendered] failed: %o", this.cid, reason);
					return reason;
				}.bind(this)
			);

		Promise.all([
			whenListsRendered,
			this.transforms.promise()
		])
			.then(
				function(result) {
					console.log("%s:[listsRendered+transitionsEnd] [%s]", this.cid, View.flagsToString(flags), result);

					this.el.classList.remove("container-changing");
					this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
				}.bind(this),
				function(reason) {
					console.warn("%s:[listsRendered+transitionsEnd] [%s]", this.cid, View.flagsToString(flags), reason);

					this.el.classList.remove("container-changing");
					this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
				}.bind(this)
			);

		// graph
		// - - - - - - - - - - - - - - - - -
		// if ((flags & (View.SIZE_INVALID | ~View.MODEL_INVALID))
		// 	/* collapsed has not changed, no bundle selected */
		// 	&& !this.model.hasChanged("collapsed")
		// 	&& !this.model.get("withBundle")) {
		// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
		// 	if (!this.skipTransitions) {
		// 		this.graph.renderNow();
		// 	}
		// }
		// else if ((flags & View.SIZE_INVALID) && !this.model.get("collapsed")) {
		// 	/* NavigationView has resized while uncollapsed,
		// 	but model is unchanged */
		// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID);
		// }
		this.skipTransitions = false;
	},

	_whenListsRendered: function(result) {

	},

	_whenTransitionsEnd: function(result) {
		console.info("%s::_whenTransitionsEnd", this.cid);
		this.el.classList.remove("container-changing");
		// if (!Globals.BREAKPOINTS["desktop-small"].matches)
		// 	return;
		// if (!this.model.get("collapsed")) {
		// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID); //.renderNow();
		// }
	},

	_whenTransitionsAbort: function(reason) {
		console.warn("%s::_whenTransitionsAbort %o", this.cid, reason);
		this.el.classList.remove("container-changing");
		// if (!Globals.BREAKPOINTS["desktop-small"].matches)
		// 	return;
		// if (!this.model.get("collapsed")) {
		// 	this.graph.requestRender(View.SIZE_INVALID | View.LAYOUT_INVALID); //.renderNow();
		// }
	},

	/* -------------------------------
	/* renderTransitions
	/* ------------------------------- */

	renderTransitions: function(flags) {
		var fromRoute = this.model.previous("routeName");
		var toRoute = this.model.get("routeName");

		var modelChanged = (flags & View.MODEL_INVALID);
		/* bundle */
		var withBundle = this.model.get("withBundle");
		var withBundleChanged = modelChanged && this.model.hasChanged("withBundle");
		var bundleChanged = modelChanged && this.model.hasChanged("bundle");
		/* media */
		var withMedia = this.model.get("withMedia");
		var withMediaChanged = modelChanged && this.model.hasChanged("withMedia");
		//var mediaChanged = modelChanged && this.model.hasChanged("media");
		/* article */
		// var withArticle = this.model.get("withArticle");
		var withArticleChanged = modelChanged && this.model.hasChanged("withArticle");
		//var articleChanged = modelChanged && this.model.hasChanged("article");
		/* collapsed */
		var collapsed = this.model.get("collapsed");
		var collapsedChanged = modelChanged && this.model.hasChanged("collapsed");

		var tf;
		/* this.bundleList.el */
		tf = this.transforms.get(this.bundleList.el);
		if (tf.hasOffset) {
			tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
		}
		/* this.keywordList.el */
		tf = this.transforms.get(this.keywordList.el);
		if (tf.hasOffset) {
			tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
		}
		/* this.graph.el */
		tf = this.transforms.get(this.graph.el);
		if (tf && tf.hasOffset) {
			tf.runTransition(collapsedChanged ? tx.BETWEEN : tx.NOW);
			tf.clearOffset();
		}

		/*
		 * NOTE:
		 * Vertical:
		 *		site-name-wrapper,
		 *		article-list-wrapper
		 * Horizontal:
		 *		site-name,
		 *		article-buttons,
		 *		keywordList.wrapper,
		 *		bundleList.wrapper,
		 *		hGroupings
		 */
		if (Globals.BREAKPOINTS["desktop-small"].matches) {
			/* HORIZONTAL */
			tf = this.transforms.get(this.keywordList.wrapper);
			if (collapsedChanged && !withArticleChanged) {
				// if (collapsedChanged) {
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
			if (collapsedChanged ^ withArticleChanged) {
				this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST,
					this.sitename.el, this.about.el, this.bundleList.wrapper, this.hGroupings);
			}
			/* VERTICAL */
			if (fromRoute == 'root' || toRoute == 'root') {
				this.transforms.runTransition(tx.BETWEEN,
					this.sitename.wrapper, this.about.wrapper);
			}
			/* this.hGroupings */
			// if (collapsedChanged ^ withArticleChanged) {
			// 	// if (collapsedChanged && !withArticleChanged) {
			// 	this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.hGroupings);
			// }
			// if (collapsedChanged) {
			// 	if (!withArticleChanged) {
			// 		// if (fromRoute == 'root' || toRoute == 'root') {
			// 		this.transforms.runTransition(collapsed ? tx.LAST : tx.FIRST, this.bundleList.wrapper);
			// 	}
			// } else {
			// 	if (withArticleChanged && withBundleChanged) {
			// 		this.transforms.runTransition(withArticle ? tx.BETWEEN : tx.LAST, this.bundleList.wrapper);
			// 	}
			// }
		} else if (Globals.BREAKPOINTS["fullwidth"].matches) {
			// if (collapsedChanged ) {
			if (collapsedChanged ^ withArticleChanged) {
				this.transforms.runTransition(tx.BETWEEN,
					this.sitename.el, this.about.el);
			}
		} else {
			if (withBundleChanged) {
				this.transforms.runTransition(tx.BETWEEN,
					this.sitename.el, this.about.el);
			}
		}
		this.transforms.clearOffset(this.bundleList.el, this.keywordList.el,
			this.keywordList.wrapper);
	},

	/* --------------------------- *
	/* own model changed
	/* --------------------------- */

	_onModelChange: function() {
		this.requestRender(View.MODEL_INVALID);
		// keywords.deselect();
		if (this.model.hasChanged("collapsed")) {
			if (this.model.get("collapsed")) {
				// clear keyword selection
				keywords.deselect();
			} // else {}
			this.keywordList.collapsed = this.model.get("collapsed");
			this.bundleList.collapsed = this.model.get("collapsed");
		}
		if (this.model.hasChanged("bundle")) {
			this.bundleList.selectedItem = this.model.get("bundle");
			this.keywordList.refresh();
			// keywords.deselect();
			// this.graph && this.graph.requestRender(View.SIZE_INVALID);
		}
		if (this.model.hasChanged("withBundle")) {
			// this.keywordList.refresh()
			if (this.model.get("withBundle")) {
				// this.graph.el.addEventListener(Globals.CLICK_EVENT, this._onNavigationClick);
				this.vpan.on("vpanstart", this._onVPanStart);
				this.hpan.on("hpanstart", this._onHPanStart);
				// this.hpan.on("tap", this._onTap);
			} else {
				// this.graph.el.removeEventListener(Globals.CLICK_EVENT, this._onNavigationClick);
				this.vpan.off("vpanstart", this._onVPanStart);
				this.hpan.off("hpanstart", this._onHPanStart);
				keywords.deselect();
				// this.hpan.off("tap", this._onTap);
			}
			// this.graph.valueTo()
		}
	},

	// _onWithBundleChange: function(withBundle) {
	// 	if (withBundle) {
	// 		this.listenTo(this.model, "collapsed:change", function(collapsed){
	//
	// 		});
	// 	} else {
	// 		this.stopListening(this.model, "collapsed:change", function(collapsed){
	//
	// 		});
	// 	}
	// },

	/* --------------------------- *
	/* keyword collection changed
	/* --------------------------- */

	_onKeywordSelect: function(keyword) {
		// use collection listener to avoid redundant refresh calls
		this.bundleList.refresh();
		if (!this.model.get("collapsed") && this.graph) {
			this.listenToOnce(this.bundleList, "view:render:after", function(view, flags) {
				console.log("%s::_onKeywordSelect -> %s:[view:render:after] flags:%s", this.cid, view.cid, View.flagsToString(flags));
				this.graph.valueTo(0, 0, "amount");
				// this.graph.renderNow();
				this.graph.valueTo(1, Globals.TRANSITION_DURATION, "amount");
			});
		}
	},

	/* --------------------------- *
	/* UI Events: bundleList keywordList buttons
	/* --------------------------- */

	_onNavigationClick: function(ev) {
		if (!ev.defaultPrevented && this.model.has("bundle")) {
			console.log("%s::_onNavigationClick [%s]", this.cid, ev.type); //, ev.target);
			ev.preventDefault();
			// this.model.set("collapsed", !this.model.get("collapsed"));
			this._changeCollapsed(!this.model.get("collapsed"));
		}
	},

	_onArticleClick: function(item) {
		switch (this.model.get("routeName")) {
			case "article-item":
				controller.deselectArticle();
				break;
			case "root":
			default:
				controller.selectArticle(item);
				break;
		}
	},

	_onSitenameClick: function() {
		switch (this.model.get("routeName")) {
			case "media-item":
			case "bundle-item":
				if (this.model.get("collapsed")) {
					this._changeCollapsed(false);
				} else {
					controller.deselectBundle();
				}
				break;
			case "article-item":
				controller.deselectArticle();
				break;
		}
	},

	_onBundleListSame: function(bundle) {
		this._changeCollapsed(!this.model.get("collapsed"));
	},

	_onKeywordListChange: function(keyword) {
		if (!this.model.get("collapsed")) {
			keywords.select(keyword);
		}
	},

	_changeCollapsed: function(value) {
		if (value !== this.model.get("collapsed")) {
			this.transforms.offset(0, 1, this.graph.el);
			this.transforms.validate();
			this.setImmediate(function() {
				console.log("%s::_changeCollapsed", this.cid);
				this.model.set("collapsed", !this.model.get("collapsed"));
			});
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
		// if (this.model.get("layoutName") != "left-layout"
		// 	&& this.model.get("layoutName") != "default-layout") {
		// 	return;
		// }
		if (Globals.BREAKPOINTS["desktop-small"].matches
			&& this.model.get("bundle").get("media").selectedIndex <= 0
			&& this.model.get("collapsed")) {
			this.transforms.get(this.keywordList.wrapper).clearCapture();
			this._onHPanMove(ev);

			this.hpan.on("hpanmove", this._onHPanMove);
			this.hpan.on("hpanend hpancancel", this._onHPanFinal);
		}
	},

	_onHPanMove: function(ev) {
		// var HPAN_DRAG = 1;
		// var HPAN_DRAG = 0.75;
		var HPAN_DRAG = 720 / 920;
		var delta = ev.deltaX; //ev.thresholdDeltaX;
		// var mediaItems = this.model.get("bundle").get("media");

		if (this.model.get("withMedia")) {
			// if (this.model.get("withMedia") ^ (this._renderFlags & View.MODEL_INVALID)) {
			// if (mediaItems.selected !== null) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT) ?
				0.0 : HPAN_DRAG;
			// if (bundles.selected.get("media").selectedIndex == -1) {
		} else { //if (media.selectedIndex == 0) {
			delta *= (ev.offsetDirection & Hammer.DIRECTION_LEFT) ?
				HPAN_DRAG : Globals.HPAN_OUT_DRAG;
		}
		this.transforms.offset(delta, void 0, this.keywordList.wrapper);
		this.transforms.validate();
	},

	_onHPanFinal: function(ev) {
		this.hpan.off("hpanmove", this._onHPanMove);
		this.hpan.off("hpanend hpancancel", this._onHPanFinal);

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
		this.vpan.on("vpanmove", this._onVPanMove);
		this.vpan.on("vpanend vpancancel", this._onVPanFinal);

		this.transforms.stopTransition(this.bundleList.el, this.keywordList.el); //, this.graph.el);
		// this.transforms.clearOffset(this.bundleList.el, this.keywordList.el);
		// this.transforms.validate();
		this.transforms.clearCapture(this.bundleList.el, this.keywordList.el); //, this.graph.el);

		if (!this.model.get("collapsed")) {
			this.transforms.stopTransition(this.graph.el);
			this.transforms.clearCapture(this.graph.el);
		}
		// this.el.classList.add("container-changing");
		this._onVPanMove(ev);
	},

	_onVPanMove: function(ev) {
		var collapsed = this.model.get("collapsed");
		var delta = ev.deltaY; //ev.thresholdDeltaY;
		var maxDelta = this._collapsedOffsetY; // + Math.abs(ev.thresholdOffsetY);

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
				// delta = delta;
			}
		} else {
			delta = (-delta) * Globals.VPAN_OUT_DRAG; // delta is opposite
		}
		delta *= collapsed ? 0.5 : -1; // reapply sign

		this.transforms.offset(0, delta, this.bundleList.el, this.keywordList.el); //, this.graph.el);
		if (!collapsed)
			this.transforms.offset(0, delta, this.graph.el)
		this.transforms.validate();
	},

	_onVPanFinal: function(ev) {
		this.vpan.off("vpanmove", this._onVPanMove);
		this.vpan.off("vpanend vpancancel", this._onVPanFinal);

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
			ev.deltaY > Globals.COLLAPSE_THRESHOLD :
			ev.deltaY < -Globals.COLLAPSE_THRESHOLD :
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
					this.trigger("view:click");
				}
			}
		});
		this.listenTo(view, "view:click", this._onSitenameClick);
		view.wrapper = view.el.parentElement;
		return view;
	},

	createArticleButton: function(articleItem) {
		var view = new ArticleButton({
			el: ".article-button[data-handle='about']",
			model: articleItem
		}).render();
		this.listenTo(view, "view:click", this._onArticleClick);
		view.wrapper = view.el.parentElement;
		return view;
	},

	// createArticleButton2: function(articleItem) {
	// 	var view = new View({
	// 		el: "#about",
	// 		className: "article-button",
	// 		// tag: "h2",
	// 		model: articleItem,
	// 	});
	// 	// this.listenTo(view, "view:click", this._onAboutClick);
	// 	view.label = view.el.querySelector("a");
	// 	view.label.innerHTML = articleItem.get("name");
	// 	view.wrapper = view.el.parentElement;
	// 	return view;
	// },

	/**
	 * bundle-list
	 */
	createBundleList: function() {
		var view = new FilterableListView({
			el: "#bundle-list",
			collection: bundles,
			collapsed: false,
			filterFn: function(bundle, index, arr) {
				return keywords.selected ?
					bundle.get("kIds").indexOf(keywords.selected.id) !== -1 : false;
			},
		});
		controller.listenTo(view, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
		// view.listenTo(bundles, "select:one select:none", function(item) {
		// 	view.selectedItem = item;
		// });
		this.listenTo(view, "view:select:same", this._onBundleListSame);
		this.listenTo(keywords, "select:one select:none", this._onKeywordSelect);
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
			filterFn: function(item, idx, arr) {
				// return !!(item.get("bundle").selected);
				return bundles.selected ?
					(bundles.selected.get("kIds").indexOf(item.id) !== -1) : false;
			},
			groupingFn: function(item, idx, arr) {
				// return item.get("type");
				return types.get(item.get("tId"));
			},
		});
		view.listenTo(keywords, "select:one select:none", function(item) {
			view.selectedItem = item;
		});
		this.listenTo(view, "view:select:one view:select:none", this._onKeywordListChange);
		view.wrapper = view.el.parentElement;
		return view;
	},

	/**
	 * nav-graph
	 */
	createGraphView: function(listA, listB, parentEl) {
		var view = new GraphView({
			id: "nav-graph",
			listA: listA,
			listB: listB,
			model: this.model,
			useOpaque: false
		});
		parentEl || (parentEl = this.el);
		parentEl.insertBefore(view.el, parentEl.firstElementChild);
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
		this.hpan.on("hpanend hpancancel", this._endTransformObserve);
		this.transforms.get(this.keywordList.wrapper)
			.stopTransition()
			.clearOffset()
			.clearCapture()
			.validate();
	},

	_endTransformObserve: function() {
		this._transformObserver.disconnect();
		this.hpan.off("hpanend hpancancel", this._endTransformObserve);
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