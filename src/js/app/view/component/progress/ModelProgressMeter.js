/**
* @module app/view/component/progress/ModelProgressMeter
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:utils/ease/linear} */
var linear = require("utils/ease/linear");

var ModelProgressMeter = {
	// formatters: {
	// 	step: function(i, t, s) { 
	// 		return (((i/t)*s) | 0) + 1;
	// 	},
	// 	fraction: function(i, t, s) {
	// 		return ((((i/t)*s) | 0) + 1) +"/"+s;
	// 	},
	// }
};

var ModelProgressMeterProto = {
	
	/** @type {string} */
	cidPrefix: "progressMeter",
	/** @type {string} */
	className: "progress-meter",
	
	/** @type {Object} */
	defaults: {
		value: 0,
		total: 1,
	},
	
	properties: {
		value: {
			get: function() {
				return this._valueData[this.defaultKey]._value;
			}
		},
		renderedValue: {
			get: function() {
				return this._valueData[this.defaultKey]._renderedValue;
			}
		},
	},
	
	defaultKey: "value",
	
	interpolated: ["value"],
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		this._valueData = {};
		this._renderKeys = [];
		
		options = _.defaults(options, this.defaults);
		this._total = options.total;
		
		var key, value, dataObj;
		var initValue = function(o, i, a) {
			return this._initValue(o);
		};
		for (var i = 0; i < this.interpolated.length; i++) {
			key = this.interpolated[i];
			value = options[key];
			if (value !== void 0) {
				this._valueData[key] = Array.isArray(value)? 
					value.map(initValue, this):
					this._initValue(value);
			}
		}
		this._renderKeys = this.interpolated.concat(); // render all keys
		this._valuesChanged = true;
		this._nextRafId = -1;
	},
	
	remove: function() {
		this._renderKeys.length = 0;
		// this._valueData = null;
		// this._duration = 0;
		if (this._nextRafId !== -1) {
			this.cancelAnimationFrame(this._nextRafId);
		}
		return View.prototype.remove.apply(this, arguments);
	},
	
	/* --------------------------- *
	/* public interface
	/* --------------------------- */
	
	valueTo: function (value, duration, key) {
		key || (key = this.defaultKey);
		var changed, dataObj = this._valueData[key];
		
		if (Array.isArray(dataObj)) {
			changed = value.reduce(function(prevChanged, itemValue, i) {
				if (dataObj[i]) {
					dataObj[i] = this._initValue(itemValue, duration);
					return true;
				} else {
					return this._setValue(itemValue, duration, dataObj[i]) || prevChanged;
				}
			}.bind(this), changed);
		} else {
			changed = this._setValue(value, duration, dataObj);
		}
		if (changed) {
			this._valuesChanged = true;
			this._renderKeys.indexOf(key) !== -1 || this._renderKeys.push(key);
			this.render();
		}
	},
	
	_initValue: function(value, duration) {
		var o = {};
		o._value = value;
		o._startValue = value;
		o._valueDelta = 0;
		o._renderedValue = null;
		
		o._duration = duration || 0;
		o._startTime = -1;
		o._total = this._total;// FIXME
		return o;
	},
	
	_setValue: function(value, duration, o) {
		if (o._value != value) {
			o._duration = duration || 0;
			o._startTime = -1;
			o._startValue = o._value;
			o._valueDelta = value - o._value;
			o._value = value;
			return true;
		}
		return false;
	},
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	/** @override */
	render: function () {
		// if (!this._rendering && this._valuesChanged) {
		if (this._valuesChanged) {
			this._valuesChanged = false;
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
		if (this._rendering) throw new Error("recursive call to renderFrame");
		this._rendering = true;
		
		var changedKeys = this._renderKeys;
		this._renderKeys = changedKeys.filter(function(key) {
			var dataObj = this._valueData[key];
			if (Array.isArray(dataObj)) {
				return dataObj.reduce(function(continueNext, o) {
					return this.interpolateNumber(tstamp, o) || continueNext;
				}.bind(this), false);
			} else {
				return this.interpolateNumber(tstamp, dataObj);
			}
		}, this);
		this.redraw(changedKeys);
		this._nextRafId = this._renderKeys.length?
			this.requestAnimationFrame(this.renderFrame) : -1;
		
		this._rendering = false;
	},
	
	interpolateNumber: function (tstamp, o) {
		if (o._startTime < 0) {
			o._startTime = tstamp;
		}
		var elapsed = tstamp - o._startTime;
		o._lastRenderedValue = o._renderedValue;
		if (elapsed < o._duration) {
			if (o._total !== void 0 && o._valueDelta < 0) {
				o._renderedValue = linear(elapsed, o._startValue,
					o._valueDelta + o._total, o._duration) - o._total;
			} else {
				o._renderedValue = linear(elapsed, o._startValue,
					o._valueDelta, o._duration);
			}
			return true;
		} else {
			o._renderedValue = o._value;
			return false;
		}
	},
	
	redraw: function() {
	},
};

module.exports = View.extend(ModelProgressMeterProto, ModelProgressMeter);
