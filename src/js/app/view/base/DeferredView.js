/**
 * @module app/view/base/DeferredView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");

// var _queue = [];
// var _queueRafId = null;
// var _queuedViewsIndex = {};
// var _isExecuting = false;

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
		// this._renderRafId = -1;
		this._renderJobs = {};
		View.apply(this, arguments);
		// View.prototype.constructor.apply(this, arguments);
	},
	
	// /** @override */
	// remove: function () {
	// 	this._cancelRender();
	// 	this._renderJobs = null;
	// 	return View.prototype.remove.apply(this, arguments);
	// },
	
	/* -------------------------------
	/* public
	/* ------------------------------- */
	
	/** @override */
	requestRender: function(key, value) {
		if (key) {
			if (this._renderJobs.hasOwnProperty(key)) {
				console.log("%s::requestRender (raf:%i) '%s' overwritten", this.cid, this._renderRafId, key);
			}
			this._renderJobs[key] = value ? value : true;
		}
		this._requestRender();
	},

	// renderNow: function(force) {
	// 	if (this._isPendingRender()) {
	// 		this._cancelRender();
	// 		this._applyRender(Date.now());
	// 	} else if (force === true) {
	// 		this._applyRender(Date.now());
	// 	}
	// },
	
	// /** @abstract */
	// renderLater: function (tstamp) {
	// 	// subclasses should override this method
	// },
	
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
		// console.warn("%s::_applyRender (raf:%i)", this.cid, this._renderRafId);
		// this._renderRafId = -1;
		// this.renderLater(tstamp);
		View.prototype._applyRender.apply(this, arguments);
		
		for (var key in this._renderJobs) {
			if (this._renderJobs.hasOwnProperty(key)) {
				console.warn("%s::_applyRender (raf:%i) '%s' discarded w/o validation", this.cid, this._renderRafId, key);
				delete this._renderJobs[key];
			}
		}
	},
	
	// _cancelRender: function() {
	// 	// cancelQueuedAF(this);
	// 	if (this._isPendingRender()) {
	// 		this.cancelAnimationFrame(this._renderRafId);
	// 	}
	// },
	// _requestRender: function() {
	// 	// requestQueuedAF(this);
	// 	if (!this._isPendingRender()) {
	// 		this._renderRafId = this.requestAnimationFrame(this._applyRender);
	// 	}
	// },
	// _isPendingRender: function() {
	// 	// hasQueuedAF(this);
	// 	return this._renderRafId !== -1;
	// }

});

module.exports = DeferredView;
