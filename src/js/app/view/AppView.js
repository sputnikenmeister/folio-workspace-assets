/**
 * @module app/view/AppView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("../control/TouchManager");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("../model/collection/BundleCollection");

/** @type {module:app/view/base/View} */
var View = require("./base/View");
/** @type {module:app/view/NavigationView} */
var NavigationView = require("./NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("./ContentView");
/** @type {module:app/view/FooterView} */
// var FooterView = require("./FooterView");

/** @type {module:app/view/helper/createBundleStyles} */
var createBundleStyles = require("./helper/createBundleStyles");

// var Handlebars = require("handlebars")["default"];
// Handlebars.registerPartial("mediadir", Globals.MEDIA_DIR);
/** */
require("./helper/registerHandlebarsHelpers");

/** @type {module:app/utils/debug/traceArgs} */
var stripTags = require("../../utils/strings/stripTags");


if (DEBUG) {
	/** @type {module:app/view/DebugToolbar} */
	var DebugToolbar = require("./DebugToolbar");
}

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
var AppView = View.extend({
	
	/** @override */
	el: "body",
	
	/** @override */
	initialize: function (options) {
		this.breakpoints = {
			"desktop-small": window.matchMedia(Globals.BREAKPOINTS["desktop-small"])
		};
		/* create single hammerjs manager */
		this.touch = TouchManager.init(document.querySelector("#container"));
		
		this.listenTo(controller, {
			"change:before": this._beforeChange,
			"change:after": this._afterChange
		});
		
		if (document.readyState == "complete") {
			createBundleStyles();
		} else {
			document.addEventListener("load", createBundleStyles);
			console.warn("Controller.initializeBundleStyles: document.readyState is '" +
				document.readyState + "', will wait for 'load' event.");
		}
		
		// render on resize
		var windowEventHandler = this.render.bind(this);
		window.addEventListener("onorientationchange", windowEventHandler, false);
		window.addEventListener("resize", _.debounce(windowEventHandler, 100, false), false);
		
		if (DEBUG) {
			this.el.appendChild((new DebugToolbar({
				id: "debug-toolbar",
				collection: bundles
			})).render().el);
		}
		
		/* initialize views */
		this.navigationView = new NavigationView({
			el: "#navigation"
		});
		this.contentView = new ContentView({
			el: "#content"
		});
		
		// start router, which will request appropiate state
		Backbone.history.start({
			pushState: false,
			hashChange: true
		});
		
		// Change to .app-ready on next frame:
		// CSS animations do not trigger while on .app-initial,
		// so everything will be rendered in it's final state
		this.requestAnimationFrame(function() {
			document.documentElement.classList.remove("app-initial");
			document.documentElement.classList.add("app-ready");
		});
		this.render();
	},
	
	render: function () {
		// document.body.classList.toggle("desktop-small",
		// 	this.breakpoints["desktop-small"].matches);
		document.documentElement.classList.toggle("desktop-small",
			this.breakpoints["desktop-small"].matches);
		this.navigationView.render();
		this.contentView.render();
		return this;
	},
	
	_beforeChange: function(bundle, media) {
	},
	
	_afterChange: function(bundle, media) {
		// Set state classes
		var cls = this.el.classList;
		cls.toggle("with-bundle", !!bundle);
		cls.toggle("without-bundle", !bundle);
		cls.toggle("with-media", !!media);
		cls.toggle("without-media", !media);
		
		bundle && cls.toggle("color-dark", bundle.colors.dark);
		
		// Set bundle class
		if (this._lastBundle) {
			cls.remove(this._lastBundle.get("domid"));
		}
		if (bundle) {
			cls.add(bundle.get("domid"));
		}
		this._lastBundle = bundle;
		
		// Set browser title
		document.title = bundle? "Portfolio – " + stripTags(bundle.get("name")): "Portfolio";
	},

});

module.exports = AppView;
