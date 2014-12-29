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
		this._loadImage = _.once(_.bind(this._loadImage, this));
		this.createChildren();
		this.addModelListeners();
	},

	createChildren: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.$placeholder = this.$(".placeholder");
		this.placeholder = this.$placeholder[0];
		this.$image = this.$("img");
		this.image = this.$image[0];
	},

	/** @return {this} */
	render: function () {
		var w = this.$placeholder.innerWidth();
		var h = Math.floor((w / this.model.get("w")) * this.model.get("h"));

		this.$image.attr({width: w+2, height: h+2}).css(this.$placeholder.position());
		//this.$placeholder.css("height", h - 2);
		this.$el.css("height", h);

		return this;
	},

	addModelListeners: function () {
		var owner = this.model.collection;
		var m = owner.indexOf(this.model);
		var check = function (n) {
			// Check indices for contiguity
			return (m === n) || (m + 1 === n) || (m - 1 === n);
		};

		if (check(owner.selectedIndex)) {
			this.$el.addClass("candidate");
			this._loadImage();
		}
		this.listenTo(owner, "select:one select:none", function(model) {
			if (check(owner.selectedIndex)) {
				this.$el.addClass("candidate");
				this._loadImage();
			} else {
				this.$el.removeClass("candidate");
			}
		});

		if (this.model.selected) {
			this.$el.addClass("selected");
		}
		this.listenTo(this.model, {
			"selected": function () {
				this.$el.addClass("selected");
			},
			"deselected": function () {
				this.$el.removeClass("selected");
			}
		});
	},

	_loadImage: function() {
		this.$el.removeClass("idle").addClass("pending");
		loadImage(this.$image[0], this.model.getImageUrl(), this).then(
			function (url, source, ev) {
				this.$el.removeClass("pending").addClass("done");
				console.info("ImageRenderer.onLoad: " + this.model.get("f"), ev);
			},
			function (err, source, ev) {
				this.$el.removeClass("pending").addClass("error");
				console.error("ImageRenderer.onError: " + err.message, arguments);
			}//, function (progress, source, ev) {}
		);
	},

	//loadImage: function () {
	//	this.$el.removeClass("idle").addClass("pending");
	//	loadImage(this.$image[0], this.model.getImageUrl(), this).then(this.onLoad, this.onError);//, this.onProgress);
	//	//loadImageXHR(this.model.getImageUrl(), this).then(this.onLoad_xhr, this.onError, this.onProgress);
	//},
	//
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
