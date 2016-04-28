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
module.exports = function(url, image, context) {
	var timeoutId, cleanup, mixin;
	var deferred = new Deferred();

	context || (context = image);

	mixin = deferred;
	mixin.image = image;
	mixin.promise = _.wrap(mixin.promise, function(fn) {
		timeoutId = window.setTimeout(function() {
			timeoutId = null;
			image.src = url;
			deferred.notifyWith(context, ["loadstart"]);
		}, 1);
		return fn();
	});
	mixin.cancel = function() {
		timeoutId && window.clearTimeout(timeoutId);
		image.src = "";
		cleanup();
	};

	// resolved/success
	// - - - - - - - - - - - - - - - - - -
	image.onload = function(ev) {
		mixin.lastEvent = ev;
		deferred.resolveWith(context, [url]);
	};
	// reject/failure
	// - - - - - - - - - - - - - - - - - -
	image.onerror = function(ev) {
		var err = new Error("Error ocurred while loading image from " + url);
		mixin.lastEvent = err.event = ev;
		deferred.rejectWith(context, [err]);
	};
	image.onabort = function(ev) {
		var err = new Error("Aborted loading image from " + url);
		mixin.lastEvent = err.event = ev;
		deferred.rejectWith(context, [err]);
	};

	// finally
	// - - - - - - - - - - - - - - - - - -
	cleanup = function() {
		image.onload = image.onerror = image.onabort = void 0;
	};
	deferred.always(cleanup);

	return mixin;
};
