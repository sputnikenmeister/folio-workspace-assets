/**
 * @module app/app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../../model/item/ImageItem");

/** @type {Function} */
// var viewTemplate = require( "../template/ImageRenderer.tpl" );
/** @type {Function} */
var placeholderTemplate = require("../template/ImageRenderer.Placeholder.tpl");
/** @type {Function} */
var imageSrcTemplate = _.template(window.approot + "/workspace/uploads/<%= filename %>");
// var imageSrcTemplate = _.template(window.approot + "/image/1/<%= constraint %>/0/uploads/<%= filename %>");
/** @type {Function} */
var longdescTemplate = _.template("i<%= id %>-caption");

/** @type {module:app/helper/Styles} */
var Styles = require("../../helper/Styles");

/* --------------------------
 * Static Private
 * -------------------------- */

/** @return {Number} */
var getConstraint = (function() {
	var c;
	return function() {
		return c || (c = Number(Styles.getCSSProperty(".image-item img", "width").replace(/px$/, ""))) || 700;
	};
})();

/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */
module.exports = Backbone.View.extend({

	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "image-item pending",
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @override */
	events: {
		"dragstart img": function (ev) {
			ev.preventDefault();
		} /* prevent conflict with hammer.js */
	},

	/** @param {Object} @return {string} */
	template: placeholderTemplate,

	/** @override */
	initialize: function (opts) {
		_.bindAll(this, "onError", "onLoad", "onProgress", "requestImageLoad");
		this.requestImageLoad = _.once(this.requestImageLoad);
		this.listenToSelection();
	},

	/** @public */
	requestImageLoad: function () {
		this.stopListeningToSelection();
		this.startImageLoad();
	},

	listenToSelection: function () {
		var sibling;
		if (sibling = this.model.nextNoLoop()) this.listenTo(sibling, "selected", this.requestImageLoad);
		if (sibling = this.model.prevNoLoop()) this.listenTo(sibling, "selected", this.requestImageLoad);
		this.listenTo(this.model, "selected", this.requestImageLoad);
	},
	stopListeningToSelection: function () {
		var sibling;
		if (sibling = this.model.nextNoLoop()) this.stopListening(sibling, "selected", this.requestImageLoad);
		if (sibling = this.model.prevNoLoop()) this.stopListening(sibling, "selected", this.requestImageLoad);
		this.stopListening(this.model, "selected", this.requestImageLoad);
	},

	/** @return {this} */
	render: function () {
		this.$el.css({
			minHeight: this.getConstrainedHeight(),
			minWidth: this.getConstrainedWidth(),
		});

		this.$el.html(this.template({
			filename: this.model.get("f"),
			width: this.getConstrainedWidth(),
			height: this.getConstrainedHeight(),
		}));

		if (this.model.selected) {
			this.requestImageLoad();
		}

		return this;
	},

	/** @return {String} */
	getImageSrc: function () {
		return this.imageSrc || (this.imageSrc = imageSrcTemplate({
			constraint: getConstraint(),
			filename: this.model.get("f"),
		}));
	},

	/** @return {String} */
	getLongDesc: function () {
		return this.longdesc || (this.longdesc = longdescTemplate(this.model));
	},

	/** @return {String} */
	getImageAlt: function () {
		return this.imageAlt || (this.imageAlt = this.model.get("desc").replace(/<[^>]+>/g, ""));
	},

	/** @type {Number} */
	constrainedWidth: NaN,
	/** @return {Number} */
	getConstrainedWidth: function () {
		return this.constrainedWidth || (this.constrainedWidth = getConstraint());
	},

	/** @type {Number} */
	constrainedHeight: NaN,
	/** @return {Number} */
	getConstrainedHeight: function () {
		return this.constrainedHeight || (this.constrainedHeight =
			Math.floor((getConstraint() / this.model.get("w")) * this.model.get("h")));
	},

	/** @return {HTMLImageElement} */
	createImageElement: function () {
		// Create a new image object
		var image = document.createElement("img");
		image.width = this.getConstrainedWidth();
		image.height = this.getConstrainedHeight();
		image.longDesc = this.getLongDesc();
		image.alt = this.getImageAlt();
		return image;
	},

	/* --------------------------
	 * image loading
	 * -------------------------- */

	startImageLoad: function () {
		var image = this.createImageElement();
		this.$el.append(image);

		this.loadImage(image, this.getImageSrc())
			.then(this.onLoad, this.onError, this.onProgress);
	},

	onLoad: function (image, ev) {
		this.$el.removeClass("loading").addClass("loaded");
		// console.log("ImageRenderer.onLoad: " + this.model.get("f"));
	},

	onError: function (image, err, ev) {
		this.$el.removeClass("loading").addClass("error");
		// console.log("ImageRenderer.onError: " + this.model.get("f"));
	},

	onProgress: function (image) {
		this.$el.removeClass("pending").addClass("loading");
		// console.log("ImageRenderer.onProgress: " + this.model.get("f"));
	},

	loadImage: function (image, url) {
		var deferred = Backbone.$.Deferred();
		// var image = this.createImageElement();

		image.onload = function (ev) {
			deferred.resolve(image, ev);
			image.onload = image.onerror = image.onabort = null;
		};
		image.onerror = function (ev) {
			deferred.reject(image, Error("There was a network error."), ev);
			image.onload = image.onerror = image.onabort = null;
		};
		image.onabort = image.onerror;

		_.defer(function () {
			image.src = url;
			deferred.notify(image);
		});
		return deferred.promise();
	},

	/* --------------------------
	 * image load xhr
	 * -------------------------- */
	/*global XMLHttpRequest, Image, Promise, Blob */

	///*
	startImageLoad_xhr: function () {
		this.loadImage_xhr(this.getImageSrc()).then(this.onLoad_xhr, this.onError, this.onProgress_xhr);
		this.$el.addClass("loading");
	},

	onLoad_xhr: function (response) {
		// The first runs when the promise resolves, with the request.reponse
		// specified within the resolve() method.
		console.log("ImageRenderer.onLoad_xhr: " + this.model.get("f"), response);

		var image = this.createImageElement();
		image.src = window.URL.createObjectURL(new Blob([response]));

		this.$el.removeClass("loading").addClass("loaded");
		this.$el.prepend(image);
	},

	onProgress_xhr: function (request, ev) {
		// if (ev instanceof ProgressEvent) {}
		console.log("ImageRenderer.onProgress: " + this.model.get("f"), (ev.loaded / ev.total).toFixed(3));
	},

	// @see https://github.com/mdn/promises-test/blob/gh-pages/index.html
	loadImage_xhr: function (src) {
		var deferred = Backbone.$.Deferred();
		var request = new XMLHttpRequest();
		request.open("GET", src, true);
		request.responseType = "arraybuffer";

		// When the request loads, check whether it was successful
		request.onload = function (ev) {
			if (request.status == 200) {
				// If successful, resolve the promise by passing back the request response
				console.log("- ImageRenderer loadImage_xhr.onload:" + request.statusText, arguments);
				deferred.resolve(request.response);
			} else {
				// If it fails, reject the promise with a error message
				deferred.reject(Error("Image didn\'t load successfully; error code:" + request.statusText));
			}
		};
		request.onerror = function (ev) {
			// Also deal with the case when the entire request fails to begin with
			// This is probably a network error, so reject the promise with an appropriate message
			deferred.reject(Error("There was a network error."), ev);
		};
		request.onabort = request.ontimeout = request.onerror;
		request.onprogress = function (ev) {
			deferred.notify(request, ev);
		};
		request.onloadstart = request.onloadend = request.onprogress;

		_.defer(_.bind(request.send, request));
		return deferred.promise();
	},
	//*/
});
