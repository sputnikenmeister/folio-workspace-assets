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

var MIN_CANVAS_RATIO = 2;
var PI2 = Math.PI*2;

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
	initialize: function (options) {
		CanvasView.prototype.initialize.apply(this, arguments);
		
		this._styleData = {};
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
		var bgColor = this.model.get("withBundle")? this.model.get("bundle").colors.bgColor : Color(Globals.DEFAULT_COLORS["background-color"]);
		var lightColor = Color(this._color).mix(bgColor, 0.5).hexString();
		// var lightColor = Color(this._color).alpha(0.4).rgbaString();
		
		this._styleData["light"] = {
			lineWidth: 1,
			strokeStyle: lightColor,
			// fillStyle: lightColor,
			// font: "600 " + this._fontSize + "px " + this._fontFamily
		};
		
		var bounds = this.el.getBoundingClientRect();
		context.setTransform(this._canvasRatio, 0, 0, this._canvasRatio,
				-bounds.left * this._canvasRatio, -bounds.top * this._canvasRatio);
		
		this._captureMetrics();
	},
	
	_captureMetrics: function() {
		
		this._rectA = this._listA.el.getBoundingClientRect();
		this._rectB = this._listB.el.getBoundingClientRect();
	},
	
	/* --------------------------- *
	/* redraw
	/* --------------------------- */
	
	redraw: function(context, interpolator) {
		this._redraw_fromElements(context, interpolator);
		// this._redraw_fromViews(context, interpolator);
	},
	
	_redraw_fromViews: function(context, interpolator) {
		var i, ii;
		var view, rect, model, mCids;
		var xA, yA, // start point
			xB, yB, // end point
			xAb, yAb, // bezier ctrl
			xBb, yBb, // bezier ctrl
			xAa, // bezier start offset
			xBa, // bezier start offset
			oRectA, oRectB; // origin (from getBoundingClientRect)
		
		// apply style
		_.extend(context, this._styleData["light"]);
		// bundle to keywords
		if (model = this.model.get("bundle")) {
			oRectA = this._rectA;
			oRectB = this._rectB;
			
			view = this._listA.itemViews.findByModel(model);
			if (view._metrics) {
				xA = oRectA.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
				yA = oRectA.top + view.transform.ty + view._metrics.offsetHeight/2;
			} else {
				return;
				// rect = view.label.getBoundingClientRect();
				// xA = rect.left + rect.width;
				// yA = rect.top + rect.height/2;
			}
			
			xAa = Math.max(xA, oRectA.left + oRectA.width);
			xBa = oRectB.left;
			
			// this.hGroupings[0]
			
			mCids = model.get("tIds");
			for (i = 0, ii = mCids.length; i < ii; i++) {
				view = this._listB.itemViews.findByModel(types.get(mCids[i]));
				if (view._metrics) {
					rect = view.label.getBoundingClientRect();
					xBa = Math.min(xBa, rect.left);//oRectB.left + view.transform.tx + view._metrics.textLeft);
					console.log(rect.left, view.transform.tx, view._metrics.offsetLeft, view._metrics.textLeft);
				} else {
					break;
				}
			}
			
			mCids = model.get("kIds");
			for (i = 0, ii = mCids.length; i < ii; i++) {
				view = this._listB.itemViews.findByModel(keywords.get(mCids[i]));
				if (view._metrics) {
					xB = oRectB.left + view.transform.tx + view._metrics.textLeft;
					yB = oRectB.top + view.transform.ty + view._metrics.offsetHeight/2;
				} else {
					break;
					// rect = view.label.getBoundingClientRect();
					// xB = rect.left + rect.width;
					// yB = rect.top + rect.height/2;
				}
				context.beginPath();
				context.moveTo(xA, yA);
				context.lineTo(xB, yB);
				context.stroke();
				// console.log(xA, yA, xB, yB);
			}
			// context.fillRect(oRectA.left, oRectA.top, oRectA.width, oRectA.height);
			// context.fillRect(oRectB.left, oRectB.top, oRectB.width, oRectB.height);
			
			// console.groupEnd();
		}
		
		// this._listA.itemViews.forEach(function(view) {
		// 	if (view.transform && view._metrics) {
		// 		context.strokeRect(
		// 			view.transform.tx + view._metrics.offsetWidth + 0.5,
		// 			view.transform.ty + view._metrics.offsetHeight/2 + 0.5,
		// 			2, 1);
		// 	}
		// });
		
		// keyword to bundles
		// oRectA = this._rectB;
		// oRectB = this._rectA;
	},
	
	_redraw_fromElements: function(context, interpolator) {
		// console.group(this.cid + "::_onGraphRedraw");
		this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeigth);
		context.save();
		
		_.extend(context, this._styleData["light"]);
		// var so = this._styleData["light"];
		// for (var prop in so) {
		// 	if (so.hasOwnProperty(prop)) {
		// 		context[prop] = so[prop];
		// 	}
		// }
		
		// NOTE: scale adjust to pixel ratio begins
		// var ratio = this.canvasRatio;
		// var bounds = this.el.getBoundingClientRect();
		// context.setTransform(ratio, 0, 0, ratio, -bounds.left * ratio, -bounds.top * ratio);
		
		var i, ii, el, els;
		var elA, elB;
		var xAm, xBm;
		var xAo, xBo;
		var rA, xA, yA;
		var rB, xB, yB;
		var skipBo;
		
		var m = 10;
		
		// connector root elements
		elA = this._listA.el.querySelector(".list-item.selected .label");
		elB = this._listB.el.querySelector(".list-item.selected .label");
		
		// connector minimum branch x
		el = this._listB.el.querySelector(".list-group:not(.excluded) .label");
		xBm = el? el.getBoundingClientRect().left: this._rectB.left;
		xAm = this._rectA.left + this._rectA.width;
		
		// bundle to keywords
		if (elA) {
			rA = elA.getBoundingClientRect();
			xAo = rA.left + rA.width + m;
			xA = Math.max(xAo, xAm);
			yA = rA.top + rA.height/2;
			context.setLineDash([]);
			
			els = this._listB.el.querySelectorAll(".list-item:not(.excluded) .label");
			for (i = 0, ii = els.length; i < ii; i++) {
				
				rB = els.item(i).getBoundingClientRect();
				xBo = rB.left - m;
				xB = Math.min(xBo, xBm);
				yB = rB.top + rB.height/2;
				
				this.drawBezierConnector(context, xA, yA, xB, yB, xAo, xBo);
				xAo = null; // draw trunk once
				
				// yB = Math.floor(yB) + 0.5;
				// xMid = (xB + xA)/2;
				// 
				// // xBb = xB - 50;
				// // yBb = yB;
				// 
				// context.beginPath();
				// context.moveTo(xA, yA);
				// // context.lineTo(xB, yB);
				// // context.bezierCurveTo(xAb, yAb, xBb, yBb, xB, yB);
				// // context.bezierCurveTo(xB, yA, xA, yB, xB, yB);
				// context.bezierCurveTo(xMid, yA, xMid, yB, xB, yB);
				// context.lineTo(xBo, yB);
				// context.stroke();
				
				if (els.item(i) === elB) {
					skipBo = true;
				}
			}
		}
		
		// keyword to bundles
		if (elB) {
			rB = elB.getBoundingClientRect();
			xBo = rB.left - m;
			xB = Math.min(xBo, xBm);
			yB = rB.top + rB.height/2;
			
			context.lineWidth *= 5;
			context.setLineDash([6, 2]);
			
			if (skipBo) {
				xBo = null;
			}
			//  else {
			// 	context.lineDashOffset = 2;
			// 	context.beginPath();
			// 	context.moveTo(xBo, yB);
			// 	context.lineTo(xB, yB);
			// 	context.stroke();
			// 	context.lineDashOffset = 0;
			// 	xBo = null;
			// }
			
			els = this._listA.el.querySelectorAll(".list-item:not(.excluded) .label");
			for (i = 0, ii = els.length; i < ii; i++) {
				if (els.item(i) === elA) continue;
				
				// context.lineDashOffset = Math.random() * 10;
					
				rA = els.item(i).getBoundingClientRect();
				xAo = rA.left + rA.width + m;
				xA = Math.max(xAo, xAm);
				yA = rA.top + rA.height/2;
				
				this.drawBezierConnector(context, xB, yB, xA, yA, xBo, xAo);
				xBo = null; // draw trunk once
				
				// yA = Math.floor(yA) + 0.5;
				// xMid = (xB + xA)/2;
				// 
				// // // xAb = xB + 100;
				// // // xAb = 0.666 * (rB.left - xA) + xA;
				// // // xAb = 0.75 * (rB.left - rB.left - rB.width) + rB.left;
				// // xAb = 0.75 * (rB.left - rA.left) + rA.left;
				// // yAb = yA;
				// // xBb = xB - 50;//0.6 * (rB.left - xA) + xA;
				// // yBb = yB;
				// 
				// context.beginPath();
				// context.moveTo(xB, yB);
				// // context.lineTo(xA, yA);
				// // context.bezierCurveTo(xBb, yBb, xAb, yAb, xA, yA);
				// // context.bezierCurveTo(xA, yB, xB, yA, xA, yA);
				// context.bezierCurveTo(xMid, yB, xMid, yA, xA, yA);
				// context.lineTo(xAo, yA);
				// context.stroke();
			}
		}
		
		// console.groupEnd();
		context.restore();
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

	drawBezierConnector: function(context, xA, yA, xB, yB, xAo, xBo) {
		var xMid;
		
		yA = Math.floor(yA) + 0.5;
		yB = Math.floor(yB) + 0.5;
		xMid = (xB + xA)/2;
		
		context.beginPath();
		if (xAo !== null) {
			context.moveTo(xAo, yA);
			context.lineTo(xA, yA);
		} else {
			context.moveTo(xA, yA);
		}
		// context.bezierCurveTo(xA, yB, xB, yA, xA, yA);
		context.bezierCurveTo(xMid, yA, xMid, yB, xB, yB);
		if (xBo !== null) {
			context.lineTo(xBo, yB);
		}
		context.stroke();
	},
	
	///** @override */
	/*
	updateCanvas: function(context) {
		// CanvasView.prototype._updateCanvas.apply(this, arguments);
		this.trigger("canvas:update", this.context);
	},
	*/
	
	///** @override */
	/*
	redraw: function(context, changed) {
		this.clearCanvas();
		context.save();
		this.trigger("canvas:redraw", context, this._interpolator);
		context.restore();
	},
	clearCanvas: function() {
		this._clearCanvas(0, 0, this._canvasWidth, this._canvasHeigth);
	},
	*/
	
	/*
	_onGraphUpdate: function(context) {
		var lightColor = Color(this._color).alpha(0.4).rgbaString();
		this._styleData["light"] = {
			lineWidth: 1,
			strokeStyle: lightColor,
			fillStyle: lightColor,
			font: "600 " + this._fontSize + "px " + this._fontFamily
		};
		
		var ratio = this.canvasRatio;
		var bounds = this.el.getBoundingClientRect();
		context.setTransform(this.canvasRatio, 0, 0, this.canvasRatio, -bounds.left * this.canvasRatio, -bounds.top * this.canvasRatio);
		
		this._boundsA = this._listA.el.getBoundingClientRect();
		this._boundsB = this._listB.el.getBoundingClientRect();
	},
	
	_onGraphRedraw: function(context, interpolator) {
		this._onGraphRedraw2(context, interpolator);
		// this._onGraphRedraw1(context, interpolator);
	},
	
	_onGraphRedraw2: function(context, interpolator) {
		var i, ii;
		var view, rect, model, mCids;
		var xA, yA, // start point
			xB, yB, // end point
			xAb, yAb, // bezier ctrl
			xBb, yBb, // bezier ctrl
			xAa, // bezier start offset
			xBa, // bezier start offset
			oRectA, oRectB; // origin (from getBoundingClientRect)
		
		// apply style
		_.extend(context, this._styleData["light"]);
		// bundle to keywords
		if (model = this.model.get("bundle")) {
			oRectA = this._boundsA;
			oRectB = this._boundsB;
			
			view = this._listA.itemViews.findByModel(model);
			if (view._metrics) {
				xA = oRectA.left + view.transform.tx + view._metrics.textLeft + view._metrics.textWidth;
				yA = oRectA.top + view.transform.ty + view._metrics.offsetHeight/2;
			} else {
				return;
				// rect = view.label.getBoundingClientRect();
				// xA = rect.left + rect.width;
				// yA = rect.top + rect.height/2;
			}
			
			xAa = Math.max(xA, oRectA.left + oRectA.width);
			xBa = oRectB.left;
			
			// this.hGroupings[0]
			
			mCids = model.get("tIds");
			for (i = 0, ii = mCids.length; i < ii; i++) {
				view = this._listB.itemViews.findByModel(this._listB.groups.get(mCids[i]));
				if (view._metrics) {
					rect = view.label.getBoundingClientRect();
					xBa = Math.min(xBa, rect.left);//oRectB.left + view.transform.tx + view._metrics.textLeft);
					console.log(rect.left, view.transform.tx, view._metrics.offsetLeft, view._metrics.textLeft);
				} else {
					break;
				}
			}
			
			mCids = model.get("kIds");
			for (i = 0, ii = mCids.length; i < ii; i++) {
				view = this._listB.itemViews.findByModel(this._listB.collection.get(mCids[i]));
				if (view._metrics) {
					xB = oRectB.left + view.transform.tx + view._metrics.textLeft;
					yB = oRectB.top + view.transform.ty + view._metrics.offsetHeight/2;
				} else {
					break;
					// rect = view.label.getBoundingClientRect();
					// xB = rect.left + rect.width;
					// yB = rect.top + rect.height/2;
				}
				context.beginPath();
				context.moveTo(xA, yA);
				context.lineTo(xB, yB);
				context.stroke();
				// console.log(xA, yA, xB, yB);
			}
			// context.fillRect(oRectA.left, oRectA.top, oRectA.width, oRectA.height);
			// context.fillRect(oRectB.left, oRectB.top, oRectB.width, oRectB.height);
			
			// console.groupEnd();
		}
		
		// this._listA.itemViews.forEach(function(view) {
		// 	if (view.transform && view._metrics) {
		// 		context.strokeRect(
		// 			view.transform.tx + view._metrics.offsetWidth + 0.5,
		// 			view.transform.ty + view._metrics.offsetHeight/2 + 0.5,
		// 			2, 1);
		// 	}
		// });
		
		// keyword to bundles
		// oRectA = this._boundsB;
		// oRectB = this._boundsA;
	},
	
	_onGraphRedraw1: function(context, interpolator) {
		// console.group(this.cid + "::_onGraphRedraw");
		_.extend(context, this._styleData["light"]);
		// var so = this._styleData["light"];
		// for (var prop in so) {
		// 	if (so.hasOwnProperty(prop)) {
		// 		context[prop] = so[prop];
		// 	}
		// }
		
		// NOTE: scale adjust to pixel ratio begins
		// var ratio = this.canvasRatio;
		// var bounds = this.el.getBoundingClientRect();
		// context.setTransform(ratio, 0, 0, ratio, -bounds.left * ratio, -bounds.top * ratio);
		
		var i, ii, el, els;
		var rA, xA, yA;
		var rB, xB, yB;
		var xAb, yAb, xBb, yBb; // bezier control points
		var oRectA, oRectB; // origin (from getBoundingClientRect)
		var xAo, xBo;
		var xAm, xBm;
		
		// bundle to keywords
		oRectA = this._boundsA;
		oRectB = this._boundsB;
		
		el = this._listB.el.querySelector(".list-group:not(.excluded) .label");
		xBm = el? el.getBoundingClientRect().left - 20: this._boundsB.left;
		xAm = oRectA.left + oRectA.width;
		
		el = this._listA.el.querySelector(".list-item.selected .label");
		if (el) {
			
			rA = el.getBoundingClientRect();
			xAo = rA.left + rA.width;
			xA = Math.max(xAo, xAm);
			yA = rA.top + rA.height/2;
			
			// xAb = xA + 50;
			// yAb = yA;
			// context.strokeRect(xA, yA, rA.width, rA.height);
			
			context.setLineDash([]);
			
			els = this._listB.el.querySelectorAll(".list-item:not(.excluded) .label");
			for (i = 0, ii = els.length; i < ii; i++) {
				
				rB = els.item(i).getBoundingClientRect();
				xBo = rB.left;
				xB = Math.min(xBo, xBm);
				yB = rB.top + rB.height/2;
				
				// xBb = xB - 50;
				// yBb = yB;
				
				context.beginPath();
				context.moveTo(xAo, yA);
				context.lineTo(xA, yA);
				// context.bezierCurveTo(xAb, yAb, xBb, yBb, xB, yB);
				context.bezierCurveTo(xB, yA, xA, yB, xB, yB);
				// context.lineTo(xB, yB);
				context.lineTo(xBo, yB);
				context.stroke();
			}
		}
		
		// keyword to bundles
		oRectA = this._boundsB;
		oRectB = this._boundsA;
		el = this._listB.el.querySelector(".list-item.selected .label");
		if (el) {
			context.setLineDash([6, 2]);
			rB = el.getBoundingClientRect();
			xBo = rB.left;
			xB = Math.min(xBo, xBm);
			yB = rB.top + rB.height/2;
			
			// xBb = xB - 100;
			// yBb = yB;
			
			els = this._listA.el.querySelectorAll(".list-item:not(.excluded) .label");
			for (i = 0, ii = els.length; i < ii; i++) {
				rA = els.item(i).getBoundingClientRect();
				xAo = rA.left + rA.width;
				xA = Math.max(xAo, xAm);
				yA = rA.top + rA.height/2;
				
				// // xAb = xB + 100;
				// // xAb = 0.666 * (rB.left - xA) + xA;
				// // xAb = 0.75 * (rB.left - rB.left - rB.width) + rB.left;
				// xAb = 0.75 * (rB.left - rA.left) + rA.left;
				// yAb = yA;
				// xBb = xB - 50;//0.6 * (rB.left - xA) + xA;
				// yBb = yB;
				
				context.lineDashOffset = Math.random() * 10;
				context.beginPath();
				context.moveTo(xBo, yB);
				context.lineTo(xB, yB);
				// context.lineTo(xA, yA);
				// context.bezierCurveTo(xBb, yBb, xAb, yAb, xA, yA);
				context.bezierCurveTo(xA, yB, xB, yA, xA, yA);
				context.lineTo(xAo, yA);
				context.stroke();
				
				// bezier control pts
				// context.setLineDash([1]);
				// context.beginPath();
				// context.arc(xAb, yAb, 4, 0, PI2);
				// context.stroke();
				// context.beginPath();
				// context.arc(xBb, yBb, 4, 0, PI2);
				// context.stroke();
				
				// bezier control lines
				// context.setLineDash([1, 3]);
				// context.beginPath();
				// context.moveTo(xA, yA);
				// context.lineTo(xAb, yAb);
				// context.stroke();
				// context.beginPath();
				// context.moveTo(xB, yB);
				// context.lineTo(xBb, yBb);
				// context.stroke();
				
			}
		}
		
		// console.groupEnd();
	},
	
	*/
});

module.exports = GraphView;
