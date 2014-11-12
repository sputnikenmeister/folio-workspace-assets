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

	/** @type {Object.<String, {Function|true}}>} */
	//	renderJobs: null,

	/** @type {long} */
	renderRequestId: 0,

	/**
	 * @param {String} [key]
	 * @param [value]
	 */
	requestRender: function (key, value) {
		if (undefined === this.renderJobs) {
			this.renderJobs = {};
			this.renderRequestId = window.requestAnimationFrame(this.getRenderCallback());
		}
		if (key) {
			this.renderJobs[key] = value ? value : true;
		}
	},

	/** @private */
	_renderCallback: null,

	/** @private */
	getRenderCallback: function () {
		return this._renderCallback ? this._renderCallback : _.bind(this.validateRender, this);
	},

	/** @private */
	validateRender: function (timestamp) {
		this.render(timestamp);
		delete this.renderJobs;
	},
};

module.exports = DeferredRenderer;