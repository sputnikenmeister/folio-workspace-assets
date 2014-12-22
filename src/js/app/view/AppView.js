/**
 * @module app/view/AppView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

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
module.exports = Backbone.View.extend({

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
			// error trace
			this.listenTo(Backbone, "all", function(eventType){
				console.info("AppView::" + eventType);
			});
			this.$("#show-grid").click(function (ev) {
				Backbone.$("#container").toggleClass("debug-grid");
			})
			this.$("#show-blocks").click(function (ev) {
				Backbone.$("#container").toggleClass("debug-blocks");
			});
		} else {
			this.$("#debug-toolbar").remove();
		}

		/* start router, which will request appropiate state */
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
