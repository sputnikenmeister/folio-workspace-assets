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
		// element is already in the dom, so explicitly add css classes
//		this.$el.addClass(this.className);
		// pager
		var pager = new CollectionPager({
			collection: bundles,
			template: pagerTemplate,
			labelAttribute: "name",
		});
		pager.render().$el.prependTo(this.el);
		controller.listenTo(pager, {
			"view:select:one": controller.selectBundle,
			"view:select:none": controller.deselectBundle
		});
	},
});

module.exports = FooterView;
