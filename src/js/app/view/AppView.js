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
/** @type {module:app/control/Presenter} */
var presenter = require("../control/Presenter");

/**
 * @constructor
 * @type {module:app/view/AppView}
 */
module.exports = Backbone.View.extend({
	/** @override */
	el: "body",
	/** @override */
	events: {
		"click #site-name": function(ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
			presenter.deselectBundle();
		}
	},

	/** Setup listening to model changes */
	initialize: function (options) {
		this.listenTo(Backbone, "all", this.onApplicationEvent);
		/* start router, which will request appropiate state */
		Backbone.history.start({ pushState: false, hashChange: true });

		/* initialize views */
		this.navigationView = new NavigationView({
			el: "#navigation"
		});
		this.contentView = new ContentView({
			el: "#content"
		});

		if (window.DEBUG) this.initDebug();
	},

	onApplicationEvent: function(eventName) {
		this.el.className = eventName.split(":").join("-");
		console.log("AppView.onApplicationEvent " + eventName);
		switch (eventName){
			case "app:bundle:item":
				// this.$el.attach(this.bundlePager.el);
				break;
			// case "app:bundle:list":
			// case "app:error":
			case "app:error":
				console.log("AppView.showError - not implemented");
				presenter.deselectBundle();
				break;
			default:
				break;
		}
	},

	initDebug: function () {
		var pager = new CollectionPager({
			id: "bundle-pager",
			collection: bundles,
			labelAttribute: "name"
		});
		// append at the bottom of <body/>
		this.$("#debug-toolbar").append(pager.render().el);

		this.$("#debug-toolbar #tools").click(function(ev) {
			Backbone.$(document.body).toggleClass("debug-grid");
		});
		presenter.listenTo(pager, "view:select:one", presenter.selectBundle);
		presenter.listenTo(pager, "view:select:none", presenter.deselectBundle);
	},

});
