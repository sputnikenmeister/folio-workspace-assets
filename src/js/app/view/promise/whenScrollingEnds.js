/* global Promise */
/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError");

module.exports = function(renderer) {
	return new Promise(function(resolve, reject) {
		if (renderer.parentView.scrolling) {
			var resolveOnScrollend = function() {
				// console.log("%s::whenScrollingEnds [%s]", renderer.cid, "resolved");
				renderer.parentView.off("view:remove", rejectOnRemove);
				resolve(renderer);
			};
			var rejectOnRemove = function(view) {
				// console.log("%s::whenScrollingEnds [%s]", renderer.cid, "rejected");
				renderer.parentView.off("view:scrollend", resolveOnScrollend);
				reject(new ViewError(view,
					new Error("whenSelectScrollingEnds: view was removed ("+ view.cid +")")));
			};
			renderer.parentView.once("view:scrollend", resolveOnScrollend);
			renderer.parentView.once("view:remove", rejectOnRemove);
		} else {
			// console.log("%s::whenScrollingEnds [%s] (sync)", renderer.cid, "resolved");
			return resolve(renderer);
		}
	});
};
