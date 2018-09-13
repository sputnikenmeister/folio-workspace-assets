/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/view/promise/_whenImageLoads} */
var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */
var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL");

// var isBlobRE = /^blob\:.*/;

// var logMessage = "%s::whenDefaultImageLoads [%s]: %s";

module.exports = function(view) {
	return new Promise(function(resolve, reject) {
		var source = view.model.get("source");
		if (source.has("prefetched")) {
			view.defaultImage.src = source.get("prefetched");
			_whenImageLoads(view.defaultImage)
				.then(
					function(targetEl) {
						// console.log(logMessage, view.cid, "resolved", "prefetched");
						resolve(view);
					});
		} else {
			view.mediaState = "pending";

			var sUrl = source.get("original");
			var progressFn = function(progress, ev) {
				// console.log(logMessage, view.cid, "progress", progress);
				view.updateMediaProgress(progress, sUrl);
			};
			progressFn = _.throttle(progressFn, 100, {
				leading: true,
				trailing: false
			});
			_loadImageAsObjectURL(sUrl, progressFn)
				.then(
					function(url) {
						if (/^blob\:.*/.test(url)) {
							source.set("prefetched", url);
						}
						view.defaultImage.src = url;
						// URL.revokeObjectURL(url);
						return view.defaultImage;
					})
				.then(_whenImageLoads)
				.then(
					function(targetEl) {
						// console.log(logMessage, view.cid, "resolved", targetEl.src);
						view.on("view:removed", function() {
							var prefetched = source.get("prefetched");
							if (prefetched && /^blob\:/.test(prefetched)) {
								source.unset("prefetched", {
									silent: true
								});
								URL.revokeObjectURL(prefetched);
							}
						});
						// view.placeholder.removeAttribute("data-progress");
						// view.updateMediaProgress(imageUrl, "complete");
						resolve(view);
					},
					// 	})
					// .catch(
					function(err) {
						// console.warn(logMessage, view.cid, "rejected", err.message);
						// view.placeholder.removeAttribute("data-progress");
						// view.updateMediaProgress(imageUrl, progress);
						reject(err);
					});
		}
	});
};
