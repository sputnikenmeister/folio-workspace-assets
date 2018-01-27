/**
 * @module app/view/component/GraphView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
/** @type {Function} */
var Color = require("color");

/** @type {module:app/view/base/View} */
var CanvasView = require("app/view/base/CanvasView");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");

/** @type {module:app/model/collection/TypeCollection} */
var types = require("app/model/collection/TypeCollection");
/** @type {module:app/model/collection/KeywordCollection} */
var keywords = require("app/model/collection/KeywordCollection");
/** @type {module:app/model/collection/BundleCollection} */
var bundles = require("app/model/collection/BundleCollection");
/** @type {module:utils/canvas/drawArcHConnector} */
var drawArcHConnector = require("utils/canvas/drawArcHConnector");

var BEZIER_CIRCLE = 0.551915024494;
var MIN_CANVAS_RATIO = 2;
var PI2 = Math.PI * 2;

function crosshair(ctx, x, y, r, s) {
	ctx.save();
	// if (s) {
	//   setStyle(s);
	// }
	// if (s && styles[s].style != "vertical") {
	ctx.translate(x, y);
	ctx.rotate(Math.PI / 4);
	// }
	ctx.beginPath();
	ctx.moveTo(0, -r);
	ctx.lineTo(0, r);
	ctx.moveTo(-r, 0);
	ctx.lineTo(r, 0);
	ctx.stroke();
	ctx.restore();
}

function circle(ctx, x, y, r, stroked, s) {
	// ctx.save();
	// if (s) setStyle(s);
	ctx.beginPath();
	ctx.arc(x, y, r, 0, PI2);
	ctx.closePath();
	if (stroked) ctx.stroke();
	else ctx.fill();
	// ctx.restore();
}

function square(ctx, x, y, r, stroked, s) {
	r = Math.floor(r / 2) * 2;
	if (!stroked) r += 0.5;
	// ctx.save();
	// if (s) setStyle(s);
	ctx.beginPath();
	ctx.rect(x - r, y - r, r * 2, r * 2);
	if (stroked) ctx.stroke();
	else ctx.fill();
	// ctx.restore();
}

function arrowhead(ctx, x, y, r, a, stroked, s) {
	ctx.save();
	// if (s) {
	//   setStyle(s);
	// }
	if (r < 10) {
		ctx.setLineDash([]);
	}
	ctx.translate(x, y);
	ctx.rotate(a || 0);
	ctx.beginPath();
	ctx.moveTo(0, 0);
	// ctx.lineTo(-r, r * Math.SQRT1_2);
	// ctx.lineTo(-r, -r * Math.SQRT1_2);

	ctx.lineTo(-r * Math.SQRT2, r * Math.SQRT1_2);
	ctx.arcTo(0, 0, -r * Math.SQRT2, -r * Math.SQRT1_2, r);
	ctx.lineTo(0, 0);
	if (stroked) ctx.stroke();
	else ctx.fill();
	ctx.restore();
}

/**
 * @constructor
 * @type {module:app/view/component/GraphView}
 */
var GraphView = CanvasView.extend({

	/** @type {string} */
	cidPrefix: "graph",
	/** @override */
	tagName: "canvas",
	/** @override */
	className: "graph",
	// /** @override */
	// model: Backbone.Model,

	/** @override */
	initialize: function(options) {
		CanvasView.prototype.initialize.apply(this, arguments);

		this._styleData = {};
		this._listMetrics = {};
		this._listA = options.listA;
		this._listB = options.listB;
	},

	/** @override */
	updateCanvas: function(context) {
		this._updateMetrics();
		this._updateStyles();
	},

	/* --------------------------- *
	/* styles
	/* --------------------------- */

	_updateStyles: function() {
		var bgColor = this.model.get("withBundle") ? this.model.get("bundle").colors.bgColor : Color(Globals.DEFAULT_COLORS["background-color"]);

		var colorStr1;
		var styleBase = {
			radiusBase: 6,
			radiusIncrement: 4,
			margin: 12,
		};

		colorStr1 = Color(this._color).mix(bgColor, 0.5).hexString();
		this._styleData["default"] = _.defaults({
			lineWidth: 0.7, //0.7,
			radiusBase: 12, //12,
			radiusIncrement: 3, //1, //3,
			strokeStyle: colorStr1,
			fillStyle: colorStr1,
		}, styleBase);

		this._styleData["hairline"] = _.defaults({
			lineWidth: 0.5,
			strokeStyle: this._color,
		}, styleBase);

		colorStr1 = Color(this._color).alpha(0.2).rgbaString();
		// colorStr1 = Color(this._color).mix(bgColor, 0.2).hexString();
		this._styleData["thick"] = _.defaults({
			lineWidth: 2.4, //3,
			radiusBase: 12,
			radiusIncrement: 3, //3.25,
			strokeStyle: colorStr1,
			fillStyle: colorStr1,
		}, styleBase);

		this._styleData["debugRed"] = _.defaults({
			lineWidth: 0.5,
			// strokeStyle: "#ff0000",
			strokeStyle: "rgba(255,127,127,0.75)",
		}, styleBase);
		this._styleData["debugBlue"] = _.defaults({
			lineWidth: 0.5,
			// strokeStyle: "#0000ff",
			strokeStyle: "rgba(127,127,255,0.75)",
		}, styleBase);
	},

	/* --------------------------- *
	/* metrics
	/* --------------------------- */

	_updateMetrics: function() {
		var bounds = this.el.getBoundingClientRect();
		this._ctx.setTransform(this._canvasRatio, 0, 0, this._canvasRatio, -bounds.left * this._canvasRatio - 0.5, -bounds.top * this._canvasRatio - 0.5);

		var listView, listRect, listPos;

		listView = this._listA;
		listRect = listView.el.getBoundingClientRect();
		this._rectA = listRect;
		this._minA = listRect.left + listRect.width;

		listView = this._listB;
		listRect = listView.el.getBoundingClientRect();
		this._rectB = listRect;
		this._minB = listRect.left;

		// connector minimum branch x2
		var i, ii, view, rect;
		for (i = 0, ii = listView.groups.length; i < ii; i++) {
			view = listView.itemViews.findByModel(listView.groups[i]);
			rect = (view.label || view.el).getBoundingClientRect();
			this._minB = Math.min(this._minB, rect.left);
			// if (view._metrics) this._rectB.left + view.transform.tx + view._metrics.textLeft;
		}
	},

	/* --------------------------- *
	/* redraw
	/* --------------------------- */

	redraw: function(context, interpolator) {
		this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeigth);
		context.save();
		// this._redraw_fromViews(context, interpolator);
		this._redraw_fromElements(context, interpolator);
		context.restore();
	},

	_redraw_fromElements: function(context, interpolator) {
		var i, els, numEls;
		var elA, elB, rectA, rectB, xMin1, xMin2;

		var x1, y1, x2, y2;
		var cx1, cy1, r1;
		var cx2, cy2, r2;
		// var cx0, cy0, r0;

		var s, rInc, rBase, xMargin; // connector-to-element margin in px

		// /* Vertical left guide */
		// this._setStyle(this._styleData["debugRed"]);
		// context.beginPath();
		// context.moveTo(this._minA, 0);
		// context.lineTo(this._minA, this._rectA.top + this._rectA.height);
		// context.stroke();

		// /* Vertical right guide */
		// this._setStyle(this._styleData["debugBlue"]);
		// context.beginPath();
		// context.moveTo(this._minB, 0);
		// context.lineTo(this._minB, this._rectB.top + this._rectB.height);
		// context.stroke();

		// keyword to bundles, right to left
		elB = this._listB.el.querySelector(".list-item.selected .label");
		if (elB) {
			s = this._styleData["default"];
			rInc = s.radiusIncrement;
			rBase = s.radiusBase;
			xMargin = s.margin;
			this._setStyle(s);

			els = this._listA.el.querySelectorAll(".list-item:not(.excluded) .label");
			numEls = els.length;

			xMin1 = this._minB;
			xMin2 = this._minA;
			rectB = elB.getBoundingClientRect();
			x1 = rectB.left - xMargin;
			y1 = rectB.top + rectB.height / 2;
			r2 = rBase;
			cx1 = Math.min(x1, xMin1); // - xMargin);
			/*
			// r0 = rInc;
			// cx0 = x1 - r0;
			// cx0 = x1 - (rBase + numEls * rInc);

			// var elsPos, maxDistIdx;
			// elsPos = [];
			// for (i = 0; i < numEls; i++) {
			// 	rectA = els.item(i).getBoundingClientRect();
			// 	x2 = rectA.left + rectA.width + xMargin;
			// 	y2 = rectA.top + rectA.height / 2;
			// 	elsPos[i] = { x: x2, y: y2 };
			// }
			// for (i = 0; i < numEls; ) {
			// 	if (y1 < elsPos[i].y) break;
			// 	else i++;
			// }
			// var maxDist = Math.max(i, (numEls - 1) - i);
			// console.log("%s::_redraw_fromElements maxDist: %i (index: %i/%i)", this.cid, maxDist, i, numEls);
			*/

			for (i = 0; i < numEls; i++) {
				// if (els.item(i) === elA) continue;
				rectA = els.item(i).getBoundingClientRect();
				x2 = rectA.left + rectA.width + xMargin;
				cx2 = Math.max(x2, xMin2 + xMargin);
				y2 = rectA.top + rectA.height / 2;
				// x2 = elsPos[i].x;
				// y2 = elsPos[i].y;
				if (y1 > y2) {
					r1 = rBase + i * rInc;
				} else {
					r1 = rBase + (numEls - (i + 1)) * rInc;
				}
				cy1 = y1 + (i - (numEls - 1) / 2) * rInc;
				cy2 = y2;

				context.beginPath();
				// context.moveTo(x1, y1);
				// drawArcHConnector(context, x1, y1, x1 - rInc, cy1, 0, rInc);
				context.moveTo(x1, cy1);
				// drawArcHConnector(context, cx1, cy1, cx2, cy2, r1, r2, 1);
				drawArcHConnector(context, cx1, cy1, cx2 - (r1 - r2), cy2, r1, r2, 1);
				context.lineTo(x2, cy2);
				/* reverse dir */
				// context.moveTo(x2, cy2);
				// drawArcHConnector(context, cx2, cy2, cx1, cy1, r2, r1);
				// context.lineTo(x1, cy1);
				context.stroke();

				// this._setStyle(this._styleData["debugBlue"]);
				// arrowhead(this._ctx, x2, cy2, 5, Math.PI);
				// // circle(this._ctx, x1, cy1, 4, true);
				// // square(this._ctx, x2, cy2, 4, true);
				// crosshair(this._ctx, cx1, cy1, 5);
				// crosshair(this._ctx, cx2, cy2, 5);
				// this._setStyle(s);
			}

		}

		// bundle to keywords, left to right
		elA = this._listA.el.querySelector(".list-item.selected .label");
		if (elA) {
			s = this._styleData["thick"];
			rInc = s.radiusIncrement;
			rBase = s.radiusBase;
			xMargin = s.margin;
			this._setStyle(s);

			xMin1 = this._minA;
			xMin2 = this._minB;
			rectA = elA.getBoundingClientRect();
			x1 = rectA.left + rectA.width + xMargin;
			y1 = rectA.top + rectA.height / 2;
			cx1 = Math.max(x1, xMin1); // + xMargin);
			r2 = rBase;

			els = this._listB.el.querySelectorAll(".list-item:not(.excluded) .label");
			numEls = els.length;
			// r0 = rInc;
			// cx0 = x1 + r0;

			for (i = 0; i < numEls; i++) {
				rectB = els.item(i).getBoundingClientRect();
				x2 = rectB.left - xMargin;
				cx2 = Math.min(x2, xMin2 - xMargin);
				y2 = rectB.top + rectB.height / 2;
				if (y1 > y2) {
					r1 = rBase + i * rInc;
				} else {
					r1 = rBase + (numEls - (i + 1)) * rInc;
				}
				cy1 = y1 + (i - (numEls - 1) / 2) * rInc;
				cy2 = y2;

				context.beginPath();
				// context.moveTo(x1, y1);
				// drawArcHConnector(context, x1, y1, x1 + rInc, cy1, 0, rInc);
				context.moveTo(x1, cy1);
				// drawArcHConnector(context, cx1, cy1, cx2, cy2, r1, r2);
				drawArcHConnector(context, cx1, cy1, cx2 - (r2 - r1), cy2, r1, r2, 1);
				context.lineTo(x2, cy2);
				/* reverse dir */
				// context.moveTo(x2, cy2);
				// drawArcHConnector(context, cx2, cy2, cx1, cy1, r2, r1);
				// context.lineTo(x1, cy1);
				context.stroke();

				// this._setStyle(this._styleData["debugRed"]);
				// arrowhead(context, x2 + 4, cy2, 8, 0);
				// // circle(context, x1, cy1, 4, true);
				// crosshair(context, cx2, cy2, 4, true);
				//
				// // crosshair(context, x1, cy1, 5);
				// // circle(context, cx1, cy1, 4, true);
				// // crosshair(context, cx2, cy2, 5);
				// this._setStyle(s);
			}
		}
	},

	_redraw_fromViews: function(context, interpolator) {
		var i, numItems, view, rect, model, mCids;

		var xMid = (this._minA + this._minB) / 2;
		var yMin = Math.min(this._rectA.top, this._rectB.top);
		var yMax = Math.max(this._rectA.top + this._rectA.height, this._rectB.top + this._rectB.height);
		var dx = Math.abs(this._minA - this._minB);

		var s = this._styleData["default"];
		var roInc = s.radiusIncrement;
		var m = s.margin; // connector-to-element margin in px

		var rr = 0.6; // r1 to r2 ratio
		var r1, r2;
		r1 = (dx / 4) * rr;
		r2 = (dx / 4) * (1 / rr);
		r1 = Math.floor(r1);
		r2 = Math.floor(r2);

		var x1, y1, x2, y2; // connector start/end
		var cx1, cy1, cx2, cy2; // connector anchors
		var xMin1, xMin2;
		var ro; // radius offset

		xMin1 = this._minA;
		xMin2 = this._minB;

		this._setStyle(s);

		// context.save();
		// context.beginPath();
		// context.moveTo(this._minA, yMin);
		// context.lineTo(this._minA, yMax);
		// context.moveTo(this._minB, yMin);
		// context.lineTo(this._minB, yMax);
		// context.moveTo(x1 + r1, yMin);
		// context.lineTo(x1 + r1, yMax);
		// context.lineWidth = 1;
		// context.strokeStyle = "hsla(0, 50%, 50%, 0.2)";
		// context.stroke();
		// context.restore();

		// bundle to keywords
		if (model = this.model.get("bundle")) {
			view = this._listA.itemViews.findByModel(model);
			if (view._metrics) {
				mCids = model.get("kIds");
				numItems = mCids.length;

				x1 = this._rectA.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
				y1 = this._rectA.top + view.transform.ty + view._metrics.offsetHeight / 2;
				cx1 = Math.max(x1, xMin1);
				ro = mCids.length * roInc * 0.5;

				// context.setLineDash([1,1]);
				for (i = 0; i < numItems; i++) {
					view = this._listB.itemViews.findByModel(keywords.get(mCids[i]));
					if (view._metrics) {
						x2 = this._rectB.left + view.transform.tx + view._metrics.textLeft;
						y2 = this._rectB.top + view.transform.ty + view._metrics.offsetHeight / 2;
						cx2 = Math.min(x2, xMin2);
						cy1 = y1 + i * roInc;
						cy2 = y2; // - i*roInc;
						ro += y1 > y2 ? roInc : -roInc;

						context.beginPath();
						context.moveTo(x1, cy1);
						drawArcHConnector(context, cx1, cy1, cx2, cy2, r1 + ro, r2 - ro);
						context.lineTo(x2, cy2);
						context.stroke();
					}
				}
			}
		}

		xMin1 = this._minB;
		xMin2 = this._minA;

		// keyword to bundles
		if (model = this._listB.collection.selected) {
			view = this._listB.itemViews.findByModel(model);
			if (view._metrics) {
				mCids = model.get("bIds");
				numItems = mCids.length;

				x1 = this._rectB.left + view.transform.tx + view._metrics.textLeft;
				y1 = this._rectB.top + view.transform.ty + view._metrics.offsetHeight / 2;
				cx1 = Math.min(x1, xMin1);
				ro = mCids.length * roInc * 0.5;

				// context.setLineDash([]);
				for (i = 0; i < numItems; i++) {
					view = this._listA.itemViews.findByModel(this._listA.collection.get(mCids[i]));
					if (view._metrics) {
						x2 = this._rectA.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
						y2 = this._rectA.top + view.transform.ty + view._metrics.offsetHeight / 2;
						cx2 = Math.max(x2, xMin2);
						cy1 = y1 + i * roInc;
						cy2 = y2; // + i*roInc;
						ro += y1 > y2 ? roInc : -roInc;

						context.beginPath();
						context.moveTo(x1, cy1);
						drawArcHConnector(context, cx1, cy1, cx2, cy2, r1 + ro, r2 - ro);
						context.lineTo(x2, cy2);
						context.stroke();
					}
				}
			}
		}
	},

	_setStyle: function(s) {
		var ctx = this._ctx;
		if (typeof s == "string") {
			s = this._styleData[s];
		}
		if (typeof s == "object") {
			for (var p in s) {
				switch (typeof ctx[p]) {
					case "undefined":
						break;
					case "function":
						if (Array.isArray(s[p])) ctx[p].apply(ctx, s[p]);
						else ctx[p].call(ctx, s[p]);
						break;
					default:
						ctx[p] = s[p];
				}
			}
		}
	},

	_measureListItems: function(listView) {
		var listRect, retval;

		listRect = listView.el.getBoundingClientRect();
		retval = listView.itemViews.map(function(view, i) {
			return {
				cid: view.id,
				before: listRect.left + view.transform.tx + view._metrics.textLeft,
				after: listRect.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth,
				y: listRect.top + view.transform.ty + view._metrics.offsetHeight / 2,
			};
		}, this);
		retval.sort(function(a, b) {
			if (a.y > b.y) return 1;
			if (a.y < b.y) return -1;
			return 0;
		});
		retval.before = listRect.left;
		retval.after = listRect.left + listRect.width;
		return retval;
	},

});

module.exports = GraphView;
