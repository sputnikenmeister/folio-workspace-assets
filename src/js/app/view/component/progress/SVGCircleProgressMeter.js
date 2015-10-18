/* global Path2D */
/**
* @module app/view/component/progress/SVGCircleProgressMeter
*/

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/view/component/progress/AbstractProgressMeter} */
var AbstractProgressMeter = require("app/view/component/progress/AbstractProgressMeter");

/**
* @constructor
* @type {module:app/view/component/progress/SVGCircleProgressMeter}
*/
var SVGCircleProgressMeter = AbstractProgressMeter.extend({
	
	/** @type {string} */
	cidPrefix: "svgProgressMeter",
	/** @type {string} */
	className: "progress-meter svg-progress-meter",
	/** @type {Function} */
	template:  require("./SVGCircleProgressMeter.hbs"),
	
	/** @override */
	defaults: {
		value: 0,
		total: 1,
		steps: 1,
		gap: 8 * (Math.PI/180), // x deg in radians
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
	
	createChildren: function() {
		var s, p, total = this._total;
		
		// sw: step mark width in px
		// p = { d: 24, s1: 1.6, s2: 1.4, sw: 2.75 };
		p = { d: 48, s1: 1.9, s2: 0.75, sw: 5 };
		// circumferences in px
		p.r = ((p.d - Math.max(p.s1, p.s2)) / 2) - 0.5; // allow 1/2 pixel around circles
		p.c = p.r * Math.PI * 2;
		
		// rotate CCW ( 90 + half a step mark, in degrees ) so that
		// the arc starts from the top and step gaps appear centered
		p.sr = ((p.sw / 2) / p.r) * (180/Math.PI) - 90;
		// keep template params
		this._params = p;
		
		this.el.innerHTML = this.template(p);
		
		this.valueLabel = this.el.querySelector("#value-label");
		this.symbolLabel = this.el.querySelector("#symbol-label");
		
		this.amountShape = this.el.querySelector("#amount");
		this.stepsShape = this.el.querySelector("#steps");
		
		s = this.stepsShape.style;
		s.strokeOpacity = 0.5;
		s.strokeDasharray = [(this._arcStep * p.r) - p.sw, p.sw];
		// s.strokeDasharray = [(p.c / total) - p.sw, p.sw];
		
		// this.stepsShape.style.strokeDasharray = [p.sw, (p.c / total) - p.sw];
		// this.stepsShape.style.strokeDashoffset = p.sw;
		
		s = this.amountShape.style;
		s.strokeDasharray = [p.c - p.sw, p.c + p.sw];
		s.strokeDashoffset = p.c - p.sw;
	},
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	// /** @override */
	// render: function () {
	// 	return AbstractProgressMeter.prototype.render.apply(this, arguments);
	// },
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	redraw: function(value) {
		var m, labelStr = this._labelFn(this._renderedValue, this._total, this._steps);
		if (this._labelStr != labelStr) {
			if (m = /^(\d+)([hms])$/.exec(labelStr)) {
				this.valueLabel.textContent = m[1];
				this.symbolLabel.textContent = m[2];
			} else {
				this.valueLabel.textContent = labelStr;
			}
			this._labelStr = labelStr;
		}
		this.amountShape.style.strokeDashoffset = 
			(1 - this._renderedValue / this._total) * (this._params.c - this._params.sw);
			
		return this;
	},
});

module.exports = SVGCircleProgressMeter;
