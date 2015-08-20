/**
 * @module app/view/render/PlayableRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");

/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../../model/item/MediaItem");

/**
 * @constructor
 * @type {module:app/view/render/PlayableRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item idle media-item",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	
	/** @override */
	initialize: function (opts) {
		View.prototype.initialize.apply(this, arguments);
		if (this.model.attrs().hasOwnProperty("@classname")) {
			this.el.className += " " + this.model.attrs()["@classname"];
		}
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	// createChildren: function() {
	// 	this.el.innerHTML = this.template(this.model.toJSON());
	// 	
	// 	this.placeholder = this.el.querySelector(".placeholder");
	// 	this.content = this.el.querySelector(".content");
	// 	// this.image = this.content.querySelector("img.current");
	// },
	
	/** @return {this} */
	measure: function (sizing) {
		var sW, sH; // source dimensions
		var pcW, pcH; // measured values
		var cX, cY, cW, cH; // computed values
		var pA, sA;
		
		sizing || (sizing = this.el.querySelector(".sizing"));
		
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
			cW = sW;
			cH = sH;
		} else if ((pcW/pcH) < (sW/sH)) {
			cW = pcW;
			cH = Math.round((cW / sW) * sH);
		} else {
			cH = pcH;
			cW = Math.round((cH / sH) * sW);
		}
		
		this.contentX = cX;
		this.contentY = cY;
		this.contentWidth = cW;
		this.contentHeight = cH;
	},
	
	render: function () {
		/*
		var content = this.content || this.el.querySelector(".content");
		
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
},{
	whenSelectionIsContiguous: require("../promise/whenSelectTransitionEnds"),
	
	whenSelectTransitionEnds: require("../promise/whenSelectTransitionEnds"),
	
	whenDefaultImageLoads: require("../promise/whenDefaultImageLoads"), 
});
