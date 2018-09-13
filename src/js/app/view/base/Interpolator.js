/**
 * @module app/view/base/Interpolator
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:utils/ease/fn/linear} */
var linear = require("utils/ease/fn/linear");

/**
 * @constructor
 * @type {module:app/view/base/Interpolator}
 */
var Interpolator = function(values, maxValues, easeValues) {
	this._tstamp = 0;

	// gets thrown away by first interpolate() but avoid null access errors
	this._renderableKeys = [];
	this._renderedKeys = [];

	this._paused = false;
	this._pausedChanging = false;
	//this._pausedKeys = [];

	this._maxValues = _.isObject(maxValues) ? _.extend({}, maxValues) : {};
	this._easeFn = _.isObject(easeValues) ? _.extend({}, easeValues) : {};
	this._valueData = {};

	// var key, val, maxVal, easeFn;
	for (var key in values) {
		_.isNumber(this._maxValues[key]) || (this._maxValues[key] = null);
		_.isFunction(this._easeFn[key]) || (this._easeFn[key] = linear);

		// create value object and store it
		this._valueData[key] = this._initValue(values[key], 0, this._maxValues[key]);

		// add to next render list
		this._renderableKeys.push(key);
	}
};

Interpolator.prototype = Object.create({

	/* --------------------------- *
	/* public interface
	/* --------------------------- */

	isAtTarget: function(key) {
		return this._renderableKeys.indexOf(key) === -1;
	},

	getCurrentValue: function(key) {
		return this._valueData[key]._renderedValue || this._valueData[key]._value;
	},

	getTargetValue: function(key) {
		return this._valueData[key]._value;
	},

	getStartValue: function(key) {
		return this._valueData[key]._startValue;
	},

	getRenderedValue: function(key) {
		return this._valueData[key]._renderedValue;
	},

	getOption: function(key, opt) {
		if (opt === "max") return this._maxValues[key];
		if (opt === "ease") return this._easeFn[key];
	},

	valueTo: function(key, value, duration, ease) {
		var changed, dataObj = this._valueData[key];
		if (_.isFunction(ease)) {
			this._easeFn[key] = ease;
		}
		// console.log("%s::valueTo [%s]", "[interpolator]", key, value);
		if (Array.isArray(dataObj)) {
			changed = value.reduce(function(prevChanged, itemValue, i) {
				if (dataObj[i]) {
					dataObj[i] = this._initNumber(itemValue, duration, this._maxValues[key]);
					return true;
				}
				return this._setValue(dataObj[i], itemValue, duration) || prevChanged;
			}.bind(this), changed);
		} else {
			changed = this._setValue(dataObj, value, duration);
		}
		if (changed) {
			this._renderableKeys.indexOf(key) !== -1 || this._renderableKeys.push(key);
		}
		return this;
	},

	updateValue: function(key) {
		// Call _interpolateKey only if needed. _interpolateKey() returns false
		// once interpolation is done, in which case remove key from _renderableKeys.
		var kIndex = this._renderableKeys.indexOf(key);
		if (kIndex !== -1 && !this._interpolateKey(key)) {
			this._renderableKeys.splice(kIndex, 1);
		}
		return this;
	},

	/* --------------------------- *
	/* private: valueData
	/* --------------------------- */

	_initValue: function(value, duration, maxVal) {
		if (Array.isArray(value)) {
			return value.map(function(val) {
				return this._initNumber(val, duration, maxVal);
			}, this);
		}
		return this._initNumber(value, duration, maxVal);
	},

	_initNumber: function(value, duration, maxVal) {
		var o = {};
		o._value = value;
		o._startValue = value;
		o._valueDelta = 0;

		o._duration = duration || 0;
		o._startTime = NaN;
		o._elapsedTime = NaN;

		o._lastRenderedValue = null;
		o._renderedValue = o._startValue;

		o._maxVal = maxVal;
		// if (maxVal !== void 0) o._maxVal = maxVal;
		// o._maxVal = this._maxValues[key];
		// o._maxVal = this._maxVal;// FIXME
		return o;
	},

	_setValue: function(o, value, duration) {
		if (o._value !== value) {
			o._startValue = o._value;
			o._valueDelta = value - o._value;
			o._value = value;

			o._duration = duration || 0;
			o._startTime = NaN;
			o._elapsedTime = NaN;

			// o._lastRenderedValue = o._renderedValue;
			// o._renderedValue = o._startValue;

			return true;
		}
		return false;
	},

	/* --------------------------- *
	/* private: interpolate
	/* --------------------------- */

	_tstamp: 0,

	/** @override */
	interpolate: function(tstamp) {
		this._tstamp = tstamp;

		if (this.valuesChanged) {
			if (this._pausedChanging) {
				this._renderableKeys.forEach(function(key) {
					var o = this._valueData[key];
					if (!isNaN(o._elapsedTime)) {
						o._startTime = tstamp - o._elapsedTime;
					}
				}, this);
				this._pausedChanging = false;
			}
			var changedKeys = this._renderableKeys;
			this._renderableKeys = changedKeys.filter(function(key) {
				return this._interpolateValue(tstamp, this._valueData[key], this._easeFn[key]);
			}, this);
			this._renderedKeys = changedKeys;
		}
		return this;
	},

	_interpolateKey: function(key) {
		return this._interpolateValue(this._tstamp, this._valueData[key], this._easeFn[key]);
	},

	_interpolateValue: function(tstamp, o, fn) {
		if (Array.isArray(o)) {
			return o.reduce(function(changed, item, index, arr) {
				return this._interpolateNumber(tstamp, item, fn) || changed;
			}.bind(this), false);
		}
		return this._interpolateNumber(tstamp, o, fn);
	},

	_interpolateNumber: function(tstamp, o, fn) {
		if (isNaN(o._startTime)) {
			o._startTime = tstamp;
		}
		o._lastRenderedValue = o._renderedValue;

		var elapsed = Math.max(0, tstamp - o._startTime);
		if (elapsed < o._duration) {
			if (o._maxVal && o._valueDelta < 0) {
				// upper-bound values
				o._renderedValue = fn(elapsed, o._startValue,
					o._valueDelta + o._maxVal, o._duration) - o._maxVal;
			} else {
				// unbound values
				o._renderedValue = fn(elapsed, o._startValue,
					o._valueDelta, o._duration);
			}
			o._elapsedTime = elapsed;
			return true;
		}
		o._renderedValue = o._value;
		o._elapsedTime = NaN;
		o._startTime = NaN;
		return false;
	},
}, {
	/**
	 * @type {boolean}
	 */
	paused: {
		get: function() {
			return this._paused;
		},
		set: function(value) {
			value = !!(value); // Convert to boolean
			if (this._paused !== value) {
				this._paused = value;
				this._pausedChanging = true;
			}
		}
	},
	/**
	 * @type {boolean} Has any value been changed by valueTo() since last interpolate()
	 */
	valuesChanged: {
		get: function() {
			return !this._paused && this._renderableKeys.length > 0;
		}
	},
	/**
	 * @type {array} Keys that are not yet at target value
	 */
	renderableKeys: {
		get: function() {
			return this._renderableKeys;
		}
	},
	/**
	 * @type {array} Keys that have been rendered in the last interpolate()
	 */
	renderedKeys: {
		get: function() {
			return this._renderedKeys;
		}
	},
	/**
	 * @type {array} All keys
	 */
	keys: {
		get: function() {
			return Object.keys(this._valueData);
		}
	},
});

module.exports = Interpolator;
