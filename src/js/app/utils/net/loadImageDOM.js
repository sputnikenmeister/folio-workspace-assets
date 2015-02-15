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
	var deferred = new Deferred();
	context || (context = image);
	deferred.always(function () {
		image.onload = image.onerror = image.onabort = void 0;
	});
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
	_.defer(function () {
		image.src = url;
		deferred.notifyWith(context, ["loadstart", image]);
//		deferred.notifyWith(context, [0, image]);
	});
	return deferred.promise();
};
