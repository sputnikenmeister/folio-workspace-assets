/* -------------------------------
* Imports
* ------------------------------- */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {String} */
var transitionEnd = require("../utils/event/transitionEnd");
/** @type {module:app/utils/strings/camelToDashed} */
var camelToDashed = require("../utils/strings/camelToDashed");
/** @type {module:app/utils/css/prefixedProperty} */
var prefixedProperty = require("../utils/css/prefixedProperty");
/** @type {module:app/utils/css/prefixedStyleName} */
// var prefixedStyleName = require("../utils/css/prefixedStyleName");
/** @type {module:app/utils/css/prefixedProperty} */
// var parseTransformMatrix = require("../utils/css/parseTransformMatrix");

/** @type {module:app/utils/debug/traceElement} */
var traceElt = require("../utils/debug/traceElement");

var log = function() {
	if (arguments[0] === "error") {
		console.error.apply(console, arguments);
	} else if (arguments[0] === "warn") {
		console.warn.apply(console, arguments);
	} else {
		// console.log.apply(console, arguments);
	}
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
			console.warn("Property '" + p + "' is not available");
			_styleProps[p] = p;
			_styleNames[p] = camelToDashed(p);
		}
	}
}());

/* -------------------------------
 * TransformItem
 * ------------------------------- */

/**
 * @constructor
 */
function TransformItem(el) {
	this._invalid = false;

	this._capturedX = null;
	this._capturedY = null;
	this._currCapturedValues = {};
	this._lastCapturedValues = {};
	this._capturedChanged = false;

	this._hasOffset = false;
	this._offsetX = null;
	this._offsetY = null;
	this._offsetInvalid = false;

	this._renderedX = null;
	this._renderedY = null;
	this._renderedChanged = false;

	this._transitionEnabled = true;
	this._transitionRunning = false;
	this._transitionProperty = "none";
	this._transitionInvalid = false;

	this.el = el;
	this.id = el.cid;
	_.bindAll(this, "_handleTransitionEnd");
	el.addEventListener(transitionEnd, this._handleTransitionEnd, false);

	this.enableTransitions = this.clearTransitions;
	this.disableTransitions = this.stopTransitions;

	this._needsCapture = false;
	this._capture();
}

TransformItem.prototype = {

	/* -------------------------------
	 * css <--> object
	 * ------------------------------- */

	_capture: function() {
		var computed, capturedValues;
		var currTransformValue, eltTransformValue = null;

		// this is an explicit call to capture() instead of a subcall from _validateOffset()
		if (this._hasOffset && !this._offsetInvalid) {
			eltTransformValue = this.el.style[_styleProps["transform"]];
			if (eltTransformValue === "")
				log("error", traceElt(this.el), "TransformItem._capture: _hasOffset=true but eltTransformValue=\"\" ?");
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
		this._capturedChanged = this._currCapturedValues.transform !== this._lastCapturedValues.transform;

		if (this._capturedChanged) {
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
		}
		if (eltTransformValue !== null) {
			this.el.style[_styleProps["transform"]] = eltTransformValue;
		}
		this._needsCapture = false;
	},

	_validateOffset: function() {
		var tx, ty;

		if (this._needsCapture) {
			log(traceElt(this.el), "TransformItem._validateOffset: lazy-capturing");
			this._capture();
		}

		if (this._hasOffset) {
			tx = this._offsetX + this._capturedX;
			ty = this._offsetY + this._capturedY;
		} else {
			tx = null;
			ty = null;
		}

		if (tx !== this._renderedX || ty !== this._renderedY) {
			this._renderedX = tx;
			this._renderedY = ty;
			if (this._hasOffset) {
				this.el.style[_styleProps["transform"]] = "translate3d(" + this._renderedX + "px, " + this._renderedY + "px, 0px)";
				// this.el.style.outline = "2px solid blue";
			} else {
				this.el.style[_styleProps["transform"]] = "";
				// this.el.style.outline = "";
			}
			this._renderedChanged = true;
		}
		this._offsetInvalid = false;
	},

	/* -------------------------------
	 * internal
	 * ------------------------------- */

	validate: function() {
		this._invalid = false;
		// this._needsCapture = true;
		this._renderedChanged = false;
		this._capturedChanged = false;

		this._validateTransition();
		this._validateOffset();
	},

	destroy: function() {
		// NOTE: In most cases, element is being removed from DOM when this is called, so if needed
		// clearOffset(element) should be called explicitly.
		this.el.removeEventListener(transitionEnd, this._handleTransitionEnd, false);
	},

	/* -------------------------------
	 * public
	 * ------------------------------- */

	/* capture/release
	 * - - - - - - - - - - - - - - - - */

	capture: function() {
		log(traceElt(this.el), "TransformItem.capture");

		// console.log(traceElt(this.el), this._capturedX, this._capturedY);
		// this._needsCapture = true;
		this._capture();
		// console.log(traceElt(this.el), this._capturedX, this._capturedY);
		// console.log(traceElt(this.el), this._capturedChanged, this._lastCapturedValues.transform, this._currCapturedValues.transform);
	},

	clearCapture: function() {
		log(traceElt(this.el), "TransformItem.clearCapture");

		// this._hasOffset = false;
		this._needsCapture = true;
	},

	/* offset/clear
	 * - - - - - - - - - - - - - - - - */

	offset: function(x, y, immediately) {
		log(traceElt(this.el), "TransformItem.offset");

		this._hasOffset = true;
		this._offsetInvalid = true;
		this._offsetX = x || 0;
		this._offsetY = y || 0;

		if (immediately !== false) {
			this._validateOffset();
		}
	},

	clearOffset: function(immediately) {
		log(traceElt(this.el), "TransformItem.clearOffset");

		if (!this._hasOffset) {
			log(traceElt(this.el), "TransformItem.clear: _hasOffset=false, doing nothing" );
			return;
		}
		this._hasOffset = false;
		this._offsetInvalid = true;
		this._offsetX = null;
		this._offsetY = null;

		if (immediately !== false) {
			this._validateOffset();
		}
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	_validateTransition: function() {
		if (this._transitionInvalid) {
			this._transitionInvalid = false;
			this._transitionRunning = true;

			this.el.style[_styleProps["transition"]] = this._transitionValue;
			// this.el.style.backgroundColor = "hsla(180,50%,50%,0.1)";

			// if (this._transitionValue === "" || this._transitionValue === "none 0s 0s") {
			// 	this.el.style.backgroundColor = "";
			// } else {
			// 	this.el.style.backgroundColor = "hsla(180,50%,50%,0.1)";
			// }
			// _.defer(function(context) {
			// 	context._transitionInvalid = false;
			// }, this);
		}
	},

	_cleanupTransition: function(force) {
		if (this._transitionInvalid) {
			log("error", traceElt(this.el), "TransformItem.runTransition changed then cleared",  this.el.style[_styleProps["transition"]], this._transitionValue);
		}
		// if (!this._transitionRunning && !this._transitionInvalid) {
		// 	log("error", traceElt(this.el), "TransformItem._cleanupTransition(force): transition not running and not invalid", this.el.style[_styleProps["transition"]]);
		// }
		if (this._transitionRunning) {
			this._transitionRunning = false;
			this._transitionValue = force? "none 0s 0s": "";
			this.el.style[_styleProps["transition"]] = this._transitionValue;
			// this.el.style.backgroundColor = "";
		}
	},

	runTransition: function(transition, immediately) {
		log(traceElt(this.el), "TransformItem.runTransition");

		this._transitionProperty = _styleNames["transform"];
		this._transitionDuration = transition.duration;
		this._transitionEasing = transition.easing;
		this._transitionDelay = transition.delay;

		this._transitionValue =
			this._transitionProperty + " " +
			this._transitionDuration/1000 + "s " +
			this._transitionEasing + " " +
			this._transitionDelay/1000 + "s";

		if (this._transitionInvalid) {
			log("error", traceElt(this.el), "TransformItem.runTransition changed twice",  this.el.style[_styleProps["transition"]], this._transitionValue);
		}

		this._transitionInvalid = true;
		if (immediately !== false) {
			this._validateTransition();
		}
	},

	_handleTransitionEnd: function(ev) {
		(this.el === ev.target) && (this._transitionProperty === ev.propertyName) && this._cleanupTransition();
	},

	clearTransitions: function() {
		log(traceElt(this.el), "TransformItem.clearTransitions");

		// this._transitionEnabled = true;
		// this.el.style[_styleProps["transition"]] = "";
		this._cleanupTransition();
	},

	stopTransitions: function() {
		log(traceElt(this.el), "TransformItem.stopTransitions");

		// this._transitionEnabled = false;
		// this.el.style[_styleProps["transition"]] = "none 0s 0s";
		this._cleanupTransition(true);
	},
};

module.exports = TransformItem;
