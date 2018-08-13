/**
 * @module app/view/component/GraphView
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {Function} */
var Color = require("color");

/** @type {module:app/view/base/CanvasView} */
var CanvasView = require("app/view/base/CanvasView");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");

/** @type {module:utils/canvas/calcArcHConnector} */
var calcArcHConnector = require("utils/canvas/calcArcHConnector");

/** @type {module:utils/canvas/CanvasHelper} */
var CanvasHelper = require("utils/canvas/CanvasHelper");

/** @type {module:utils/geom/inflateRect} */
var inflateRect = require("utils/geom/inflateRect");

// /** @type {module:utils/dom/getAbsoluteClientRect} */
// var getAbsoluteClientRect = require("utils/dom/getAbsoluteClientRect");


// var BEZIER_CIRCLE = 0.551915024494;
// var MIN_CANVAS_RATIO = 2;
// var PI2 = Math.PI * 2;

var styleBase = {
	lineCap: "butt", // round, butt, square
	lineWidth: 0.75,
	lineDashOffset: 0,
	setLineDash: [[]],
	radiusBase: 0.8,
	/* factored to rem unit */ //6,
	radiusIncrement: 0.21, //3, //0.25,
	/* uses lineWidth multiplier */
	outlineWidth: 3.5,
	arrowSize: 0.3,
};

// var overlayStyleBase = {
// 	globalAlpha: 0.75,
// 	globalCompositeOperation: "destination-out",
// 	lineWidth: 4,
// 	lineJoin: "round",
// 	textBaseline: "top",
// 	textAlign: "left",
// };

if (DEBUG) {
	/* eslint-disable no-unused-vars */
	var _dStyles = {};
	_dStyles["defaults"] = {
		lineWidth: 0,
		fillStyle: "transparent",
		strokeStyle: "transparent",
		lineDashOffset: 0,
		setLineDash: [[]]
	};

	/* Stroke */
	[
		"red", "salmon", "sienna",
		"green", "yellowgreen", "olive",
		"blue", "lightskyblue", "midnightblue",
		"grey", "silver"
	]
	.forEach(function(colorName) {
		var rgbaValue = Color(colorName).alpha(0.5).rgbaString();

		_dStyles[colorName] = _.defaults({
			lineWidth: 0.75,
			strokeStyle: rgbaValue,
		}, _dStyles["defaults"]);

		_dStyles[colorName + "_thick"] = _.defaults({
			lineWidth: 5,
			strokeStyle: rgbaValue,
		}, _dStyles["defaults"]);

		_dStyles[colorName + "_fill"] = _.defaults({
			fillStyle: rgbaValue
		}, _dStyles["defaults"]);
	})
	/* eslint-enable no-unused-vars */
}

var getRectDirX = function(r1, r2) {
	if (r1.right < r2.left) {
		return 1;
	}
	if (r2.right < r1.left) {
		return -1;
	}
	return 0;
};

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

	defaultKey: "a2b",

	defaults: {
		values: {
			a2b: 0,
			b2a: 0,
		},
		maxValues: {
			a2b: 1,
			b2a: 1,
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
				lineWidth: 1.25
				// radiusIncrement: 0.25,
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
				// arrowSize: 0.25,
				// radiusIncrement: 0,
				// outlineWidth: 0,
			}, styleBase),
			strokeStyleFn: function(fg, bg, ln) {
				return Color(fg).mix(bg, 0.6).hexString();
			}
		};

		// this.listenTo(this._a2b.srcView.collection, "view:select:one view:select:none", function(item) {
		// 	this._a2b.pointsOut = this._a2b.points;
		// 	this._a2b.points = null;
		// });
		//
		// this.listenTo(this._b2a.srcView.collection, "view:select:one view:select:none", function(item) {
		// 	this._b2a.pointsOut = this._b2a.points;
		// 	this._b2a.points = null;
		// });

		// this.listenTo(this, "view:render:before", this._beforeViewRender);

		// this._traceScroll = _.debounce(this.__raceScroll, 100, false);

		// var viewportChanged = function(ev) {
		// 	console.log("%s:[%s]", this.cid, ev.type);
		//
		// 	// this._traceScroll(ev.type);
		// 	// this._labelOverlays = null;
		// 	this.invalidate(CanvasView.LAYOUT_INVALID | CanvasView.SIZE_INVALID);
		// 	// this.requestRender(CanvasView.LAYOUT_INVALID | CanvasView.SIZE_INVALID);
		// 	// this.requestRender().renderNow();
		// }.bind(this);
		// viewportChanged = _.debounce(viewportChanged, 60, false);

		// window.addEventListener("scroll",
		// 		_.debounce(viewportChanged, 100, false), false);
		// window.addEventListener("wheel",
		// 	_.debounce(viewportChanged, 100, false), false);
		// window.addEventListener("scroll", viewportChanged, false);
		// window.addEventListener("wheel", viewportChanged, false);
		// window.addEventListener("resize", viewportChanged, false);
		// window.addEventListener("orientationchange", viewportChanged, false);

		// this._addListListeners(this._a2b);
		// this._addListListeners(this._b2a);
	},

	/** @override */
	measureCanvas: function(w, h, s) {
		console.log("%s::measureCanvas style:%o scroll:%o offset:%o client:%o arg:%o", this.cid, s.height, this.el.offsetHeight, this.el.scrollHeight, this.el.clientHeight, h);
	},

	/** @override */
	updateCanvas: function() {
		this._updateMetrics();
		this._updateStyles();
	},

	/* --------------------------- *
	/* styles
	/* --------------------------- */

	_updateStyles: function() {
		var b, bgColor, lnColor;
		if (this.model.has("bundle")) {
			b = this.model.get("bundle");
			lnColor = b.colors.lnColor.clone();
			bgColor = b.colors.bgColor.clone();
		} else {
			bgColor = Color(Globals.DEFAULT_COLORS["background-color"]);
			lnColor = Color(Globals.DEFAULT_COLORS["link-color"]);
		}

		this._a2b.s.strokeStyle = this._a2b.s.fillStyle =
			this._a2b.strokeStyleFn(this._color, bgColor, lnColor);
		this._b2a.s.strokeStyle = this._b2a.s.fillStyle =
			this._b2a.strokeStyleFn(this._color, bgColor, lnColor);

		if (DEBUG) {
			this._debugBlocks = this.el.matches(".debug-blocks ." + this.className);
			this._debugGraph = this.el.matches(".debug-graph ." + this.className);
		}
	},

	_setStyle: function(s) {
		if (typeof s == "string") {
			s = this._styleData[s];
		}
		CanvasView.setStyle(this._ctx, s);
	},

	/* --------------------------- *
	/* metrics
	/* --------------------------- */

	_updateMetrics: function() {
		var bounds;
		var i, ii, els;
		var aRect, bRect;
		var aMin, bMin;

		this._rootFontSize = parseFloat(
			getComputedStyle(document.documentElement).fontSize);

		bounds = this.el.getBoundingClientRect();
		// bounds = getAbsoluteClientRect(this.el);
		this._ctx.setTransform(this._canvasRatio, 0, 0, this._canvasRatio,
			(-(bounds.left + window.scrollX) * this._canvasRatio) - 0.5,
			(-(bounds.top + window.scrollY) * this._canvasRatio) - 0.5
		);

		aRect = this._listA.el.getBoundingClientRect();
		aMin = aRect.left + window.scrollX;
		els = this._listA.el.querySelectorAll(".label");
		for (i = 0, ii = els.length; i < ii; i++) {
			aMin = Math.max(aMin,
				els[i].getBoundingClientRect().right + window.scrollX);
		}

		bRect = this._listB.el.getBoundingClientRect();
		bMin = bRect.left + window.scrollX;
		els = this._listB.el.querySelectorAll(".label");
		for (i = 0, ii = els.length; i < ii; i++) {
			bMin = Math.min(bMin,
				els[i].getBoundingClientRect().left + window.scrollX);
		}
		// this._b2a.destRect = this._a2b.rect = aRect;
		this._b2a.destMinX = this._a2b.xMin = aMin;
		this._b2a.qx = getRectDirX(bRect, aRect);

		// this._a2b.destRect = this._b2a.rect = bRect;
		this._a2b.destMinX = this._b2a.xMin = bMin;
		this._a2b.qx = getRectDirX(aRect, bRect);

		// var s = getComputedStyle(document.documentElement);
		// this._rootFontSize = parseFloat(s.fontSize); // * this._canvasRatio;
		// console.log("%s::_updateMetrics _rootFontSize: %s %o", this.cid, this._rootFontSize, s);

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

	// _beforeViewRender: function(view, flags) {
	// 	if (flags & (CanvasView.SIZE_INVALID | CanvasView.MODEL_INVALID)) {
	// 		console.log("%s::_beforeViewRender [flags: %s]", this.cid, CanvasView.flagsToString(flags));
	//
	// 		this._a2b.pointsOut = this._a2b.points;
	// 		this._a2b.rootOut = this._a2b.root;
	// 		this._b2a.pointsOut = this._b2a.points;
	// 		this._b2a.rootOut = this._b2a.root;
	//
	// 		this._a2b.points = null;
	// 		this._a2b.root = null;
	// 		this._b2a.points = null;
	// 		this._b2a.root = null;
	//
	// 		this._labelOverlays = null;
	// 	}
	// },

	redraw: function(ctx, interpolator, flags) {
		this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeight);
		ctx.save();
		this._redraw_fromElements(ctx, interpolator, flags);
		// this._redraw_fromViews(ctx, interpolator);
		ctx.restore();
	},

	_redraw_fromElements: function(ctx, interpolator, flags) {
		// b2a: keyword to bundles, right to left
		// a2b: bundle to keywords, left to right
		if (flags & (CanvasView.SIZE_INVALID | CanvasView.MODEL_INVALID)) {
			console.log("%s::redraw [valuesChanged: %s] [flags: %s]", this.cid, interpolator.valuesChanged, CanvasView.flagsToString(flags));

			this._a2b.pointsOut = this._a2b.points;
			this._b2a.pointsOut = this._b2a.points;
			this._b2a.points = this._computeConnectors(this._b2a);
			this._a2b.points = this._computeConnectors(this._a2b);
			this._labelOverlays = this._computeLabelOverlays(this._listB);
		}

		/* line dash value interpolation */
		var b2aVal = interpolator._valueData["b2a"]._renderedValue / interpolator._valueData["b2a"]._maxVal;
		var a2bVal = interpolator._valueData["a2b"]._renderedValue / interpolator._valueData["a2b"]._maxVal;

		/* draw */
		this._drawConnectors(this._b2a.points, this._b2a.s, b2aVal, 1);
		this._drawConnectors(this._b2a.pointsOut, this._b2a.s, 1 - b2aVal, 1);
		this._drawConnectors(this._a2b.points, this._a2b.s, a2bVal, 2);
		// this._drawConnectors(this._a2b.pointsOut, this._a2b.s, 1 - a2bVal, 2);
		this._drawLabelOverlays(this._labelOverlays);
	},

	/* --------------------------- *
	 * label overlays
	 * --------------------------- */

	_computeLabelOverlays: function(list) {
		var data = { rects: [] };
		var els = list.el.querySelectorAll(".list-group .label span");

		var i, ii, r;
		for (i = 0, ii = els.length; i < ii; i++) {
			// r = inflateRect(els[i].getBoundingClientRect(), 0, 0);
			r = _.clone(els[i].getBoundingClientRect());
			r.top += window.scrollY; // - 0.5;
			r.left += window.scrollX; // - 0.5;
			// r.innerText = els[i].innerText;
			data.rects[i] = r;
		}
		// data.cssStyle = getComputedStyle(els[0]);
		// data.boxStyle = getBoxEdgeStyles(overlayData.cssStyle);
		// data.ctxStyle = {
		// 	font: [s.fontWeight, s.fontStyle, s.fontSize + "/" + s.lineHeight, s.fontFamily].join(" ")
		// };
		return data;
	},

	_drawLabelOverlays: function(data) {
		this._ctx.save();

		// CanvasView.setStyle(this._ctx, s);
		this._ctx.globalAlpha = 0.75;
		this._ctx.globalCompositeOperation = "destination-out";
		// this._ctx.canvas.style.letterSpacing = overlayData.cssStyle.letterSpacing;

		data.rects.forEach(function(r) {
			// this._ctx.clearRect(r.left, r.top, r.width, r.height);
			this._ctx.fillRect(r.left, r.top, r.width, r.height);
			// this._ctx.strokeText(r.innerText, r.left, r.top);
		}, this);

		this._ctx.restore();

		if (DEBUG) {
			if (this._debugGraph || this._debugBlocks) {
				data.rects.forEach(function(r) {
					r = inflateRect(r, 2, 2);
					CanvasHelper.drawRect(this._ctx, _dStyles["salmon"],
						r.left, r.top, r.width, r.height);
				}, this);
			}
		}
	},

	/* --------------------------- *
	 * connectors
	 * --------------------------- */

	_computeConnectors: function(d) {
		var sMin = d.xMin;
		var dMin = d.destMinX;
		var qx = d.qx;

		// var root = {};
		var p, points = [];
		var x1, y1, tx;
		var rBase, rInc;

		rBase = this._roundTo(d.s.radiusBase * this._rootFontSize, 0.5);
		rInc = this._roundTo(d.s.radiusIncrement * this._rootFontSize, 0.5);

		var sView, ddView, ddItems, ddNum, i;
		if (d.srcView.collection.selected && d.destView.filteredItems) {
			sView = d.srcView.itemViews.findByModel(d.srcView.collection.selected);

			var rect = sView.label.getBoundingClientRect();
			x1 = rect.left;
			y1 = rect.top + rect.height / 2;
			if (qx > 0) x1 += rect.width;
			x1 += window.scrollX;
			y1 += window.scrollY;

			// if (!sView._metrics) return;
			// x1 = d.rect.left + sView.transform.tx
			// 	+ sView._metrics.textLeft;
			// y1 = d.rect.top + sView.transform.ty
			// 	+ sView._metrics.offsetHeight / 2;
			// if (qx > 0) x1 += sView._metrics.textWidth;

			ddItems = d.destView.filteredItems;
			ddNum = d.destView.filteredItems.length;

			for (i = 0; i < ddNum; i++) {
				p = {};
				ddView = d.destView.itemViews.findByModel(ddItems[i]);

				rect = ddView.label.getBoundingClientRect();
				p.x2 = rect.left;
				p.y2 = rect.top + rect.height / 2;
				if (qx < 0) p.x2 += rect.width;
				p.x2 += window.scrollX;
				p.y2 += window.scrollY;

				// p.x2 = d.destRect.left + ddView.transform.tx
				// 	+ ddView._metrics.textLeft;
				// p.y2 = d.destRect.top + ddView.transform.ty
				// 	+ ddView._metrics.offsetHeight / 2;
				// if (qx < 0) p.x2 += ddView._metrics.textWidth;

				p.x1 = x1;
				p.y1 = y1;
				p.qx = qx;
				points[i] = p;
			}
			points.sort(function(a, b) {
				return a.y2 - b.y2;
			});
			var si = 0; // ssEl's number of items above in the Y axis
			var rMax0 = ddNum * 0.5 * rInc; // first arc (r0) max radius (cx0)
			var a; // cy1 offset from y1

			for (i = 0; i < ddNum; i++) {
				p = points[i];

				a = (i - (ddNum - 1) / 2) * rInc;
				p.cy1 = p.y1 + a;
				p.cy2 = p.y2;

				a = Math.abs(a);
				p.r0 = a;
				p.cx0 = p.x1 + (rMax0 - a) * qx;

				// p.dx = x1 - p.x2;
				// p.dy = y1 - p.y2;

				p.di = ((p.cy1 - p.y2) > 0) ? i : ddNum - (i + 1);
				si = Math.max(si, p.di);
			}

			// NOTE
			//sMin = p.x1 + (rMax0 * qx);

			for (i = 0; i < ddNum; i++) {
				p = points[i];
				p.r1 = p.di * rInc + rBase;
				p.r2 = rBase;
				// p.r2 = rBase + (si - p.di) * rInc;

				p.cx1 = sMin + (rMax0 * qx);
				p.cx2 = dMin - ((si - p.di) * rInc) * qx;
				// p.cx2 = dMin;

				tx = calcArcHConnector(p.cx1, p.cy1, p.r1, p.cx2, p.cy2, p.r2, 0.9);
				if (tx) {
					p.tx1 = tx[0];
					p.tx2 = tx[1];
				} else {
					p.tx1 = p.cx1;
					p.tx2 = p.cx2;
				}
				p.length = Math.abs(p.x1 - p.x2) + Math.abs(p.cy1 - p.cy2);

				// Find out longest node connection for setLineDash
				// root.maxLength = Math.max(root.maxLength, p.length);
			}
			points.sort(function(a, b) {
				return a.di - b.di; // Sort by distance to selected view
			});

			// root.x = x1;
			// root.y = y1;
			// root.qx = qx;
			// root.r0 = si * rInc;
		}
		// d.points = points;
		// d.root = root;
		// return d;
		return points;
	},

	_drawConnectors: function(pp, s, lVal, dir) {
		var i, ii, p;
		var ow, ra1, ra2, ta;

		if (!(pp && pp.length && lVal)) return;

		ii = pp.length;

		/* outline width */
		ow = s.lineWidth + s.outlineWidth;
		// ow = Math.min(
		// 	this._roundTo(s.radiusIncrement * this._rootFontSize, 0.5),
		// 	this._roundTo(s.lineWidth * (1 + s.outlineWidth), 0.5)
		// );

		/* arrow radiuses, direction */
		// ra1 = (s.radiusIncrement * this._rootFontSize) + s.lineWidth;
		ra1 = s.arrowSize * this._rootFontSize;
		ra2 = ra1 + (ow - s.lineWidth);
		ta = Math.PI * dir;
		// dir -= 2;

		this._setStyle(s);

		// if (lVal < 1) {
		// 	this._ctx.lineDashOffset = lMax * (1 + lVal);
		// 	this._ctx.setLineDash([lMax, lMax])
		// 	// this._ctx.lineDashOffset = lMax * (1 + lVal);;
		// 	// this._ctx.setLineDash([lMax * (1 - lVal), lMax]);
		// }

		// for (i = 0; i < ii; i++) {
		// p = pp[i];
		if (s.outlineWidth) {
			this._ctx.save();
			this._ctx.globalCompositeOperation = "destination-out";
			this._ctx.lineWidth = ow;
			for (i = 0; i < ii; i++) {
				p = pp[i];

				if (lVal < 1) {
					this._ctx.lineDashOffset = p.length * (1 + lVal);
					this._ctx.setLineDash([p.length, p.length])
				}
				this._drawConnector(p, i, pp);
				if (lVal == 1) {
					CanvasHelper.arrowhead(this._ctx, p.x2, p.y2, ra2, ta);
					this._ctx.fill();
				}
			}
			this._ctx.restore();
		}

		for (i = 0; i < ii; i++) {
			p = pp[i];
			if (lVal < 1) {
				this._ctx.lineDashOffset = p.length * (1 + lVal);
				this._ctx.setLineDash([p.length, p.length])
			}
			this._drawConnector(p, i, pp);
			if (lVal == 1) {
				CanvasHelper.arrowhead(this._ctx, p.x2, p.y2, ra1, dir * ta);
				this._ctx.fill();
			}
		}
	},

	_drawConnector: function(p, i, pp) {
		if (DEBUG) {
			if (this._debugGraph) {
				if (i == 0) {
					CanvasHelper.drawVGuide(this._ctx, _dStyles["grey"], p.x1);
					CanvasHelper.drawVGuide(this._ctx, _dStyles["grey"], p.cx1);
					CanvasHelper.drawHGuide(this._ctx, _dStyles["grey"], p.y1);
					CanvasHelper.drawCircle(this._ctx, _dStyles["midnightblue"], p.x1, p.y1, 10);
				}
				// CanvasHelper.drawVGuide(this._ctx, _dStyles["grey"], p.cx2);
				CanvasHelper.drawHGuide(this._ctx, _dStyles["grey"], p.cy2);
				// _dStyles[p.dy > 0 ? "lightgreen" : "salmon"], p.cy2);
			}
		}

		this._ctx.beginPath();
		this._ctx.moveTo(p.x2, p.cy2);
		this._ctx.arcTo(p.tx2, p.cy2, p.tx1, p.cy1, p.r2);
		this._ctx.arcTo(p.tx1, p.cy1, p.cx1, p.cy1, p.r1);
		this._ctx.arcTo(p.cx0, p.cy1, p.cx0, p.y1, p.r0);

		// p.cx00 = p.x1 + ((p.r0 + p.di) * p.qx);
		// p.cy00 = (p.cy1 + p.y1) / 2;
		// this._ctx.arcTo(p.cx00, p.cy1, p.cx00, p.cy00, p.r0 / 2);
		// this._ctx.arcTo(p.cx00, p.y1, p.x1, p.y1, p.r0 / 2);
		// this._ctx.lineTo(p.x1, p.y1);

		// p.cx00 = p.x1 + (p.r0 * p.qx * 2);
		// this._ctx.lineTo(p.cx00, p.cy1);
		// this._ctx.quadraticCurveTo(p.cx0, p.cy1, p.cx0, p.y1);

		// this._ctx.lineTo(p.cx0, p.y1);
		this._ctx.stroke();

		if (DEBUG) {
			if (this._debugGraph) {
				CanvasHelper.drawCrosshair(this._ctx, _dStyles["blue"],
					p.x1 + ((p.r0 + p.di) * p.qx), p.cy1, 3);
				CanvasHelper.drawSquare(this._ctx, _dStyles["midnightblue"], p.cx0, p.cy1, 2);
				CanvasHelper.drawCircle(this._ctx, _dStyles["blue"], p.cx1, p.cy1, 1);
				CanvasHelper.drawSquare(this._ctx, _dStyles["blue"], p.tx1, p.cy1, 2);
				CanvasHelper.drawSquare(this._ctx, _dStyles["green"], p.tx2, p.cy2, 2);
				CanvasHelper.drawCircle(this._ctx, _dStyles["green"], p.cx2, p.cy2, 1);

				CanvasHelper.drawCircle(this._ctx, _dStyles["olive"], p.x2, p.cy2, 3);
				CanvasHelper.drawCrosshair(this._ctx, _dStyles["olive"], p.x2, p.y2, 6);
			}
		}
	},

	_roundTo: function(n, p) {
		if (p > 1) p = 1 / p;
		return Math.round(n / p) * p;
	},

	/*
	_computeConnectors: function(d) {
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
		d.maxLength = qx;
	}, */

});

if (DEBUG) {
	// GraphView.prototype._logFlags = "";

	GraphView.prototype._traceScroll = function(type) {
		var tpl = "%s:[%s] DPR:%i " +
			"[window: %i %i] " +
			"[html: %i %i %i] " +
			"[body: %i %i %i] " +
			"[container: %i %i %i] " +
			"[graph: %i %i %i]";
		console.log(tpl, this.cid, type, this._canvasRatio,
			window.scrollY,
			window.pageYOffset,
			document.documentElement.clientHeight,
			document.documentElement.scrollTop,
			document.documentElement.scrollHeight,
			document.body.clientHeight,
			document.body.scrollTop,
			document.body.scrollHeight,
			document.body.firstElementChild.clientHeight,
			document.body.firstElementChild.scrollTop,
			document.body.firstElementChild.scrollHeight,
			this.el.clientHeight,
			this.el.scrollTop,
			this.el.scrollHeight
		);
	};

	var debouncedLog = _.debounce(_.bind(console.log, console), 500, true);
	var applyMethod = function(context, args) {
		return Array.prototype.shift.apply(args).apply(context, args);
	}
	if (GraphView.prototype._logFlags.split(" ")["view.render"]) {
		// GraphView.prototype._requestRender = _.wrap(CanvasView.prototype._requestRender, function(fn) {
		// 	debouncedLog("%s::_requestRender", this.cid);
		// 	return applyMethod(this, arguments);
		// });
		GraphView.prototype._applyRender = _.wrap(CanvasView.prototype._applyRender, function(fn) {
			var retval;
			this._logFlags["view.render"] = false;
			debouncedLog("%s::_applyRender [debounced]", this.cid);
			retval = applyMethod(this, arguments);
			this._logFlags["view.render"] = true;
			return retval;
		});
	}
}

module.exports = GraphView;