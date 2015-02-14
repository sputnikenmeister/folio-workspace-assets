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
		deferred.notifyWith(context, [image, 1]);
		deferred.resolveWith(context, [image, url, ev]);
	};
	image.onerror = function (ev) {
		deferred.rejectWith(context, [image, Error("Error ocurred while loading image from " + url), ev]);
	};
	image.onabort = function (ev) {
		deferred.rejectWith(context, [image, "Aborted loading image from " + url, ev]);
	};
	deferred.always(function () {
		image.onload = image.onerror = image.onabort = void 0;
	});
	_.defer(function () {
		image.src = url;
		deferred.notifyWith(context, [image, "start"]);
		deferred.notifyWith(context, [image, 0]);
	});
	return deferred.promise();
};
