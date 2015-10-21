/**
 * @module app/view/base/DeferredView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

var _queue = [];
var _queueRafId = null;
var _queuedViewsIndex = {};
var _isExecuting = false;

var _callQueuedAF = function() {
	console.log("DeferredView::callQueuedAF (%i): %s", _queue.length,
		Object.keys(_queuedViewsIndex).join(", "));
	var queue = _queue;
	_queue = [];
	_queueRafId = null;
	_queuedViewsIndex = {};
	_isExecuting = true;
	queue.forEach(function(fn) {
		fn && fn.call();
	});
	_isExecuting = false;
};
var requestQueuedAF = function(view) {
	_isExecuting && console.warn("DeferredView::requestQueuedAF", "queue running", view.cid);
	var viewIndex = _queuedViewsIndex[view.cid] || (_queuedViewsIndex[view.cid] = _queue.length);
	_queue[viewIndex] = view._applyRender;
	if (_queueRafId === null) {
		_queueRafId = window.requestAnimationFrame(_callQueuedAF);
	}
};
var cancelQueuedAF = function(view) {
	_isExecuting && console.warn("DeferredView::cancelQueuedAF", "queue running", view.cid);
	if (_queuedViewsIndex.hasOwnProperty(view.cid)) {
		_queue[_queuedViewsIndex[view.cid]] = null;
	}
};

var requestRenderImpl = requestQueuedAF;
var cancelRenderImpl = cancelQueuedAF;

// var _pendingRafIds = {};
// var requestAF = function(view) {
// 	if (!_pendingRafIds.hasOwnProperty(view.cid)) {
// 		_pendingRafIds[view.cid] = window.requestAnimationFrame(view._applyRender);
// 	}
// };
// var cancelAF = function(view) {
// 	if (_pendingRafIds.hasOwnProperty(view.cid)) {
// 		window.cancelAnimationFrame(_pendingRafIds[view.cid]);
// 		delete _pendingRafIds[view.cid];
// 	}
// };
// var requestRenderImpl = requestAF;
// var cancelRenderImpl = cancelAF;

// var requestRenderImpl = window.setTimeout;
// var cancelRenderImpl = window.clearTimeout;

/**
 * @constructor
 * @type {module:app/view/base/DeferredView}
 */
var DeferredView = View.extend({

	/* -------------------------------
	 * Backbone.View
	 * ------------------------------- */
	
	constructor: function(options) {
		_.bindAll(this, "_applyRender");
		this._renderJobs = {};
		View.apply(this, arguments);
		// View.prototype.constructor.apply(this, arguments);
	},
	
	/** @override */
	remove: function () {
		cancelRenderImpl(this);
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* -------------------------------
	 * public
	 * ------------------------------- */
	
	/**
	 * @param {String} [key]
	 * @param [value]
	 */
	requestRender: function (key, value) {
		if (key) {
			if (this._renderJobs.hasOwnProperty(key)) {
				console.log("%s::requestRender [%s] '%s'", this.cid, "job overwritten", key);
			}
			this._renderJobs[key] = value ? value : true;
		}
		requestRenderImpl(this);
	},
	
	renderNow: function () {
		cancelRenderImpl(this);
		this._applyRender();
	},

	/* -------------------------------
	 * subclasses should use these
	 * ------------------------------- */
	
	/** @abstract */
	renderLater: function () {
		// subclasses should override this method
	},
	
	/** @private */
	needsRender: function(key) {
		return this._renderJobs.hasOwnProperty(key);
	},

	/** @private */
	validateRender: function (key) {
		if (this.needsRender(key)) {
			if (_.isFunction(this._renderJobs[key])) {
				this._renderJobs[key].call();
			}
			delete this._renderJobs[key];
		}
	},
	
	/* -------------------------------
	 * private
	 * ------------------------------- */

	/** @private */
	_applyRender: function () {
		this.renderLater();
		for (var key in this._renderJobs) {
			if (this._renderJobs.hasOwnProperty(key)) {
				console.warn("DeferredView._applyRender", "'" + key + "' discarded w/o validation", this.cid);
				delete this._renderJobs[key];
			}
		}
	},

});

module.exports = DeferredView;
