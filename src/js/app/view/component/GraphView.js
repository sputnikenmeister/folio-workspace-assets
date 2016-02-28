/**
* @module app/view/component/GraphView
*/

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
// /** @type {Function} */
// var Color = require("color");

/** @type {module:app/view/base/View} */
var CanvasView = require("app/view/base/CanvasView");
/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");

var MIN_CANVAS_RATIO = 2;

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
		
		this.listenTo(this.model, "change", function(attrName) {
			console.log("%s::[%s]", this.cid, attrName);
			this.requestRender(CanvasView.MODEL_INVALID);
		});
	},
	
	/** @override */
	_updateCanvas: function() {
		CanvasView.prototype._updateCanvas.apply(this, arguments);
		console.log("%s::_updateCanvas [size: %fpx x %fpx] [fg: %s] [bg: %s]", this.cid, this._canvasWidth, this._canvasHeigth, this._color, this._backgroundColor);
	},
	
	/* --------------------------- *
	/* redraw
	/* --------------------------- */
	
	/** @override */
	redraw: function(context, changed) {
		this._clearCanvas(0, 0,this._canvasWidth, this._canvasHeigth);
		context.save();
		
		var s = "This is GraphView";
		var sw = context.measureText(s).width;
		context.fillText(s, (this._canvasWidth - sw)/2, this._canvasHeigth/2, sw);
		
		var strokeW = 1 * this._canvasRatio;
		context.lineWidth = strokeW;
		// context.strokeRect(10, 10, this._canvasWidth-20, this._canvasHeigth-20);
		context.strokeRect(strokeW/2, strokeW/2, this._canvasWidth - strokeW, this._canvasHeigth - strokeW);
		
		// console.log("%s::redraw", this.cid, this._canvasWidth, this._canvasHeigth);
		context.restore();
	},
});

module.exports = GraphView;
