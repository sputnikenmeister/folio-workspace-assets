/**
 * @module app/control/TouchManager
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:hammerjs} */
var Hammer = require("hammerjs");
/** @type {module:backbone} */
var Backbone = require("backbone");


///**
// * SmoothPan
// * @constructor
// * @extends PanRecognizer
// */
//function SmoothPan() {
//    Hammer.Pan.apply(this, arguments);
//	this.deltaOffsetX = null;
//	this.deltaOffsetY = null;
//}
//
//Hammer.inherit(SmoothPan, Hammer.Pan, {
//    emit: function(input) {
//		var threshold = this.options.threshold;
//		if (this.state & Hammer.STATE_BEGAN) {
//			this.deltaOffsetX = (input.direction & Hammer.DIRECTION_LEFT)? -threshold: threshold;
//			this.deltaOffsetY = (input.direction & Hammer.DIRECTION_TOP)? -threshold: threshold;
//		}
////		input.deltaX += this.deltaOffsetX;
////		input.deltaY += this.deltaOffsetY;
//
//        this._super.emit.call(this, input);
////      Hammer.Pan.prototype.emit.apply(this, arguments);
//    }
//});

var THRESHOLD = 15;

var instance = null;

module.exports = {

	init: function(el) {
		if (_.isNull(instance)) {
			var vpan = new Hammer.Pan({
				event: "vpan",
				threshold: THRESHOLD,
				direction: Hammer.DIRECTION_VERTICAL,
			});
			var hpan = new Hammer.Pan({
//			var hpan = new SmoothPan({
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
			instance.on("panstart", function(ev) {
//				instance.session.firstInput.center.x += (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
//				instance.session.firstInput.deltaX += (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
//				instance.session.offsetDelta.x += (ev.direction & Hammer.DIRECTION_LEFT)? -THRESHOLD: THRESHOLD;
				instance.session.prevDelta.x = (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
//				ev.deltaX += (ev.direction & Hammer.DIRECTION_LEFT)? THRESHOLD: -THRESHOLD;
			});
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
