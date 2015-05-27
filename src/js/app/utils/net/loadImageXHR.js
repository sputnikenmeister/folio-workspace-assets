/*global XMLHttpRequest, URL, Blob */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {{module:jquery}.Deferred} */
var Deferred = require("jquery").Deferred;

function getMimeFromFilename(filename) {
	try {
		var MIME_TYPES = { png: "image\/png", jpg: "image\/jpeg" };
		return MIME_TYPES[filename.match(/\w+$/)[0].toLowerCase()];
	} catch (ex) {
		return void 0;
	}
}

/**
 * @param
 * @param
 * @return
 */
module.exports = function (url, image, context) {
	// @see https://github.com/mdn/promises-test/blob/gh-pages/index.html
	var timeoutId, cleanup, mixin;
	var deferred = new Deferred(), request = new XMLHttpRequest();

	//var mime = getMimeFromFilename(url);
	//mime && request.overrideMimeType(mime + "; charset=x-user-defined");
	request.open("GET", url, true);
	request.responseType = "blob";
	context || (context = image || request);

	cleanup = function () {
		request.onabort = request.ontimeout = request.onerror =
			request.onloadstart = request.onloadend = request.onprogress = void 0;
	};

	mixin = {
		request: function () {
			timeoutId = window.setTimeout(function () {
				timeoutId = void 0;
				request.send.call(request);
			}, 1);
		},
		abort: function () {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
			request.abort();
		},
		destroy: function () {
			//URL.revokeObjectURL(this.image.src);
			cleanup();
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
			request.abort();
		},
	};
	request.onload = function (ev) {
		// When the request loads, check whether it was successful
		if (request.status == 200) {
			// If successful, resolve the promise by passing back a reference url
			var objUrl = URL.createObjectURL(request.response);
			if (image) {
				image.src = objUrl;
			}
			deferred.resolveWith(context, [objUrl, request, ev]);
		} else {
			// If it fails, reject the promise with a error message
			deferred.rejectWith(context, [Error("Image didn\'t load successfully; error code:" + request.statusText), request, ev]);
		}
	};
	request.onerror = function (ev) {
		// Also deal with the case when the entire request fails to begin with
		// This is probably a network error, so reject the promise with an appropriate message
		deferred.rejectWith(context, [Error("There was a network error."), request, ev]);
	};
	request.onprogress = function (ev) {
		// Notify progress
		if (ev.type == "loadstart") {
			deferred.notifyWith(context, ["loadstart", request, ev]);
		} else {
			deferred.notifyWith(context, [ev.loaded / ev.total, request, ev]);
		}
	};
	request.onabort = function (ev) {
		console.info("XHR Abort: " + url);
	};
//	request.onloadstart = function (ev) {
//		// Notify progress
//		deferred.notifyWith(context, ["loadstart", request, ev]);
//	};
	request.onloadstart = request.onloadend = request.onprogress;
	//request.onabort = request.ontimeout = request.onerror;
	request.ontimeout = request.onerror;

	deferred.always(cleanup);
	deferred.promise(mixin);

	return mixin;
};
