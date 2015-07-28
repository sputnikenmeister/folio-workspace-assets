/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/view/promise/whenImageLoads} */
var whenImageLoads = require("./whenImageLoads");

module.exports = function(view) {
	if (view.model.has("prefetched")) {
		console.log(view.cid, view.model.cid, "image is prefetched");
		view.el.classList.remove("idle");
		view.el.classList.add("done");
		view.image.src = view.model.get("prefetched");
		return view;
	} else {
		return new Promise(function(resolve, reject) {
			view.el.classList.remove("idle");
			view.el.classList.add("pending");
			whenImageLoads(view.model.getImageUrl(), view.image,
				_.throttle(function (progress) {
					console.log(view.cid, view.model.cid, "whenDefaultImageLoads progress", progress);
					view.placeholder.setAttribute("data-progress", (progress * 100).toFixed(0));
				}, 100, {leading: true, trailing: false})
			).then(
				function(url) {
					console.log(view.cid, view.model.cid, "whenDefaultImageLoads resolved", url);
					view.placeholder.removeAttribute("data-progress");
					view.el.classList.remove("pending");
					view.el.classList.add("done");
					if (/^blob\:.*/.test(url)) {
						view.model.set({"prefetched": url});
						// view.on("view:remove", function() {
						// 	window.URL.revokeObjectURL(url);
						// });
					}
					resolve(view);
				},
				function(err) {
					console.log(view.cid, view.model.cid, "whenDefaultImageLoads rejected", err.message);
					view.placeholder.removeAttribute("data-progress");
					view.el.classList.remove("pending");
					view.el.classList.add("error");
					reject(err);
				}
			);
		});
	}
};
