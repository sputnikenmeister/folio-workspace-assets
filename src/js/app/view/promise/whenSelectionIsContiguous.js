/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");

/** @param {module:app/view/base/View} */
module.exports = function(view) {
	return new Promise(function(resolve, reject) {
		/** @type {module:Backbone.Model} */
		var model = view.model;
		/** @type {module:app/model/SelectableCollection} */
		var collection = model.collection;
		
		var m = collection.indexOf(model);
		var check = function(n) { // Check indices for contiguity
			// return Math.abs(collection.indexOf(model) - collection.selectedIndex) < 2;
			// return (m + 1 === n) || (m - 1 === n) || (m === n);
			return Math.abs(m - n) < 2;
		};
		
		if (check(collection.selectedIndex)) {
			resolve(view);
		} else {
			var cleanupOnSettle = function() {
				console.log(view.cid, view.model.cid, "whenSelectionIsContiguous: cleanup");
				collection.off("select:one select:none", resolveOnSelect);
				view.off("view:remove", rejectOnRemove);
			};
			var resolveOnSelect = function(model) {
				if (check(collection.selectedIndex)) {
					console.log(view.cid, view.model.cid, "whenSelectionIsContiguous: resolving");
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
