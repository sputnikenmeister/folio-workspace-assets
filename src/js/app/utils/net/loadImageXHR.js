/*global XMLHttpRequest, URL, Blob */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {{module:jquery}.Deferred} */
var Deferred = require("jquery").Deferred;

/**
 * @param
 * @param
 * @return
 */
module.exports = function (url, context) {
	// @see https://github.com/mdn/promises-test/blob/gh-pages/index.html
	var deferred = new Deferred();
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
//	request.responseType = "arraybuffer";
	request.responseType = "blob";

	// When the request loads, check whether it was successful
	request.onload = function (ev) {
		if (request.status == 200) {
			// If successful, resolve the promise by passing back a reference url
//			deferred.resolveWith(context, [request, window.URL.createObjectURL(new Blob([request.response])), ev]);
			deferred.resolveWith(context, [request, window.URL.createObjectURL(request.response), ev]);
//			deferred.resolveWith(context, [request, request.response, ev]);
		} else {
			// If it fails, reject the promise with a error message
			deferred.rejectWith(context, [request, Error("Image didn\'t load successfully; error code:" + request.statusText), ev]);
		}
	};
	request.onerror = function (ev) {
		// Also deal with the case when the entire request fails to begin with
		// This is probably a network error, so reject the promise with an appropriate message
		deferred.rejectWith(context, [request, Error("There was a network error."), ev]);
	};
	request.onprogress = function (ev) {
		// Notify progress
		if (ev.type == "loadstart") {
			deferred.notifyWith(context, [request, "start", ev]);
		} else {
			deferred.notifyWith(context, [request, ev.loaded / ev.total, ev]);
		}
	};
	request.onloadstart = function (ev) {
		// Notify progress
		deferred.notifyWith(context, [request, "start", ev]);
	};
	request.onabort = request.ontimeout = request.onerror;
	request.onloadstart = request.onloadend = request.onprogress;

	_.defer(_.bind(request.send, request));
	return deferred.promise();
};
