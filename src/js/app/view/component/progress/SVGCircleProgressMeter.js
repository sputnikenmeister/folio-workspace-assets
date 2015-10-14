/* global Path2D */
/**
* @module app/view/component/progress/SVGCircleProgressMeter
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:underscore} */
var Color = require("color");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:utils/prefixedProperty} */
var prefixed = require("utils/prefixedProperty");
/** @type {module:utils/svg/arcData} */
var arcData = require("utils/svg/arcData");
/** @type {module:utils/ease/linear} */
var linear = require("utils/ease/linear");

// /** @type {module:app/view/base/View} */
// var View = require("app/view/base/View");
/** @type {module:app/view/base/View} */
var AbstractProgressMeter = require("app/view/component/progress/AbstractProgressMeter");

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
		
		// this.setOptions(_.defaults(options, this.defaults));
		// options = _.defaults(options, this.defaults);
		
		// // value total
		// this._value = options.value;
		// this._total = options.total;
		// 
		// this._startValue = this._value;
		// this._renderedValue = null;
		// this._valueDelta = 0;
		// 
		// // value change flag
		// this._valueChanged = true;
		
		// steps
		this._steps = options.steps;
		this._arcGap = options.gap;
		this._arcStep = (1 / this._steps) * Math.PI * 2;
		
		this._labelFn = options.labelFn;
		this._arcOffset = 0;//Math.PI * 1.5;
		
		// // private easing state
		// this._duration = 0;
		// this._startTime = -1;
		// this._nextRafId = -1;
		// // this._lastRafId = -1;
		
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
		
		this.labelEl = this.el.querySelector("#step-label");
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
	
	// remove: function() {
	// 	this._duration = 0;
	// 	if (this._nextRafId !== -1) {
	// 		this.cancelAnimationFrame(this._nextRafId);
	// 	}
	// 	return View.prototype.remove.apply(this, arguments);
	// },
	
	/* --------------------------- *
	/* public interface
	/* --------------------------- */
	
	// valueTo: function (value, duration) {
	// 	// console.log("%s::valueTo(%f, %i)", this.cid, value, duration);
	// 	this._duration = duration || 0;
	// 	this._setValue(value);
	// },
	// 
	// _setValue: function(value) {
	// 	var oldValue = this._value;
	// 	
	// 	this._value = value;
	// 	this._valueDelta = value - oldValue;
	// 	this._startValue = oldValue;
	// 	
	// 	this._valueChanged = true;
	// 	this.render();
	// },
	
	/* --------------------------- *
	/* render
	/* --------------------------- */
	
	// /** @override */
	// render: function () {
	// 	if (this._valueChanged) {
	// 		this._valueChanged = false;
	// 		
	// 		this._startTime = -1;
	// 		if (this._nextRafId === -1) {
	// 			this._nextRafId = this.requestAnimationFrame(this.renderFrame);
	// 		}
	// 		// console.log("%s::render() [NEXT: %i]", this.cid, this._nextRafId);
	// 	}
	// 	return this;
	// },
	
	/* --------------------------- *
	/* private
	/* --------------------------- */
	
	// renderFrame: function(tstamp) {
	// 	if (this._startTime < 0) {
	// 		this._startTime = tstamp;
	// 	}
	// 	// var currRafId = this._nextRafId;
	// 	var currTime = tstamp - this._startTime;
	// 	
	// 	if (currTime < this._duration) {
	// 		if (this._valueDelta < 0) {
	// 			this._renderedValue = linear(currTime, this._startValue,
	// 				this._valueDelta + this._total, this._duration) - this._total;
	// 		} else {
	// 			this._renderedValue = linear(currTime, this._startValue,
	// 				this._valueDelta, this._duration);
	// 		}
	// 		this.redraw();
	// 		this._nextRafId = this.requestAnimationFrame(this.renderFrame);
	// 		// console.log("%s::update(%f) [RAF: %i] [NEXT: %i] from/to: %f/%f, curr: %f",
	// 		// 	this.cid, tstamp, currRafId, this._nextRafId,
	// 		// 	this._startValue, this._value, this._renderedValue);
	// 	} else {
	// 		this._renderedValue = this._value;
	// 		this.redraw();
	// 		this._nextRafId = -1;
	// 		// console.log("%s::update(%f) [RAF: %i] [LAST] from/to: %f/%f",
	// 		// 	this.cid, tstamp, currRafId,
	// 		// 	this._startValue, this._value );
	// 	}
	// },
	
	redraw: function(value) {
		var labelValue = this._labelFn(this._renderedValue, this._total, this._steps);
		if (this._labelValue != labelValue) {
			this.labelEl.textContent = this._labelValue = labelValue;
		}
		this.amountShape.style.strokeDashoffset = 
			(1 - this._renderedValue / this._total) * (this._params.c - this._params.sw);
	},
});

module.exports = SVGCircleProgressMeter;
