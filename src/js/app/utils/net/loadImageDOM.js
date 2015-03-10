/** @type {module:underscore} */
var _ = require("underscore");
/** @type {jQuery.Deferred} */
var Deferred = require("jquery").Deferred;

/**
 * @param
 * @param
 * @param
 * @returns
 */
module.exports = function (url, image, context) {
	var timeoutId;
	var deferred = new Deferred();
	var clearCallbacks = function () {
		image.onload = image.onerror = image.onabort = void 0;
	};
	var mixin = {
		request: function () {
			timeoutId = window.setTimeout(function () {
				timeoutId = void 0;
				image.src = url;
				deferred.notifyWith(context, ["loadstart", image]);
			}, 1);
		},
		abort: function () {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
		},
		destroy: function () {
			clearCallbacks();
			this.abort();
		},
	};

	context || (context = image);
	image.onerror = function (ev) {
		deferred.rejectWith(context, [Error("Error ocurred while loading image from " + url), image, ev]);
	};
	image.onabort = function (ev) {
		deferred.rejectWith(context, ["Aborted loading image from " + url, image, ev]);
	};
	image.onload = function (ev) {
//		deferred.notifyWith(context, [1, image]);
		deferred.resolveWith(context, [url, image, ev]);
	};

	deferred.always(clearCallbacks);
	deferred.promise(mixin);

	return mixin;
};
