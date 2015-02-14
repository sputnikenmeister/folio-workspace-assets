/**
 * @module app/view/render/ImageRenderer
 */
/*global Event, XMLHttpRequest, Blob */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
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
	/** @type {Function} */
	template: viewTemplate,

	/** @override */
	initialize: function (opts) {
		this._loadImage = _.once(_.bind(this._loadImage, this));
		this.createChildren();
		this.addSiblingListeners();
	},

	createChildren: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.$placeholder = this.$(".placeholder");
		this.placeholder = this.$placeholder[0];
		this.$image = this.$("img");
		this.image = this.$image[0];
		this.$image.on("dragstart", function (ev) {
			ev.isDefaultPrevented() || ev.preventDefault();
		});
	},

	remove: function() {
		window.URL.revokeObjectURL(this.image.src);
		this.image.src = "";
		this.image.onload = this.image.onerror = this.image.onabort = void 0;
		this.$image.off("dragstart");
		return Backbone.View.prototype.remove.apply(this, arguments);
	},

	/** @return {this} */
	render: function () {
		var w = this.$placeholder.outerWidth();
		var h = Math.round((w / this.model.get("w")) * this.model.get("h"));

		this.$image.attr({width: w, height: h}).css(this.$placeholder.position());
		this.$el.css("height", h);
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
			this._loadImage();
		} else {
			this.listenTo(owner, "select:one select:none", function(model) {
				if (check(owner.selectedIndex)) {
					this.stopListening(owner);
					_.delay(this._loadImage, Globals.TRANSITION_DELAY * 3);
					this.$el.on("webkittransitionend transitionend", this._loadImage);
				}
			});
		}
	},

	_loadImage: function(ev) {
		if (arguments[0] instanceof Event) {
			if (ev.propertyName != "transform") {
				return;
			}
			this.$el.off("webkittransitionend transitionend");
		}
		if (window.Blob) {
			loadImageXHR(this.model.getImageUrl(), this)
				.then(this.onLoad_xhr, this.onError, this.onProgress);
		} else {
			loadImage(this.image, this.model.getImageUrl(), this)
				.then(this.onLoad, this.onError, this.onProgress);
		}
	},

	onLoad: function (source, url, ev) {
		console.info("ImageRenderer.onLoad: " + this.model.get("f"), ev);
		//this.model.trigger("load:done");
		this.$el.removeClass("pending").addClass("done");
	},

	onLoad_xhr: function (source, url, ev) {
		console.info("ImageRenderer.onLoad_xhr: " + this.model.get("f"), url);
		//this.model.trigger("load:done");
//		this.image.src = window.URL.createObjectURL(response);
		this.image.src = url;
//		this.$el.delay(1).removeClass("pending").addClass("done");
		_.defer(_.bind(function() {
//			this.$image.attr("src", window.URL.createObjectURL(response));
			this.$el.removeClass("pending").addClass("done");
			this.$placeholder.empty();
		}, this));
	},

	onError: function (source, err, ev) {
		console.error("ImageRenderer.onError: " + err.message, arguments);
		//this.model.trigger("load:error");
		this.$el.removeClass("pending").addClass("error");
		this.$placeholder.html("<span class=\"progress\">Error</span>");
	},

	onProgress: function (source, progress, ev) {
//		console.log("ImageRenderer.onProgress: " + this.model.get("f"), arguments);
//		this.$el.removeClass("idle").addClass("pending");
		if (progress == "start" || ev.type == "loadstart") {
			console.info("ImageRenderer.onProgress: " + this.model.get("f") + " Start");
			//this.model.trigger("load:start");
			this.$el.removeClass("idle").addClass("pending");
			this.$placeholder.html("<span class=\"progress\">Loading</span>");
		} else {
			console.info("ImageRenderer.onProgress: " + this.model.get("f"), (progress).toFixed(3));
			this.$placeholder.html("<span class=\"progress num\">" + (progress * 100).toFixed(0) + "%</span>");
			//this.model.trigger("load:progress", progress);
		}
	}
});
