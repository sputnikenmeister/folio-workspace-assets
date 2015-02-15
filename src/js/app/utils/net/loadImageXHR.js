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
module.exports = function (url, image, context) {
	// @see https://github.com/mdn/promises-test/blob/gh-pages/index.html
	var deferred = new Deferred();
	var request = new XMLHttpRequest();

	context || (context = image || request);
	request.open("GET", url, true);
//	request.overrideMimeType("text\/plain; charset=x-user-defined");
//	request.responseType = "arraybuffer";
	request.responseType = "blob";

	// When the request loads, check whether it was successful
	request.onload = function (ev) {
		if (request.status == 200) {
			// If successful, resolve the promise by passing back a reference url
//			var objUrl = URL.createObjectURL(new Blob([request.response]);
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
	request.onloadstart = function (ev) {
		// Notify progress
		deferred.notifyWith(context, ["loadstart", request, ev]);
	};
	deferred.always(function () {
		request.onabort = request.ontimeout = request.onerror = request.onloadstart = request.onloadend = request.onprogress = void 0;
	});
	request.onloadstart = request.onloadend = request.onprogress;
//	request.onabort = request.ontimeout = request.onerror;
	request.ontimeout = request.onerror;

	_.defer(_.bind(request.send, request));
	return deferred.promise();
};
