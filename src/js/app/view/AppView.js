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
		// "scroll #container": function(ev) {
		// 	console.log(ev.type, ev);
		// }
	},

	properties: {
		container: {
			get: function() {
				return this._container || (this._container =
					document.getElementById("container")
				);
			}
		}
	},

	/** @override */
	initialize: function(options) {
		/* create single hammerjs manager */
		this.touch = TouchManager.init(this.container);
		this.touch.set({
			enable: (function() {
				return this.el.scrollHeight == this.el.clientHeight;
				// return this.el.scrollTop === 0;
				// return this.container.scrollTop === 0;
				// return this.model.get("collapsed") && this.model.get("withBundle");
			}).bind(this)
		});

		// this._afterRender = this._afterRender.bind(this);
		this._onResize = this._onResize.bind(this);

		/* render on resize, onorientationchange, visibilitychange */
		window.addEventListener("orientationchange", this._onResize, false);
		window.addEventListener("resize", _.debounce(this._onResize, 100, false /* immediate? */ ), false);

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
			el: "#navigation",
			model: this.model
		});
		this.contentView = new ContentView({
			el: "#content",
			model: this.model
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

	_appStart: function() {
		console.info("%s::_appStart", this.cid, arguments[0]);
		this._appStartChanged = true;
		this.requestRender(View.MODEL_INVALID | View.SIZE_INVALID);
	},

	/* --------------------------- *
	/* model changed
	/* --------------------------- */

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
		console.info("%s::_onRoute %o -> %o", this.cid, this.model.get("routeName"), name);
		// console.log("%s::_onRoute args: %o", this.cid, name, args);
		this.model.set(o);
	},

	/* --------------------------- *
	/* model changed
	/* --------------------------- */

	_onModelChange: function() {
		// console.log("%s::_onModelChange [START]", this.cid);
		console.group(this.cid + "::_onModelChange [render request]");
		this.requestRender(View.MODEL_INVALID)
			.once("view:render:after", function(view, flags) {
				console.info("%s::_onModelChange [render complete]", view.cid);
				console.groupEnd();
				// .whenRendered().then(function(view) {
				// this.requestAnimationFrame(function() {
				// 	console.log("%s::_onModelChange [next frame]", view.cid);
				// });
			});
	},

	/* -------------------------------
	/* resize
	/* ------------------------------- */

	_onResize: function() {
		// console.log("%s::_onResize [START]", this.cid);
		console.group(this.cid + "::_onResize [render request]");
		this.el.classList.add("skip-transitions");
		this.skipTransitions = true;

		// this.requestRender(View.SIZE_INVALID).renderNow();
		// this.requestAnimationFrame(function() {
		// 	this.el.classList.remove("skip-transitions");
		// }.bind(this));

		this.requestRender(View.SIZE_INVALID)
			.once("view:render:after", function(view, flags) {
				console.info("%s::_onResize [render complete]", view.cid);
				// .whenRendered().then(function(view) {
				this.requestAnimationFrame(function() {
					view.el.classList.remove("skip-transitions");
					this.skipTransitions = false;
					console.info("%s::_onResize [removed skip-tx]", view.cid);
					console.groupEnd();
				})
			});
	},

	// _onBreakpointChange: function(ev) {
	// 	console.log("%s::_onBreakpointChange", this.cid, ev.matches, ev.media, ev.target.className);
	// 	this.requestRender(View.SIZE_INVALID).renderNow();
	// },

	/* -------------------------------
	/* render
	/* ------------------------------- */

	renderFrame: function(tstamp, flags) {
		console.log("%s::renderFrame [%s]", this.cid, View.flagsToString(flags));
		if (flags & View.MODEL_INVALID) {
			this.renderModelChange(flags);
		}
		if (flags & View.SIZE_INVALID) {
			this.renderResize(flags);
			// this.requestChildrenRender(flags, true);
		}
		if (flags & (View.MODEL_INVALID | View.SIZE_INVALID)) {
			// this.requestAnimationFrame(function() {
			// document.body.scrollTop = 0;
			window.scroll({ top: 0, behavior: "smooth" });
			// });
		}
		// request children render
		// set 'now' flag if size is invalid
		this.requestChildrenRender(flags, true);
		// this.requestChildrenRender(flags, flags & View.SIZE_INVALID);

		if (this._appStartChanged) {
			this._appStartChanged = false;
			this.requestAnimationFrame(this.renderAppStart);
		}
	},

	// _afterRender: function() {
	// 	document.body.scrollTop = 0;
	// },

	renderAppStart: function() {
		console.log("%s::renderAppStart", this.cid);
		this.el.classList.remove("app-initial");
		if (this.el.classList.contains("route-initial")) {
			this.el.classList.remove("route-initial");
			console.warn("'route-initial' was still present");
		}
	},

	renderResize: function(flags) {
		// document.body.scrollTop = 0;
		// window.scroll({ top: 0, behavior: "smooth" });

		_.each(Globals.BREAKPOINTS, function(o, s) {
			this.toggle(s, o.matches);
		}, document.documentElement.classList);

		// var bb = _.filter(_.keys(Globals.BREAKPOINTS), function(s) {
		// 	return this.contains(s);
		// }, document.body.classList).join();
		// console.log("%s::renderResize matches: %s", this.cid, bb);

		// this.requestChildrenRender(View.SIZE_INVALID, true);
		// this.requestChildrenRender(flags, true);
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

		var docTitle = []
		docTitle.push(Globals.APP_NAME);
		if (bundle) {
			docTitle.push(stripTags(bundle.get("name")));
			if (media) {
				docTitle.push(stripTags(media.get("name")));
			}
		} else if (article) {
			docTitle.push(stripTags(article.get("name")));
		}
		document.title = _.unescape(docTitle.join(" / "));

		var cls = this.el.classList;
		var prevAttr = null;

		// Set article class
		if (this.model.hasChanged("article")) {
			prevAttr = this.model.previous("article");
			if (prevAttr) {
				cls.remove(prevAttr.get("domid"));
			}
			if (article) {
				cls.add(article.get("domid"));
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
			}
		}
		cls.toggle("with-media", !!media);
		cls.toggle("without-media", !media);

		// Set state classes
		if (this.model.hasChanged("routeName")) {
			prevAttr = this.model.previous("routeName");
			if (prevAttr) {
				cls.remove("route-" + prevAttr);
			}
			cls.add("route-" + this.model.get("routeName"));
		}

		// Set color-dark class
		// cls.toggle("color-dark", hasDarkBg);
		cls.toggle("color-dark",
			(media && media.colors.hasDarkBg) ||
			(bundle && bundle.colors.hasDarkBg));
	},
};

if (DEBUG) {
	/** @type {module:app/debug/DebugToolbar} */
	var DebugToolbar = require("app/debug/DebugToolbar");

	AppViewProto._onModelChange = (function(fn) {
		return function() {
			var retval;
			console.group(this.cid + "::_onModelChange");
			Object.keys(this.model.changedAttributes()).forEach(function(key) {
				var prev = this.model.previous(key),
					curr = this.model.get(key);
				console.info("%s::_onModelChange %s: %s -> %s", this.cid, key,
					prev && prev.toString(),
					curr && curr.toString());
			}, this);
			console.groupEnd();

			retval = fn.apply(this, arguments);
			return retval;
		};
	})(AppViewProto._onModelChange);

	AppViewProto.initialize = (function(fn) {
		return function() {
			// var ret = fn.apply(this, arguments);
			var view = new DebugToolbar({
				id: "debug-toolbar",
				model: this.model
			});
			document.body.appendChild(view.render().el);
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