/** @type {module:app/control/Controller} */
var controller = require("../control/Controller");
/** @type {module:app/model/collection/BundleList} */
var bundles = require("../model/collection/BundleList");
/** @type {module:app/view/component/CollectionPager} */
var CollectionPager = require("./component/CollectionPager");
/** @type {Function} */
var bundlePagerTemplate = require("./template/CollectionPager.Bundle.tpl");

module.exports = function() {
	// Component: bundle pager
	var bundlePager = new CollectionPager({
		id: "bundle-pager",
		className: "mutable-faded",
		collection: bundles,
		template: bundlePagerTemplate,
		labelAttribute: "name",
	});
	controller.listenTo(bundlePager, {
		"view:select:one": controller.selectBundle,
		"view:select:none": controller.deselectBundle
	});
	return bundlePager;
};
