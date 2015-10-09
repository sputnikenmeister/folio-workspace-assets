/**
* @module app/view/component/CircleProgressMeter2
*/

/** @type {module:app/view/base/View} */
var View = require("app/view/base/View");
/** @type {module:utils/prefixedProperty} */
var prefixed = require("utils/prefixedProperty");

module.exports = View.extend({
	
	cidPrefix: "circleProgressMeter",
	/** @type {string} */
	className: "progress-meter circle-progress-meter",
	/** @type {Function} */
	template:  require("./CircleProgressMeter2.hbs"),
	
	/** @override */
	initialize: function (options) {
		// ProgressMeter.prototype.initialize.apply(this, arguments);
		this._value = options.value || 0;
		this._total = options.total || 1;
		
		this._transitionStartTime = -1;
		this._valueChanged = true;
		
		this.createChildren();
	},
	
	createChildren: function() {
		var p = { d: 24, s1: 2, s2: 1 };
		var total = this._total;
		
		var sa = Math.PI/16, // step gap angle in radians: 1/20 circumference
			r1 = (p.d - p.s1)/2 - 0.1, // amount radius
			r2 = (p.d - p.s2)/2 - 0.15; // steps radius
			
		var sw1 = sa * r1, // step gap width in px
			sw2 = sa * r2; // step gap width in px
		
		var a1 = (sa - Math.PI)/2, // start angle
			a2 = Math.PI*2 - sa; // arc span angle
		p.p1 = this._arcPathData(a1, a2, r1);
		p.p2 = this._arcPathData(a1, a2, r2);
		// p.c = (Math.PI*2 - sa) * (p.r);
		
		// keep template params
		this._params = p;
		
		this.el.innerHTML = this.template(p);
		
		this.labelEl = this.el.querySelector("#step-label");
		this.amountShape = this.el.querySelector("#amount");
		this.stepsShape = this.el.querySelector("#steps");
		
		var s; // style
		s = this.stepsShape.style;
		s.strokeDasharray = [((r2 * Math.PI*2) / total) - sw2, sw2];
		s.strokeOpacity = 0.5;
		// this.stepsShape.style.strokeDasharray = [p.sw2, (p.c / total) - p.sw2];
		// this.stepsShape.style.strokeDashoffset = p.sw2;
		
		p.c = this.amountShape.getTotalLength() + sw1;
		s = this.amountShape.style;
		s.strokeDasharray = [p.c - sw1, p.c + sw1];
		// s.strokeDasharray = [p.c, p.c];
		s.strokeDashoffset = p.c;
	},
	
	valueTo: function (value, duration) {
		this._valueChanged = true;
		
		this._transitionDuration = duration || 0;
		this._lastValue = this._value;
		this._value = value;
		
		this.render();
	},
	
	render: function () {
		if (this._valueChanged) {
			// log.call(this, this._transitionStartTime > 0? "interrupt" : "render");
			var tx;
			if (this._transitionDuration > 0) {
				tx = "stroke-dashoffset " + (this._transitionDuration * 0.001) + "s linear 0.001s";
				this._transitionStartTime = Date.now();
			} else {
				tx = "stroke-dashoffset 0s linear 0s";
				this._transitionStartTime = -1;
			}
			this.amountShape.style[prefixed("transition")] = tx;
			this.amountShape.style.strokeDashoffset = (1 - (this._value/this._total)) * (this._params.c);
		}
		return this;
	},
	
	/**
	* @param {Number} a1 start radians
	* @param {Number} a2 end radians
	* @param {Number} r1 radius pixels
	* @param {Number} r2 radius pixels
	* @return {String} SVG path data
	*/
	_arcPathData: function(a1, a2, r1, r2) {
		var d = [];
		
		a2 = Math.min(a2, (Math.PI*2) - 0.0001);
		a2 += a1;
		
		var x1 = Math.cos(a1),
			y1 = Math.sin(a1),
			x2 = Math.cos(a2),
			y2 = Math.sin(a2),
			f1 = Math.abs(a1 - a2) > Math.PI,
			f2 = a1 < a2;
		
		d.push("M", x1*r1, y1*r1, "A", r1, r1, 0, f1|0, f2|0, x2*r1, y2*r1);
		if (r2) {
			// var r3 = Math.abs(r1 - r2);
			// d.push("A", r3, r3, 0, 1, 0, x2*r2, y2*r2);
			d.push("L", x2*r2, y2*r2);
			d.push("A", r2, r2, 0, f1|0, (!f2)|0, x1*r2, y1*r2, "Z");
		}
		return d.join(" ");
	},
	
	events: {
		"transitionend": "_onTransitionEnd"
	},
	
	_onTransitionEnd: function (ev) {
		if (ev.target === this.amountShape) {
			// log.call(this, "event", "elapsed:" + (ev.elapsedTime*1000) + "ms");
			this._transitionStartTime = -1;
			this._transitionDuration = 0;
		}
	},
});

// function log(key, msg) {
// 	console.log(
// 		"CircleProgressMeter.render[%s] duration:%ims estimate:%ims start:%ims",
// 		key,
// 		this._transitionDuration,
// 		this._transitionStartTime > 0? Date.now() - this._transitionStartTime : 0,
// 		this._transitionStartTime,
// 		msg? msg: "-"
// 	);
// }
