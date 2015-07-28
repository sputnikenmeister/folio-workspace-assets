/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("../../model/item/MediaItem");

/** @type {module:app/view/base/View} */
var View = require("../base/View");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");

/** @type {module:app/view/promise/whenSelectTransitionEnds} */
var whenSelectTransitionEnds = require("../promise/whenSelectTransitionEnds");
/** @type {module:app/view/promise/whenSelectionIsContiguous} */
var whenSelectionIsContiguous = require("../promise/whenSelectionIsContiguous");
/** @type {module:app/view/promise/whenDefaultImageLoads} */
var whenDefaultImageLoads = require("../promise/whenDefaultImageLoads");

/** @type {Function} */
var viewTemplate = require( "./ImageRenderer.tpl" );

/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */
module.exports = View.extend({
	
	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item media-item image-renderer idle",
	/** @type {module:app/model/MediaItem} */
	model: MediaItem,
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		this.createChildren();
		this.initializeAsync();
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.image = this.content = this.el.querySelector(".content");
	},
	
	/** @return {this} */
	render: function () {
		var sW, sH; // source dimensions
		var pcW, pcH; // measured values
		var cX, cY, cW, cH; // computed values
		var pA, sA;
		
		var img = this.content;
		var p = this.placeholder;
		
		// clear placeholder size
		p.style.maxWidth = "";
		p.style.maxHeight = "";
		
		cX = p.offsetLeft + p.clientLeft;
		cY = p.offsetTop + p.clientTop;
		pcW = p.clientWidth;
		pcH = p.clientHeight;
		
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

		// this.$content.attr({width: cW, height: cH});
		img.setAttribute("width", cW);
		img.setAttribute("height", cH);
		
		// this.$content.css({left: cX, top: cY});
		img.style.left = cX + "px";
		img.style.top = cY + "px";
		
		// this.$placeholder.css({maxWidth: cW + (poW - pcW), maxHeight: cH + (poH - pcH)});
		// this.$placeholder.css({maxWidth: cW, maxHeight: cH});
		// p.style.maxWidth = img.offsetWidth + "px";
		// p.style.maxHeight = img.offsetHeight + "px";
		p.style.maxWidth = cW + "px";
		p.style.maxHeight = cH + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		whenSelectionIsContiguous(this)
			.then(whenSelectTransitionEnds)
			.then(whenDefaultImageLoads)
			.catch(function(err) {
					if (err instanceof ViewError) {
						console.log(err.view.cid, err.view.model.cid, "ImageRenderer: " + err.message);
					} else {
						console.error("ImageRenderer: " + err.name, err);
						throw err;
					}
				});
	},
});
