/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("app/control/Globals");
/** @type {module:app/model/item/MediaItem} */
var MediaItem = require("app/model/item/MediaItem");

/** @type {module:app/view/MediaRenderer} */
var MediaRenderer = require("./MediaRenderer");
/** @type {module:app/view/base/ViewError} */
var ViewError = require("app/view/base/ViewError");

// /** @type {module:app/view/promise/whenSelectTransitionEnds} */
// var whenSelectTransitionEnds = require("app/view/promise/whenSelectTransitionEnds");
// /** @type {module:app/view/promise/whenSelectionIsContiguous} */
// var whenSelectionIsContiguous = require("app/view/promise/whenSelectionIsContiguous");
// /** @type {module:app/view/promise/whenDefaultImageLoads} */
// var whenDefaultImageLoads = require("app/view/promise/whenDefaultImageLoads");

/** @type {Function} */
var viewTemplate = require("./ImageRenderer.hbs");

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
		// this.initializeAsync();
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
		
		var sizing = this.getSizingEl();
		sizing.style.maxWidth = this.metrics.content.width + "px";
		sizing.style.maxHeight = this.metrics.content.height + "px";
		
		return this;
	},
	
	/* --------------------------- *
	/* initializeAsync
	/* --------------------------- */
	
	initializeAsync: function() {
		return MediaRenderer.prototype.initializeAsync.apply(this, arguments)
		// return MediaRenderer.whenSelectionIsContiguous(this)
		// // return Promise.resolve(this)
		// // 	.then(MediaRenderer.whenSelectionIsContiguous)
		// 	.then(MediaRenderer.whenSelectTransitionEnds)
		// 	.then(MediaRenderer.whenDefaultImageLoads)
			// .then(
			// 	function(view) {
			// 		view.setState("done");
			// 	})
			// .catch(
			// 	function(err) {
			// 		if (err instanceof ViewError) {
			// 			// NOTE: ignore ViewError type
			// 			// console.log(err.view.cid, err.view.model.cid, "ImageRenderer: " + err.message);
			// 		} else {
			// 			console.error(this.cid, err.name, err);
			// 			this.placeholder.innerHTML = "<p class=\"color-fg\" style=\"position:absolute;bottom:0;padding:3rem;\"><strong>" + err.name + "</strong> " + err.message + "</p>";
			// 			this.setState("error");
			// 		}
			// 	}.bind(this))
			;
	},
});
