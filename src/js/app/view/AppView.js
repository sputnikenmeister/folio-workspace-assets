/**
 * @module app/view/AppView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/view/component/CollectionPagerView} */
var CollectionPagerView = require("./component/CollectionPagerView");
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
		this.bundlePager = this.createBundlePager();
	},

	onApplicationEvent: function(eventName) {
		console.log("AppView.onApplicationEvent " + eventName);
		switch (eventName){
			case "app:error":
				console.log("AppView.showError - not implemented");
				presenter.deselectBundle();
				break;
			default:
				this.el.className = eventName.split(":").join("-");
				break;
		}
	},

	createBundlePager: function () {
		var pager = new CollectionPagerView({
			id: "bundle-pager",
			collection: bundles,
			className: "fontello-pill-pager",
			labelAttribute: "name"
		});
		// append at the bottom of <body/>
		this.$el.append(pager.render().el);
		presenter.listenTo(pager, "view:select:one", presenter.selectBundle);
		presenter.listenTo(pager, "view:select:none", presenter.deselectBundle);
		return pager;
	},

});
