/**
 * @module app/view/component/GraphView
 */

/** @type {module:underscore} */
var _ = require("underscore");
// /** @type {module:backbone} */
// var Backbone = require("backbone");

/** @type {Function} */
var Color = require("color");

/** @type {module:app/view/base/View} */
var CanvasView = require("app/view/base/CanvasView");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");

// /** @type {module:app/model/collection/TypeCollection} */
// var types = require("app/model/collection/TypeCollection");
// /** @type {module:app/model/collection/BundleCollection} */
// var bundles = require("app/model/collection/BundleCollection");
// /** @type {module:app/model/collection/KeywordCollection} */
// var keywords = require("app/model/collection/KeywordCollection");

/** @type {module:utils/canvas/calcArcHConnector} */
var calcArcHConnector = require("utils/canvas/calcArcHConnector");

/** @type {module:utils/geom/inflateRect} */
var inflateRect = require("utils/geom/inflateRect");

/** @type {module:utils/canvas/calcArcHConnector} */
var CanvasHelper = require("utils/canvas/CanvasHelper");

// var BEZIER_CIRCLE = 0.551915024494;
// var MIN_CANVAS_RATIO = 2;
// var PI2 = Math.PI * 2;

var styleBase = {
	lineCap: "butt", // round, butt, square
	lineWidth: 0.75,
	lineDashOffset: 0,
	setLineDash: [[]],
	radiusBase: 14, //6,
	radiusIncrement: 3, //4,
	outlineWidth: 4.5,
	// margin: 20,
};

// var _dStyles = {
// 	red: {
// 		lineWidth: 1,
// 		fillStyle: "rgba(255,127,127,0.75)",
// 		strokeStyle: "rgba(255,127,127,0.75)",
// 		lineDashOffset: 0,
// 		setLineDash: [[]]
// 	},
// 	blue: {
// 		lineWidth: 1,
// 		fillStyle: "rgba(127,127,255,0.75)",
// 		strokeStyle: "rgba(127,127,255,0.75)",
// 		lineDashOffset: 0,
// 		setLineDash: [[]]
// 	}
// };

function setStyle(ctx, s) {
	if (typeof s != "object") return;
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

	defaultKey: "amount",

	defaults: {
		values: {
			amount: 0,
			// available: 0,
			// _loop: 0,
		},
		maxValues: {
			amount: 1,
			// available: 1,
		},
		// useOpaque: true,
		// labelFn: function(value, max) {
		// 	return ((value / max) * 100) | 0;
		// },
	},

	/** @override */
	initialize: function(options) {
		CanvasView.prototype.initialize.apply(this, arguments);

		this._listA = options.listA;
		this._listB = options.listB;
		this._a2b = {
			srcView: options.listA,
			destView: options.listB,
			s: _.defaults({
				lineWidth: 1.5
			}, styleBase),
			strokeStyleFn: function(fg, bg, ln) {
				return Color(ln).mix(bg, 0.9).hexString();
				// return Color(fg).mix(bg, 0.9).hexString();
			}
		};
		this._b2a = {
			srcView: options.listB,
			destView: options.listA,
			s: _.defaults({
				lineWidth: 0.7,
				// radiusIncrement: 1,
				// outlineWidth: 6,
			}, styleBase),
			strokeStyleFn: function(fg, bg, ln) {
				return Color(fg).mix(bg, 0.8).hexString();
			}
		};
		this.listenTo(this, "view:render:before", this._beforeViewRender);
		// this._addListListeners(this._a2b);
		// this._addListListeners(this._b2a);
	},

	// _addListListeners: function(d) {
	// 	this.listenTo(d.srcView, {
	// 		"select:one": function(model) {
	// 			this.listenToOnce(d.destView, "view:render:after",
	// 				function(view) {
	// 					d.srcItem = d.srcView.collection.selected;
	// 					d.destItems = d.destView.filteredItems;
	// 				});
	// 		},
	// 		"select:none": function() {
	// 			d.srcItem = d.destItems = null;
	// 		}
	// 	});
	// },

	/** @override */
	updateCanvas: function(ctx) {
		this._updateMetrics();
		this._updateStyles();
	},

	/* --------------------------- *
	/* styles
	/* --------------------------- */

	_updateStyles: function() {
		var b, bgColor, lnColor; //, altBgColor;
		if (this.model.get("withBundle")) {
			b = this.model.get("bundle");
			lnColor = b.colors.lnColor.clone();
			bgColor = b.colors.bgColor.clone();
			// altBgColor = b.attrs["--alt-background-color"];
		} else {
			bgColor = Color(Globals.DEFAULT_COLORS["background-color"]);
			lnColor = Color(Globals.DEFAULT_COLORS["--link-color"]);
		}
		// bgColor = Color(window.getComputedStyle(this.el).getPropertyValue("background-color"));
		// console.log("%s::_updateStyles bg: %s", this.cid, window.getComputedStyle(this.el).getPropertyValue("background-color"));
		// var bgColor = this.model.get("withBundle") ? this.model.get("bundle").colors.bgColor : Color(Globals.DEFAULT_COLORS["background-color"]);
		// var lnColor = this.model.get("withBundle") ? this.model.get("bundle").colors.lnColor : Color(Globals.DEFAULT_COLORS["--link-color"]);
		// var altBgColor = this.model.get("bundle").attrs["--alt-background-color"];

		this._a2b.s.strokeStyle = this._a2b.s.fillStyle =
			this._a2b.strokeStyleFn(this._color, bgColor, lnColor);
		this._b2a.s.strokeStyle = this._b2a.s.fillStyle =
			this._b2a.strokeStyleFn(this._color, bgColor, lnColor)
	},

	_setStyle: function(s) {
		// var ctx = this._ctx;
		if (typeof s == "string") {
			s = this._styleData[s];
		}
		setStyle(this._ctx, s);
	},

	/* --------------------------- *
	/* metrics
	/* --------------------------- */

	_updateMetrics: function() {
		var bounds = this.el.getBoundingClientRect();
		this._ctx.setTransform(this._canvasRatio, 0, 0, this._canvasRatio, -bounds.left * this._canvasRatio - 0.5, -bounds.top * this._canvasRatio - 0.5);

		var i, ii, els;
		var aRect, bRect;
		var aMin, bMin;

		aRect = this._listA.el.getBoundingClientRect();
		aMin = aRect.left;
		els = this._listA.el.querySelectorAll(".label");
		for (i = 0, ii = els.length; i < ii; i++) {
			aMin = Math.max(aMin,
				els[i].getBoundingClientRect().right);
		}

		bRect = this._listB.el.getBoundingClientRect();
		bMin = bRect.left;
		els = this._listB.el.querySelectorAll(".label");
		for (i = 0, ii = els.length; i < ii; i++) {
			bMin = Math.min(bMin,
				els[i].getBoundingClientRect().left);
		}
		this._b2a.destRect = this._a2b.rect = aRect;
		this._b2a.destMinX = this._a2b.xMin = aMin;
		this._a2b.destRect = this._b2a.rect = bRect;
		this._a2b.destMinX = this._b2a.xMin = bMin;

		// var c = Math.abs(sData.xMin - dData.xMin) / 6;
		// sMin = sData.xMin + c * qx;
		// dMin = dData.xMin - c * qx;

		// this._a2b.targets = this._measureListItems(listView);
		// this._b2a.targets = this._measureListItems(listView);

		// // connector minimum branch x2
		// listView = this._listB;
		// for (i = 0, ii = listView.groups.length; i < ii; i++) {
		// 	itemView = listView.itemViews.findByModel(listView.groups[i]);
		// 	itemRect = (itemView.label || itemView.el).getBoundingClientRect();
		// 	this._b2a.xMin = Math.min(this._b2a.xMin, itemRect.left);
		// 	// if (itemView._metrics) this._b2a.rect.left + itemView.transform.tx + itemView._metrics.textLeft;
		// }
	},

	/* --------------------------- *
	/* redraw
	/* --------------------------- */

	_beforeViewRender: function(view, flags) {
		if (flags & (CanvasView.SIZE_INVALID | CanvasView.MODEL_INVALID)) {
			console.log("%s::_beforeViewRender [flags: %s]", this.cid, CanvasView.flagsToString(flags));

			this._a2b.pointsOut = this._a2b.points;
			this._a2b.maxLengthOut = this._a2b.maxLength;
			this._a2b.points = null;
			this._a2b.maxLength = null;

			this._b2a.pointsOut = this._b2a.points;
			this._b2a.maxLengthOut = this._b2a.maxLength;
			this._b2a.points = null;
			this._b2a.maxLength = null;

			this._groupRects = null;
		}
	},

	redraw: function(ctx, interpolator) {
		// console.log("%s::redraw [valuesChanged: %s]", this.cid, interpolator.valuesChanged);
		this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeight);
		ctx.save();
		this._redraw_fromElements(ctx, interpolator);
		// this._redraw_fromViews(ctx, interpolator);
		ctx.restore();
	},

	_drawConnectors: function(pp, s, lMax, lVal, dir) {
		var i, ii;
		if (pp && (ii = pp.length) && (lVal > 0)) {
			var ra1 = s.radiusIncrement + s.lineWidth;
			var ra2 = ra1 + (s.outlineWidth - s.lineWidth);
			this._setStyle(s);
			if (lVal < 1) {
				this._ctx.lineDashOffset = lMax * (1 + lVal);
				this._ctx.setLineDash([lMax, lMax]);
			}
			for (i = 0; i < ii; i++) {
				this._ctx.save();
				this._ctx.globalCompositeOperation = "destination-out";
				this._ctx.lineWidth = s.outlineWidth;
				// for (i = 0; i < ii; i++) {
				this._drawConnector(pp[i]);
				if (lVal == 1) {
					CanvasHelper.arrowhead(this._ctx, pp[i].x2, pp[i].y2, ra2, Math.PI * dir, true, s);
					// CanvasHelper.circle(this._ctx, pp[i].x2, pp[i].y2, 2.5, true, s);
				}
				// }
				this._ctx.restore();
				// for (i = 0; i < ii; i++) {
				this._drawConnector(pp[i]);
				if (lVal == 1) {
					CanvasHelper.arrowhead(this._ctx, pp[i].x2, pp[i].y2, ra1, Math.PI * dir, true, s);
					// CanvasHelper.circle(this._ctx, pp[i].x2, pp[i].y2, 1.5, true, s);
				}
				// }
			}
		}
	},

	_redraw_fromElements: function(ctx, interpolator) {
		// b2a: keyword to bundles, right to left
		// a2b: bundle to keywords, left to right
		if (this._b2a.points === null) {
			this._computeConnectors2(this._b2a); //, this._listB, this._listA);
		}
		if (this._a2b.points === null) {
			this._computeConnectors2(this._a2b); //, this._listA, this._listB);
		}

		/* line dash value interpolation */
		var lVal = interpolator._valueData["amount"]._renderedValue / interpolator._valueData["amount"]._maxVal;

		/* draw */
		this._drawConnectors(this._b2a.points, this._b2a.s,
			this._b2a.maxLength, lVal, 1);
		this._drawConnectors(this._b2a.pointsOut, this._b2a.s,
			this._b2a.maxLengthOut, 1 - lVal, 1);
		this._drawConnectors(this._a2b.points, this._a2b.s,
			this._a2b.maxLength, 1, 2);

		// clear some label backgrounds
		if (this._groupRects === null) {
			this._groupRects = [];
			var els = this._listB.el.querySelectorAll(".list-group .label span");
			for (var i = 0, ii = els.length; i < ii; i++) {
				this._groupRects[i] = inflateRect(els[i].getBoundingClientRect(), -8.5, -4.5);
			}
		}
		this._groupRects.forEach(function(r) {
			// TODO: implement DOMRect.inflate()
			this._ctx.clearRect(r.left, r.top, r.width - 1, r.height - 1);
			// this._ctx.strokeRect(r.left, r.top, r.width, r.height);
			// var ro = r.original;
			// this._ctx.strokeRect(ro.left, ro.top, ro.width, ro.height);
		}, this);

		// var i, ii, r;
		// if (this._a2b.points || this._b2a.points || this._a2b.pointsOut || this._b2a.pointsOut) {
		// 	ii = this._groupRects.length;
		// 	for (i = 0; i < ii; i++) {
		// 		r = this._groupRects[i];
		// 		ctx.clearRect(r.left, r.top, r.width, r.height);
		// 	}
		// }

		// if (DEBUG) {
		// 	if (!interpolator._valuesChanged) {
		// 		var p;
		// 		for (i = 0; i < ii; i++) {
		// 			p = this._b2a.points[i];
		// 			CanvasHelper.crosshair(ctx, p.cx2, p.cy2, 5, _dStyles.red);
		// 			CanvasHelper.circle(ctx, p.cx1, p.cy1, 1, true, _dStyles.blue);
		// 		}
		// 	}
		// 	CanvasHelper.vGuide(ctx, this._a2b.xMin, _dStyles.red);
		// 	CanvasHelper.vGuide(ctx, this._b2a.xMin, _dStyles.blue);
		// }
	},

	_computeConnectors2: function(d) {
		var rBase = d.s.radiusBase;
		var rInc = d.s.radiusIncrement;
		var sMin = d.xMin;
		var dMin = d.destMinX;

		var lMax = 0;
		var p, points = [];
		var qx, x1, y1, tx;
		var si; // ssEl's number of items above in the Y axis

		if (d.rect.right < d.destRect.left) {
			qx = 1;
		} else if (d.destRect.right < d.rect.left) {
			qx = -1;
		} else {
			qx = 0;
		}

		var sView, ddView, ddItems, ddNum, i;
		if (d.srcView.collection.selected && d.destView.filteredItems) {
			sView = d.srcView.itemViews.findByModel(d.srcView.collection.selected);
			x1 = d.rect.left + sView.transform.tx + sView._metrics.textLeft;
			y1 = d.rect.top + sView.transform.ty + sView._metrics.offsetHeight / 2;
			if (qx > 0) x1 += sView._metrics.textWidth;

			ddItems = d.destView.filteredItems;
			ddNum = d.destView.filteredItems.length;
			for (i = 0; i < ddNum; i++) {
				ddView = d.destView.itemViews.findByModel(ddItems[i]);
				p = {};
				p.x2 = d.destRect.left + ddView.transform.tx + ddView._metrics.textLeft;
				p.y2 = d.destRect.top + ddView.transform.ty + ddView._metrics.offsetHeight / 2;
				if (qx < 0) p.x2 += ddView._metrics.textWidth;

				p.x1 = x1;
				p.y1 = y1;
				p.dx = x1 - p.x2;
				p.dy = y1 - p.y2;
				p.qx = qx;
				points[i] = p;
			}
			points.sort(function(a, b) {
				return a.y2 - b.y2;
			});
			si = 0;
			for (i = 0; i < ddNum; i++) {
				p = points[i];
				p.di = p.dy > 0 ? i : ddNum - (i + 1);
				si = Math.max(si, p.di);
			}

			var a, rMax0 = ddNum * 0.5 * rInc;
			for (i = 0; i < ddNum; i++) {
				p = points[i];
				p.r1 = p.di * rInc + rBase;
				p.r2 = rBase;
				// p.r2 = (si - p.di) * rInc + rBase;

				p.cx1 = sMin;
				p.cx2 = dMin - ((si - p.di) * rInc) * qx;
				// p.cx2 = dMin;

				a = (i - (ddNum - 1) / 2) * rInc;
				p.cy1 = p.y1 + a;
				p.cy2 = p.y2;

				a = Math.abs(a);
				p.r0 = a;
				p.cx0 = p.x1 + (rMax0 - a) * qx;

				tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 0.8);
				if (tx) {
					p.tx1 = tx[0];
					p.tx2 = tx[1];
				} else {
					p.tx1 = p.cx1;
					p.tx2 = p.cx2;
				}

				// Find out longest node connection for setLineDash
				lMax = Math.max(lMax, Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2));
			}
			points.sort(function(a, b) {
				return b.di - a.di; // Sort by distance to selected view
			});
		}
		d.points = points;
		d.maxLength = lMax;
		d.xDir = qx;
	},

	/*_computeConnectors: function(d) {
		var rBase = d.s.radiusBase;
		var rInc = d.s.radiusIncrement;
		var sMin = d.xMin;
		var dMin = d.destMinX;

		var lMax = 0;
		var p, points = [];
		var qx, x1, y1, tx;
		var si; // ssEl's number of items above in the Y axis

		if (d.rect.right < d.destRect.left) {
			qx = 1;
		} else if (d.destRect.right < d.rect.left) {
			qx = -1;
		} else {
			qx = 0;
		}

		var ssEl, ddEls, ddNum, ssRect, ddRect, i;
		ssEl = d.srcView.el.querySelector(".list-item.selected .label");
		if (ssEl) {
			ssRect = ssEl.getBoundingClientRect();
			x1 = ssRect.left;
			if (qx > 0) x1 += ssRect.width;
			y1 = ssRect.top + ssRect.height / 2;
			// r2 = rBase;
			// cx1 = d.xMin;

			si = 0;
			ddEls = d.destView.el.querySelectorAll(".list-item:not(.excluded) .label");
			ddNum = ddEls.length;
			// dx = Math.abs(d.xMin - dData.xMin);

			for (i = 0; i < ddNum; i++) {
				p = {};
				ddRect = ddEls[i].getBoundingClientRect();
				p.x2 = ddRect.left;
				if (qx < 0) p.x2 += ddRect.width;
				p.y2 = ddRect.top + ddRect.height / 2;
				p.x1 = x1;
				p.y1 = y1;
				p.dx = p.x1 - p.x2;
				p.dy = p.y1 - p.y2;
				p.qx = qx;
				p.qy = Math.sign(p.dy);
				// p.dLength = Math.abs(p.x) + Math.abs(p.y);
				p.di = p.dy > 0 ? i : ddNum - (i + 1);
				si = Math.max(si, p.di);
				points[i] = p;
			}

			var a, rMax0 = ddNum * 0.5 * rInc;
			for (i = 0; i < ddNum; i++) {
				p = points[i];
				p.r1 = p.di * rInc + rBase;
				p.r2 = rBase;
				// p.r2 = (si - p.di) * rInc + rBase;

				p.cx1 = sMin;
				p.cx2 = dMin - ((si - p.di) * rInc) * qx;
				// p.cx2 = dMin;

				a = (i - (ddNum - 1) / 2) * rInc;
				p.cy1 = p.y1 + a;
				p.cy2 = p.y2;

				a = Math.abs(a);
				p.r0 = a;
				p.cx0 = p.x1 + (rMax0 - a) * qx;

				tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 0.8);
				p.tx1 = tx[0];
				p.tx2 = tx[1];

				// Find out longest node connection for setLineDash
				lMax = Math.max(lMax, Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2));
			}
			// Sort by distance y1 (original) > cy1 (rInc offset) distance
			points.sort(function(a, b) {
				// return Math.abs(b.y1 - b.cy1) - Math.abs(a.y1 - a.cy1);
				// return a.r0 - b.r0;
				return b.di - a.di;
			});
		}
		d.points = points;
		d.maxLength = lMax;
		d.xDir = qx;
	},*/

	_drawConnector: function(p) {
		this._ctx.beginPath();
		this._ctx.moveTo(p.x2, p.cy2);
		this._ctx.arcTo(p.tx2, p.cy2, p.tx1, p.cy1, p.r2);
		this._ctx.arcTo(p.tx1, p.cy1, p.cx1, p.cy1, p.r1);
		// this._ctx.quadraticCurveTo(p.cx0, p.cy1, p.cx0, p.y1)
		this._ctx.arcTo(p.cx0, p.cy1, p.cx0, p.y1, p.r0);
		// this._ctx.lineTo(p.cx0, p.y1);
		this._ctx.stroke();

		// CanvasHelper.circle(this._ctx, p.cx0, p.cy1, 1, true, _dStyles["blue"]);
		// CanvasHelper.circle(this._ctx, p.cx1, p.cy1, 1, true, _dStyles["blue"]);
		// CanvasHelper.circle(this._ctx, p.cx2, p.cy2, 2, true, _dStyles["red"]);
		// CanvasHelper.circle(this._ctx, p.x1 - (p.r3 * p.qx * 2), p.cy1, 2, true, _dStyles["blue"]);
	},

	/*_redraw_fromMetrics: function(ctx, interpolator) {
		var i, ii, model, mCids;

		var idx, metrics;
		var x1, y1, x2, y2, xMin1, xMin2;
		var cx1, cy1, r1;
		var cx2, cy2, r2;
		var s, rInc, rBase, xMargin; // connector-to-element margin in px

		// keyword to bundles, left to right
		if (model = this._listB.collection.selected) {
			mCids = model.get("bIds");
			ii = mCids.length;
		}
		// bundle to keywords, right to left
		if (model = this.model.get("bundle")) {
			mCids = model.get("bIds");
			ii = mCids.length;

			s = this._b2a.s;
			rInc = s.radiusIncrement;
			rBase = s.radiusBase;
			xMargin = s.margin;

			xMin1 = this._a2b.xMin;
			xMin2 = this._b2a.xMin;
			idx = _.findIndex(this._targetsA, { mId: model.id });
			metrics = this._targetsA[idx];
			x1 = metrics.after - xMargin;
			y1 = metrics.y;
			r2 = rBase;
			cx1 = Math.min(x1, xMin1);

			ii = this._targetsB.length;
			for (i = 0; i < ii; i++); {}
		}
	},*/

	/*_redraw_fromViews: function(ctx, interpolator) {
		var i, numItems, view, rect, model, mCids;
		var yMin, yMax, dx;
		var s, roInc, m;

		// var xMid = (this._a2b.xMin + this._b2a.xMin) / 2;
		yMin = Math.min(this._a2b.rect.top, this._b2a.rect.top);
		yMax = Math.max(this._a2b.rect.bottom, this._b2a.rect.bottom);
		dx = Math.abs(this._a2b.xMin - this._b2a.xMin);

		s = this._b2a.s;
		roInc = s.radiusIncrement;
		m = s.margin; // connector-to-element margin in px

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

		xMin1 = this._a2b.xMin;
		xMin2 = this._b2a.xMin;

		this._setStyle(s);

		// bundle to keywords
		if (model = this.model.get("bundle")) {
			view = this._listA.itemViews.findByModel(model);
			if (view._metrics) {
				mCids = model.get("kIds");
				numItems = mCids.length;

				x1 = this._a2b.rect.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
				y1 = this._a2b.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
				cx1 = Math.max(x1, xMin1);
				ro = mCids.length * roInc * 0.5;

				for (i = 0; i < numItems; i++) {
					view = this._listB.itemViews.findByModel(keywords.get(mCids[i]));
					if (view._metrics) {
						x2 = this._b2a.rect.left + view.transform.tx + view._metrics.textLeft;
						y2 = this._b2a.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
						cx2 = Math.min(x2, xMin2);
						cy1 = y1 + i * roInc;
						cy2 = y2; // - i*roInc;
						ro += y1 > y2 ? roInc : -roInc;

						ctx.beginPath();
						ctx.moveTo(x1, cy1);
						drawArcHConnector(ctx, cx1, cy1, cx2, cy2, r1 + ro, r2 - ro);
						ctx.lineTo(x2, cy2);
						ctx.stroke();
					}
				}
			}
		}

		xMin1 = this._b2a.xMin;
		xMin2 = this._a2b.xMin;

		// keyword to bundles
		if (model = this._listB.collection.selected) {
			view = this._listB.itemViews.findByModel(model);
			if (view._metrics) {
				mCids = model.get("bIds");
				numItems = mCids.length;

				x1 = this._b2a.rect.left + view.transform.tx + view._metrics.textLeft;
				y1 = this._b2a.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
				cx1 = Math.min(x1, xMin1);
				ro = mCids.length * roInc * 0.5;

				// ctx.setLineDash([]);
				for (i = 0; i < numItems; i++) {
					view = this._listA.itemViews.findByModel(this._listA.collection.get(mCids[i]));
					if (view._metrics) {
						x2 = this._a2b.rect.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
						y2 = this._a2b.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
						cx2 = Math.max(x2, xMin2);
						cy1 = y1 + i * roInc;
						cy2 = y2; // + i*roInc;
						ro += y1 > y2 ? roInc : -roInc;

						ctx.beginPath();
						ctx.moveTo(x1, cy1);
						drawArcHConnector(ctx, cx1, cy1, cx2, cy2, r1 + ro, r2 - ro);
						ctx.lineTo(x2, cy2);
						ctx.stroke();
					}
				}
			}
		}
	},*/

	/*_measureListItems: function(listView) {
		var listRect, retval;

		listRect = listView.el.getBoundingClientRect();
		retval = listView.itemViews.map(function(view, i) {
			return {
				vId: view.id,
				mId: view.model.id,
				left: listRect.left + view.transform.tx + view._metrics.textLeft,
				right: listRect.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth,
				y: listRect.top + view.transform.ty + view._metrics.offsetHeight / 2,
			};
		}, this);
		retval.sort(function(a, b) {
			return a.y - b.y;
		});
		retval.before = listRect.left;
		retval.after = listRect.left + listRect.width;
		return retval;
	},*/
});

module.exports = GraphView;