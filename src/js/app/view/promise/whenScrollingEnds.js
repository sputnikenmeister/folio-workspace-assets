/* global Promise */
/** @type {module:app/view/base/ViewError} */
const ViewError = require("app/view/base/ViewError");

/** @type {module:app/view/base/ViewError} */
const whenViewIsAttached = require("app/view/promise/whenViewIsAttached");

function whenScrollingEnds(view) {
	return new Promise(function(resolve, reject) {
		var parent = view.parentView;
		if (parent === null) {
			console.error("%s::whenScrollingEnds [%s] (sync)", view.cid, "rejected", view.attached);
			reject(new ViewError(view, new Error("whenScrollingEnds: view has no parent")));
		} else if (!parent.scrolling) {
			// console.log("%s::whenScrollingEnds [%s] (sync)", view.cid, "resolved", view.attached);
			resolve(view);
		} else {
			var cleanup = function() {
				parent.off("view:scrollend", onScrollend);
				parent.off("view:remove", onRemove);
			};
			var onScrollend = function() {
				// console.log("%s::whenScrollingEnds [%s]", view.cid, "resolved", view.attached);
				cleanup();
				resolve(view);
			};
			var onRemove = function() {
				// console.log("%s::whenScrollingEnds [%s]", view.cid, "rejected", view.attached);
				cleanup();
				reject(new ViewError(view, new Error("whenScrollingEnds: view was removed")));
			};
			parent.on("view:scrollend", onScrollend);
			parent.on("view:remove", onRemove);
		}
	});
}

module.exports = function(view) {
	return Promise.resolve(view)
		.then(whenViewIsAttached)
		.then(whenScrollingEnds);
};

/*
module.exports = function(view) {
	return Promise.resolve(view)
		.then(function(view) {
			if (view.attached) {
				return view;
			} else {
				return new Promise(function(resolve, reject) {
					view.once("view:attached", function(view) {
						resolve(view);
					});
				});
			}
		})
		.then(function(view) {
			if (!view.parentView.scrolling) {
				return view;
			} else {
				return new Promise(function(resolve, reject) {
					var resolveOnScrollend = function() {
						// console.log("%s::whenScrollingEnds [%s]", view.cid, "resolved");
						view.off("view:remove", rejectOnRemove);
						resolve(view);
					};
					var rejectOnRemove = function(view) {
						// console.log("%s::whenScrollingEnds [%s]", view.cid, "rejected");
						view.parentView.off("view:scrollend", resolveOnScrollend);
						reject(new ViewError(view,
							new Error("whenSelectScrollingEnds: view was removed ("+ view.cid +")")));
					};
					view.parentView.once("view:scrollend", resolveOnScrollend);
					view.once("view:remove", rejectOnRemove);
				});
			}
		});
};
*/
