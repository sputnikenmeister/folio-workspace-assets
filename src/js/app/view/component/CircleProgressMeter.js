/**
* @module app/view/component/CircleProgressMeter
*/

/** @type {module:app/view/component/ProgressMeter} */
var ProgressMeter = require("./ProgressMeter");

var viewTemplate = require("./CircleProgressMeter.hbs");
// var _viewTemplate = (function() {
// 	// sw: step mark width in px
// 	var p = { r: 12, s1: 3, s2: 2.5, sw: 2.75 };
// 	// circumferences in px
// 	p.c = p.r * Math.PI * 2;
// 	// rotate CCW ( 90 + half a step mark, in degrees ) so that
// 	// the arc starts from the top and step gaps appear centered
// 	p.sr = ((p.sw / 2) / p.r) * (180/Math.PI) - 90;
// 	
// 	var res;
// 	var fn = function() {
// 		return res || (res = _viewTemplate(p));
// 	};
// 	fn.params = p;
// 	return fn;
// })();

module.exports = ProgressMeter.extend({
	
	/** @type {string} */
	className: ProgressMeter.prototype.className + " circle-progress-meter",
	/** @type {Function} */
	template: viewTemplate,
	
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
	
	createChildren: function() {
		var s, p, total = this.model.get("total");
		
		// sw: step mark width in px
		p = { r: 12, s1: 3, s2: 2.5, sw: 2.75 };
		// circumferences in px
		p.c = p.r * Math.PI * 2;
		// rotate CCW ( 90 + half a step mark, in degrees ) so that
		// the arc starts from the top and step gaps appear centered
		p.sr = ((p.sw / 2) / p.r) * (180/Math.PI) - 90;
		// keep template params
		this._params = p;
		
		this.el.innerHTML = this.template(p);
		
		this.labelEl = this.el.querySelector("#step-label");
		this.amountShape = this.el.querySelector("#amount");
		this.stepsShape = this.el.querySelector("#steps");
		// this.cicleGroup = this.el.querySelector("#cicle-group");
		
		s = this.stepsShape.style;
		s.strokeDasharray = [(p.c / total) - p.sw, p.sw];
		s.strokeOpacity = 0.3;
		// this.stepsShape.style.strokeDasharray = [p.sw, (p.c / total) - p.sw];
		// this.stepsShape.style.strokeDashoffset = p.sw;
		s = this.amountShape.style;
		s.strokeDasharray = [p.c - p.sw, p.c + p.sw];
		s.strokeDashoffset = p.c;
	},
	
	render: function () {
		if (this._valueInvalid) {
			var value = this.model.get("value");
			var total = this.model.get("total");
			this.amountShape.style.strokeDashoffset = (1 - (value/total)) * this._params.c;
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
