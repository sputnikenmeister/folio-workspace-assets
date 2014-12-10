/**
 * @module app/view/AppView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("./component/CollectionPager");
/** @type {module:app/view/NavigationView} */
var NavigationView = require("./NavigationView");
/** @type {module:app/view/ContentView} */
var ContentView = require("./ContentView");

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

	/** Setup listening to model changes */
	initialize: function (options) {
		/* start router, which will request appropiate state */
		Backbone.history.start({
			pushState: false,
			hashChange: true
		});

		this.$el.removeClass("app-initial").addClass("app-ready");

		/* initialize views */
		this.navigationView = new NavigationView({
			el: "#navigation"
		});
		this.contentView = new ContentView({
			el: "#content"
		});

		this.listenTo(Backbone, {
			"app:error": this.onApplicationError,
		});

		if (DEBUG) {
			// error trace
			this.listenTo(Backbone, "all", function(eventType){
				console.info("AppView::" + eventType);
			});
			// pager
			var pager = new CollectionPager({
				id: "bundle-pager",
				collection: bundles,
				labelAttribute: "name"
			});
			// append at the bottom of <body/>
			this.$("#debug-toolbar").append(pager.render().el);
			controller.listenTo(pager, "view:select:one", controller.selectBundle);
			controller.listenTo(pager, "view:select:none", controller.deselectBundle);

			this.$("#debug-toolbar #show-grid").click(function (ev) {
				Backbone.$("#container").toggleClass("debug-grid");
			});
			this.$("#debug-toolbar #show-blocks").click(function (ev) {
				Backbone.$("#container").toggleClass("debug-blocks");
			});
//			this.$("#debug-toolbar #edit-backend").click(function (ev) {
//				Backbone.$("#container").toggleClass("debug-blocks");
//			});
		} else {
			this.$("#debug-toolbar").remove();
		}
	},

	onApplicationError: function () {
		console.error("AppView::Error", arguments);
	},


});
