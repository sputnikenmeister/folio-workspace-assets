/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/view/promise/_whenImageLoads} */
var _whenImageLoads = require("app/view/promise/_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */
var _loadImageAsObjectURL = require("app/view/promise/_loadImageAsObjectURL");

var isBlobRE = /^blob\:.*/;

module.exports = function(view) {
	return new Promise(function(resolve, reject) {
		var defaultImageEl = view.getDefaultImage();
		
		if (view.model.has("prefetched")) {
			defaultImageEl.src = view.model.get("prefetched");
			_whenImageLoads(defaultImageEl)
				.then(
					function(targetEl) {
						console.log(view.cid, view.model.cid, "whenDefaultImageLoads resolved", "prefetched");
						// view.setState("done");
						resolve(view);
					});
		} else {
			view.setState("pending");
			
			var progressFn = function (progress) {
				// console.log(view.cid, view.model.cid, "whenDefaultImageLoads progress", progress);
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
						// view.on("view:remove", function() { URL.revokeObjectURL(url); });
						console.log(view.cid, view.model.cid, "whenDefaultImageLoads resolved", targetEl.src);
						view.placeholder.removeAttribute("data-progress");
						// view.setState("done");
						resolve(view);
					})
				.catch(
					function(err) {
						console.log(view.cid, view.model.cid, "whenDefaultImageLoads rejected", err.message);
						view.placeholder.removeAttribute("data-progress");
						// view.setState("error");
						reject(err);
					});
		}
	});
};
