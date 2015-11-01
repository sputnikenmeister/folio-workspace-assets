/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/view/promise/_whenImageLoads} */
var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */
var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL");

var isBlobRE = /^blob\:.*/;

var logMessage = "%s::whenDefaultImageLoads [%s]: %s";

module.exports = function(view) {
	return new Promise(function(resolve, reject) {
		if (view.model.has("prefetched")) {
			view.defaultImage.src = view.model.get("prefetched");
			_whenImageLoads(view.defaultImage)
				.then(
					function(targetEl) {
						console.log(logMessage, view.cid, "resolved", "prefetched");
						resolve(view);
					});
		} else {
			view.mediaState = "pending";
			
			var imageUrl = view.model.getImageUrl();
			var progressFn = function (progress) {
				// console.log(logMessage, view.cid, "progress", progress);
				// view.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
				view.updateMediaProgress(imageUrl, progress);
			};
			progressFn = _.throttle(progressFn, 100, {leading: true, trailing: false});
			
			_loadImageAsObjectURL(imageUrl, progressFn)
				.then(
					function(url) {
						if (isBlobRE.test(url))
							view.model.set({"prefetched": url});
						view.defaultImage.src = url;
						// URL.revokeObjectURL(url); 
						return view.defaultImage;
					})
				.then(_whenImageLoads)
				.then(
					function(targetEl) {
						console.log(logMessage, view.cid, "resolved", targetEl.src);
						// view.on("view:removed", function() { URL.revokeObjectURL(url); });
						// view.placeholder.removeAttribute("data-progress");
						// view.updateMediaProgress(imageUrl, "complete");
						resolve(view);
					},
				// 	})
				// .catch(
					function(err) {
						console.warn(logMessage, view.cid, "rejected", err.message);
						// view.placeholder.removeAttribute("data-progress");
						// view.updateMediaProgress(imageUrl, progress);
						reject(err);
					});
		}
	});
};
