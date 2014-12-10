/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");
var Deferred = Backbone.$.Deferred;

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../../model/item/ImageItem");

/** @type {Function} */
var placeholderTemplate = require("../template/ImageRenderer.Placeholder.tpl");
/** @type {Function} */
// var viewTemplate = require( "../template/ImageRenderer.tpl" );

/** @type {Function} */
var longdescTemplate = _.template("i<%= id %>-caption");
/** @type {Function} */
var imageSrcTemplate = _.template(window.approot + "workspace/uploads/<%= filename %>");
// var imageSrcTemplate = _.template(window.approot + "image/1/<%= constraint %>/0/uploads/<%= filename %>");

/** @type {module:app/utils/Styles} */
var Styles = require("../../utils/Styles");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("../../utils/strings/stripTags");
/** @type {module:app/utils/strings/stripTags} */
var loadImageXHR = require("../../utils/fn/loadImageXHR");

/* --------------------------
 * Static Private
 * -------------------------- */

/** @return {Number} */
var getConstraint = (function () {
	var c;
	return function () {
		return c || (c = Number(Styles.getCSSProperty(".image-item img", "width").replace(/px$/, ""))); // || 700;
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
	className: "image-item idle",
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @param {Object} @return {string} */
	template: placeholderTemplate,

	/** @override */
	events: {
		"dragstart img": function (ev) {
			ev.preventDefault();
		} /* prevent conflict with hammer.js */
	},

	/** @override */
	initialize: function (opts) {
		_.bindAll(this, "onError", "onLoad", "onProgress", "requestImageLoad");
		this.requestImageLoad = _.once(this.requestImageLoad);
	},

	checkForSelection: function () {
		var owner = this.model.collection;
		if (this.model.selected || (owner.selected &&
				(owner.following(this.model) === owner.selected || owner.preceding(this.model) === owner.selected ))) {
			this.requestImageLoad();
		} else {
			this.listenToSelection();
		}
	},

	/** @public */
	requestImageLoad: function () {
		this.stopListeningToSelection();
		this.startImageLoad();
	},

	listenToSelection: function () {
		var sibling, owner = this.model.collection;
		if (sibling = owner.following(this.model)) this.listenTo(sibling, "selected", this.requestImageLoad);
		if (sibling = owner.preceding(this.model)) this.listenTo(sibling, "selected", this.requestImageLoad);
		this.listenTo(this.model, "selected", this.requestImageLoad);
	},
	stopListeningToSelection: function () {
		var sibling, owner = this.model.collection;
		if (sibling = owner.following(this.model)) this.stopListening(sibling, "selected", this.requestImageLoad);
		if (sibling = owner.preceding(this.model)) this.stopListening(sibling, "selected", this.requestImageLoad);
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
		this.checkForSelection();
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
		return this.imageAlt || (this.imageAlt = stripTags(this.model.get("desc")));
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
		image.alt = this.model.get("text");
		return image;
	},

	/* --------------------------
	 * image loading
	 * -------------------------- */

	startImageLoad: function () {
		this.$el.removeClass("idle").addClass("pending");
		var image = this.createImageElement();
		this.$el.append(image);
		this.loadImage(image, this.getImageSrc()).then(this.onLoad, this.onError, this.onProgress);
	},

	onLoad: function (url, source, ev) {
		this.$el.removeClass("pending").addClass("done");
		console.info("ImageRenderer.onLoad: " + url);
	},

	onProgress: function (progress, source, ev) {
//		console.log("ImageRenderer.onProgress: " + this.model.get("f"), (progress).toFixed(3));
	},

	onError: function (err, source, ev) {
		this.$el.removeClass("pending").addClass("error");
		console.warn("ImageRenderer.onError: " + String(err), arguments);
	},


	loadImage: function (image, url) {
		var deferred = new Deferred();
		image.onload = function (ev) {
			deferred.resolve(url, image, ev);
			image.onload = image.onerror = image.onabort = null;
		};
		image.onerror = function (ev) {
			deferred.reject(Error("There was a network error."), image, ev);
		};
		image.onabort = image.onerror;
		deferred.always(function () {
			image.onload = void 0;
			image.onerror = void 0;
			image.onabort = void 0;
		});
		_.defer(function () {
			image.src = url;
			deferred.notify(0, image, void 0); // mock notify
		});
		return deferred.promise();
	},

	/* --------------------------
	 * image load xhr
	 * -------------------------- */

	///*
	startImageLoad_xhr: function () {
		var promise = loadImageXHR(this.getImageSrc());
		promise.then(this.onLoad_xhr, this.onError, this.onProgress);
		this.$el.removeClass("idle").addClass("pending");
	},

	onLoad_xhr: function (url, request, ev) {
		var image = this.createImageElement();
		image.src = url;
		this.$el.append(image);
		this.$el.removeClass("pending").addClass("done");
		console.log("ImageRenderer.onLoad_xhr: " + this.model.get("f"), request.response);
	},

	//*/
});
