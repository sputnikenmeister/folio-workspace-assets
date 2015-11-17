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

var AbstractProgressMeter = {
	// formatters: {
	// 	step: function(i, t, s) { 
	// 		return (((i/t)*s) | 0) + 1;
	// 	},
	// 	fraction: function(i, t, s) {
	// 		return ((((i/t)*s) | 0) + 1) +"/"+s;
	// 	},
	// }
};

var AbstractProgressMeterProto = {
	
	/** @type {string} */
	cidPrefix: "progressMeter",
	/** @type {string} */
	className: "progress-meter",
	
	/** @type {Object} */
	defaults: {
		value: 0,
		total: 1,
	},
	
	/** @type {Object} */
	properties: {
		value: {
			get: function() {
				return this._value;
			}
		},
		renderedValue: {
			get: function() {
				return this._renderedValue;
			}
		},
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		options = _.defaults(options, this.defaults);
		
		// value total
		this._value = options.value;
		this._maxVal = options.total;
		
		this._startValue = this._value;
		this._renderedValue = null;
		this._valueDelta = 0;
		
		// value change flag
		this._valuesChanged = true;
		
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
	
	valueTo: function (value, duration, key) {
		if (key === void 0) {
			// console.log("%s::valueTo(%f, %i)", this.cid, value, duration);
			this._duration = duration || 0;
			this._setValue(value);
		}
	},
	
	_setValue: function(value) {
		var oldValue = this._value;
		
		this._value = value;
		this._valueDelta = value - oldValue;
		this._startValue = oldValue;
		
		this._valuesChanged = true;
		this.render();
	},
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	/** @override */
	render: function () {
		if (this._valuesChanged) {
			this._valuesChanged = false;
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
					this._valueDelta + this._maxVal, this._duration) - this._maxVal;
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
};

module.exports = View.extend(AbstractProgressMeterProto, AbstractProgressMeter);

/*
var lpad = require("underscore.string/lpad");
var formatTimecode = function (value, total) {
	return new Date((isNaN(value)? 0 : value) * 1000).toISOString().substr(14, 5);
};
var formatTimecodeLeft = function (value, total) {
	return formatTimecode(Math.max(0, total - value));
};
var formatTimeShortUnit = function(value, total) {
	value = isNaN(value)? total : total - value;
	if (value > 3600)
		return ((value / 3600) | 0) + "h";
	if (value > 60)
		return ((value / 60) | 0) + "m";
	return (value | 0) + "s";
};
var formatTimeShortUnitless = function(value, total) {
	value = isNaN(value)? total : total - value;
	if (value > 3600)
		return ((value / 3600) | 0);
	if (value > 60)
		return ((value / 60) | 0);
	return (value | 0);
};
var formatTimeShortPadded = function(value,total) {
	value = isNaN(value)? total : total - value;
	if (value > 3600) value /= 3600;
	else if (value > 60) value /= 60;
	return lpad(value | 0, 2, "0");
};
var formatTimeShortUnitPadded = function(value,total) {
	var unit;
	value = isNaN(value)? total : total - value;
	if (value > 3600) {
		value /= 3600; unit = "h";
	} else if (value > 60) {
		value /= 60; unit = "m";
	} else {
		unit = "s";
	}
	return lpad(value | 0, 2, "0") + unit;
};
*/
