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

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("../base/ViewError");

// /** @type {module:app/view/promise/whenSelectTransitionEnds} */
// var whenSelectTransitionEnds = require("../promise/whenSelectTransitionEnds");
// /** @type {module:app/view/promise/whenSelectionIsContiguous} */
// var whenSelectionIsContiguous = require("../promise/whenSelectionIsContiguous");
// /** @type {module:app/view/promise/whenDefaultImageLoads} */
// var whenDefaultImageLoads = require("../promise/whenDefaultImageLoads");

/** @type {Function} */
var viewTemplate = require( "./ImageRenderer.hbs" );

/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */
module.exports = MediaRenderer.extend({
	
	/** @type {string} */
	className: MediaRenderer.prototype.className + " image-renderer",
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		this.createChildren();
		this.initializeAsync();
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		
		this.placeholder = this.el.querySelector(".placeholder");
		this.content = this.el.querySelector(".content");
		this.image = this.el.querySelector("img.default");
	},
	
	/** @return {this} */
	render: function () {
		var sW, sH; // source dimensions
		var pcW, pcH; // measured values
		var cX, cY, cW, cH; // computed values
		
		var content = this.content;
		var sizing = this.placeholder;
		
		sizing.style.width = "";
		sizing.style.height = "";
		
		// var o = _.pick(sizing, function(val) {
		// 	return /^(offset|client)/.test(val);
		// });
		
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
		
		this.contentWidth = cW;
		this.contentHeight = cH;
		
		this.image.setAttribute("width", cW);
		this.image.setAttribute("height", cH);
		
		content.style.left = cX + "px";
		content.style.top = cY + "px";
		// content.style.width = cW + "px";
		// content.style.height = cH + "px";
		
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
		
		// sizing.style.maxWidth = (cW + (poW - pcW)) + "px";
		// sizing.style.maxHeight = (cH + (poH - pcH)) + "px";
		// sizing.style.maxWidth = cW + "px";
		// sizing.style.maxHeight = cH + "px";
		sizing.style.width = content.offsetWidth + "px";
		sizing.style.height = content.offsetHeight + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		MediaRenderer.whenSelectionIsContiguous(this)
			.then(MediaRenderer.whenSelectTransitionEnds)
			.then(MediaRenderer.whenDefaultImageLoads)
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
