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
	
	cidPrefix: "image-renderer-",
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
	},
	
	/** @return {this} */
	render: function () {
		var img, sizing, content;
		
		this.measure();
		
		img = this.getDefaultImage();
		img.setAttribute("width", this.contentWidth);
		img.setAttribute("height", this.contentHeight);
		
		content = this.getContentEl();
		content.style.left = this.contentX + "px";
		content.style.top = this.contentY + "px";
		
		sizing = this.placeholder;
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
						// console.log(err.view.cid, err.view.model.cid, "ImageRenderer: " + err.message);
					} else {
						console.error("ImageRenderer: " + err.name, err);
						throw err;
					}
				});
	},
});
