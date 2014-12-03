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
	/** @override */
	events: {
		"click #site-name": function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			controller.deselectBundle();
		}
	},

	/** Setup listening to model changes */
	initialize: function (options) {

		/* start router, which will request appropiate state */
		Backbone.history.start({
			pushState: false,
			hashChange: true
		});

		/* initialize views */
		this.navigationView = new NavigationView({
			el: "#navigation"
		});
		this.contentView = new ContentView({
			el: "#content"
		});

		this.listenTo(Backbone, "all", this.onApplicationEvent);
		this.listenTo(Backbone, "app:error", this.onApplicationError);

		if (DEBUG) {
			var pager = new CollectionPager({
				id: "bundle-pager",
				collection: bundles,
				labelAttribute: "name"
			});
			// append at the bottom of <body/>
			this.$("#debug-toolbar").append(pager.render().el);

			this.$("#debug-toolbar #tools").click(function (ev) {
				Backbone.$("#container").toggleClass("debug-grid");
			});
			controller.listenTo(pager, "view:select:one", controller.selectBundle);
			controller.listenTo(pager, "view:select:none", controller.deselectBundle);
		} else {
			this.$("#debug-toolbar").remove();
		}
	},

	onApplicationEvent: function (eventName) {
		this.el.className = eventName.split(":").join("-");
		console.log("AppView.onApplicationEvent " + eventName);
		//switch (eventName) {
		//	case "app:bundle:item":
		//	case "app:bundle:list":
		//	case "app:error":
		//}
	},

	onApplicationError: function () {
		console.log("AppView.onApplicationError", arguments);
	},


});
