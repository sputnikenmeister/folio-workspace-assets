/**
* @module app/app/helper/DeferredRenderView
* @requires module:backbone
*/

/** @type {module:underscore} */
// var _ = require( "underscore" );

/** @type {module:backbone} */
var Backbone = require( "backbone" );

/**
 * @constructor
 * @type {module:app/helper/DeferredRenderView}
 */
module.exports  = Backbone.View.extend({

	/** @type {Object.<String, {Function|true}}>} */
	renderJobs: null,

	/** @type {long} */
	renderRequestId: 0,

	/**
	* @param {String} [key]
	* @param [value]
	*/
	requestRender: function(key, value) {
		if (this.renderJobs == null) {
			this.renderRequestId = window.requestAnimationFrame(this.getAnimationFrameCallback());
			this.renderJobs = {};
		}
		if (key) {
			this.renderJobs[key] = value? value: true;
		}
	},

	/** @private */
	_animationFrameCallback: null,

	/** @private */
	getAnimationFrameCallback: function() {
		return this._animationFrameCallback?
				this._animationFrameCallback: this.validateRender.bind(this);
	},

	/** @private */
	validateRender: function(timestamp) {
		this.render(timestamp);
		this.renderJobs = null;
	},

});
