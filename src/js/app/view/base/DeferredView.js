/**
 * @module app/view/base/DeferredView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/view/base/View} */
var View = require("./View");

require("../../../shims/requestAnimationFrame");

var requestRenderImpl = window.requestAnimationFrame;
var cancelRenderImpl = window.cancelAnimationFrame;
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
		this._renderRequestId = 0;
		this._renderJobs = {};
		View.apply(this, arguments);
	},
	
	/** @override */
	remove: function () {
		this._cancelPendingRender();
		return View.prototype.remove.apply(this);
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
				console.log("DeferredView.requestRender", "'" + key + "' overwritten", this.cid);
			}
			this._renderJobs[key] = value ? value : true;
		}
		this._requestRender();
	},
	
	renderNow: function () {
		this._cancelPendingRender();
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
	
	_requestRender: function() {
		if (this._renderRequestId == 0) {
			this._renderRequestId = requestRenderImpl(this._applyRender);
		}
	},
	
	_cancelPendingRender: function() {
		if (this._renderRequestId != 0) {
			cancelRenderImpl(this._renderRequestId);
			this._renderRequestId = 0;
		}
	},

	/** @private */
	_applyRender: function () {
		this._renderRequestId = 0;
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
