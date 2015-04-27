/**
 * @module app/control/TouchManager
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");

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
//    Hammer.AttrRecognizer.apply(this, arguments);
//
//    this.pX = null;
//    this.pY = null;
//}
//
//inherit(PanRecognizer, Hammer.AttrRecognizer, {
//    /**
//     * @namespace
//     * @memberof PanRecognizer
//     */
//    defaults: {
//        event: "pan",
//        threshold: 10,
//        pointers: 1,
//        direction: DIRECTION_ALL
//    },
//
//    getTouchAction: function() {
//        var direction = this.options.direction;
//        var actions = [];
//        if (direction & DIRECTION_HORIZONTAL) {
//            actions.push(TOUCH_ACTION_PAN_Y);
//        }
//        if (direction & DIRECTION_VERTICAL) {
//            actions.push(TOUCH_ACTION_PAN_X);
//        }
//        return actions;
//    },
//
//    directionTest: function(input) {
//        var options = this.options;
//        var hasMoved = true;
//        var distance = input.distance;
//        var direction = input.direction;
//        var x = input.deltaX;
//        var y = input.deltaY;
//
//        // lock to axis?
//        if (!(direction & options.direction)) {
//            if (options.direction & DIRECTION_HORIZONTAL) {
//                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
//                hasMoved = x != this.pX;
//                distance = Math.abs(input.deltaX);
//            } else {
//                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
//                hasMoved = y != this.pY;
//                distance = Math.abs(input.deltaY);
//            }
//        }
//        input.direction = direction;
//        return hasMoved && distance > options.threshold && direction & options.direction;
//    },
//
//    attrTest: function(input) {
//        return AttrRecognizer.prototype.attrTest.call(this, input) &&
//            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
//    },
//
//    emit: function(input) {
//        this.pX = input.deltaX;
//        this.pY = input.deltaY;
//
//        var direction = directionStr(input.direction);
//        if (direction) {
//            this.manager.emit(this.options.event + direction, input);
//        }
//
//        this._super.emit.call(this, input);
//    }
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

var THRESHOLD = 15;

var instance = null;

module.exports = {

	init: function(el) {
		if (_.isNull(instance)) {
//			var vpan = new Hammer.Pan({
			var vpan = new SmoothPan({
				event: "vpan",
				threshold: THRESHOLD,
				direction: Hammer.DIRECTION_VERTICAL,
			});
//			var hpan = new Hammer.Pan({
			var hpan = new SmoothPan({
				threshold: THRESHOLD,
				direction: Hammer.DIRECTION_HORIZONTAL,
			});
			var tap = new Hammer.Tap({
				threshold: THRESHOLD - 1,
				interval: 50,
				time: 200,
			});
			vpan.requireFailure(hpan);
			tap.recognizeWith(hpan);
			instance = new Hammer.Manager(el);
			instance.add([hpan, vpan, tap]);
//			instance.on("panstart", function(ev) {
//				instance.session.firstInput.center.x += (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
//				instance.session.firstInput.deltaX += (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
//				instance.session.offsetDelta.x += (ev.direction & Hammer.DIRECTION_LEFT)? -THRESHOLD: THRESHOLD;
//				instance.session.prevDelta.x = (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
//				ev.deltaX += (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
//			});
//			instance.on("vpanstart", function(ev) {
//				instance.session.prevDelta.y = (ev.direction & Hammer.DIRECTION_UP)? THRESHOLD: -THRESHOLD;
//			});
		} else {
			console.warn("cannot initialize more than once");
		}
		return instance;
	},

	destroy: function() {
		if (_.isNull(instance)) {
			console.warn("no instance to destroy");
		} else {
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
