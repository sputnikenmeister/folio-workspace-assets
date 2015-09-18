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
	cidPrefix: "image-renderer-",
	/** @type {string} */
	className: MediaRenderer.prototype.className + " image-renderer",
	/** @type {Function} */
	template: viewTemplate,
	
	/** @override */
	initialize: function (opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		// this.createChildren();
		this.initializeAsync();
	},
	
	/* --------------------------- *
	/* children/layout
	/* --------------------------- */
	
	/** @override */
	createChildren: function() {
		this.el.innerHTML = this.template(this.model.toJSON());
		this.placeholder = this.el.querySelector(".placeholder");
	},
	
	/** @override */
	render: function () {
		this.measure();
		
		var img = this.getDefaultImage();
		img.setAttribute("width", this.metrics.media.width);
		img.setAttribute("height", this.metrics.media.height);
		
		var content = this.getContentEl();
		content.style.left = this.metrics.content.x + "px";
		content.style.top = this.metrics.content.y + "px";
		
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
