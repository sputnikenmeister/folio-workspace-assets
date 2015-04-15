
/** @type {module:app/utils/css/prefixedStyleName} */
var prefixedStyleName = require("./prefixedStyleName");
/** @type {module:app/utils/css/prefixedProperty} */
var prefixedProperty = require("../prefixedProperty");

// cached values
var _properties = {}, _styleNames = {};

module.exports = function (style, property, opts) {
	console.info("prefix called");
	return prefixedProperty(style, property);
};
