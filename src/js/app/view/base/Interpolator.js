/**
* @module app/view/base/Interpolator
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:utils/ease/linear} */
var linear = require("utils/ease/linear");

/**
* @constructor
* @type {module:app/view/base/Interpolator}
*/
function Interpolator(values, maxValues) {
	this._valueData = {};
	this._maxValues = {};
	this._renderableKeys = [];
	
	var key, val, maxVal;
	for (key in values) {
		val = values[key];
		maxVal = maxValues[key] || null;
		// create value object and store it
		this._valueData[key] = this._initValue(val, 0, maxVal);
		// add maxValue to store
		this._maxValues[key] = maxVal;
		// add to next render list
		this._renderableKeys.push(key);
	}
	this._valuesChanged = this._renderableKeys.length > 0;
}

Interpolator.prototype = Object.create({
	
	/* --------------------------- *
	/* public interface
	/* --------------------------- */
	
	getValue: function(key) {
		return this._valueData[key]._value;
	},
	
	getRenderedValue: function(key) {
		return this._valueData[key]._renderedValue;
	},
	
	valueTo: function (value, duration, key) {
		var changed, dataObj = this._valueData[key];
		// console.log("%s::valueTo [%s]", "[interpolator]", key, value);
		if (Array.isArray(dataObj)) {
			changed = value.reduce(function(prevChanged, itemValue, i) {
				if (dataObj[i]) {
					dataObj[i] = this._initNumber(itemValue, duration, this._maxValues[key]);
					return true;
				} else {
					return this._setValue(itemValue, duration, dataObj[i]) || prevChanged;
				}
			}.bind(this), changed);
		} else {
			changed = this._setValue(value, duration, dataObj);
		}
		if (changed) {
			this._renderableKeys.indexOf(key) !== -1 || this._renderableKeys.push(key);
			this._valuesChanged = true;
			// this.render();
			// this.requestRender();
		}
		return this;
	},
	
	updateValue: function(key) {
		// Call _interpolateValue only if needed. _interpolateValue() returns false once
		// interpolation is done, in which case remove key from _renderableKeys.
		var kIndex = this._renderableKeys.indexOf(key);
		if (kIndex !== -1 && !this._interpolateValue(key)) {
			this._renderableKeys.splice(kIndex, 1);
			this._valuesChanged = this._renderableKeys.length > 0;
		}
		return this;
	},
	
	/* --------------------------- *
	/* private: valueData
	/* --------------------------- */
	
	_initValue: function(value, duration, maxVal) {
		if (Array.isArray(value)) {
			return value.map(function(val) {
				return this._initNumber(val, 0, maxVal);
			}, this);
		} else {
			return this._initNumber(value, 0, maxVal);
		}
	},
	
	// _initArray: function(value, duration, maxVal) {
	// 	return val.map(function(val) {
	// 		return this._initNumber(val, 0, maxVal);
	// 	}, this);
	// },
	
	_initNumber: function(value, duration, maxVal) {
		var o = {};
		o._value = value;
		o._startValue = value;
		o._valueDelta = 0;
		
		o._duration = duration || 0;
		o._startTime = -1;
		o._elapsedTime = 0;
		
		o._lastRenderedValue = o._renderedValue = null;
		
		o._maxVal = maxVal;
		// if (maxVal !== void 0) o._maxVal = maxVal;
		// o._maxVal = this._maxValues[key];
		// o._maxVal = this._maxVal;// FIXME
		return o;
	},
	
	_setValue: function(value, duration, o) {
		if (o._value != value) {
			o._startValue = o._value;
			o._valueDelta = value - o._value;
			o._value = value;
			
			o._duration = duration || 0;
			o._startTime = -1;
			o._elapsedTime = 0;
			
			o._lastRenderedValue = o._renderedValue;
			
			return true;
		}
		return false;
	},
	
	/* --------------------------- *
	/* private: interpolate
	/* --------------------------- */
	
	/** @override */
	interpolate: function(tstamp) {
		if (this._valuesChanged) {
			this._valuesChanged = false;
		
			var changedKeys = this._renderableKeys;
			this._tstamp = tstamp;
			this._renderableKeys = changedKeys.filter(this._interpolateValue, this);
			this._renderedKeys = changedKeys;
			
			if (this._renderableKeys.length !== 0) {
				this._valuesChanged = true;
			// 	// this.requestRender();
			}
		}
		// console.log("%s::interpolate valuesChanged:%s tstamp:%f", "[interpolator]", this._valuesChanged, tstamp);
		// return this._valuesChanged;
		// return this.valuesChanged;
		
		return this;
	},
	
	_interpolateValue: function(key) {
		var dataObj = this._valueData[key];
		if (Array.isArray(dataObj)) {
			return dataObj.reduce(function(continueNext, o, index, arr) {
				return this._interpolateNumber(this._tstamp, o) || continueNext;
			}.bind(this), false);
		} else {
			return this._interpolateNumber(this._tstamp, dataObj);
		}
	},
	
	_interpolateNumber: function (tstamp, o) {
		if (o._startTime < 0) {
			o._startTime = tstamp;
		}
		var elapsed = tstamp - o._startTime;
		o._elapsedTime = elapsed;
		o._lastRenderedValue = o._renderedValue;
		if (elapsed < o._duration) {
			if (o._maxVal && o._valueDelta < 0) {
				// upper-bound values
				o._renderedValue = linear(elapsed, o._startValue,
						o._valueDelta + o._maxVal, o._duration) - o._maxVal;
			} else {
				// unbound values
				o._renderedValue = linear(elapsed, o._startValue,
						o._valueDelta, o._duration);
			}
			return true;
		} else {
			o._renderedValue = o._value;
			return false;
		}
	},
}, {
	valuesChanged: {
		get: function() {
			return this._valuesChanged;
			// return this._renderableKeys.length !== 0;
		}
	},
	renderableKeys: {
		get: function() {
			return this._renderableKeys;
		}
	},
	renderedKeys: {
		get: function() {
			return this._renderedKeys;
		}
	},
});

module.exports = Interpolator;
