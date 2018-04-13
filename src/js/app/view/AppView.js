/**
/* @module app/view/AppView
/*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
// /** @type {Function} */
// var Color = require("color");

/** @type {module:app/utils/debug/traceArgs} */
var stripTags = require("utils/strings/stripTags");
// /** @type {Function} */
// var prefixedProperty = require("utils/prefixedProperty");
// /** @type {Function} */
// var prefixedEvent = require("utils/prefixedEvent");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/base/TouchManager} */
var TouchManager = require("app/view/base/TouchManager");
/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");
/** @type {module:app/model/AppState} */
var AppState = require("app/model/AppState");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */
var articles = require("app/model/collection/ArticleCollection");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/NavigationView} */
var NavigationView = require("app/view/NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("app/view/ContentView");

var AppView = {
	getInstance: function() {
		if (!(window.app instanceof this)) {
			window.app = new(this)({
				model: new AppState()
			});
		}
		return window.app;
	}
};

var AppViewProto = {

	/** @override */
	cidPrefix: "app",
	/** @override */
	el: "body",
	/** @override */
	className: "without-bundle without-media",
	/** @override */
	model: AppState,

	/** @override */
	events: {
		"visibilitychange": function(ev) {
			console.log(ev.type);
		},
		"fullscreenchange": function(ev) {
			console.log(ev.type);
		},
	},

	/** @override */
	initialize: function(options) {
		// document.documentElement.classList.toggle("desktop-small", Globals.BREAKPOINTS["desktop-small"].matches);
		/* sync to docValue, so previous value is up-to-date on change */
		var docValue = _.find(Globals.LAYOUT_NAMES, function(s) {
			return document.body.classList.contains(s);
		});
		// if (docValue && (docValue !== this.model.get("layoutName"))) {
		// 	this.model.set("layoutName", docValue, { silent: true });
		// }

		/* prevent touch overscroll on iOS */
		// document.addEventListener("touchmove", function(ev) {
		// 	ev.preventDefault();
		// }, false);
		/* create single hammerjs manager */
		// this.touch = TouchManager.init(document.querySelector("#container"));
		this.touch = TouchManager.init(this.el);

		/* render on resize, onorientationchange, visibilitychange */
		this._onResize = this._onResize.bind(this); // _.bindAll(this, "_onResize");
		window.addEventListener("orientationchange", this._onResize, false);
		window.addEventListener("resize", _.debounce(this._onResize, 100, false /* immediate? */ ), false);

		/* initialize controller/model listeners BEFORE views register their own */
		this.listenTo(controller, "route", this._onRoute);
		// this.listenTo(controller, "change:after", this._afterControllerChanged);
		this.listenTo(this.model, "change", this._onModelChange); /* FIXME */

		/* initialize views */
		this.navigationView = new NavigationView({
			el: "#navigation",
			model: this.model
		});
		this.contentView = new ContentView({
			el: "#content",
			model: this.model
		});

		/* startup listener */
		this.listenToOnce(controller, "route", this._appStart);

		/* start router, which will request appropiate state */
		Backbone.history.start({
			pushState: false,
			hashChange: true,
			root: Globals.APP_ROOT.match(/(?:https?\:\/\/[^\/]+(.*))/)[1]
		});
		// this.listenTo(this.model, "change", this._onModelChange);
	},

	/* -------------------------------
	/* _appStart
	/* ------------------------------- */

	_appStart: function() {
		console.log("%s::_appStart", this.cid, arguments[0]);
		this._appStartChanged = true;
		this.requestRender(View.MODEL_INVALID | View.SIZE_INVALID);
	},

	/* --------------------------- *
	/* model changed
	/* --------------------------- */

	// _onRoute: function(name, args) {
	// 	console.info("%s::_onRoute %o", this.cid, name);
	// 	// this.model.set("routeName", name, { silent: true });
	// },

	_onRoute: function(name, args) {
		var o = _.defaults({ routeName: name }, AppState.prototype.defaults);
		switch (name) {
			case "media-item":
				o.bundle = bundles.selected;
				o.withBundle = true;
				o.media = o.bundle.media.selected;
				o.withMedia = true;
				o.collapsed = true;
				break;
			case "bundle-item":
				o.bundle = bundles.selected;
				o.withBundle = true;
				o.collapsed = true;
				break;
			case "article-item":
				o.article = articles.selected;
				o.withArticle = true;
				o.collapsed = true;
				break;
			case "bundle-list":
			case "notfound":
			case "root":
			default:
				o.collapsed = false;
				break;
		}
		console.info("%s::_onRoute %o", this.cid, name);
		this.model.set(o);
	},

	// _afterControllerChanged: function(bundle, media) {
	// 	/* update model on controller event */
	// 	console.log("%s::_afterControllerChanged [change:after] [%o %s %s]", this.cid, controller.routeName, bundle && bundle.get("handle"), media && media.cid);
	// 	this.model.set({
	// 		routeName: controller.routeName,
	// 		bundle: bundle || null,
	// 		withBundle: !!bundle,
	// 		media: media || null,
	// 		withMedia: !!media,
	// 		collapsed: !!bundle // reset collapsed on bundle change
	// 	});
	// },

	/* --------------------------- *
	/* model changed
	/* --------------------------- */

	_onModelChange: function() {
		// if (this.model.hasChanged("bundle")
		// 	|| this.model.hasChanged("media")
		// 	|| this.model.hasChanged("article")
		// 	|| this.model.hasChanged("routeName")) {
		this.requestRender(View.MODEL_INVALID);
		// }
	},

	/* -------------------------------
	/* resize
	/* ------------------------------- */

	_onResize: function() {
		console.log("%s::_onResize", this.cid);
		this.requestRender(View.SIZE_INVALID).renderNow();
	},

	/* -------------------------------
	/* render
	/* ------------------------------- */

	renderFrame: function(tstamp, flags) {
		if (flags & View.MODEL_INVALID) {
			this.renderModelChange();
		}
		if (flags & View.SIZE_INVALID) {
			this.renderResize();
		}
		if (this._appStartChanged) {
			this._appStartChanged = false;
			this.requestAnimationFrame(this.renderAppStart);
		}
	},

	renderAppStart: function() {
		console.log("%s::renderAppStart", this.cid);
		// document.documentElement.classList.remove("app-initial");
		this.el.classList.remove("app-initial");
		// document.documentElement.classList.add("app-ready");
	},

	renderResize: function() {
		document.body.scrollTop = 0;
		_.each(Globals.BREAKPOINTS, function(o, s) {
			this.toggle(s, o.matches);
		}, document.body.classList);

		// var bb = _.filter(_.keys(Globals.BREAKPOINTS), function(s) {
		// 	return this.contains(s);
		// }, document.body.classList).join();
		// console.log("%s::renderResize matches: %s", this.cid, bb);

		// document.body.classList.toggle("tablet-portrait", Globals.BREAKPOINTS["tablet-portrait"].matches);
		// document.body.classList.toggle("desktop-small", Globals.BREAKPOINTS["desktop-small"].matches);

		this.requestChildrenRender(View.SIZE_INVALID, true);

		// var ccid, view;
		// for (ccid in this.childViews) {
		// 	view = this.childViews[ccid];
		// 	view.skipTransitions = true;
		// 	// view.invalidateSize();
		// 	// view.renderNow();
		// 	view.requestRender(View.SIZE_INVALID).renderNow();
		// }
	},

	/* -------------------------------
	/* body classes etc
	/* ------------------------------- */

	// _controllerChanged: true,

	renderModelChange: function() {
		console.log("%s::renderModelChange", this.cid);

		var article = this.model.get("article");
		var bundle = this.model.get("bundle");
		var media = this.model.get("media");

		// 	this.updateDocumentTitle(bundle, media);
		// 	this.updateClassList(bundle, media);
		// },
		//
		// updateDocumentTitle: function(bundle, media) {
		// Set browser title
		var docTitle = "Portfolio";
		if (bundle) {
			docTitle += " - " + stripTags(bundle.get("name"));
			if (media) {
				docTitle += ": " + stripTags(media.get("name"));
			}
		} else if (article) {
			docTitle += " - " + stripTags(article.get("name"));
		}
		document.title = docTitle;
		// },
		//
		// updateClassList: function(bundle, media) {
		// classList target
		var cls = this.el.classList;
		var prevAttr = null;
		// var hasDarkBg = false;

		// Set state classes

		if (this.model.hasChanged("routeName")) {
			prevAttr = this.model.previous("routeName");
			if (prevAttr) {
				cls.remove("route-" + prevAttr);
			}
			cls.add("route-" + this.model.get("routeName"));
		}

		// Set article class
		if (this.model.hasChanged("article")) {
			prevAttr = this.model.previous("article");
			if (prevAttr) {
				cls.remove(prevAttr.get("domid"));
			}
			if (article) {
				cls.add(article.get("domid"));
				// hasDarkBg = hasDarkBg || bundle.colors.hasDarkBg;
			}
		}
		cls.toggle("with-article", !!article);
		cls.toggle("without-article", !article);

		// Set bundle class
		if (this.model.hasChanged("bundle")) {
			prevAttr = this.model.previous("bundle");
			if (prevAttr) {
				cls.remove(prevAttr.get("domid"));
			}
			if (bundle) {
				cls.add(bundle.get("domid"));
				// hasDarkBg = hasDarkBg || bundle.colors.hasDarkBg;
			}
		}
		cls.toggle("with-bundle", !!bundle);
		cls.toggle("without-bundle", !bundle);

		// Set media class
		if (this.model.hasChanged("media")) {
			prevAttr = this.model.previous("media");
			if (prevAttr) {
				cls.remove(prevAttr.get("domid"));
			}
			if (media) {
				cls.add(media.get("domid"));
				// hasDarkBg = hasDarkBg || media.colors.hasDarkBg;
			}
		}
		cls.toggle("with-media", !!media);
		cls.toggle("without-media", !media);

		// Set color-dark class
		// cls.toggle("color-dark", hasDarkBg);
		cls.toggle("color-dark",
			(media && media.colors.hasDarkBg) ||
			(bundle && bundle.colors.hasDarkBg));
	},
};

if (DEBUG) {
	/** @type {module:app/view/DebugToolbar} */
	var DebugToolbar = require("app/view/DebugToolbar");

	AppViewProto._onModelChange = (function(fn) {
		return function() {
			console.group(this.cid + "::_onModelChange changed:");
			Object.keys(this.model.changedAttributes()).forEach(function(key) {
				console.info("%s::_onModelChange %s: %s -> %s", this.cid, key, this.model.previous(key), this.model.get(key));
			}, this);
			console.groupEnd();
			return fn.apply(this, arguments);
		};
	})(AppViewProto._onModelChange);

	AppViewProto.initialize = (function(fn) {
		return function() {
			// var ret = fn.apply(this, arguments);
			var view = new DebugToolbar({
				id: "debug-toolbar",
				model: this.model
			});
			this.el.appendChild(view.render().el);
			// this.listenTo(this.model, "change:layoutName", function() {
			// 	this.requestRender(View.SIZE_INVALID); //.renderNow();
			// });
			// return ret;
			return fn.apply(this, arguments);
		};
	})(AppViewProto.initialize);
}

/**
/* @constructor
/* @type {module:app/view/AppView}
/*/
module.exports = View.extend(AppViewProto, AppView);