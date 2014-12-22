/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../../model/item/ImageItem");

/** @type {module:app/utils/Styles} */
var Styles = require("../../utils/Styles");
/** @type {module:app/utils/strings/stripTags} */
var stripTags = require("../../utils/strings/stripTags");
/** @type {module:app/utils/net/loadImage} */
var loadImage = require("../../utils/net/loadImage");
/** @type {module:app/utils/net/loadImageXHR} */
var loadImageXHR = require("../../utils/net/loadImageXHR");

/** @type {Function} */
 var viewTemplate = require( "../template/ImageRenderer.tpl" );

/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */
module.exports = Backbone.View.extend({

	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item image-item idle",
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @param {Object} @return {string} */
	template: viewTemplate,

	/** @override */
	events: {
		"dragstart img": function (ev) {
			ev.preventDefault();
		} /* prevent conflict with hammer.js */
	},

	/** @override */
	initialize: function (opts) {
		this.checkForSelection = _.once(_.bind(this.checkForSelection, this));
//		this.requestImageLoad = _.once(_.bind(this.requestImageLoad, this));
		this.createChildren();
	},

	createChildren: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.$placeholder = this.$(".placeholder");
		this.$image = this.$("img");
	},

	/** @return {this} */
	render: function () {
		var w = this.$placeholder.innerWidth() + 2;
		var h = Math.floor((w / this.model.get("w")) * this.model.get("h"));

		this.$image.attr({width: w, height: h}).css(this.$placeholder.position());
//		this.$placeholder.css("height", h - 2);
		this.$el.css("height", h);

		this.checkForSelection();
		return this;
	},

	/* --------------------------
	 * Selection listeners
	 * -------------------------- */
	checkForSelection: function () {
		var owner = this.model.collection;
		var check = function () {
			var modelIndex = owner.indexOf(this.model);
			var selectedIndex = owner.selectedIndex;
			if ((modelIndex === selectedIndex) || (modelIndex + 1 === selectedIndex) || (modelIndex - 1 === selectedIndex)) {
				this.stopListening(owner, "select:one select:none");
				_.defer(_.bind(this.startImageLoad, this));
			}
		};
		this.listenTo(owner, "select:one select:none", check);
		check.apply(this);
	},

//	checkForSelection_old: function () {
//		var modelIndex = this.model.collection.indexOf(this.model);
//		var selectedIndex = this.model.collection.selectedIndex;
//		if ((modelIndex === selectedIndex) || (modelIndex + 1 === selectedIndex) || (modelIndex - 1 === selectedIndex)) {
//			this.requestImageLoad();
//		} else {
//			this.listenToSelection();
//		}
//	},
//
//	listenToSelection: function () {
//		var sibling, owner = this.model.collection;
//		if (sibling = owner.following(this.model)) this.listenTo(sibling, "selected", this.requestImageLoad);
//		if (sibling = owner.preceding(this.model)) this.listenTo(sibling, "selected", this.requestImageLoad);
//		this.listenTo(this.model, "selected", this.requestImageLoad);
//	},
//
//	requestImageLoad: function () {
//		this.stopListeningToSelection();
//		_.defer(_.bind(this.startImageLoad, this));
//	},
//
//	stopListeningToSelection: function () {
//		var sibling, owner = this.model.collection;
//		if (sibling = owner.following(this.model)) this.stopListening(sibling, "selected", this.requestImageLoad);
//		if (sibling = owner.preceding(this.model)) this.stopListening(sibling, "selected", this.requestImageLoad);
//		this.stopListening(this.model, "selected", this.requestImageLoad);
//	},

	/* --------------------------
	 * image loading
	 * -------------------------- */

	startImageLoad: function () {
		this.$el.removeClass("idle").addClass("pending");
		loadImage(this.$image[0], this.model.getImageUrl(), this).then(this.onLoad, this.onError);//, this.onProgress);
		//loadImageXHR(this.model.getImageUrl(), this).then(this.onLoad_xhr, this.onError, this.onProgress);
	},

	onLoad: function (url, source, ev) {
		this.$el.removeClass("pending").addClass("done");
		console.info("ImageRenderer.onLoad: " + this.model.get("f"), ev);
	},

	onError: function (err, source, ev) {
		this.$el.removeClass("pending").addClass("error");
		console.error("ImageRenderer.onError: " + err.message, arguments);
	},

	//onProgress: function (progress, source, ev) {
	//	console.info("ImageRenderer.onProgress: " + this.model.get("f"), (progress).toFixed(3));
	//},
	//
	//onLoad_xhr: function (url, request, ev) {
	//	this.$image[0].src = url;
	//	this.$el.removeClass("pending").addClass("done");
	//	console.info("ImageRenderer.onLoad_xhr: " + this.model.get("f"), request.response);
	//},
});
