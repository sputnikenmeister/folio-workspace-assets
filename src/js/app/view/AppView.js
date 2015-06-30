/**
 * @module app/view/AppView
 */

/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:jquery} */
var $ = Backbone.$;
/** @type {module:underscore} */
var _ = require("underscore");

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

require("../../shims/requestAnimationFrame");

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
		/* create single hammerjs manager */
		this.touch = TouchManager.init(document.querySelector("#container"));
		
		this.breakpoints = {
			"desktop-small": window.matchMedia(Globals.BREAKPOINTS["desktop-small"])
		};
		
		if (DEBUG) {
			this.$el.append((new DebugToolbar({id: "debug-toolbar", collection: bundles})).render().el);
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
		
		// .skip-transitions on resize
		// $(window).on("resize orientationchange", function(ev) {
		// 	console.log("AppView [listener]", ev.type);
		// });
		// $(window).on("orientationchange resize", _.throttle(
		// 	this.render.bind(this), 100, {leading: true, trailing: true}
		// ));
		var handler = this.render.bind(this);
		$(window).on("orientationchange", handler);
		$(window).on("resize", _.debounce(handler, 100, false));
		
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

});

module.exports = AppView;
