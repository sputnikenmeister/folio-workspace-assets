/**
 * @module app/helper/DeferredView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/helper/View} */
var View = require("./View");

require("../../shims/requestAnimationFrame");

/**
 * @constructor
 * @type {module:app/helper/DeferredView}
 */
var DeferredView = View.extend({

	constructor: function(options) {
		_.bindAll(this, "applyRender");
		View.apply(this, arguments);
	},

	/**
	 * @param {String} [key]
	 * @param [value]
	 */
	requestRender: function (key, value) {
		if (_.isUndefined(this._renderRequestId)) {
			this._renderRequestId = window.requestAnimationFrame(this.applyRender, this.el);
			this._renderJobs = {};
		}
		if (key) {
			this._renderJobs[key] = value ? value : true;
		}
	},

	renderNow: function () {
		if (_.isNumber(this._renderRequestId)) {
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
		delete this._renderRequestId;
	},

	/** @abstract */
	renderLater: function () {},

});

module.exports = DeferredView;
