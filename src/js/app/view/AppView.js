/**
 * @module app/view/AppView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/utils/debug/traceArgs} */
var stripTags = require("utils/strings/stripTags");
/** @type {Function} */
var prefixedProperty = require("utils/prefixedProperty");
/** @type {Function} */
var prefixedEvent = require("utils/prefixedEvent");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("app/control/TouchManager");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");
/** @type {module:app/control/Controller} */
var controller = require("app/control/Controller");

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:app/view/NavigationView} */
var NavigationView = require("app/view/NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("app/view/ContentView");

if (DEBUG) {
	/** @type {module:app/view/DebugToolbar} */
	var DebugToolbar = require("app/view/DebugToolbar");
}

// var visibilityHiddenProp = prefixedProperty("hidden", document);
var visibilityChangeEvent = prefixedEvent("visibilitychange", document, "hidden");
var visibilityStateProp = prefixedProperty("visibilityState", document);

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
var AppView = View.extend({
	
	/** @override */
	cidPrefix: "app",
	/** @override */
	el: "body",
	/** @override */
	// className: "without-bundle without-media",
	
	/** @override */
	initialize: function (options) {
		this.breakpoints = {
			"desktop-small": window.matchMedia(Globals.BREAKPOINTS["desktop-small"])
		};
		/* create single hammerjs manager */
		this.touch = TouchManager.init(document.querySelector("#container"));
		
		// render on resize, onorientationchange, visibilitychange
		var renderApp = this.render.bind(this);
		window.addEventListener("orientationchange", renderApp, false);
		window.addEventListener("resize", _.debounce(renderApp, 100, false), false);
		window.addEventListener("resize", function(ev) {
			document.body.scrollTop = 0;
		}, false);
		
		// document.addEventListener(visibilityChangeEvent, function(ev) {
		// 	if (document[visibilityStateProp] !== "hidden") {
		// 		// renderApp();
		// 		document.body.scrollTop = 0;
		// 	}
		// }, false);
		
		if (DEBUG) {
			this.el.appendChild((new DebugToolbar({id: "debug-toolbar", collection: bundles})).render().el);
		}
		
		/* initialize views */
		this.navigationView = new NavigationView({ el: "#navigation" });
		this.contentView = new ContentView({ el: "#content" });
		
		/* initialize controller listeners */
		// this.listenToOnce(controller, "change:before", this._beforeFirstChange);
		this.listenToOnce(controller, "change:after", this._afterFirstChange);
		// this.listenTo(controller, "change:before", this._beforeChange);
		// this.listenTo(controller, "change:after", this._afterChange);
		
		// start router, which will request appropiate state
		Backbone.history.start({ pushState: false, hashChange: true });
		
		// this.render();
		
		// this.requestAnimationFrame(function() {
		// 	document.documentElement.classList.remove("app-initial");
		// 	document.documentElement.classList.add("app-ready");
		// });
	},
	
	render: function () {
		// console.log("%s::render [%s]", this.cid, (arguments[0] instanceof window.Event? arguments[0].type : "direct call"));
		document.documentElement.classList.toggle("desktop-small", this.breakpoints["desktop-small"].matches);
		this.navigationView.render();
		this.contentView.render();
		// document.body.scrollTop = 0;
		return this;
	},
	
	// _beforeFirstChange: function(bundle, media) {
	// },
	
	// _beforeChange: function(bundle, media) {
	// },
	
	_afterFirstChange: function(bundle, media) {
		// this.listenTo(controller, "change:before", this._afterChangeDeferred);
		this.listenTo(controller, "change:after", this._afterChange);
		this._afterChange(bundle, media);
		this.render();
		// NOTE: Change to .app-ready:
		// Wait one frame for views to be rendered. Some may trigger transitions,
		// but they are skipped while in .app-initial. Wait one more frame for 
		// everything to render in it's final state, then finally change to .app-ready.
		this.requestAnimationFrame(function() {
			this.requestAnimationFrame(function() {
				document.documentElement.classList.remove("app-initial");
				document.documentElement.classList.add("app-ready");
			});
		});
	},
	
	_afterChangeDeferred: function(bundle, media) {
		this.requestAnimationFrame(this._afterChange.bind(this, bundle, media));
	},
	
	_afterChange: function(bundle, media) {
		// Set state classes
		var cls = this.el.classList;
		
		cls.toggle("with-bundle", !!bundle);
		cls.toggle("without-bundle", !bundle);
		cls.toggle("with-media", !!media);
		cls.toggle("without-media", !media);
		
		this.requestAnimationFrame(function() {
			// Set bundle class
			if (this._lastBundle !== bundle) {
				if (this._lastBundle) {
					cls.remove(this._lastBundle.get("domid"));
				}
				if (bundle) {
					cls.add(bundle.get("domid"));
				}
				cls.toggle("color-dark", bundle && bundle.colors.hasDarkBg);
				this._lastBundle = bundle;
			}
			// Set media class
			if (this._lastMedia !== media) {
				if (this._lastMedia) {
					cls.remove(this._lastMedia.get("domid"));
				}
				if (media) {
					cls.add(media.get("domid"));
				}
				this._lastMedia = media;
			}
		});
		
		// Set browser title
		var docTitle = "Portfolio";
		if (bundle) {
			docTitle += " - " + stripTags(bundle.get("name"));
			if (media) {
				docTitle += ": " + stripTags(media.get("name"));
			}
		}
		document.title = docTitle;
	},

}, {
	getInstance: function() {
		// window.app instanceof AppView || (window.app = new AppView());
		if (!(window.app instanceof AppView)) {
			window.app = new AppView();
		}
		return window.app;
	}
});

module.exports = AppView;
