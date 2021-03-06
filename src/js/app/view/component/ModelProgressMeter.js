/**
 * @module app/view/component/progress/ModelProgressMeter
 */

/** @type {module:app/view/base/View} */
const View = require("app/view/base/View");
/** @type {module:utils/ease/fn/linear} */
const linear = require("utils/ease/fn/linear");

module.exports = View.extend({

	/** @type {string} */
	cidPrefix: "progressMeter",
	/** @type {string} */
	className: "progress-meter",

	/** @type {Object} */
	defaults: {
		values: {
			value: 0
		},
		maxValues: {
			value: 1
		},
	},
	defaultKey: "value",

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	/** @override */
	initialize: function(options) {
		options = _.defaults(options, this.defaults);

		this._maxValues = _.defaults(options.maxValues, this.defaults.maxValues);
		this._valueData = {};
		this._renderKeys = [];

		var maxVal; // closure scoped var
		var initArrValue = function(val) {
			return this._initValue(val, 0, maxVal);
		};

		var key, val, values = _.defaults(options.values, this.defaults.values);
		for (key in values) {
			val = values[key];
			// default values should prevent void values
			// if (value === void 0) continue;
			// create value object
			maxVal = this._maxValues[key];
			// add to store
			this._valueData[key] = Array.isArray(val) ?
				val.map(initArrValue, this) : this._initValue(val, 0, maxVal);
			// add to next render list
			this._renderKeys.push(key);
		}
		this._valuesChanged = true;
		// this._nextRafId = -1;
	},

	remove: function() {
		// this._valuesChanged = false;
		this._renderKeys.length = 0;
		// if (this._nextRafId !== -1) {
		// 	this.cancelAnimationFrame(this._nextRafId);
		// }
		return View.prototype.remove.apply(this, arguments);
	},

	/* --------------------------- *
	/* public interface
	/* --------------------------- */

	getTargetValue: function(key) {
		return this._valueData[(key ? key : this.defaultKey)]._value;
	},

	getRenderedValue: function(key) {
		return this._valueData[(key ? key : this.defaultKey)]._renderedValue;
	},

	valueTo: function(value, duration, key) {
		key || (key = this.defaultKey);
		var changed, dataObj = this._valueData[key];

		if (Array.isArray(dataObj)) {
			changed = value.reduce(function(prevChanged, itemValue, i) {
				if (dataObj[i]) {
					dataObj[i] = this._initValue(itemValue, duration, this._maxValues[key]);
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
			// this.render();
			this.requestRender();
		}
	},

	updateValue: function(key) {
		// Call _renderValue only if needed. _renderValue() returns false once
		// interpolation is done, in which case remove key from _renderKeys.
		var kIndex = this._renderKeys.indexOf(key);
		if (kIndex !== -1 && !this._renderValue(key)) {
			this._renderKeys.splice(kIndex, 1);
		}
	},

	_initValue: function(value, duration, maxVal) {
		var o = {};
		o._value = value;
		o._startValue = value;
		o._valueDelta = 0;
		o._renderedValue = null;

		o._duration = duration || 0;
		o._startTime = -1;
		o._elapsedTime = 0;

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
			return true;
		}
		return false;
	},

	/* --------------------------- *
	/* render
	/* --------------------------- */

	/** @override */
	renderFrame: function(tstamp, flags) {
		if (this._valuesChanged) {
			this._valuesChanged = false;

			var changedKeys = this._renderKeys;
			this._tstamp = tstamp;
			this._renderKeys = changedKeys.filter(this._renderValue, this);
			this.redraw(changedKeys);

			if (this._renderKeys.length != 0) {
				this._valuesChanged = true;
				this.requestRender();
			}
		}
	},

	/* --------------------------- *
	/* private
	/* --------------------------- */

	_renderValue: function(key) {
		var dataObj = this._valueData[key];
		if (Array.isArray(dataObj)) {
			return dataObj.reduce(function(continueNext, o, index, arr) {
				return this.interpolateNumber(this._tstamp, o) || continueNext;
			}.bind(this), false);
		} else {
			return this.interpolateNumber(this._tstamp, dataObj);
		}
	},

	interpolateNumber: function(tstamp, o) {
		if (o._startTime < 0) {
			o._startTime = tstamp;
		}
		var elapsed = tstamp - o._startTime;
		o._elapsedTime = elapsed;
		o._lastRenderedValue = o._renderedValue;
		if (elapsed < o._duration) {
			if (o._maxVal && o._valueDelta < 0) {
				o._renderedValue = linear(elapsed, o._startValue,
					o._valueDelta + o._maxVal, o._duration) - o._maxVal;
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

	redraw: function() { /* abstract */ },
}, {
	// formatters: {
	// 	step: function(i, t, s) {
	// 		return (((i/t)*s) | 0) + 1;
	// 	},
	// 	fraction: function(i, t, s) {
	// 		return ((((i/t)*s) | 0) + 1) +"/"+s;
	// 	},
	// }
});

if (DEBUG) {
	module.exports.prototype._logFlags = "";
}
