/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/helper/View} */
var View = require("../../helper/View");
/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../../model/item/ImageItem");
/** @type {module:app/utils/net/loadImage} */
//var loadImage = require("../../utils/net/loadImage");
var loadImage = require("../../utils/net/loadImageDOM");

/** @type {Function} */
var viewTemplate = require( "./ImageRenderer.tpl" );

/**
 * @constructor
 * @type {module:app/view/render/ImageRenderer}
 */
module.exports = View.extend({

	/** @type {string} */
	tagName: "div",
	/** @type {string} */
	className: "carousel-item image-item idle",
	/** @type {module:app/model/ImageItem} */
	model: ImageItem,
	/** @type {Function} */
	template: viewTemplate,

	/** @override */
	initialize: function (opts) {
		this.fetchImage = _.bind(_.once(this.fetchImage), this);
//		this.onProgress = _.throttle(this.onProgress, 100, {leading: true, trailing: false});
		this.createChildren();
		this.addSiblingListeners();
	},

	createChildren: function() {
		this.$el
//			.addClass(this.model.get("f").replace(/\.\w+$/, ""))
			.html(this.template(this.model.toJSON()));

		this.$placeholder = this.$(".placeholder");
		this.$image = this.$("img");

		this.placeholder = this.$placeholder[0];
		this.image = this.$image[0];

		this.$image.on("dragstart", function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
		});
	},

	remove: function() {
//		window.URL.revokeObjectURL(this.image.src);
		this.image.src = "";
		this.image.onload = this.image.onerror = this.image.onabort = void 0;
		this.$image.off("dragstart");
		return Backbone.View.prototype.remove.apply(this, arguments);
	},

	/** @return {this} */
	render: function () {
		// source dimensions
		var sW, sH;
		// measured values from .placeholder
		var poX, poY, poW, poH;
		var pcX, pcY, pcW, pcH;
		// computed values
		var cX, cY, cW, cH;
		var pA, sA;

		// clear placeholder
		this.$placeholder.css({maxWidth: "", maxHeight: ""});

		var p = this.placeholder;
//		var ps = window.getComputedStyle(p);

		poX = p.offsetLeft;
		poY = p.offsetTop;
		pcX = p.clientLeft;
		pcY = p.clientTop;

//		poW = p.offsetWidth;
//		poH = p.offsetHeight;
		pcW = p.clientWidth;
		pcH = p.clientHeight;

		// get source values
		sW = this.model.get("w");
		sH = this.model.get("h");

		// aspect ratios
		sA = sW/sH;
		pA = pcW/pcH;

		if (pA < sA) {
			cW = pcW;
//			cH = Math.round(pcW * sA);
			cH = Math.round((cW / sW) * sH);
		} else {
			cH = pcH;
//			cW = Math.round(pcH * (-1/sA));
			cW = Math.round((cH / sH) * sW);
		}

//		this.$placeholder.css({maxWidth: cW + (poW - pcW), maxHeight: cH + (poH - pcH)});
		this.$placeholder.css({maxWidth: cW, maxHeight: cH});
		this.$image.attr({width: cW, height: cH});

		cX = poX + pcX;
		cY = poY + pcY;

		this.$image.css({left: cX, top: cY});

		return this;
	},

	addSiblingListeners: function () {
		var owner = this.model.collection;
		var m = owner.indexOf(this.model);
		var check = function (n) {
			// Check indices for contiguity
			return (m === n) || (m + 1 === n) || (m - 1 === n);
		};

		if (check(owner.selectedIndex)) {
			this.fetchImage();
		} else {
			this.listenTo(owner, "select:one select:none", function(model) {
				if (check(owner.selectedIndex)) {
					this.stopListening(owner);
					this.$el.on("webkittransitionend transitionend", this.fetchImage);
					_.delay(this.fetchImage, Globals.TRANSITION_DELAY * 3);
				}
			});
		}
	},

	fetchImage: function(ev) {
		if (arguments[0] instanceof window.Event) {
			if ((ev.originalEvent || ev).propertyName !== "transform") {
				return;
			}
			this.$el.off("webkittransitionend transitionend", this.fetchImage);
		}
		loadImage(this.model.getImageUrl(), this.image, this)
			.then(this.onLoad, this.onError, this.onProgress);
	},

	onProgress: function (progress, source, ev) {
		if (progress == "loadstart") {// || ev.type == "loadstart") {
			//console.debug("ImageRenderer.onProgress: " + this.model.get("f") + " loadstart");
			//this.model.trigger("load:start");
			this.$el.removeClass("idle").addClass("pending");
		} else {
			var percent = (progress * 100).toFixed(0);
			this.$placeholder.attr("data-progress", percent);
			//this.model.trigger("load:progress", progress);
		}
	},

	onError: function (err, source, ev) {
		//console.error("ImageRenderer.onError: " + err.message, arguments);
		//this.model.trigger("load:error");
		this.$el.removeClass("pending").addClass("error");
		this.$placeholder.removeAttr("data-progress");
	},

	onLoad: function (url, source, ev) {
		//console.info("ImageRenderer.onLoad: " + this.model.get("f"), ev);
		//this.model.trigger("load:done");
		this.$el.removeClass("pending").addClass("done");
		this.$placeholder.removeAttr("data-progress");
	},
});
