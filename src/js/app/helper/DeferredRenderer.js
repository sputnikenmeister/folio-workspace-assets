/**
 * @module app/app/helper/DeferredRenderer
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require("underscore");

/**
 * @constructor
 * @type {module:app/helper/DeferredRenderer}
 */
var DeferredRenderer = function () {};

DeferredRenderer.prototype = {

	/** @type {Object} */
	// renderJobs: {},

	/**
	 * @param {String} [key]
	 * @param [value]
	 */
	requestRender: function (key, value) {
		if (this.renderRequestId === undefined) {
			this.renderRequestId = window.requestAnimationFrame(this.getRenderCallback());
			this.renderJobs = {};
			// this.renderRequestId = window.setTimeout(this.getRenderCallback(), 1);
			// this.renderRequestId = _.defer(this.getRenderCallback());
		}
		if (key) {
			this.renderJobs[key] = value ? value : true;
		}
	},

	/** @private */
	getRenderCallback: function () {
		return this.renderCallback || (this.renderCallback = _.bind(this.applyRender, this));
	},

	/** @private */
	applyRender: function () {
		this.deferredRender();
		this.renderRequestId = undefined;
	},

	renderNow: function () {
		if (this.renderRequestId) {
			window.cancelAnimationFrame(this.renderRequestId);
			// window.clearTimeout(this.renderRequestId)
		}
		this.applyRender();
	},

	/** @private */
	validateRender: function (key) {
		if (_.isFunction(this.renderJobs[key])) {
			this.renderJobs[key].call();
			this.renderJobs[key] = undefined;
		}
	},

	/** @abstract */
	deferredRender: function () {},
};

module.exports = DeferredRenderer;
