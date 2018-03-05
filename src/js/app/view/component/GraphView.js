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
/** @type {module:app/model/collection/KeywordCollection} */
var keywords = require("app/model/collection/KeywordCollection");

/** @type {module:utils/canvas/calcArcHConnector} */
var calcArcHConnector = require("utils/canvas/calcArcHConnector");
/** @type {module:utils/canvas/drawArcHConnector} */
var drawArcHConnector = require("utils/canvas/drawArcHConnector");

// var BEZIER_CIRCLE = 0.551915024494;
// var MIN_CANVAS_RATIO = 2;
var PI2 = Math.PI * 2;

var _dStyles = {
	red: {
		lineWidth: 1,
		fillStyle: "rgba(255,127,127,0.5)",
		strokeStyle: "rgba(255,127,127,0.5)",
	},
	blue: {
		lineWidth: 1,
		fillStyle: "rgba(127,127,255,0.5)",
		strokeStyle: "rgba(127,127,255,0.5)",
	}
};

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

function vGuide(ctx, x, s) {
	ctx.save();
	if (s) setStyle(ctx, s);
	ctx.beginPath();
	ctx.moveTo(x, ctx.canvas.offsetTop);
	ctx.lineTo(x, ctx.canvas.offsetHeight);
	ctx.stroke();
	ctx.restore();
}

function crosshair(ctx, x, y, r, s) {
	ctx.save();
	if (s) {
		setStyle(ctx, s);
	}
	// if (s && s.style != "vertical") {
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

function circle(ctx, x, y, r, solid, s) {
	ctx.save();
	if (s) setStyle(ctx, s);
	ctx.beginPath();
	ctx.arc(x, y, r, 0, PI2);
	ctx.closePath();
	if (solid) ctx.fill();
	else ctx.stroke();
	ctx.restore();
}

function square(ctx, x, y, r, solid, s) {
	r = Math.floor(r / 2) * 2;
	if (solid) r += 0.5;
	ctx.save();
	if (s) setStyle(ctx, s);
	ctx.beginPath();
	ctx.rect(x - r, y - r, r * 2, r * 2);
	if (solid) ctx.fill();
	else ctx.stroke();
	ctx.restore();
}

function arrowhead(ctx, x, y, r, a, stroked, s) {
	ctx.save();
	if (s) {
		setStyle(ctx, s);
	}
	if (r < 10) {
		ctx.setLineDash([]);
	}
	ctx.translate(x, y);
	ctx.rotate((a || 0) - Math.PI * 0.5);
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

var hConnector_1 = function(ctx, x1, cx1, cy1, x2, cx2, cy2, r1, r2) {
	ctx.beginPath();
	ctx.moveTo(x1, cy1);
	drawArcHConnector(ctx, cx1, cy1, cx2, cy2, r1, r2, 0);
	ctx.lineTo(x2, cy2);
	ctx.stroke();
};
var hConnector_2 = function(ctx, x1, cx1, cy1, x2, cx2, cy2, r1, r2, ro) {
	ctx.beginPath();
	ctx.moveTo(x1, cy1);
	drawArcHConnector(ctx, cx1, cy1, cx2, cy2, r1, r2, ro);
	ctx.lineTo(x2, cy2);
	ctx.stroke();
};
var hConnector_3 = function(ctx, x1, cx1, cy1, x2, cx2, cy2, r1, r2, ro) {
	ctx.beginPath();
	ctx.moveTo(x2, cy2);
	drawArcHConnector(ctx, cx2, cy2, cx1, cy1, r2, r1, ro);
	ctx.lineTo(x1, cy1);
	ctx.stroke();
};
var hConnector = hConnector_2;

// context.beginPath();
// context.moveTo(x2, cy2);
// drawArcHConnector(context, cx2, cy2, cx1, cy1, r2, r1);
// context.lineTo(x1, cy1);
// context.stroke();

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
		this._dataA = {};
		this._dataB = {};

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

		var colorStr1;
		var styleBase = {
			lineWidth: 1,
			radiusBase: 12, //6,
			radiusIncrement: 3, //4,
			margin: 20,
		};

		colorStr1 = Color(this._color).mix(bgColor, 0.5).hexString();
		this._styleData["default"] = _.defaults({
			lineWidth: 0.7, //0.7,
			// radiusBase: 12, //12,
			// radiusIncrement: 3, //1, //3,
			strokeStyle: colorStr1,
			fillStyle: colorStr1,
		}, styleBase);

		// colorStr1 = Globals.DEFAULT_COLORS["link-color"];
		// colorStr1 = Color(this._color).alpha(0.35).rgbaString();
		colorStr1 = Color(this._color).mix(bgColor, 0.15).hexString();
		this._styleData["thick"] = _.defaults({
			lineWidth: 3, //2.4, //3,
			// radiusBase: 12,
			radiusIncrement: 4, //3.25,
			strokeStyle: colorStr1,
			fillStyle: colorStr1,
		}, styleBase);

		this._styleData["hairline"] = _.defaults({
			lineWidth: 0.5,
			strokeStyle: this._color,
		}, styleBase);
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
		var i, itemEls;

		this._dataA.rect = this._listA.el.getBoundingClientRect();
		this._dataA.xMin = this._dataA.rect.left;
		itemEls = this._listA.el.querySelectorAll(".label");
		for (i = 0; i < itemEls.length; i++) {
			this._dataA.xMin = Math.max(this._dataA.xMin,
				itemEls.item(i).getBoundingClientRect().right);
		}

		this._dataB.rect = this._listB.el.getBoundingClientRect();
		this._dataB.xMin = this._dataB.rect.left;
		itemEls = this._listB.el.querySelectorAll(".label");
		for (i = 0; i < itemEls.length; i++) {
			this._dataB.xMin = Math.min(this._dataB.xMin,
				itemEls.item(i).getBoundingClientRect().left);
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
		console.log("%s::_beforeViewRender [flags: %s]", this.cid, CanvasView.flagsToString(flags));
		if (flags & (CanvasView.SIZE_INVALID | CanvasView.MODEL_INVALID)) {
			this._dataA.cmdsOut = this._dataA.cmds;
			this._dataA.cmds = null;
			this._dataA.nodeMaxDeltaOut = this._dataA.nodeMaxDelta;
			this._dataA.nodeMaxDelta = null;

			this._dataB.cmdsOut = this._dataB.cmds;
			this._dataB.cmds = null;
			this._dataB.nodeMaxDeltaOut = this._dataB.nodeMaxDelta;
			this._dataB.nodeMaxDelta = null;
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

	_redraw_fromElements: function(context, interpolator) {
		var i, s;

		// keyword to bundles, right to left
		if (this._dataB.cmds === null) {
			s = this._styleData["default"];
			this._redrawConnectors(this._listB, this._dataB, this._listA, this._dataA, s.radiusBase, s.radiusIncrement);
		}

		// bundle to keywords, left to right
		if (this._dataA.cmds === null) {
			s = this._styleData["thick"];
			this._redrawConnectors(this._listA, this._dataA, this._listB, this._dataB, s.radiusBase, s.radiusIncrement);
		}
		/* draw */

		// Some debugging aids
		vGuide(context, this._dataA.xMin, _dStyles.red);
		vGuide(context, this._dataB.xMin, _dStyles.blue);

		if (this._dataA.cmds && this._dataA.cmds.length) {
			this._setStyle(this._styleData["thick"]);
			for (i = 0; i < this._dataA.cmds.length; i++) {
				this._dataA.cmds[i].call();
			}
		}

		/* line dash value interpolation */
		var lVal = interpolator._valueData["amount"]._renderedValue / interpolator._valueData["amount"]._maxVal;

		if (this._dataB.cmds && this._dataB.cmds.length) {
			s = this._styleData["default"];
			this._setStyle(s);

			context.lineDashOffset = this._dataB.nodeMaxDelta * (1 - lVal);
			context.setLineDash([this._dataB.nodeMaxDelta, this._dataB.nodeMaxDelta]);
			context.save();
			context.globalCompositeOperation = "destination-out";
			context.lineWidth = s.radiusIncrement + s.lineWidth;
			for (i = 0; i < this._dataB.cmds.length; i++) {
				this._dataB.cmds[i].call();
			}
			context.restore();

			for (i = 0; i < this._dataB.cmds.length; i++) {
				this._dataB.cmds[i].call();
			}
		}

		if (this._dataB.cmdsOut && this._dataB.cmdsOut.length) {
			s = this._styleData["default"];
			this._setStyle(s);

			context.lineDashOffset = this._dataB.nodeMaxDeltaOut * (lVal);
			context.setLineDash([this._dataB.nodeMaxDeltaOut, this._dataB.nodeMaxDeltaOut]);
			context.save();
			context.globalCompositeOperation = "destination-out";
			context.lineWidth = s.radiusIncrement + s.lineWidth;
			for (i = 0; i < this._dataB.cmdsOut.length; i++) {
				this._dataB.cmdsOut[i].call();
			}
			context.restore();

			for (i = 0; i < this._dataB.cmdsOut.length; i++) {
				this._dataB.cmdsOut[i].call();
			}
		}

		var els, numEls, rect;
		if (this._dataA.cmds || this._dataB.cmds || this._dataA.cmdsOut || this._dataB.cmdsOut) {
			els = this._listB.el.querySelectorAll(".list-group .label span");
			numEls = els.length;
			for (i = 0; i < numEls; i++) {
				rect = els.item(i).getBoundingClientRect();
				context.clearRect(rect.left, rect.top, rect.width, rect.height);
			}
		}
	},

	_redrawConnectors: function(sList, sData, dList, dData, rBase, rInc) {
		var ctx = this._ctx;
		var cmds = [];
		var nodeMaxDelta = 0;
		var p, points = [];

		var ssEl, ddEls, ddNum, i;
		var sRect, dRect, ssRect, ddRect;
		var dx, qx, sProp, dProp;
		var ro, tx;
		var si; // ssEl's number of items above in the Y axis

		var x1, y1, x2, y2;
		var cx1, cy1, r1;
		var cx2, cy2, r2;

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

		ssEl = sList.el.querySelector(".list-item.selected .label");

		if (ssEl) {
			ssRect = ssEl.getBoundingClientRect();
			x1 = ssRect[sProp] // - xMargin;
			y1 = ssRect.top + ssRect.height / 2;
			r2 = rBase;
			cx1 = sData.xMin;

			si = 0;
			ddEls = dList.el.querySelectorAll(".list-item:not(.excluded) .label");
			ddNum = ddEls.length;
			dx = Math.abs(sData.xMin - dData.xMin);

			// console.groupCollapsed("%s::_redrawConnectors", this._cid);
			for (i = 0; i < ddNum; i++) {
				p = {};
				ddRect = ddEls[i].getBoundingClientRect();
				p.x2 = ddRect[dProp];
				p.y2 = ddRect.top + ddRect.height / 2;
				p.dx = x1 - p.x2;
				p.dy = y1 - p.y2;
				p.di = p.dy > 0 ? i : ddNum - (i + 1);
				si = Math.max(si, p.di);
				points[i] = p;
				// console.log("%s::_redrawConnectors [%s]: %s", this._cid, i, p.di);
			}
			// console.groupEnd();
			// console.log("%s::_redrawConnectors si: %s", this._cid, si);

			// for (i = 0; i < ddNum; i++) {
			// 	ddRect = ddEls[i].getBoundingClientRect();
			// 	x2 = ddRect[dProp];
			// 	y2 = ddRect.top + ddRect.height / 2;
			// 	if (y1 > y2) {
			// 		ro = (i * rInc);
			// 	} else {
			// 		ro = (ddNum - (i + 1)) * rInc;
			// 	}
			// 	r1 = ro + rBase;
			for (i = 0; i < ddNum; i++) {
				p = points[i];
				x2 = p.x2;
				y2 = p.y2
				r1 = p.di * rInc + rBase;
				// r2 = (si - p.di) * rInc + rBase;

				// if (x1 < x2) {
				// 	cx2 = Math.min(x2, dData.xMin);
				// 	// cx2 = dData.xMin - (rBase - ro);
				// } else {
				// 	cx2 = Math.max(x2, dData.xMin);
				// 	// cx2 = dData.xMin + (rBase - ro);
				// }

				// r2 = rTotal - r1;
				// cx2 = Math.max(x2, xMin2 - xMargin);
				// cx2 = Math.max(x2, xMin2) + (r2 - r1);
				// cx2 = dRect[dProp];
				// cx2 = dData.xMin - (rBase - (p.di * rInc)) * qx;

				cx2 = dData.xMin - (si - p.di) * rInc * qx;
				// cx2 = dData.xMin;
				ro = 1;
				// ro = dx - (si - p.di) * rInc;

				cy1 = y1 + (i - (ddNum - 1) / 2) * rInc;
				cy2 = y2;

				// tx = drawArcHConnector(null, cx1, cy1, cx2, cy2, r1, r2, 1);
				tx = calcArcHConnector(cx1, cy1, cx2, cy2, r1, r2, 1);

				cmds.push(
					ctx.beginPath.bind(ctx),
					ctx.moveTo.bind(ctx, x1, cy1),
					ctx.arcTo.bind(ctx, tx[0], cy1, tx[1], cy2, r1),
					ctx.arcTo.bind(ctx, tx[1], cy2, cx2, cy2, r2),
					ctx.lineTo.bind(ctx, x2, cy2),
					ctx.stroke.bind(ctx)
				);
				// cmds.push(
				//	arrowhead.bind(null, ctx, x2 + 2.5 * qx, cy2, 5, Math.atan2(x2 - cx2, cy2 - y2), false)
				// 	crosshair.bind(null, ctx, cx2, cy2, 5, _dStyles.red),
				// 	circle.bind(null, ctx, cx1, cy1, 1, true, _dStyles.blue)
				// );


				// add commands
				// cmds.push(
				// 	hConnector.bind(undefined, ctx, x1, cx1, cy1, x2, cx2, cy2, r1, r2, ro)
				// );

				// context.beginPath();
				// // context.moveTo(x1, y1);
				// // drawArcHConnector(context, x1, y1, x1 - rInc, cy1, 0, rInc);
				// context.moveTo(x1, cy1);
				// // drawArcHConnector(context, cx1, cy1, cx2, cy2, r1, r2, 1);
				// drawArcHConnector(context, cx1, cy1, cx2 - (r1 - r2), cy2, r1, r2, 1);
				// context.lineTo(x2, cy2);

				// Find out longest node connection for setLineDash
				nodeMaxDelta = Math.max(nodeMaxDelta, Math.abs(x1 - x2) + Math.abs(cy1 - cy2));
			}
		}
		sData.nodeMaxDelta = nodeMaxDelta;
		sData.cmds = cmds
	},


	_redraw_fromMetrics: function(context, interpolator) {
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

			s = this._styleData["default"];
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
	},

	_redraw_fromViews: function(context, interpolator) {
		var i, numItems, view, rect, model, mCids;
		var yMin, yMax, dx;
		var s, roInc, m;

		// var xMid = (this._dataA.xMin + this._dataB.xMin) / 2;
		yMin = Math.min(this._dataA.rect.top, this._dataB.rect.top);
		yMax = Math.max(this._dataA.rect.bottom, this._dataB.rect.bottom);
		dx = Math.abs(this._dataA.xMin - this._dataB.xMin);

		s = this._styleData["default"];
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
	},

	_measureListItems: function(listView) {
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
	},
});

module.exports = GraphView;
