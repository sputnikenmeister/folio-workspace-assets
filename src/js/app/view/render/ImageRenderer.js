/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:app/view/MediaRenderer} */
const MediaRenderer = require("./MediaRenderer");

/** @type {Function} */
const viewTemplate = require("./ImageRenderer.hbs");

/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */
var ImageRenderer = MediaRenderer.extend({

	/** @type {string} */
	cidPrefix: "imageRenderer",
	/** @type {string} */
	className: MediaRenderer.prototype.className + " image-item",
	/** @type {Function} */
	template: viewTemplate,

	/** @override */
	initialize: function(opts) {
		MediaRenderer.prototype.initialize.apply(this, arguments);
		// this.createChildren();
		// this.initializeAsync();
	},

	/* --------------------------- *
	/* children/layout
	/* --------------------------- */

	/** @override */
	createChildren: function() {
		MediaRenderer.prototype.createChildren.apply(this, arguments);
		// this.el.innerHTML = this.template(this.model.toJSON());
		this.placeholder = this.el.querySelector(".placeholder");
	},

	/** @override */
	render: function() {
		MediaRenderer.prototype.render.apply(this, arguments);

		// this.measure();

		var img = this.getDefaultImage();
		if (this.metrics.media.width) {
			img.setAttribute("width", this.metrics.media.width);
		}
		if (this.metrics.media.height) {
			img.setAttribute("height", this.metrics.media.height);
		}

		var content = this.getContentEl();
		content.style.left = this.metrics.content.x + "px";
		content.style.top = this.metrics.content.y + "px";

		// var sizing = this.getSizingEl();
		// sizing.style.maxWidth = this.metrics.content.width + "px";
		// sizing.style.maxHeight = this.metrics.content.height + "px";

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
		// 		view.mediaState = "ready";
		// 	})
		// .catch(
		// 	function(err) {
		// 		if (err instanceof ViewError) {
		// 			// NOTE: ignore ViewError type
		// 			// console.log(err.view.cid, err.view.model.cid, "ImageRenderer: " + err.message);
		// 		} else {
		// 			console.error(this.cid, err.name, err);
		// 			this.placeholder.innerHTML = "<p class=\"color-fg\" style=\"position:absolute;bottom:0;padding:3rem;\"><strong>" + err.name + "</strong> " + err.message + "</p>";
		// 			this.mediaState = "error";
		// 		}
		// 	}.bind(this))
		;
	},
});

module.exports = ImageRenderer;
