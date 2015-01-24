/**
 * @module app/view/AppView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../control/Globals");
/** @type {module:app/view/NavigationView} */
var NavigationView = require("./NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("./ContentView");
/** @type {module:app/view/FooterView} */
var FooterView = require("./FooterView");

/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
var AppView = Backbone.View.extend({

	/** @override */
	el: "body",

	/** @override */
	initialize: function (options) {
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

		if (DEBUG) {
			this.debugToolbar = new DebugToolbar({el: "#debug-toolbar"});
		} else {
			this.$("#debug-toolbar").remove();
		}

		// start router, which will request appropiate state
		Backbone.history.start({
			pushState: false,
			hashChange: true
		});

//		this.navigationView.render();

		var $body = this.$el;
		// BODY.skip-transitions clears CSS transitions for a frame
		// Apply on window size events
		var onViewportResize = function() {
			$body.addClass("skip-transitions");
			_.defer(function() {
				$body.removeClass("skip-transitions");
			});
		};
		Backbone.$(window).on("orientationchange resize", onViewportResize);

		// Change to .app-ready on next frame:
		// CSS animations do not trigger while on .app-initial,
		// so everything will be rendered in it's final state
		var afterInitialize = function() {
			$body.removeClass("app-initial").addClass("app-ready");
		};
		_.defer(afterInitialize);
	},
});

module.exports = AppView;

/** @type {module:cookies-js} */
var Cookies = require("cookies-js");

var DebugToolbar = Backbone.View.extend({
	initialize: function (options) {
		Cookies.defaults = {
			domain: String(window.location).match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
		};
		var backendEl = this.$("#edit-backend");
		this.listenTo(bundles, {
			"select:one": function(bundle) {
				backendEl.text("Edit Bundle");
				backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/edit/" + bundle.id);
			},
			"select:none": function() {
				backendEl.text("Edit List");
				backendEl.attr("href", Globals.APP_ROOT + "symphony/publish/bundles/");
			}
		});

		var container = Backbone.$("#container");
		this.initializeToggle("debug-grid", this.$("#show-grid"), container);
		this.initializeToggle("debug-blocks", this.$("#show-blocks"), container);
	},

	initializeToggle: function (name, toggleEl, targetEl) {
		toggleEl.on("click", function (ev) {
			targetEl.toggleClass(name);
			Cookies.set(name, targetEl.hasClass(name)? "true": "");
		});
		if (Cookies.get(name)) {
			targetEl.addClass(name);
		}
	}
});
