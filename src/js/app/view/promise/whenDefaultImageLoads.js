/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/view/promise/_whenImageLoads} */
var _whenImageLoads = require("./_whenImageLoads");
/** @type {module:app/view/promise/_loadImageAsObjectURL} */
var _loadImageAsObjectURL = require("./_loadImageAsObjectURL");

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
						view.el.classList.remove("idle");
						view.el.classList.add("done");
						resolve(view);
					});
		} else {
			view.el.classList.remove("idle");
			view.el.classList.add("pending");
			
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
						view.el.classList.remove("pending");
						view.el.classList.add("done");
						resolve(view);
					})
				.catch(
					function(err) {
						console.log(view.cid, view.model.cid, "whenDefaultImageLoads rejected", err.message);
						view.placeholder.style.color = "inherit";
						view.placeholder.textContent = err.message;
						view.placeholder.removeAttribute("data-progress");
						view.el.classList.remove("pending");
						view.el.classList.add("error");
						reject(err);
					});
		}
	});
};
