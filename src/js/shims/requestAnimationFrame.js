(function() {
	var vendors = ["ms", "moz", "webkit", "o"], x = -1;
	for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
		window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] ||
				window[vendors[x] + "CancelRequestAnimationFrame"];
	}
	if (window.requestAnimationFrame) {
		console.log("Native window.requestAnimationFrame found ("+ (x? "prefix: " + vendors[x] : "unprefixed") +")");
	} else {
		console.warn("No native window.requestAnimationFrame found");
	}
	if (!window.requestAnimationFrame) {
		// (function() {
		// 	var FPS = 1000/60;
		// 	window.requestAnimationFrame = function (callback) {
		// 		return window.setTimeout(callback, FPS);
		// 	};
		// })();
		(function() {
			var lastTime = 0;
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = window.setTimeout(function() {
						callback(currTime + timeToCall);
					}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		})();
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			window.clearTimeout(id);
		};
	}
})();

// module.exports = window.requestAnimationFrame;
