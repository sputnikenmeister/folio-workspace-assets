/**
 * @module app/view/FooterView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/helper/View} */
var View = require("../helper/View");
/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("./component/CollectionPager");
/** @type {Function} */
var pagerTemplate = require("./template/CollectionPager.Bundle.tpl");

/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");

/**
 * @constructor
 * @type {module:app/view/FooterView}
 */
var FooterView = View.extend({

	className: "footer mutable-faded",

	initialize: function (options) {
		this.$el.addClass(this.className);
		// pager
		this.pager = new CollectionPager({
			id: "bundle-pager",
			collection: bundles,
			template: pagerTemplate,
			labelAttribute: "name",
		});
		this.pager.render().$el.prependTo(this.el);
		this.listenTo(this.pager, "view:select:one", this._onChildSelectOne);
		this.listenTo(this.pager, "view:select:none", this._onChildSelectNone);
	},

	_onChildSelectOne: function (bundle) {
		controller.selectBundle(bundle);
	},

	_onChildSelectNone: function () {
		controller.deselectBundle();
	},
});

module.exports = FooterView;
