/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError");

/** @param {module:app/view/base/View} */
module.exports = function(view) {
	return new Promise(function(resolve, reject) {
		/** @type {module:Backbone.Model} */
		var model = view.model;
		/** @type {module:app/model/SelectableCollection} */
		var collection = model.collection;
		
		var check = function(n) { // Check indices for contiguity
			return Math.abs(collection.indexOf(model) - collection.selectedIndex) < 2;
		};
		
		if (check()) {
			// console.log(view.cid, view.model.cid, "whenSelectionIsContiguous: sync resolve");
			resolve(view);
		} else {
			var cleanupOnSettle = function() {
				// console.log(view.cid, view.model.cid, "whenSelectionIsContiguous: cleanup");
				collection.off("select:one select:none", resolveOnSelect);
				view.off("view:remove", rejectOnRemove);
			};
			var resolveOnSelect = function(model) {
				if (check()) {
					// console.log(view.cid, view.model.cid, "whenSelectionIsContiguous: async resolve");
					cleanupOnSettle();
					resolve(view);
				}
			};
			var rejectOnRemove = function(view) {
				cleanupOnSettle();
				reject(new ViewError(view, new Error("whenSelectionIsContiguous: view was removed")));
			};
			collection.on("select:one select:none", resolveOnSelect);
			view.on("view:remove", rejectOnRemove);
		}
	});
};
