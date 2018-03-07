/**
 * @module app/view/component/GraphView
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
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

// /** @type {module:utils/canvas/calcArcHConnector} */
// var CanvasHelper = require("utils/canvas/CanvasHelper");

// var BEZIER_CIRCLE = 0.551915024494;
// var MIN_CANVAS_RATIO = 2;
// var PI2 = Math.PI * 2;

var styleBase = {
	lineWidth: 1,
	radiusBase: 12, //6,
	radiusIncrement: 3, //4,
	margin: 20,
};

// var _dStyles = {
// 	red: {
// 		lineWidth: 1,
// 		fillStyle: "rgba(255,127,127,0.5)",
// 		strokeStyle: "rgba(255,127,127,0.5)",
// 		lineDashOffset: 0,
// 		setLineDash: [[]]
// 	},
// 	blue: {
// 		lineWidth: 1,
// 		fillStyle: "rgba(127,127,255,0.5)",
// 		strokeStyle: "rgba(127,127,255,0.5)",
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

		this._styleData = {};
		this._listMetrics = {};

		this._listA = options.listA;
		this._listB = options.listB;
		this._dataA = {
			s: _.defaults({
				lineWidth: 3, //2.4, //3,
				// radiusBase: 12,
				radiusIncrement: 4, //3.25,
			}, styleBase),
			strokeStyleFn: function(fg, bg) {
				return Color(fg).mix(bg, 0.15).hexString();
			}
		};
		this._dataB = {
			s: _.defaults({
				lineWidth: 0.7, //0.7,
				// radiusBase: 12, //12,
				// radiusIncrement: 3, //1, //3,
			}, styleBase),
			strokeStyleFn: function(fg, bg) {
				return Color(fg).mix(bg, 0.50).hexString();
			}
		};

		this.listenTo(this, "view:render:before", this._beforeViewRender);
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

		// this._dataA.s.strokeStyle = Globals.DEFAULT_COLORS["link-color"];
		this._dataA.s.strokeStyle = this._dataA.strokeStyleFn(this._color, bgColor);
		this._dataB.s.strokeStyle = this._dataB.strokeStyleFn(this._color, bgColor);
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

		// var i, ii, itemView, itemRect, listView, itemEls;
		var i, ii, itemEls;

		this._dataA.rect = this._listA.el.getBoundingClientRect();
		this._dataA.xMin = this._dataA.rect.left;
		itemEls = this._listA.el.querySelectorAll(".label");
		for (i = 0, ii = itemEls.length; i < ii; i++) {
			this._dataA.xMin = Math.max(this._dataA.xMin,
				itemEls[i].getBoundingClientRect().right);
		}

		this._dataB.rect = this._listB.el.getBoundingClientRect();
		this._dataB.xMin = this._dataB.rect.left;
		itemEls = this._listB.el.querySelectorAll(".label");
		for (i = 0, ii = itemEls.length; i < ii; i++) {
			this._dataB.xMin = Math.min(this._dataB.xMin,
				itemEls[i].getBoundingClientRect().left);
		}

		this._groupRects = [];
		itemEls = this._listB.el.querySelectorAll(".list-group .label span");
		for (i = 0, ii = itemEls.length; i < ii; i++) {
			this._groupRects[i] = itemEls[i].getBoundingClientRect();
		}

		// this._dataA.targets = this._measureListItems(listView);
		// this._dataB.targets = this._measureListItems(listView);

		// // connector minimum branch x2
		// listView = this._listB;
		// for (i = 0, ii = listView.groups.length; i < ii; i++) {
		// 	itemView = listView.itemViews.findByModel(listView.groups[i]);
		// 	itemRect = (itemView.label || itemView.el).getBoundingClientRect();
		// 	this._dataB.xMin = Math.min(this._dataB.xMin, itemRect.left);
		// 	// if (itemView._metrics) this._dataB.rect.left + itemView.transform.tx + itemView._metrics.textLeft;
		// }
	},

	/* --------------------------- *
	/* redraw
	/* --------------------------- */

	_beforeViewRender: function(view, flags) {
		if (flags & (CanvasView.SIZE_INVALID | CanvasView.MODEL_INVALID)) {
			console.log("%s::_beforeViewRender [flags: %s]", this.cid, CanvasView.flagsToString(flags));

			this._dataA.pointsOut = this._dataA.points;
			this._dataA.maxLengthOut = this._dataA.maxLength;
			this._dataA.points = null;
			this._dataA.maxLength = null;

			this._dataB.pointsOut = this._dataB.points;
			this._dataB.maxLengthOut = this._dataB.maxLength;
			this._dataB.points = null;
			this._dataB.maxLength = null;
		}
	},

	redraw: function(context, interpolator) {
		// console.log("%s::redraw [valuesChanged: %s]", this.cid, interpolator.valuesChanged);
		this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeight);
		context.save();
		this._redraw_fromElements(context, interpolator);
		// this._redraw_fromViews(context, interpolator);
		context.restore();
	},

	_drawConnector: function(p) {
		// this._ctx.beginPath();
		// this._ctx.moveTo(p.x1, p.cy1);
		// this._ctx.arcTo(p.tx1, p.cy1, p.tx2, p.cy2, p.r1);
		// this._ctx.arcTo(p.tx2, p.cy2, p.cx2, p.cy2, p.r2);
		// this._ctx.lineTo(p.x2, p.cy2);
		// this._ctx.stroke();

		this._ctx.beginPath();
		this._ctx.moveTo(p.x2, p.cy2);
		this._ctx.arcTo(p.tx2, p.cy2, p.tx1, p.cy1, p.r2);
		this._ctx.arcTo(p.tx1, p.cy1, p.cx1, p.cy1, p.r1);
		this._ctx.lineTo(p.x1, p.cy1);
		this._ctx.stroke();
	},

	_redraw_fromElements: function(context, interpolator) {
		var i, ii, s, r;

		// keyword to bundles, right to left
		if (this._dataB.points === null) {
			// s = this._dataB.s;
			this._computeConnectors(this._listB, this._dataB, this._listA, this._dataA);
		}
		// bundle to keywords, left to right
		if (this._dataA.points === null) {
			// s = this._dataA.s;
			this._computeConnectors(this._listA, this._dataA, this._listB, this._dataB);
		}

		/* draw */
		if (this._dataA.points && this._dataA.points.length) {
			this._setStyle(this._dataA.s);
			for (i = 0; i < this._dataA.points.length; i++) {
				// this._dataA.points[i].call();
				this._drawConnector(this._dataA.points[i]);
			}
		}

		/* line dash value interpolation */
		var lVal = interpolator._valueData["amount"]._renderedValue / interpolator._valueData["amount"]._maxVal;

		if (this._dataB.points && (ii = this._dataB.points.length)) {
			s = this._dataB.s;
			this._setStyle(s);

			context.lineDashOffset = this._dataB.maxLength * (1 + lVal);
			context.setLineDash([this._dataB.maxLength, this._dataB.maxLength]);

			context.save();
			context.globalCompositeOperation = "destination-out";
			context.lineWidth = s.radiusIncrement + s.lineWidth;
			for (i = 0; i < ii; i++) {
				this._drawConnector(this._dataB.points[i]);
			}
			context.restore();

			for (i = 0; i < ii; i++) {
				this._drawConnector(this._dataB.points[i]);
			}
			// if (DEBUG) {
			// 	if (!interpolator._valuesChanged) {
			// 		var p;
			// 		for (i = 0; i < ii; i++) {
			// 			p = this._dataB.points[i];
			// 			CanvasHelper.crosshair(context, p.cx2, p.cy2, 5, _dStyles.red);
			// 			CanvasHelper.circle(context, p.cx1, p.cy1, 1, true, _dStyles.blue);
			// 		}
			// 	}
			// }
		}

		// // Some debugging aids
		// if (DEBUG) {
		// 	CanvasHelper.vGuide(context, this._dataA.xMin, _dStyles.red);
		// 	CanvasHelper.vGuide(context, this._dataB.xMin, _dStyles.blue);
		// }

		if (this._dataB.pointsOut && (ii = this._dataB.pointsOut.length)) {
			s = this._dataB.s;
			this._setStyle(s);

			context.lineDashOffset = this._dataB.maxLengthOut * (2 - lVal);
			context.setLineDash([this._dataB.maxLengthOut, this._dataB.maxLengthOut]);
			context.save();
			context.globalCompositeOperation = "destination-out";
			context.lineWidth = s.radiusIncrement + s.lineWidth;
			for (i = 0; i < ii; i++) {
				this._drawConnector(this._dataB.pointsOut[i]);
			}
			context.restore();

			for (i = 0; i < ii; i++) {
				this._drawConnector(this._dataB.pointsOut[i]);
			}
		}

		if (this._dataA.points || this._dataB.points || this._dataA.pointsOut || this._dataB.pointsOut) {
			ii = this._groupRects.length;
			for (i = 0; i < ii; i++) {
				r = this._groupRects[i];
				context.clearRect(r.left, r.top, r.width, r.height);
			}
		}
	},

	_computeConnectors: function(sList, sData, dList, dData) {
		var sRect, dRect;
		var qx, sProp, dProp;

		sRect = sList.el.getBoundingClientRect();
		dRect = dList.el.getBoundingClientRect();

		if (sRect.right < dRect.left) {
			qx = 1;
			sProp = "right";
			dProp = "left";
		} else if (dRect.right < sRect.left) {
			qx = -1;
			sProp = "left";
			dProp = "right";
		} else {
			return;
		}

		var maxLength = 0;
		var p, points = [];
		var rBase = sData.s.radiusBase;
		var rInc = sData.s.radiusIncrement;

		var ssEl, ddEls, ddNum, i;
		var ssRect, ddRect;
		var x1, y1, tx;
		var si; // ssEl's number of items above in the Y axis

		ssEl = sList.el.querySelector(".list-item.selected .label");

		if (ssEl) {
			ssRect = ssEl.getBoundingClientRect();
			x1 = ssRect[sProp] // - xMargin;
			y1 = ssRect.top + ssRect.height / 2;
			// r2 = rBase;
			// cx1 = sData.xMin;

			si = 0;
			ddEls = dList.el.querySelectorAll(".list-item:not(.excluded) .label");
			ddNum = ddEls.length;
			// dx = Math.abs(sData.xMin - dData.xMin);

			for (i = 0; i < ddNum; i++) {
				p = {};
				ddRect = ddEls[i].getBoundingClientRect();
				p.x1 = x1;
				p.y1 = y1;
				p.x2 = ddRect[dProp];
				p.y2 = ddRect.top + ddRect.height / 2;
				p.dx = p.x1 - p.x2;
				p.dy = p.y1 - p.y2;
				// p.dLength = Math.abs(p.x) + Math.abs(p.y);
				p.di = p.dy > 0 ? i : ddNum - (i + 1);
				si = Math.max(si, p.di);
				points[i] = p;
			}

			for (i = 0; i < ddNum; i++) {
				p = points[i];
				p.r1 = p.di * rInc + rBase;
				p.r2 = rBase;
				// p.r2 = (si - p.di) * rInc + rBase;

				p.cx1 = sData.xMin;
				p.cx2 = dData.xMin - (si - p.di) * rInc * qx;
				// p.cx2 = dData.xMin;

				p.cy1 = p.y1 + (i - (ddNum - 1) / 2) * rInc;
				p.cy2 = p.y2;

				tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 1);
				p.tx1 = tx[0];
				p.tx2 = tx[1];

				// Find out longest node connection for setLineDash
				maxLength = Math.max(maxLength, Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2));
			}
		}
		sData.points = points;
		sData.maxLength = maxLength;
	},

	/*_redraw_fromMetrics: function(context, interpolator) {
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

			s = this._dataB.s;
			rInc = s.radiusIncrement;
			rBase = s.radiusBase;
			xMargin = s.margin;

			xMin1 = this._dataA.xMin;
			xMin2 = this._dataB.xMin;
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

	/*_redraw_fromViews: function(context, interpolator) {
		var i, numItems, view, rect, model, mCids;
		var yMin, yMax, dx;
		var s, roInc, m;

		// var xMid = (this._dataA.xMin + this._dataB.xMin) / 2;
		yMin = Math.min(this._dataA.rect.top, this._dataB.rect.top);
		yMax = Math.max(this._dataA.rect.bottom, this._dataB.rect.bottom);
		dx = Math.abs(this._dataA.xMin - this._dataB.xMin);

		s = this._dataB.s;
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

		xMin1 = this._dataA.xMin;
		xMin2 = this._dataB.xMin;

		this._setStyle(s);

		// bundle to keywords
		if (model = this.model.get("bundle")) {
			view = this._listA.itemViews.findByModel(model);
			if (view._metrics) {
				mCids = model.get("kIds");
				numItems = mCids.length;

				x1 = this._dataA.rect.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
				y1 = this._dataA.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
				cx1 = Math.max(x1, xMin1);
				ro = mCids.length * roInc * 0.5;

				for (i = 0; i < numItems; i++) {
					view = this._listB.itemViews.findByModel(keywords.get(mCids[i]));
					if (view._metrics) {
						x2 = this._dataB.rect.left + view.transform.tx + view._metrics.textLeft;
						y2 = this._dataB.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
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

		xMin1 = this._dataB.xMin;
		xMin2 = this._dataA.xMin;

		// keyword to bundles
		if (model = this._listB.collection.selected) {
			view = this._listB.itemViews.findByModel(model);
			if (view._metrics) {
				mCids = model.get("bIds");
				numItems = mCids.length;

				x1 = this._dataB.rect.left + view.transform.tx + view._metrics.textLeft;
				y1 = this._dataB.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
				cx1 = Math.min(x1, xMin1);
				ro = mCids.length * roInc * 0.5;

				// context.setLineDash([]);
				for (i = 0; i < numItems; i++) {
					view = this._listA.itemViews.findByModel(this._listA.collection.get(mCids[i]));
					if (view._metrics) {
						x2 = this._dataA.rect.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
						y2 = this._dataA.rect.top + view.transform.ty + view._metrics.offsetHeight / 2;
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
	},*/

	/*_measureListItems: function(listView) {
		var listRect, retval;

		listRect = listView.el.getBoundingClientRect();
		retval = listView.itemViews.map(function(view, i) {
			return {
				vId: view.id,
				mId: view.model.id,
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
	},*/
});

module.exports = GraphView;
