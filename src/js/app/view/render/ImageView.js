/**
 * @module app/app/view/render/ImageView
 * @requires module:backbone
 */

/** @type {module:underscore} */
var _ = require( "underscore" );
/** @type {module:backbone} */
var Backbone = require( "backbone" );

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require( "../../model/item/ImageItem" );

/** @type {string} */
var viewTemplate = require( "../template/ImageView.tpl" );
/** @type {string} */
var placeholderTemplate = require( "../template/ImageView.Placeholder.tpl" );
/** @type {string} */
var captionTemplate = require( "../template/ImageView.Caption.tpl" );

// var templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

/**
 * @constructor
 * @type {module:app/view/render/ImageView}
 */
module.exports = Backbone.View.extend({

	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "image-item",
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @override */
	events: {
		"dragstart img": function(ev) { ev.preventDefault(); } /* prevent conflict with hammer.js */
	},

	/** @param {Object} @return {string} */
	template: viewTemplate,
	/** @param {Object} @return {string} */
	placeholderTemplate: placeholderTemplate,

	/** @override */
	initialize: function(opts) {
		_.bindAll(this, "onError", "onLoad");
		this.startImageLoad = _.once(this.startImageLoad);
	},

	/** @return {this} */
	render: function() {
		var tpldata = {
			src: 		this.getImageSrc(),
			width: 		this.getConstrainedWidth(),
			height: 	this.getConstrainedHeight(),
			longdesc: 	this.getLongDesc(),
			alt: 		this.getImageAlt(),
			desc: 		this.model.get("desc"),
			filename: 	this.model.get("f"),
		};

		this.$el.html(this.placeholderTemplate(tpldata));
		// this.$el.html(this.template(tpldata));
		// this.startImageLoad();

		return this;
	},

	/** @type {Number} */
	constraint: 660,
	/** @type {Function} */
	imageSrcTemplate: _.template("<%= approot %>/image/1/<%= constraint %>/0/uploads/<%= filename %>"),
	/** @return {String} */
	getImageSrc: function() {
		// original file: "{approot}/workspace/uploads/{filename}"
		// named recipe: "{approot}/image/{recipe-name}/uploads/{filename}"
		return this.imageSrc || (this.imageSrc = this.imageSrcTemplate({
			approot: this.model.collection.imageSrcRoot,
			constraint: this.constraint,
			filename: this.model.get("f"),
		}));
	},

	/** @type {Function} */
	longdescTemplate: _.template("i<%= id %>-caption"),
	/** @return {String} */
	getLongDesc: function() {
		return this.longdesc || (this.longdesc = this.longdescTemplate(this.model));
	},

	/** @return {String} */
	getImageAlt: function() {
		return this.imageAlt || (this.imageAlt = this.model.get("desc").replace(/<[^>]+>/g, ""));
	},

	/** @type {Number} */
	constrainedWidth: NaN,
	/** @return {Number} */
	getConstrainedWidth: function() {
		return this.constrainedWidth || (this.constrainedWidth = this.constraint);
	},

	/** @type {Number} */
	constrainedHeight: NaN,
	/** @return {Number} */
	getConstrainedHeight: function() {
		return this.constrainedHeight || (this.constrainedHeight = Math.floor((this.constraint / this.model.get("w")) * this.model.get("h")));
	},

	/** @return {HTMLImageElement} */
	createImageElement: function() {
		// Create a new image object
		// var image = document.createElement("img");
		// image.width = this.getConstrainedWidth();
		// image.height = this.getConstrainedHeight();
		/*global Image */
		var image = new Image(this.getConstrainedWidth(), this.getConstrainedHeight());
		image.longDesc = this.getLongDesc();
		image.alt = this.getImageAlt();
		return image;
	},

	/* --------------------------
	 * image loading
	 * -------------------------- */

	/** @public */
	startImageLoad:function(){
		var image = this.createImageElement();

		this.loadImage(image, this.getImageSrc())
			.then(this.onLoad, this.onError);

		this.$el.addClass("loading");
		this.$el.append(image);
	},

	onLoad: function(image, ev) {
		this.$el.removeClass("loading").addClass("loaded");
		console.log("ImageView.onLoad_basic: " + this.model.get("f"));
	},

	onError: function(err, ev) {
		this.$el.removeClass("loading").addClass("error");
		console.log("ImageView.onError: " + this.model.get("f"));
	},

	loadImage: function(image, url) {
		var deferred = Backbone.$.Deferred();
		// var image = this.createImageElement();

		image.onload = function(ev) {
			deferred.resolve(image, ev);
			image.onload = image.onerror = image.onabort = null;
		};
		image.onerror = function(ev) {
			deferred.reject(Error("There was a network error."), ev);
			image.onload = image.onerror = image.onabort = null;
		};
		image.onabort = image.onerror;

		_.defer(function() { image.src = url; });
		return deferred.promise();
	},

	/* --------------------------
	 * image load xhr
	 * -------------------------- */
	/*global XMLHttpRequest, Image, Promise, Blob */

	/*
	startImageLoad:function(){
		this.loadImage_xhr(this.getImageSrc()).then(this.onLoad_xhr, this.onError, this.onProgress_xhr);
		this.$el.addClass("loading");
	},

	onLoad_xhr: function(response) {
		// The first runs when the promise resolves, with the request.reponse
		// specified within the resolve() method.
		console.log("ImageView.onLoad_xhr: " + this.model.get("f"), response);

		var image = this.createImageElement();
		image.src = window.URL.createObjectURL(new Blob([response]));

		this.$el.removeClass("loading").addClass("loaded");
		this.$el.prepend(image);
	},

	onProgress: function(request, ev) {
		// if (ev instanceof ProgressEvent) {}
		console.log("ImageView.onProgress: " + this.model.get("f"), (ev.loaded / ev.total).toFixed(3));
	},

	// @see https://github.com/mdn/promises-test/blob/gh-pages/index.html
	loadImage_xhr: function(src) {
		var deferred = Backbone.$.Deferred();
		var request = new XMLHttpRequest();
		request.open("GET", src, true);
		request.responseType = "arraybuffer";

		// When the request loads, check whether it was successful
		request.onload = function(ev) {
			if (request.status == 200) {
				// If successful, resolve the promise by passing back the request response
				console.log("- ImageView loadImage_xhr.onload:" + request.statusText, arguments);
				deferred.resolve(request.response);
			} else {
				// If it fails, reject the promise with a error message
				deferred.reject(Error("Image didn\'t load successfully; error code:" + request.statusText));
			}
		};
		request.onerror = function(ev) {
			// Also deal with the case when the entire request fails to begin with
			// This is probably a network error, so reject the promise with an appropriate message
			deferred.reject(Error("There was a network error."), ev);
		};
		request.onabort = request.ontimeout = request.onerror;
		request.onprogress = function(ev) {
			deferred.notify(request, ev);
		};
		request.onloadstart = request.onloadend = request.onprogress;

		_.defer(_.bind(request.send, request));
		return deferred.promise();
	},
	*/
});



