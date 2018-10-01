/** @type {module:app/view/promise/whenTransitionEnds} */
const whenTransitionEnds = require("app/view/promise/whenTransitionEnds");
// /** @type {module:app/view/promise/whenScrollingEnds} */
// var whenScrollingEnds = require("app/view/promise/whenScrollingEnds");

module.exports = function(view) {
	if (view.model.selected) {
		return Promise.resolve(view);
	} else {
		return whenTransitionEnds(view, view.el, "transform");
	}
};
