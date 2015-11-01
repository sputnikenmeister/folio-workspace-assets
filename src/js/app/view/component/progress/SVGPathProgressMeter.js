/**
* @module app/view/component/progress/SVGPathProgressMeter
*/


/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/svg/arcData} */
var arcData = require("utils/svg/arcData");
/** @type {module:app/view/component/progress/AbstractProgressMeter} */
var AbstractProgressMeter = require("app/view/component/progress/AbstractProgressMeter");

/**
* @constructor
* @type {module:app/view/component/progress/SVGPathProgressMeter}
*/
var SVGPathProgressMeter = AbstractProgressMeter.extend({
	
	cidPrefix: "svgProgressMeter",
	/** @type {string} */
	className: "progress-meter svg-progress-meter",
	/** @type {Function} */
	template:  require("./SVGPathProgressMeter.hbs"),
	
	/** @override */
	defaults: {
		value: 0,
		total: 1,
		steps: 1,
		gap: Math.PI/16,
		// gap: 8 * (Math.PI/180), // x deg in radians
		labelFn: function(value, total, steps) {
			return ((value/total) * 100) | 0;
		},
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	initialize: function (options) {
		AbstractProgressMeter.prototype.initialize.apply(this, arguments);
		
		// steps
		this._steps = options.steps;
		this._arcGap = options.gap;
		this._arcStep = (1 / this._steps) * Math.PI * 2;
		
		this._labelFn = options.labelFn;
		this._arcOffset = 0;//Math.PI * 1.5;
		
		this.createChildren();
	},
	
	redraw: function(value) {
		var m, labelStr = this._labelFn(this._renderedValue, this._total, this._steps);
		if (this._labelStr != labelStr) {
			// if (m = /^(\d+)([hms])$/.exec(labelStr)) {
			// 	this.valueLabel.textContent = m[1];
			// 	this.symbolLabel.textContent = m[2];
			// } else {
				this.valueLabel.textContent = labelStr;
			// }
			this._labelStr = labelStr;
		}
		this.amountShape.style.strokeDashoffset = 
			(1 - (this._renderedValue/this._total)) * (this._params.c);
		return this;
	},
	
	createChildren: function() {
		var p = { d: 48, s1: 1.5, s2: 0.75, p1: "", p2: "" };
		var total = this._total;
		
		var r1 = (p.d - p.s1)/2 - 0.51, // amount radius
			r2 = (p.d - p.s2)/2 - 0.55; // steps radius
			
		var sa = this._arcGap;
		// var sa = Math.PI/16; // step gap angle in radians: 1/20 circumference
		var sw1 = sa * r1, // step gap width in px
			sw2 = sa * r2; // step gap width in px
		
		var a1 = (sa - Math.PI)/2, // start angle
			a2 = Math.PI*2 - sa; // arc span angle
		p.p1 = arcData([], a1, a2, r1, void 0, 0, 0).join(" ");
		p.p2 = arcData([], a1, a2, r2, void 0, 0, 0).join(" ");
		// p.c = (Math.PI*2 - sa) * (p.r);
		
		// keep template params
		this._params = p;
		
		this.el.innerHTML = this.template(p);
		
		this.valueLabel = this.el.querySelector("#label");
		
		this.amountShape = this.el.querySelector("#amount");
		this.stepsShape = this.el.querySelector("#steps");
		
		var s; // style
		s = this.stepsShape.style;
		// s.strokeOpacity = 0.5;
		
		s.strokeDasharray = [(this._arcStep * r2) - sw2, sw2];
		// s.strokeDasharray = [((r2 * Math.PI*2) / total) - sw2, sw2];
		
		// this.stepsShape.style.strokeDasharray = [p.sw2, (p.c / total) - p.sw2];
		// this.stepsShape.style.strokeDashoffset = p.sw2;
		
		p.c = this.amountShape.getTotalLength() + sw1;
		s = this.amountShape.style;
		s.strokeDasharray = [p.c - sw1, p.c + sw1];
		// s.strokeDasharray = [p.c, p.c];
		s.strokeDashoffset = p.c;
	},
	
	// /**
	// * @param {Number} a1 start radians
	// * @param {Number} a2 end radians
	// * @param {Number} r1 radius pixels
	// * @param {Number} r2 radius pixels
	// * @return {String} SVG path data
	// */
	// _arcPathData: function(a1, a2, r1, r2) {
	// 	var d = [];
	// 	
	// 	a2 = Math.min(a2, (Math.PI*2) - 0.0001);
	// 	a2 += a1;
	// 	
	// 	var x1 = Math.cos(a1),
	// 		y1 = Math.sin(a1),
	// 		x2 = Math.cos(a2),
	// 		y2 = Math.sin(a2),
	// 		f1 = Math.abs(a1 - a2) > Math.PI,
	// 		f2 = a1 < a2;
	// 	
	// 	d.push("M", x1*r1, y1*r1, "A", r1, r1, 0, f1|0, f2|0, x2*r1, y2*r1);
	// 	if (r2) {
	// 		// var r3 = Math.abs(r1 - r2);
	// 		// d.push("A", r3, r3, 0, 1, 0, x2*r2, y2*r2);
	// 		d.push("L", x2*r2, y2*r2);
	// 		d.push("A", r2, r2, 0, f1|0, (!f2)|0, x1*r2, y1*r2, "Z");
	// 	}
	// 	return d.join(" ");
	// },
});

module.exports = SVGPathProgressMeter;
