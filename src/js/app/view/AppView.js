/**
/* @module app/view/AppView
/*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/utils/debug/traceArgs} */
var stripTags = require("utils/strings/stripTags");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
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


/** @type {module:app/view/base/TouchManager} */
var TouchManager = require("app/view/base/TouchManager");
// /** @type {module:hammerjs} */
// var Hammer = require("hammerjs");
// /** @type {module:utils/touch/SmoothPanRecognizer} */
// var Pan = require("utils/touch/SmoothPanRecognizer");
// /** @type {module:hammerjs.Tap} */
// var Tap = Hammer.Tap;

// /** @type {module:utils/debug/traceElement} */
// var traceElement = require("utils/debug/traceElement");
//
// var vpanLogFn = _.debounce(console.log.bind(console), 100, false);
// var hpanLogFn = _.debounce(console.log.bind(console), 100, false);

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
	el: "html",
	// /** @override */
	className: "app without-bundle without-media without-article",
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
		"dragstart": function(ev) {
			if (ev.target.nodeName == "IMG" || ev.target.nodeName == "A") {
				ev.defaultPrevented || ev.preventDefault();
			}
		}
	},

	properties: {
		container: {
			get: function() {
				return this._container ||
					(this._container = document.getElementById("container"));
				// (this._container = document.body);
			}
		},
		navigation: {
			get: function() {
				return this._navigation ||
					(this._navigation = document.getElementById("navigation"));
			}
		},
		content: {
			get: function() {
				return this._content ||
					(this._content = document.getElementById("content"));
			}
		},
	},

	/** @override */
	initialize: function(options) {
		/* elements */
		// this.routeEl = this.el;
		// this.stateEl = this.el
		this.breakpointEl = this.el;
		// this.touchEl = document.body;
		// this.touchEl = document.getElementById("containter");

		/* init HammerJS handlers */
		var vtouch, htouch;
		// var vpan, hpan, tap;

		// this._vpanEnableFn = function(mc, ev) {
		// 	var retval = !this._hasOverflowY(this.container);
		// 	vpanLogFn("%s::_vpanEnableFn -> %o\n%o", this.cid, retval, arguments);
		// 	return retval;
		// }.bind(this);
		//
		// this._hpanEnableFn = function(mc, ev) {
		// 	var retval = this.model.get("withBundle") && this.model.get("collapsed");
		// 	hpanLogFn("%s::_hpanEnableFn -> %o\n%o", this.cid, retval, arguments);
		// 	return !!retval;
		// }.bind(this);

		vtouch = htouch = TouchManager.init(this.content);
		// vtouch.get("vpan").set({ enable: this._vpanEnableFn });
		// htouch.get("hpan").set({ enable: this._hpanEnableFn });
		// 		vtouch.set({
		// 			enable: function() {
		// 				console.log("app1::hammerjs enable", arguments);
		// 				return true;
		// 			}
		// 		});
		// hpan = vpan;

		// this.el.style.touchAction = "none"; //"pan-x pan-y";

		// tap = new Hammer.Tap();
		// hpan = new Pan({
		// 	event: "hpan",
		// 	direction: Hammer.DIRECTION_HORIZONTAL
		// });
		// hpan.set({
		// 	enable: this._hpanEnableFn
		// });
		// vpan = new Pan({
		// 	event: "vpan",
		// 	direction: Hammer.DIRECTION_VERTICAL
		// });
		// vpan.set({
		// 	enable: this._vpanEnableFn
		// });
		// hpan.requireFailure(vpan);
		// vpan.requireFailure(hpan);

		// vtouch = new Hammer.Manager(this.navigation);
		// vtouch.add([]);

		// htouch = vtouch = new Hammer.Manager(this.content);
		// htouch.add([tap, hpan, vpan]);
		// htouch.add([hpan, vpan]);
		// htouch.set({ touchAction: "pan-x pan-y" });

		// vpan = new Hammer(this.navigation, {
		// 	recognizers: [
		// 		[Pan, {
		// 			event: 'vpan',
		// 			touchAction: "pan-y",
		// 			direction: Hammer.DIRECTION_VERTICAL,
		// 			enable: vpanEnableFn
		// 		}],
		// 	]
		// });
		// hpan = new Hammer(this.content, {
		// 	recognizers: [
		// 		[Pan, {
		// 			event: 'hpan',
		// 			touchAction: "pan-x",
		// 			direction: Hammer.DIRECTION_HORIZONTAL,
		// 			enable: hpanEnableFn
		// 		}],
		// 		[Tap]
		// 	]
		// });
		// hpan.get("hpan").requireFailure(vpan.get("vpan"));

		// this._afterRender = this._afterRender.bind(this);
		this._onResize = this._onResize.bind(this);

		/* render on resize, onorientationchange, visibilitychange */
		// window.addEventListener("orientationchange", this._onResize, false);
		// window.addEventListener("resize", _.debounce(this._onResize.bind(this), 30, false), false);
		window.addEventListener("resize", this._onResize, false);

		// var h = function(ev) { console.log(ev.type, ev) };
		// window.addEventListener("scroll", h, false);
		// window.addEventListener("wheel", h, false);

		/* TODO: replace resize w/ mediaquery listeners. Caveat: some components
		(vg. Carousel) require update on resize */
		// this._onBreakpointChange = this._onBreakpointChange.bind(this);
		// Object.keys(Globals.BREAKPOINTS).forEach(function(s) {
		// 	Globals.BREAKPOINTS[s].addListener(this._onBreakpointChange);
		// }, this);

		/* initialize controller/model listeners BEFORE views register their own */
		this.listenTo(controller, "route", this._onRoute);
		// this.listenTo(controller, "change:after", this._afterControllerChanged);
		this.listenTo(this.model, "change", this._onModelChange); /* FIXME */

		/* initialize views */
		this.navigationView = new NavigationView({
			el: this.navigation,
			model: this.model,
			vpan: vtouch,
			hpan: htouch
		});

		this.contentView = new ContentView({
			el: this.content,
			model: this.model,
			vpan: vtouch,
			hpan: htouch,
		});

		/* Google Analytics */
		if (window.ga && window.GA_ID) {
			controller
				.once("route", function() {
					window.ga("create", window.GA_ID, "auto");
					// if localhost or dummy ID, disable analytics
					if (/(?:(localhost|\.local))$/.test(location.hostname)
						|| window.GA_ID == "UA-0000000-0") {
						window.ga("set", "sendHitTask", null);
					}
				})
				.on("route", function(name) {
					var page = Backbone.history.getFragment();
					// Add a slash if neccesary
					page.replace(/^(?!\/)/, "/");
					window.ga("set", "page", page);
					window.ga("send", "pageview");
				});
		}

		/* Startup listener, added last */
		this.listenToOnce(controller, "route", this._appStart);

		/* start router, which will request appropiate state */
		Backbone.history.start({
			pushState: false,
			hashChange: true,
		});
	},

	/* -------------------------------
	/* _appStart
	/* ------------------------------- */

	_appStart: function(name, args) {
		console.info("%s::_appStart(%s, %s)", this.cid, name, args.join());
		this.skipTransitions = true;
		this.el.classList.add("skip-transitions");

		this.requestRender(View.MODEL_INVALID | View.SIZE_INVALID)
			.requestChildrenRender(View.MODEL_INVALID | View.SIZE_INVALID)
			.listenToOnce(this, "view:render:after", function(view, flags) {
				// this.setImmediate(function() {
				this.requestAnimationFrame(function() {
					console.log("%s::_appStart[view:render:after][raf]", this.cid);
					this.skipTransitions = false;
					this.el.classList.remove("skip-transitions");
					this.el.classList.remove("app-initial");
				});
			});
	},

	/* --------------------------- *
	/* route changed
	/* --------------------------- */

	_onRoute: function(name, args) {
		console.info("%s::_onRoute %o -> %o", this.cid, this.model.get("routeName"), name);
		// var o = _.defaults({ routeName: name }, AppState.prototype.defaults);
		var o = {
			routeName: name,
			bundle: null,
			media: null,
			article: null
		};
		switch (name) {
			case "media-item":
				o.bundle = bundles.selected;
				// o.withBundle = true;
				o.media = o.bundle.media.selected;
				// o.withMedia = true;
				o.collapsed = true;
				break;
			case "bundle-item":
				o.bundle = bundles.selected;
				// o.withBundle = true;
				o.collapsed = true;
				break;
			case "article-item":
				o.article = articles.selected;
				// o.withArticle = true;
				o.collapsed = true;
				break;
			case "bundle-list":
			case "notfound":
			case "root":
			default:
				o.collapsed = false;
				break;
		}
		// console.log("%s::_onRoute args: %o", this.cid, name, args);
		this.model.set(o);
	},

	/* --------------------------- *
	/* model changed
	/* --------------------------- */

	_onModelChange: function() {
		// console.log("%s::_onModelChange [START]", this.cid);
		console.group(this.cid + "::_onModelChange");
		Object.keys(this.model.changedAttributes()).forEach(function(key) {
			console.info("%s::_onModelChange %s: %s -> %s", this.cid, key,
				this.model.previous(key),
				this.model.get(key));
		}, this);

		["Article", "Bundle", "Media"].forEach(function(name) {
			var key = name.toLowerCase();
			console[this.hasChanged("with" + name) == this.hasAnyChanged(key) ? "log" : "warn"].call(console, "%s::_onModelChange with%s: %o with%sChanged: %o", this.cid,
				name, this.has(key),
				name, this.hasAnyChanged(key)
			);
		}, this.model);

		// console.log("%s::_onModelChange %o", this.cid,
		// 	// arguments
		// 	// _.clone(this.model.attributes),
		// 	// this.model.changedAttributes()
		// );

		this.requestRender(View.MODEL_INVALID)
			// .requestChildrenRender(View.MODEL_INVALID)
			.once("view:render:after", function(view, flags) {
				console.info("%s::_onModelChange [render complete]", view.cid);
				console.groupEnd();
			});
	},

	/* -------------------------------
	/* resize
	/* ------------------------------- */

	_onResize: function(ev) {
		console.group(this.cid + "::_onResize [event]");
		this.skipTransitions = true;
		this.el.classList.add("skip-transitions");

		this.requestRender(View.SIZE_INVALID)
			// .whenRendered().then(function(view) {
			.once("view:render:after", function(view, flags) {
				// this.requestChildrenRender(View.SIZE_INVALID, true);
				// this.setImmediate(function() {
				this.requestAnimationFrame(function() {
					console.info("%s::_onResize [view:render:after][raf]", view.cid);
					view.skipTransitions = false;
					view.el.classList.remove("skip-transitions");
					console.groupEnd();
				})
			}).renderNow();
	},

	/* -------------------------------
	/* render
	/* ------------------------------- */

	renderFrame: function(tstamp, flags) {
		console.log("%s::renderFrame [%s]", this.cid, View.flagsToString(flags));

		/* model: set route & model id classes */
		if (flags & View.MODEL_INVALID) {
			this.renderModelChange(flags);
		}

		/* size: check breakpoints and set classes*/
		if (flags & View.SIZE_INVALID) {
			_.each(Globals.BREAKPOINTS, function(o, s) {
				this.toggle(s, o.matches);
			}, this.breakpointEl.classList);
		}
		/* request children render:  always render now */
		this.requestChildrenRender(flags, true);
		/* request children render:  set 'now' flag if size is invalid */
		// this.requestChildrenRender(flags, flags & View.SIZE_INVALID);

		// if (flags & (View.MODEL_INVALID | View.SIZE_INVALID)) {
		// 	this.navigation.style.touchAction = !this._hasOverflowY(this.container) ? "pan-x" : "";
		// 	this.content.style.touchAction = this._hpanEnableFn() ? "pan-y" : "";
		// 	this.requestAnimationFrame(function() {
		// 		if (this._hpanEnableFn() && this._vpanEnableFn()) {
		// 			this.content.style.touchAction = "none";
		// 		} else if (this._hpanEnableFn()) {
		// 			this.content.style.touchAction = "pan-y";
		// 		} else if (this._vpanEnableFn()) {
		// 			this.content.style.touchAction = "pan-x";
		// 		} else {
		// 			this.content.style.touchAction = "auto";
		// 		}
		// 		// 	document.body.scrollTop = 0;
		// 		// 	window.scroll({ top: 0, behavior: "smooth" });
		// 	});
		// }
	},

	/* -------------------------------
	/* body classes etc
	/* ------------------------------- */

	renderModelChange: function() {

		var cls = this.el.classList;
		var prevAttr = null;
		var docTitle = [];
		var hasDarkBg = false;

		docTitle.push(Globals.APP_NAME);
		if (this.model.get("bundle")) {
			docTitle.push(stripTags(this.model.get("bundle").get("name")));
			if (this.model.get("media")) {
				docTitle.push(stripTags(this.model.get("media").get("name")));
			}
		} else if (this.model.get("article")) {
			docTitle.push(stripTags(this.model.get("article").get("name")));
		}
		document.title = _.unescape(docTitle.join(" / "));

		/* Set route class */
		if (this.model.hasChanged("routeName")) {

			prevAttr = this.model.previous("fromRouteName");
			if (prevAttr) {
				cls.remove("from-route-" + prevAttr);
			}
			cls.add("from-route-" + this.model.get("fromRouteName"));

			prevAttr = this.model.previous("routeName");
			if (prevAttr) {
				cls.remove("route-" + prevAttr);
				// this.el.setAttribute("from-route", prevAttr);
			}
			// this.el.setAttribute("to-route", this.model.get("routeName"));
			cls.add("route-" + this.model.get("routeName"));
		}

		/* Set model id classes for color styles */
		["article", "bundle", "media"].forEach(function(prop) {
			var item = this.model.get(prop);
			if (this.model.hasChanged(prop)) {
				prevAttr = this.model.previous(prop);
				if (prevAttr) {
					cls.remove(prevAttr.get("domid"));
				}
				if (item) {
					cls.add(item.get("domid"));
				}
			}
			cls.toggle("with-" + prop, !!item);
			cls.toggle("without-" + prop, !item);
			hasDarkBg |= (item && item.colors && item.colors.hasDarkBg);
		}.bind(this));

		/* flag dark background */
		cls.toggle("color-dark", hasDarkBg);
	},
};

if (DEBUG) {
	/** @type {module:app/debug/DebugToolbar} */
	var DebugToolbar = require("app/debug/DebugToolbar");

	AppViewProto.initialize = (function(fn) {
		return function() {
			var retval;
			var view = new DebugToolbar({
				id: "debug-toolbar",
				model: this.model
			});
			document.body.appendChild(view.render().el);
			// this.listenTo(this.model, "change:layoutName", function() {
			// 	this.requestRender(View.SIZE_INVALID); //.renderNow();
			// });
			retval = fn.apply(this, arguments);
			this._logFlags["view.trace"] = true;
			this.navigationView._logFlags["view.trace"] = true;
			// this.navigationView.graph._logFlags["view.trace"] = true;
			// this.navigationView.bundleList._logFlags["view.trace"] = true;
			// this.navigationView.keywordList._logFlags["view.trace"] = true;
			return retval;
		};
	})(AppViewProto.initialize);
}

/**
/* @constructor
/* @type {module:app/view/AppView}
/*/
module.exports = View.extend(AppViewProto, AppView);