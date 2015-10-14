/* global Path2D */
/**
* @module app/view/component/progress/AbstractProgressMeter
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:utils/ease/linear} */
var linear = require("utils/ease/linear");

var AbstractProgressMeter = View.extend({
	
	/** @type {string} */
	cidPrefix: "progressMeter",
	/** @type {string} */
	className: "progress-meter",
	/** @type {Object} */
	defaults: {
		value: 0,
		total: 1,
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		// ProgressMeter.prototype.initialize.apply(this, arguments);
		
		// this.setOptions(_.defaults(options, this.defaults));
		options = _.defaults(options, this.defaults);
		
		// value total
		this._value = options.value;
		this._total = options.total;
		
		this._startValue = this._value;
		this._renderedValue = null;
		this._valueDelta = 0;
		
		// value change flag
		this._valueChanged = true;
		
		// private easing state
		this._duration = 0;
		this._startTime = -1;
		this._nextRafId = -1;
	},
	
	remove: function() {
		this._duration = 0;
		if (this._nextRafId !== -1) {
			this.cancelAnimationFrame(this._nextRafId);
		}
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* --------------------------- *
	/* public interface
	/* --------------------------- */
	
	valueTo: function (value, duration) {
		// console.log("%s::valueTo(%f, %i)", this.cid, value, duration);
		this._duration = duration || 0;
		this._setValue(value);
	},
	
	_setValue: function(value) {
		var oldValue = this._value;
		
		this._value = value;
		this._valueDelta = value - oldValue;
		this._startValue = oldValue;
		
		this._valueChanged = true;
		this.render();
	},
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	/** @override */
	render: function () {
		if (this._valueChanged) {
			this._valueChanged = false;
			this._startTime = -1;
			
			if (this._nextRafId === -1) {
				this._nextRafId = this.requestAnimationFrame(this.renderFrame);
			}
		}
		return this;
	},
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	renderFrame: function(tstamp) {
		if (this._startTime < 0) {
			this._startTime = tstamp;
		}
		// var currRafId = this._nextRafId;
		var currTime = tstamp - this._startTime;
		
		if (currTime < this._duration) {
			if (this._valueDelta < 0) {
				this._renderedValue = linear(currTime, this._startValue,
					this._valueDelta + this._total, this._duration) - this._total;
			} else {
				this._renderedValue = linear(currTime, this._startValue,
					this._valueDelta, this._duration);
			}
			this.redraw(this._renderedValue);
			this._nextRafId = this.requestAnimationFrame(this.renderFrame);
			// console.log("%s::update(%f) [RAF: %i] [NEXT: %i] from/to: %f/%f, curr: %f",
			// 	this.cid, tstamp, currRafId, this._nextRafId,
			// 	this._startValue, this._value, this._renderedValue);
		} else {
			this._renderedValue = this._value;
			this.redraw(this._renderedValue);
			this._nextRafId = -1;
			// console.log("%s::update(%f) [RAF: %i] [LAST] from/to: %f/%f",
			// 	this.cid, tstamp, currRafId,
			// 	this._startValue, this._value );
		}
	},
	
	redraw: function(value) {
	},
});

module.exports = AbstractProgressMeter;
