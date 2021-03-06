/**
 * @module app/view/AppView
 */

/** @type {module:backbone} */
const Backbone = require("backbone");

/** @type {module:app/utils/debug/traceArgs} */
const stripTags = require("utils/strings/stripTags");

/** @type {module:app/control/Globals} */
const Globals = require("app/control/Globals");
/** @type {module:app/control/Controller} */
const controller = require("app/control/Controller");
/** @type {module:app/model/AppState} */
const AppState = require("app/model/AppState");
/** @type {module:app/model/collection/BundleCollection} */
const bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/model/collection/ArticleCollection} */
const articles = require("app/model/collection/ArticleCollection");

/** @type {module:app/view/base/View} */
const View = require("app/view/base/View");
/** @type {module:app/view/NavigationView} */
const NavigationView = require("app/view/NavigationView");
/** @type {module:app/view/ContentView} */
const ContentView = require("app/view/ContentView");


/** @type {module:app/view/base/TouchManager} */
const TouchManager = require("app/view/base/TouchManager");
// /** @type {module:hammerjs} */
// const Hammer = require("hammerjs");
// /** @type {module:utils/touch/SmoothPanRecognizer} */
// const Pan = require("utils/touch/SmoothPanRecognizer");
// /** @type {module:hammerjs.Tap} */
// const Tap = Hammer.Tap;

// /** @type {module:utils/debug/traceElement} */
// const traceElement = require("utils/debug/traceElement");
//
// const vpanLogFn = _.debounce(console.log.bind(console), 100, false);
// const hpanLogFn = _.debounce(console.log.bind(console), 100, false);

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
module.exports = View.extend({

	/** @override */
	cidPrefix: "app",
	/** @override */
	el: "html",
	// /** @override */
	className: "app", // without-bundle without-media without-article",
	/** @override */
	model: AppState,

	/** @override */
	events: {
		"visibilitychange": function(ev) {
			console.log("%s:[%s]", this.cid, ev.type);
		},
		"fullscreenchange": function(ev) {
			console.log("%s:[%s] fullscreen: %o", this.cid, ev.type, (document.fullscreenElement !== null), document.fullscreen);
		},
		"dragstart": function(ev) {
			if (ev.target.nodeName == "IMG" || ev.target.nodeName == "A") {
				ev.defaultPrevented || ev.preventDefault();
			}
		},
		// "touchmove body": function(ev) {
		// 	ev.defaultPrevented || ev.preventDefault();
		// },
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

		/* init HammerJS handlers */
		var vtouch, htouch, touchEl;
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

		touchEl = this.content;
		// touchEl = document.body;
		vtouch = htouch = TouchManager.init(touchEl);

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
		// 	Globals.BREAKPOINTS[s].addListeners(this._onBreakpointChange);
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

		/* TouchEvents fixups
		 * ------------------------------- */
		// var traceTouchEvent = (msg, traceObj) => {
		// 	if (msg.hasOwnProperty("type")) {
		// 		msg = msg.type + " : " +
		// 			(msg.defaultPrevented ? "prevented" : "not prevented");
		// 	}
		// 	var sy, sh, ch;
		// 	sy = this.el.scrollTop;
		// 	sh = this.el.scrollHeight - 1;
		// 	ch = this.el.clientHeight;
		// 	console.log("%s:[%s] " +
		// 		"sy:[1>%o>=%s = %o] " +
		// 		"sh:[%o<=%o = %o] " +
		// 		"nav:[css:%o val:%o]",
		// 		this.cid, msg,
		// 		sy, sh - ch, (1 <= sy <= (sh - ch)),
		// 		sh, ch, (sh <= ch),
		// 		this.navigationView.el.style.height,
		// 		this.navigationView.el.scrollHeight,
		// 		traceObj || ""
		// 	);
		// };


		// var scrolltouch = new Hammer.Manager(this.el);
		// scrolltouch.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL, threshold: 0 }));
		// scrolltouch.on("panmove", function(ev) {
		//
		// 	// var sy, sh, ch;
		// 	// sy = this.el.scrollTop;
		// 	// sh = this.el.scrollHeight - 1;
		// 	// ch = this.el.clientHeight;
		// 	//
		// 	// if ((1 > sy) && (ev.direction | Hammer.DIRECTION_DOWN)) {
		// 	// 	ev.preventDefault();
		// 	// 	console.log("%s:[panmove] %s", this.cid, "prevent at top");
		// 	// } else
		// 	// if ((sy > (sh - ch)) && (ev.direction | Hammer.DIRECTION_UP)) {
		// 	// 	ev.preventDefault();
		// 	// 	console.log("%s:[panmove] %s", this.cid, "prevent at bottom");
		// 	// }
		// 	if ((this.el.scrollHeight - 1) <= this.el.clientHeight) {
		// 		ev.srcEvent.preventDefault();
		// 	}
		// 	// traceTouchEvent(ev);
		// }.bind(this));

		var touchOpts = { capture: false, passive: false };
		var onTouchStart = (ev) => {
			this.el.addEventListener("touchmove", onTouchMove, touchOpts);
			this.el.addEventListener("touchend", onTouchEnd, touchOpts);
			this.el.addEventListener("touchcancel", onTouchEnd, touchOpts);
		};
		var onTouchMove = (ev) => {
			if (!ev.defaultPrevented && (this.el.scrollHeight - 1) <= this.el.clientHeight) {
				ev.preventDefault();
			}
			//traceTouchEvent(ev);
		};
		var onTouchEnd = (ev) => {
			this.el.removeEventListener("touchmove", onTouchMove, touchOpts);
			this.el.removeEventListener("touchend", onTouchEnd, touchOpts);
			this.el.removeEventListener("touchcancel", onTouchEnd, touchOpts);
		};
		this.el.addEventListener("touchstart", onTouchStart, { passive: true });

		var onMeasured = (view) => {
			this.setImmediate(() => {
				this.requestAnimationFrame(() => {
					if ((this.el.scrollHeight - 1) <= this.el.clientHeight) {
						this.el.style.overflowY = "hidden";
					} else {
						this.el.style.overflowY = "";
					}
					this.el.scrollTop = 1;
					//traceTouchEvent("view:collapsed:measured");
				});
			});
		};
		this.listenTo(this.navigationView, "view:collapsed:measured", onMeasured);

		/* Google Analytics
		 * ------------------------------- */
		// if (window.GTAG_ID) {
		// 	// let gaPageviewDisable = /(?:(localhost|\.local))$/.test(location.hostname) || window.GTAG_ID === "UA-0000000-0";
		// 	if (window.gtag) {
		// 		controller
		// 			.on("route", (name) => {
		// 				var page = Backbone.history.getFragment();
		// 				// Add a slash if neccesary
		// 				if (page.charAt(0) !== '/') {
		// 					page = '/' + page;
		// 				}
		// 				// page.replace(/^(?!\/)/, "/");
		// 				window.gtag('config', window.GTAG_ID, {
		// 					'page_title': page,
		// 					'page_path': page
		// 				});
		// 				console.warn("GTAG page set to '%s'", page);
		// 			});
		// 		// } else
		// 		// if (window.ga) {
		// 		// 	controller
		// 		// 		.once("route", () => {
		// 		// 			window.ga("create", window.GTAG_ID, "auto");
		// 		// 			// if localhost or dummy ID, disable analytics
		// 		// 			if (gaPageviewDisable) {
		// 		// 				window.ga("set", "sendHitTask", null);
		// 		// 			}
		// 		// 			console.warn("GA enabled tag '%s'", window.GTAG_ID);
		// 		// 		})
		// 		// 		.on("route", (name) => {
		// 		// 			var page = Backbone.history.getFragment();
		// 		// 			// Add a slash if neccesary
		// 		// 			if (page.charAt(0) !== '/') {
		// 		// 				page = '/' + page;
		// 		// 			}
		// 		// 			// page.replace(/^(?!\/)/, "/");
		// 		// 			window.ga("set", "page", page);
		// 		// 			window.ga("send", "pageview");
		// 		//
		// 		// 			console.warn("GA page set to '%s'", page);
		// 		// 		});
		// 	} else {
		// 		console.warn("GA/GTAG not loaded (LIB: %s, GA_ID: %s)", !!(window.ga || window.gtag), window.GTAG_ID);
		// 	}
		// } else {
		// 	console.warn("GA/GTAG not enabled (LIB: %s, GA_ID: %s)", !!(window.ga || window.gtag), window.GTAG_ID);
		// }

		// if (window.ga && window.GTAG_ID) {
		// 	controller
		// 		.once("route", () => {
		// 			window.ga("create", window.GTAG_ID, "auto");
		// 			// if localhost or dummy ID, disable analytics
		// 			if (/(?:(localhost|\.local))$/.test(location.hostname)
		// 				|| window.GTAG_ID == "XX-0000000-0") {
		// 				window.ga("set", "sendHitTask", null);
		// 				window.gtag('config', 'GA_TRACKING_ID', { 'send_page_view': false });
		// 				console.warn("GA disabled for localhost", window.GTAG_ID);
		// 			}
		// 		})
		// 		.on("route", (name) => {
		// 			var page = Backbone.history.getFragment();
		// 			// Add a slash if neccesary
		// 			if (page.charAt(0) !== '/') {
		// 				page = '/' + page;
		// 			}
		// 			// page.replace(/^(?!\/)/, "/");
		// 			window.ga("set", "page", page);
		// 			window.ga("send", "pageview");
		//
		// 			console.warn("GA page set to '%s'", page);
		// 		});
		// } else {
		// 	console.warn("GA not enabled (LIB: %s, GA_ENABLED: %s, GA_ID: %s)", !!window.ga, window.GA_ENABLED, window.GTAG_ID);
		// }
		// if (window.ga && window.GTAG_ID) {
		// 	controller.once("route", () => {
		// 		window.ga("create", window.GTAG_ID, "auto");
		// 	});
		// }
		// console.info("Git: %s", GIT_REV);
		console.info("Analytics GTAG_ENABLED: %s, GTAG_ID: %s, GA_LIB: %s", GTAG_ENABLED, window.GTAG_ID, !!window.ga);

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

		if (window.ga && window.GTAG_ID) {
			window.ga("create", window.GTAG_ID, "auto");
		}

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
			article: null,
			page: Backbone.history.getFragment().replace(/^(?!\/)/, "/"),
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
		if (DEBUG) {
			console.groupCollapsed(this.cid + "::_onModelChange");
			console.groupCollapsed("changes");
			Object.keys(this.model.changedAttributes()).forEach(function(key) {
				console.info("%s::_onModelChange %s: %s -> %s", this.cid, key,
					this.model.previous(key),
					this.model.get(key));
			}, this);

			["Article", "Bundle", "Media"].forEach(function(name) {
				let key = name.toLowerCase();
				let wName = `with${name}`;
				// let logArgs = [
				// 	"%s::_onModelChange with%s: %o with%sChanged: %o", this.cid,
				// 	wName, this.has(key), name, this.hasAnyChanged(key)
				// ];
				// if (this.hasChanged(wName) !== this.hasAnyChanged(key)) {
				// 	console.error.apply(console, logArgs);
				// } else {
				// 	console.log.apply(console, logArgs);
				// }
				console.assert(this.hasChanged(wName) === this.hasAnyChanged(key), this)
			}, this.model);
			console.groupEnd();

			this.once("view:render:after", function(view, flags) {
				console.info("%s::_onModelChange [view:render:after]", view.cid);
				console.groupEnd();
			});
		}

		this.requestRender(View.MODEL_INVALID);
		// this.requestChildrenRender(View.MODEL_INVALID);
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
					this.el.scrollTop = 1;
					view.el.classList.remove("skip-transitions");
					console.groupEnd();
				})
			});
		if (document.fullscreenElement === null) this.renderNow();
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

		// if ((this.el.scrollHeight - 1) <= this.el.clientHeight) {
		// 	this.el.scrollTop = 1;
		// 	this.el.style.overflowY = "hidden";
		// } else {
		// 	this.el.style.overflowY = "";
		// }
		// this.navigationView.whenRendered().then(function(view) {
		// 	this.requestAnimationFrame(function() {
		// 		console.log("%s::renderFrame [raf] css:%o val:%o",
		// 			this.cid,
		// 			this.navigationView.el.style.height,
		// 			this.navigationView.el.scrollHeight,
		// 			this.el.scrollTop,
		// 			this.el.scrollHeight - 1,
		// 			this.el.clientHeight,
		// 			(this.el.scrollHeight - 1) <= this.el.clientHeight,
		// 			this.el.style.overflowY
		// 		);
		// 	});
		// }.bind(this));
	},

	/* -------------------------------
	/* body classes etc
	/* ------------------------------- */

	renderModelChange: function() {
		let cls = this.el.classList;
		let prevAttr = null;
		let hasDarkBg = false;
		let docTitle = [];

		docTitle.push(Globals.APP_NAME);
		if (this.model.get("bundle")) {
			docTitle.push(stripTags(this.model.get("bundle").get("name")));
			if (this.model.get("media")) {
				docTitle.push(stripTags(this.model.get("media").get("name")));
			}
		} else if (this.model.get("article")) {
			docTitle.push(stripTags(this.model.get("article").get("name")));
		}
		docTitle = _.unescape(docTitle.join(" / "))
		document.title = docTitle;

		let metaTitle = docTitle;
		let metaUrl = document.location.origin
			+ document.location.pathname
			+ document.location.hash;

		document.head.querySelector("meta[property='og:title']")
			.setAttribute("content", metaTitle);
		document.head.querySelector("meta[property='og:url']")
			.setAttribute("content", metaUrl);
		document.head.querySelector("link[rel='canonical']")
			.setAttribute("href", metaUrl);

		if (window.ga && window.GTAG_ID) {
			window.ga('send', {
				'hitType': 'pageview',
				'page': this.model.get("page"),
				'title': docTitle
			});
		}

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
			}
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
}, {
	getInstance: function() {
		if (!(window.app instanceof this)) {
			window.app = new(this)({
				model: new AppState()
			});
		}
		return window.app;
	}
});

if (DEBUG) {
	module.exports = (function(AppView) {
		/** @type {module:app/debug/DebugToolbar} */
		var DebugToolbar = require("app/debug/DebugToolbar");

		return AppView.extend({
			initialize: function() {
				var retval;
				var view = new DebugToolbar({
					id: "debug-toolbar",
					model: this.model
				});
				document.body.appendChild(view.render().el);
				retval = AppView.prototype.initialize.apply(this, arguments);
				this._logFlags["view.trace"] = true;
				this.navigationView._logFlags["view.trace"] = true;
				return retval;
			},
		})
	})(module.exports);
}
