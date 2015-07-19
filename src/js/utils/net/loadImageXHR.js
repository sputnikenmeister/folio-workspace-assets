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
	var timeoutId, cleanup, mixin;
	var deferred = new Deferred();
	
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "blob";
	context = context || image || request;
	mixin = deferred;
	
	mixin.isXhr = true;
	mixin.image = image;
	mixin.source = request;
	mixin.promise = _.wrap(mixin.promise, function(fn) {
		timeoutId = window.setTimeout(function () {
			timeoutId = null;
			request.send.call(request);
		}, 1);
		return fn();
	});
	mixin.cancel = function () {
		timeoutId && window.clearTimeout(timeoutId);
		request.abort();
		cleanup();
	};
	
	// resolved/success
	// - - - - - - - - - - - - - - - - - -
	// request.onloadend
	request.onload = function (ev) {
		mixin.lastEvent = ev;
		// When the request loads, check whether it was successful
		if (request.status == 200) {
			// If successful, resolve the promise by passing back a reference url
			var objUrl = URL.createObjectURL(request.response);
			if (image) {
				// an image element was passed, defer resolution to allow the element to update itself
				image.src = objUrl;
				mixin.cancel = _.noop;
				_.defer(function() {
					deferred.resolveWith(context, [objUrl]);
				});
			} else {
				deferred.resolveWith(context, [objUrl]);
			}
		} else {
			// If it fails, reject the promise with a error message
			deferred.rejectWith(context, [Error("Image didn\'t load successfully; error code:" + request.statusText)]);
		}
	};
	
	// reject/failure
	// - - - - - - - - - - - - - - - - - -
	request.ontimeout = request.onerror = function (ev) {
		mixin.lastEvent = ev;
		// Also deal with the case when the entire request fails to begin with
		// This is probably a network error, so reject the promise with an appropriate message
		deferred.rejectWith(context, [Error("There was a network error.")]);
	};
	//request.onabort = request.onerror;
	request.onabort = function (ev) {
		mixin.lastEvent = ev;
		console.warn("XHR Abort: " + url);
		deferred.rejectWith(context, [Error("The request was aborted.")]);
	};
	
	// notify/progress
	// - - - - - - - - - - - - - - - - - -
	request.onloadstart = function (ev) {
		mixin.lastEvent = ev;
		deferred.notifyWith(context, ["loadstart"]);
	};
	request.onprogress = function (ev) {
		mixin.lastEvent = ev;
		deferred.notifyWith(context, [ev.loaded / ev.total]);
	};
	
	// finally
	// - - - - - - - - - - - - - - - - - -
	cleanup = function () {
		request.onabort = request.ontimeout = request.onerror = void 0;
		request.onloadstart = request.onloadend = request.onprogress = void 0;
	};
	deferred.always(cleanup);
	
	
	return mixin;
};
