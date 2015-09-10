/**
 * @module app/view/render/MediaRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");

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
		var sW, sH; // source dimensions
		var pcW, pcH; // measured values
		var cX, cY, cW, cH, cS; // computed values
		var sizing = this.getSizingEl();
		
		if (sizing === arguments[0]) {
			console.error("measure called with arg different than sizing element");
			sizing = arguments[0];
		}
		
		sizing.style.maxWidth = "";
		sizing.style.maxHeight = "";
		
		cX = sizing.offsetLeft + sizing.clientLeft;
		cY = sizing.offsetTop + sizing.clientTop;
		pcW = sizing.clientWidth;
		pcH = sizing.clientHeight;
		sW = this.model.get("w");
		sH = this.model.get("h");
		
		// Unless both client dimensions are larger than the source's
		// choose constraint direction by aspect ratio
		if (sW < pcW && sH < pcH) {
			cS = 1;
			cW = sW;
			cH = sH;
		} else if ((pcW/pcH) < (sW/sH)) {
			cW = pcW;
			cS = cW / sW;
			cH = Math.round(cS * sH);
		} else {
			cH = pcH;
			cS = cH / sH;
			cW = Math.round(cS * sW);
		}
		
		this.contentX = cX;
		this.contentY = cY;
		this.contentWidth = cW;
		this.contentHeight = cH;
		this.contentScale = cS;
		
		// var o = _.pick(content, function(val) {
		// 	return /^(offset|client)(Left|Top|Width|Height)/.test(val);
		// });
		// console.log(this.cid, "client",
		// 	content.clientLeft,
		// 	content.clientTop,
		// 	content.clientWidth,
		// 	content.clientHeight
		// );
		// console.log(this.cid, "offset",
		// 	content.offsetLeft,
		// 	content.offsetTop,
		// 	content.offsetWidth,
		// 	content.offsetHeight
		// );
		return this;
	},
	
	render: function () {
		/*
		var content = this.getContentEl();
		
		content.style.left = this.contentX + "px";
		content.style.top = this.contentY + "px";
		content.style.width = this.contentWidth + "px";
		content.style.height = this.contentHeight + "px";
		
		// sizing.style.maxWidth = (cW + (poW - pcW)) + "px";
		// sizing.style.maxHeight = (cH + (poH - pcH)) + "px";
		sizing.style.maxWidth = content.offsetWidth + "px";
		sizing.style.maxHeight = content.offsetHeight + "px";
		// sizing.style.maxWidth = cW + "px";
		// sizing.style.maxHeight = cH + "px";
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
