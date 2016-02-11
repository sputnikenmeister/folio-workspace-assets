/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError");

// var logMessage = "%s::whenSelectionDistanceIs [%s]: %s";

/**
* @param {module:app/view/base/View}
* @param {number} distance
*/
module.exports = function(view, distance) {
	return new Promise(function(resolve, reject) {
		// if (!(view.model && view.model.collection)) {
		// 	reject(new ViewError(view, new Error("whenSelectionIsContiguous: model.collection is empty")));
		// }
		var model = view.model;
		var collection = model.collection;
		
		var check = function(n) { // Check indices for contiguity
			return Math.abs(collection.indexOf(model) - collection.selectedIndex) <= distance;
		};
		
		if (check()) {
			// console.log(logMessage, view.cid, "resolve", "sync");
			resolve(view);
		} else {
			var cleanupOnSettle = function() {
				// console.log(logMessage, view.cid, "cleanup", "async");
				collection.off("select:one select:none", resolveOnSelect);
				view.off("view:removed", rejectOnRemove);
			};
			var resolveOnSelect = function(model) {
				if (check()) {
					// console.log(logMessage, view.cid, "resolve", "async");
					cleanupOnSettle();
					resolve(view);
				}
			};
			var rejectOnRemove = function(view) {
				cleanupOnSettle();
				reject(new ViewError(view, new Error("whenSelectionDistanceIs: view was removed")));
			};
			collection.on("select:one select:none", resolveOnSelect);
			view.on("view:removed", rejectOnRemove);
		}
	});
};
