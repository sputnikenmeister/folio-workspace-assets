/**
 * @module app/view/AppView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:app/control/TouchManager} */
var TouchManager = require("../control/TouchManager");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/view/NavigationView} */
var NavigationView = require("./NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("./ContentView");
/** @type {module:app/view/FooterView} */
var FooterView = require("./FooterView");

require("../../shims/requestAnimationFrame");

if (DEBUG) {
	/** @type {module:app/view/DebugToolbar} */
	var DebugToolbar = require("./DebugToolbar");
}

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
var AppView = Backbone.View.extend({

	/** @override */
	el: "body",

	/** @override */
	initialize: function (options) {
		/* create single hammerjs manager */
		this.touch = TouchManager.init(document.querySelector("#container"));

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
		this.footerView = new FooterView({
			el: "#footer"
		});

		// start router, which will request appropiate state
		Backbone.history.start({
			pushState: false,
			hashChange: true
		});

		// .skip-transitions on resize (many versions, none ok)
//		this.initializeResizeHandlers();
//		this.initializeResizeHandlers_raf();
		this.initializeResizeHandlers_debounce();

		// Change to .app-ready on next frame:
		// CSS animations do not trigger while on .app-initial,
		// so everything will be rendered in it's final state
		_.delay(function(view) {
			view.$el.removeClass("app-initial").addClass("app-ready");
//			Backbone.$(document.documentElement).removeClass("app-initial").addClass("app-ready");
			view.render();
		}, 10, this);
	},

	render: function () {
		this.navigationView.render();
		this.contentView.render();
		return this;
	},

	/* -------------------------------
	 * Resize (defer)
	 * ------------------------------- */

	initializeResizeHandlers: function() {
		var view = this;
		var deferFn = function() {
			view.$el.removeClass("skip-transitions");
		};
		var eventFn = function() {
			view.$el.addClass("skip-transitions");
			view.render();
			_.defer(deferFn);
		};
		Backbone.$(window).on("orientationchange resize", eventFn);
	},

	/* -------------------------------
	 * Resize (debounce)
	 * ------------------------------- */

	initializeResizeHandlers_debounce: function() {
		var delay = 1000/50;
		var delayId = 0, view = this;
		var delayFn = function () {
			console.log("AppView onResize delayFn", "exec " + delayId);
			delayId = 0;
			//view.render();
			view.$el.removeClass("skip-transitions");
		};
		var eventFn = function (ev) {
			console.log("AppView onResize eventFn", "pending " + (delayId != 0? delayId : "none"), (ev && ev.type));
			if (delayId == 0) {
				view.$el.addClass("skip-transitions");
			} else {
				window.clearTimeout(delayId);
			}
			view.render();
			delayId = _.delay(delayFn, delay * 0.1);
		};
		eventFn = _.throttle(eventFn, delay, {leading: false});
//		eventFn = _.debounce(eventFn, delay);
		Backbone.$(window).on("orientationchange resize", eventFn);
	},

	/* -------------------------------
	 * Resize (requestAnimationFrame)
	 * ------------------------------- */

	initializeResizeHandlers_raf: function() {
		var rafId = 0;
		var view = this;
		var onFrame = function() {
			console.log("AppView._raf exec", rafId);
			rafId = 0;
//			view.render();
			view.$el.removeClass("skip-transitions");
			console.log("AppView.removeClass skip-transitions");
		};
		var onEvent = function (ev) {
			if (rafId == 0) {
				view.$el.addClass("skip-transitions");
				console.log("AppView.addClass skip-transitions");
			} else {
				window.cancelAnimationFrame(rafId);
			}
			rafId = window.requestAnimationFrame(onFrame);
			console.log("AppView._raf request", rafId);
			view.render();
		};
//		Backbone.$(window).on("resize", onEvent);
		Backbone.$(window).on("orientationchange resize", onEvent);
	},

	/* -------------------------------
	 * Resize (requestAnimationFrame stacked)
	 * ------------------------------- */

	initializeResizeHandlers_rafArr: function() {
		var rafIds = [];
		var view = this;
		var onResize = function (ev) {
			if (rafIds.length == 0) {
				view.$el.addClass("skip-transitions");
			} else {
				do {
					window.cancelAnimationFrame(rafIds.shift());
				} while (rafIds.length > 0);
			}
			var id = window.requestAnimationFrame(function() {
				//console.log("AppView._raf exec", id, arguments);
				rafIds.splice(rafIds.indexOf(id), 1);
				view.render();
				view.$el.removeClass("skip-transitions");
			});
			rafIds.push(id);
			//console.log("AppView._raf request", id);
		};
		Backbone.$(window).on("orientationchange resize", onResize);
	},

});

module.exports = AppView;
