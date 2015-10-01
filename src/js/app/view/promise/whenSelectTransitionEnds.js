/** @type {module:app/view/promise/whenTransitionEnds} */
var whenTransitionEnds = require("app/view/promise/whenTransitionEnds");

module.exports = function(view) {
	if (view.model.selected) {
		return Promise.resolve(view);
	} else {
		return whenTransitionEnds(view, view.el, "transform");
	}
};
