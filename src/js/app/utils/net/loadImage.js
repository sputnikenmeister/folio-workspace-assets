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
module.exports = function (image, url, context) {
	var deferred = new Deferred();
	context || (context = image);
	image.onload = function (ev) {
		deferred.notifyWith(context, [1, image]);
		deferred.resolveWith(context, [url, image, ev]);
	};
	image.onerror = function (ev) {
		deferred.rejectWith(context, [Error("Error ocurred while loading image from " + url), image, ev]);
	};
	image.onabort = function (ev) {
		deferred.rejectWith(context, ["Aborted loading image from " + url, image, ev]);
	};
	deferred.always(function () {
		image.onload = image.onerror = image.onabort = void 0;
	});
	_.defer(function () {
		image.src = url;
		deferred.notifyWith(context, ["start", image]);
		deferred.notifyWith(context, [0, image]);
	});
	return deferred.promise();
};
