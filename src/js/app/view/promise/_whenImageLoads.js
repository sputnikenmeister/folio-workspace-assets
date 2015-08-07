module.exports = function(image) {
	if (image.complete) {
		console.log("_whenImageLoads_dom resolve-sync", image.src);
		return Promise.resolve(image);
	} else {
		return new Promise(function(resolve, reject) {
			var handlers = {
				load: function(ev) {
					// console.log("_whenImageLoads_dom resolve-async", ev.type, image.src);
					removeEventListeners();
					resolve(image);
				},
				error: function(ev) {
					// console.log("_whenImageLoads_dom reject", ev.type, image.src);
					var err = new Error("Failed to load image from " + image.src + " [" + ev.type + "]");
					err.event = ev;
					removeEventListeners();
					reject(err);
				}
			};
			handlers.abort = handlers.error;
			var removeEventListeners = function () {
				for (var event in handlers) {
					if (handlers.hasOwnProperty(event)) {
						image.removeEventListener(event, handlers[event], false);
					}
				}
			};
			for (var event in handlers) {
				if (handlers.hasOwnProperty(event)) {
					image.addEventListener(event, handlers[event], false);
				}
			}
		});
	}
};
