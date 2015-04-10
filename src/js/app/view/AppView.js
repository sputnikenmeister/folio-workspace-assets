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
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");

/** @type {module:app/view/base/View} */
var View = require("./base/View");
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
var AppView = View.extend({

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

		// .skip-transitions on resize
		this.initializeResizeHandlers_debounce();

		// start router, which will request appropiate state
		Backbone.history.start({
			pushState: false,
			hashChange: true
		});

		// Change to .app-ready on next frame:
		// CSS animations do not trigger while on .app-initial,
		// so everything will be rendered in it's final state
		this.render();
//		this.navigationView.render();
//		this.contentView.render();
//		window.requestAnimationFrame(function() {
		this.callNextFrame(function() {
			$(document.documentElement).removeClass("app-initial").addClass("app-ready");
		});
//		_.delay(function(view) {
//			$(document.documentElement).removeClass("app-initial").addClass("app-ready");
//			view.render();
////			$(".app-initial").removeClass("app-initial").addClass("app-ready");
////			view.$el.removeClass("app-initial").addClass("app-ready");
//		}, 66, this);
	},

	render: function () {
		this.navigationView.render();
		this.contentView.render();
		return this;
	},

	/* -------------------------------
	 * Resize (debounce)
	 * ------------------------------- */

	initializeResizeHandlers_timeout: function() {
		var debouncedFn, debouncedMs, delayedFn, delayedMs, delayedId = 0, view = this;
//		debouncedMs = Math.ceil(1000/30);
//		delayedMs = debouncedMs * 2;
		debouncedMs = 100;
		delayedMs = 150;
		delayedFn = function () {
			console.log("AppView [RESIZE LAST] timeout:" + delayedId);
			view.render();
			view.$el.removeClass("skip-transitions");
			delayedId = 0;
		};
		debouncedFn = function(ev) {
			if (delayedId == 0) {
				console.log("AppView [RESIZE FIRST]");
				view.$el.addClass("skip-transitions");
//				view.render();
			} else {
				console.log("AppView [RESIZE REPEAT] timeout:" + delayedId);
				window.clearTimeout(delayedId);
				view.render();
			}
			delayedId = window.setTimeout(delayedFn, delayedMs);
		};
		$(window).on("resize orientationchange", debouncedFn);
		//$(window).on("orientationchange resize", debouncedFn);
	},

	/* -------------------------------
	 * Resize (debounce)
	 * ------------------------------- */

	initializeResizeHandlers_debounce: function() {
		var debouncedFn, debouncedMs, delayedFn, delayedMs, delayedId, view = this;
//		debouncedMs = Math.ceil(1000/30);
//		delayedMs = debouncedMs * 2;
		debouncedMs = 100;
		delayedMs = 150;
		delayedFn = function () {
			view.$el.removeClass("skip-transitions");
			console.log("AppView.initializeResizeHandlers [delayed]   id:" + delayedId);
			delayedId = null;
		};
		debouncedFn = function (ev) {
			if (delayedId) {
				window.clearTimeout(delayedId);
			} else {
				view.$el.addClass("skip-transitions");
			}
			view.render();
			delayedId = _.delay(delayedFn, delayedMs);
			console.log("AppView.initializeResizeHandlers [debounced] id:" + delayedId);
		};
		debouncedFn = _.debounce(debouncedFn, debouncedMs);
		$(window).on("resize orientationchange", debouncedFn);
		//$(window).on("orientationchange resize", debouncedFn);
	},

	/* -------------------------------
	 * Resize (requestAnimationFrame)
	 * ------------------------------- */

//	/*
	initializeResizeHandlers_raf: function() {
		var view = this;
		var afterFrameId = 0;
		var onFrameId = 0;
		var afterFrame = function() {
			//console.log("AppView._raf afterFrame exec:"+afterFrameId);
			afterFrameId = 0;
			view.$el.removeClass("skip-transitions");
			//console.log("AppView.removeClass skip-transitions");
		};
		var onFrame = function() {
			//console.log("AppView._raf onFrame exec:"+onFrameId);
			onFrameId = 0;
			if (afterFrameId != 0) {
				window.cancelAnimationFrame(afterFrameId);
				//console.log("AppView._raf afterFrame cancel:"+afterFrameId);
			}
			view.render();
			afterFrameId = window.requestAnimationFrame(afterFrame);
			//console.log("AppView._raf afterFrame req:"+afterFrameId);
		};
		var onResize = function (ev) {
			//console.log("AppView._raf onEvent", ev && [ev.type, ev]);
			if (onFrameId != 0) {
				window.cancelAnimationFrame(onFrameId);
				//console.log("AppView._raf onFrame cancel:"+onFrameId);
			} else {
				view.$el.addClass("skip-transitions");
				//console.log("AppView.addClass skip-transitions");
			}
			onFrameId = window.requestAnimationFrame(onFrame);
			//console.log("AppView._raf onFrame req:" + onFrameId);
		};
		$(window).on("resize", onResize);
		//$(window).on("orientationchange resize", onResize);
	},
//	*/

	/* -------------------------------
	 * Resize (requestAnimationFrame stacked)
	 * ------------------------------- */

	/*
	initializeResizeHandlers_rafArr: function() {
		var view = this;
		var onFrameIds = [];
		var afterFrameIds = [];
		var eventFn = function (ev) {
			//console.log("AppView [RESIZE ON_EVENT    ]");
			if (onFrameIds.length == 0) {
				//console.log("AppView [CLASS ADD   ] skip-transitions");
				view.$el.addClass("skip-transitions");
			} else {
				do {
					//console.log("AppView [RESIZE ON_EVENT    ] onFrame cancelling: " + onFrameIds[0], onFrameIds);
					window.cancelAnimationFrame(onFrameIds.shift());
				} while (onFrameIds.length > 0);
			}
			var onFrameId = window.requestAnimationFrame(function() {
				onFrameIds.splice(onFrameIds.indexOf(onFrameId), 1);
				//console.log("AppView [RESIZE ON_FRAME    ] onFrame executing: " + onFrameId, onFrameIds);
				//console.log("AppView [RESIZE RENDER      ]");
				view.render();
				var afterFrameId = window.requestAnimationFrame(function() {
					onFrameIds.splice(onFrameIds.indexOf(afterFrameId), 1);
					//console.log("AppView [RESIZE AFTER_FRAME ] afterFrame executing: " + afterFrameId, onFrameIds);
					//console.log("AppView [CLASS REMOVE] skip-transitions");
					view.$el.removeClass("skip-transitions");
				});
				//console.log("AppView [RESIZE ON_FRAME    ] afterFrame requested: " + afterFrameId, onFrameIds);
				onFrameIds.push(afterFrameId);
			});
			//console.log("AppView [RESIZE ON_EVENT    ] onFrame requested: " + onFrameId, onFrameIds);
			onFrameIds.push(onFrameId);
		};
		$(window).on("resize", eventFn);
		//$(window).on("orientationchange resize", eventFn);
	},
	*/

	/* -------------------------------
	 * Resize (defer)
	 * ------------------------------- */

	/*
	initializeResizeHandlers_defer: function() {
		var view = this;
		var deferFn = function() {
			view.$el.removeClass("skip-transitions");
		};
		var eventFn = function() {
			view.render();
			view.$el.addClass("skip-transitions");
			_.defer(deferFn);
		};
		$(window).on("resize", eventFn);
		//$(window).on("orientationchange resize", eventFn);
	},
	*/

});

module.exports = AppView;
