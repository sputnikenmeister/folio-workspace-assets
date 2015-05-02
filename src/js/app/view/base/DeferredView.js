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

/**
 * @constructor
 * @type {module:app/view/base/DeferredView}
 */
var DeferredView = View.extend({

	constructor: function(options) {
		_.bindAll(this, "applyRender");
		this._renderRequestId = 0;
		View.apply(this, arguments);
	},

	/**
	 * @param {String} [key]
	 * @param [value]
	 */
	requestRender: function (key, value) {
		if (this._renderRequestId == 0) {
			this._renderRequestId = window.requestAnimationFrame(this.applyRender);
			this._renderJobs = {};
		}
		if (key) {
			this._renderJobs[key] = value ? value : true;
		}
	},

	renderNow: function () {
		if (this._renderRequestId != 0) {
			window.cancelAnimationFrame(this._renderRequestId);
		}
		this.applyRender();
	},

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

	/** @private */
	applyRender: function () {
		this.renderLater();
		this._renderRequestId = 0;
	},

	/** @abstract */
	renderLater: function () {},

	remove: function () {
		if (this._renderRequestId != 0) {
			window.cancelAnimationFrame(this._renderRequestId);
		}
		return View.prototype.remove.apply(this);
	},

});

module.exports = DeferredView;
