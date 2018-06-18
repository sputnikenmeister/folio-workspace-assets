// /** @type {module:app/view/base/ViewError} */
// var ViewError = require("app/view/base/ViewError");

/** @type {module:app/view/promise/whenSelectionDistanceIs} */
var whenSelectionDistanceIs = require("app/view/promise/whenSelectionDistanceIs");

/** @param {module:app/view/base/View} */
module.exports = function(view) {
	return whenSelectionDistanceIs(view, 1);
};