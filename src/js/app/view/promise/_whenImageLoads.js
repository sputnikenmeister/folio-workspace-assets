module.exports = function(image, resolveEmpty) {
	return new Promise(function(resolve, reject) {
		if (!(image instanceof window.HTMLImageElement)) {
			reject(new Error("not an HTMLImageElement"));
		} else if (image.complete && (image.src.length > 0 || resolveEmpty)) {
			// if (image.src === "") console.warn("_whenImageLoads resolved with empty src");
			// else console.log("_whenImageLoads resolve-sync", image.src);
			resolve(image);
		} else {
			var handlers = {
				load: function(ev) {
					// console.log("_whenImageLoads_dom resolve-async", ev.type, image.src);
					removeEventListeners();
					resolve(image);
				},
				error: function(ev) {
					var err = new Error("Loading failed (" + ev.type + " event)");
					err.infoCode = -1;
					err.infoSrc = image.src;
					err.logEvent = ev;
					err.logMessage = "_whenImageLoads::" + ev.type + " [reject]";
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
		}
	});
};
