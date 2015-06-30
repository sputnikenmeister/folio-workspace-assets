/**
 * @module app/control/TouchManager
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("./Globals");

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
	if (state & Hammer.STATE_CANCELLED) {
		return "cancel";
	} else if (state & Hammer.STATE_ENDED) {
		return "end";
	} else if (state & Hammer.STATE_CHANGED) {
		return "move";
	} else if (state & Hammer.STATE_BEGAN) {
		return "start";
	}
	return "";
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
	if (direction == Hammer.DIRECTION_DOWN) {
		return "down";
	} else if (direction == Hammer.DIRECTION_UP) {
		return "up";
	} else if (direction == Hammer.DIRECTION_LEFT) {
		return "left";
	} else if (direction == Hammer.DIRECTION_RIGHT) {
		return "right";
	}
	return "";
}

///**
// * Pan
// * Recognized when the pointer is down and moved in the allowed direction.
// * @constructor
// * @extends AttrRecognizer
// */
//function PanRecognizer() {
//	Hammer.AttrRecognizer.apply(this, arguments);
//
//	this.pX = null;
//	this.pY = null;
//}
//
//inherit(PanRecognizer, Hammer.AttrRecognizer, {
//	/**
//	 * @namespace
//	 * @memberof PanRecognizer
//	 */
//	defaults: {
//		event: "pan",
//		threshold: 10,
//		pointers: 1,
//		direction: DIRECTION_ALL
//	},
//
//	getTouchAction: function() {
//		var direction = this.options.direction;
//		var actions = [];
//		if (direction & DIRECTION_HORIZONTAL) {
//			actions.push(TOUCH_ACTION_PAN_Y);
//		}
//		if (direction & DIRECTION_VERTICAL) {
//			actions.push(TOUCH_ACTION_PAN_X);
//		}
//		return actions;
//	},
//
//	directionTest: function(input) {
//		var options = this.options;
//		var hasMoved = true;
//		var distance = input.distance;
//		var direction = input.direction;
//		var x = input.deltaX;
//		var y = input.deltaY;
//
//		// lock to axis?
//		if (!(direction & options.direction)) {
//			if (options.direction & DIRECTION_HORIZONTAL) {
//				direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
//				hasMoved = x != this.pX;
//				distance = Math.abs(input.deltaX);
//			} else {
//				direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
//				hasMoved = y != this.pY;
//				distance = Math.abs(input.deltaY);
//			}
//		}
//		input.direction = direction;
//		return hasMoved && distance > options.threshold && direction & options.direction;
//	},
//
//	attrTest: function(input) {
//		return AttrRecognizer.prototype.attrTest.call(this, input) &&
//			(this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
//	},
//
//	emit: function(input) {
//		this.pX = input.deltaX;
//		this.pY = input.deltaY;
//
//		var direction = directionStr(input.direction);
//		if (direction) {
//			this.manager.emit(this.options.event + direction, input);
//		}
//
//		this._super.emit.call(this, input);
//	}
//});

/**
 * SmoothPan
 * @constructor
 * @extends Hammer.Pan
 */
function SmoothPan() {
	Hammer.Pan.apply(this, arguments);
	this.thresholdOffsetX = null;
	this.thresholdOffsetY = null;
	this.thresholdOffset = null;
}

Hammer.inherit(SmoothPan, Hammer.Pan, {
	emit: function(input) {
		// Inheritance breaks, so this code is taken from PanRecognizer.emit
		//	this._super.emit.call(this, input); 				// Triggers infinite recursion
		//	Hammer.Pan.prototype.emit.apply(this, arguments); 	// This breaks too

		var threshold = this.options.threshold;
		var direction = input.direction;

		if (this.state == Hammer.STATE_BEGAN) {
			this.thresholdOffsetX = (direction & Hammer.DIRECTION_HORIZONTAL)? ((direction & Hammer.DIRECTION_LEFT)? threshold: -threshold) : 0;
			this.thresholdOffsetY = (direction & Hammer.DIRECTION_VERTICAL)? ((direction & Hammer.DIRECTION_UP)? threshold: -threshold) : 0;
//			this.thresholdOffset = (direction & Hammer.DIRECTION_HORIZONTAL)? input.thresholdOffsetX : input.thresholdOffsetY;
//			console.log("RECOGNIZER STATE", directionStr(direction), stateStr(this.state), this.thresholdOffsetX);
		}
		input.thresholdOffsetX = this.thresholdOffsetX;
		input.thresholdOffsetY = this.thresholdOffsetY;
		input.thresholdDeltaX = input.deltaX + this.thresholdOffsetX,
		input.thresholdDeltaY = input.deltaY + this.thresholdOffsetY,

		this.pX = input.deltaX;
		this.pY = input.deltaY;

		direction = directionStr(direction);
		if (direction) {
			this.manager.emit(this.options.event + direction, input);
		}
		Hammer.Recognizer.prototype.emit.apply(this, arguments);
	}
});

function createInstance(el) {
	var recognizers = [];
	var manager = new Hammer.Manager(el);
	
	var hpan = new SmoothPan({
	// var hpan = new Hammer.Pan({
		threshold: Globals.THRESHOLD,
		direction: Hammer.DIRECTION_HORIZONTAL,
	});
	recognizers.push(hpan);
	
	var vpan = new SmoothPan({
		event: "vpan",
		threshold: Globals.THRESHOLD,
		direction: Hammer.DIRECTION_VERTICAL,
	});
	recognizers.push(vpan);
	vpan.requireFailure(hpan);
	
	// var tap = new Hammer.Tap({
	// 	// threshold: Globals.THRESHOLD-1,
	// 	// interval: 50, time: 200,
	// });
	// recognizers.push(tap);
	// tap.recognizeWith(hpan);
	
	// instance.add([hpan, vpan, tap]);
	manager.add(recognizers);
	return manager;
}
	
	//https://gist.githubusercontent.com/jtangelder/361052976f044200ea17/raw/f54c2cef78d59da3f38286fad683471e1c976072/PreventGhostClick.js
/*
function preventGhostClick(hev)
	manager.on("panend vpanend pancancel vpancancel", function(hev) {
		var targetEvType = "click";
		var targetEvHandler;
		targetEvHandler = function (ev) {
			console.log("[TouchManager] " + ev.type + " (after " + hev.type + ")",
					ev.timeStamp, "preventDefault()");
				el.removeEventListener(targetEvType, targetEvHandler, true);
				ev.preventDefault();
				ev.stopPropagation();
				// ev.stopImmediatePropagation();
			};
		console.log("[TouchManager] " + hev.type + " (" + hev.srcEvent.type + ")",
			hev.srcEvent.timeStamp, "will prevent next " + targetEvType);
		el.addEventListener(targetEvType, targetEvHandler, true);
	});
	// instance.on("pancancel vpancancel", function(hev) {
	// 	console.log("[TouchManager] " + hev.type + " (" + hev.srcEvent.type + ")",
	// 		hev.srcEvent.timeStamp);
	// });
	
	// instance.on("tap panend pancancel vpanend vpancancel", function(ev) {
	// 	var sev = ev.srcEvent;
	// 	var prevType = ev.type;
	// 	var targetType = "click";
	// 	if ((ev.type == "panend" || ev.type == "vpanend") && sev.type == "mouseup") {
	// 		var handler;
	// 		handler = function (ev) {
	// 			console.log("[TouchManager] " + ev.type + " (after " + prevType + ")",
	// 				ev.timeStamp, "preventing default");
	// 			el.removeEventListener(targetType, handler, true);
	// 			ev.preventDefault();
	// 			ev.stopPropagation();
	// 			// ev.stopImmediatePropagation();
	// 		};
	// 		console.log("[TouchManager] " + sev.type +" (" + ev.type + ")",
	// 			sev.timeStamp, "will prevent next " + targetType);
	// 		el.addEventListener(targetType, handler, true);
	// 	}
	// 	// if (ev.type == "tap") {
	// 	else {
	// 		console.log("[TouchManager] " + sev.type +" ("+ev.type+")", sev.timeStamp);
	// 	}
	// });
	
};*/

var instance = null;

module.exports = {
	init: function(el) {
		if (_.isNull(instance)) {
			var lastTimeStamp = -1;
			var recordTimeStamp = function(hev) {
				lastTimeStamp = hev.srcEvent.timeStamp;
				// console.log("[TouchManager] " + hev.type +" (" + hev.srcEvent.type + ")",
				// 	lastTimeStamp, "will prevent next click");
			};
			var preventClickEvent = function(domev) {
				if (lastTimeStamp == domev.timeStamp) {
					// console.log("[TouchManager] " + domev.type, domev.timeStamp, "preventing default");
					lastTimeStamp = 0;
					domev.preventDefault();
					domev.stopPropagation();
				}
			};
			
			instance = createInstance(el);
			instance.on("panend pancancel vpanend vpancancel", recordTimeStamp);
			instance.element.addEventListener("click", preventClickEvent, true);
			this.handlerRef = preventClickEvent;
			
		} else {
			console.warn("cannot initialize more than once");
		}
		return instance;
	},
	destroy: function() {
		if (_.isNull(instance)) {
			console.warn("no instance to destroy");
		} else {
			instance.element.removeEventListener("click", this.handlerRef, true);
			instance.destroy();
			instance = null;
		}
	},
	getInstance: function() {
		if (_.isNull(instance)) {
			console.error("must initialize first");
		}
		return instance;
	}
};
