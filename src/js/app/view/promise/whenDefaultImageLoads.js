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
		var defaultImageEl = view.getDefaultImage();
		
		if (view.model.has("prefetched")) {
			defaultImageEl.src = view.model.get("prefetched");
			_whenImageLoads(defaultImageEl)
				.then(
					function(targetEl) {
						console.log(logMessage, view.cid, "resolved", "prefetched");
						resolve(view);
					});
		} else {
			view.setState("pending");
			
			var progressFn = function (progress) {
				// console.log(logMessage, view.cid, "progress", progress);
				view.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
			};
			progressFn = _.throttle(progressFn, 100, {leading: true, trailing: false});
			
			_loadImageAsObjectURL(view.model.getImageUrl(), progressFn)
				.then(
					function(url) {
						if (isBlobRE.test(url))
							view.model.set({"prefetched": url});
						defaultImageEl.src = url;
						return defaultImageEl;
					})
				.then(_whenImageLoads)
				.then(
					function(targetEl) {
						console.log(logMessage, view.cid, "resolved", targetEl.src);
						// view.on("view:removed", function() { URL.revokeObjectURL(url); });
						view.placeholder.removeAttribute("data-progress");
						resolve(view);
					})
				.catch(
					function(err) {
						console.warn(logMessage, view.cid, "rejected", err.message);
						view.placeholder.removeAttribute("data-progress");
						reject(err);
					});
		}
	});
};
