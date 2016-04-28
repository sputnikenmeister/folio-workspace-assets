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

		// this.listenTo(this.model, "change", function(attrName) {
		// 	console.log("%s:model:[change:%s]", this.cid, attrName);
		// 	this.requestRender(CanvasView.MODEL_INVALID);
		// });
		// this.listenTo(this.model, "all", function() {
		// 	console.log("%s:model:[all]", this.cid, arguments);
		// });

		// this.listenTo(this, {
		// 	"canvas:update": this._onGraphUpdate,
		// 	"canvas:redraw": this._onGraphRedraw,
		// });
	},

	/** @override */
	updateCanvas: function(context) {
		this._updateMetrics();
		this._updateStyles();
	},

	_updateStyles: function() {
		// var font = "600 " + this._fontSize + "px " + this._fontFamily;
		var bgColor = this.model.get("withBundle") ? this.model.get("bundle").colors.bgColor : Color(Globals.DEFAULT_COLORS["background-color"]);
		var hairlineColor = Color(this._color).mix(bgColor, 0.5).hexString();
		var lightColor = Color(this._color).mix(bgColor, 0.25).hexString();
		// var translucidColor = Color(this._color).alpha(0.4).rgbaString();

		this._styleData["hairline1"] = {
			lineWidth: 0.50,
			strokeStyle: this._color,
		};
		this._styleData["hairline2"] = {
			lineWidth: 0.85,
			strokeStyle: hairlineColor,
		};
		this._styleData["light"] = {
			lineWidth: 4.05,
			strokeStyle: lightColor,
		};
	},

	_updateMetrics: function() {
		var bounds = this.el.getBoundingClientRect();
		this._ctx.setTransform(this._canvasRatio, 0, 0, this._canvasRatio, -bounds.left * this._canvasRatio - 0.5, -bounds.top * this._canvasRatio - 0.5);
		
		var listView, listRect, listPos;
		
		listView = this._listA;
		listRect = listView.el.getBoundingClientRect();
		// listPos = listView.itemViews.map(function(view, i) {
		// 	return {
		// 		cid: view.id,
		// 		x: listRect.left + view.transform.tx + view._metrics.textLeft,
		// 		y: listRect.top + view.transform.ty + view._metrics.offsetHeight / 2,
		// 	};
		// }, this);
		// listPos.sort(function(a, b) {
		// 	if (a.y > b.y) return 1;
		// 	if (a.y < b.y) return -1;
		// 	return 0;
		// });
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
			if (view._metrics) {
				rect = view.label.getBoundingClientRect();
				this._minB = Math.min(this._minB, rect.left);
				//this._rectB.left + view.transform.tx + view._metrics.textLeft);
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

	/* --------------------------- *
	/* redraw
	/* --------------------------- */

	redraw: function(context, interpolator) {
		this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeigth);
		context.save();
		// apply style
		_.extend(context, this._styleData["hairline2"]);
		// var so = this._styleData["light"];
		// for (var prop in so) {
		// 	if (so.hasOwnProperty(prop)) {
		// 		context[prop] = so[prop];
		// 	}
		// }

		context.save();
		// this._redraw_fromViews(context, interpolator);
		this._redraw_fromElements(context, interpolator);
		context.restore();

		// context.translate(5,5);
		// 
		// context.save();
		// this._redraw_fromElements(context, interpolator);
		// context.restore();

		context.restore();
	},

	_redraw_fromElements: function(context, interpolator) {
		var i, el, els, numEls;
		var elA, elB, rectA, rectB, skipBo;
		var x1, y1, x2, y2;
		var cx1, cy1, cx2, cy2;
		var xMin1, xMin2;
		var r1, r2;
		var cx0, cy0, r0;

		var elsPos, maxDistIdx;
		var rInc = 4,
			rBase = 8,
			xMargin = rBase * 2; // line-element separation in px
		
		// keyword to bundles
		elB = this._listB.el.querySelector(".list-item.selected .label");
		if (elB) {
			// context.lineWidth *= 3;
			// context.setLineDash([6, 2]);
			xMin1 = this._minB;
			xMin2 = this._minA;
			rectB = elB.getBoundingClientRect();
			x1 = rectB.left - xMargin; // if (skipBo) x1 = null;
			y1 = rectB.top + rectB.height / 2;
			cx1 = Math.min(x1, xMin1 - xMargin);
			r2 = rBase;

			els = this._listA.el.querySelectorAll(".list-item:not(.excluded) .label");
			numEls = els.length;
			
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

			r0 = rInc; //els.length * rInc * 0.5;
			cx0 = x1 - r0 * 2;

			for (i = 0; i < numEls; i++) {
				// if (els.item(i) === elA) continue;
				rectA = els.item(i).getBoundingClientRect();
				x2 = rectA.left + rectA.width + xMargin;
				y2 = rectA.top + rectA.height / 2;
				// x2 = elsPos[i].x;
				// y2 = elsPos[i].y;
				cx2 = Math.max(x2, xMin2 + xMargin);
				if (y1 > y2) {
					r1 = rBase + i * rInc;
				} else {
					r1 = rBase + (numEls - (i + 1)) * rInc;
				}
				cy1 = y1 + (i - (numEls - 1) / 2) * rInc;
				// cy1 -= numEls%2 * rInc;
				cy2 = y2;

				context.beginPath();
				// context.moveTo(x1, cy1);
				context.moveTo(x1, y1);
				drawArcHConnector(context, x1, y1, cx0, cy1, r0, r0, 1);
				drawArcHConnector(context, cx1, cy1, cx2, cy2, r1, r2);
				context.lineTo(x2, cy2);
				context.stroke();

				// this.drawBezierConnector(context, x1, y1, x2, y2, cx1, cx2);
				// drawArcHConnector(context, cx1, cy1, cx2, cy2, r2 - ro, r1 + ro);
				// ox2 = null; // draw trunk once
			}
		}

		// bundle to keywords
		elA = this._listA.el.querySelector(".list-item.selected .label");
		if (elA) {
			// context.setLineDash([]);
			xMin1 = this._minA;
			xMin2 = this._minB;
			rectA = elA.getBoundingClientRect();
			x1 = rectA.left + rectA.width + xMargin;
			y1 = rectA.top + rectA.height / 2;
			cx1 = Math.max(x1, xMin1 + xMargin);
			r2 = rBase;

			els = this._listB.el.querySelectorAll(".list-item:not(.excluded) .label");
			numEls = els.length;
			
			r0 = (els.length) / 2;
			cx0 = x1 + r0;
			// ro = els.length * roInc * 0.5;

			for (i = 0; i < numEls; i++) {
				rectB = els.item(i).getBoundingClientRect();
				x2 = rectB.left - xMargin;
				y2 = rectB.top + rectB.height / 2;
				cx2 = Math.min(x2, xMin2 - xMargin);
				if (y1 > y2) {
					r1 = rBase + i * rInc;
				} else {
					r1 = rBase + (numEls - (i + 1)) * rInc;
				}
				cy1 = y1 + (i - numEls / 2) * rInc;
				cy2 = y2;
				// ro += y1 < y2? -roInc: roInc;
				// cy1 = y1 + i * rInc;

				context.beginPath();
				context.moveTo(x1, y1);
				// context.moveTo(x1, cy1);
				drawArcHConnector(context, x1, y1, cx0, cy1, 0, r0);
				// drawArcHConnector(context, cx1, cy1, cx2, cy2, r1 + ro, r2 - ro);
				drawArcHConnector(context, cx1, cy1, cx2, cy2, r1, r2);
				context.lineTo(x2, cy2);
				context.stroke();

				// this.drawBezierConnector(context, x1, y1, x2, y2, cx1, cx2);
				// ox1 = null; // draw trunk once
				// if (els.item(i) === elB) {
				// 	skipBo = true;
				// }
			}

			// i = 0;
			// numEls = els.length;
			// r1 = roBase;
			// r2 = roBase;
			// 
			// for (; i < numEls; i++) {
			// 	if (y1 < y2) break;
			// 	
			// 	rectA = els.item(i).getBoundingClientRect();
			// 	x2 = rectA.left + rectA.width + m;
			// 	y2 = rectA.top + rectA.height/2;
			// 	cx2 = Math.max(x2, xMin2);
			// 	
			// 	cy1 = y1 + (i - numEls/2) * roInc;
			// 	cy2 = y2;
			// 	// r1 += roInc;
			// 	r1 = roBase + i * roInc;
			// 	
			// 	context.strokeStyle = "red";
			// 	context.beginPath();
			// 	context.moveTo(x1, cy1);
			// 	drawArcHConnector(context, cx1, cy1, cx2, cy2, r1, r2);
			// 	context.lineTo(x2, cy2);
			// 	context.stroke();
			// 	
			// }
			// 
			// // r1 = roBase + (numEls - i) * roInc;
			// for (; i < numEls; i++) {
			// 	rectA = els.item(i).getBoundingClientRect();
			// 	x2 = rectA.left + rectA.width + m;
			// 	y2 = rectA.top + rectA.height/2;
			// 	cx2 = Math.max(x2, xMin2);
			// 	
			// 	cy1 = y1 + (i - numEls/2) * roInc;
			// 	cy2 = y2;
			// 	// r1 -= roInc;
			// 	r1 = roBase + (numEls - i) * roInc;
			// 	
			// 	context.strokeStyle = "blue";
			// 	context.beginPath();
			// 	context.moveTo(x1, cy1);
			// 	drawArcHConnector(context, cx1, cy1, cx2, cy2, r1, r2);
			// 	context.lineTo(x2, cy2);
			// 	context.stroke();
			// }
		}
	},

	_redraw_fromViews: function(context, interpolator) {
		var i, numItems, view, rect, model, mCids;

		var xMid = (this._minA + this._minB) / 2;
		var yMin = Math.min(this._rectA.top, this._rectB.top);
		var yMax = Math.max(this._rectA.top + this._rectA.height, this._rectB.top + this._rectB.height);
		var dx = Math.abs(this._minA - this._minB);

		var ro, roInc = 2;
		var m = 10; // line-element separation in px

		var rr = 0.6; // r1 to r2 ratio
		var r1, r2;
		r1 = (dx / 4) * rr;
		r2 = (dx / 4) * (1 / rr);
		r1 = Math.floor(r1);
		r2 = Math.floor(r2);

		var x1, y1, x2, y2;
		var cx1, cy1, cx2, cy2;
		var xMin1, xMin2;

		xMin1 = this._minA;
		xMin2 = this._minB;

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
						// this.drawBezierConnector(context, x1, y1, x2, y2, ox1, ox2);
						// this.drawArcConnector(context, x1, y1, x2, y2, ox1, ox2, 20);
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

						// this.drawBezierConnector(context, x2, y2, x1, y1, ox2, ox1);
						// this.drawArcConnector(context, x1, y1, x2, y2, ox1, ox2);
						// this.drawArcConnector(context, x2, y2, x1, y1, ox2, ox1, 20);
						// drawArcHConnector(context, x1, y1, x2, y2, ox1, ox2, r1, r2);
					}
				}
			}
		}
	},

	_debug_bezierCtlPt: function(context, x, y, cx, cy, r) {
		// point to control line
		context.setLineDash([1, 3]);
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(cx, cy);
		context.stroke();
		// control point
		context.setLineDash([1]);
		context.beginPath();
		context.arc(cx, cy, r || 4, 0, PI2);
		context.stroke();
		context.setLineDash([]);
	},

	drawArcConnector: function(ctx, x1, y1, x2, y2, ox1, ox2, r) {
		var dx, dy, hx, hy, gx, gy;

		hx = 0;
		hy = 0;
		gx = (x1 + x2) / 2;
		gy = (y1 + y2) / 2;
		dx = Math.abs(x1 - gx);
		dy = Math.abs(y1 - gy);

		if (dx < r && dy < r) {
			r = Math.min(dx * Math.SQRT1_2, dy * Math.SQRT1_2);
		} else {
			if (dx < r) {
				hy = Math.acos(dx / r) * r * 0.5;
				if (y1 > y2) hy *= -1;
			}
			if (dy < r) {
				hx = Math.acos(dy / r) * r * 0.5;
				if (x1 > x2) hx *= -1;
			}
		}
		ctx.beginPath();
		ctx.moveTo(ox1 || x1, y1);
		// ctx.moveTo(x1, y1);

		/* axis change */
		// ctx.arcTo(x1, gy-hy, x2, gy+hy, r);
		// ctx.arcTo(x2, gy+hy, x2, y2, r);
		/* clueless */
		// ctx.arcTo(x1+dx, y1, x2-dx, y2, r);
		// ctx.arcTo(x2-dx, y2, x2, y2, r);
		// ctx.arcTo(gx-hx, y1-hy, gx+hx, y2+hy, r);
		// ctx.arcTo(gx+hx, y2+hy, x2, y2, r);

		ctx.arcTo(gx - hx, y1, gx + hx, y2, r);
		ctx.arcTo(gx + hx, y2, ox2 || x2, y2, r);
		ctx.lineTo(ox2 || x2, y2);
		ctx.stroke();
	},

	drawArcConnector2: function(context, x1, y1, x2, y2, ox1, ox2) {
		var cx, cy, dx, dy, hx, hy, mx, my;
		var radius = 20;

		hx = 0;
		hy = 0;
		mx = (x1 + x2) / 2;
		my = (y1 + y2) / 2;
		dx = Math.abs(x2 - x1) / 2;
		dy = Math.abs(y1 - y2) / 2;

		if (dx < radius && dy < radius) {
			radius = Math.min(dx * Math.SQRT1_2, dy * Math.SQRT1_2);
		} else {
			if (dx < radius) {
				hy = Math.acos(dx / radius) * radius;
			}
			if (dy < radius) {
				hx = Math.acos(dy / radius) * radius;
			}
		}

		context.save();
		cx = dx - hx;
		cy = dy - hy;
		context.beginPath();
		context.moveTo(ox1 || x1, y1);
		dx -= hx / 2;
		context.arcTo(x1 + dx, y1, x2 - dx, y2, radius);
		context.arcTo(x2 - dx, y2, ox2 || x2, y2, radius);
		context.lineTo(ox2 || x2, y2);
		context.stroke();
	},

	drawArcConnector1: function(context, x1, y1, x2, y2, ox1, ox2) {
		var xMid, r;

		y1 = Math.floor(y1) + 0.5;
		y2 = Math.floor(y2) + 0.5;
		xMid = (x2 + x1) / 2;
		xMid += x1 < x2 ? 10 : -10;
		r = 10;
		r = Math.min(r, Math.abs(y2 - y1) * 0.5 * Math.SQRT1_2);

		context.beginPath();
		context.moveTo(ox1 || x1, y1);
		context.arcTo(xMid, y1, xMid, y2, r);
		context.arcTo(xMid, y2, ox2 || x2, y2, r);
		if (ox2) context.lineTo(ox2, y2);
		context.stroke();
	},

	drawBezierConnector: function(context, x1, y1, x2, y2, ox1, ox2) {
		var xMid;

		y1 = Math.floor(y1) + 0.5;
		y2 = Math.floor(y2) + 0.5;
		xMid = (x2 + x1) / 2;

		context.beginPath();
		if (ox1 !== null) {
			context.moveTo(ox1, y1);
			context.lineTo(x1, y1);
		} else {
			context.moveTo(x1, y1);
		}
		// context.bezierCurveTo(x1, y2, x2, y1, x1, y1);
		context.bezierCurveTo(xMid, y1, xMid, y2, x2, y2);
		if (ox2 !== null) {
			context.lineTo(ox2, y2);
		}
		context.stroke();
	},
});

module.exports = GraphView;
