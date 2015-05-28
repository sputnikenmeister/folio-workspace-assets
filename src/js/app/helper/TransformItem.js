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


/* -------------------------------
 * Private static
 * ------------------------------- */

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
	this._needsCapture = true;
	this._captured = {};
	this._capturedX = null;
	this._capturedY = null;

	this._hasOffset = false;
	this._offsetX = null;
	this._offsetY = null;

	this._appliedX = null;
	this._appliedY = null;

	this._transitionEnabled = true;
	this._transitionRunning = false;
	this._transitionProperty = "none";

	this._changed = false;

	this.el = el;
	this.id = el.cid;
	_.bindAll(this, "handleTransitionEnd");
	el.addEventListener(transitionEnd, this.handleTransitionEnd, false);

	this.clearTransitions = this.enableTransitions;
}

TransformItem.prototype = {

	destroy: function() {
		// NOTE: In most cases, element is being removed from DOM when this is called, so if needed
		// clear(element) should be called explicitly.
		this.el.removeEventListener(transitionEnd, this.handleTransitionEnd, false);
	},

	/* -------------------------------
	 * css <--> object
	 * ------------------------------- */

	_captureElementStyle: function() {
		var computed;
		var lastTransformValue, currTransformValue;

		// var _ts = this.el.style[_styleProps["transition"]];
		// if (_ts !== "") {
		// 	this.el.style[_styleProps["transition"]] = void 0;
		// 	computed = window.getComputedStyle(this.el);
		// 	this.el.style[_styleProps["transition"]] = _ts;
		// } else {
			computed = window.getComputedStyle(this.el);
		// }

		lastTransformValue = this._captured["transform"] || "";//"matrix(1, 0, 0, 1, 0, 0)";
		for (var p in _styleNames) {
			this._captured[p] = computed.getPropertyValue(_styleNames[p]);
		}
		currTransformValue = this._captured["transform"];
		this._changed = lastTransformValue !== currTransformValue;

		if (this._changed) {
			var m, mm, ret = {};
			mm = currTransformValue.match(/(matrix|matrix3d)\(([^\)]+)\)/);
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
		this._needsCapture = false;

		// if (this._changed) {
		// 	console.log("[capture transform] " + lastTransformValue + " to " + currTransformValue, traceElt(this.el));
		// } else {
		// 	console.warn("[capture transform] " + lastTransformValue + " unchanged", traceElt(this.el));
		// }
		// if (this.el.style[_styleProps["transitionProperty"]] !== "none") {
		// 	console.log("[capture transition] " + this.el.style[_styleProps["transition"]], traceElt(this.el));
		// }
	},

	/* -------------------------------
	 * Public
	 * ------------------------------- */

	capture: function() {
		if (this._hasOffset) {
			this._clearElementStyle();
			console.log("TransformItem.capture: offset is set: clearing, capturing, reapplying", traceElt(this.el));
		}
		this._captureElementStyle();
		if (this._hasOffset) {
			this._applyElementStyle(this._offsetX + this._capturedX, this._offsetY + this._capturedY);
		}
	},

	release: function() {
		this._hasOffset = false;
		this._needsCapture = true;
	},

	move: function(x, y) {
		// x || (x = 0); y || (y = 0);
		if (this._needsCapture) {
			if (this._hasOffset) {
				this._clearElementStyle();
			}
			this._captureElementStyle();
			console.warn("TransformItem.move: _needsCapture=true, capturing", traceElt(this.el));
		}

		this._hasOffset = true;
		this._offsetX = x || 0;
		this._offsetY = y || 0;
		// this._changed = true;// XXX
		this._applyElementStyle(this._offsetX + this._capturedX, this._offsetY + this._capturedY);
	},

	clear: function() {
		if (this._hasOffset) {
			this._hasOffset = false;
			this._offsetX = null;
			this._offsetY = null;
			// this._changed = true;// XXX
			this._clearElementStyle();
		} else {
			console.log("TransformItem.clear: _hasOffset=false, doing nothing", traceElt(this.el));
		}
	},

	_clearElementStyle: function() {
		this._appliedX = null;
		this._appliedY = null;
		this.el.style[_styleProps["transform"]] = "";
	},

	_applyElementStyle: function(x, y) {
		if (this._hasOffset) {
			this._appliedX = this._offsetX + this._capturedX;
			this._appliedY = this._offsetY + this._capturedY;
			this.el.style[_styleProps["transform"]] = "translate3d(" + this._appliedX + "px, " + this._appliedY + "px, 0px)";
		} else {
			this._appliedX = null;
			this._appliedY = null;
			this.el.style[_styleProps["transform"]] = "";
		}
	},

	validate: function() {
		this._changed = false;
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	runTransition: function(transition) {
		// if (!this._hasOffset && !this._transitionRunning) {
			// // console.log("runTransition: _needsCapture:", this._needsCapture, traceElt(this.el));
			// if (this._needsCapture) {
			// 	// this._capture();
			// 	this._captureElementStyle();
			// }
			// // console.log("runTransition: _transformChanged:", this._changed, traceElt(this.el));
			// if (!this._changed) {
			// 	return;
			// }
		// }

		this._transitionRunning = true;
		this._transitionProperty = _styleNames["transform"];
		this.el.style[_styleProps["transition"]] = _styleNames["transform"] + " " + transition.duration/1000 +
				"s " + transition.easing + " " + transition.delay/1000 + "s";
	},

	handleTransitionEnd: function(ev) {
		if (this.el !== (ev.target)) {
			return;
		}
		if (this._transitionRunning && this._transitionProperty === ev.propertyName) {
			this._transitionRunning = false;
			this.el.style[_styleProps["transition"]] = this._transitionEnabled? "": "none 0s 0s";
			// this._changed = false;// XXX
			// this.el.style[_styleProps["transition"]] = "none 0s 0s";
		}
	},

	// clearTransitions: function() {
	// 	this.el.style[_styleProps["transition"]] = "";
	// 	this._transitionEnabled = true;
	// },

	enableTransitions: function() {
		this._transitionEnabled = true;
		this.el.style[_styleProps["transition"]] = "";
	},

	disableTransitions: function() {
		this._transitionEnabled = false;
		this.el.style[_styleProps["transition"]] = "none 0s 0s";
	},
};

module.exports = TransformItem;
