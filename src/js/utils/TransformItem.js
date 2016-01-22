/* -------------------------------
* Imports
* ------------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {String} */
var transitionEnd = require("./event/transitionEnd");
/** @type {module:utils/prefixedProperty} */
var prefixedProperty = require("./prefixedProperty");
/** @type {module:utils/prefixedStyleName} */
var prefixedStyleName = require("./prefixedStyleName");

var slice = Array.prototype.slice;
// /** @type {module:utils/debug/traceElement} */
// var traceElt = require("./debug/traceElement");
// var traceEltCache = {};
// var log = function() {
// 	var logFn = "log";
// 	var args = slice.apply(arguments);
// 	switch(args[0]) {
// 		case "error":
// 		case "warn":
// 		case "info":
// 			logFn = args.shift();
// 			break;
// 		default:
// 			// break;
// 			return;
// 	}
// 	var el, txId;
// 	if ((el = args[0]) && (txId = el._txId)) {
// 		args[0] = traceEltCache[txId] || (traceEltCache[txId] = el);
// 	}
// 	args[0] = "\t" + args[0];
// 	console[logFn].apply(console, args);
// };

/* jshint -W079 */
var console = (function(target) {
	return Object.getOwnPropertyNames(target).reduce(function(proxy, prop) {
		if ((typeof target[prop]) == "function") {
			switch (prop) {
				case "error":
				case "warn":
				case "info":
					proxy[prop] = function () {
						var args = slice.apply(arguments);
						if (typeof args[0] == "string") {
							args[0] = prop + "::" + args[0];
						}
						return target[prop].apply(target, args);
					};
					break;
				case "log":
					proxy[prop] = function() {};
					break;
				default:
					proxy[prop] = target[prop].bind(target);
					break;
			}
		} else {
			Object.defineProperty(proxy, prop, {
				get: function() { return target[prop]; },
				set: function(val) { target[prop] = val; }
			});
		}
		return proxy;
	}, {});
})(window.console);
/* jshint +W079 */

/* -------------------------------
/* Private static
/* ------------------------------- */

var translateTemplate = function(o) {
	// return "translate(" + o._renderedX + "px, " + o._renderedY + "px)";
	return "translate3d(" + o._renderedX + "px, " + o._renderedY + "px, 0px)";
};
var transitionTemplate = function(o) {
	return o.property + " " + o.duration/1000 + "s " + o.easing + " " + o.delay/1000 + "s";
};
var NO_TRANSITION = "none 0s step-start 0s";

// var transitionTemplate = _.template("<%= property %> <% duration/1000 %>s <%= easing %> <% delay/1000 %>s");
// var NO_TRANSITION = "all 0.001s step-start 0.001s";

var propDefaults = {
	"opacity": "1",
	"visibility": "visible",
	"transform": "matrix(1, 0, 0, 1, 0, 0)",
	// "transformStyle": "",
	"transition": "",
	// "transitionDuration": "0s",
	// "transitionDelay": "0s",
	// "transitionProperty": "none",
	// "transitionTimingFunction": "ease"
};
var propKeys = Object.keys(propDefaults);
var propNames = propKeys.reduce(function(obj, propName) {
	obj[propName] = prefixedProperty(propName);
	return obj;
}, {});

/** @type {module:utils/strings/camelToDashed} */
var camelToDashed = require("utils/strings/camelToDashed");
var styleNames = propKeys.map(camelToDashed).reduce(function(obj, propName) {
	obj[propName] = prefixedStyleName(propName);
	return obj;
}, {});

// var propNames = {}; 
// var styleNames = {};
// 
// (function() {
// 	var i, p, props, styleNames;
// 	
// 	var _visibilityProps = ["opacity", "visibility"];
// 	var _transformProps = ["transform", "transformStyle"];
// 	var _transitionProps = ["transition", "transitionDuration", "transitionDelay", "transitionProperty", "transitionTimingFunction"];
// 	var _transformStyleNames = ["transform", "transform-style"];
// 	var _transitionStyleNames = ["transition", "transition-duration", "transition-delay", "transition-property", "transition-timing-function"];
// 	styleNames = _transformStyleNames.concat(_transitionStyleNames).concat(_visibilityProps);
// 	props = _transformProps.concat(_transitionProps).concat(_visibilityProps);
// 	
// 	for (i = 0; i < props.length; ++i) {
// 		p = props[i];
// 		propNames[p] = prefixedProperty(p);
// 	}
// 	for (i = 0; i < styleNames.length; ++i) {
// 		p = styleNames[i];
// 		styleNames[p] = prefixedStyleName(p);
// 	}
// }());

var resolveAll = function(pp, result) {
	if (pp.length != 0) {
		pp.forEach(function(p, i, a) {
			p.resolve(result);
			a[i] = null;
		});
		pp.length = 0;
	}
	return pp;
};

var rejectAll = function(pp, reason) {
	if (pp.length != 0) {
		pp.forEach(function(p, i, a) {
			p.reject(reason);
			a[i] = null;
		});
		pp.length = 0;
	}
	return pp;
};

/* -------------------------------
 * TransformItem
 * ------------------------------- */

/**
 * @constructor
 */
function TransformItem(el) {
	_.bindAll(this, "_onTransitionEnd");
	
	this.el = el;
	this.id = el._txId;
	this.el.addEventListener(transitionEnd, this._onTransitionEnd, false);
	
	this._captureInvalid = false;
	this._capturedX = null;
	this._capturedY = null;
	this._currCapture = {};
	this._lastCapture = {};
	this._capturedChanged = false;
	
	this._hasOffset = false;
	this._offsetInvalid = false;
	this._offsetX = null;
	this._offsetY = null;
	
	this._hasTransition = false;
	this._transitionInvalid = false;
	this._transitionRunning = false;
	this._transition = {};
	
	this._promises = [];
	this._pendingPromises = [];
	
	this._renderedX = null;
	this._renderedY = null;
}

TransformItem.prototype = {
	
	/* -------------------------------
	/* Public
	/* ------------------------------- */
	
	/* destroy
	/* - - - - - - - - - - - - - - - - */
	destroy: function() {
		// NOTE: style property may have been modified; clearOffset(element) should
		// be called explicitly if clean up is required.
		this.el.removeEventListener(transitionEnd, this._onTransitionEnd, false);
		
		rejectAll(this._pendingPromises, this.id);
		rejectAll(this._promises, this.id);
	},

	/* capture
	/* - - - - - - - - - - - - - - - - */
	capture: function() {
		// console.log("tx[%s]::capture", this.id);
		this._validateCapture();
		return this;
	},
	
	clearCapture: function() {
		// console.log("tx[%s]::clearCapture", this.id);
		// this._hasOffset = false;
		this._captureInvalid = true;
		return this;
	},
	
	/* offset/clear
	/* - - - - - - - - - - - - - - - - */
	offset: function(x, y) {
		// console.log("tx[%s]::offset", this.id);
		
		this._hasOffset = true;
		this._offsetInvalid = true;
		this._offsetX = x || 0;
		this._offsetY = y || 0;
		// if (this.immediate) this._validateOffset();
		return this;
	},
	
	clearOffset: function() {
		if (this._hasOffset) {
			// console.log("tx[%s]::clearOffset", this.id);
			
			this._hasOffset = false;
			this._offsetInvalid = true;
			this._offsetX = null;
			this._offsetY = null;
			// if (this.immediate) this._validateOffset();
		} else {
			// console.log("tx[%s]::clearOffset no offset to clear", this.id);
		}
		return this;
	},
	
	/* transitions
	/* - - - - - - - - - - - - - - - - */
	runTransition: function(transition) {
		var lastValue = this._transitionValue;
		this._transition.property = styleNames["transform"];
		this._transition = _.extend(this._transition, transition);
		this._transitionValue = transitionTemplate(this._transition);
		
		if (this._transitionInvalid) {
			console.warn("tx[%s]::runTransition changed twice", this.id,
				lastValue, this._transitionValue);
		}
		
		this._hasTransition = true;
		this._transitionInvalid = true;
		// if (this.immediate) this._validateTransition();
		return this;
	},
	
	clearTransition: function() {
		this._transition.property = "none";
		this._transitionValue = NO_TRANSITION;
		
		this._hasTransition = false;
		this._transitionInvalid = true;
		// if (this.immediate) this._validateTransition();
		return this;
	},
	
	stopTransition: function() {
		this._transition.property = "none";
		this._transitionValue =  NO_TRANSITION;
		
		this._hasTransition = false;
		this._transitionInvalid = true;
		// if (this.immediate) this._validateTransition();
		return this;
	},
	
	whenTransitionEnds: function() {
		var p, d;
		if (this._transitionInvalid || this._transitionRunning) {
			d = {};
			p = new Promise(function(resolve, reject) {
				d.resolve = resolve;
				d.reject = reject;
			});
			(this._transitionInvalid? this._pendingPromises : this._promises).push(d);
		} else {
			p = Promise.resolve(this.el);
		}
		return p;
	},
	
	/* validation
	/* - - - - - - - - - - - - - - - - */
	validate: function() {
		// this.el.removeEventListener(transitionEnd, this._onTransitionEnd, false);
		this._ignoreEvent = true;
		
		this._validateCapture();
		this._validateTransition();
		this._validateOffset();
		
		// this.el.addEventListener(transitionEnd, this._onTransitionEnd, false);
		this._ignoreEvent = false;
		
		this._capturedChanged = false;
		return this;
	},
	
	/* -------------------------------
	/* Private
	/* ------------------------------- */
	
	_validateCapture: function() {
		if (!this._captureInvalid) {
			return;
		}
		var computed, capturedValues;
		var transformValue = null;
		
		if (this._hasOffset && !this._offsetInvalid) {
			// this is an explicit call to capture() instead of a subcall from _validateOffset()
			transformValue = this._getCSSProp("transform");
			if (transformValue === "") {
				console.error("tx[%s]::_capture valid offset (%i,$i) but transformValue=\"\"", this.id,  this._offsetX, this._offsetY);
			}
			this._removeCSSProp("transform");
		}

		// NOTE: reusing object, all props will be overwritten
		this._lastCapture = this._currCapture;
		this._currCapture = this._getComputedCSSProps();
		
		if (this._currCapture.transform !== this._lastCapture.transform) {
			var m, mm, ret = {};
			mm = this._currCapture.transform.match(/(matrix|matrix3d)\(([^\)]+)\)/);
			if (mm) {
				m = mm[2].split(",");
				if (mm[1] === "matrix") {
					this._capturedX = parseFloat(m[4]);
					this._capturedY = parseFloat(m[5]);
				} else {
					this._capturedX = parseFloat(m[12]);
					this._capturedY = parseFloat(m[13]);
				}
			} else {
				this._capturedX = 0;
				this._capturedY = 0;
			}
			this._capturedChanged = true;
		}
		if (transformValue !== null) {
			console.log("tx[%s]::_capture reapplying '%s'", this.id, transformValue);
			this._setCSSProp("transform", transformValue);
		}
		this._captureInvalid = false;
	},
	
	_validateOffset: function() {
		if (this._offsetInvalid) {
			// this._validateCapture();
			this._offsetInvalid = false;
			if (this._hasOffset) {
				var tx = this._offsetX + this._capturedX;
				var ty = this._offsetY + this._capturedY;
				if (tx !== this._renderedX || ty !== this._renderedY) {
					this._renderedX = tx;
					this._renderedY = ty;
					this._setCSSProp("transform", translateTemplate(this));
				}
			} else {
				this._renderedX = null;
				this._renderedY = null;
				this._removeCSSProp("transform");
			}
		}
	},
	
	_validateTransition: function() {
		if (this._transitionInvalid) {
			// this._validateCapture();
			this._transitionInvalid = false;
			
			// save promises made while invalid
			var reject = this._promises;
			// prepare _promises and push in new ones
			this._promises = this._pendingPromises;
			// whatever still here is to be rejected. reuse array
			this._pendingPromises = rejectAll(reject, this.id);
			
			this._transitionRunning = this._hasTransition;
			this._setCSSProp("transition", this._transitionValue);
			
			if (!this._hasTransition) {
				// no transition, resolve now
				resolveAll(this._promises, this.id);
			}
		}
	},

	_onTransitionEnd: function(ev) {
		if (this._ignoreEvent) {
			return;
		}
		if (this._transitionRunning && (this.el === ev.target) &&
				(this._transition.property == ev.propertyName)) {
			this._transitionRunning = false;
			// this._setCSSProp("transition", NO_TRANSITION);
			this._removeCSSProp("transition");
			resolveAll(this._promises, this.id);
		}
	},
	
	/* -------------------------------
	/* CSS
	/* ------------------------------- */
	
	_getCSSProp: function(prop) {
		return this.el.style[propNames[prop]];
		// return this.el.style[prefixedProperty(prop)];
		// return this.el.style.getPropertyValue(styleNames[prop]);
	},
	
	_setCSSProp: function(prop, value) {
		if (prop === "transition" && value === NO_TRANSITION) {
			this._removeCSSProp(prop);
		} else {
			this.el.style[propNames[prop]] = value;
			// this.el.style.setProperty(styleNames[prop], value);
		}
	},
	
	_removeCSSProp: function(prop) {
		this.el.style[propNames[prop]] = "";
		// this.el.style.removeProperty(styleNames[prop]);
	},
	
	_getComputedCSSProps: function() {
		var values = {};
		var computed = window.getComputedStyle(this.el);
		for (var p in propNames) {
			values[p] = computed[propNames[p]];
		}
		return values;
	},
};

module.exports = TransformItem;
