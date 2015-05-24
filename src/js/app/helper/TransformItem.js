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


/* -------------------------------
 * Private static
 * ------------------------------- */

var _idSeed = 100;
var _properties = {}, _styleNames = {};
(function() {
	var p, pp, ps;
	var props = ["transform", "transformStyle", "transition", "transitionDuration",
		"transitionDelay", "transitionProperty", "transitionTimingFunction"];
	for (var i = 0; i < props.length; ++i) {
		p = props[i];
		pp = prefixedProperty(document.body.style, p);
		_properties[p] = pp;
		_styleNames[p] = p != pp? "-" + camelToDashed(pp): p;
	}
}());

function traceElt(el) {
	var traceId = "";
	var cid;
	if (el.hasAttribute("id")) {
		traceId += "#" + el.id + " ";
	}
	if (el.hasAttribute("data-cid")) {
		cid = el.getAttribute("data-cid");
		if (el.cid === cid) {
			traceId += "@" + cid + " ";
		} else {
			traceId += "@!" + cid + " ";
		}
	}
	if (traceId == "") {
		traceId += "?(" + el.tagName + ") ";
	}
	traceId += "[" + el.classList[0] + "]";
	return traceId;
}

/* -------------------------------
 * TransformItem
 * ------------------------------- */

/**
 * @constructor
 */
function TransformItem(el) {
	this.id = _idSeed++;

	this._hasOffset = false;
	this._offsetX = null;
	this._offsetY = null;

	this._needsCapture = true;
	this._capturedX = null;
	this._capturedY = null;
	this._captured = {};

	this.transitioning = null;
	this._transitionsDisabled = false;

	this.el = el;
	_.bindAll(this, "handleTransitionEnd");
	el.addEventListener(transitionEnd, this.handleTransitionEnd, false);

	if (el.hasAttribute("data-cid")) {
		this.cid = el.getAttribute("data-cid");
	} else {
		this.cid = "elt" + this.id;
		el.setAttribute("data-cid", this.cid);
		el.cid = this.cid;
	}
}

TransformItem.prototype = {

	destroy: function() {
		if (this._hasOffset) {
			this._clearElementTransform();
		}
		this.el.removeEventListener(transitionEnd, this.handleTransitionEnd, false);
	},

	/* -------------------------------
	 * css <--> object
	 * ------------------------------- */

	_captureElementTransform: function() {
		var lastTransformValue, currTransformValue;
		var computed = window.getComputedStyle(this.el);

		lastTransformValue = this._captured["transform"];
		for (var p in _styleNames) {
			this._captured[p] = computed.getPropertyValue(_styleNames[p]);
		}
		currTransformValue = this._captured["transform"];

		this._transformChanged = lastTransformValue != currTransformValue;
		if (this._transformChanged) {
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
	},

	_capture: function() {
		if (this._hasOffset) {
			this._clearElementTransform();
			console.warn("TransformItem.capture", this.id,
				"offset values still set: clearing, capturing, reapplying");
		}
		this._captureElementTransform();
		if (this._hasOffset) {
			this._applyElementTransform(this._offsetX + this._capturedX, this._offsetY + this._capturedY);
		}
	},

	_move: function(x, y) {
		// x || (x = 0); y || (y = 0);
		if (this._needsCapture) {
			if (this._hasOffset) {
				this._clearElementTransform();
			}
			this._captureElementTransform();
			console.warn("TransformItem.move", this.id, "captured values not set: capturing now", traceElt(this.el));
		}

		this._offsetX = x || 0;
		this._offsetY = y || 0;
		this._hasOffset = true;

		this._applyElementTransform(this._offsetX + this._capturedX, this._offsetY + this._capturedY);
	},

	_clear: function() {
		if (this._hasOffset) {
			this._hasOffset = false;
			this._clearElementTransform();
		} else {
			console.warn("TransformItem.clear", this.id, "nothing to clear", traceElt(this.el));
		}
	},

	_release: function() {
		this._hasOffset = false;
		this._needsCapture = true;
	},

	/* -------------------------------
	 * element.style
	 * ------------------------------- */

	_clearElementTransform: function() {
		this.el.style[_properties["transform"]] = "";
	},

	_applyElementTransform: function(x, y) {
		this.el.style[_properties["transform"]] = "translate3d(" + x + "px, " + y + "px, 0px)";
	},

	/* -------------------------------
	 * transitions
	 * ------------------------------- */

	runTransition: function(transition) {
		// if (!this._hasOffset && this.transitioning === null) {
		// 	// console.log("runTransition: _needsCapture:", this._needsCapture, this.toString());
		// 	if (this._needsCapture) {
		// 		// this._capture();
		// 		this._captureElementTransform();
		// 	}
		// 	console.log("runTransition: _transformChanged:", this._transformChanged, this.toString());
		// 	if (!this._transformChanged) {
		// 		return;
		// 	}
		// }
		var val = _styleNames["transform"] + " " + transition.duration/1000 +
				"s " + transition.easing + " " + transition.delay/1000 + "s";

		this.transtioning = _styleNames["transform"];
		this.el.style[_properties["transition"]] = val;
	},

	handleTransitionEnd: function(ev) {
		if (this.el !== (ev.target)) {
			return;
		}
		if (this.transitioning && this.transitioning === ev.propertyName) {
			this.el.style[_properties["transition"]] = this._transitionsDisabled? "none 0s 0s": "";
			this.transitioning = null;
		}
	},

	enableTransitions: function() {
		this.el.style[_properties["transition"]] = "";
		this._transitionsDisabled = false;
	},

	disableTransitions: function() {
		this.el.style[_properties["transition"]] = "none 0s 0s";
		this._transitionsDisabled = true;
	},

	toString: function() {
		return traceElt(this.el);
	}
};

module.exports = TransformItem;
