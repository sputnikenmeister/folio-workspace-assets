/**
 * @module app/view/render/ImageRenderer
 */

/** @type {module:underscore} */
var _ = require("underscore");
/** @type {module:backbone} */
var Backbone = require("backbone");

/** @type {module:app/control/Globals} */
var Globals = require("../../control/Globals");
/** @type {module:app/model/item/ImageItem} */
var ImageItem = require("../../model/item/ImageItem");
/** @type {module:app/view/base/View} */
var View = require("../base/View");

/** @type {module:app/utils/event/addTransitionEndCommand} */
//var addTransitionCallback = require("../../utils/event/addTransitionCallback");
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
		this.createChildren();

		if (this.model.has("prefetched")) {
			// console.log("ImageRenderer.initialize: using prefetched " + this.model.get("prefetched"));
			this.image.src = this.model.get("prefetched");
			this.$el.removeClass("idle").addClass("done");
		} else {
			// this.initializePromise();
			this.addSiblingListeners();
		}
	},

	remove: function() {
		// this.promise.destroy();
		this.$image.off("dragstart");
		return View.prototype.remove.apply(this, arguments);
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

		// this.$image.attr({width: cW, height: cH});
		img.setAttribute("width", cW);
		img.setAttribute("height", cH);

		// this.$image.css({left: cX, top: cY});
		img.style.left = cX + "px";
		img.style.top = cY + "px";

		// this.$placeholder.css({maxWidth: cW + (poW - pcW), maxHeight: cH + (poH - pcH)});
		// this.$placeholder.css({maxWidth: cW, maxHeight: cH});
		p.style.maxWidth = img.offsetWidth + "px";
		p.style.maxHeight = img.offsetHeight + "px";

		return this;
	},

	/* --------------------------- *
	 * events/image loading
	 * --------------------------- */

	createImagePromise: function() {
		var onLoad, onError, onProgress, doAlways, promise;

		onProgress = function (progress, source, ev) {
			if (progress == "loadstart") {
				//console.debug("ImageRenderer.onProgress_loadstart: " + this.model.get("f"));
				this.$el.removeClass("idle").addClass("pending");
				//this.model.trigger("load:start");
			} else {
				this.$placeholder.attr("data-progress", (progress * 100).toFixed(0));
				//this.model.trigger("load:progress", progress);
			}
		};
		onProgress = _.throttle(onProgress, 100, {leading: true, trailing: true});
		onError = function (err, source, ev) {
			console.error("ImageRenderer.onError: " + err.message, arguments);
			this.$el.removeClass("pending").addClass("error");
			//this.model.trigger("load:error");
		};
		onLoad = function (url, source, ev) {
			//console.debug("ImageRenderer.onLoad: " + this.model.get("f"));
			this.model.set({"prefetched": url});
			this.$el.removeClass("pending").addClass("done");
			//this.model.trigger("load:done");
		};
		doAlways = function() {
			this.$placeholder.removeAttr("data-progress");
			this.off("view:remove", promise.destroy);
		};

		promise = loadImage(this.model.getImageUrl(), this.image, this);
		promise.then(onLoad, onError, onProgress).always(doAlways);
		this.on("view:remove", promise.destroy);

		return promise;
	},

	addSiblingListeners: function () {
		var owner = this.model.collection;
		var m = owner.indexOf(this.model);
		var check = function (n) {
			// Check indices for contiguity
			return (m === n) || (m + 1 === n) || (m - 1 === n);
		};
		var transitionCallback, transitionProp, transitionCancellable;
		var handleRemove, handleSelect;

		transitionProp = this.getPrefixedStyle("transform");
		transitionCallback = function(exec) {
			this.off("view:remove", handleRemove);
			exec && this.createImagePromise().request();
		};
		handleRemove = function() {
			transitionCancellable(false);
		};
		handleSelect = function(model) {
			if (check(owner.selectedIndex)) {
				this.stopListening(owner, "select:one select:none", handleSelect);
				this.on("view:remove", handleRemove);

				transitionCancellable = this.onTransitionEnd(this.el, transitionProp, transitionCallback, Globals.TRANSITION_DELAY * 2);
				// transitionCancellable = addTransitionCallback(transitionProp, transitionCallback, this.el, this, Globals.TRANSITION_DELAY * 2);
			}
		};
		if (check(owner.selectedIndex)) {
			this.createImagePromise().request();
		} else {
			this.listenTo(owner, "select:one select:none", handleSelect);
		}
	},
});
