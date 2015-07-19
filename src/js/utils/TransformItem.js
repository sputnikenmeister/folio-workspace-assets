/* -------------------------------
* Imports
* ------------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {String} */
var transitionEnd = require("./event/transitionEnd");
/** @type {module:utils/strings/camelToDashed} */
var camelToDashed = require("./strings/camelToDashed");
/** @type {module:utils/css/prefixedProperty} */
var prefixedProperty = require("./css/prefixedProperty");
/** @type {module:utils/css/prefixedStyleName} */
// var prefixedStyleName = require("./css/prefixedStyleName");
/** @type {module:utils/css/prefixedProperty} */
// var parseTransformMatrix = require("../css/parseTransformMatrix");

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
 * Private static
 * ------------------------------- */

var computedDefaults = {
	"transform": "matrix(1, 0, 0, 1, 0, 0)",
	"transformStyle": "",
	"transition": "",
	"transitionDuration": "0s",
	"transitionDelay": "0s",
	"transitionProperty": "none",
	"transitionTimingFunction": "ease"
};
var transformProps = ["transform", "transformStyle"];
var transitionProps = ["transition", "transitionDuration", "transitionDelay",
	"transitionProperty", "transitionTimingFunction"];
	
var _styleProps = {}, _styleNames = {};
(function() {
	var p, pp, ps;
	var props = transformProps.concat(transitionProps);
	for (var i = 0; i < props.length; ++i) {
		p = props[i];
		pp = prefixedProperty(window.getComputedStyle(document.body), p);
		if (pp) {
			_styleProps[p] = pp;
			_styleNames[p] = p != pp? "-" + camelToDashed(pp): camelToDashed(p);
		} else {
			// console.warn("Property '" + p + "' is not available");
			_styleProps[p] = p;
			_styleNames[p] = camelToDashed(p);
		}
	}
}());

var transitionTemplate = function(o) {
	return o.property + " " + o.duration/1000 + "s " + o.easing + " " + o.delay/1000 + "s";
};
// var transitionTemplate = _.template("<%= property %> <% duration/1000 %>s <%= easing %> <% delay/1000 %>s");

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
	this._currCapturedValues = {};
	this._lastCapturedValues = {};
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
	// this._renderedChanged = false;

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

		// this._captureInvalid = true;
		this._validateCapture();
		// log(traceElt(this.el), this._capturedX, this._capturedY);
		// log(traceElt(this.el), this._capturedValuesChanged, this._lastCapturedValues.transform, this._currCapturedValues.transform);
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
		// log(traceElt(this.el), "TransformItem.runTransition");
		
		this._transition.property = _styleNames["transform"];
		for (var prop in transition) {
			this._transition[prop] = transition[prop];
		}
		if (this._transitionInvalid) {
			log("error", traceElt(this.el), "TransformItem.runTransition changed twice",
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
		// log(traceElt(this.el), "TransformItem.clearTransitions");
		
		this._transition.property = "none";
		this._transitionValue =  "none 0s 0s";
		
		this._hasTransition = false;
		this._transitionInvalid = true;
		if (this.immediate && immediate !== false) {
			this._validateTransition();
		}
		return this;
	},
	
	stopTransitions: function(immediate) {
		// log(traceElt(this.el), "TransformItem.stopTransitions");
		
		this._transition.property = "none";
		this._transitionValue =  "none 0s 0s";

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
		// this._captureInvalid = true;
		return this;
	},

	_validateCapture: function() {
		if (!this._captureInvalid) {
			return;
		}
		var computed, capturedValues;
		var eltTransformValue = null;
		
		// log("info", traceElt(this.el), "TransformItem._validateCapture", {
		// 	"transition invalid": this._transitionInvalid,
		// 	"offset invalid": this._offsetInvalid,
		// });

		// this is an explicit call to capture() instead of a subcall from _validateOffset()
		if (this._hasOffset && !this._offsetInvalid) {
			eltTransformValue = this.el.style[_styleProps["transform"]];
			if (eltTransformValue === "") {
				log("error", traceElt(this.el), "TransformItem._capture", "has valid offset but eltTransformValue=\"\" ?", this._offsetX, this._offsetY);
			} else {
				// log(traceElt(this.el), "TransformItem._capture", "clearing before capture");
			}
			this.el.style[_styleProps["transform"]] = "";
		}

		// NOTE: reusing object, all props will be overwritten
		capturedValues = {};//this._lastCapturedValues;
		this._lastCapturedValues = this._currCapturedValues;
		computed = window.getComputedStyle(this.el);
		for (var p in _styleNames) {
			capturedValues[p] = computed.getPropertyValue(_styleNames[p]);
		}
		this._currCapturedValues = capturedValues;
		
		if (this._currCapturedValues.transform !== this._lastCapturedValues.transform) {
			var m, mm, ret = {};
			mm = this._currCapturedValues.transform.match(/(matrix|matrix3d)\(([^\)]+)\)/);
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
		if (eltTransformValue !== null) {
			log(traceElt(this.el), "TransformItem._capture", "reapplying after capture", eltTransformValue);
			this.el.style[_styleProps["transform"]] = eltTransformValue;
		}
		this._captureInvalid = false;
	},

	_validateTransition: function() {
		// log(traceElt(this.el), "TransformItem._validateTransition", "invalid: "+this._transitionInvalid, "hasTx: "+this._hasTransition);
		
		if (this._transitionInvalid) {
			var capturing = this._captureInvalid;
			// if (this._captureInvalid) {
				// log(traceElt(this.el), "TransformItem._validateOffset", "lazy capture");
				this._validateCapture();
			// }
			// if (this._capturedValuesChanged && !this._hasOffset) {}
			log(traceElt(this.el), "TransformItem._validateTransition", logObj);
			var logObj = {
				"capture invalid": capturing,
				"capture changed": this._capturedValuesChanged,
				"has transition": this._hasTransition,
				"has offset": this._hasOffset,
			};
			
			// if (!this._transitionRunning) {
			// }
			if (this._hasTransition) {
				this._transitionRunning = true;
				// this.el.addEventListener(transitionEnd, this._handleTransitionEnd, false);
			} else {
				this._transitionRunning = false;
				// 	this.el.removeEventListener(transitionEnd, this._handleTransitionEnd, false);
			}
			
			// this._assertNoTransition = false;
			// if (this._hasTransition) {
			// 	if (this._offsetInvalid) {
			// 		// offset is being cleared/changed, transition will ocurr
			// 		this.el.style.backgroundColor = "hsla(120,100%,25%,0.1)";
			// 	} else
			// 	if (this._capturedValuesChanged) {
			// 		// captured changed, transition will ocurr;
			// 		this.el.style.backgroundColor = "hsla(120,100%,25%,0.1)";
			// 	} else
			// 	{
			// 		// transition not expected
			// 		this.el.style.backgroundColor = "hsla(0,50%,50%,0.1)";
			// 		this._assertNoTransition = true;
			// 	}
			// } else {
			// 	this.el.style.backgroundColor = "";//hsla(0,25%,50%,0.1)";
			// }
			this.el.style[_styleProps["transition"]] = this._transitionValue;
			this._transitionInvalid = false;
		}
	},

	_handleTransitionEnd: function(ev) {
		// if (this._transitionInvalid) {}
		if (this._transitionRunning && (this.el === ev.target) && (this._transition.property === ev.propertyName)) {
			this._transitionRunning = false;
			// this.el.removeEventListener(transitionEnd, this._handleTransitionEnd, false);
			this.el.style[_styleProps["transition"]] = "none 0s 0s";
			this.el.style.backgroundColor = "";//hsla(0,25%,50%,0.1)";
			
			// if (!this._hasTransition) {
			// 	log("error", traceElt(this.el), "TransformItem._hasTransition == false");//, this);
			// }
			// if (this._assertNoTransition) {
			// 	log("error", traceElt(this.el), "TransformItem._assertNoTransition == true");//, this);
			// 	this._assertNoTransition = false;
			// }
		}
	},
	
	_validateOffset: function() {
		if (this._offsetInvalid) {
			// log(traceElt(this.el), "TransformItem._validateOffset");
			// if (this._captureInvalid) {
				// log(traceElt(this.el), "TransformItem._validateOffset", "lazy capture");
				this._validateCapture();
			// }
			if (this._hasOffset) {
				var tx = this._offsetX + this._capturedX;
				var ty = this._offsetY + this._capturedY;
				if (tx !== this._renderedX || ty !== this._renderedY) {
					this._renderedX = tx;
					this._renderedY = ty;
					this.el.style[_styleProps["transform"]] = "translate3d(" + this._renderedX + "px, " + this._renderedY + "px, 0px)";
					// this.el.style.outline = "2px solid blue";
				}
			} else {
				this._renderedX = null;
				this._renderedY = null;
				this.el.style[_styleProps["transform"]] = "";
				// this.el.style.outline = "";
			}
			this._offsetInvalid = false;
		}
	},
};

module.exports = TransformItem;
