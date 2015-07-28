/*global XMLHttpRequest, URL, Blob */

/** @type {module:underscore} */
var _ = require("underscore");

var whenImageLoadedDOM = function(url, image) {
	return new Promise(function(resolve, reject) {
		var cleanup = function () {
			image.onload = image.onerror = image.onabort = void 0;
		};
		if (image.src != url) {
			image.src = url;
		}
		if (image.complete) {
			resolve(url);
		} else {
			image.onload = function(ev) {
				// console.log("resolve", url, ev);
				cleanup();
				resolve(url);
			};
			image.onerror = function(ev) {
				console.log("reject", ev.type, url, ev);
				var err = new Error("Failed to load image from " + url);
				err.event = ev;
				cleanup();
				reject(err);
			};
			image.onabort = function (ev) {
				console.log("reject", ev.type, url, ev);
				var err = new Error("Aborted loading image from " + url);
				err.event = ev;
				cleanup();
				reject(err);
			};
		}
	});
};

var whenImageLoadedXHR = function (url, image, progressFn) {
	return new Promise(function(resolve, reject) {
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "blob";
		
		// if progressFn is supplied
		// - - - - - - - - - - - - - - - - - -
		if (progressFn) {
			request.onprogress = function(ev) {
				progressFn(ev.loaded / ev.total);
			};
		}
		// resolved/success
		// - - - - - - - - - - - - - - - - - -
		request.onload = function (ev) {
			// When the request loads, check whether it was successful
			if (request.status == 200) {
				// If successful, resolve the promise by passing back a reference url
				var objUrl = URL.createObjectURL(request.response);
				// an image element was passed, defer resolution to allow the element to update itself
				if (image) {
					image.src = objUrl;
					_.defer(resolve, objUrl);
				} else {
					resolve(objUrl);
				}
			} else {
				// If it fails, reject the promise with a error message
				reject(Error("Failed to load image from: " + url + " (" + request.statusText + ")"));
			}
		};
		// reject/failure
		// - - - - - - - - - - - - - - - - - -
		request.onerror = function (ev) {
			var err = new Error("Failed to load image from " + url + " (" + ev.type + ")");
			err.event = ev;
			reject(err);
		};
		request.ontimeout = request.onerror;
		request.onabort = function (ev) {
			// console.log("reject", ev.type, url, ev);
			var err = new Error("Aborted loading image from " + url + " (" + ev.type + ")");
			err.event = ev;
			reject(err);
		};
		// finally
		// - - - - - - - - - - - - - - - - - -
		request.onloadend = function () {
			request.onabort = request.ontimeout = request.onerror = void 0;
			request.onload = request.onloadend = void 0;
			if (progressFn) {
				request.onprogress = void 0;
			}
		};
		
		request.send();
	});
};

/**
 * @param
 * @param
 * @return
 */
module.exports = (function(xhrSupported) {
	if (xhrSupported) {
		return function(url, image, progressFn) {
			return progressFn?
				whenImageLoadedXHR(url, image, progressFn) : whenImageLoadedDOM(url, image);
		};
	} else {
		return whenImageLoadedDOM;
	}
})(window.XMLHttpRequest && window.URL && window.Blob);
