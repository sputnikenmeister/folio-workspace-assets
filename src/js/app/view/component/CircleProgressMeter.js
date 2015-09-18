/**
* @module app/view/component/CircleProgressMeter
*/

/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:utils/css/prefixedProperty} */
var prefixed = require("../../../utils/css/prefixedProperty");

module.exports = View.extend({
	
	cidPrefix: "circle-progress-meter-",
	/** @type {string} */
	className: "progress-meter circle-progress-meter",
	/** @type {Function} */
	template:  require("./CircleProgressMeter.hbs"),
	
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
		var s, p, total = this._total;
		
		// sw: step mark width in px
		// p = { d: 24, s1: 1.6, s2: 1.4, sw: 2.75 };
		// circumferences in px
		// p.r = ((p.d - Math.max(p.s1, p.s2)) / 2) - 1; // allow 1/2 pixel around circles
		// p.c = p.r * Math.PI * 2;
		
		p = { d: 24, s1: 3.6, s2: 2.4, sw: 2.75 };
		p.r = p.d / 2;
		p.c = p.d * Math.PI;
		
		// rotate CCW ( 90 + half a step mark, in degrees ) so that
		// the arc starts from the top and step gaps appear centered
		p.sr = ((p.sw / 2) / p.r) * (180/Math.PI) - 90;
		// keep template params
		this._params = p;
		
		this.el.innerHTML = this.template(p);
		
		this.labelEl = this.el.querySelector("#step-label");
		this.amountShape = this.el.querySelector("#amount");
		this.stepsShape = this.el.querySelector("#steps");
		
		s = this.stepsShape.style;
		s.strokeDasharray = [(p.c / total) - p.sw, p.sw];
		s.strokeOpacity = 0.5;
		// this.stepsShape.style.strokeDasharray = [p.sw, (p.c / total) - p.sw];
		// this.stepsShape.style.strokeDashoffset = p.sw;
		
		s = this.amountShape.style;
		s.strokeDasharray = [p.c - p.sw, p.c + p.sw];
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
				tx = "stroke-dashoffset " + this._transitionDuration + "ms linear 1ms";
				this._transitionStartTime = Date.now();
			} else {
				tx = "stroke-dashoffset 0ms linear 0ms";
				this._transitionStartTime = -1;
			}
			this.amountShape.style[prefixed("transition")] = tx;
			this.amountShape.style.strokeDashoffset = (1 - (this._value/this._total)) * this._params.c;
		}
		return this;
	},
	
	// events: {
	// 	"transitionend": "_onTransitionEnd"
	// },
	
	// _onTransitionEnd: function (ev) {
	// 	if (ev.target === this.amountShape) {
	// 		log.call(this, "event", "elapsed:" + (ev.elapsedTime*1000) + "ms");
	// 		this._transitionStartTime = -1;
	// 		this._transitionDuration = 0;
	// 	}
	// },
});
