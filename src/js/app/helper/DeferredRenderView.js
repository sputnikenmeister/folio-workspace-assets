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

	/**
	 * @param {String} [key]
	 * @param [value]
	 */
	requestRender: function (key, value) {
		if (this._renderRequestId === undefined) {
//			this._renderRequestId = window.setTimeout(this.getRenderCallback(), 1);
//			this._renderRequestId = _.defer(this.getRenderCallback());
			this._renderRequestId = window.requestAnimationFrame(this.getRenderCallback());
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
	getRenderCallback: function () {
		return this._renderCallback || (this._renderCallback = _.bind(this.applyRender, this));
	},

	/** @private */
	applyRender: function () {
		this.renderLater();
		this._renderRequestId = undefined;
	},

	/** @abstract */
	renderLater: function () {},

});

module.exports = DeferredRenderView;
