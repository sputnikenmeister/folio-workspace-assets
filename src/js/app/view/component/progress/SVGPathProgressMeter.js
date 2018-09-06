/**
 * @module app/view/component/progress/SVGPathProgressMeter
 */


// /** @type {module:underscore} */
// var _ = require("underscore");

// /** @type {module:app/control/Globals} */
// var Globals = require("app/control/Globals");
/** @type {module:utils/svg/arcData} */
var arcData = require("utils/svg/arcData");
/** @type {module:app/view/component/progress/ModelProgressMeter} */
var ModelProgressMeter = require("app/view/component/progress/ModelProgressMeter");

/**
 * @constructor
 * @type {module:app/view/component/progress/SVGPathProgressMeter}
 */
var SVGPathProgressMeter = ModelProgressMeter.extend({

	cidPrefix: "svgProgressMeter",
	/** @type {string} */
	className: "progress-meter svg-progress-meter",
	/** @type {Function} */
	template: require("./SVGPathProgressMeter.hbs"),

	/** @override */
	defaults: {
		values: {
			amount: 0,
			available: 0,
			_loop: 0,
		},
		maxValues: {
			amount: 1,
			available: 1,
		},
		// amount: 0,
		// available: 0,
		// total: 1,
		// steps: 1,
		gap: Math.PI / 16,
		// gap: 8 * (Math.PI/180), // x deg in radians
		labelFn: function(value, total, steps) {
			return ((value / total) * 100) | 0;
		},
	},
	defaultKey: "amount",
	interpolated: ["amount", "available"],

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	/** @override */
	initialize: function(options) {
		// !Array.isArray(options.available) && (options.available = [options.available]);
		ModelProgressMeter.prototype.initialize.apply(this, arguments);

		// steps
		// var val = this._valueData["available"]._value;
		// this._steps = Array.isArray(val)? val.length: 0;
		// this._steps = options.steps;

		this._gapArc = options.gap;
		this._labelFn = options.labelFn;

		this.createChildren();
	},

	createChildren: function() {
		var p; // reuse this var for shapeData objects
		var maxRadius = 48; // svg viewbox diameter
		var startArc = (this._gapArc - Math.PI) / 2; // start angle (half-gap)
		var totalArc = Math.PI * 2 - (this._gapArc); // arc span angle

		this._shapeData = {
			total: {
				strokeWidth: 2.50,
				offset: 4.00
			},
			// available:		{ strokeWidth: 3.50, offset: 5.00 },
			steps: {
				strokeWidth: 6.00,
				offset: 4.00
			},
			amountClear: {
				strokeWidth: 6.00,
				offset: 4.00
			},
			amount: {
				strokeWidth: 1.00,
				offset: 4.00
			},
		};
		for (var key in this._shapeData) {
			p = this._shapeData[key];
			p.radius = maxRadius * 0.5 - p.offset;
			p.spanArc = totalArc;
			p.spanLength = p.spanArc * p.radius;
			p.pathData = arcData([], startArc, p.spanArc, p.radius, void 0, 0, 0).join(" ");
		}
		this._shapeData.viewSize = maxRadius;

		// available
		// --------------------------------
		var stepsNum = this._valueData["available"].length || 1;
		var stepBaseArc = (1 / stepsNum) * Math.PI * 2; // step angle span (no gap)
		var stepStartArc = startArc; // step start initial value (90deg CCW + half-gap CW)

		p = this._shapeData["available"] = {
			strokeWidth: 3.50,
			offset: 5.00
		};
		p.radius = maxRadius * 0.5 - p.offset;
		p.spanArc = stepBaseArc - this._gapArc; // step angle span (minus gap)
		p.spanLength = p.spanArc * p.radius;
		p.pathData = [];
		for (var i = 0; i < stepsNum; i++) {
			p.pathData[i] = arcData([], stepStartArc, p.spanArc, p.radius, void 0, 0, 0).join(" ");
			stepStartArc += stepBaseArc;
		}

		this.el.innerHTML = this.template(this._shapeData);
		this.labelShape = this.el.querySelector("#label");

		p = this._shapeData["steps"];
		p.shape = this.el.querySelector("#steps");
		p.shape.style.strokeDashoffset = p.radius * this._gapArc;
		p.shape.style.strokeDasharray = [
			p.radius * this._gapArc,
			p.radius * (stepBaseArc - this._gapArc)
		];
		// p.shape.style.strokeOpacity = 0.5;
		// p.shape.style.stroke = "#0000cc";
		// p.shape.style.strokeWidth = 10;

		p = this._shapeData["available"];
		p.shape = this.el.querySelector("#available");
		p.shape.style.strokeDashoffset = 0;
		p.shape.style.strokeDasharray = [p.spanLength, p.spanLength];
		// p.shape.style.strokeOpacity = 0.3;
		// p.shape.style.stroke = "#cc0000";
		// p.shape.style.strokeWidth = 10;

		p = this._shapeData["amountClear"];
		p.shape = this.el.querySelector("#amountClear");
		// p.shape.style.strokeDashoffset = p.radius * (p.spanArc + this._gapArc * 0.5);
		// p.shape.style.strokeDashoffset = p.radius * p.spanArc;
		p.shape.style.strokeDashoffset = p.spanLength;
		p.shape.style.strokeDasharray = [
			p.radius * (p.spanArc - this._gapArc * 0.5),
			p.radius * (p.spanArc + this._gapArc * 0.5)
		];
		p.shape.style.strokeLinecap = "square";
		// p.shape.style.stroke = "#6666FF";
		// p.shape.style.strokeOpacity = 0.75;

		p = this._shapeData["amount"];
		p.shape = this.el.querySelector("#amount");
		p.shape.style.strokeDashoffset = p.spanLength;
		p.shape.style.strokeDasharray = [p.spanLength, p.spanLength];
		// p.shape.style.stroke = "#999999";
		// p.shape.style.strokeOpacity = 0.8;
		// p.shape.style.strokeWidth = 10;
	},

	redraw: function() {
		var o, p, pChild, val;

		// update "available"
		o = this._valueData["available"];
		p = this._shapeData["available"];
		if (Array.isArray(o)) {
			for (var i = 0, ii = o.length; i < ii; i++) {
				pChild = p.shape.children[i];
				pChild.style.strokeDashoffset = -(o[i]._renderedValue / (o[i]._maxVal / ii)) * p.spanLength;
				// (1 - (o._renderedValue[i]/o._maxVal)) * (p.spanArc*p.radius);
				// console.log("%s::redraw available[%i]: %f/%f (value/rendered)", this.cid, i, o._value[i], o._renderedValue[i]);
			}
		} else {
			pChild = p.shape.children[0];
			pChild.style.strokeDashoffset = -(o._renderedValue / o._maxVal) * p.spanLength;
			// (1 - (o._renderedValue/o._maxVal)) * (p.spanArc*p.radius);
		}

		// update "amount"
		o = this._valueData["amount"];
		val = 1 - (o._renderedValue / o._maxVal);
		p = this._shapeData["amountClear"];
		p.shape.style.strokeDashoffset = (val * p.spanLength) - (p.radius * this._gapArc * 0.5);
		p = this._shapeData["amount"];
		p.shape.style.strokeDashoffset = val * p.spanLength;

		// update label usign "amount" value
		// TODO: generalize passing values to fn
		val = this._labelFn(o._renderedValue, o._maxVal, this._steps);
		if (this._renderedLabel != val) {
			this._renderedLabel = val;
			this.labelShape.textContent = val;
		}
		return this;
	},
});

module.exports = SVGPathProgressMeter;
