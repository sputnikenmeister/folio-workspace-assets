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

// var _callQueuedAF = function() {
// 	// console.log("DeferredView::callQueuedAF (%i): %s", _queue.length, Object.keys(_queuedViewsIndex).join(", "));
// 	var queue = _queue;
// 	_queue = [];
// 	_queueRafId = null;
// 	_queuedViewsIndex = {};
// 	_isExecuting = true;
// 	queue.forEach(function(fn) {
// 		fn && fn.call();
// 	});
// 	_isExecuting = false;
// };
// var requestQueuedAF = function(view) {
// 	_isExecuting && console.warn("DeferredView::requestQueuedAF", "nested request", view.cid);
// 	var viewIndex = _queuedViewsIndex[view.cid] || (_queuedViewsIndex[view.cid] = _queue.length);
// 	_queue[viewIndex] = view._applyRender;
// 	if (_queueRafId === null) {
// 		_queueRafId = window.requestAnimationFrame(_callQueuedAF);
// 	}
// };
// var cancelQueuedAF = function(view) {
// 	_isExecuting && console.warn("DeferredView::cancelQueuedAF", "nested request", view.cid);
// 	if (_queuedViewsIndex.hasOwnProperty(view.cid)) {
// 		_queue[_queuedViewsIndex[view.cid]] = null;
// 	}
// };
// var hasQueuedAF = function(view) {
// 	return _queuedViewsIndex.hasOwnProperty(view.cid);
// };

/**
 * @constructor
 * @type {module:app/view/base/DeferredView}
 */
var DeferredView = View.extend({

	/* -------------------------------
	/* Backbone.View
	/* ------------------------------- */
	
	constructor: function(options) {
		// _.bindAll(this, "_applyRender");
		this._renderRafId = -1;
		this._renderJobs = {};
		View.apply(this, arguments);
		// View.prototype.constructor.apply(this, arguments);
	},
	
	/** @override */
	remove: function () {
		this._cancelRender();
		
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* -------------------------------
	/* public
	/* ------------------------------- */
	
	/**
	/* @param {String} [key]
	/* @param [value]
	/*/
	requestRender: function(key, value) {
		if (key) {
			if (this._renderJobs.hasOwnProperty(key)) {
				console.log("%s::requestRender [%s] '%s'", this.cid, "job overwritten", key);
			}
			this._renderJobs[key] = value ? value : true;
		}
		this._requestRender();
	},

	renderNow: function(force) {
		if (this._isPendingRender()) {
			this._cancelRender();
			this._applyRender(Date.now());
		} else if (force === true) {
			this._applyRender(Date.now());
		}
	},
	
	/** @abstract */
	renderLater: function (tstamp) {
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
	/* private
	/* ------------------------------- */

	/** @private */
	_applyRender: function (tstamp) {
		this._renderRafId = -1;
		console.warn("%s::_applyRender()", this.cid);
		this.renderLater(tstamp);
		
		for (var key in this._renderJobs) {
			if (this._renderJobs.hasOwnProperty(key)) {
				console.warn("DeferredView._applyRender", "'" + key + "' discarded w/o validation", this.cid);
				delete this._renderJobs[key];
			}
		}
	},
	
	_cancelRender: function() {
		// cancelQueuedAF(this);
		if (this._isPendingRender()) {
			this.cancelAnimationFrame(this._renderRafId);
		}
	},
	_requestRender: function() {
		// requestQueuedAF(this);
		if (!this._isPendingRender()) {
			this._renderRafId = this.requestAnimationFrame(this._applyRender);
		}
	},
	_isPendingRender: function() {
		// hasQueuedAF(this);
		return this._renderRafId !== -1;
	}

});

module.exports = DeferredView;
