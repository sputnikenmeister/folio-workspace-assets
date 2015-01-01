/**
 * @module app/view/AppView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:cookies-js} */
var Cookies = require("cookies-js");

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

		// Change to .app-ready on next frame:
		// CSS animations do not trigger while on .app-initial,
		// so everything will be rendered in it's final state
		_.defer(_.bind(function() {
			this.$el.removeClass("app-initial").addClass("app-ready");
		}, this));
	},

});
module.exports = AppView;

var DebugToolbar = Backbone.View.extend({
	initialize: function (options) {
		var backendEl = this.$("#edit-backend");
		this.listenTo(bundles, {
			"select:one": function(bundle) {
				backendEl.attr("href", approot + "symphony/publish/bundles/edit/" + bundle.id);
			},
			"select:none": function() {
				backendEl.attr("href", approot + "symphony/publish/bundles/");
			}
		});

		var container = Backbone.$("#container");
		this.initDebugToggle("debug-grid", this.$("#show-grid"), container);
		this.initDebugToggle("debug-blocks", this.$("#show-blocks"), container);
//		if (Cookies.get("debug-grid")) {
//			this.$container.addClass("debug-grid");
//		}
//		if (Cookies.get("debug-blocks")) {
//			this.$container.addClass("debug-blocks");
//		}
//		this.$container = container;
	},

//	events: {
//		"click #show-grid": "toggleGrid",
//		"click #show-blocks": "toggleBlocks"
//	},

	initDebugToggle: function (name, toggleEl, targetEl) {
		toggleEl.on("click", function (ev) {
			targetEl.toggleClass(name);
			Cookies.set(name, targetEl.hasClass(name)? "true": "");
		});
		if (Cookies.get(name)) {
			targetEl.addClass(name);
		}
	}

//	toggleGrid: function() {
//		this.$container.toggleClass("debug-grid");
//		Cookies.set("debug-grid", this.$container.hasClass("debug-grid")? "true": "");
//	},
//
//	toggleBlocks: function() {
//		this.$container.toggleClass("debug-blocks");
//		Cookies.set("debug-blocks", this.$container.hasClass("debug-blocks")? "true": "");
//	}
});
