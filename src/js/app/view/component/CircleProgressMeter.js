/**
* @module app/view/component/CircleProgressMeter
*/

/** @type {module:app/view/component/ProgressMeter} */
var ProgressMeter = require("./ProgressMeter");

module.exports = ProgressMeter.extend({
	
	/** @type {string} */
	className: ProgressMeter.prototype.className + " circle-progress-meter",
	/** @type {Function} */
	template: require("./CircleProgressMeter.hbs"),
	
	/** @override */
	initialize: function (options) {
		// ProgressMeter.prototype.initialize.apply(this, arguments);
		
		this._valueInvalid = true;
		this.listenTo(this.model, "change", function() {
			this._valueInvalid = true;
			this.render();
		});
		
		this.createChildren();
	},
	
	setValue: function(val) {
		this.model.set("value", val);
	},
	
	createChildren: function() {
		// TODO: all this should be static
		// sw: step mark width in px
		var p = { w: 24, h: 24, s1: 1.2, s2: 1.1, sw: 3 };
		p.r1 = p.r2 = ((Math.min(p.w, p.h) - Math.max(p.s1, p.s2)) / 2) - 1;
		
		// circumferences in px
		p.c1 = p.r1 * Math.PI * 2;
		p.c2 = p.r2 * Math.PI * 2;
		// rotate CCW ( 90 + half a step mark, in degrees ) so that
		// the arc starts from the top and step gaps appear centered
		p.sr = ((p.sw / 2) / p.r1) * (180/Math.PI) - 90;
		
		this.el.innerHTML = this.template(p);
		
		// store params for updates
		this._params = p;
		this._updateDelay = 200;
		
		this.labelEl = this.el.querySelector("#step-label");
		this.amountShape = this.el.querySelector("#amount");
		this.stepsShape = this.el.querySelector("#steps");
		
		var s, total = this.model.get("total");
		
		s = this.stepsShape.style;
		s.strokeDasharray = [(p.c2 / total) - p.sw, p.sw];
		s.strokeOpacity = 0.3;
		// this.stepsShape.style.strokeDasharray = [p.sw, (p.c2 / total) - p.sw];
		// this.stepsShape.style.strokeDashoffset = p.sw;
		s = this.amountShape.style;
		s.strokeDasharray = [p.c1 - p.sw, p.c1 + p.sw];
		s.strokeDashoffset = p.c1;
	},
	
	render: function () {
		if (this._valueInvalid) {
			var value = this.model.get("value");
			var total = this.model.get("total");
			this.amountShape.style.strokeDashoffset = (1 - (value/total)) * this._params.c1;
		}
		return this;
	}
});

//// template values sandbox
// p = { w: 30, h: 30, s1: 1.5, s2: 1.4 };
// p.sw = Math.max(p.s1, p.s2) * 1.5;
// p = { w: 100, h: 100, s1: 5, s2: 4.9, sw: 10 };
// for (var prop in p) p[prop] = Math.round(p[prop] * 10 * 10) / 10;
// console.log(p);
// p.r1 = p.r2 = ((Math.min(p.w, p.h) - Math.max(p.s1, p.s2)) / 2) - 1;

// p = { w: 24, h: 24, r1: 10, s1: 1.50, r2: 10, s2: 1.50, sw: 2 };
// p = { w: 32, h: 32, r1: 13.3, s1: 2, r2: 13.3, s2: 2, sw: 2.7 };
// p = { w: 37, h: 37, r1: 16, s1: 2, r2: 16, s2: 1.8, sw: 3 };

// p = { w: 24, h: 24, s1: 1.51, s2: 0.51, sw: 2.5 };
// p.r1 = ((Math.min(p.w, p.h) - p.s1) / 2) - 0.5;
// p.r2 = ((Math.min(p.w, p.h) - p.s2) / 2) - 0.5;
