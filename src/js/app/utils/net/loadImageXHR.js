/*global XMLHttpRequest, Blob */

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
	request.responseType = "arraybuffer";

	// When the request loads, check whether it was successful
	request.onload = function (ev) {
		if (request.status == 200) {
			// If successful, resolve the promise by passing back a reference url
			deferred.resolve(window.URL.createObjectURL(new Blob([request.response])), request, ev);
		} else {
			// If it fails, reject the promise with a error message
			deferred.reject(Error("Image didn\'t load successfully; error code:" + request.statusText), request, ev);
		}
	};
	request.onerror = function (ev) {
		// Also deal with the case when the entire request fails to begin with
		// This is probably a network error, so reject the promise with an appropriate message
		deferred.reject(Error("There was a network error."), request, ev);
	};
	request.onprogress = function (ev) {
		// Notify progress
		// if (ev instanceof ProgressEvent) {}
		deferred.notify(ev.loaded / ev.total, request, ev);
	};
	request.onabort = request.ontimeout = request.onerror;
	request.onloadstart = request.onloadend = request.onprogress;

	_.defer(_.bind(request.send, request));
	return deferred.promise();
};
