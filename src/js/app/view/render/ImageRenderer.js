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
var loadImage = require("../../utils/net/loadImage");
//var loadImage = require("../../utils/net/loadImageDOM");

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
		this.createChildren();
		this.initializePromise();
		this.addSiblingListeners();
	},

	remove: function() {
		this.promise.destroy();
		this.$image.off("dragstart");
		return Backbone.View.prototype.remove.apply(this, arguments);
	},

	/* --------------------------- *
	 * children/layout
	 * --------------------------- */

	createChildren: function() {
		this.$el.html(this.template(this.model.toJSON()));
		//this.$el.addClass(this.model.get("f").replace(/\.\w+$/, ""));
		this.$placeholder = this.$(".placeholder");
		this.$image = this.$("img");
		this.placeholder = this.$placeholder[0];
		this.image = this.$image[0];

		this.$image.on("dragstart", function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
		});
	},

	/** @return {this} */
	render: function () {
		var sW, sH; // source dimensions
		var	pcW, pcH; // measured values
		var cX, cY, cW, cH; // computed values
		var pA, sA;

		var img = this.image;
		var p = this.placeholder;

		//p.removeAttribute("style"); // clear placeholder
		this.$placeholder.css({maxWidth: "", maxHeight: ""});

		cX = p.offsetLeft + p.clientLeft;
		cY = p.offsetTop + p.clientTop;

		pcW = p.clientWidth;
		pcH = p.clientHeight;
		sW = this.model.get("w");
		sH = this.model.get("h");

		// choose constraint direction by aspect ratio
		if ((pcW/pcH) < (sW/sH)) {
			cW = pcW;
			cH = Math.round((cW / sW) * sH);
		} else {
			cH = pcH;
			cW = Math.round((cH / sH) * sW);
		}

//		this.$image.attr({width: cW, height: cH});
		img.setAttribute("width", cW);
		img.setAttribute("height", cH);

//		this.$image.css({left: cX, top: cY});
		img.style.left = cX + "px";
		img.style.top = cY + "px";

//		this.$placeholder.css({maxWidth: cW + (poW - pcW), maxHeight: cH + (poH - pcH)});
//		this.$placeholder.css({maxWidth: cW, maxHeight: cH});
		p.style.maxWidth = img.offsetWidth + "px";
		p.style.maxHeight = img.offsetHeight + "px";

		return this;
	},

	/* --------------------------- *
	 * events/image loading
	 * --------------------------- */

	initializePromise: function() {
		var onLoad, onError, onProgress, doAlways;
		onLoad = function (url, source, ev) {
			//console.info("ImageRenderer.onLoad: " + this.model.get("f"), ev);
			this.$el.removeClass("pending").addClass("done");
			this.$placeholder.removeAttr("data-progress");
			//this.model.trigger("load:done");
		};
		onError = function (err, source, ev) {
			//console.error("ImageRenderer.onError: " + err.message, arguments);
			this.$el.removeClass("pending").addClass("error");
			this.$placeholder.removeAttr("data-progress");
			//this.model.trigger("load:error");
		};
		onProgress = function (progress, source, ev) {
			if (progress == "loadstart") {
				//console.debug("ImageRenderer.onProgress: " + this.model.get("f") + " loadstart");
				this.$el.removeClass("idle").addClass("pending");
				//this.model.trigger("load:start");
			} else {
				this.$placeholder.attr("data-progress", (progress * 100).toFixed(0));
				//this.model.trigger("load:progress", progress);
			}
		};
		onProgress = _.throttle(onProgress, 100, {leading: true, trailing: true});

		this.promise = loadImage(this.model.getImageUrl(), this.image, this);
		this.promise.then(onLoad, onError, onProgress);
	},

	addSiblingListeners: function () {
		var owner = this.model.collection;
		var m = owner.indexOf(this.model);
		var check = function (n) {
			// Check indices for contiguity
			return (m === n) || (m + 1 === n) || (m - 1 === n);
		};
		var onSelect = function(model) {
			if (check(owner.selectedIndex)) {
				this.stopListening(owner, "select:one select:none", onSelect);
				this.$el.on("webkittransitionend transitionend", this.fetchImage);
				_.delay(this.fetchImage, Globals.TRANSITION_DELAY * 3);
			}
		};

		if (check(owner.selectedIndex)) {
			this.fetchImage();
		} else {
			this.listenTo(owner, "select:one select:none", onSelect);
		}
	},

	fetchImage: function(ev) {
		if (ev instanceof window.Event) {
			if ((ev.originalEvent || ev).propertyName !== "transform") {
				return;
			}
		}
		this.$el.off("webkittransitionend transitionend", this.fetchImage);
		this.promise.request();
	},
});
