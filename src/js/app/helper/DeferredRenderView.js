/**
 * @module app/helper/DeferredRenderView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {module:app/helper/View} */
var View = require("./View");

/**
 * @constructor
 * @type {module:app/helper/DeferredRenderView}
 */
var DeferredRenderView = View.extend({

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
//			this._renderRequestId = window.setTimeout(this.getRenderCallback(), 1);
			this._renderRequestId = window.requestAnimationFrame(this.applyRender);
			this._renderJobs = {};
		}
		if (key) {
			this._renderJobs[key] = value ? value : true;
		}
	},

	renderNow: function () {
		if (_.isNumber(this._renderRequestId)) {
			window.cancelAnimationFrame(this._renderRequestId);
//			window.clearTimeout(this._renderRequestId);
		}
		this.applyRender();
	},

	/** @private */
	validateRender: function (key) {
		if (_.isFunction(this._renderJobs[key])) {
			this._renderJobs[key].call();
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

module.exports = DeferredRenderView;
