/* -------------------------------
* Imports
* ------------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {String} */
var transitionEnd = require("./event/transitionEnd");
/** @type {module:utils/css/prefixedProperty} */
var prefixedProperty = require("./css/prefixedProperty");
/** @type {module:utils/css/prefixedStyleName} */
var prefixedStyleName = require("./css/prefixedStyleName");

/** @type {module:utils/debug/traceElement} */
var traceElt = require("./debug/traceElement");

var log = function() {
	var logFn = "log";
	var args = Array.prototype.slice.apply(arguments);
	switch(args[0]) {
		case "error":
		case "warn":
		case "info":
			logFn = args.shift();
			break;
		default:
			// break;
			return;
	}
	args[0] = "\t" + args[0];
	console[logFn].apply(console, args);
};

/* -------------------------------
/* Private static
/* ------------------------------- */

var transitionTemplate = function(o) {
	return o.property + " " + o.duration/1000 + "s " + o.easing + " " + o.delay/1000 + "s";
};
// var transitionTemplate = _.template("<%= property %> <% duration/1000 %>s <%= easing %> <% delay/1000 %>s");

// var computedDefaults = {
// 	"transform": "matrix(1, 0, 0, 1, 0, 0)",
// 	"transformStyle": "",
// 	"transition": "",
// 	"transitionDuration": "0s",
// 	"transitionDelay": "0s",
// 	"transitionProperty": "none",
// 	"transitionTimingFunction": "ease"
// };

var NO_TRANSITION = "none 0s ease 0s";

var _styleProps = {}; 
var _styleNames = {};

(function() {
	var _transformProps = ["transform", "transformStyle"];
	var _transitionProps = ["transition", "transitionDuration", "transitionDelay", "transitionProperty", "transitionTimingFunction"];
	var _transformStyleNames = ["transform", "transform-style"];
	var _transitionStyleNames = ["transition", "transition-duration", "transition-delay", "transition-property", "transition-timing-function"];
	var i, p, props;
	
	props = _transformProps.concat(_transitionProps);
	for (i = 0; i < props.length; ++i) {
		p = props[i];
		_styleProps[p] = prefixedProperty(p);
	}
	props = _transformStyleNames.concat(_transitionStyleNames);
	for (i = 0; i < props.length; ++i) {
		p = props[i];
		_styleNames[p] = prefixedStyleName(p);
	}
}());

/* -------------------------------
 * TransformItem
 * ------------------------------- */

/**
 * @constructor
 */
function TransformItem(el, immediate) {
	_.bindAll(this, "_handleTransitionEnd");
	
	this.el = el;
	this.immediate = immediate;
	
	this.id = el.cid;
	this.el.addEventListener(transitionEnd, this._handleTransitionEnd, false);
	
	this._captureInvalid = false;
	this._capturedX = null;
	this._capturedY = null;
	this._currCapture = {};
	this._lastCapture = {};
	this._capturedValuesChanged = false;
	
	this._offsetInvalid = false;
	this._hasOffset = false;
	this._offsetX = null;
	this._offsetY = null;
	
	this._transitionInvalid = false;
	this._hasTransition = false;
	this._transitionRunning = false;
	this._transition = {};

	this._renderedX = null;
	this._renderedY = null;

	this.enableTransitions = this.clearTransitions;
	this.disableTransitions = this.stopTransitions;
	
	this._assertNoTransition = false;
}

TransformItem.prototype = {
	
	/* -------------------------------
	/*
	/* ------------------------------- */
	
	destroy: function() {
		// NOTE: In most cases, element is being removed from DOM when this is called, so if needed
		// clearOffset(element) should be called explicitly.
		this.el.removeEventListener(transitionEnd, this._handleTransitionEnd, false);
	},
	
	/* -------------------------------
	/*
	/* ------------------------------- */

	/* capture
	/* - - - - - - - - - - - - - - - - */

	capture: function() {
		log(traceElt(this.el), "TransformItem.capture");
		this._validateCapture();
		return this;
	},
	
	clearCapture: function() {
		log(traceElt(this.el), "TransformItem.clearCapture");
		
		// this._hasOffset = false;
		this._captureInvalid = true;
		return this;
	},
	
	/* offset/clear
	/* - - - - - - - - - - - - - - - - */
	
	offset: function(x, y, immediate) {
		log(traceElt(this.el), "TransformItem.offset");
		
		this._hasOffset = true;
		this._offsetInvalid = true;
		this._offsetX = x || 0;
		this._offsetY = y || 0;

		if (this.immediate && immediate !== false) {
			this._validateOffset();
		}
		return this;
	},

	clearOffset: function(immediate) {
		if (this._hasOffset) {
			log(traceElt(this.el), "TransformItem.clearOffset");
			
			this._hasOffset = false;
			this._offsetInvalid = true;
			this._offsetX = null;
			this._offsetY = null;
			
			if (this.immediate && immediate !== false) {
				this._validateOffset();
			}
		} else {
			log(traceElt(this.el), "TransformItem.clearOffset", "no offset to clear");
		}
		return this;
	},
	
	/* -------------------------------
	/* transitions
	/* ------------------------------- */
	
	runTransition: function(transition, immediate) {
		this._transition.property = _styleNames["transform"];
		for (var prop in transition) {
			this._transition[prop] = transition[prop];
		}
		if (this._transitionInvalid) {
			log("warn", traceElt(this.el), "TransformItem.runTransition changed twice",
				this._transitionValue, transitionTemplate(this._transition));
		}
		this._transitionValue = transitionTemplate(this._transition);
		
		this._hasTransition = true;
		this._transitionInvalid = true;
		if (this.immediate && immediate !== false) {
			this._validateTransition();
		}
		return this;
	},
	
	clearTransitions: function(immediate) {
		this._transition.property = "none";
		this._transitionValue = NO_TRANSITION;
		
		this._hasTransition = false;
		this._transitionInvalid = true;
		if (this.immediate && immediate !== false) {
			this._validateTransition();
		}
		return this;
	},
	
	stopTransitions: function(immediate) {
		this._transition.property = "none";
		this._transitionValue =  NO_TRANSITION;
		
		this._hasTransition = false;
		this._transitionInvalid = true;
		if (this.immediate && immediate !== false) {
			this._validateTransition();
		}
		return this;
	},
	
	/* -------------------------------
	/* validation
	/* ------------------------------- */

	validate: function() {
		this.el.removeEventListener(transitionEnd, this._handleTransitionEnd, false);
		this._validateTransition();
		this._validateOffset();
		this.el.addEventListener(transitionEnd, this._handleTransitionEnd, false);
		
		this._capturedValuesChanged = false;
		return this;
	},
	
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
				log("error", traceElt(this.el), "TransformItem._capture", "has valid offset but transformValue=\"\" ?", this._offsetX, this._offsetY);
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
			this._capturedValuesChanged = true;
		}
		if (transformValue !== null) {
			log(traceElt(this.el), "TransformItem._capture", "reapplying after capture", transformValue);
			this._setCSSProp("transform", transformValue);
		}
		this._captureInvalid = false;
	},

	_validateTransition: function() {
		if (this._transitionInvalid) {
			this._validateCapture();
			this._transitionRunning = this._hasTransition;
			this._setCSSProp("transition", this._transitionValue);
			this._transitionInvalid = false;
		}
	},

	_handleTransitionEnd: function(ev) {
		if (this._transitionRunning && (this.el === ev.target) &&
				(this._transition.property === ev.propertyName)) {
			this._transitionRunning = false;
			this._setCSSProp("transition", NO_TRANSITION);
		}
	},
	
	_validateOffset: function() {
		if (this._offsetInvalid) {
			this._validateCapture();
			if (this._hasOffset) {
				var tx = this._offsetX + this._capturedX;
				var ty = this._offsetY + this._capturedY;
				if (tx !== this._renderedX || ty !== this._renderedY) {
					this._renderedX = tx;
					this._renderedY = ty;
					this._setCSSProp("transform", "translate3d(" + this._renderedX + "px, " + this._renderedY + "px, 0px)");
				}
			} else {
				this._renderedX = null;
				this._renderedY = null;
				this._removeCSSProp("transform");
			}
			this._offsetInvalid = false;
		}
	},
	
	/* -------------------------------
	/* CSS
	/* ------------------------------- */
	
	_getCSSProp: function(prop) {
		return this.el.style[_styleProps[prop]];
		// return this.el.style.getPropertyValue(_styleNames[prop]);
	},
	
	_setCSSProp: function(prop, value) {
		if (prop === "transition" && value === NO_TRANSITION) {
			this._removeCSSProp(prop);
		} else {
			this.el.style[_styleProps[prop]] = value;
			// this.el.style.setProperty(_styleNames[prop], value);
		}
	},
	
	_removeCSSProp: function(prop) {
		this.el.style[_styleProps[prop]] = "";
		// this.el.style.removeProperty(_styleNames[prop]);
	},
	
	_getComputedCSSProps: function() {
		var values = {};
		var computed = window.getComputedStyle(this.el);
		for (var p in _styleProps) {
			values[p] = computed[_styleProps[p]];
		}
		return values;
	},
};

module.exports = TransformItem;
