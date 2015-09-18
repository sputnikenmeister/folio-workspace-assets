/**
 * @module app/view/render/MediaRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:underscore} */
var getBoxMetrics = require("../../../utils/css/getBoxMetrics");

/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../../model/item/MediaItem");
/** @type {module:app/view/CarouselRenderer} */
var CarouselRenderer = require("./CarouselRenderer");

/**
 * @constructor
 * @type {module:app/view/render/MediaRenderer}
 */
module.exports = CarouselRenderer.extend({
	
	/** @type {string} */
	cidPrefix: "media-renderer-",
	/** @type {string} */
	className: CarouselRenderer.prototype.className + " media-item idle",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	
	/** @override */
	initialize: function (opts) {
		CarouselRenderer.prototype.initialize.apply(this, arguments);
		
		this.metrics.media = {};
		
		if (this.model.attrs().hasOwnProperty("@classname")) {
			this.el.className += " " + this.model.attrs()["@classname"];
		}
	},
	
	/* --------------------------- *
	/* child getters
	/* --------------------------- */
	
	/** @return {HTMLElement} */
	getDefaultImage: function () {
		return this._defaultImage || (this._defaultImage = this.el.querySelector("img.default"));
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	// createChildren: function() {
	// 	this.el.innerHTML = this.template(this.model.toJSON());
	// },
	
	/** @override */
	measure: function () {
		var sw, sh; // source dimensions
		var pcw, pch; // measured values
		var cx, cy, cw, ch, cs; // computed values
		var ew, eh; // content edge totals
		var cm; // content metrics
		
		CarouselRenderer.prototype.measure.apply(this, arguments);
		
		// sizing.style.maxWidth = "";
		// sizing.style.maxHeight = "";
		// cx = sizing.offsetLeft + sizing.clientLeft;
		// cy = sizing.offsetTop + sizing.clientTop;
		// pcw = sizing.clientWidth;
		// pch = sizing.clientHeight;
		// this.metrics.content.x = sizing.offsetLeft + sizing.clientLeft;
		// this.metrics.content.y = sizing.offsetTop + sizing.clientTop;
		// this.metrics.content.width = sizing.clientWidth;
		// this.metrics.content.height = sizing.clientHeight;
		
		// m = getBoxMetrics(this.getContentEl());
		
		cm = this.metrics.content;
		// cx = cm.x;
		// cy = cm.y;
		pcw = cm.width;
		pch = cm.height;
		
		
		ew = (cm.paddingLeft + cm.paddingRight + cm.borderLeftWidth + cm.borderRightWidth);
		eh = (cm.paddingTop + cm.paddingBottom + cm.borderTopWidth + cm.borderBottomWidth);
		pcw -= ew;
		pch -= eh;
		
		sw = this.model.get("w");
		sh = this.model.get("h");
		
		// Unless both client dimensions are larger than the source's
		// choose constraint direction by aspect ratio
		if (sw < pcw && sh < pch) {
			cs = 1;
			cw = sw;
			ch = sh;
		} else if ((pcw / pch) < (sw / sh)) {
			cw = pcw;
			cs = cw / sw;
			ch = Math.round(cs * sh);
		} else {
			ch = pch;
			cs = ch / sh;
			cw = Math.round(cs * sw);
		}
		
		// this.metrics.content.x = cx;
		// this.metrics.content.y = cy;
		// this.metrics.media.width = cw;// + ew;
		// this.metrics.media.height = ch;// + eh;
		// this.contentScale = cs;
		
		this.metrics.media.width = cw;// + ew;
		this.metrics.media.height = ch;// + eh;
		this.metrics.media.scale = cs;
		// this.metrics.media.aspectRatio = sw / sh;
		
		var sizing = this.getSizingEl();
		sizing.style.maxWidth = (cw + ew) + "px";
		sizing.style.maxHeight = (ch + eh) + "px";
		
		return this;
	},
	
	render: function () {
		/*
		var content = this.getContentEl();
		
		content.style.left = this.metrics.content.x + "px";
		content.style.top = this.metrics.content.y + "px";
		content.style.width = this.metrics.media.width + "px";
		content.style.height = this.metrics.media.height + "px";
		
		// sizing.style.maxWidth = (cW + (poW - pcw)) + "px";
		// sizing.style.maxHeight = (cH + (poH - pch)) + "px";
		sizing.style.maxWidth = content.offsetWidth + "px";
		sizing.style.maxHeight = content.offsetHeight + "px";
		// sizing.style.maxWidth = cw + "px";
		// sizing.style.maxHeight = ch + "px";
		*/
		return this;
	},
	
	// constructor: function () {
	// 	View.apply(this, arguments);
	// 	
	// 	// var _defaultImage;
	// 	// Object.defineProperty(this, "defaultImage", {get: function() {
	// 	// 	return _defaultImage || (_defaultImage = this.el.querySelector("img.default"));
	// 	// }});
	// 	// var _sizing;
	// 	// Object.defineProperty(this, "sizing", {get: function() {
	// 	// 	return _sizing || (_sizing = this.el.querySelector(".sizing"));
	// 	// }});
	// 	// var _content;
	// 	// Object.defineProperty(this, "content", {get: function() {
	// 	// 	return _content || (_content = this.el.querySelector(".content"));
	// 	// }});
	// 	
	// 	var _defaultImage, _sizing, _content;
	// 	Object.defineProperties(this, {
	// 		"defaultImage": { get: this.getDefaultImage },
	// 		"sizing": { get: this.getSizingEl },
	// 		"content": { get: this.getContentEl },
	// 	});
	// },
},{
	/** @type {module:app/view/promise/whenSelectionIsContiguous} */
	whenSelectionIsContiguous: require("../promise/whenSelectionIsContiguous"),
	/** @type {module:app/view/promise/whenSelectTransitionEnds} */
	whenSelectTransitionEnds: require("../promise/whenSelectTransitionEnds"),
	/** @type {module:app/view/promise/whenDefaultImageLoads} */
	whenDefaultImageLoads: require("../promise/whenDefaultImageLoads"), 
});
