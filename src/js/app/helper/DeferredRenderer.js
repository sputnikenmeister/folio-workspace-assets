/**
* @module app/app/helper/DeferredRenderer
* @requires module:backbone
*/

/** @type {module:underscore} */
// var _ = require( "underscore" );

/**
 * @constructor
 * @type {module:app/helper/DeferredRenderer}
 */
var DeferredRenderer = function(){
};

DeferredRenderer.prototype = {

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
			this.renderRequestId = window.requestAnimationFrame(this.getRenderCallback());
			this.renderJobs = {};
		}
		if (key) {
			this.renderJobs[key] = value? value: true;
		}
	},

	/** @private */
	_renderCallback: null,

	/** @private */
	getRenderCallback: function() {
		return this._renderCallback? this._renderCallback: this.validateRender.bind(this);
		// return this._renderCallback? this._renderCallback: _.bind(this.validateRender,this);
	},

	/** @private */
	validateRender: function(timestamp) {
		this.render(timestamp);
		this.renderJobs = null;
	},
};

module.exports = DeferredRenderer;
